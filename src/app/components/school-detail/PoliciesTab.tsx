import React from 'react';
import { School } from '@/types/school';
import { Language } from '@/utils/language';
import { Translations } from '@/interfaces/Translations';
import { Card } from '../shared/Card';
import { SectionTitle } from '../shared/SectionTitle';
import { LocalizedContent } from '../shared/LocalizedContent';

interface PoliciesTabProps {
  school: School;
  translations: Translations;
  language: Language;
  isSchoolAdmin?: boolean;
  onEdit?: () => void;
}

export function PoliciesTab({
  school,
  translations,
  language,
  isSchoolAdmin,
  onEdit,
}: PoliciesTabProps) {
  return (
    <div className="space-y-6">
      {/* Admin Edit Button */}
      {isSchoolAdmin && (
        <div className="flex justify-end">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            {translations.buttons?.edit || 'Edit Policies Information'}
          </button>
        </div>
      )}

      {/* Privacy Policy */}
      {(school.policies_privacy_policy_en || school.policies_privacy_policy_jp) && (
        <Card>
          <SectionTitle>{translations.sections.privacyPolicy}</SectionTitle>
          <LocalizedContent
            enContent={school.policies_privacy_policy_en}
            jpContent={school.policies_privacy_policy_jp}
            language={language}
          />
        </Card>
      )}

      {/* Terms of Use */}
      {(school.policies_terms_of_use_en || school.policies_terms_of_use_jp) && (
        <Card>
          <SectionTitle>{translations.sections.termsOfUse}</SectionTitle>
          <LocalizedContent
            enContent={school.policies_terms_of_use_en}
            jpContent={school.policies_terms_of_use_jp}
            language={language}
          />
        </Card>
      )}
    </div>
  );
}
