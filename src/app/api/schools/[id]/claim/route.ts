import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
// import { z } from 'zod';

// Schema for claim request validation
// const claimRequestSchema = z.object({
//   verificationMethod: z.enum(['EMAIL', 'DOCUMENT']),
//   verificationData: z.string(),
//   notes: z.string().optional(),
// });

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const schoolId = parseInt(pathParts[3]);

    if (!schoolId || isNaN(schoolId)) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        user_id: true,
        role: true,
        managedSchools: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const school = await prisma.school.findUnique({
      where: { school_id: schoolId },
      include: {
        admins: true,
      },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Check if the school is already claimed
    if (school.admins.length > 0) {
      return NextResponse.json({ error: 'School is already claimed' }, { status: 400 });
    }

    // Create school admin record
    await prisma.schoolAdmin.create({
      data: {
        user_id: user.user_id,
        school_id: schoolId,
        assigned_by: user.user_id, // The user claiming the school is also the assigner
      },
    });

    return NextResponse.json({ message: 'School claimed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error claiming school:', error);
    return NextResponse.json({ error: 'Failed to claim school' }, { status: 500 });
  }
}
