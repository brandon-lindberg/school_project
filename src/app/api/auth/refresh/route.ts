import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/options';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Force a new token to be generated
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log('[refresh] Current token:', JSON.stringify(token, null, 2));

    // The session will be automatically refreshed due to our jwt callback
    return NextResponse.json({
      success: true,
      session: session,
      token: token
    });
  } catch (error) {
    console.error('[refresh] Session refresh error:', error);
    return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 });
  }
}
