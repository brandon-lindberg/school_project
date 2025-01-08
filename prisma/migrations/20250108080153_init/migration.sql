-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "family_name" TEXT,
    "first_name" TEXT,
    "phone_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "School" (
    "school_id" SERIAL NOT NULL,
    "site_id" TEXT NOT NULL,
    "name_en" TEXT,
    "name_jp" TEXT,
    "location_en" TEXT,
    "location_jp" TEXT,
    "phone_en" TEXT,
    "phone_jp" TEXT,
    "email_en" TEXT,
    "email_jp" TEXT,
    "address_en" TEXT,
    "address_jp" TEXT,
    "curriculum_en" TEXT,
    "curriculum_jp" TEXT,
    "structured_data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "url_en" TEXT,
    "url_jp" TEXT,
    "logo_id" TEXT,
    "image_id" TEXT,
    "affiliations_en" TEXT[],
    "affiliations_jp" TEXT[],
    "accreditation_en" TEXT[],
    "accreditation_jp" TEXT[],
    "education_programs_offered_en" TEXT[],
    "education_programs_offered_jp" TEXT[],
    "education_curriculum_en" TEXT,
    "education_curriculum_jp" TEXT,
    "education_academic_support_en" TEXT[],
    "education_academic_support_jp" TEXT[],
    "education_extracurricular_activities_en" TEXT[],
    "education_extracurricular_activities_jp" TEXT[],
    "admissions_acceptance_policy_en" TEXT,
    "admissions_acceptance_policy_jp" TEXT,
    "admissions_application_guidelines_en" TEXT,
    "admissions_application_guidelines_jp" TEXT,
    "admissions_age_requirements_en" TEXT,
    "admissions_age_requirements_jp" TEXT,
    "admissions_fees_en" TEXT,
    "admissions_fees_jp" TEXT,
    "admissions_breakdown_fees_application_fee_en" TEXT,
    "admissions_breakdown_fees_application_fee_jp" TEXT,
    "admissions_breakdown_fees_day_care_fee_tuition_en" TEXT,
    "admissions_breakdown_fees_day_care_fee_tuition_jp" TEXT,
    "admissions_breakdown_fees_day_care_fee_registration_fee_en" TEXT,
    "admissions_breakdown_fees_day_care_fee_registration_fee_jp" TEXT,
    "admissions_breakdown_fees_day_care_fee_maintenance_fee_en" TEXT,
    "admissions_breakdown_fees_day_care_fee_maintenance_fee_jp" TEXT,
    "admissions_breakdown_fees_kindergarten_tuition_en" TEXT,
    "admissions_breakdown_fees_kindergarten_tuition_jp" TEXT,
    "admissions_breakdown_fees_kindergarten_registration_fee_en" TEXT,
    "admissions_breakdown_fees_kindergarten_registration_fee_jp" TEXT,
    "admissions_breakdown_fees_kindergarten_maintenance_fee_en" TEXT,
    "admissions_breakdown_fees_kindergarten_maintenance_fee_jp" TEXT,
    "admissions_breakdown_fees_grade_elementary_tuition_en" TEXT,
    "admissions_breakdown_fees_grade_elementary_tuition_jp" TEXT,
    "admissions_breakdown_fees_grade_elementary_registration_fee_en" TEXT,
    "admissions_breakdown_fees_grade_elementary_registration_fee_jp" TEXT,
    "admissions_breakdown_fees_grade_elementary_maintenance_fee_en" TEXT,
    "admissions_breakdown_fees_grade_elementary_maintenance_fee_jp" TEXT,
    "admissions_breakdown_fees_grade_junior_high_tuition_en" TEXT,
    "admissions_breakdown_fees_grade_junior_high_tuition_jp" TEXT,
    "admissions_breakdown_fees_grade_junior_high_registration_fee_en" TEXT,
    "admissions_breakdown_fees_grade_junior_high_registration_fee_jp" TEXT,
    "admissions_breakdown_fees_grade_junior_high_maintenance_fee_en" TEXT,
    "admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp" TEXT,
    "admissions_breakdown_fees_grade_high_school_tuition_en" TEXT,
    "admissions_breakdown_fees_grade_high_school_tuition_jp" TEXT,
    "admissions_breakdown_fees_grade_high_school_registration_fee_en" TEXT,
    "admissions_breakdown_fees_grade_high_school_registration_fee_jp" TEXT,
    "admissions_breakdown_fees_grade_high_school_maintenance_fee_en" TEXT,
    "admissions_breakdown_fees_grade_high_school_maintenance_fee_jp" TEXT,
    "admissions_breakdown_fees_summer_school_tuition_en" TEXT,
    "admissions_breakdown_fees_summer_school_tuition_jp" TEXT,
    "admissions_breakdown_fees_summer_school_registration_fee_en" TEXT,
    "admissions_breakdown_fees_summer_school_registration_fee_jp" TEXT,
    "admissions_breakdown_fees_summer_school_maintenance_fee_en" TEXT,
    "admissions_breakdown_fees_summer_school_maintenance_fee_jp" TEXT,
    "admissions_breakdown_fees_other_tuition_en" TEXT,
    "admissions_breakdown_fees_other_tuition_jp" TEXT,
    "admissions_breakdown_fees_other_registration_fee_en" TEXT,
    "admissions_breakdown_fees_other_registration_fee_jp" TEXT,
    "admissions_breakdown_fees_other_maintenance_fee_en" TEXT,
    "admissions_breakdown_fees_other_maintenance_fee_jp" TEXT,
    "admissions_procedure_en" TEXT,
    "admissions_procedure_jp" TEXT,
    "admissions_language_requirements_students_en" TEXT,
    "admissions_language_requirements_students_jp" TEXT,
    "admissions_language_requirements_parents_en" TEXT,
    "admissions_language_requirements_parents_jp" TEXT,
    "events_en" TEXT[],
    "events_jp" TEXT[],
    "campus_facilities_en" TEXT[],
    "campus_facilities_jp" TEXT[],
    "campus_virtual_tour_en" TEXT,
    "campus_virtual_tour_jp" TEXT,
    "student_life_counseling_en" TEXT,
    "student_life_counseling_jp" TEXT,
    "student_life_support_services_en" TEXT[],
    "student_life_support_services_jp" TEXT[],
    "student_life_library_en" TEXT,
    "student_life_library_jp" TEXT,
    "student_life_calendar_en" TEXT,
    "student_life_calendar_jp" TEXT,
    "student_life_tour_en" TEXT,
    "student_life_tour_jp" TEXT,
    "employment_open_positions_en" TEXT[],
    "employment_open_positions_jp" TEXT[],
    "employment_application_process_en" TEXT,
    "employment_application_process_jp" TEXT,
    "policies_privacy_policy_en" TEXT,
    "policies_privacy_policy_jp" TEXT,
    "policies_terms_of_use_en" TEXT,
    "policies_terms_of_use_jp" TEXT,
    "staff_staff_list_en" TEXT[],
    "staff_staff_list_jp" TEXT[],
    "staff_board_members_en" TEXT[],
    "staff_board_members_jp" TEXT[],
    "short_description_en" TEXT,
    "short_description_jp" TEXT,
    "description_en" TEXT,
    "description_jp" TEXT,
    "country_en" TEXT,
    "country_jp" TEXT,
    "region_en" TEXT,
    "region_jp" TEXT,
    "geography_en" TEXT,
    "geography_jp" TEXT,

    CONSTRAINT "School_pkey" PRIMARY KEY ("school_id")
);

