// src/seeder.ts
import fs from 'fs';
import { PrismaClient, Prisma } from '@prisma/client';
import schoolsData from '../normalized_japanese_schools.json';
import { School } from '../src/types/school';

const prisma = new PrismaClient();

interface StructuredData {
  [key: string]: {
    [key: string]: unknown;
  };
}

function isStructuredData(data: unknown): data is StructuredData {
  return typeof data === 'object' && data !== null;
}

function isJsonObject(value: unknown): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractFromStructuredData(data: School, section: string, field: string): string | null {
  try {
    const structuredData = data.structured_data as Record<string, Prisma.JsonValue>;
    const sectionData = structuredData[section] as Record<string, Prisma.JsonValue>;
    const value = sectionData?.[field];
    if (value == null) return null;
    return String(value);
  } catch {
    return null;
  }
}

function extractArrayFromStructuredData(data: School, section: string): string[] {
  try {
    const structuredData = data.structured_data as Record<string, Prisma.JsonValue>;
    const sectionData = structuredData[section] as Record<string, Prisma.JsonValue>;
    if (!sectionData) return [];
    return Object.entries(sectionData)
      .filter(([_, value]) => value && typeof value === 'string')
      .map(([key, value]) => `${key}: ${value}`)
      .filter((value): value is string => value !== null);
  } catch {
    return [];
  }
}

