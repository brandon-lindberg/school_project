import React from 'react';
import { School } from '@/types/school';
import { Language, getLocalizedContent } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';

interface AdmissionsTabProps {
  school: School;
  translations: Translations;
  language: Language;
  isSchoolAdmin?: boolean;
  onEdit?: () => void;
}

export function AdmissionsTab({
  school,
  translations,
  language,
  isSchoolAdmin,
  onEdit,
}: AdmissionsTabProps) {
  return (
    <div className="space-y-6">
      {/* Admin Edit Button */}
      {isSchoolAdmin && (
        <div className="flex justify-end">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            {translations.buttons?.edit || 'Edit Admissions Information'}
          </button>
        </div>
      )}

      {/* Admissions Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">{translations.sections.admissionsInformation}</h2>

        {/* Acceptance Policy */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{translations.sections.acceptancePolicy}</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {getLocalizedContent(
              school.admissions_acceptance_policy_en,
              school.admissions_acceptance_policy_jp,
              language
            ) || translations.sections.noAcceptancePolicy}
          </p>
        </div>

        {/* Application Guidelines */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">
            {translations.sections.applicationGuidelines}
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {getLocalizedContent(
              school.admissions_application_guidelines_en,
              school.admissions_application_guidelines_jp,
              language
            ) || translations.sections.noGuidelines}
          </p>
        </div>

        {/* Age Requirements */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">{translations.sections.ageRequirements}</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {getLocalizedContent(
              school.admissions_age_requirements_en,
              school.admissions_age_requirements_jp,
              language
            ) || translations.sections.noInfo}
          </p>
        </div>

        {/* General Fees */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">{translations.sections.generalFees}</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {getLocalizedContent(
              school.admissions_fees_en,
              school.admissions_fees_jp,
              language
            ) || translations.sections.noInfo}
          </p>
        </div>

        {/* Procedure */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">{translations.sections.procedure}</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {getLocalizedContent(
              school.admissions_procedure_en,
              school.admissions_procedure_jp,
              language
            ) || translations.sections.noInfo}
          </p>
        </div>

        {/* Language Requirements - Students */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            {translations.sections.languageRequirementsStudents}
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {getLocalizedContent(
              school.admissions_language_requirements_students_en,
              school.admissions_language_requirements_students_jp,
              language
            ) || translations.sections.noInfo}
          </p>
        </div>

        {/* Language Requirements - Parents */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            {translations.sections.languageRequirementsParents}
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {getLocalizedContent(
              school.admissions_language_requirements_parents_en,
              school.admissions_language_requirements_parents_jp,
              language
            ) || translations.sections.noInfo}
          </p>
        </div>
      </div>

      {/* Fees Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">{translations.sections.feesOverview}</h2>

        {/* Application Fee */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{translations.sections.applicationFee}</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-700">
              {getLocalizedContent(
                school.admissions_breakdown_fees_application_fee_en,
                school.admissions_breakdown_fees_application_fee_jp,
                language
              ) || translations.sections.noFeeInfo}
            </p>
          </div>
        </div>

        {/* School Level Fees */}
        <div className="space-y-8">
          {/* Day Care Fees */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{translations.sections.daycare}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tuition */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">{translations.sections.tuition}</h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_day_care_fee_tuition_en,
                    school.admissions_breakdown_fees_day_care_fee_tuition_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Registration */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.registration}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_day_care_fee_registration_fee_en,
                    school.admissions_breakdown_fees_day_care_fee_registration_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Maintenance */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.maintenance}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_day_care_fee_maintenance_fee_en,
                    school.admissions_breakdown_fees_day_care_fee_maintenance_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
            </div>
          </div>

          {/* Kindergarten Fees */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{translations.sections.kindergarten}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tuition */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">{translations.sections.tuition}</h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_kindergarten_tuition_en,
                    school.admissions_breakdown_fees_kindergarten_tuition_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Registration */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.registration}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_kindergarten_registration_fee_en,
                    school.admissions_breakdown_fees_kindergarten_registration_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Maintenance */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.maintenance}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_kindergarten_maintenance_fee_en,
                    school.admissions_breakdown_fees_kindergarten_maintenance_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
            </div>
          </div>

          {/* Elementary School Fees */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{translations.sections.elementary}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tuition */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">{translations.sections.tuition}</h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_grade_elementary_tuition_en,
                    school.admissions_breakdown_fees_grade_elementary_tuition_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Registration */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.registration}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_grade_elementary_registration_fee_en,
                    school.admissions_breakdown_fees_grade_elementary_registration_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Maintenance */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.maintenance}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_grade_elementary_maintenance_fee_en,
                    school.admissions_breakdown_fees_grade_elementary_maintenance_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
            </div>
          </div>

          {/* Junior High School Fees */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{translations.sections.juniorhigh}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tuition */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">{translations.sections.tuition}</h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_grade_junior_high_tuition_en,
                    school.admissions_breakdown_fees_grade_junior_high_tuition_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Registration */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.registration}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_grade_junior_high_registration_fee_en,
                    school.admissions_breakdown_fees_grade_junior_high_registration_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Maintenance */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.maintenance}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_en,
                    school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
            </div>
          </div>

          {/* High School Fees */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{translations.sections.highschool}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tuition */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">{translations.sections.tuition}</h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_grade_high_school_tuition_en,
                    school.admissions_breakdown_fees_grade_high_school_tuition_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Registration */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.registration}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_grade_high_school_registration_fee_en,
                    school.admissions_breakdown_fees_grade_high_school_registration_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Maintenance */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.maintenance}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_grade_high_school_maintenance_fee_en,
                    school.admissions_breakdown_fees_grade_high_school_maintenance_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
            </div>
          </div>

          {/* Summer School Fees */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{translations.sections.summerSchool}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tuition */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">{translations.sections.tuition}</h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_summer_school_tuition_en,
                    school.admissions_breakdown_fees_summer_school_tuition_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Registration */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.registration}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_summer_school_registration_fee_en,
                    school.admissions_breakdown_fees_summer_school_registration_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Maintenance */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.maintenance}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_summer_school_maintenance_fee_en,
                    school.admissions_breakdown_fees_summer_school_maintenance_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
            </div>
          </div>

          {/* Other Fees */}
          <div>
            <h3 className="text-xl font-semibold mb-4">{translations.sections.otherFees}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tuition */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">{translations.sections.tuition}</h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_other_tuition_en,
                    school.admissions_breakdown_fees_other_tuition_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Registration */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.registration}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_other_registration_fee_en,
                    school.admissions_breakdown_fees_other_registration_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
              {/* Maintenance */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium text-gray-600 mb-2">
                  {translations.sections.maintenance}
                </h4>
                <p className="text-gray-700">
                  {getLocalizedContent(
                    school.admissions_breakdown_fees_other_maintenance_fee_en,
                    school.admissions_breakdown_fees_other_maintenance_fee_jp,
                    language
                  ) || translations.sections.noFeeInfo}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
