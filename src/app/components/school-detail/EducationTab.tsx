import React from 'react';
import { Translations } from '@/interfaces/Translations';
import { Card } from '../shared/Card';
import { SectionTitle } from '../shared/SectionTitle';
import { BulletList } from '../shared/BulletList';

interface EducationTabProps {
  translations: Translations;
  programs: string[];
  academicSupport: string[];
  extracurricular: string[];
}

export function EducationTab({
  translations,
  programs,
  academicSupport,
  extracurricular,
}: EducationTabProps) {
  return (
    <div className="space-y-6">
      {/* Programs & Curriculum */}
      <Card>
        <SectionTitle>{translations.sections.programsOffered}</SectionTitle>
        <BulletList
          items={programs}
          columns={2}
          emptyMessage={translations.sections.noProgramsListed}
        />
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
