import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { SchoolAdmin } from '@prisma/client';

const studentLifeSchema = z.object({
  student_life_counseling_en: z.string().nullable().default(''),
  student_life_counseling_jp: z.string().nullable().default(''),
  student_life_support_services_en: z.array(z.string().nullable()).nullable().default([]),
  student_life_support_services_jp: z.array(z.string().nullable()).nullable().default([]),
  student_life_library_en: z.string().nullable().default(''),
  student_life_library_jp: z.string().nullable().default(''),
  student_life_calendar_en: z.string().nullable().default(''),
  student_life_calendar_jp: z.string().nullable().default(''),
  student_life_tour_en: z.string().nullable().default(''),
  student_life_tour_jp: z.string().nullable().default(''),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const schoolId = params.id;

    if (!schoolId) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const isAuthorized =
      user.role === 'SUPER_ADMIN' ||
      user.managedSchools.some((admin: SchoolAdmin) => admin.school_id === schoolId);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized to edit this school' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = studentLifeSchema.parse(body);

    // Process the data, converting nulls to empty strings/arrays
    const processedData = {
      student_life_counseling_en: validatedData.student_life_counseling_en ?? '',
      student_life_counseling_jp: validatedData.student_life_counseling_jp ?? '',
      student_life_support_services_en: (
        validatedData.student_life_support_services_en ?? []
      ).filter((item): item is string => Boolean(item)),
      student_life_support_services_jp: (
        validatedData.student_life_support_services_jp ?? []
      ).filter((item): item is string => Boolean(item)),
      student_life_library_en: validatedData.student_life_library_en ?? '',
      student_life_library_jp: validatedData.student_life_library_jp ?? '',
      student_life_calendar_en: validatedData.student_life_calendar_en ?? '',
      student_life_calendar_jp: validatedData.student_life_calendar_jp ?? '',
      student_life_tour_en: validatedData.student_life_tour_en ?? '',
      student_life_tour_jp: validatedData.student_life_tour_jp ?? '',
    };

    const updatedSchool = await prisma.school.update({
      where: { school_id: schoolId },
      data: processedData,
    });

    return NextResponse.json({
      message: 'Student life information updated successfully',
      school: updatedSchool,
    });
  } catch (error) {
    console.error('Error updating student life information:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update student life information' },
      { status: 500 }
    );
  }
}
