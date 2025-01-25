import { useState } from 'react';
import { School } from '@/types/school';
import { Language } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';

interface BasicInfoFormProps {
  school: School;
  translations: Translations;
  language: Language;
  onSave: (data: Partial<School>) => Promise<void>;
  onCancel: () => void;
}

export function BasicInfoForm({ school, language, onSave, onCancel }: BasicInfoFormProps) {
  const [formData, setFormData] = useState({
    name_en: school.name_en ?? '',
    name_jp: school.name_jp ?? '',
    short_description_en: school.short_description_en ?? '',
    short_description_jp: school.short_description_jp ?? '',
    description_en: school.description_en ?? '',
    description_jp: school.description_jp ?? '',
    location_en: school.location_en ?? '',
    location_jp: school.location_jp ?? '',
    address_en: school.address_en ?? '',
    address_jp: school.address_jp ?? '',
    region_en: school.region_en ?? '',
    region_jp: school.region_jp ?? '',
    country_en: school.country_en ?? '',
    country_jp: school.country_jp ?? '',
    phone_en: school.phone_en ?? '',
    phone_jp: school.phone_jp ?? '',
    email_en: school.email_en ?? '',
    email_jp: school.email_jp ?? '',
    url_en: school.url_en ?? '',
    url_jp: school.url_jp ?? '',
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'School Name (English)' : '学校名（英語）'}
          </label>
          <input
            type="text"
            value={formData.name_en}
            onChange={e => handleChange('name_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'School Name (Japanese)' : '学校名（日本語）'}
          </label>
          <input
            type="text"
            value={formData.name_jp}
            onChange={e => handleChange('name_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Short Description */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Short Description (English)' : '簡単な説明（英語）'}
          </label>
          <textarea
            value={formData.short_description_en}
            onChange={e => handleChange('short_description_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Short Description (Japanese)' : '簡単な説明（日本語）'}
          </label>
          <textarea
            value={formData.short_description_jp}
            onChange={e => handleChange('short_description_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
          />
        </div>
      </div>

      {/* Full Description */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Full Description (English)' : '詳細な説明（英語）'}
          </label>
          <textarea
            value={formData.description_en}
            onChange={e => handleChange('description_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Full Description (Japanese)' : '詳細な説明（日本語）'}
          </label>
          <textarea
            value={formData.description_jp}
            onChange={e => handleChange('description_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={6}
          />
        </div>
      </div>

      {/* Location Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Location (English)' : '場所（英語）'}
          </label>
          <input
            type="text"
            value={formData.location_en}
            onChange={e => handleChange('location_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Location (Japanese)' : '場所（日本語）'}
          </label>
          <input
            type="text"
            value={formData.location_jp}
            onChange={e => handleChange('location_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Phone (English)' : '電話番号（英語）'}
          </label>
          <input
            type="text"
            value={formData.phone_en}
            onChange={e => handleChange('phone_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Phone (Japanese)' : '電話番号（日本語）'}
          </label>
          <input
            type="text"
            value={formData.phone_jp}
            onChange={e => handleChange('phone_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Email */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Email (English)' : 'メール（英語）'}
          </label>
          <input
            type="email"
            value={formData.email_en}
            onChange={e => handleChange('email_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Email (Japanese)' : 'メール（日本語）'}
          </label>
          <input
            type="email"
            value={formData.email_jp}
            onChange={e => handleChange('email_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
      </div>

      {/* Website URL */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Website URL (English)' : 'ウェブサイト（英語）'}
          </label>
          <input
            type="url"
            value={formData.url_en}
            onChange={e => handleChange('url_en', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'en' ? 'Website URL (Japanese)' : 'ウェブサイト（日本語）'}
          </label>
          <input
            type="url"
            value={formData.url_jp}
            onChange={e => handleChange('url_jp', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
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
