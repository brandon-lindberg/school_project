import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the school ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const schoolId = parseInt(pathParts[3]); // /api/schools/[id]/claim/status

    if (!schoolId || isNaN(schoolId)) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    // Check for pending claims
    const pendingClaim = await prisma.schoolClaim.findFirst({
      where: {
        school_id: schoolId,
        user_id: user.user_id,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      hasPendingClaim: !!pendingClaim,
    });
  } catch (error) {
    console.error('Error checking claim status:', error);
    return NextResponse.json({ error: 'Failed to check claim status' }, { status: 500 });
  }
}
