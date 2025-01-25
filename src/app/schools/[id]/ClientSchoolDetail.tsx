'use client';

import React, { useEffect, useState } from 'react';
import { School, FeeLevel, FeeType } from '@/types/school';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import BrowsingHistoryRecorder from '../../components/BrowsingHistoryRecorder';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedContent, getLocalizedArray } from '@/utils/language';
import { getSchoolDetailTranslations } from '@/translations/schoolDetail';
import {
  OverviewTab,
  EducationTab,
  AdmissionsTab,
  CampusTab,
  StudentLifeTab,
  EmploymentTab,
  PoliciesTab,
} from '@/app/components/school-detail';
import { BasicInfoForm } from '@/app/components/school-detail/BasicInfoForm';
import { EducationForm } from '@/app/components/school-detail/EducationForm';
import { AdmissionsForm } from '@/app/components/school-detail/AdmissionsForm';
import { CampusForm } from '@/app/components/school-detail/CampusForm';
import { StudentLifeForm } from '@/app/components/school-detail/StudentLifeForm';
import { EmploymentForm } from '@/app/components/school-detail/EmploymentForm';
import { PoliciesForm } from '@/app/components/school-detail/PoliciesForm';

type Language = 'en' | 'jp';

interface ClientSchoolDetailProps {
  school: School;
}

