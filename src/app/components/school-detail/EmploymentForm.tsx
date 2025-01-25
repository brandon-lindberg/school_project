import { useState } from 'react';
import { School } from '@/types/school';
import { Language } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';

interface EmploymentFormProps {
  school: School;
  translations: Translations;
  language: Language;
  onSave: (data: Partial<School>) => Promise<void>;
  onCancel: () => void;
}

export function EmploymentForm({
  school,
  translations,
  language,
  onSave,
  onCancel,
}: EmploymentFormProps) {
  const [formData, setFormData] = useState({
    employment_open_positions_en: school.employment_open_positions_en ?? [],
    employment_open_positions_jp: school.employment_open_positions_jp ?? [],
    employment_application_process_en: school.employment_application_process_en ?? '',
    employment_application_process_jp: school.employment_application_process_jp ?? '',
    staff_staff_list_en: school.staff_staff_list_en ?? [],
    staff_staff_list_jp: school.staff_staff_list_jp ?? [],
    staff_board_members_en: school.staff_board_members_en ?? [],
    staff_board_members_jp: school.staff_board_members_jp ?? [],
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
      {/* Open Positions */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">{translations.sections.openPositions}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* English Open Positions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Open Positions (English)' : '求人情報（英語）'}
            </label>
            {formData.employment_open_positions_en.map((position, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={position}
                  onChange={e => handleArrayChange('employment_open_positions_en', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                  placeholder={language === 'en' ? 'Enter position' : '職種を入力'}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('employment_open_positions_en', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('employment_open_positions_en')}
              className="text-green-500 hover:text-green-700"
            >
              {language === 'en' ? '+ Add Position' : '+ 職種を追加'}
            </button>
          </div>

          {/* Japanese Open Positions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Open Positions (Japanese)' : '求人情報（日本語）'}
            </label>
            {formData.employment_open_positions_jp.map((position, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={position}
                  onChange={e => handleArrayChange('employment_open_positions_jp', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                  placeholder={language === 'en' ? 'Enter position' : '職種を入力'}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('employment_open_positions_jp', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('employment_open_positions_jp')}
              className="text-green-500 hover:text-green-700"
            >
              {language === 'en' ? '+ Add Position' : '+ 職種を追加'}
            </button>
          </div>
        </div>
      </div>

      {/* Application Process */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.applicationProcess}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Application Process (English)' : '応募プロセス（英語）'}
            </label>
            <textarea
              value={formData.employment_application_process_en}
              onChange={e => handleChange('employment_application_process_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Application Process (Japanese)' : '応募プロセス（日本語）'}
            </label>
            <textarea
              value={formData.employment_application_process_jp}
              onChange={e => handleChange('employment_application_process_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">{translations.sections.staffList}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* English Staff List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Staff List (English)' : 'スタッフリスト（英語）'}
            </label>
            {formData.staff_staff_list_en.map((staff, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={staff}
                  onChange={e => handleArrayChange('staff_staff_list_en', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                  placeholder={language === 'en' ? 'Enter staff member' : 'スタッフ名を入力'}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('staff_staff_list_en', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('staff_staff_list_en')}
              className="text-green-500 hover:text-green-700"
            >
              {language === 'en' ? '+ Add Staff Member' : '+ スタッフを追加'}
            </button>
          </div>

          {/* Japanese Staff List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Staff List (Japanese)' : 'スタッフリスト（日本語）'}
            </label>
            {formData.staff_staff_list_jp.map((staff, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={staff}
                  onChange={e => handleArrayChange('staff_staff_list_jp', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                  placeholder={language === 'en' ? 'Enter staff member' : 'スタッフ名を入力'}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('staff_staff_list_jp', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('staff_staff_list_jp')}
              className="text-green-500 hover:text-green-700"
            >
              {language === 'en' ? '+ Add Staff Member' : '+ スタッフを追加'}
            </button>
          </div>
        </div>
      </div>

      {/* Board Members */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">{translations.sections.boardMembers}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* English Board Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Board Members (English)' : '理事会メンバー（英語）'}
            </label>
            {formData.staff_board_members_en.map((member, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={member}
                  onChange={e => handleArrayChange('staff_board_members_en', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                  placeholder={language === 'en' ? 'Enter board member' : '理事名を入力'}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('staff_board_members_en', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('staff_board_members_en')}
              className="text-green-500 hover:text-green-700"
            >
              {language === 'en' ? '+ Add Board Member' : '+ 理事を追加'}
            </button>
          </div>

          {/* Japanese Board Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Board Members (Japanese)' : '理事会メンバー（日本語）'}
            </label>
            {formData.staff_board_members_jp.map((member, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={member}
                  onChange={e => handleArrayChange('staff_board_members_jp', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                  placeholder={language === 'en' ? 'Enter board member' : '理事名を入力'}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('staff_board_members_jp', index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('staff_board_members_jp')}
              className="text-green-500 hover:text-green-700"
            >
              {language === 'en' ? '+ Add Board Member' : '+ 理事を追加'}
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
