import React from 'react';
import { Translations } from '@/interfaces/Translations';
import { Card } from '../shared/Card';
import { SectionTitle } from '../shared/SectionTitle';
import { BulletList } from '../shared/BulletList';
import { Language } from '@/utils/language';
import { School } from '@/types/school';

interface EducationTabProps {
  translations: Translations;
  language: Language;
  programs: string[];
  academicSupport: string[];
  extracurricular: string[];
  curriculum?: string;
  isSchoolAdmin?: boolean;
  onEdit?: () => void;
  school: School;
}

export function EducationTab({
  translations,
  language,
  programs,
  academicSupport,
  extracurricular,
  curriculum,
  isSchoolAdmin,
  onEdit,
  school,
}: EducationTabProps) {
  return (
    <div className="space-y-6">
      {/* Admin Edit Button */}
      {isSchoolAdmin && (
        <div className="flex justify-end">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            {translations.buttons?.edit || 'Edit Education Information'}
          </button>
        </div>
      )}

      {/* Programs & Curriculum */}
      <Card>
        <SectionTitle>{translations.sections.programsOffered}</SectionTitle>
        <BulletList
          items={programs}
          columns={2}
          emptyMessage={translations.sections.noProgramsListed}
        />
        {curriculum && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">{translations.sections.curriculum}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{curriculum}</p>
          </div>
        )}
      </Card>

      {/* Academic Support */}
      {academicSupport.length > 0 && (
        <Card>
          <SectionTitle>{translations.sections.academicSupportTitle}</SectionTitle>
          <BulletList items={academicSupport} />
        </Card>
      )}

      {/* Extracurricular Activities */}
      {extracurricular.length > 0 && (
        <Card>
          <SectionTitle>{translations.sections.extracurricular}</SectionTitle>
          <BulletList items={extracurricular} columns={2} />
        </Card>
      )}
    </div>
  );
}
