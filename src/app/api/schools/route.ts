import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define region mappings similar to the list page
const REGION_MAPPINGS = {
  'Tokyo': ['Tokyo', '東京', 'Shibuya', '渋谷', 'Shinjuku', '新宿', 'Minato', '港区'],
  'Kansai': ['Kyoto', 'Osaka', 'Kobe', '京都', '大阪', '神戸'],
  'Aichi': ['Nagoya', '名古屋'],
  'Ibaraki': ['Tsukuba', 'つくば'],
  'Nagano': ['Nagano', '長野', 'Karuizawa', '軽井沢'],
  'Hokkaido': ['Sapporo', '札幌', 'Niseko', 'ニセコ'],
  'Okinawa': ['Naha', '那覇', 'Okinawa', '沖縄'],
  'Miyagi': ['Sendai', '仙台'],
  'Hiroshima': ['Hiroshima', '広島'],
  'Fukuoka': ['Fukuoka', '福岡', 'Hakata', '博多'],
  'Iwate': ['Appi Kogen', '安比高原', 'Morioka', '盛岡'],
  'Yamanashi': ['Kofu', '甲府']
};

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

    // Build the where clause for search and filters
    const whereClause: any = {};
    const conditions = [];

    if (search) {
      conditions.push({
        OR: [
          { name_en: { contains: search, mode: 'insensitive' as const } },
          { name_jp: { contains: search, mode: 'insensitive' as const } },
          { description_en: { contains: search, mode: 'insensitive' as const } },
          { description_jp: { contains: search, mode: 'insensitive' as const } }
        ]
      });
    }

    // Handle multiple region selections
    if (regions.length > 0 && !regions.includes('all')) {
      const regionConditions = regions.map(region => {
        const cityMappings = REGION_MAPPINGS[region as keyof typeof REGION_MAPPINGS] || [];
        return [
          { region_en: { equals: region, mode: 'insensitive' as const } },
          { region_jp: { equals: region, mode: 'insensitive' as const } },
          ...cityMappings.map(city => ([
            { location_en: { contains: city, mode: 'insensitive' as const } },
            { location_jp: { contains: city, mode: 'insensitive' as const } },
            { address_en: { contains: city, mode: 'insensitive' as const } },
            { address_jp: { contains: city, mode: 'insensitive' as const } }
          ])).flat()
        ];
      }).flat();

      conditions.push({
        OR: regionConditions
      });
    }

    // Handle multiple curriculum selections
    if (curriculums.length > 0 && !curriculums.includes('all')) {
      const curriculumConditions = curriculums.map(curriculum => ([
        { education_curriculum_en: { contains: curriculum, mode: 'insensitive' as const } },
        { education_curriculum_jp: { contains: curriculum, mode: 'insensitive' as const } }
      ])).flat();

      conditions.push({
        OR: curriculumConditions
      });
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
