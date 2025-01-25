import { useState, useEffect } from 'react';
import { School } from '@prisma/client';
import FallbackImage from '../FallbackImage';
import { Language, getLocalizedContent } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';
import { useSession } from 'next-auth/react';
import { ClaimSchoolModal } from './ClaimSchoolModal';
import NotificationBanner from '@/app/components/NotificationBanner';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { OverviewForm } from './OverviewForm';

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
  affiliations,
  accreditations,
  language,
  isSchoolAdmin,
  onEdit,
  onSave,
}: OverviewTabProps) {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const { data: session } = useSession();
  const isAuthenticated = !!session;

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      setIsEditing(false);
      setNotification({
        type: 'success',
        message: language === 'en' ? 'Changes saved successfully' : '変更が保存されました',
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      setNotification({
        type: 'error',
        message: language === 'en' ? 'Failed to save changes' : '変更の保存に失敗しました',
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
        <FallbackImage
          src={school.image_id ? `/images/${school.image_id}.png` : '/school_placeholder.jpg'}
          alt={name || ''}
          className="w-full h-full object-cover"
          fallbackSrc="/school_placeholder.jpg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="p-6 text-white">
            <h1 className="text-4xl font-bold mb-2">{name}</h1>
            <p className="text-lg">{shortDescription}</p>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Location Card */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">{translations.sections.location}</h2>
          <div className="space-y-2">
            {getLocalizedContent(school.location_en, school.location_jp, language) && (
              <p className="text-gray-600">
                {getLocalizedContent(school.location_en, school.location_jp, language)}
              </p>
            )}
            {getLocalizedContent(school.region_en, school.region_jp, language) && (
              <p className="text-gray-600">
                {getLocalizedContent(school.region_en, school.region_jp, language)}
              </p>
            )}
            {getLocalizedContent(school.country_en, school.country_jp, language) && (
              <p className="text-gray-600">
                {getLocalizedContent(school.country_en, school.country_jp, language)}
              </p>
            )}
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">{translations.sections.contactInfo}</h2>
          <div className="space-y-2">
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
                className="text-green-500 hover:text-green-600"
              >
                {translations.sections.visitWebsite}
              </a>
            )}
          </div>
        </div>

        {/* School Administration Card - Only show if authenticated */}
        {isAuthenticated && !canEdit ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{translations.sections.schoolAdmin}</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                {language === 'en'
                  ? 'Are you a school administrator? Claim this school to manage its information.'
                  : '学校の管理者ですか？学校を申請して情報を管理できます。'}
              </p>
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className={`w-full px-4 py-2 rounded transition-colors flex items-center justify-center ${claimStatus?.hasPendingClaim
                  ? 'bg-yellow-500 hover:bg-yellow-600 cursor-not-allowed'
                  : claimStatus?.isClaimed
                    ? 'bg-gray-500 cursor-not-allowed'
                    : claimStatus?.hasExistingSchool
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                disabled={
                  claimStatus?.hasPendingClaim ||
                  claimStatus?.isClaimed ||
                  claimStatus?.hasExistingSchool
                }
              >
                {claimStatus?.isClaimed ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    {language === 'en' ? 'Already Claimed' : '申請済み'}
                  </>
                ) : claimStatus?.hasPendingClaim ? (
                  language === 'en' ? (
                    'Claim Pending'
                  ) : (
                    '申請審査中'
                  )
                ) : claimStatus?.hasExistingSchool ? (
                  language === 'en' ? (
                    'Already Managing Another School'
                  ) : (
                    '他の学校を管理中'
                  )
                ) : language === 'en' ? (
                  'Claim School'
                ) : (
                  '学校を申請する'
                )}
              </button>
            </div>
          </div>
        ) : canEdit ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{translations.sections.schoolAdmin}</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>{translations.buttons.edit}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Description */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">{translations.sections.description}</h2>
        <p className="text-gray-600 whitespace-pre-wrap">{description}</p>
      </div>

      {/* Affiliations & Accreditations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Affiliations */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">{translations.sections.affiliations}</h2>
          <ul className="list-disc list-inside space-y-2">
            {(language === 'en' ? school.affiliations_en : school.affiliations_jp)?.map((affiliation, index) => (
              <li key={index} className="text-gray-600">
                {affiliation}
              </li>
            ))}
          </ul>
        </div>

        {/* Accreditations */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">{translations.sections.accreditations}</h2>
          <ul className="list-disc list-inside space-y-2">
            {(language === 'en' ? school.accreditation_en : school.accreditation_jp)?.map((accreditation, index) => (
              <li key={index} className="text-gray-600">
                {accreditation}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Claim School Modal */}
      <ClaimSchoolModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={handleClaimSuccess}
        schoolId={school.school_id}
        onNotification={setNotification}
      />
    </div>
  );
}
