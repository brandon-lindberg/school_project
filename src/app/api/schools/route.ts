import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const QUERY_MODE: Prisma.QueryMode = 'insensitive';

// Define region mappings similar to the list page
const REGION_MAPPINGS = {
  Tokyo: ['Tokyo', '東京', 'Shibuya', '渋谷', 'Shinjuku', '新宿', 'Minato', '港区'],
  Kansai: ['Kyoto', 'Osaka', 'Kobe', '京都', '大阪', '神戸'],
  Aichi: ['Nagoya', '名古屋'],
  Ibaraki: ['Tsukuba', 'つくば'],
  Nagano: ['Nagano', '長野', 'Karuizawa', '軽井沢'],
  Hokkaido: ['Sapporo', '札幌', 'Niseko', 'ニセコ'],
  Okinawa: ['Naha', '那覇', 'Okinawa', '沖縄'],
  Miyagi: ['Sendai', '仙台'],
  Hiroshima: ['Hiroshima', '広島'],
  Fukuoka: ['Fukuoka', '福岡', 'Hakata', '博多'],
  Iwate: ['Appi Kogen', '安比高原', 'Morioka', '盛岡'],
  Yamanashi: ['Kofu', '甲府'],
} as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const regions = searchParams.getAll('region');
    const curriculums = searchParams.getAll('curriculum');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '1000');
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
          url_jp: true,
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
          education_academic_support_en: true,
          education_academic_support_jp: true,
          education_extracurricular_activities_en: true,
          education_extracurricular_activities_jp: true,
          admissions_acceptance_policy_en: true,
          admissions_acceptance_policy_jp: true,
          admissions_application_guidelines_en: true,
          admissions_application_guidelines_jp: true,
          admissions_fees_en: true,
          admissions_fees_jp: true,
          admissions_age_requirements_en: true,
          admissions_age_requirements_jp: true,
          admissions_language_requirements_students_en: true,
          admissions_language_requirements_students_jp: true,
          admissions_language_requirements_parents_en: true,
          admissions_language_requirements_parents_jp: true,
          admissions_procedure_en: true,
          admissions_procedure_jp: true,
          admissions_breakdown_fees_application_fee_en: true,
          admissions_breakdown_fees_application_fee_jp: true,
          admissions_breakdown_fees_day_care_fee_tuition_en: true,
          admissions_breakdown_fees_day_care_fee_tuition_jp: true,
          admissions_breakdown_fees_day_care_fee_registration_fee_en: true,
          admissions_breakdown_fees_day_care_fee_registration_fee_jp: true,
          admissions_breakdown_fees_day_care_fee_maintenance_fee_en: true,
          admissions_breakdown_fees_day_care_fee_maintenance_fee_jp: true,
          admissions_breakdown_fees_kindergarten_tuition_en: true,
          admissions_breakdown_fees_kindergarten_tuition_jp: true,
          admissions_breakdown_fees_kindergarten_registration_fee_en: true,
          admissions_breakdown_fees_kindergarten_registration_fee_jp: true,
          admissions_breakdown_fees_kindergarten_maintenance_fee_en: true,
          admissions_breakdown_fees_kindergarten_maintenance_fee_jp: true,
          admissions_breakdown_fees_grade_elementary_tuition_en: true,
          admissions_breakdown_fees_grade_elementary_tuition_jp: true,
          admissions_breakdown_fees_grade_elementary_registration_fee_en: true,
          admissions_breakdown_fees_grade_elementary_registration_fee_jp: true,
          admissions_breakdown_fees_grade_elementary_maintenance_fee_en: true,
          admissions_breakdown_fees_grade_elementary_maintenance_fee_jp: true,
          admissions_breakdown_fees_grade_junior_high_tuition_en: true,
          admissions_breakdown_fees_grade_junior_high_tuition_jp: true,
          admissions_breakdown_fees_grade_junior_high_registration_fee_en: true,
          admissions_breakdown_fees_grade_junior_high_registration_fee_jp: true,
          admissions_breakdown_fees_grade_junior_high_maintenance_fee_en: true,
          admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp: true,
          admissions_breakdown_fees_grade_high_school_tuition_en: true,
          admissions_breakdown_fees_grade_high_school_tuition_jp: true,
          admissions_breakdown_fees_grade_high_school_registration_fee_en: true,
          admissions_breakdown_fees_grade_high_school_registration_fee_jp: true,
          admissions_breakdown_fees_grade_high_school_maintenance_fee_en: true,
          admissions_breakdown_fees_grade_high_school_maintenance_fee_jp: true,
          admissions_breakdown_fees_summer_school_tuition_en: true,
          admissions_breakdown_fees_summer_school_tuition_jp: true,
          admissions_breakdown_fees_summer_school_registration_fee_en: true,
          admissions_breakdown_fees_summer_school_registration_fee_jp: true,
          admissions_breakdown_fees_summer_school_maintenance_fee_en: true,
          admissions_breakdown_fees_summer_school_maintenance_fee_jp: true,
          admissions_breakdown_fees_other_tuition_en: true,
          admissions_breakdown_fees_other_tuition_jp: true,
          admissions_breakdown_fees_other_registration_fee_en: true,
          admissions_breakdown_fees_other_registration_fee_jp: true,
          admissions_breakdown_fees_other_maintenance_fee_en: true,
          admissions_breakdown_fees_other_maintenance_fee_jp: true,
          campus_facilities_en: true,
          campus_facilities_jp: true,
          campus_virtual_tour_en: true,
          campus_virtual_tour_jp: true,
        },
      });

      if (!school) {
        return NextResponse.json({ error: 'School not found' }, { status: 404 });
      }

      return NextResponse.json(school);
    }

    // Build the where clause for search and filters
    const whereClause: Prisma.SchoolWhereInput = {};
    const conditions: Prisma.SchoolWhereInput[] = [];

    if (search) {
      conditions.push({
        OR: [
          { name_en: { contains: search, mode: QUERY_MODE } },
          { name_jp: { contains: search, mode: QUERY_MODE } },
          { description_en: { contains: search, mode: QUERY_MODE } },
          { description_jp: { contains: search, mode: QUERY_MODE } },
        ],
      });
    }

    // Handle multiple region selections
    if (regions.length > 0 && !regions.includes('all')) {
      const regionConditions: Prisma.SchoolWhereInput[] = [];
      regions.forEach(region => {
        const cityMappings = REGION_MAPPINGS[region as keyof typeof REGION_MAPPINGS] || [];
        regionConditions.push({
          OR: [
            { region_en: { equals: region, mode: QUERY_MODE } },
            { region_jp: { equals: region, mode: QUERY_MODE } },
            ...cityMappings.map(city => ({
              OR: [
                { location_en: { contains: city, mode: QUERY_MODE } },
                { location_jp: { contains: city, mode: QUERY_MODE } },
                { address_en: { contains: city, mode: QUERY_MODE } },
                { address_jp: { contains: city, mode: QUERY_MODE } },
              ],
            })),
          ],
        });
      });
      conditions.push({ OR: regionConditions });
    }

    // Handle multiple curriculum selections
    if (curriculums.length > 0 && !curriculums.includes('all')) {
      const curriculumConditions = curriculums.map(curriculum => ({
        OR: [
          { education_curriculum_en: { contains: curriculum, mode: QUERY_MODE } },
          { education_curriculum_jp: { contains: curriculum, mode: QUERY_MODE } },
        ],
      }));
      conditions.push({ OR: curriculumConditions });
    }

    if (conditions.length > 0) {
      whereClause.AND = conditions;
    }

    // Get total count first
    const total = await prisma.school.count({
      where: whereClause,
    });

    // Then get schools with distinct selection
    const schools = await prisma.school.findMany({
      where: whereClause,
      distinct: ['school_id'],
      take: limit,
      skip,
      orderBy: {
        name_en: 'asc',
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
        url_jp: true,
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
        education_academic_support_en: true,
        education_academic_support_jp: true,
        education_extracurricular_activities_en: true,
        education_extracurricular_activities_jp: true,
        admissions_acceptance_policy_en: true,
        admissions_acceptance_policy_jp: true,
        admissions_application_guidelines_en: true,
        admissions_application_guidelines_jp: true,
        admissions_fees_en: true,
        admissions_fees_jp: true,
        admissions_age_requirements_en: true,
        admissions_age_requirements_jp: true,
        admissions_language_requirements_students_en: true,
        admissions_language_requirements_students_jp: true,
        admissions_language_requirements_parents_en: true,
        admissions_language_requirements_parents_jp: true,
        admissions_procedure_en: true,
        admissions_procedure_jp: true,
        admissions_breakdown_fees_application_fee_en: true,
        admissions_breakdown_fees_application_fee_jp: true,
        admissions_breakdown_fees_day_care_fee_tuition_en: true,
        admissions_breakdown_fees_day_care_fee_tuition_jp: true,
        admissions_breakdown_fees_day_care_fee_registration_fee_en: true,
        admissions_breakdown_fees_day_care_fee_registration_fee_jp: true,
        admissions_breakdown_fees_day_care_fee_maintenance_fee_en: true,
        admissions_breakdown_fees_day_care_fee_maintenance_fee_jp: true,
        admissions_breakdown_fees_kindergarten_tuition_en: true,
        admissions_breakdown_fees_kindergarten_tuition_jp: true,
        admissions_breakdown_fees_kindergarten_registration_fee_en: true,
        admissions_breakdown_fees_kindergarten_registration_fee_jp: true,
        admissions_breakdown_fees_kindergarten_maintenance_fee_en: true,
        admissions_breakdown_fees_kindergarten_maintenance_fee_jp: true,
        admissions_breakdown_fees_grade_elementary_tuition_en: true,
        admissions_breakdown_fees_grade_elementary_tuition_jp: true,
        admissions_breakdown_fees_grade_elementary_registration_fee_en: true,
        admissions_breakdown_fees_grade_elementary_registration_fee_jp: true,
        admissions_breakdown_fees_grade_elementary_maintenance_fee_en: true,
        admissions_breakdown_fees_grade_elementary_maintenance_fee_jp: true,
        admissions_breakdown_fees_grade_junior_high_tuition_en: true,
        admissions_breakdown_fees_grade_junior_high_tuition_jp: true,
        admissions_breakdown_fees_grade_junior_high_registration_fee_en: true,
        admissions_breakdown_fees_grade_junior_high_registration_fee_jp: true,
        admissions_breakdown_fees_grade_junior_high_maintenance_fee_en: true,
        admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp: true,
        admissions_breakdown_fees_grade_high_school_tuition_en: true,
        admissions_breakdown_fees_grade_high_school_tuition_jp: true,
        admissions_breakdown_fees_grade_high_school_registration_fee_en: true,
        admissions_breakdown_fees_grade_high_school_registration_fee_jp: true,
        admissions_breakdown_fees_grade_high_school_maintenance_fee_en: true,
        admissions_breakdown_fees_grade_high_school_maintenance_fee_jp: true,
        admissions_breakdown_fees_summer_school_tuition_en: true,
        admissions_breakdown_fees_summer_school_tuition_jp: true,
        admissions_breakdown_fees_summer_school_registration_fee_en: true,
        admissions_breakdown_fees_summer_school_registration_fee_jp: true,
        admissions_breakdown_fees_summer_school_maintenance_fee_en: true,
        admissions_breakdown_fees_summer_school_maintenance_fee_jp: true,
        admissions_breakdown_fees_other_tuition_en: true,
        admissions_breakdown_fees_other_tuition_jp: true,
        admissions_breakdown_fees_other_registration_fee_en: true,
        admissions_breakdown_fees_other_registration_fee_jp: true,
        admissions_breakdown_fees_other_maintenance_fee_en: true,
        admissions_breakdown_fees_other_maintenance_fee_jp: true,
        campus_facilities_en: true,
        campus_facilities_jp: true,
        campus_virtual_tour_en: true,
        campus_virtual_tour_jp: true,
      },
    });

    // Filter out any potential duplicates
    const uniqueSchools = Array.from(
      new Map(schools.map(school => [school.school_id, school])).values()
    );

    // Calculate if there are more schools to load
    const hasMore = skip + uniqueSchools.length < total;

    return NextResponse.json({
      schools: uniqueSchools,
      pagination: {
        total,
        currentPage: page,
        perPage: limit,
        hasMore,
      },
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/schools:', error);
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 });
  }
}