-- CreateTable
CREATE TABLE "UserList" (
    "list_id" SERIAL NOT NULL,
    "list_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "UserList_pkey" PRIMARY KEY ("list_id")
);

-- CreateTable
CREATE TABLE "UserListSchools" (
    "list_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,

    CONSTRAINT "UserListSchools_pkey" PRIMARY KEY ("list_id","school_id")
);

-- CreateTable
CREATE TABLE "BrowsingHistory" (
    "history_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrowsingHistory_pkey" PRIMARY KEY ("history_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

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

-- CreateIndex
CREATE INDEX "idx_school_country" ON "School"("country_en", "country_jp");

-- CreateIndex
CREATE INDEX "idx_school_region" ON "School"("region_en", "region_jp");

-- CreateIndex
CREATE INDEX "idx_school_geography" ON "School"("geography_en", "geography_jp");

-- CreateIndex
CREATE INDEX "idx_browsing_history_user_school" ON "BrowsingHistory"("user_id", "school_id");

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListSchools" ADD CONSTRAINT "UserListSchools_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "UserList"("list_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListSchools" ADD CONSTRAINT "UserListSchools_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrowsingHistory" ADD CONSTRAINT "BrowsingHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrowsingHistory" ADD CONSTRAINT "BrowsingHistory_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
