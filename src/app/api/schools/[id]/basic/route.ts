import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { SchoolAdmin } from '@prisma/client';

const urlSchema = z
  .string()
  .nullable()
  .transform(val => {
    if (!val || val.trim() === '') return '';
    return val;
  })
  .refine(
    val => {
      if (!val) return true;
      // Allow relative URLs starting with '/'
      if (val.startsWith('/')) return true;
      // Allow data URIs
      if (val.startsWith('data:')) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, { message: 'Invalid URL format' }
  );

const basicSchema = z.object({
  name_en: z.string().min(1, 'School name is required'),
  name_jp: z.string().nullable().default(''),
  short_description_en: z.string().nullable().default(''),
  short_description_jp: z.string().nullable().default(''),
  description_en: z.string().nullable().default(''),
  description_jp: z.string().nullable().default(''),
  location_en: z.string().nullable().default(''),
  location_jp: z.string().nullable().default(''),
  country_en: z.string().nullable().default(''),
  country_jp: z.string().nullable().default(''),
  region_en: z.string().nullable().default(''),
  region_jp: z.string().nullable().default(''),
  geography_en: z.string().nullable().default(''),
  geography_jp: z.string().nullable().default(''),
  phone_en: z.string().nullable().default(''),
  phone_jp: z.string().nullable().default(''),
  email_en: z.string().nullable().default(''),
  email_jp: z.string().nullable().default(''),
  address_en: z.string().nullable().default(''),
  address_jp: z.string().nullable().default(''),
  url_en: urlSchema,
  url_jp: urlSchema,
  image_url: urlSchema.default(''),
  logo_url: urlSchema.default(''),
  affiliations_en: z.array(z.string()).nullable().default([]),
  affiliations_jp: z.array(z.string()).nullable().default([]),
  accreditation_en: z.array(z.string()).nullable().default([]),
  accreditation_jp: z.array(z.string()).nullable().default([]),
  staff_staff_list_en: z.array(z.string()).nullable().default([]),
  staff_staff_list_jp: z.array(z.string()).nullable().default([]),
  staff_board_members_en: z.array(z.string()).nullable().default([]),
  staff_board_members_jp: z.array(z.string()).nullable().default([]),
});

export async function PUT(request: NextRequest) {
  try {
    // Extract schoolId from URL path
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const schoolId = segments[2]; // ['api','schools','{id}','basic']
    if (!schoolId) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const body = await request.json();
    let validatedData;

    try {
      validatedData = basicSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

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

    const school = await prisma.school.findUnique({
      where: { school_id: schoolId },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const isAuthorized =
      user.role === 'SUPER_ADMIN' ||
      user.managedSchools.some((admin: SchoolAdmin) => admin.school_id === schoolId);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized to edit this school' }, { status: 403 });
    }

    // Filter out empty values from arrays
    const processedData = {
      ...validatedData,
      affiliations_en: validatedData.affiliations_en?.filter(Boolean) ?? [],
      affiliations_jp: validatedData.affiliations_jp?.filter(Boolean) ?? [],
      accreditation_en: validatedData.accreditation_en?.filter(Boolean) ?? [],
      accreditation_jp: validatedData.accreditation_jp?.filter(Boolean) ?? [],
      staff_staff_list_en: validatedData.staff_staff_list_en?.filter(Boolean) ?? [],
      staff_staff_list_jp: validatedData.staff_staff_list_jp?.filter(Boolean) ?? [],
      staff_board_members_en: validatedData.staff_board_members_en?.filter(Boolean) ?? [],
      staff_board_members_jp: validatedData.staff_board_members_jp?.filter(Boolean) ?? [],
    };

    const updatedSchool = await prisma.school.update({
      where: { school_id: schoolId },
      data: processedData,
    });

    return NextResponse.json({
      message: 'Basic information updated successfully',
      school: updatedSchool,
    });
  } catch (error) {
    console.error('Error updating basic information:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update basic information' }, { status: 500 });
  }
}
