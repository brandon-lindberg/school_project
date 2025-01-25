import { useState } from 'react';
import { School } from '@/types/school';
import { Language } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';

interface StudentLifeFormProps {
  school: School;
  translations: Translations;
  language: Language;
  onSave: (data: Partial<School>) => Promise<void>;
  onCancel: () => void;
}

export function StudentLifeForm({
  school,
  translations,
  language,
  onSave,
  onCancel,
}: StudentLifeFormProps) {
  const [formData, setFormData] = useState({
    student_life_counseling_en: school.student_life_counseling_en ?? '',
    student_life_counseling_jp: school.student_life_counseling_jp ?? '',
    student_life_support_services_en: school.student_life_support_services_en ?? [],
    student_life_support_services_jp: school.student_life_support_services_jp ?? [],
    student_life_library_en: school.student_life_library_en ?? '',
    student_life_library_jp: school.student_life_library_jp ?? '',
    student_life_calendar_en: school.student_life_calendar_en ?? '',
    student_life_calendar_jp: school.student_life_calendar_jp ?? '',
    student_life_tour_en: school.student_life_tour_en ?? '',
    student_life_tour_jp: school.student_life_tour_jp ?? '',
  });

  const handleChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field: keyof typeof formData, value: string, index: number) => {
    if (!Array.isArray(formData[field])) return;

    setFormData(prev => {
      const array = [...(prev[field] as string[])];
      array[index] = value;
      return {
        ...prev,
        [field]: array,
      };
    });
  };

  const handleAddArrayItem = (field: keyof typeof formData) => {
    if (!Array.isArray(formData[field])) return;

    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ''],
    }));
  };

  const handleRemoveArrayItem = (field: keyof typeof formData, index: number) => {
    if (!Array.isArray(formData[field])) return;

    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
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
      {/* Counseling */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.counseling}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Counseling Services (English)' : 'カウンセリングサービス（英語）'}
            </label>
            <textarea
              value={formData.student_life_counseling_en}
              onChange={e => handleChange('student_life_counseling_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Counseling Services (Japanese)' : 'カウンセリングサービス（日本語）'}
            </label>
            <textarea
              value={formData.student_life_counseling_jp}
              onChange={e => handleChange('student_life_counseling_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Support Services */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">{translations.sections.supportServices}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* English Support Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Support Services (English)' : 'サポートサービス（英語）'}
            </label>
            {formData.student_life_support_services_en.map((service, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={service}
                  onChange={e => handleArrayChange('student_life_support_services_en', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                  placeholder={language === 'en' ? 'Enter service' : 'サービスを入力'}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('student_life_support_services_en', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('student_life_support_services_en')}
              className="text-green-500 hover:text-green-700"
            >
              {language === 'en' ? '+ Add Service' : '+ サービスを追加'}
            </button>
          </div>

          {/* Japanese Support Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Support Services (Japanese)' : 'サポートサービス（日本語）'}
            </label>
            {formData.student_life_support_services_jp.map((service, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={service}
                  onChange={e => handleArrayChange('student_life_support_services_jp', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                  placeholder={language === 'en' ? 'Enter service' : 'サービスを入力'}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('student_life_support_services_jp', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('student_life_support_services_jp')}
              className="text-green-500 hover:text-green-700"
            >
              {language === 'en' ? '+ Add Service' : '+ サービスを追加'}
            </button>
          </div>
        </div>
      </div>

      {/* Library */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.library}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Library Information (English)' : '図書館情報（英語）'}
            </label>
            <textarea
              value={formData.student_life_library_en}
              onChange={e => handleChange('student_life_library_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Library Information (Japanese)' : '図書館情報（日本語）'}
            </label>
            <textarea
              value={formData.student_life_library_jp}
              onChange={e => handleChange('student_life_library_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.calendar}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'School Calendar (English)' : '学校カレンダー（英語）'}
            </label>
            <textarea
              value={formData.student_life_calendar_en}
              onChange={e => handleChange('student_life_calendar_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'School Calendar (Japanese)' : '学校カレンダー（日本語）'}
            </label>
            <textarea
              value={formData.student_life_calendar_jp}
              onChange={e => handleChange('student_life_calendar_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Virtual Tour */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.virtualTour}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Virtual Tour URL (English)' : 'バーチャルツアーURL（英語）'}
            </label>
            <input
              type="url"
              value={formData.student_life_tour_en}
              onChange={e => handleChange('student_life_tour_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder={language === 'en' ? 'Enter URL' : 'URLを入力'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Virtual Tour URL (Japanese)' : 'バーチャルツアーURL（日本語）'}
            </label>
            <input
              type="url"
              value={formData.student_life_tour_jp}
              onChange={e => handleChange('student_life_tour_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder={language === 'en' ? 'Enter URL' : 'URLを入力'}
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
