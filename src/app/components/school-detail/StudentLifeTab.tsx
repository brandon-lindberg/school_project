import React from 'react';
import { School } from '@/types/school';
import { Language, getLocalizedContent } from '@/utils/language';
import { Translations } from '@/interfaces/Translations';

interface StudentLifeTabProps {
  school: School;
  translations: Translations;
  language: Language;
  supportServices: string[];
  isSchoolAdmin?: boolean;
  onEdit?: () => void;
}

export function StudentLifeTab({
  school,
  translations,
  language,
  supportServices,
  isSchoolAdmin,
  onEdit,
}: StudentLifeTabProps) {
  return (
    <div className="space-y-6">
      {/* Admin Edit Button */}
      {isSchoolAdmin && (
        <div className="flex justify-end">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            {translations.buttons?.edit || 'Edit Student Life Information'}
          </button>
        </div>
      )}

      {/* Counseling */}
      {(school.student_life_counseling_en || school.student_life_counseling_jp) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{translations.sections.counseling}</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {getLocalizedContent(
              school.student_life_counseling_en,
              school.student_life_counseling_jp,
              language
            )}
          </p>
        </div>
      )}

      {/* Support Services */}
      {supportServices.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{translations.sections.supportServices}</h2>
          <ul className="space-y-3">
            {supportServices.map((service, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-500">•</span>
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Library */}
      {(school.student_life_library_en || school.student_life_library_jp) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{translations.sections.library}</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {getLocalizedContent(
              school.student_life_library_en,
              school.student_life_library_jp,
              language
            )}
          </p>
        </div>
      )}

      {/* Calendar */}
      {(school.student_life_calendar_en || school.student_life_calendar_jp) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{translations.sections.calendar}</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {getLocalizedContent(
              school.student_life_calendar_en,
              school.student_life_calendar_jp,
              language
            )}
          </p>
        </div>
      )}

      {/* Tour */}
      {(school.student_life_tour_en || school.student_life_tour_jp) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{translations.sections.tour}</h2>
          <a
            href={getLocalizedContent(
              school.student_life_tour_en,
              school.student_life_tour_jp,
              language
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-green-500 hover:underline"
          >
            <span>🎥</span>
            <span>{translations.sections.tour}</span>
          </a>
        </div>
      )}
    </div>
  );
}
