import { useState } from 'react';
import { School } from '@/types/school';
import { Language } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';

interface PoliciesFormProps {
  school: School;
  translations: Translations;
  language: Language;
  onSave: (data: Partial<School>) => Promise<void>;
  onCancel: () => void;
}

export function PoliciesForm({
  school,
  translations,
  language,
  onSave,
  onCancel,
}: PoliciesFormProps) {
  const [formData, setFormData] = useState({
    policies_privacy_policy_en: school.policies_privacy_policy_en ?? '',
    policies_privacy_policy_jp: school.policies_privacy_policy_jp ?? '',
    policies_terms_of_use_en: school.policies_terms_of_use_en ?? '',
    policies_terms_of_use_jp: school.policies_terms_of_use_jp ?? '',
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Privacy Policy */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.privacyPolicy}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Privacy Policy (English)' : 'プライバシーポリシー（英語）'}
            </label>
            <textarea
              value={formData.policies_privacy_policy_en}
              onChange={e => handleChange('policies_privacy_policy_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Privacy Policy (Japanese)' : 'プライバシーポリシー（日本語）'}
            </label>
            <textarea
              value={formData.policies_privacy_policy_jp}
              onChange={e => handleChange('policies_privacy_policy_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={8}
            />
          </div>
        </div>
      </div>

      {/* Terms of Use */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.termsOfUse}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Terms of Use (English)' : '利用規約（英語）'}
            </label>
            <textarea
              value={formData.policies_terms_of_use_en}
              onChange={e => handleChange('policies_terms_of_use_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Terms of Use (Japanese)' : '利用規約（日本語）'}
            </label>
            <textarea
              value={formData.policies_terms_of_use_jp}
              onChange={e => handleChange('policies_terms_of_use_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={8}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
        >
          {language === 'en' ? 'Cancel' : 'キャンセル'}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {language === 'en' ? 'Save Changes' : '変更を保存'}
        </button>
      </div>
    </form>
  );
}
