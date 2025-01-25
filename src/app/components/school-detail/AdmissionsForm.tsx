import { useState } from 'react';
import { School } from '@/types/school';
import { Language } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';

interface AdmissionsFormProps {
  school: School;
  translations: Translations;
  language: Language;
  onSave: (data: Partial<School>) => Promise<void>;
  onCancel: () => void;
}

export function AdmissionsForm({
  school,
  translations,
  language,
  onSave,
  onCancel,
}: AdmissionsFormProps) {
  const [formData, setFormData] = useState({
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
    admissions_breakdown_fees_grade_junior_high_tuition_en:
      school.admissions_breakdown_fees_grade_junior_high_tuition_en ?? '',
    admissions_breakdown_fees_grade_junior_high_tuition_jp:
      school.admissions_breakdown_fees_grade_junior_high_tuition_jp ?? '',
    admissions_breakdown_fees_grade_junior_high_registration_fee_en:
      school.admissions_breakdown_fees_grade_junior_high_registration_fee_en ?? '',
    admissions_breakdown_fees_grade_junior_high_registration_fee_jp:
      school.admissions_breakdown_fees_grade_junior_high_registration_fee_jp ?? '',
    admissions_breakdown_fees_grade_junior_high_maintenance_fee_en:
      school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_en ?? '',
    admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp:
      school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp ?? '',
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
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Acceptance Policy */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.acceptancePolicy}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
      </div>

      {/* Application Guidelines */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.applicationGuidelines}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en'
                ? 'Application Guidelines (Japanese)'
                : '出願ガイドライン（日本語）'}
            </label>
            <textarea
              value={formData.admissions_application_guidelines_jp}
              onChange={e => handleChange('admissions_application_guidelines_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Age Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.ageRequirements}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Age Requirements (English)' : '年齢要件（英語）'}
            </label>
            <textarea
              value={formData.admissions_age_requirements_en}
              onChange={e => handleChange('admissions_age_requirements_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Age Requirements (Japanese)' : '年齢要件（日本語）'}
            </label>
            <textarea
              value={formData.admissions_age_requirements_jp}
              onChange={e => handleChange('admissions_age_requirements_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* General Fees */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.generalFees}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'General Fees (English)' : '一般費用（英語）'}
            </label>
            <textarea
              value={formData.admissions_fees_en}
              onChange={e => handleChange('admissions_fees_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'General Fees (Japanese)' : '一般費用（日本語）'}
            </label>
            <textarea
              value={formData.admissions_fees_jp}
              onChange={e => handleChange('admissions_fees_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Procedure */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.procedure}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Procedure (English)' : '手続き（英語）'}
            </label>
            <textarea
              value={formData.admissions_procedure_en}
              onChange={e => handleChange('admissions_procedure_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Procedure (Japanese)' : '手続き（日本語）'}
            </label>
            <textarea
              value={formData.admissions_procedure_jp}
              onChange={e => handleChange('admissions_procedure_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Language Requirements - Students */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {translations.sections.languageRequirementsStudents}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en'
                ? 'Student Language Requirements (English)'
                : '生徒の語学要件（英語）'}
            </label>
            <textarea
              value={formData.admissions_language_requirements_students_en}
              onChange={e =>
                handleChange('admissions_language_requirements_students_en', e.target.value)
              }
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en'
                ? 'Student Language Requirements (Japanese)'
                : '生徒の語学要件（日本語）'}
            </label>
            <textarea
              value={formData.admissions_language_requirements_students_jp}
              onChange={e =>
                handleChange('admissions_language_requirements_students_jp', e.target.value)
              }
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Language Requirements - Parents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {translations.sections.languageRequirementsParents}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en'
                ? 'Parent Language Requirements (English)'
                : '保護者の語学要件（英語）'}
            </label>
            <textarea
              value={formData.admissions_language_requirements_parents_en}
              onChange={e =>
                handleChange('admissions_language_requirements_parents_en', e.target.value)
              }
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en'
                ? 'Parent Language Requirements (Japanese)'
                : '保護者の語学要件（日本語）'}
            </label>
            <textarea
              value={formData.admissions_language_requirements_parents_jp}
              onChange={e =>
                handleChange('admissions_language_requirements_parents_jp', e.target.value)
              }
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Application Fee */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.applicationFee}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
      </div>

      {/* Fee Breakdowns by Level */}
      {[
        'daycare',
        'kindergarten',
        'elementary',
        'junior_high',
        'high_school',
        'summer_school',
        'other',
      ].map(level => {
        const fieldMapping = {
          daycare: {
            tuition: 'admissions_breakdown_fees_day_care_fee_tuition',
            registration: 'admissions_breakdown_fees_day_care_fee_registration_fee',
            maintenance: 'admissions_breakdown_fees_day_care_fee_maintenance_fee',
          },
          kindergarten: {
            tuition: 'admissions_breakdown_fees_kindergarten_tuition',
            registration: 'admissions_breakdown_fees_kindergarten_registration_fee',
            maintenance: 'admissions_breakdown_fees_kindergarten_maintenance_fee',
          },
          elementary: {
            tuition: 'admissions_breakdown_fees_grade_elementary_tuition',
            registration: 'admissions_breakdown_fees_grade_elementary_registration_fee',
            maintenance: 'admissions_breakdown_fees_grade_elementary_maintenance_fee',
          },
          junior_high: {
            tuition: 'admissions_breakdown_fees_grade_junior_high_tuition',
            registration: 'admissions_breakdown_fees_grade_junior_high_registration_fee',
            maintenance: 'admissions_breakdown_fees_grade_junior_high_maintenance_fee',
          },
          high_school: {
            tuition: 'admissions_breakdown_fees_grade_high_school_tuition',
            registration: 'admissions_breakdown_fees_grade_high_school_registration_fee',
            maintenance: 'admissions_breakdown_fees_grade_high_school_maintenance_fee',
          },
          summer_school: {
            tuition: 'admissions_breakdown_fees_summer_school_tuition',
            registration: 'admissions_breakdown_fees_summer_school_registration_fee',
            maintenance: 'admissions_breakdown_fees_summer_school_maintenance_fee',
          },
          other: {
            tuition: 'admissions_breakdown_fees_other_tuition',
            registration: 'admissions_breakdown_fees_other_registration_fee',
            maintenance: 'admissions_breakdown_fees_other_maintenance_fee',
          },
        };

        return (
          <div key={level} className="space-y-4">
            <h3 className="text-lg font-semibold">
              {level === 'daycare'
                ? translations.sections.daycare
                : level === 'kindergarten'
                  ? translations.sections.kindergarten
                  : level === 'elementary'
                    ? translations.sections.elementary
                    : level === 'junior_high'
                      ? translations.sections.juniorhigh
                      : level === 'high_school'
                        ? translations.sections.highschool
                        : level === 'summer_school'
                          ? translations.sections.summerSchool
                          : translations.sections.otherFees}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tuition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.sections.tuition}
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={
                      formData[
                        `${fieldMapping[level as keyof typeof fieldMapping].tuition}_en` as keyof typeof formData
                      ]
                    }
                    onChange={e =>
                      handleChange(
                        `${fieldMapping[level as keyof typeof fieldMapping].tuition}_en` as keyof typeof formData,
                        e.target.value
                      )
                    }
                    placeholder="English"
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                  <input
                    type="text"
                    value={
                      formData[
                        `${fieldMapping[level as keyof typeof fieldMapping].tuition}_jp` as keyof typeof formData
                      ]
                    }
                    onChange={e =>
                      handleChange(
                        `${fieldMapping[level as keyof typeof fieldMapping].tuition}_jp` as keyof typeof formData,
                        e.target.value
                      )
                    }
                    placeholder="日本語"
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
              </div>

              {/* Registration Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.sections.registration}
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={
                      formData[
                        `${fieldMapping[level as keyof typeof fieldMapping].registration}_en` as keyof typeof formData
                      ]
                    }
                    onChange={e =>
                      handleChange(
                        `${fieldMapping[level as keyof typeof fieldMapping].registration}_en` as keyof typeof formData,
                        e.target.value
                      )
                    }
                    placeholder="English"
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                  <input
                    type="text"
                    value={
                      formData[
                        `${fieldMapping[level as keyof typeof fieldMapping].registration}_jp` as keyof typeof formData
                      ]
                    }
                    onChange={e =>
                      handleChange(
                        `${fieldMapping[level as keyof typeof fieldMapping].registration}_jp` as keyof typeof formData,
                        e.target.value
                      )
                    }
                    placeholder="日本語"
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
              </div>

              {/* Maintenance Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.sections.maintenance}
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={
                      formData[
                        `${fieldMapping[level as keyof typeof fieldMapping].maintenance}_en` as keyof typeof formData
                      ]
                    }
                    onChange={e =>
                      handleChange(
                        `${fieldMapping[level as keyof typeof fieldMapping].maintenance}_en` as keyof typeof formData,
                        e.target.value
                      )
                    }
                    placeholder="English"
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                  <input
                    type="text"
                    value={
                      formData[
                        `${fieldMapping[level as keyof typeof fieldMapping].maintenance}_jp` as keyof typeof formData
                      ]
                    }
                    onChange={e =>
                      handleChange(
                        `${fieldMapping[level as keyof typeof fieldMapping].maintenance}_jp` as keyof typeof formData,
                        e.target.value
                      )
                    }
                    placeholder="日本語"
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          {language === 'en' ? 'Cancel' : 'キャンセル'}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {language === 'en' ? 'Save Changes' : '変更を保存'}
        </button>
      </div>
    </form>
  );
}
