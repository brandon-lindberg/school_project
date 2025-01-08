import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // If ID is provided, return single school
    if (id) {
      const school = await prisma.school.findUnique({
        where: { school_id: parseInt(id) },
        select: {
          school_id: true,
          name_en: true,
          name_jp: true,
          description_en: true,
          description_jp: true,
          location_en: true,
          location_jp: true,
          logo_id: true,
          email_en: true,
          phone_en: true,
          url_en: true,
          address_en: true,
          address_jp: true,
          region_en: true,
          region_jp: true,
          country_en: true,
          country_jp: true,
          affiliations_en: true,
          affiliations_jp: true,
          accreditation_en: true,
          accreditation_jp: true,
          education_programs_offered_en: true,
          education_programs_offered_jp: true,
          education_curriculum_en: true,
          education_curriculum_jp: true,
          admissions_acceptance_policy_en: true,
          admissions_acceptance_policy_jp: true,
          admissions_application_guidelines_en: true,
          admissions_application_guidelines_jp: true,
          admissions_fees_en: true,
          admissions_fees_jp: true,
          campus_facilities_en: true,
          campus_facilities_jp: true,
          campus_virtual_tour_en: true,
          campus_virtual_tour_jp: true
        }
      });

      if (!school) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }

      return NextResponse.json(school);
    }

    // Build the where clause for search
    const whereClause = search ? {
      OR: [
        { name_en: { contains: search, mode: 'insensitive' as const } },
        { name_jp: { contains: search, mode: 'insensitive' as const } },
        { description_en: { contains: search, mode: 'insensitive' as const } },
        { description_jp: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    // Get total count first
    const total = await prisma.school.count({
      where: whereClause,
    });

    // Then get paginated schools with distinct selection
    const schools = await prisma.school.findMany({
      where: whereClause,
      distinct: ['school_id'],
      take: limit,
      skip,
      orderBy: {
        name_en: 'asc'
      },
      select: {
        school_id: true,
        name_en: true,
        name_jp: true,
        description_en: true,
        description_jp: true,
        location_en: true,
        location_jp: true,
        logo_id: true,
        email_en: true,
        phone_en: true,
        url_en: true,
        address_en: true,
        address_jp: true,
        region_en: true,
        region_jp: true,
        country_en: true,
        country_jp: true,
        affiliations_en: true,
        affiliations_jp: true,
        accreditation_en: true,
        accreditation_jp: true,
        education_programs_offered_en: true,
        education_programs_offered_jp: true,
        education_curriculum_en: true,
        education_curriculum_jp: true,
        admissions_acceptance_policy_en: true,
        admissions_acceptance_policy_jp: true,
        admissions_application_guidelines_en: true,
        admissions_application_guidelines_jp: true,
        admissions_fees_en: true,
        admissions_fees_jp: true,
        campus_facilities_en: true,
        campus_facilities_jp: true,
        campus_virtual_tour_en: true,
        campus_virtual_tour_jp: true
      }
    });

    // Filter out any potential duplicates
    const uniqueSchools = Array.from(new Map(schools.map(school => [school.school_id, school])).values());

    // Calculate if there are more schools to load
    const hasMore = skip + uniqueSchools.length < total;

    return NextResponse.json({
      schools: uniqueSchools,
      pagination: {
        total,
        currentPage: page,
        perPage: limit,
        hasMore
      }
    });

  } catch (error: unknown) {
    console.error('Error in GET /api/schools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}
