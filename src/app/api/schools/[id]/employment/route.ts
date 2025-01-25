import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { SchoolAdmin } from '@prisma/client';

const employmentSchema = z.object({
  employment_open_positions_en: z.array(z.string().nullable()).nullable().default([]),
  employment_open_positions_jp: z.array(z.string().nullable()).nullable().default([]),
  employment_application_process_en: z.string().nullable().default(''),
  employment_application_process_jp: z.string().nullable().default(''),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { managedSchools: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const schoolId = parseInt(pathParts[3]);

    if (!schoolId || isNaN(schoolId)) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const isAuthorized =
      user.role === 'SUPER_ADMIN' ||
      user.managedSchools.some((admin: SchoolAdmin) => admin.school_id === schoolId);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized to edit this school' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = employmentSchema.parse(body);

    // Filter out null/empty values from arrays
    const processedData = {
      employment_open_positions_en: (validatedData.employment_open_positions_en ?? [])
        .filter((item): item is string => Boolean(item)),
      employment_open_positions_jp: (validatedData.employment_open_positions_jp ?? [])
        .filter((item): item is string => Boolean(item)),
      employment_application_process_en: validatedData.employment_application_process_en ?? '',
      employment_application_process_jp: validatedData.employment_application_process_jp ?? '',
    };

    const updatedSchool = await prisma.school.update({
      where: { school_id: schoolId },
      data: processedData,
    });

    return NextResponse.json({
      message: 'Employment information updated successfully',
      school: updatedSchool,
    });
  } catch (error) {
    console.error('Error updating employment information:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update employment information' },
      { status: 500 }
    );
  }
}
