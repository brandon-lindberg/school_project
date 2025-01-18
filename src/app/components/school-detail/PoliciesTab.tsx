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
}

export function PoliciesTab({ school, translations, language }: PoliciesTabProps) {
  return (
    <div className="space-y-6">
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
