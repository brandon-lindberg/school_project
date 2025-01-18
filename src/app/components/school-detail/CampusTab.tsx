import React from 'react';
import { School } from '@/types/school';
import { Language, getLocalizedContent } from '@/utils/language';
import { Translations } from '@/interfaces/Translations';

interface CampusTabProps {
  school: School;
  translations: Translations;
  language: Language;
  facilities: string[];
}

export function CampusTab({ school, translations, language, facilities }: CampusTabProps) {
  return (
    <div className="space-y-6">
      {/* Facilities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">{translations.sections.facilities}</h2>
        {facilities.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map((facility, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-500">•</span>
                <span>{facility}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">{translations.sections.noFacilities}</p>
        )}
      </div>

      {/* Virtual Tour */}
      {(school.campus_virtual_tour_en || school.campus_virtual_tour_jp) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{translations.sections.virtualTour}</h2>
          <a
            href={getLocalizedContent(
              school.campus_virtual_tour_en,
              school.campus_virtual_tour_jp,
              language
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-green-500 hover:underline"
          >
            <span>🎥</span>
            <span>{translations.sections.virtualTour}</span>
          </a>
        </div>
      )}
    </div>
  );
}
