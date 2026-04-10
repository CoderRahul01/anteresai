import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { LinkedInService } from '@/lib/services/linkedin.service';
import crypto from 'crypto';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://anteres-ai.vercel.app';
    const redirectUri = `${baseUrl}/api/linkedin/callback`;
    
    // Generate a CSRF state token containing the userId
    const state = Buffer.from(JSON.stringify({
      userId,
      nonce: crypto.randomBytes(16).toString('hex'),
    })).toString('base64url');

    const authUrl = LinkedInService.getAuthorizationUrl(redirectUri, state);

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('LinkedIn Auth Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
