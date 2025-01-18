import React from 'react';
import { School } from '@/types/school';
import { Language, getLocalizedContent } from '@/utils/language';
import { Translations } from '@/interfaces/Translations';

interface EmploymentTabProps {
  school: School;
  translations: Translations;
  language: Language;
  openPositions: string[];
  staffList: string[];
  boardMembers: string[];
}

export function EmploymentTab({
  school,
  translations,
  language,
  openPositions,
  staffList,
  boardMembers,
}: EmploymentTabProps) {
  return (
    <div className="space-y-6">
      {/* Open Positions */}
      {openPositions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{translations.sections.openPositions}</h2>
          <ul className="space-y-3">
            {openPositions.map((position, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-500">•</span>
                <span>{position}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Application Process */}
      {(school.employment_application_process_en || school.employment_application_process_jp) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{translations.sections.applicationProcess}</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {getLocalizedContent(
              school.employment_application_process_en,
              school.employment_application_process_jp,
              language
            )}
          </p>
        </div>
      )}

      {/* Staff List */}
      {staffList.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{translations.sections.staff}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffList.map((staff, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-500">•</span>
                <span>{staff}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Board Members */}
      {boardMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{translations.sections.boardMembers}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boardMembers.map((member, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-500">•</span>
                <span>{member}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
