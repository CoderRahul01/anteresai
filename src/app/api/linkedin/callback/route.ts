import { NextRequest, NextResponse } from 'next/server';
import { LinkedInService } from '@/lib/services/linkedin.service';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const error = req.nextUrl.searchParams.get('error');

    if (error) {
      console.error('LinkedIn OAuth Error:', error);
      return NextResponse.redirect(new URL('/?linkedin=error', req.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/?linkedin=missing_params', req.url));
    }

    // Decode state to get userId
    let stateData: { userId: string; nonce: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      return NextResponse.redirect(new URL('/?linkedin=invalid_state', req.url));
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://anteres-ai.vercel.app';
    const redirectUri = `${baseUrl}/api/linkedin/callback`;

    // Exchange code for token
    const tokenData = await LinkedInService.exchangeCodeForToken(code, redirectUri);

    // Fetch LinkedIn profile
    const userInfo = await LinkedInService.getUserInfo(tokenData.access_token);

    // Store token in MongoDB linked to Clerk userId
    await LinkedInService.storeToken(
      stateData.userId,
      tokenData.access_token,
      tokenData.expires_in,
      userInfo.sub,
      userInfo.name
    );

    // Redirect back to dashboard with success
    return NextResponse.redirect(new URL('/?linkedin=connected', req.url));
  } catch (error: any) {
    console.error('LinkedIn Callback Error:', error);
    return NextResponse.redirect(new URL('/?linkedin=error', req.url));
  }
}
