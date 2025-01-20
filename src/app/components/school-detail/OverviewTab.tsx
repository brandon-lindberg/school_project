import { useState, useEffect } from 'react';
import { School } from '@/types/school';
import FallbackImage from '../FallbackImage';
import { Language, getLocalizedContent } from '@/utils/language';
import { Translations } from '../../../interfaces/Translations';
import { useSession } from 'next-auth/react';
import { ClaimSchoolModal } from './ClaimSchoolModal';
import NotificationBanner from '@/app/components/NotificationBanner';
import { useLanguage } from '@/app/contexts/LanguageContext';

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
}

export function OverviewTab({
  school,
  translations,
  name,
  shortDescription,
  location,
  address,
  region,
  country,
  email,
  phone,
  url,
  description,
  affiliations,
  accreditations,
}: OverviewTabProps) {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [hasPendingClaim, setHasPendingClaim] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const { language } = useLanguage();
  const { data: session } = useSession();

  useEffect(() => {
    // Check if user has a pending claim for this school
    const checkPendingClaim = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(`/api/schools/${school.school_id}/claim/status`);
        if (response.ok) {
          const data = await response.json();
          setHasPendingClaim(data.hasPendingClaim);
        }
      } catch (error) {
        console.error('Error checking claim status:', error);
      }
    };

    checkPendingClaim();
  }, [session?.user?.email, school.school_id]);

  const handleClaimSuccess = () => {
    setHasPendingClaim(true);
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

        {/* Claim School Card - Only show for logged-in users */}
        {session?.user && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'en' ? 'School Administration' : '学校管理'}
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                {hasPendingClaim
                  ? language === 'en'
                    ? 'Your claim is pending review. We will notify you once it has been processed.'
                    : '申請は審査中です。処理が完了次第、お知らせいたします。'
                  : language === 'en'
                    ? 'Are you a representative of this school? Claim this school to manage its information.'
                    : 'この学校の代表者の方ですか？学校情報を管理するには、学校の所有権を申請してください。'}
              </p>
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className={`w-full px-4 py-2 rounded transition-colors ${
                  hasPendingClaim
                    ? 'bg-yellow-500 hover:bg-yellow-600 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
                disabled={hasPendingClaim}
              >
                {hasPendingClaim
                  ? language === 'en'
                    ? 'Claim Pending'
                    : '申請審査中'
                  : language === 'en'
                    ? 'Claim School'
                    : '学校を申請する'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{translations.sections.aboutSchool}</h2>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
      </div>

      {/* Affiliations & Accreditations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {affiliations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">{translations.sections.affiliations}</h3>
            <ul className="list-disc list-inside space-y-2">
              {affiliations.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {accreditations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">{translations.sections.accreditations}</h3>
            <ul className="list-disc list-inside space-y-2">
              {accreditations.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Claim School Modal */}
      <ClaimSchoolModal
        schoolId={school.school_id}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={handleClaimSuccess}
        onNotification={setNotification}
      />
    </div>
  );
}
