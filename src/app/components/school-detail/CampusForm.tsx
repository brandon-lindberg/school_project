import { useState } from 'react';
import { School } from '@/types/school';
import { Language } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';

interface CampusFormProps {
  school: School;
  translations: Translations;
  language: Language;
  onSave: (data: Partial<School>) => Promise<void>;
  onCancel: () => void;
}

export function CampusForm({ school, translations, language, onSave, onCancel }: CampusFormProps) {
  const [formData, setFormData] = useState({
    campus_facilities_en: school.campus_facilities_en ?? [],
    campus_facilities_jp: school.campus_facilities_jp ?? [],
    campus_virtual_tour_en: school.campus_virtual_tour_en ?? '',
    campus_virtual_tour_jp: school.campus_virtual_tour_jp ?? '',
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
      {/* Facilities */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">{translations.sections.facilities}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* English Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Facilities (English)' : '施設（英語）'}
            </label>
            {formData.campus_facilities_en.map((facility, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={facility}
                  onChange={e => handleArrayChange('campus_facilities_en', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                  placeholder={language === 'en' ? 'Enter facility' : '施設を入力'}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('campus_facilities_en', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('campus_facilities_en')}
              className="text-green-500 hover:text-green-700"
            >
              {language === 'en' ? '+ Add Facility' : '+ 施設を追加'}
            </button>
          </div>

          {/* Japanese Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Facilities (Japanese)' : '施設（日本語）'}
            </label>
            {formData.campus_facilities_jp.map((facility, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={facility}
                  onChange={e => handleArrayChange('campus_facilities_jp', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                  placeholder={language === 'en' ? 'Enter facility' : '施設を入力'}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('campus_facilities_jp', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('campus_facilities_jp')}
              className="text-green-500 hover:text-green-700"
            >
              {language === 'en' ? '+ Add Facility' : '+ 施設を追加'}
            </button>
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
              value={formData.campus_virtual_tour_en}
              onChange={e => handleChange('campus_virtual_tour_en', e.target.value)}
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
              value={formData.campus_virtual_tour_jp}
              onChange={e => handleChange('campus_virtual_tour_jp', e.target.value)}
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
