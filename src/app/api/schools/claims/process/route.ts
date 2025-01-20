import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const processClaimSchema = z.object({
  claimId: z.number(),
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only super admins can process claims' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = processClaimSchema.parse(body);

    // Get the claim
    const claim = await prisma.schoolClaim.findUnique({
      where: { claim_id: validatedData.claimId },
      include: { school: true },
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    if (claim.status !== 'PENDING') {
      return NextResponse.json({ error: 'This claim has already been processed' }, { status: 400 });
    }

    // Update the claim status
    const updatedClaim = await prisma.schoolClaim.update({
      where: { claim_id: validatedData.claimId },
      data: {
        status: validatedData.status,
        processed_at: new Date(),
        processed_by: user.user_id,
        notes: validatedData.notes,
      },
    });

    // If approved, update school verification status and create admin record
    if (validatedData.status === 'APPROVED') {
      await prisma.$transaction([
        prisma.school.update({
          where: { school_id: claim.school_id },
          data: {
            is_verified: true,
            verification_date: new Date(),
            verified_by: user.user_id,
          },
        }),
        prisma.schoolAdmin.create({
          data: {
            school_id: claim.school_id,
            user_id: claim.user_id,
            assigned_by: user.user_id,
          },
        }),
        prisma.user.update({
          where: { user_id: claim.user_id },
          data: { role: 'SCHOOL_ADMIN' },
        }),
      ]);

      return NextResponse.json({
        message: 'Claim approved and school admin role assigned',
        claim: updatedClaim,
      });
    }

    return NextResponse.json({
      message: 'Claim processed successfully',
      claim: updatedClaim,
    });
  } catch (error) {
    console.error('Error processing claim:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to process claim' }, { status: 500 });
  }
}
