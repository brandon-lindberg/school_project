import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { SchoolClaim, User, School } from '@prisma/client';
import { Session } from 'next-auth';

type ClaimWithRelations = SchoolClaim & {
  school: Pick<School, 'name_en' | 'name_jp'>;
  user: Pick<User, 'email' | 'family_name' | 'first_name'>;
};

// Helper function to check if user is super admin
async function isSuperAdmin(email: string | null | undefined) {
  if (!email) return false;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return user?.role === 'SUPER_ADMIN';
}

// Transfer a claim to a different user
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!(await isSuperAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { claimId, newUserId } = await request.json();
    const claimIdNumber = typeof claimId === 'string' ? parseInt(claimId, 10) : claimId;
    const newUserIdNumber = typeof newUserId === 'string' ? parseInt(newUserId, 10) : newUserId;

    if (!claimIdNumber || !newUserIdNumber || isNaN(claimIdNumber) || isNaN(newUserIdNumber)) {
      return NextResponse.json({ error: 'Invalid claim ID or user ID' }, { status: 400 });
    }

    // Update the claim with the new user and handle role changes in a transaction
    const updatedClaim = await prisma.$transaction(async tx => {
      // Get the current claim to know the old user
      const currentClaim = await tx.schoolClaim.findUnique({
        where: { claim_id: claimIdNumber },
        include: { user: true },
      });

      if (!currentClaim) {
        throw new Error('Claim not found');
      }

      // Get the current admin user's ID
      const adminUser = await tx.user.findUniqueOrThrow({
        where: { email: session.user?.email || '' },
        select: { user_id: true },
      });

      // Update the claim with the new user
      const claim = await tx.schoolClaim.update({
        where: { claim_id: claimIdNumber },
        data: {
          user_id: newUserIdNumber,
          status: 'APPROVED' as const,
          processed_at: new Date(),
          processed_by: adminUser.user_id,
        },
        include: {
          school: true,
          user: true,
        },
      });

      // Update the new user's role to SCHOOL_ADMIN
      await tx.user.update({
        where: { user_id: newUserIdNumber },
        data: { role: 'SCHOOL_ADMIN' as const },
      });

      // Check if the old user has any other active claims
      const oldUserOtherClaims = await tx.schoolClaim.count({
        where: {
          AND: [
            { user_id: currentClaim.user_id },
            { status: { in: ['APPROVED', 'PENDING'] as const } },
            { claim_id: { not: claimIdNumber } },
          ],
        },
      });

      // If the old user has no other claims, revert their role to USER
      if (oldUserOtherClaims === 0) {
        await tx.user.update({
          where: { user_id: currentClaim.user_id },
          data: { role: 'USER' as const },
        });
      }

      return claim;
    });

    return NextResponse.json(updatedClaim);
  } catch (error) {
    console.error('Error in transfer claim:', error);
    return NextResponse.json({ error: 'Failed to transfer claim' }, { status: 500 });
  }
}

// Revoke a claim
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!(await isSuperAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get('claimId');

    if (!claimId) {
      return NextResponse.json({ error: 'Missing claim ID' }, { status: 400 });
    }

    const claimIdNumber = parseInt(claimId, 10);
    if (isNaN(claimIdNumber)) {
      return NextResponse.json({ error: 'Invalid claim ID' }, { status: 400 });
    }

    // Update the claim status to REJECTED
    const revokedClaim = await prisma.$transaction(async tx => {
      const adminUser = await tx.user.findUniqueOrThrow({
        where: { email: session.user?.email || '' },
        select: { user_id: true },
      });

      // First, update the claim status
      const claim = await tx.schoolClaim.update({
        where: { claim_id: claimIdNumber },
        data: {
          status: 'REJECTED' as const,
          processed_at: new Date(),
          processed_by: adminUser.user_id,
        },
        include: {
          user: true,
          school: true,
        },
      });

      // Then, update the user's role back to USER if they have no other active claims
      const otherActiveClaims = await tx.schoolClaim.count({
        where: {
          AND: [
            { user_id: claim.user_id },
            { status: { in: ['APPROVED', 'PENDING'] as const } },
            { claim_id: { not: claimIdNumber } },
          ],
        },
      });

      if (otherActiveClaims === 0) {
        await tx.user.update({
          where: { user_id: claim.user_id },
          data: { role: 'USER' as const },
        });
      }

      return claim;
    });

    return NextResponse.json(revokedClaim);
  } catch (error) {
    console.error('Error in revoke claim:', error);
    return NextResponse.json({ error: 'Failed to revoke claim' }, { status: 500 });
  }
}

// Get all claims
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!(await isSuperAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const claims = await prisma.schoolClaim.findMany({
      include: {
        school: true,
        user: true,
        processor: true,
      },
      orderBy: {
        submitted_at: 'desc',
      },
    });

    return NextResponse.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}
