import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the school ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const schoolId = pathParts[4]; // /api/admin/schools/[id]
    if (!schoolId) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    // Fetch the user to check their role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, managedSchools: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is authorized to access this school
    if (user.role !== 'SUPER_ADMIN') {
      const isSchoolAdmin = user.managedSchools.some(admin =>
        admin.school_id.toString() === schoolId
      );

      if (!isSchoolAdmin) {
        return NextResponse.json(
          { error: 'Not authorized to access this school' },
          { status: 403 }
        );
      }
    }

    // Fetch the school
    const school = await prisma.school.findUnique({
      where: { school_id: schoolId },
      select: {
        school_id: true,
        image_id: true,
        logo_id: true,
        image_url: true,
        logo_url: true,
        name_en: true,
        name_jp: true,
        description_en: true,
        description_jp: true,
        admissions_language_requirements_students_en: true,
        admissions_language_requirements_students_jp: true,
        admissions_language_requirements_parents_en: true,
        admissions_language_requirements_parents_jp: true,
        admissions_age_requirements_en: true,
        admissions_age_requirements_jp: true,
        address_en: true,
        address_jp: true,
        location_en: true,
        location_jp: true,
        country_en: true,
        country_jp: true,
        url_en: true,
        url_jp: true,
        phone_en: true,
        phone_jp: true,
        email_en: true,
        email_jp: true,
        // Job postings feature gating fields
        job_postings_enabled: true,
        job_postings_start: true,
        job_postings_end: true,
      },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Return the bilingual school data directly
    return NextResponse.json(school);
  } catch (error) {
    console.error('Error in school route:', error);
    return NextResponse.json({ error: 'Failed to fetch school' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the school ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const schoolId = pathParts[4]; // /api/admin/schools/[id]
    if (!schoolId) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    // Fetch the user to check their role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, managedSchools: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is authorized to update this school
    if (user.role !== 'SUPER_ADMIN') {
      const isSchoolAdmin = user.managedSchools.some(admin =>
        admin.school_id.toString() === schoolId
      );

      if (!isSchoolAdmin) {
        return NextResponse.json(
          { error: 'Not authorized to update this school' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      image_url,
      logo_url,
      name_en,
      name_jp,
      description_en,
      description_jp,
      admissions_language_requirements_students_en,
      admissions_language_requirements_students_jp,
      admissions_language_requirements_parents_en,
      admissions_language_requirements_parents_jp,
      admissions_age_requirements_en,
      admissions_age_requirements_jp,
      address_en,
      address_jp,
      location_en,
      location_jp,
      country_en,
      country_jp,
      url_en,
      url_jp,
      phone_en,
      phone_jp,
      email_en,
      email_jp,
      job_postings_enabled,
      job_postings_start,
      job_postings_end,
    } = body;

    // Build update data, only SUPER_ADMIN can modify feature flags
    const updateData: Prisma.SchoolUpdateInput = {
      image_url,
      logo_url,
      name_en,
      name_jp,
      description_en,
      description_jp,
      admissions_language_requirements_students_en,
      admissions_language_requirements_students_jp,
      admissions_language_requirements_parents_en,
      admissions_language_requirements_parents_jp,
      admissions_age_requirements_en,
      admissions_age_requirements_jp,
      address_en,
      address_jp,
      location_en,
      location_jp,
      country_en,
      country_jp,
      url_en,
      url_jp,
      phone_en,
      phone_jp,
      email_en,
      email_jp,
    };
    if (user.role === 'SUPER_ADMIN') {
      updateData.job_postings_enabled = job_postings_enabled;
      updateData.job_postings_start = job_postings_start ? new Date(job_postings_start) : null;
      updateData.job_postings_end = job_postings_end ? new Date(job_postings_end) : null;
    }
    const updatedSchool = await prisma.school.update({
      where: { school_id: schoolId },
      data: updateData,
      select: {
        school_id: true,
        image_id: true,
        logo_id: true,
        image_url: true,
        logo_url: true,
        name_en: true,
        name_jp: true,
        description_en: true,
        description_jp: true,
        admissions_language_requirements_students_en: true,
        admissions_language_requirements_students_jp: true,
        admissions_language_requirements_parents_en: true,
        admissions_language_requirements_parents_jp: true,
        admissions_age_requirements_en: true,
        admissions_age_requirements_jp: true,
        address_en: true,
        address_jp: true,
        location_en: true,
        location_jp: true,
        country_en: true,
        country_jp: true,
        url_en: true,
        url_jp: true,
        phone_en: true,
        phone_jp: true,
        email_en: true,
        email_jp: true,
        job_postings_enabled: true,
        job_postings_start: true,
        job_postings_end: true,
      },
    });

    // Return updated bilingual and media fields
    return NextResponse.json(updatedSchool, { status: 201 });
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 });
  }
}

// Add DELETE handler for deleting a school by super admins
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    // Get the school ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const schoolId = pathParts[4]; // /api/admin/schools/[id]
    if (!schoolId) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }
    // Fetch user role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    // Delete the school
    await prisma.school.delete({ where: { school_id: schoolId } });
    return NextResponse.json({ message: 'School deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json({ error: 'Failed to delete school' }, { status: 500 });
  }
}
