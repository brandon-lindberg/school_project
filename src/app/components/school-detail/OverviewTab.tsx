import React from 'react';
import { School } from '@/types/school';
import FallbackImage from '../FallbackImage';
import { Language, getLocalizedContent } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';

interface OverviewTabProps {
  school: School;
  translations: Translations;
  name?: string;
  shortDescription?: string;
  location?: string;
  address?: string;
  region?: string;
  country?: string;
  email?: string;
  phone?: string;
  url?: string;
  description?: string;
  affiliations: string[];
  accreditations: string[];
  language: Language;
}

export function OverviewTab({
  school,
  translations,
  name,
  shortDescription,
  location,
  address,
  region,
  country,
  email,
  phone,
  url,
  description,
  affiliations,
  accreditations,
  language,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative h-64 rounded-xl overflow-hidden">
        <FallbackImage
          src={school.image_id ? `/images/${school.image_id}.png` : '/school_placeholder.jpg'}
          alt={name || ''}
          className="w-full h-full object-cover"
          fallbackSrc="/school_placeholder.jpg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="p-6 text-white">
            <h1 className="text-4xl font-bold mb-2">{name}</h1>
            <p className="text-lg">{shortDescription}</p>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-600">{translations.sections.location}</h3>
          <p className="mt-2">{[location, address, region, country].filter(Boolean).join(', ')}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-600">{translations.sections.contactInfo}</h3>
          <div className="mt-2 space-y-1">
            {email && <p>📧 {email}</p>}
            {phone && <p>📞 {phone}</p>}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:underline"
              >
                🌐 {translations.sections.visitWebsite}
              </a>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-600">{translations.sections.curriculum}</h3>
          <p className="mt-2">
            {getLocalizedContent(school.curriculum_en, school.curriculum_jp, language) ||
              translations.sections.noCurriculum}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">{translations.sections.aboutSchool}</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
      </div>

      {/* Affiliations & Accreditations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {affiliations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">{translations.sections.affiliations}</h3>
            <ul className="list-disc list-inside space-y-2">
              {affiliations.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {accreditations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">{translations.sections.accreditations}</h3>
            <ul className="list-disc list-inside space-y-2">
              {accreditations.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
