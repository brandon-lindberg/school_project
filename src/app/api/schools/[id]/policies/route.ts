import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { SchoolAdmin } from '@prisma/client';

const policiesSchema = z.object({
  policies_privacy_policy_en: z.string().nullable().default(''),
  policies_privacy_policy_jp: z.string().nullable().default(''),
  policies_terms_of_use_en: z.string().nullable().default(''),
  policies_terms_of_use_jp: z.string().nullable().default(''),
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

    // Extract schoolId from URL path
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const schoolId = segments[2]; // ['api','schools','{id}','policies']

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
    const validatedData = policiesSchema.parse(body);

    // Process the data, converting nulls to empty strings
    const processedData = {
      policies_privacy_policy_en: validatedData.policies_privacy_policy_en ?? '',
      policies_privacy_policy_jp: validatedData.policies_privacy_policy_jp ?? '',
      policies_terms_of_use_en: validatedData.policies_terms_of_use_en ?? '',
      policies_terms_of_use_jp: validatedData.policies_terms_of_use_jp ?? '',
    };

    const updatedSchool = await prisma.school.update({
      where: { school_id: schoolId },
      data: processedData,
    });

    return NextResponse.json({
      message: 'Policies information updated successfully',
      school: updatedSchool,
    });
  } catch (error) {
    console.error('Error updating policies information:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update policies information' }, { status: 500 });
  }
}
