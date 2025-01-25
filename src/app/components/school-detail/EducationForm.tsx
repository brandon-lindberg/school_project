import { useState } from 'react';
import type { School } from '@/types/school';
import { Language } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';

interface EducationFormProps {
  school: School;
  translations: Translations;
  language: Language;
  onSave: (data: Partial<School>) => Promise<void>;
  onCancel: () => void;
}

export function EducationForm({
  school,
  translations,
  language,
  onSave,
  onCancel,
}: EducationFormProps) {
  const [formData, setFormData] = useState({
    education_programs_offered_en: school.education_programs_offered_en ?? [],
    education_programs_offered_jp: school.education_programs_offered_jp ?? [],
    education_curriculum_en: school.education_curriculum_en ?? '',
    education_curriculum_jp: school.education_curriculum_jp ?? '',
    education_academic_support_en: school.education_academic_support_en ?? [],
    education_academic_support_jp: school.education_academic_support_jp ?? [],
    education_extracurricular_activities_en: school.education_extracurricular_activities_en ?? [],
    education_extracurricular_activities_jp: school.education_extracurricular_activities_jp ?? [],
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
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Programs Offered */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">
          {translations.sections.programsOffered}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* English Programs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Programs (English)' : 'プログラム（英語）'}
            </label>
            {formData.education_programs_offered_en.map((program, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={program}
                  onChange={e => handleArrayChange('education_programs_offered_en', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('education_programs_offered_en', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('education_programs_offered_en')}
              className="text-green-500 hover:text-green-700"
            >
              + Add Program
            </button>
          </div>

          {/* Japanese Programs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Programs (Japanese)' : 'プログラム（日本語）'}
            </label>
            {formData.education_programs_offered_jp.map((program, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={program}
                  onChange={e => handleArrayChange('education_programs_offered_jp', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('education_programs_offered_jp', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('education_programs_offered_jp')}
              className="text-green-500 hover:text-green-700"
            >
              + プログラムを追加
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {translations.sections.curriculum}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Curriculum (English)' : 'カリキュラム（英語）'}
            </label>
            <textarea
              value={formData.education_curriculum_en}
              onChange={e => handleChange('education_curriculum_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Curriculum (Japanese)' : 'カリキュラム（日本語）'}
            </label>
            <textarea
              value={formData.education_curriculum_jp}
              onChange={e => handleChange('education_curriculum_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Academic Support */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">
          {translations.sections.academicSupportTitle}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* English Academic Support */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Academic Support (English)' : '学習サポート（英語）'}
            </label>
            {formData.education_academic_support_en.map((support, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={support}
                  onChange={e => handleArrayChange('education_academic_support_en', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('education_academic_support_en', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('education_academic_support_en')}
              className="text-green-500 hover:text-green-700"
            >
              + Add Support Service
            </button>
          </div>

          {/* Japanese Academic Support */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Academic Support (Japanese)' : '学習サポート（日本語）'}
            </label>
            {formData.education_academic_support_jp.map((support, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={support}
                  onChange={e => handleArrayChange('education_academic_support_jp', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('education_academic_support_jp', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('education_academic_support_jp')}
              className="text-green-500 hover:text-green-700"
            >
              + サポートサービスを追加
            </button>
          </div>
        </div>
      </div>

      {/* Extracurricular Activities */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">
          {translations.sections.extracurricular}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* English Extracurricular */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Extracurricular Activities (English)' : '課外活動（英語）'}
            </label>
            {formData.education_extracurricular_activities_en.map((activity, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={activity}
                  onChange={e => handleArrayChange('education_extracurricular_activities_en', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('education_extracurricular_activities_en', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('education_extracurricular_activities_en')}
              className="text-green-500 hover:text-green-700"
            >
              + Add Activity
            </button>
          </div>

          {/* Japanese Extracurricular */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Extracurricular Activities (Japanese)' : '課外活動（日本語）'}
            </label>
            {formData.education_extracurricular_activities_jp.map((activity, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={activity}
                  onChange={e => handleArrayChange('education_extracurricular_activities_jp', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('education_extracurricular_activities_jp', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('education_extracurricular_activities_jp')}
              className="text-green-500 hover:text-green-700"
            >
              + 活動を追加
            </button>
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
