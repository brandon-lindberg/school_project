import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { SchoolAdmin } from '@prisma/client';

const educationSchema = z.object({
  education_programs_offered_en: z.array(z.string().nullable()).nullable().default([]),
  education_programs_offered_jp: z.array(z.string().nullable()).nullable().default([]),
  education_curriculum_en: z.string().nullable().default(''),
  education_curriculum_jp: z.string().nullable().default(''),
  education_academic_support_en: z.array(z.string().nullable()).nullable().default([]),
  education_academic_support_jp: z.array(z.string().nullable()).nullable().default([]),
  education_extracurricular_activities_en: z.array(z.string().nullable()).nullable().default([]),
  education_extracurricular_activities_jp: z.array(z.string().nullable()).nullable().default([]),
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
    const validatedData = educationSchema.parse(body);

    // Filter out null/empty values from arrays and convert nulls to empty strings
    const processedData = {
      education_programs_offered_en: (validatedData.education_programs_offered_en ?? []).filter(
        (item): item is string => Boolean(item)
      ),
      education_programs_offered_jp: (validatedData.education_programs_offered_jp ?? []).filter(
        (item): item is string => Boolean(item)
      ),
      education_academic_support_en: (validatedData.education_academic_support_en ?? []).filter(
        (item): item is string => Boolean(item)
      ),
      education_academic_support_jp: (validatedData.education_academic_support_jp ?? []).filter(
        (item): item is string => Boolean(item)
      ),
      education_extracurricular_activities_en: (
        validatedData.education_extracurricular_activities_en ?? []
      ).filter((item): item is string => Boolean(item)),
      education_extracurricular_activities_jp: (
        validatedData.education_extracurricular_activities_jp ?? []
      ).filter((item): item is string => Boolean(item)),
      education_curriculum_en: validatedData.education_curriculum_en ?? '',
      education_curriculum_jp: validatedData.education_curriculum_jp ?? '',
    };

    const updatedSchool = await prisma.school.update({
      where: { school_id: schoolId },
      data: processedData,
    });

    return NextResponse.json({
      message: 'Education information updated successfully',
      school: updatedSchool,
    });
  } catch (error) {
    console.error('Error updating education information:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update education information' }, { status: 500 });
  }
}
