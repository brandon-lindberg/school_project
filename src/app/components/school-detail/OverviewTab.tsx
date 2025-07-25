import { useState, useEffect } from 'react';
import type { ZodIssue } from 'zod';
import { School } from '@prisma/client';
import FallbackImage from '../FallbackImage';
import { Language, getLocalizedContent } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';
import { useSession } from 'next-auth/react';
import { ClaimSchoolModal } from './ClaimSchoolModal';
import NotificationBanner from '@/app/components/NotificationBanner';
import Image from 'next/image';
import { OverviewForm } from './OverviewForm';
import Link from 'next/link';

interface OverviewTabProps {
  school: School;
  translations: Translations;
  name?: string;
  shortDescription?: string;
  location?: string;
  address?: string;
  region?: string;
  country?: string;
  email?: string;
  phone?: string;
  url?: string;
  description?: string;
  affiliations: string[];
  accreditations: string[];
  language: Language;
  isSchoolAdmin?: boolean;
  onEdit?: () => void;
  onSave?: (data: Partial<School>) => Promise<void>;
}

export function OverviewTab({
  school,
  translations,
  name,
  shortDescription,
  description,
  language,
  isSchoolAdmin,
}: OverviewTabProps) {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  // NEW: compute banner image source, prioritizing external URL
  const bannerSrc = school.image_url
    ? school.image_url
    : school.image_id
      ? `/images/${school.image_id}.png`
      : '/school_placeholder.jpg';

  // Only fetch claim status if user is authenticated
  const [claimStatus, setClaimStatus] = useState<{
    isSchoolAdmin: boolean;
    hasExistingSchool: boolean;
    isClaimed: boolean;
    hasPendingClaim: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchClaimStatus = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(`/api/schools/${school.school_id}/claim/status`);
        if (response.ok) {
          const data = await response.json();
          setClaimStatus(data);
        }
      } catch (error) {
        console.error('Error fetching claim status:', error);
      }
    };

    if (isAuthenticated) {
      fetchClaimStatus();
    }
  }, [session?.user?.email, school.school_id, isAuthenticated]);

  const handleClaimSuccess = () => {
    setClaimStatus(prevStatus =>
      prevStatus
        ? {
          ...prevStatus,
          hasPendingClaim: true,
        }
        : null
    );
  };

  // Add notification auto-dismiss
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const canEdit = isSchoolAdmin || session?.user?.role === 'SUPER_ADMIN';

  const handleSave = async (data: Partial<School>) => {
    try {
      const response = await fetch(`/api/schools/${school.school_id}/basic`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        // Prefer showing validation error details if available
        const detailMsgs = Array.isArray(result.details)
          ? result.details.map((d: ZodIssue) => {
            const path = Array.isArray(d.path) && d.path.length ? d.path.join('.') : '';
            return path ? `${path}: ${d.message}` : d.message;
          }).join(', ')
          : '';
        const message = detailMsgs || result.error ||
          (language === 'en' ? 'Failed to save changes' : '変更の保存に失敗しました');
        throw new Error(message);
      }
      // Update the school data with the response
      Object.assign(school, result.school);
      setIsEditing(false);
      setNotification({
        type: 'success',
        message: language === 'en' ? 'Changes saved successfully' : '変更が保存されました',
      });
      // Refresh to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error saving changes:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : (language === 'en' ? 'Failed to save changes' : '変更の保存に失敗しました'),
      });
    }
  };

  if (isEditing && canEdit) {
    return (
      <div className="space-y-6">
        {notification && (
          <NotificationBanner
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
        <OverviewForm
          school={school}
          translations={translations}
          language={language}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Hero Section */}
      <div className="relative h-64 rounded-xl overflow-hidden">
        {bannerSrc.startsWith('http') ? (
          <Image
            src={bannerSrc}
            alt={name || ''}
            fill
            className="object-cover"
            unoptimized
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/school_placeholder.jpg';
            }}
          />
        ) : (
          <FallbackImage
            src={bannerSrc}
            alt={name || ''}
            className="w-full h-full object-cover"
            fallbackSrc="/school_placeholder.jpg"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end">
          <div className="p-4 sm:p-6 text-white">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{name}</h1>
            <p className="text-base sm:text-lg">{shortDescription}</p>
            {!canEdit && !claimStatus?.isClaimed && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      setIsClaimModalOpen(true);
                    } else {
                      setLoginPromptOpen(true);
                    }
                  }}
                  className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg transition-colors"
                  disabled={claimStatus?.hasPendingClaim || claimStatus?.hasExistingSchool}
                >
                  {claimStatus?.hasPendingClaim ? (
                    (language === 'en' ? 'Claim Pending' : '申請審査中')
                  ) : claimStatus?.hasExistingSchool ? (
                    (language === 'en' ? 'Already Managing Another School' : '他の学校を管理中')
                  ) : (
                    (language === 'en' ? 'Claim School' : '学校を申請する')
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Location Card */}
        {(getLocalizedContent(school.location_en, school.location_jp, language) ||
          getLocalizedContent(school.region_en, school.region_jp, language) ||
          getLocalizedContent(school.country_en, school.country_jp, language)) && (
            <div className="bg-neutral-50 rounded-md p-6">
              <h2 className="text-xl font-semibold mb-4">{translations.sections.location}</h2>
              <div className="space-y-2">
                {getLocalizedContent(school.location_en, school.location_jp, language) && (
                  <p className="text-gray-600">
                    City: {getLocalizedContent(school.location_en, school.location_jp, language)}
                  </p>
                )}
                {getLocalizedContent(school.region_en, school.region_jp, language) && (
                  <p className="text-gray-600">
                    Region: {getLocalizedContent(school.region_en, school.region_jp, language)}
                  </p>
                )}
                {getLocalizedContent(school.country_en, school.country_jp, language) && (
                  <p className="text-gray-600">
                    Country: {getLocalizedContent(school.country_en, school.country_jp, language)}
                  </p>
                )}
              </div>
            </div>
          )}

        {/* Contact Card */}
        {(getLocalizedContent(school.address_en, school.address_jp, language) ||
          getLocalizedContent(school.email_en, school.email_jp, language) ||
          getLocalizedContent(school.phone_en, school.phone_jp, language) ||
          getLocalizedContent(school.url_en, school.url_jp, language)) && (
            <div className="bg-neutral-50 rounded-md p-6 md:col-span-2 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{translations.sections.contactInfo}</h2>
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors text-xs"
                  >
                    {translations.buttons.edit}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {getLocalizedContent(school.address_en, school.address_jp, language) && (
                  <p className="text-gray-600">
                    <span className="font-medium">{translations.sections.address}</span>{' '}
                    {getLocalizedContent(school.address_en, school.address_jp, language)}
                  </p>
                )}
                {getLocalizedContent(school.email_en, school.email_jp, language) && (
                  <p className="text-gray-600">
                    <span className="font-medium">{translations.sections.email}:</span>{' '}
                    {getLocalizedContent(school.email_en, school.email_jp, language)}
                  </p>
                )}
                {getLocalizedContent(school.phone_en, school.phone_jp, language) && (
                  <p className="text-gray-600">
                    <span className="font-medium">{translations.sections.phone}:</span>{' '}
                    {getLocalizedContent(school.phone_en, school.phone_jp, language)}
                  </p>
                )}
                {getLocalizedContent(school.url_en, school.url_jp, language) && (
                  <a
                    href={getLocalizedContent(school.url_en, school.url_jp, language)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-primary hover:text-primary/90"
                  >
                    {translations.sections.visitWebsite}
                  </a>
                )}
              </div>
            </div>
          )}
      </div>

      {/* Description */}
      {description && (
        <div className="bg-neutral-50 rounded-md p-6">
          <h2 className="text-xl font-semibold mb-4">{translations.sections.description}</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{description}</p>
        </div>
      )}

      {/* Affiliations & Accreditations */}
      {((language === 'en' ? school.affiliations_en?.length : school.affiliations_jp?.length) > 0 ||
        (language === 'en' ? school.accreditation_en?.length : school.accreditation_jp?.length) > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Affiliations */}
            <div className="bg-neutral-50 rounded-md p-6">
              <h2 className="text-xl font-semibold mb-4">{translations.sections.affiliations}</h2>
              <ul className="list-disc list-inside space-y-2">
                {(language === 'en' ? school.affiliations_en : school.affiliations_jp)?.map(
                  (affiliation, index) => (
                    <li key={index} className="text-gray-600">
                      {affiliation}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Accreditations */}
            <div className="bg-neutral-50 rounded-md p-6">
              <h2 className="text-xl font-semibold mb-4">{translations.sections.accreditations}</h2>
              <ul className="list-disc list-inside space-y-2">
                {(language === 'en' ? school.accreditation_en : school.accreditation_jp)?.map(
                  (accreditation, index) => (
                    <li key={index} className="text-gray-600">
                      {accreditation}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        )}

      {/* Claim School Modal */}
      <ClaimSchoolModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={handleClaimSuccess}
        schoolId={school.school_id}
        onNotification={setNotification}
      />
      {loginPromptOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {language === 'en' ? 'Claim School' : '学校を申請する'}
            </h2>
            <p className="mb-4 text-gray-700">
              {language === 'en'
                ? 'Are you a school administrator for this school? Claiming this school gives you access to update and manage its details. To claim this school, please log in or register.'
                : '学校を申請すると、その詳細を更新および管理できるようになります。申請するには、ログインまたは登録してください。'}
            </p>
            <div className="flex justify-end space-x-2">
              <Link
                href={`/login?next=/schools/${school.school_id}`}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                {language === 'en' ? 'Login' : 'ログイン'}
              </Link>
              <Link
                href={`/register?next=/schools/${school.school_id}`}
                className="px-4 py-2 border border-primary text-primary bg-white rounded hover:bg-primary/10"
              >
                {language === 'en' ? 'Register' : '登録'}
              </Link>
              <button
                onClick={() => setLoginPromptOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {language === 'en' ? 'Close' : '閉じる'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
