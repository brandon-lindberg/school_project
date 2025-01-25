import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema for claim request validation
const claimRequestSchema = z.object({
  verificationMethod: z.enum(['EMAIL', 'DOCUMENT']),
  verificationData: z.string(),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Parse and validate request body first
    const body = await request.json();
    const validatedData = claimRequestSchema.parse(body);

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

    // Get the school ID from params
    const schoolId = parseInt(params.id);
    if (!schoolId || isNaN(schoolId)) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { school_id: schoolId },
      include: {
        claims: {
          where: {
            user_id: user.user_id,
            status: 'PENDING',
          },
        },
      },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Check if user already has a pending claim
    if (school.claims.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending claim for this school' },
        { status: 400 }
      );
    }

    // Create the claim
    const claim = await prisma.schoolClaim.create({
      data: {
        school_id: schoolId,
        user_id: user.user_id,
        verification_method: validatedData.verificationMethod,
        verification_data: validatedData.verificationData,
        notes: validatedData.notes,
        status: 'PENDING',
      },
    });

    // Notify all super admins about the new claim
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: { user_id: true },
    });

    const schoolName = school.name_en || school.name_jp || 'School';
    const claimantName =
      [user.first_name, user.family_name].filter(Boolean).join(' ') || user.email;

    await prisma.$transaction(
      superAdmins.map(admin =>
        prisma.notification.create({
          data: {
            user_id: admin.user_id,
            type: 'CLAIM_SUBMITTED',
            title: `New School Claim: ${schoolName}`,
            message: `${claimantName} has submitted a claim for ${schoolName}. Verification method: ${validatedData.verificationMethod}`,
          },
        })
      )
    );

    return NextResponse.json({
      message: 'Claim submitted successfully',
      status: 'PENDING',
      claim_id: claim.claim_id,
    });
  } catch (error) {
    console.error('Error processing school claim:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to process claim' }, { status: 500 });
  }
}
