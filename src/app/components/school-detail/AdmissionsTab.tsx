import React from 'react';
import { School } from '@/types/school';
import { Language, getLocalizedContent } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';
import { FeeLevel, FeeType } from '@/types/school';

interface AdmissionsTabProps {
  school: School;
  translations: Translations;
  language: Language;
  getFeeLevelContent: (school: School, level: FeeLevel, feeType: FeeType, lang: Language) => string;
  hasFeeLevelFees: (school: School, level: FeeLevel) => boolean;
}

export function AdmissionsTab({
  school,
  translations,
  language,
  getFeeLevelContent,
  hasFeeLevelFees,
}: AdmissionsTabProps) {
  return (
    <div className="space-y-6">
      {/* Acceptance Policy */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">{translations.sections.acceptancePolicy}</h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {getLocalizedContent(
            school.admissions_acceptance_policy_en,
            school.admissions_acceptance_policy_jp,
            language
          ) || translations.sections.noAcceptancePolicy}
        </p>
      </div>

      {/* Application Guidelines */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">{translations.sections.applicationGuidelines}</h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {getLocalizedContent(
            school.admissions_application_guidelines_en,
            school.admissions_application_guidelines_jp,
            language
          ) || translations.sections.noGuidelines}
        </p>
      </div>

      {/* Fees Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">{translations.sections.feesOverview}</h2>
        <p className="text-gray-700 mb-8 whitespace-pre-wrap">
          {getLocalizedContent(school.admissions_fees_en, school.admissions_fees_jp, language) ||
            translations.sections.noFees}
        </p>

        {/* Detailed Fee Structure */}
        <div className="space-y-6">
          {/* Application Fee */}
          {(school.admissions_breakdown_fees_application_fee_en ||
            school.admissions_breakdown_fees_application_fee_jp) && (
            <div className="border-t pt-4">
              <h3 className="text-xl font-semibold mb-2">{translations.sections.applicationFee}</h3>
              <p className="text-gray-700">
                {getLocalizedContent(
                  school.admissions_breakdown_fees_application_fee_en,
                  school.admissions_breakdown_fees_application_fee_jp,
                  language
                )}
              </p>
            </div>
          )}

          {/* Fee Categories */}
          {(['day_care', 'elementary', 'junior_high', 'high_school'] as const).map(level => {
            if (!hasFeeLevelFees(school, level)) return null;

            const sectionKey = level.replace('_', '') as keyof typeof translations.sections;

            return (
              <div key={level} className="border-t pt-4">
                <h3 className="text-xl font-semibold mb-4">{translations.sections[sectionKey]}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tuition */}
                  {getFeeLevelContent(school, level, 'tuition', language) && (
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="font-medium text-gray-600 mb-2">
                        {translations.sections.tuition}
                      </h4>
                      <p className="text-gray-700">
                        {getFeeLevelContent(school, level, 'tuition', language)}
                      </p>
                    </div>
                  )}

                  {/* Registration */}
                  {getFeeLevelContent(school, level, 'registration_fee', language) && (
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="font-medium text-gray-600 mb-2">
                        {translations.sections.registration}
                      </h4>
                      <p className="text-gray-700">
                        {getFeeLevelContent(school, level, 'registration_fee', language)}
                      </p>
                    </div>
                  )}

                  {/* Maintenance */}
                  {getFeeLevelContent(school, level, 'maintenance_fee', language) && (
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="font-medium text-gray-600 mb-2">
                        {translations.sections.maintenance}
                      </h4>
                      <p className="text-gray-700">
                        {getFeeLevelContent(school, level, 'maintenance_fee', language)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
