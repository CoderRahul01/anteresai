import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { LinkedInService } from '@/lib/services/linkedin.service';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { text } = await req.json();
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Post text is required' }, { status: 400 });
    }

    // Retrieve stored LinkedIn token
    const tokenDoc = await LinkedInService.getToken(userId);
    if (!tokenDoc) {
      return NextResponse.json(
        { error: 'LinkedIn not connected. Please connect your account first.' },
        { status: 403 }
      );
    }

    // Post to LinkedIn
    const result = await LinkedInService.createPost(
      tokenDoc.accessToken,
      tokenDoc.linkedinSub,
      text.trim()
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({ success: true, postId: result.postId });
  } catch (error: any) {
    console.error('LinkedIn Post Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — check if LinkedIn is connected
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const tokenDoc = await LinkedInService.getToken(userId);
    return NextResponse.json({
      connected: !!tokenDoc,
      name: tokenDoc?.linkedinName || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
