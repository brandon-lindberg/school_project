import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const campusSchema = z.object({
  campus_facilities_en: z
    .array(z.string())
    .nullable()
    .transform(val => val ?? []),
  campus_facilities_jp: z
    .array(z.string())
    .nullable()
    .transform(val => val ?? []),
  campus_virtual_tour_en: z
    .string()
    .nullable()
    .transform(val => val ?? ''),
  campus_virtual_tour_jp: z
    .string()
    .nullable()
    .transform(val => val ?? ''),
});

export async function PUT(request: NextRequest) {
  try {
    // Extract schoolId from URL path
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const schoolId = segments[2]; // ['api','schools','{id}','campus']

    if (!schoolId) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        role: true,
        managedSchools: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const school = await prisma.school.findUnique({
      where: { school_id: schoolId },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const data = await request.json();
    const validatedData = campusSchema.parse(data);

    // Filter out empty values from arrays
    const processedData = {
      ...validatedData,
      campus_facilities_en: validatedData.campus_facilities_en?.filter(Boolean) ?? [],
      campus_facilities_jp: validatedData.campus_facilities_jp?.filter(Boolean) ?? [],
    };

    await prisma.school.update({
      where: { school_id: schoolId },
      data: processedData,
    });

    return NextResponse.json(
      { message: 'Campus information updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update campus information' }, { status: 500 });
  }
}
