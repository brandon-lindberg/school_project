import { PrismaClient } from '@prisma/client';
import schoolsData from '../normalized_japanese_schools.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  for (const school of schoolsData) {
    try {
      await prisma.school.create({
        data: {
          site_id: school.site_id,
          name_en: school.name_en || null,
          name_jp: school.name_jp || null,
          location_en: school.location_en || null,
          location_jp: school.location_jp || null,
          phone_en: school.phone_en || null,
          phone_jp: school.phone_jp || null,
          email_en: school.email_en || null,
          email_jp: school.email_jp || null,
          address_en: school.address_en || null,
          address_jp: school.address_jp || null,
          curriculum_en: school.curriculum_en || null,
          curriculum_jp: school.curriculum_jp || null,
          structured_data: school.structured_data || {},
          url_en: school.url_en || null,
          url_jp: school.url_jp || null,
          logo_id: school.logo_id || null,
          image_id: school.image_id || null,
          affiliations_en: school.affiliations_en || [],
          affiliations_jp: school.affiliations_jp || [],
          accreditation_en: school.accreditation_en || [],
          accreditation_jp: school.accreditation_jp || [],
          education_programs_offered_en: school.education_programs_offered_en || [],
          education_programs_offered_jp: school.education_programs_offered_jp || [],
          education_curriculum_en: school.education_curriculum_en || null,
          education_curriculum_jp: school.education_curriculum_jp || null,
          education_academic_support_en: school.education_academic_support_en || [],
          education_academic_support_jp: school.education_academic_support_jp || [],
          education_extracurricular_activities_en: school.education_extracurricular_activities_en || [],
          education_extracurricular_activities_jp: school.education_extracurricular_activities_jp || [],
          events_en: school.events_en || [],
          events_jp: school.events_jp || [],
          campus_facilities_en: school.campus_facilities_en || [],
          campus_facilities_jp: school.campus_facilities_jp || [],
          campus_virtual_tour_en: school.campus_virtual_tour_en || null,
          campus_virtual_tour_jp: school.campus_virtual_tour_jp || null,
          student_life_counseling_en: school.student_life_counseling_en || null,
          student_life_counseling_jp: school.student_life_counseling_jp || null,
          student_life_support_services_en: school.student_life_support_services_en || [],
          student_life_support_services_jp: school.student_life_support_services_jp || [],
          student_life_library_en: school.student_life_library_en || null,
          student_life_library_jp: school.student_life_library_jp || null,
          student_life_calendar_en: school.student_life_calendar_en || null,
          student_life_calendar_jp: school.student_life_calendar_jp || null,
          student_life_tour_en: school.student_life_tour_en || null,
          student_life_tour_jp: school.student_life_tour_jp || null,
          employment_open_positions_en: school.employment_open_positions_en || [],
          employment_open_positions_jp: school.employment_open_positions_jp || [],
          employment_application_process_en: school.employment_application_process_en || null,
          employment_application_process_jp: school.employment_application_process_jp || null,
          policies_privacy_policy_en: school.policies_privacy_policy_en || null,
          policies_privacy_policy_jp: school.policies_privacy_policy_jp || null,
          policies_terms_of_use_en: school.policies_terms_of_use_en || null,
          policies_terms_of_use_jp: school.policies_terms_of_use_jp || null,
          staff_staff_list_en: school.staff_staff_list_en || [],
          staff_staff_list_jp: school.staff_staff_list_jp || [],
          staff_board_members_en: school.staff_board_members_en || [],
          staff_board_members_jp: school.staff_board_members_jp || [],
          short_description_en: school.short_description_en || null,
          short_description_jp: school.short_description_jp || null,
          description_en: school.description_en || null,
          description_jp: school.description_jp || null,
          country_en: school.country_en || null,
          country_jp: school.country_jp || null,
          region_en: school.region_en || null,
          region_jp: school.region_jp || null,
          geography_en: school.geography_en || null,
          geography_jp: school.geography_jp || null
        }
      });
      console.log(`Created school: ${school.name_jp || school.name_en}`);
    } catch (error) {
      console.error(`Error creating school ${school.name_jp || school.name_en}:`, error);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