export default function ClientSchoolDetail({ school: initialSchool }: ClientSchoolDetailProps) {
  const { language } = useLanguage() as { language: Language };
  const { status, data: session } = useSession();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [school, setSchool] = useState(initialSchool);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const translations = getSchoolDetailTranslations(language);

  // Check if user is a school admin for this school or a super admin
  const canEdit =
    session?.user?.role === 'SUPER_ADMIN' ||
    (session?.user?.role === 'SCHOOL_ADMIN' &&
      session?.user?.managedSchoolId === parseInt(school.school_id));

  const isAuthenticated = status === 'authenticated';

  const handleTabClick = (tab: string) => {
    if (!isAuthenticated && tab !== 'overview') {
      // Redirect to list page for non-authenticated users trying to access other tabs
      window.location.href = '/login';
      return;
    }
    setActiveTab(tab);
    setIsEditing(false); // Reset edit mode when changing tabs
  };

  const handleSave = async (data: Partial<School>) => {
    try {
      const endpointMap = {
        overview: 'basic',
        admissions: 'admissions',
        campus: 'campus',
        education: 'education',
        studentLife: 'student-life',
        employment: 'employment',
        policies: 'policies'
      };

      const endpoint = endpointMap[activeTab as keyof typeof endpointMap] || activeTab;
      const response = await fetch(`/api/schools/${school.school_id}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update school');
      }

      // Update the local school data with the new values
      setSchool(prevSchool => ({
        ...prevSchool,
        ...data
      }));

      setNotification({
        type: 'success',
        message: language === 'en' ? 'School updated successfully' : '学校情報が更新されました',
      });
      setIsEditing(false);

      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating school:', error);
      setNotification({
        type: 'error',
        message:
          language === 'en'
            ? 'Failed to update school information. Please try again.'
            : '学校情報の更新に失敗しました。もう一度お試しください。',
      });
    }
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Get localized content
  const name = getLocalizedContent(school.name_en, school.name_jp, language);
  const description = getLocalizedContent(school.description_en, school.description_jp, language);
  const shortDescription = getLocalizedContent(
    school.short_description_en,
    school.short_description_jp,
    language
  );
  const location = getLocalizedContent(school.location_en, school.location_jp, language);
  const address = getLocalizedContent(school.address_en, school.address_jp, language);
  const region = getLocalizedContent(school.region_en, school.region_jp, language);
  const country = getLocalizedContent(school.country_en, school.country_jp, language);
  const email = getLocalizedContent(school.email_en, school.email_jp, language);
  const phone = getLocalizedContent(school.phone_en, school.phone_jp, language);
  const url = getLocalizedContent(school.url_en, school.url_jp, language);

  // Get localized arrays
  const affiliations = getLocalizedArray(school.affiliations_en, school.affiliations_jp, language);
  const accreditations = getLocalizedArray(
    school.accreditation_en,
    school.accreditation_jp,
    language
  );
  const programs = getLocalizedArray(
    school.education_programs_offered_en,
    school.education_programs_offered_jp,
    language
  );
  const facilities = getLocalizedArray(
    school.campus_facilities_en,
    school.campus_facilities_jp,
    language
  );
  const supportServices = getLocalizedArray(
    school.student_life_support_services_en,
    school.student_life_support_services_jp,
    language
  );
  const academicSupport = getLocalizedArray(
    school.education_academic_support_en,
    school.education_academic_support_jp,
    language
  );
  const extracurricular = getLocalizedArray(
    school.education_extracurricular_activities_en,
    school.education_extracurricular_activities_jp,
    language
  );
  const staffList = getLocalizedArray(
    school.staff_staff_list_en,
    school.staff_staff_list_jp,
    language
  );
  const boardMembers = getLocalizedArray(
    school.staff_board_members_en,
    school.staff_board_members_jp,
    language
  );
  const openPositions = getLocalizedArray(
    school.employment_open_positions_en,
    school.employment_open_positions_jp,
    language
  );

  const renderTab = () => {
    const commonTabProps = {
      translations,
      language,
      isSchoolAdmin: canEdit,
      onEdit: () => setIsEditing(true),
    };

    if (isEditing) {
      const commonFormProps = {
        school,
        translations,
        language,
        onSave: handleSave,
        onCancel: () => setIsEditing(false),
      };

      switch (activeTab) {
        case 'overview':
          return <BasicInfoForm {...commonFormProps} />;
        case 'education':
          return <EducationForm {...commonFormProps} />;
        case 'admissions':
          return <AdmissionsForm {...commonFormProps} />;
        case 'campus':
          return <CampusForm {...commonFormProps} />;
        case 'studentLife':
          return <StudentLifeForm {...commonFormProps} />;
        case 'employment':
          return <EmploymentForm {...commonFormProps} />;
        case 'policies':
          return <PoliciesForm {...commonFormProps} />;
        default:
          return null;
      }
    }

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            {...commonTabProps}
            school={school}
            name={name}
            shortDescription={shortDescription}
            location={location}
            address={address}
            region={region}
            country={country}
            email={email}
            phone={phone}
            url={url}
            description={description}
            affiliations={affiliations}
            accreditations={accreditations}
          />
        );
      case 'education':
        return (
          <EducationTab
            {...commonTabProps}
            school={school}
            programs={getLocalizedArray(
              school.education_programs_offered_en,
              school.education_programs_offered_jp,
              language
            )}
            academicSupport={getLocalizedArray(
              school.education_academic_support_en,
              school.education_academic_support_jp,
              language
            )}
            extracurricular={getLocalizedArray(
              school.education_extracurricular_activities_en,
              school.education_extracurricular_activities_jp,
              language
            )}
            curriculum={getLocalizedContent(
              school.education_curriculum_en,
              school.education_curriculum_jp,
              language
            )}
          />
        );
      case 'admissions':
        return (
          <AdmissionsTab
            {...commonTabProps}
            school={school}
          />
        );
      case 'campus':
        return (
          <CampusTab
            {...commonTabProps}
            school={school}
            facilities={facilities}
          />
        );
      case 'studentLife':
        return (
          <StudentLifeTab
            {...commonTabProps}
            school={school}
            supportServices={getLocalizedArray(
              school.student_life_support_services_en,
              school.student_life_support_services_jp,
              language
            )}
          />
        );
      case 'employment':
        return (
          <EmploymentTab
            {...commonTabProps}
            school={school}
            openPositions={getLocalizedArray(
              school.employment_open_positions_en,
              school.employment_open_positions_jp,
              language
            )}
            staffList={getLocalizedArray(
              school.staff_staff_list_en,
              school.staff_staff_list_jp,
              language
            )}
            boardMembers={getLocalizedArray(
              school.staff_board_members_en,
              school.staff_board_members_jp,
              language
            )}
          />
        );
      case 'policies':
        return (
          <PoliciesTab
            {...commonTabProps}
            school={school}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BrowsingHistoryRecorder schoolId={parseInt(school.school_id)} />

      {notification && (
        <div
          className={`mb-4 p-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
        >
          {notification.message}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: translations.tabs.overview },
              { id: 'education', name: translations.tabs.education },
              { id: 'admissions', name: translations.tabs.admissions },
              { id: 'campus', name: translations.tabs.campus },
              { id: 'studentLife', name: translations.tabs.studentLife },
              { id: 'employment', name: translations.tabs.employment },
              { id: 'policies', name: translations.tabs.policies },
            ].map(tab => {
              const isDisabled = !isAuthenticated && tab.id !== 'overview';
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`
                    ${activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  `}
                  disabled={isDisabled}
                >
                  {tab.name}
                  {isDisabled && (
                    <span className="ml-1 text-xs text-gray-400">
                      {language === 'en' ? '(Login required)' : '(ログインが必要)'}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8">{renderTab()}</div>

      {/* Login/Register prompt for non-authenticated users */}
      {!isAuthenticated && activeTab === 'overview' && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              {language === 'en'
                ? 'Want to see more details about this school?'
                : 'この学校の詳細をもっと見たいですか？'}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {language === 'en'
                ? 'Create an account or log in to access all school information.'
                : 'アカウントを作成またはログインして、すべての学校情報にアクセスしてください。'}
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                {language === 'en' ? 'Login' : 'ログイン'}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md shadow-sm text-green-600 bg-white hover:bg-green-50"
              >
                {language === 'en' ? 'Register' : '登録'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