async function main() {
  console.log('Starting database seed...');

  try {
    // Check if schools already exist
    const existingSchools = await prisma.school.count();
    console.log(`Found ${existingSchools} existing schools`);

    // Type assertion to ensure TypeScript treats schoolsData as SchoolData[]
    const schools: School[] = (schoolsData as unknown) as School[];
    console.log(`Found ${schools.length} schools in data file`);

    // Create schools that don't exist yet
    for (const schoolData of schools) {
      try {
        // Check if school already exists by site_id
        const existingSchool = await prisma.school.findUnique({
          where: { site_id: schoolData.site_id }
        });

        if (existingSchool) {
          console.log(`School already exists: ${schoolData.name_jp || schoolData.name_en}`);
          continue;
        }

        const admissionProcedures = [
          extractFromStructuredData(schoolData, 'Admissions', 'Entry evaluation for students'),
          extractFromStructuredData(schoolData, 'Admissions', 'Brief description of entry evaluation required'),
          extractFromStructuredData(schoolData, 'Admissions', 'Deadline for registration (new academic year)'),
          extractFromStructuredData(schoolData, 'Admissions', 'Students can join after academic year begins')
        ].filter(Boolean).join('\n');

        const schoolInput = {
          site_id: schoolData.site_id,
          name_en: schoolData.name_en || null,
          name_jp: schoolData.name_jp || null,
          location_en: schoolData.location_en || null,
          location_jp: schoolData.location_jp || null,
          phone_en: schoolData.phone_en || null,
          phone_jp: schoolData.phone_jp || null,
          email_en: schoolData.email_en || null,
          email_jp: schoolData.email_jp || null,
          address_en: schoolData.address_en || null,
          address_jp: schoolData.address_jp || null,
          curriculum_en: schoolData.curriculum_en || extractFromStructuredData(schoolData, 'About the school', 'Teaching approach of the school') || null,
          curriculum_jp: schoolData.curriculum_jp || null,
          structured_data: schoolData.structured_data || {},
          url_en: schoolData.url_en || null,
          url_jp: schoolData.url_jp || null,
          logo_id: schoolData.logo_id || null,
          image_id: schoolData.image_id || null,
          affiliations_en: schoolData.affiliations_en || [],
          affiliations_jp: schoolData.affiliations_jp || [],
          accreditation_en: schoolData.accreditation_en || [],
          accreditation_jp: schoolData.accreditation_jp || [],
          education_programs_offered_en: extractArrayFromStructuredData(schoolData, 'Academics'),
          education_programs_offered_jp: [],
          education_curriculum_en: schoolData.education_curriculum_en || extractFromStructuredData(schoolData, 'About the school', 'Teaching approach of the school') || null,
          education_curriculum_jp: schoolData.education_curriculum_jp || null,
          education_academic_support_en: schoolData.education_academic_support_en || [],
          education_academic_support_jp: schoolData.education_academic_support_jp || [],
          education_extracurricular_activities_en: schoolData.education_extracurricular_activities_en || [],
          education_extracurricular_activities_jp: schoolData.education_extracurricular_activities_jp || [],
          admissions_acceptance_policy_en: schoolData.admissions_acceptance_policy_en || admissionProcedures || null,
          admissions_acceptance_policy_jp: schoolData.admissions_acceptance_policy_jp || null,
          admissions_application_guidelines_en: schoolData.admissions_application_guidelines_en || extractFromStructuredData(schoolData, 'Admissions', 'Entry evaluation for students') || null,
          admissions_application_guidelines_jp: schoolData.admissions_application_guidelines_jp || null,
          admissions_age_requirements_en: schoolData.admissions_age_requirements_en || extractFromStructuredData(schoolData, 'Admissions', 'Age requirements') || null,
          admissions_age_requirements_jp: schoolData.admissions_age_requirements_jp || null,
          admissions_fees_en: schoolData.admissions_fees_en || extractFromStructuredData(schoolData, 'School day', 'School provided lunches') || null,
          admissions_fees_jp: schoolData.admissions_fees_jp || null,
          admissions_breakdown_fees_application_fee_en: schoolData.admissions_breakdown_fees_application_fee_en || null,
          admissions_breakdown_fees_application_fee_jp: schoolData.admissions_breakdown_fees_application_fee_jp || null,
          admissions_breakdown_fees_day_care_fee_tuition_en: schoolData.admissions_breakdown_fees_day_care_fee_tuition_en || null,
          admissions_breakdown_fees_day_care_fee_tuition_jp: schoolData.admissions_breakdown_fees_day_care_fee_tuition_jp || null,
          admissions_breakdown_fees_day_care_fee_registration_fee_en: schoolData.admissions_breakdown_fees_day_care_fee_registration_fee_en || null,
          admissions_breakdown_fees_day_care_fee_registration_fee_jp: schoolData.admissions_breakdown_fees_day_care_fee_registration_fee_jp || null,
          admissions_breakdown_fees_day_care_fee_maintenance_fee_en: schoolData.admissions_breakdown_fees_day_care_fee_maintenance_fee_en || null,
          admissions_breakdown_fees_day_care_fee_maintenance_fee_jp: schoolData.admissions_breakdown_fees_day_care_fee_maintenance_fee_jp || null,
          admissions_breakdown_fees_kindergarten_tuition_en: schoolData.admissions_breakdown_fees_kindergarten_tuition_en || null,
          admissions_breakdown_fees_kindergarten_tuition_jp: schoolData.admissions_breakdown_fees_kindergarten_tuition_jp || null,
          admissions_breakdown_fees_kindergarten_registration_fee_en: schoolData.admissions_breakdown_fees_kindergarten_registration_fee_en || null,
          admissions_breakdown_fees_kindergarten_registration_fee_jp: schoolData.admissions_breakdown_fees_kindergarten_registration_fee_jp || null,
          admissions_breakdown_fees_kindergarten_maintenance_fee_en: schoolData.admissions_breakdown_fees_kindergarten_maintenance_fee_en || null,
          admissions_breakdown_fees_kindergarten_maintenance_fee_jp: schoolData.admissions_breakdown_fees_kindergarten_maintenance_fee_jp || null,
          admissions_breakdown_fees_grade_elementary_tuition_en: schoolData.admissions_breakdown_fees_grade_elementary_tuition_en || null,
          admissions_breakdown_fees_grade_elementary_tuition_jp: schoolData.admissions_breakdown_fees_grade_elementary_tuition_jp || null,
          admissions_breakdown_fees_grade_elementary_registration_fee_en: schoolData.admissions_breakdown_fees_grade_elementary_registration_fee_en || null,
          admissions_breakdown_fees_grade_elementary_registration_fee_jp: schoolData.admissions_breakdown_fees_grade_elementary_registration_fee_jp || null,
          admissions_breakdown_fees_grade_elementary_maintenance_fee_en: schoolData.admissions_breakdown_fees_grade_elementary_maintenance_fee_en || null,
          admissions_breakdown_fees_grade_elementary_maintenance_fee_jp: schoolData.admissions_breakdown_fees_grade_elementary_maintenance_fee_jp || null,
          admissions_breakdown_fees_grade_junior_high_tuition_en: schoolData.admissions_breakdown_fees_grade_junior_high_tuition_en || null,
          admissions_breakdown_fees_grade_junior_high_tuition_jp: schoolData.admissions_breakdown_fees_grade_junior_high_tuition_jp || null,
          admissions_breakdown_fees_grade_junior_high_registration_fee_en: schoolData.admissions_breakdown_fees_grade_junior_high_registration_fee_en || null,
          admissions_breakdown_fees_grade_junior_high_registration_fee_jp: schoolData.admissions_breakdown_fees_grade_junior_high_registration_fee_jp || null,
          admissions_breakdown_fees_grade_junior_high_maintenance_fee_en: schoolData.admissions_breakdown_fees_grade_junior_high_maintenance_fee_en || null,
          admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp: schoolData.admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp || null,
          admissions_breakdown_fees_grade_high_school_tuition_en: schoolData.admissions_breakdown_fees_grade_high_school_tuition_en || null,
          admissions_breakdown_fees_grade_high_school_tuition_jp: schoolData.admissions_breakdown_fees_grade_high_school_tuition_jp || null,
          admissions_breakdown_fees_grade_high_school_registration_fee_en: schoolData.admissions_breakdown_fees_grade_high_school_registration_fee_en || null,
          admissions_breakdown_fees_grade_high_school_registration_fee_jp: schoolData.admissions_breakdown_fees_grade_high_school_registration_fee_jp || null,
          admissions_breakdown_fees_grade_high_school_maintenance_fee_en: schoolData.admissions_breakdown_fees_grade_high_school_maintenance_fee_en || null,
          admissions_breakdown_fees_grade_high_school_maintenance_fee_jp: schoolData.admissions_breakdown_fees_grade_high_school_maintenance_fee_jp || null,
          admissions_breakdown_fees_summer_school_tuition_en: schoolData.admissions_breakdown_fees_summer_school_tuition_en || null,
          admissions_breakdown_fees_summer_school_tuition_jp: schoolData.admissions_breakdown_fees_summer_school_tuition_jp || null,
          admissions_breakdown_fees_summer_school_registration_fee_en: schoolData.admissions_breakdown_fees_summer_school_registration_fee_en || null,
          admissions_breakdown_fees_summer_school_registration_fee_jp: schoolData.admissions_breakdown_fees_summer_school_registration_fee_jp || null,
          admissions_breakdown_fees_summer_school_maintenance_fee_en: schoolData.admissions_breakdown_fees_summer_school_maintenance_fee_en || null,
          admissions_breakdown_fees_summer_school_maintenance_fee_jp: schoolData.admissions_breakdown_fees_summer_school_maintenance_fee_jp || null,
          admissions_breakdown_fees_other_tuition_en: schoolData.admissions_breakdown_fees_other_tuition_en || null,
          admissions_breakdown_fees_other_tuition_jp: schoolData.admissions_breakdown_fees_other_tuition_jp || null,
          admissions_breakdown_fees_other_registration_fee_en: schoolData.admissions_breakdown_fees_other_registration_fee_en || null,
          admissions_breakdown_fees_other_registration_fee_jp: schoolData.admissions_breakdown_fees_other_registration_fee_jp || null,
          admissions_breakdown_fees_other_maintenance_fee_en: schoolData.admissions_breakdown_fees_other_maintenance_fee_en || null,
          admissions_breakdown_fees_other_maintenance_fee_jp: schoolData.admissions_breakdown_fees_other_maintenance_fee_jp || null,
          admissions_procedure_en: schoolData.admissions_procedure_en || extractFromStructuredData(schoolData, 'Admissions', 'Entry evaluation for students') || null,
          admissions_procedure_jp: schoolData.admissions_procedure_jp || null,
          admissions_language_requirements_students_en: schoolData.admissions_language_requirements_students_en || extractFromStructuredData(schoolData, 'Languages', 'Language support for students not fluent in English') || null,
          admissions_language_requirements_students_jp: schoolData.admissions_language_requirements_students_jp || null,
          admissions_language_requirements_parents_en: schoolData.admissions_language_requirements_parents_en || extractFromStructuredData(schoolData, 'Languages', 'Native English speaking teachers') || null,
          admissions_language_requirements_parents_jp: schoolData.admissions_language_requirements_parents_jp || null,
          events_en: schoolData.events_en || [],
          events_jp: schoolData.events_jp || [],
          campus_facilities_en: extractArrayFromStructuredData(schoolData, 'Facilities'),
          campus_facilities_jp: [],
          campus_virtual_tour_en: schoolData.campus_virtual_tour_en || null,
          campus_virtual_tour_jp: schoolData.campus_virtual_tour_jp || null,
          student_life_counseling_en: schoolData.student_life_counseling_en || null,
          student_life_counseling_jp: schoolData.student_life_counseling_jp || null,
          student_life_support_services_en: schoolData.student_life_support_services_en || [],
          student_life_support_services_jp: schoolData.student_life_support_services_jp || [],
          student_life_library_en: schoolData.student_life_library_en || null,
          student_life_library_jp: schoolData.student_life_library_jp || null,
          student_life_calendar_en: schoolData.student_life_calendar_en || null,
          student_life_calendar_jp: schoolData.student_life_calendar_jp || null,
          student_life_tour_en: schoolData.student_life_tour_en || null,
          student_life_tour_jp: schoolData.student_life_tour_jp || null,
          employment_open_positions_en: schoolData.employment_open_positions_en || [],
          employment_open_positions_jp: schoolData.employment_open_positions_jp || [],
          employment_application_process_en: schoolData.employment_application_process_en || null,
          employment_application_process_jp: schoolData.employment_application_process_jp || null,
          policies_privacy_policy_en: schoolData.policies_privacy_policy_en || null,
          policies_privacy_policy_jp: schoolData.policies_privacy_policy_jp || null,
          policies_terms_of_use_en: schoolData.policies_terms_of_use_en || null,
          policies_terms_of_use_jp: schoolData.policies_terms_of_use_jp || null,
          staff_staff_list_en: schoolData.staff_staff_list_en || [],
          staff_staff_list_jp: schoolData.staff_staff_list_jp || [],
          staff_board_members_en: schoolData.staff_board_members_en || [],
          staff_board_members_jp: schoolData.staff_board_members_jp || [],
          short_description_en: schoolData.short_description_en || null,
          short_description_jp: schoolData.short_description_jp || null,
          description_en: schoolData.description_en || extractFromStructuredData(schoolData, 'About the school', 'Qualities and characteristics best defining the school') || null,
          description_jp: schoolData.description_jp || null,
          country_en: schoolData.country_en || null,
          country_jp: schoolData.country_jp || null,
          region_en: schoolData.region_en || null,
          region_jp: schoolData.region_jp || null,
          geography_en: schoolData.geography_en || null,
          geography_jp: schoolData.geography_jp || null,
          is_verified: true
        };

        const createdSchool = await prisma.school.create({
          data: schoolInput,
          select: {
            school_id: true,
            name_en: true,
            name_jp: true
          }
        });
        console.log(`Created school [${createdSchool.school_id}]: ${schoolData.name_jp || schoolData.name_en}`);
      } catch (error) {
        console.error(`Error creating school ${schoolData.name_jp || schoolData.name_en}:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error('Prisma error code:', error.code);
          console.error('Prisma error message:', error.message);
        }
      }
    }

    // Verify final count
    const finalCount = await prisma.school.count();
    console.log(`Final school count: ${finalCount}`);
  } catch (error) {
    console.error('Fatal error in seed script:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Failed to seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
