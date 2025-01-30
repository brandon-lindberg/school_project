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

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const schoolId = parseInt(pathParts[pathParts.length - 2]);

    if (isNaN(schoolId)) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const school = await prisma.school.findUnique({
      where: { school_id: schoolId },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const existingClaim = await prisma.schoolClaim.findFirst({
      where: {
        user_id: user.user_id,
        status: 'PENDING',
      },
    });

    if (existingClaim) {
      return NextResponse.json(
        {
          error: 'You already have a pending claim. You can only have one pending claim at a time.',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = claimRequestSchema.parse(body);

    const claim = await prisma.schoolClaim.create({
      data: {
        user_id: user.user_id,
        school_id: schoolId,
        status: 'PENDING',
        verification_method: validatedData.verificationMethod,
        verification_data: validatedData.verificationData,
        notes: validatedData.notes,
      },
    });

    // Create notifications for all SUPER_ADMIN users
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: { user_id: true },
    });

    const schoolName = school.name_en || school.name_jp || 'School';
    await prisma.notification.createMany({
      data: superAdmins.map(admin => ({
        user_id: admin.user_id,
        type: 'CLAIM_SUBMITTED',
        title: `New School Claim: ${schoolName}`,
        message: `A new claim has been submitted for ${schoolName} by ${user.email}. Please review and process this claim.`,
      })),
    });

    return NextResponse.json(
      {
        status: claim.status,
        claim_id: claim.claim_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error claiming school:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to claim school' }, { status: 500 });
  }
}
