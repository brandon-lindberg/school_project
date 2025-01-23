import { useState } from 'react';
import { School } from '@/types/school';
import { Language } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';

interface SchoolEditFormProps {
  school: School;
  translations: Translations;
  language: Language;
  onSave: (data: Partial<School>) => Promise<void>;
  onCancel: () => void;
  section:
  | 'basic'
  | 'education'
  | 'admissions'
  | 'campus'
  | 'studentLife'
  | 'employment'
  | 'policies';
}

type SchoolEditableFields = Omit<
  School,
  'school_id' | 'created_at' | 'updated_at' | 'structured_data' | 'logo_id' | 'image_id'
>;

type FormData = {
  [K in keyof SchoolEditableFields]: NonNullable<SchoolEditableFields[K]>;
};

export function SchoolEditForm({
  school,
  language,
  onSave,
  onCancel,
  section,
}: SchoolEditFormProps) {
  const [formData, setFormData] = useState<FormData>(() => {
    const initialData: Partial<FormData> = {
      // Basic Information
      name_en: school.name_en ?? '',
      name_jp: school.name_jp ?? '',
      short_description_en: school.short_description_en ?? '',
      short_description_jp: school.short_description_jp ?? '',
      description_en: school.description_en ?? '',
      description_jp: school.description_jp ?? '',
      location_en: school.location_en ?? '',
      location_jp: school.location_jp ?? '',
      address_en: school.address_en ?? '',
      address_jp: school.address_jp ?? '',
      region_en: school.region_en ?? '',
      region_jp: school.region_jp ?? '',
      country_en: school.country_en ?? '',
      country_jp: school.country_jp ?? '',
      geography_en: school.geography_en ?? '',
      geography_jp: school.geography_jp ?? '',
      phone_en: school.phone_en ?? '',
      phone_jp: school.phone_jp ?? '',
      email_en: school.email_en ?? '',
      email_jp: school.email_jp ?? '',
      url_en: school.url_en ?? '',
      url_jp: school.url_jp ?? '',

      // Education Information
      education_programs_offered_en: school.education_programs_offered_en ?? [],
      education_programs_offered_jp: school.education_programs_offered_jp ?? [],
      education_curriculum_en: school.education_curriculum_en ?? '',
      education_curriculum_jp: school.education_curriculum_jp ?? '',
      education_academic_support_en: school.education_academic_support_en ?? [],
      education_academic_support_jp: school.education_academic_support_jp ?? [],
      education_extracurricular_activities_en: school.education_extracurricular_activities_en ?? [],
      education_extracurricular_activities_jp: school.education_extracurricular_activities_jp ?? [],
      curriculum_en: school.curriculum_en ?? '',
      curriculum_jp: school.curriculum_jp ?? '',

      // Admissions Information
      admissions_acceptance_policy_en: school.admissions_acceptance_policy_en ?? '',
      admissions_acceptance_policy_jp: school.admissions_acceptance_policy_jp ?? '',
      admissions_application_guidelines_en: school.admissions_application_guidelines_en ?? '',
      admissions_application_guidelines_jp: school.admissions_application_guidelines_jp ?? '',
      admissions_age_requirements_en: school.admissions_age_requirements_en ?? '',
      admissions_age_requirements_jp: school.admissions_age_requirements_jp ?? '',
      admissions_fees_en: school.admissions_fees_en ?? '',
      admissions_fees_jp: school.admissions_fees_jp ?? '',
      admissions_procedure_en: school.admissions_procedure_en ?? '',
      admissions_procedure_jp: school.admissions_procedure_jp ?? '',
      admissions_language_requirements_students_en:
        school.admissions_language_requirements_students_en ?? '',
      admissions_language_requirements_students_jp:
        school.admissions_language_requirements_students_jp ?? '',
      admissions_language_requirements_parents_en:
        school.admissions_language_requirements_parents_en ?? '',
      admissions_language_requirements_parents_jp:
        school.admissions_language_requirements_parents_jp ?? '',
      // Fees breakdown fields
      admissions_breakdown_fees_application_fee_en:
        school.admissions_breakdown_fees_application_fee_en ?? '',
      admissions_breakdown_fees_application_fee_jp:
        school.admissions_breakdown_fees_application_fee_jp ?? '',
      admissions_breakdown_fees_day_care_fee_tuition_en:
        school.admissions_breakdown_fees_day_care_fee_tuition_en ?? '',
      admissions_breakdown_fees_day_care_fee_tuition_jp:
        school.admissions_breakdown_fees_day_care_fee_tuition_jp ?? '',
      admissions_breakdown_fees_day_care_fee_registration_fee_en:
        school.admissions_breakdown_fees_day_care_fee_registration_fee_en ?? '',
      admissions_breakdown_fees_day_care_fee_registration_fee_jp:
        school.admissions_breakdown_fees_day_care_fee_registration_fee_jp ?? '',
      admissions_breakdown_fees_day_care_fee_maintenance_fee_en:
        school.admissions_breakdown_fees_day_care_fee_maintenance_fee_en ?? '',
      admissions_breakdown_fees_day_care_fee_maintenance_fee_jp:
        school.admissions_breakdown_fees_day_care_fee_maintenance_fee_jp ?? '',
      admissions_breakdown_fees_kindergarten_tuition_en:
        school.admissions_breakdown_fees_kindergarten_tuition_en ?? '',
      admissions_breakdown_fees_kindergarten_tuition_jp:
        school.admissions_breakdown_fees_kindergarten_tuition_jp ?? '',
      admissions_breakdown_fees_kindergarten_registration_fee_en:
        school.admissions_breakdown_fees_kindergarten_registration_fee_en ?? '',
      admissions_breakdown_fees_kindergarten_registration_fee_jp:
        school.admissions_breakdown_fees_kindergarten_registration_fee_jp ?? '',
      admissions_breakdown_fees_kindergarten_maintenance_fee_en:
        school.admissions_breakdown_fees_kindergarten_maintenance_fee_en ?? '',
      admissions_breakdown_fees_kindergarten_maintenance_fee_jp:
        school.admissions_breakdown_fees_kindergarten_maintenance_fee_jp ?? '',
      admissions_breakdown_fees_grade_elementary_tuition_en:
        school.admissions_breakdown_fees_grade_elementary_tuition_en ?? '',
      admissions_breakdown_fees_grade_elementary_tuition_jp:
        school.admissions_breakdown_fees_grade_elementary_tuition_jp ?? '',
      admissions_breakdown_fees_grade_elementary_registration_fee_en:
        school.admissions_breakdown_fees_grade_elementary_registration_fee_en ?? '',
      admissions_breakdown_fees_grade_elementary_registration_fee_jp:
        school.admissions_breakdown_fees_grade_elementary_registration_fee_jp ?? '',
      admissions_breakdown_fees_grade_elementary_maintenance_fee_en:
        school.admissions_breakdown_fees_grade_elementary_maintenance_fee_en ?? '',
      admissions_breakdown_fees_grade_elementary_maintenance_fee_jp:
        school.admissions_breakdown_fees_grade_elementary_maintenance_fee_jp ?? '',
      admissions_breakdown_fees_grade_high_school_tuition_en:
        school.admissions_breakdown_fees_grade_high_school_tuition_en ?? '',
      admissions_breakdown_fees_grade_high_school_tuition_jp:
        school.admissions_breakdown_fees_grade_high_school_tuition_jp ?? '',
      admissions_breakdown_fees_grade_high_school_registration_fee_en:
        school.admissions_breakdown_fees_grade_high_school_registration_fee_en ?? '',
      admissions_breakdown_fees_grade_high_school_registration_fee_jp:
        school.admissions_breakdown_fees_grade_high_school_registration_fee_jp ?? '',
      admissions_breakdown_fees_grade_high_school_maintenance_fee_en:
        school.admissions_breakdown_fees_grade_high_school_maintenance_fee_en ?? '',
      admissions_breakdown_fees_grade_high_school_maintenance_fee_jp:
        school.admissions_breakdown_fees_grade_high_school_maintenance_fee_jp ?? '',
      // Summer School Fees
      admissions_breakdown_fees_summer_school_tuition_en:
        school.admissions_breakdown_fees_summer_school_tuition_en ?? '',
      admissions_breakdown_fees_summer_school_tuition_jp:
        school.admissions_breakdown_fees_summer_school_tuition_jp ?? '',
      admissions_breakdown_fees_summer_school_registration_fee_en:
        school.admissions_breakdown_fees_summer_school_registration_fee_en ?? '',
      admissions_breakdown_fees_summer_school_registration_fee_jp:
        school.admissions_breakdown_fees_summer_school_registration_fee_jp ?? '',
      admissions_breakdown_fees_summer_school_maintenance_fee_en:
        school.admissions_breakdown_fees_summer_school_maintenance_fee_en ?? '',
      admissions_breakdown_fees_summer_school_maintenance_fee_jp:
        school.admissions_breakdown_fees_summer_school_maintenance_fee_jp ?? '',
      // Other Fees
      admissions_breakdown_fees_other_tuition_en:
        school.admissions_breakdown_fees_other_tuition_en ?? '',
      admissions_breakdown_fees_other_tuition_jp:
        school.admissions_breakdown_fees_other_tuition_jp ?? '',
      admissions_breakdown_fees_other_registration_fee_en:
        school.admissions_breakdown_fees_other_registration_fee_en ?? '',
      admissions_breakdown_fees_other_registration_fee_jp:
        school.admissions_breakdown_fees_other_registration_fee_jp ?? '',
      admissions_breakdown_fees_other_maintenance_fee_en:
        school.admissions_breakdown_fees_other_maintenance_fee_en ?? '',
      admissions_breakdown_fees_other_maintenance_fee_jp:
        school.admissions_breakdown_fees_other_maintenance_fee_jp ?? '',

      // Campus & Facilities Information
      campus_facilities_en: school.campus_facilities_en ?? [],
      campus_facilities_jp: school.campus_facilities_jp ?? [],
      campus_virtual_tour_en: school.campus_virtual_tour_en ?? '',
      campus_virtual_tour_jp: school.campus_virtual_tour_jp ?? '',
      events_en: school.events_en ?? [],
      events_jp: school.events_jp ?? [],

      // Student Life Information
      student_life_counseling_en: school.student_life_counseling_en ?? '',
      student_life_counseling_jp: school.student_life_counseling_jp ?? '',
      student_life_support_services_en: school.student_life_support_services_en ?? [],
      student_life_support_services_jp: school.student_life_support_services_jp ?? [],
      student_life_library_en: school.student_life_library_en ?? '',
      student_life_library_jp: school.student_life_library_jp ?? '',
      student_life_calendar_en: school.student_life_calendar_en ?? '',
      student_life_calendar_jp: school.student_life_calendar_jp ?? '',
      student_life_tour_en: school.student_life_tour_en ?? '',
      student_life_tour_jp: school.student_life_tour_jp ?? '',

      // Employment Information
      employment_open_positions_en: school.employment_open_positions_en ?? [],
      employment_open_positions_jp: school.employment_open_positions_jp ?? [],
      employment_application_process_en: school.employment_application_process_en ?? '',
      employment_application_process_jp: school.employment_application_process_jp ?? '',

      // Policies & Staff Information
      policies_privacy_policy_en: school.policies_privacy_policy_en ?? '',
      policies_privacy_policy_jp: school.policies_privacy_policy_jp ?? '',
      policies_terms_of_use_en: school.policies_terms_of_use_en ?? '',
      policies_terms_of_use_jp: school.policies_terms_of_use_jp ?? '',
      staff_staff_list_en: school.staff_staff_list_en ?? [],
      staff_staff_list_jp: school.staff_staff_list_jp ?? [],
      staff_board_members_en: school.staff_board_members_en ?? [],
      staff_board_members_jp: school.staff_board_members_jp ?? [],
    };
    return initialData as FormData;
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field: keyof FormData, value: string, index: number) => {
    setFormData(prev => {
      const array = [...(prev[field] as string[])];
      array[index] = value;
      return {
        ...prev,
        [field]: array,
      };
    });
  };

  const handleAddArrayItem = (field: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ''],
    }));
  };

  const handleRemoveArrayItem = (field: keyof FormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = Object.fromEntries(
      Object.entries(formData).filter(([, value]) => value !== undefined && value !== '')
    );
    await onSave(submitData as Partial<School>);
  };

  const renderBasicInfoFields = () => (
    <div className="space-y-6">
      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'School Name (English)' : '学校名（英語）'}
          </label>
          <input
            type="text"
            value={formData.name_en}
            onChange={e => handleChange('name_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'School Name (Japanese)' : '学校名（日本語）'}
          </label>
          <input
            type="text"
            value={formData.name_jp}
            onChange={e => handleChange('name_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Short Description */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Short Description (English)' : '簡単な説明（英語）'}
          </label>
          <textarea
            value={formData.short_description_en}
            onChange={e => handleChange('short_description_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Short Description (Japanese)' : '簡単な説明（日本語）'}
          </label>
          <textarea
            value={formData.short_description_jp}
            onChange={e => handleChange('short_description_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
          />
        </div>
      </div>

      {/* Full Description */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Full Description (English)' : '詳細な説明（英語）'}
          </label>
          <textarea
            value={formData.description_en}
            onChange={e => handleChange('description_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Full Description (Japanese)' : '詳細な説明（日本語）'}
          </label>
          <textarea
            value={formData.description_jp}
            onChange={e => handleChange('description_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={6}
          />
        </div>
      </div>

      {/* Location Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Location (English)' : '場所（英語）'}
          </label>
          <input
            type="text"
            value={formData.location_en}
            onChange={e => handleChange('location_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Location (Japanese)' : '場所（日本語）'}
          </label>
          <input
            type="text"
            value={formData.location_jp}
            onChange={e => handleChange('location_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Address (English)' : '住所（英語）'}
          </label>
          <input
            type="text"
            value={formData.address_en}
            onChange={e => handleChange('address_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Address (Japanese)' : '住所（日本語）'}
          </label>
          <input
            type="text"
            value={formData.address_jp}
            onChange={e => handleChange('address_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Region */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Region (English)' : '地域（英語）'}
          </label>
          <input
            type="text"
            value={formData.region_en}
            onChange={e => handleChange('region_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Region (Japanese)' : '地域（日本語）'}
          </label>
          <input
            type="text"
            value={formData.region_jp}
            onChange={e => handleChange('region_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Country */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Country (English)' : '国（英語）'}
          </label>
          <input
            type="text"
            value={formData.country_en}
            onChange={e => handleChange('country_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Country (Japanese)' : '国（日本語）'}
          </label>
          <input
            type="text"
            value={formData.country_jp}
            onChange={e => handleChange('country_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Phone (English)' : '電話番号（英語）'}
          </label>
          <input
            type="text"
            value={formData.phone_en}
            onChange={e => handleChange('phone_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Phone (Japanese)' : '電話番号（日本語）'}
          </label>
          <input
            type="text"
            value={formData.phone_jp}
            onChange={e => handleChange('phone_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Email */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Email (English)' : 'メール（英語）'}
          </label>
          <input
            type="email"
            value={formData.email_en}
            onChange={e => handleChange('email_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Email (Japanese)' : 'メール（日本語）'}
          </label>
          <input
            type="email"
            value={formData.email_jp}
            onChange={e => handleChange('email_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Website URL */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Website URL (English)' : 'ウェブサイト（英語）'}
          </label>
          <input
            type="url"
            value={formData.url_en}
            onChange={e => handleChange('url_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Website URL (Japanese)' : 'ウェブサイト（日本語）'}
          </label>
          <input
            type="url"
            value={formData.url_jp}
            onChange={e => handleChange('url_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>
    </div>
  );

  const renderEducationFields = () => (
    <div className="space-y-6">
      {/* Programs Offered */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Programs Offered (English)' : '提供プログラム（英語）'}
          </label>
          {formData.education_programs_offered_en?.map((program, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={program}
                onChange={e =>
                  handleArrayChange('education_programs_offered_en', e.target.value, index)
                }
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('education_programs_offered_en', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('education_programs_offered_en')}
            className="text-green-500 hover:text-green-700"
          >
            + Add Program
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Programs Offered (Japanese)' : '提供プログラム（日本語）'}
          </label>
          {formData.education_programs_offered_jp?.map((program, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={program}
                onChange={e =>
                  handleArrayChange('education_programs_offered_jp', e.target.value, index)
                }
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('education_programs_offered_jp', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('education_programs_offered_jp')}
            className="text-green-500 hover:text-green-700"
          >
            + プログラムを追加
          </button>
        </div>
      </div>

      {/* Curriculum */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Curriculum (English)' : 'カリキュラム（英語）'}
          </label>
          <textarea
            value={formData.curriculum_en}
            onChange={e => handleChange('curriculum_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Curriculum (Japanese)' : 'カリキュラム（日本語）'}
          </label>
          <textarea
            value={formData.curriculum_jp}
            onChange={e => handleChange('curriculum_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
      </div>

      {/* Academic Support */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Academic Support (English)' : '学習サポート（英語）'}
          </label>
          {formData.education_academic_support_en?.map((support, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={support}
                onChange={e =>
                  handleArrayChange('education_academic_support_en', e.target.value, index)
                }
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('education_academic_support_en', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('education_academic_support_en')}
            className="text-green-500 hover:text-green-700"
          >
            + Add Support Service
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Academic Support (Japanese)' : '学習サポート（日本語）'}
          </label>
          {formData.education_academic_support_jp?.map((support, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={support}
                onChange={e =>
                  handleArrayChange('education_academic_support_jp', e.target.value, index)
                }
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('education_academic_support_jp', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('education_academic_support_jp')}
            className="text-green-500 hover:text-green-700"
          >
            + サポートサービスを追加
          </button>
        </div>
      </div>

      {/* Extracurricular Activities */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Extracurricular Activities (English)' : '課外活動（英語）'}
          </label>
          {formData.education_extracurricular_activities_en?.map((activity, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={activity}
                onChange={e =>
                  handleArrayChange(
                    'education_extracurricular_activities_en',
                    e.target.value,
                    index
                  )
                }
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() =>
                  handleRemoveArrayItem('education_extracurricular_activities_en', index)
                }
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('education_extracurricular_activities_en')}
            className="text-green-500 hover:text-green-700"
          >
            + Add Activity
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Extracurricular Activities (Japanese)' : '課外活動（日本語）'}
          </label>
          {formData.education_extracurricular_activities_jp?.map((activity, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={activity}
                onChange={e =>
                  handleArrayChange(
                    'education_extracurricular_activities_jp',
                    e.target.value,
                    index
                  )
                }
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() =>
                  handleRemoveArrayItem('education_extracurricular_activities_jp', index)
                }
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('education_extracurricular_activities_jp')}
            className="text-green-500 hover:text-green-700"
          >
            + 活動を追加
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdmissionsFields = () => (
    <div className="space-y-6">
      {/* Acceptance Policy */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Acceptance Policy (English)' : '入学方針（英語）'}
          </label>
          <textarea
            value={formData.admissions_acceptance_policy_en}
            onChange={e => handleChange('admissions_acceptance_policy_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Acceptance Policy (Japanese)' : '入学方針（日本語）'}
          </label>
          <textarea
            value={formData.admissions_acceptance_policy_jp}
            onChange={e => handleChange('admissions_acceptance_policy_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
      </div>

      {/* Application Guidelines */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Application Guidelines (English)' : '出願ガイドライン（英語）'}
          </label>
          <textarea
            value={formData.admissions_application_guidelines_en}
            onChange={e => handleChange('admissions_application_guidelines_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Application Guidelines (Japanese)' : '出願ガイドライン（日本語）'}
          </label>
          <textarea
            value={formData.admissions_application_guidelines_jp}
            onChange={e => handleChange('admissions_application_guidelines_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
      </div>

      {/* Age Requirements */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Age Requirements (English)' : '年齢要件（英語）'}
          </label>
          <textarea
            value={formData.admissions_age_requirements_en}
            onChange={e => handleChange('admissions_age_requirements_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Age Requirements (Japanese)' : '年齢要件（日本語）'}
          </label>
          <textarea
            value={formData.admissions_age_requirements_jp}
            onChange={e => handleChange('admissions_age_requirements_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
          />
        </div>
      </div>

      {/* Language Requirements - Students */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Language Requirements - Students (English)'
              : '言語要件 - 生徒（英語）'}
          </label>
          <textarea
            value={formData.admissions_language_requirements_students_en}
            onChange={e =>
              handleChange('admissions_language_requirements_students_en', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Language Requirements - Students (Japanese)'
              : '言語要件 - 生徒（日本語）'}
          </label>
          <textarea
            value={formData.admissions_language_requirements_students_jp}
            onChange={e =>
              handleChange('admissions_language_requirements_students_jp', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
          />
        </div>
      </div>

      {/* Language Requirements - Parents */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Language Requirements - Parents (English)'
              : '言語要件 - 保護者（英語）'}
          </label>
          <textarea
            value={formData.admissions_language_requirements_parents_en}
            onChange={e =>
              handleChange('admissions_language_requirements_parents_en', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Language Requirements - Parents (Japanese)'
              : '言語要件 - 保護者（日本語）'}
          </label>
          <textarea
            value={formData.admissions_language_requirements_parents_jp}
            onChange={e =>
              handleChange('admissions_language_requirements_parents_jp', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
          />
        </div>
      </div>

      {/* Fees Section Header */}
      <h3 className="text-lg font-semibold mt-8 mb-4">
        {language === 'en' ? 'Fees Breakdown' : '費用の内訳'}
      </h3>

      {/* Application Fee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Application Fee (English)' : '出願料（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_application_fee_en}
            onChange={e =>
              handleChange('admissions_breakdown_fees_application_fee_en', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Application Fee (Japanese)' : '出願料（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_application_fee_jp}
            onChange={e =>
              handleChange('admissions_breakdown_fees_application_fee_jp', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Elementary School Fees */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Elementary School - Tuition (English)'
              : '小学校 - 授業料（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_elementary_tuition_en}
            onChange={e =>
              handleChange('admissions_breakdown_fees_grade_elementary_tuition_en', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Elementary School - Tuition (Japanese)'
              : '小学校 - 授業料（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_elementary_tuition_jp}
            onChange={e =>
              handleChange('admissions_breakdown_fees_grade_elementary_tuition_jp', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Junior High School Fees */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Junior High School - Tuition (English)'
              : '中学校 - 授業料（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_junior_high_tuition_en}
            onChange={e =>
              handleChange('admissions_breakdown_fees_grade_junior_high_tuition_en', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Junior High School - Tuition (Japanese)'
              : '中学校 - 授業料（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_junior_high_tuition_jp}
            onChange={e =>
              handleChange('admissions_breakdown_fees_grade_junior_high_tuition_jp', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* High School Fees */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'High School - Tuition (English)' : '高校 - 授業料（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_high_school_tuition_en}
            onChange={e =>
              handleChange('admissions_breakdown_fees_grade_high_school_tuition_en', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'High School - Tuition (Japanese)' : '高校 - 授業料（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_high_school_tuition_jp}
            onChange={e =>
              handleChange('admissions_breakdown_fees_grade_high_school_tuition_jp', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Registration Fees */}
      <h4 className="text-lg font-medium mt-6 mb-4">
        {language === 'en' ? 'Registration Fees' : '入学金'}
      </h4>

      {/* Elementary Registration Fee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Elementary School - Registration Fee (English)'
              : '小学校 - 入学金（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_elementary_registration_fee_en}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_grade_elementary_registration_fee_en',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Elementary School - Registration Fee (Japanese)'
              : '小学校 - 入学金（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_elementary_registration_fee_jp}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_grade_elementary_registration_fee_jp',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Junior High Registration Fee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Junior High School - Registration Fee (English)'
              : '中学校 - 入学金（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_junior_high_registration_fee_en}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_grade_junior_high_registration_fee_en',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Junior High School - Registration Fee (Japanese)'
              : '中学校 - 入学金（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_junior_high_registration_fee_jp}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_grade_junior_high_registration_fee_jp',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* High School Registration Fee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'High School - Registration Fee (English)'
              : '高校 - 入学金（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_high_school_registration_fee_en}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_grade_high_school_registration_fee_en',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'High School - Registration Fee (Japanese)'
              : '高校 - 入学金（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_high_school_registration_fee_jp}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_grade_high_school_registration_fee_jp',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Maintenance Fees */}
      <h4 className="text-lg font-medium mt-6 mb-4">
        {language === 'en' ? 'Maintenance Fees' : '施設維持費'}
      </h4>

      {/* Elementary Maintenance Fee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Elementary School - Maintenance Fee (English)'
              : '小学校 - 施設維持費（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_elementary_maintenance_fee_en}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_grade_elementary_maintenance_fee_en',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Elementary School - Maintenance Fee (Japanese)'
              : '小学校 - 施設維持費（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_elementary_maintenance_fee_jp}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_grade_elementary_maintenance_fee_jp',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Junior High Maintenance Fee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Junior High School - Maintenance Fee (English)'
              : '中学校 - 施設維持費（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_junior_high_maintenance_fee_en}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_grade_junior_high_maintenance_fee_en',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Junior High School - Maintenance Fee (Japanese)'
              : '中学校 - 施設維持費（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* High School Maintenance Fee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'High School - Maintenance Fee (English)'
              : '高校 - 施設維持費（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_high_school_maintenance_fee_en}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_grade_high_school_maintenance_fee_en',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'High School - Maintenance Fee (Japanese)'
              : '高校 - 施設維持費（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_grade_high_school_maintenance_fee_jp}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_grade_high_school_maintenance_fee_jp',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Summer School Fees */}
      <h4 className="text-lg font-medium mt-6 mb-4">
        {language === 'en' ? 'Summer School Fees' : 'サマースクール費用'}
      </h4>

      {/* Summer School Tuition */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Summer School - Tuition (English)'
              : 'サマースクール - 授業料（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_summer_school_tuition_en}
            onChange={e =>
              handleChange('admissions_breakdown_fees_summer_school_tuition_en', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Summer School - Tuition (Japanese)'
              : 'サマースクール - 授業料（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_summer_school_tuition_jp}
            onChange={e =>
              handleChange('admissions_breakdown_fees_summer_school_tuition_jp', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Summer School Registration Fee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Summer School - Registration Fee (English)'
              : 'サマースクール - 入学金（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_summer_school_registration_fee_en}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_summer_school_registration_fee_en',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Summer School - Registration Fee (Japanese)'
              : 'サマースクール - 入学金（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_summer_school_registration_fee_jp}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_summer_school_registration_fee_jp',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Summer School Maintenance Fee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Summer School - Maintenance Fee (English)'
              : 'サマースクール - 施設維持費（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_summer_school_maintenance_fee_en}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_summer_school_maintenance_fee_en',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Summer School - Maintenance Fee (Japanese)'
              : 'サマースクール - 施設維持費（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_summer_school_maintenance_fee_jp}
            onChange={e =>
              handleChange(
                'admissions_breakdown_fees_summer_school_maintenance_fee_jp',
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Other Fees */}
      <h4 className="text-lg font-medium mt-6 mb-4">
        {language === 'en' ? 'Other Fees' : 'その他の費用'}
      </h4>

      {/* Other Tuition */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Other - Tuition (English)' : 'その他 - 授業料（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_other_tuition_en}
            onChange={e =>
              handleChange('admissions_breakdown_fees_other_tuition_en', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Other - Tuition (Japanese)' : 'その他 - 授業料（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_other_tuition_jp}
            onChange={e =>
              handleChange('admissions_breakdown_fees_other_tuition_jp', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Other Registration Fee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Other - Registration Fee (English)' : 'その他 - 入学金（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_other_registration_fee_en}
            onChange={e =>
              handleChange('admissions_breakdown_fees_other_registration_fee_en', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Other - Registration Fee (Japanese)'
              : 'その他 - 入学金（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_other_registration_fee_jp}
            onChange={e =>
              handleChange('admissions_breakdown_fees_other_registration_fee_jp', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Other Maintenance Fee */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Other - Maintenance Fee (English)'
              : 'その他 - 施設維持費（英語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_other_maintenance_fee_en}
            onChange={e =>
              handleChange('admissions_breakdown_fees_other_maintenance_fee_en', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Other - Maintenance Fee (Japanese)'
              : 'その他 - 施設維持費（日本語）'}
          </label>
          <input
            type="text"
            value={formData.admissions_breakdown_fees_other_maintenance_fee_jp}
            onChange={e =>
              handleChange('admissions_breakdown_fees_other_maintenance_fee_jp', e.target.value)
            }
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>
    </div>
  );

  const renderCampusFields = () => (
    <div className="space-y-6">
      {/* Facilities */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Facilities (English)' : '施設（英語）'}
          </label>
          {formData.campus_facilities_en?.map((facility, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={facility}
                onChange={e => handleArrayChange('campus_facilities_en', e.target.value, index)}
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('campus_facilities_en', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('campus_facilities_en')}
            className="text-green-500 hover:text-green-700"
          >
            + Add Facility
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Facilities (Japanese)' : '施設（日本語）'}
          </label>
          {formData.campus_facilities_jp?.map((facility, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={facility}
                onChange={e => handleArrayChange('campus_facilities_jp', e.target.value, index)}
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('campus_facilities_jp', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('campus_facilities_jp')}
            className="text-green-500 hover:text-green-700"
          >
            + 施設を追加
          </button>
        </div>
      </div>

      {/* Virtual Tour */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Virtual Tour (English)' : 'バーチャルツアー（英語）'}
          </label>
          <input
            type="text"
            value={formData.campus_virtual_tour_en}
            onChange={e => handleChange('campus_virtual_tour_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            placeholder="Enter virtual tour URL or description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Virtual Tour (Japanese)' : 'バーチャルツアー（日本語）'}
          </label>
          <input
            type="text"
            value={formData.campus_virtual_tour_jp}
            onChange={e => handleChange('campus_virtual_tour_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            placeholder="バーチャルツアーのURLまたは説明を入力"
          />
        </div>
      </div>

      {/* Events */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Events (English)' : 'イベント（英語）'}
          </label>
          {formData.events_en?.map((event, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={event}
                onChange={e => handleArrayChange('events_en', e.target.value, index)}
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('events_en', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('events_en')}
            className="text-green-500 hover:text-green-700"
          >
            + Add Event
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Events (Japanese)' : 'イベント（日本語）'}
          </label>
          {formData.events_jp?.map((event, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={event}
                onChange={e => handleArrayChange('events_jp', e.target.value, index)}
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('events_jp', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('events_jp')}
            className="text-green-500 hover:text-green-700"
          >
            + イベントを追加
          </button>
        </div>
      </div>
    </div>
  );

  const renderStudentLifeFields = () => (
    <div className="space-y-6">
      {/* Counseling */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Counseling Services (English)' : 'カウンセリングサービス（英語）'}
          </label>
          <textarea
            value={formData.student_life_counseling_en}
            onChange={e => handleChange('student_life_counseling_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Counseling Services (Japanese)'
              : 'カウンセリングサービス（日本語）'}
          </label>
          <textarea
            value={formData.student_life_counseling_jp}
            onChange={e => handleChange('student_life_counseling_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
      </div>

      {/* Support Services */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Support Services (English)' : 'サポートサービス（英語）'}
          </label>
          {formData.student_life_support_services_en?.map((service, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={service}
                onChange={e =>
                  handleArrayChange('student_life_support_services_en', e.target.value, index)
                }
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('student_life_support_services_en', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('student_life_support_services_en')}
            className="text-green-500 hover:text-green-700"
          >
            + Add Service
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Support Services (Japanese)' : 'サポートサービス（日本語）'}
          </label>
          {formData.student_life_support_services_jp?.map((service, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={service}
                onChange={e =>
                  handleArrayChange('student_life_support_services_jp', e.target.value, index)
                }
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('student_life_support_services_jp', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('student_life_support_services_jp')}
            className="text-green-500 hover:text-green-700"
          >
            + サービスを追加
          </button>
        </div>
      </div>

      {/* Library */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Library Information (English)' : '図書館情報（英語）'}
          </label>
          <textarea
            value={formData.student_life_library_en}
            onChange={e => handleChange('student_life_library_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Library Information (Japanese)' : '図書館情報（日本語）'}
          </label>
          <textarea
            value={formData.student_life_library_jp}
            onChange={e => handleChange('student_life_library_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
      </div>

      {/* School Calendar */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'School Calendar (English)' : '学校カレンダー（英語）'}
          </label>
          <textarea
            value={formData.student_life_calendar_en}
            onChange={e => handleChange('student_life_calendar_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'School Calendar (Japanese)' : '学校カレンダー（日本語）'}
          </label>
          <textarea
            value={formData.student_life_calendar_jp}
            onChange={e => handleChange('student_life_calendar_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
      </div>

      {/* Campus Tour */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Campus Tour Information (English)'
              : 'キャンパスツアー情報（英語）'}
          </label>
          <textarea
            value={formData.student_life_tour_en}
            onChange={e => handleChange('student_life_tour_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en'
              ? 'Campus Tour Information (Japanese)'
              : 'キャンパスツアー情報（日本語）'}
          </label>
          <textarea
            value={formData.student_life_tour_jp}
            onChange={e => handleChange('student_life_tour_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderEmploymentFields = () => (
    <div className="space-y-6">
      {/* Open Positions */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Open Positions (English)' : '求人情報（英語）'}
          </label>
          {formData.employment_open_positions_en?.map((position, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={position}
                onChange={e =>
                  handleArrayChange('employment_open_positions_en', e.target.value, index)
                }
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('employment_open_positions_en', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('employment_open_positions_en')}
            className="text-green-500 hover:text-green-700"
          >
            + Add Position
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Open Positions (Japanese)' : '求人情報（日本語）'}
          </label>
          {formData.employment_open_positions_jp?.map((position, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={position}
                onChange={e =>
                  handleArrayChange('employment_open_positions_jp', e.target.value, index)
                }
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('employment_open_positions_jp', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('employment_open_positions_jp')}
            className="text-green-500 hover:text-green-700"
          >
            + 求人を追加
          </button>
        </div>
      </div>

      {/* Application Process */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Application Process (English)' : '応募プロセス（英語）'}
          </label>
          <textarea
            value={formData.employment_application_process_en}
            onChange={e => handleChange('employment_application_process_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Application Process (Japanese)' : '応募プロセス（日本語）'}
          </label>
          <textarea
            value={formData.employment_application_process_jp}
            onChange={e => handleChange('employment_application_process_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderPoliciesFields = () => (
    <div className="space-y-6">
      {/* Privacy Policy */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Privacy Policy (English)' : 'プライバシーポリシー（英語）'}
          </label>
          <textarea
            value={formData.policies_privacy_policy_en}
            onChange={e => handleChange('policies_privacy_policy_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Privacy Policy (Japanese)' : 'プライバシーポリシー（日本語）'}
          </label>
          <textarea
            value={formData.policies_privacy_policy_jp}
            onChange={e => handleChange('policies_privacy_policy_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={6}
          />
        </div>
      </div>

      {/* Terms of Use */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Terms of Use (English)' : '利用規約（英語）'}
          </label>
          <textarea
            value={formData.policies_terms_of_use_en}
            onChange={e => handleChange('policies_terms_of_use_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Terms of Use (Japanese)' : '利用規約（日本語）'}
          </label>
          <textarea
            value={formData.policies_terms_of_use_jp}
            onChange={e => handleChange('policies_terms_of_use_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={6}
          />
        </div>
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Staff List (English)' : 'スタッフリスト（英語）'}
          </label>
          {formData.staff_staff_list_en?.map((staff, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={staff}
                onChange={e => handleArrayChange('staff_staff_list_en', e.target.value, index)}
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('staff_staff_list_en', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('staff_staff_list_en')}
            className="text-green-500 hover:text-green-700"
          >
            + Add Staff Member
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Staff List (Japanese)' : 'スタッフリスト（日本語）'}
          </label>
          {formData.staff_staff_list_jp?.map((staff, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={staff}
                onChange={e => handleArrayChange('staff_staff_list_jp', e.target.value, index)}
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('staff_staff_list_jp', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('staff_staff_list_jp')}
            className="text-green-500 hover:text-green-700"
          >
            + スタッフを追加
          </button>
        </div>
      </div>

      {/* Board Members */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Board Members (English)' : '理事会メンバー（英語）'}
          </label>
          {formData.staff_board_members_en?.map((member, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={member}
                onChange={e => handleArrayChange('staff_board_members_en', e.target.value, index)}
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('staff_board_members_en', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('staff_board_members_en')}
            className="text-green-500 hover:text-green-700"
          >
            + Add Board Member
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Board Members (Japanese)' : '理事会メンバー（日本語）'}
          </label>
          {formData.staff_board_members_jp?.map((member, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={member}
                onChange={e => handleArrayChange('staff_board_members_jp', e.target.value, index)}
                className="flex-1 rounded-md border border-gray-300 p-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('staff_board_members_jp', index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('staff_board_members_jp')}
            className="text-green-500 hover:text-green-700"
          >
            + 理事を追加
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form content based on section */}
      {section === 'basic' && renderBasicInfoFields()}
      {section === 'education' && renderEducationFields()}
      {section === 'admissions' && renderAdmissionsFields()}
      {section === 'campus' && renderCampusFields()}
      {section === 'studentLife' && renderStudentLifeFields()}
      {section === 'employment' && renderEmploymentFields()}
      {section === 'policies' && renderPoliciesFields()}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
        >
          {language === 'en' ? 'Cancel' : 'キャンセル'}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {language === 'en' ? 'Save Changes' : '変更を保存'}
        </button>
      </div>
    </form>
  );
}
