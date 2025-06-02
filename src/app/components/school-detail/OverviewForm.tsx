import type { School as PrismaSchool } from '@prisma/client';
// Extend PrismaSchool to include optional client-side image URLs
type SchoolWithUrls = PrismaSchool & {
  image_url?: string | null;
  logo_url?: string | null;
};
import React, { useState } from 'react';

interface OverviewFormProps {
  school: SchoolWithUrls;
  translations: {
    sections: {
      [key: string]: string;
    };
  };
  language: 'en' | 'jp';
  onSave: (data: Partial<SchoolWithUrls>) => Promise<void>;
  onCancel: () => void;
}

export function OverviewForm({
  school,
  translations,
  language,
  onSave,
  onCancel,
}: OverviewFormProps) {
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
    phone_en: school.phone_en ?? '',
    phone_jp: school.phone_jp ?? '',
    email_en: school.email_en ?? '',
    email_jp: school.email_jp ?? '',
    url_en: school.url_en ?? '',
    url_jp: school.url_jp ?? '',
    country_en: school.country_en ?? '',
    country_jp: school.country_jp ?? '',
    region_en: school.region_en ?? '',
    region_jp: school.region_jp ?? '',
    geography_en: school.geography_en ?? '',
    geography_jp: school.geography_jp ?? '',
    logo_id: school.logo_id ?? '',
    image_url: school.image_url ?? '',
    logo_url: school.logo_url ?? '',
    affiliations_en: school.affiliations_en ?? [],
    affiliations_jp: school.affiliations_jp ?? [],
    accreditation_en: school.accreditation_en ?? [],
    accreditation_jp: school.accreditation_jp ?? [],
    staff_staff_list_en: school.staff_staff_list_en ?? [],
    staff_staff_list_jp: school.staff_staff_list_jp ?? [],
    staff_board_members_en: school.staff_board_members_en ?? [],
    staff_board_members_jp: school.staff_board_members_jp ?? [],
  });

  const [errors, setErrors] = useState<{
    name_en?: string;
    location_en?: string;
    url_en?: string;
    url_jp?: string;
  }>({});

  // Add validation state
  const isFormValid = Boolean(
    formData.name_en?.trim() &&
    formData.location_en?.trim() &&
    (!formData.url_en || /^https?:\/\//i.test(formData.url_en)) &&
    (!formData.url_jp || /^https?:\/\//i.test(formData.url_jp))
  );

  const handleChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for the changed field
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleArrayChange = (field: keyof typeof formData, value: string, index: number) => {
    if (Array.isArray(formData[field])) {
      const newArray = [...(formData[field] as string[])];
      newArray[index] = value;
      handleChange(field, newArray);
    }
  };

  const handleAddArrayItem = (field: keyof typeof formData) => {
    if (Array.isArray(formData[field])) {
      handleChange(field, [...(formData[field] as string[]), '']);
    }
  };

  const handleRemoveArrayItem = (field: keyof typeof formData, index: number) => {
    if (Array.isArray(formData[field])) {
      const newArray = [...(formData[field] as string[])];
      newArray.splice(index, 1);
      handleChange(field, newArray);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newErrors: {
        name_en?: string;
        location_en?: string;
        url_en?: string;
        url_jp?: string;
      } = {};

      // Validate required fields
      if (!formData.name_en?.trim()) {
        newErrors.name_en = language === 'en' ? 'School name is required' : '学校名は必須です';
      }
      if (!formData.location_en?.trim()) {
        newErrors.location_en = language === 'en' ? 'Location is required' : '所在地は必須です';
      }

      // Format URLs to ensure they have proper protocol
      const formatUrl = (url: string) => {
        if (!url || url.trim() === '') return '';
        const trimmedUrl = url.trim();
        if (!/^https?:\/\//i.test(trimmedUrl)) {
          return `https://${trimmedUrl}`;
        }
        return trimmedUrl;
      };

      // Validate URLs if they are not empty
      const validateUrl = (url: string): boolean => {
        if (!url || url.trim() === '') return true;
        try {
          new URL(formatUrl(url));
          return true;
        } catch {
          return false;
        }
      };

      if (formData.url_en && !validateUrl(formData.url_en)) {
        newErrors.url_en = language === 'en' ? 'Invalid URL format' : '無効なURL形式です';
      }
      if (formData.url_jp && !validateUrl(formData.url_jp)) {
        newErrors.url_jp = language === 'en' ? 'Invalid URL format' : '無効なURL形式です';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error('Please fix the validation errors');
      }

      const dataToSubmit = {
        ...formData,
        url_en: formatUrl(formData.url_en),
        url_jp: formatUrl(formData.url_jp),
        image_url: formData.image_url,
        logo_url: formData.logo_url,
      };

      await onSave(dataToSubmit);
    } catch (error) {
      console.error('Error in form submission:', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* School Name */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.name}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="text-gray-700">
                {language === 'en' ? 'School Name (English)' : '学校名（英語）'}
              </span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.name_en}
              onChange={e => {
                handleChange('name_en', e.target.value);
                if (errors.name_en) {
                  setErrors(prev => ({ ...prev, name_en: undefined }));
                }
              }}
              className={`w-full rounded-md border p-2 ${errors.name_en ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.name_en && <p className="mt-1 text-sm text-red-500">{errors.name_en}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
      </div>

      {/* Short Description */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.shortDescription}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Short Description (English)' : '短い説明（英語）'}
            </label>
            <textarea
              value={formData.short_description_en}
              onChange={e => handleChange('short_description_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Short Description (Japanese)' : '短い説明（日本語）'}
            </label>
            <textarea
              value={formData.short_description_jp}
              onChange={e => handleChange('short_description_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.description}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Description (English)' : '説明（英語）'}
            </label>
            <textarea
              value={formData.description_en}
              onChange={e => handleChange('description_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Description (Japanese)' : '説明（日本語）'}
            </label>
            <textarea
              value={formData.description_jp}
              onChange={e => handleChange('description_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              rows={6}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.contact}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <span className="text-gray-700">
                {language === 'en' ? 'Location (English)' : '所在地（英語）'}
              </span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.location_en}
              onChange={e => {
                handleChange('location_en', e.target.value);
                if (errors.location_en) {
                  setErrors(prev => ({ ...prev, location_en: undefined }));
                }
              }}
              className={`w-full rounded-md border p-2 ${errors.location_en ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.location_en && (
              <p className="mt-1 text-sm text-red-500">{errors.location_en}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Location (Japanese)' : '所在地（日本語）'}
            </label>
            <input
              type="text"
              value={formData.location_jp}
              onChange={e => handleChange('location_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Address (English)' : '住所（英語）'}
            </label>
            <input
              type="text"
              value={formData.address_en}
              onChange={e => handleChange('address_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Address (Japanese)' : '住所（日本語）'}
            </label>
            <input
              type="text"
              value={formData.address_jp}
              onChange={e => handleChange('address_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Phone (Japanese)' : '電話番号（日本語）'}
            </label>
            <input
              type="text"
              value={formData.phone_jp}
              onChange={e => handleChange('phone_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Email (Japanese)' : 'メール（日本語）'}
            </label>
            <input
              type="email"
              value={formData.email_jp}
              onChange={e => handleChange('email_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Website URL (English)' : 'ウェブサイト（英語）'}
            </label>
            <input
              type="url"
              value={formData.url_en}
              onChange={e => {
                handleChange('url_en', e.target.value);
                if (errors.url_en) {
                  setErrors(prev => ({ ...prev, url_en: undefined }));
                }
              }}
              className={`w-full rounded-md border p-2 ${errors.url_en ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="https://example.com"
            />
            {errors.url_en && <p className="mt-1 text-sm text-red-500">{errors.url_en}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Website URL (Japanese)' : 'ウェブサイト（日本語）'}
            </label>
            <input
              type="url"
              value={formData.url_jp}
              onChange={e => {
                handleChange('url_jp', e.target.value);
                if (errors.url_jp) {
                  setErrors(prev => ({ ...prev, url_jp: undefined }));
                }
              }}
              className={`w-full rounded-md border p-2 ${errors.url_jp ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="https://example.com"
            />
            {errors.url_jp && <p className="mt-1 text-sm text-red-500">{errors.url_jp}</p>}
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.location}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Country (English)' : '国（英語）'}
            </label>
            <input
              type="text"
              value={formData.country_en}
              onChange={e => handleChange('country_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Country (Japanese)' : '国（日本語）'}
            </label>
            <input
              type="text"
              value={formData.country_jp}
              onChange={e => handleChange('country_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Region (English)' : '地域（英語）'}
            </label>
            <input
              type="text"
              value={formData.region_en}
              onChange={e => handleChange('region_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Region (Japanese)' : '地域（日本語）'}
            </label>
            <input
              type="text"
              value={formData.region_jp}
              onChange={e => handleChange('region_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          {/* Geography */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Geography (English)' : '地理（英語）'}
            </label>
            <input
              type="text"
              value={formData.geography_en}
              onChange={e => handleChange('geography_en', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Geography (Japanese)' : '地理（日本語）'}
            </label>
            <input
              type="text"
              value={formData.geography_jp}
              onChange={e => handleChange('geography_jp', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
        </div>
      </div>

      {/* External Banner Image URL */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{language === 'en' ? 'External Banner Image URL' : '外部バナー画像URL'}</h3>
        <input
          type="url"
          value={formData.image_url}
          onChange={e => handleChange('image_url', e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2"
          placeholder="https://example.com/banner.jpg"
        />
      </div>

      {/* External Logo Image URL */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{language === 'en' ? 'External Logo URL' : '外部ロゴURL'}</h3>
        <input
          type="url"
          value={formData.logo_url}
          onChange={e => handleChange('logo_url', e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2"
          placeholder="https://example.com/logo.png"
        />
      </div>

      {/* Affiliations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.affiliations}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* English Affiliations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Affiliations (English)' : '提携（英語）'}
            </label>
            {formData.affiliations_en.map((affiliation, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={affiliation}
                  onChange={e => handleArrayChange('affiliations_en', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('affiliations_en', index)}
                  className="ml-2 px-2 py-1 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('affiliations_en')}
              className="mt-2 text-sm text-green-600 hover:text-green-800"
            >
              + Add Affiliation
            </button>
          </div>

          {/* Japanese Affiliations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Affiliations (Japanese)' : '提携（日本語）'}
            </label>
            {formData.affiliations_jp.map((affiliation, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={affiliation}
                  onChange={e => handleArrayChange('affiliations_jp', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('affiliations_jp', index)}
                  className="ml-2 px-2 py-1 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('affiliations_jp')}
              className="mt-2 text-sm text-green-600 hover:text-green-800"
            >
              + Add Affiliation
            </button>
          </div>
        </div>
      </div>

      {/* Accreditations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{translations.sections.accreditations}</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* English Accreditations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Accreditations (English)' : '認定（英語）'}
            </label>
            {formData.accreditation_en.map((accreditation, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={accreditation}
                  onChange={e => handleArrayChange('accreditation_en', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('accreditation_en', index)}
                  className="ml-2 px-2 py-1 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('accreditation_en')}
              className="mt-2 text-sm text-green-600 hover:text-green-800"
            >
              + Add Accreditation
            </button>
          </div>

          {/* Japanese Accreditations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Accreditations (Japanese)' : '認定（日本語）'}
            </label>
            {formData.accreditation_jp.map((accreditation, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={accreditation}
                  onChange={e => handleArrayChange('accreditation_jp', e.target.value, index)}
                  className="flex-1 rounded-md border border-gray-300 p-2"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('accreditation_jp', index)}
                  className="ml-2 px-2 py-1 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('accreditation_jp')}
              className="mt-2 text-sm text-green-600 hover:text-green-800"
            >
              + Add Accreditation
            </button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between space-x-4 pt-4 border-t">
        <p className="text-sm text-gray-600">
          <span className="text-red-500">*</span>{' '}
          {language === 'en' ? 'Required fields' : '必須項目'}
        </p>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            {language === 'en' ? 'Cancel' : 'キャンセル'}
          </button>
          <button
            type="submit"
            disabled={!isFormValid}
            className={`px-4 py-2 rounded transition-colors ${isFormValid
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {language === 'en' ? 'Save Changes' : '変更を保存'}
          </button>
        </div>
      </div>
    </form>
  );
}
