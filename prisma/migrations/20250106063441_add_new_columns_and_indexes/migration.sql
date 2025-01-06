/*
  Warnings:

  - A unique constraint covering the columns `[site_id]` on the table `School` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `admissions_acceptance_policy_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_acceptance_policy_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_age_requirements_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_age_requirements_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_application_guidelines_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_application_guidelines_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_application_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_application_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_day_care_fee_maintenance_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_day_care_fee_maintenance_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_day_care_fee_registration_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_day_care_fee_registration_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_day_care_fee_tuition_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_day_care_fee_tuition_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_elementary_maintenance_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_elementary_maintenance_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_elementary_registration_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_elementary_registration_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_elementary_tuition_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_elementary_tuition_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_high_school_maintenance_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_high_school_maintenance_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_high_school_registration_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_high_school_registration_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_high_school_tuition_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_high_school_tuition_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_junior_high_maintenance_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_junior_high_registration_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_junior_high_registration_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_junior_high_tuition_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_grade_junior_high_tuition_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_kindergarten_maintenance_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_kindergarten_maintenance_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_kindergarten_registration_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_kindergarten_registration_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_kindergarten_tuition_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_kindergarten_tuition_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_other_maintenance_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_other_maintenance_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_other_registration_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_other_registration_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_other_tuition_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_other_tuition_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_summer_school_maintenance_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_summer_school_maintenance_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_summer_school_registration_fee_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_summer_school_registration_fee_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_summer_school_tuition_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_breakdown_fees_summer_school_tuition_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_fees_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_fees_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_language_requirements_parents_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_language_requirements_parents_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_language_requirements_students_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_language_requirements_students_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_procedure_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissions_procedure_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campus_virtual_tour_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campus_virtual_tour_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `education_curriculum_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `education_curriculum_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employment_application_process_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employment_application_process_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_id` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logo_id` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `policies_privacy_policy_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `policies_privacy_policy_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `policies_terms_of_use_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `policies_terms_of_use_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_life_calendar_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_life_calendar_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_life_counseling_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_life_counseling_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_life_library_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_life_library_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_life_tour_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `student_life_tour_jp` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_en` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_jp` to the `School` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "School" ADD COLUMN     "accreditation_en" TEXT[],
ADD COLUMN     "accreditation_jp" TEXT[],
ADD COLUMN     "admissions_acceptance_policy_en" TEXT NOT NULL,
ADD COLUMN     "admissions_acceptance_policy_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_age_requirements_en" TEXT NOT NULL,
ADD COLUMN     "admissions_age_requirements_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_application_guidelines_en" TEXT NOT NULL,
ADD COLUMN     "admissions_application_guidelines_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_application_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_application_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_day_care_fee_maintenance_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_day_care_fee_maintenance_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_day_care_fee_registration_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_day_care_fee_registration_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_day_care_fee_tuition_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_day_care_fee_tuition_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_elementary_maintenance_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_elementary_maintenance_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_elementary_registration_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_elementary_registration_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_elementary_tuition_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_elementary_tuition_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_high_school_maintenance_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_high_school_maintenance_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_high_school_registration_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_high_school_registration_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_high_school_tuition_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_high_school_tuition_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_junior_high_maintenance_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_junior_high_registration_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_junior_high_registration_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_junior_high_tuition_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_grade_junior_high_tuition_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_kindergarten_maintenance_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_kindergarten_maintenance_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_kindergarten_registration_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_kindergarten_registration_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_kindergarten_tuition_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_kindergarten_tuition_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_other_maintenance_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_other_maintenance_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_other_registration_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_other_registration_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_other_tuition_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_other_tuition_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_summer_school_maintenance_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_summer_school_maintenance_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_summer_school_registration_fee_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_summer_school_registration_fee_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_summer_school_tuition_en" TEXT NOT NULL,
ADD COLUMN     "admissions_breakdown_fees_summer_school_tuition_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_fees_en" TEXT NOT NULL,
ADD COLUMN     "admissions_fees_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_language_requirements_parents_en" TEXT NOT NULL,
ADD COLUMN     "admissions_language_requirements_parents_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_language_requirements_students_en" TEXT NOT NULL,
ADD COLUMN     "admissions_language_requirements_students_jp" TEXT NOT NULL,
ADD COLUMN     "admissions_procedure_en" TEXT NOT NULL,
ADD COLUMN     "admissions_procedure_jp" TEXT NOT NULL,
ADD COLUMN     "affiliations_en" TEXT[],
ADD COLUMN     "affiliations_jp" TEXT[],
ADD COLUMN     "campus_facilities_en" TEXT[],
ADD COLUMN     "campus_facilities_jp" TEXT[],
ADD COLUMN     "campus_virtual_tour_en" TEXT NOT NULL,
ADD COLUMN     "campus_virtual_tour_jp" TEXT NOT NULL,
ADD COLUMN     "education_academic_support_en" TEXT[],
ADD COLUMN     "education_academic_support_jp" TEXT[],
ADD COLUMN     "education_curriculum_en" TEXT NOT NULL,
ADD COLUMN     "education_curriculum_jp" TEXT NOT NULL,
ADD COLUMN     "education_extracurricular_activities_en" TEXT[],
ADD COLUMN     "education_extracurricular_activities_jp" TEXT[],
ADD COLUMN     "education_programs_offered_en" TEXT[],
ADD COLUMN     "education_programs_offered_jp" TEXT[],
ADD COLUMN     "employment_application_process_en" TEXT NOT NULL,
ADD COLUMN     "employment_application_process_jp" TEXT NOT NULL,
ADD COLUMN     "employment_open_positions_en" TEXT[],
ADD COLUMN     "employment_open_positions_jp" TEXT[],
ADD COLUMN     "events_en" TEXT[],
ADD COLUMN     "events_jp" TEXT[],
ADD COLUMN     "image_id" TEXT NOT NULL,
ADD COLUMN     "logo_id" TEXT NOT NULL,
ADD COLUMN     "policies_privacy_policy_en" TEXT NOT NULL,
ADD COLUMN     "policies_privacy_policy_jp" TEXT NOT NULL,
ADD COLUMN     "policies_terms_of_use_en" TEXT NOT NULL,
ADD COLUMN     "policies_terms_of_use_jp" TEXT NOT NULL,
ADD COLUMN     "staff_board_members_en" TEXT[],
ADD COLUMN     "staff_board_members_jp" TEXT[],
ADD COLUMN     "staff_staff_list_en" TEXT[],
ADD COLUMN     "staff_staff_list_jp" TEXT[],
ADD COLUMN     "student_life_calendar_en" TEXT NOT NULL,
ADD COLUMN     "student_life_calendar_jp" TEXT NOT NULL,
ADD COLUMN     "student_life_counseling_en" TEXT NOT NULL,
ADD COLUMN     "student_life_counseling_jp" TEXT NOT NULL,
ADD COLUMN     "student_life_library_en" TEXT NOT NULL,
ADD COLUMN     "student_life_library_jp" TEXT NOT NULL,
ADD COLUMN     "student_life_support_services_en" TEXT[],
ADD COLUMN     "student_life_support_services_jp" TEXT[],
ADD COLUMN     "student_life_tour_en" TEXT NOT NULL,
ADD COLUMN     "student_life_tour_jp" TEXT NOT NULL,
ADD COLUMN     "url_en" TEXT NOT NULL,
ADD COLUMN     "url_jp" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "School_site_id_key" ON "School"("site_id");

-- CreateIndex
CREATE INDEX "idx_school_name" ON "School"("name_en", "name_jp");

-- CreateIndex
CREATE INDEX "idx_school_location" ON "School"("location_en", "location_jp");

-- CreateIndex
CREATE INDEX "idx_school_email" ON "School"("email_en", "email_jp");

-- CreateIndex
CREATE INDEX "idx_school_phone" ON "School"("phone_en", "phone_jp");

-- CreateIndex
CREATE INDEX "idx_school_timestamps" ON "School"("created_at", "updated_at");

-- CreateIndex
CREATE INDEX "idx_school_url" ON "School"("url_en", "url_jp");

-- CreateIndex
CREATE INDEX "idx_school_logo" ON "School"("logo_id");

-- CreateIndex
CREATE INDEX "idx_school_image" ON "School"("image_id");
