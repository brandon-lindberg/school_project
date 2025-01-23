import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schema for validating the request body
const updateSchoolSchema = z.object({
  // Basic Information
  name_en: z.string().optional(),
  name_jp: z.string().optional(),
  short_description_en: z.string().optional(),
  short_description_jp: z.string().optional(),
  description_en: z.string().optional(),
  description_jp: z.string().optional(),
  location_en: z.string().optional(),
  location_jp: z.string().optional(),
  address_en: z.string().optional(),
  address_jp: z.string().optional(),
  region_en: z.string().optional(),
  region_jp: z.string().optional(),
  country_en: z.string().optional(),
  country_jp: z.string().optional(),
  geography_en: z.string().optional(),
  geography_jp: z.string().optional(),
  phone_en: z.string().optional(),
  phone_jp: z.string().optional(),
  email_en: z.string().optional(),
  email_jp: z.string().optional(),
  url_en: z.string().optional(),
  url_jp: z.string().optional(),
  // Add more fields as needed for other sections
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        managedSchools: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the school ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const schoolId = parseInt(pathParts[3]); // /api/schools/[id]/update

    if (!schoolId || isNaN(schoolId)) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    // Check if user is authorized to edit this school
    const isAuthorized =
      user.role === 'SUPER_ADMIN' ||
      user.managedSchools.some(admin => admin.school_id === schoolId);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized to edit this school' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateSchoolSchema.parse(body);

    // Update the school
    const updatedSchool = await prisma.school.update({
      where: { school_id: schoolId },
      data: validatedData,
    });

    return NextResponse.json({
      message: 'School updated successfully',
      school: updatedSchool,
    });
  } catch (error) {
    console.error('Error updating school:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 });
  }
}
