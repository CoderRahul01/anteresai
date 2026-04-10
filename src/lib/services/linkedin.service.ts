import clientPromise from '@/lib/db/mongodb';

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';
const LINKEDIN_POSTS_URL = 'https://api.linkedin.com/rest/posts';

const SCOPES = ['openid', 'profile', 'w_member_social'];

export class LinkedInService {
  /**
   * Generate the OAuth authorization URL that redirects the user to LinkedIn.
   */
  static getAuthorizationUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.LINKEDIN_CLIENT_ID || '',
      redirect_uri: redirectUri,
      state,
      scope: SCOPES.join(' '),
    });
    return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for an access token.
   */
  static async exchangeCodeForToken(
    code: string,
    redirectUri: string
  ): Promise<{ access_token: string; expires_in: number }> {
    const res = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`LinkedIn token exchange failed: ${error}`);
    }

    return res.json();
  }

  /**
   * Fetch the authenticated user's LinkedIn profile (sub = person URN ID).
   */
  static async getUserInfo(accessToken: string): Promise<{ sub: string; name: string; email: string }> {
    const res = await fetch(LINKEDIN_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch LinkedIn user info');
    }

    return res.json();
  }

  /**
   * Store LinkedIn credentials in MongoDB, linked to the Clerk userId.
   */
  static async storeToken(
    clerkUserId: string,
    accessToken: string,
    expiresIn: number,
    linkedinSub: string,
    linkedinName: string
  ) {
    const client = await clientPromise;
    const db = client.db('anteresAI');
    const collection = db.collection('linkedin_tokens');

    await collection.updateOne(
      { clerkUserId },
      {
        $set: {
          accessToken,
          linkedinSub,
          linkedinName,
          expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );
  }

  /**
   * Retrieve the stored LinkedIn token for a given Clerk user.
   */
  static async getToken(clerkUserId: string) {
    const client = await clientPromise;
    const db = client.db('anteresAI');
    const collection = db.collection('linkedin_tokens');

    const doc = await collection.findOne({ clerkUserId });
    if (!doc) return null;

    // Check if token is expired
    if (new Date(doc.expiresAt) < new Date()) {
      return null; // Token expired
    }

    return doc;
  }

  /**
   * Create a text post on LinkedIn using the Community Management API.
   */
  static async createPost(
    accessToken: string,
    linkedinSub: string,
    text: string
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    const authorUrn = `urn:li:person:${linkedinSub}`;

    const res = await fetch(LINKEDIN_POSTS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202401',
      },
      body: JSON.stringify({
        author: authorUrn,
        commentary: text,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('LinkedIn Post Error:', error);
      return { success: false, error };
    }

    const postId = res.headers.get('x-restli-id') || 'unknown';
    return { success: true, postId };
  }
}
