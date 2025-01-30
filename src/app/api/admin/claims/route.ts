import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

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
        include: {
          user: true,
          school: {
            select: {
              school_id: true,
              name_en: true,
              name_jp: true
            }
          }
        },
      });

      if (!currentClaim) {
        throw new Error('Claim not found');
      }

      // Get the current admin user's ID
      const adminUser = await tx.user.findUniqueOrThrow({
        where: { email: session.user?.email || '' },
        select: { user_id: true },
      });

      // Delete the old claim and admin record
      await tx.schoolClaim.delete({
        where: { claim_id: claimIdNumber },
      });

      await tx.schoolAdmin.deleteMany({
        where: {
          school_id: currentClaim.school_id,
          user_id: currentClaim.user_id,
        },
      });

      // Reset the old user's role to USER
      await tx.user.update({
        where: { user_id: currentClaim.user_id },
        data: { role: 'USER' },
      });

      // Reset school verification status
      await tx.school.update({
        where: { school_id: currentClaim.school_id },
        data: {
          is_verified: false,
          verification_date: null,
          verified_by: null,
        },
      });

      // Create new claim for the new user
      const claim = await tx.schoolClaim.create({
        data: {
          user_id: newUserIdNumber,
          school_id: currentClaim.school_id,
          status: 'APPROVED',
          processed_at: new Date(),
          processed_by: adminUser.user_id,
          verification_method: currentClaim.verification_method,
          verification_data: currentClaim.verification_data,
        },
        include: {
          school: true,
          user: true,
        },
      });

      // Update the new user's role to SCHOOL_ADMIN
      await tx.user.update({
        where: { user_id: newUserIdNumber },
        data: { role: 'SCHOOL_ADMIN' },
      });

      // Create new school admin record
      await tx.schoolAdmin.create({
        data: {
          school_id: currentClaim.school_id,
          user_id: newUserIdNumber,
          assigned_by: adminUser.user_id,
        },
      });

      // Set school as verified with new admin
      await tx.school.update({
        where: { school_id: currentClaim.school_id },
        data: {
          is_verified: true,
          verification_date: new Date(),
          verified_by: adminUser.user_id,
        },
      });

      // Create notification for the new user
      await tx.notification.create({
        data: {
          user_id: newUserIdNumber,
          type: NotificationType.CLAIM_APPROVED,
          title: `School Transferred to You: ${currentClaim.school.name_en || currentClaim.school.name_jp || 'School'}`,
          message: `A school claim has been transferred to you for ${currentClaim.school.name_en || currentClaim.school.name_jp || 'School'}. You now have admin access to manage this school.`,
        },
      });

      // Create notification for the previous user
      await tx.notification.create({
        data: {
          user_id: currentClaim.user_id,
          type: NotificationType.CLAIM_REVOKED,
          title: `School Transferred: ${currentClaim.school.name_en || currentClaim.school.name_jp || 'School'}`,
          message: `Your claim for ${currentClaim.school.name_en || currentClaim.school.name_jp || 'School'} has been transferred to another user.`,
        },
      });

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

    const url = new URL(request.url);
    const claimId = url.searchParams.get('claimId');
    const claimIdNumber = claimId ? parseInt(claimId, 10) : null;

    if (!claimIdNumber || isNaN(claimIdNumber)) {
      return NextResponse.json({ error: 'Invalid claim ID' }, { status: 400 });
    }

    // Get the current admin user's ID
    const adminUser = await prisma.user.findUniqueOrThrow({
      where: { email: session.user.email },
      select: { user_id: true },
    });

    // Handle revocation in a transaction
    await prisma.$transaction(async tx => {
      // Get the claim to know the user and school
      const claim = await tx.schoolClaim.findUnique({
        where: { claim_id: claimIdNumber },
        include: {
          user: true,
          school: true,
        },
      });

      if (!claim) {
        throw new Error('Claim not found');
      }

      // Delete the claim
      await tx.schoolClaim.delete({
        where: { claim_id: claimIdNumber },
      });

      // Delete the school admin record
      await tx.schoolAdmin.deleteMany({
        where: {
          school_id: claim.school_id,
          user_id: claim.user_id,
        },
      });

      // Revert user role to USER
      await tx.user.update({
        where: { user_id: claim.user_id },
        data: { role: 'USER' },
      });

      // Update school verification status
      await tx.school.update({
        where: { school_id: claim.school_id },
        data: {
          is_verified: false,
          verification_date: null,
          verified_by: null,
        },
      });

      // Create notification for the user
      await tx.notification.create({
        data: {
          user_id: claim.user_id,
          type: NotificationType.CLAIM_REVOKED,
          title: `School Claim Revoked: ${claim.school.name_en || claim.school.name_jp || 'School'}`,
          message: `Your claim for ${claim.school.name_en || claim.school.name_jp || 'School'} has been revoked by an administrator.`,
        },
      });
    });

    return NextResponse.json({ message: 'Claim revoked successfully' });
  } catch (error) {
    console.error('Error revoking claim:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to revoke claim' },
      { status: 500 }
    );
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
