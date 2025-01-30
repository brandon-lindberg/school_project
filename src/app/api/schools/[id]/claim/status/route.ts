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

    // Get user from database with managed schools
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        user_id: true,
        role: true,
        managedSchools: {
          select: {
            school_id: true,
          },
        },
      },
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

    // Check if user is already a school admin and has an existing school
    const isSchoolAdmin = user.role === 'SCHOOL_ADMIN';
    const hasExistingSchool = user.managedSchools.length > 0;
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    // Check if school exists and if it's already claimed
    const school = await prisma.school.findUnique({
      where: { school_id: schoolId },
      select: {
        is_verified: true,
        claims: {
          where: {
            OR: [
              { status: 'APPROVED' },
              {
                AND: [{ status: 'PENDING' }, { user_id: user.user_id }],
              },
            ],
          },
        },
      },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const isClaimed =
      school.is_verified || school.claims.some(claim => claim.status === 'APPROVED');
    const hasPendingClaim = school.claims.some(claim => claim.status === 'PENDING');

    return NextResponse.json({
      isSchoolAdmin,
      hasExistingSchool,
      isClaimed,
      hasPendingClaim,
      isSuperAdmin,
    });
  } catch (error) {
    console.error('Error checking claim status:', error);
    return NextResponse.json({ error: 'Failed to check claim status' }, { status: 500 });
  }
}
