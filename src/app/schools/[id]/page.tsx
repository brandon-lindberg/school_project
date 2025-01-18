'use client';

import React, { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
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

interface Params {
  id: string;
}

// Add type for language
type Language = 'en' | 'jp';

async function getSchool(id: string): Promise<School | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/schools?id=${id}`;
    console.log('Fetching school from:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response not ok:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('Fetched school data:', data);

    if (!data || !data.school_id) {
      console.error('Invalid school data received:', data);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching school:', error);
    return null;
  }
}

export default function SchoolDetailPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = React.use(params);
  const { language } = useLanguage() as { language: Language };
  const { status } = useSession();
  const [school, setSchool] = useState<School | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const translations = getSchoolDetailTranslations(language);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }

    async function loadSchool() {
      const schoolData = await getSchool(resolvedParams.id);
      if (!schoolData) {
        console.error('School not found for ID:', resolvedParams.id);
        redirect('/list');
      }
      setSchool(schoolData);
    }

    if (status === 'authenticated') {
      loadSchool();
    }
  }, [status, resolvedParams.id]);

  if (!school || status === 'loading') {
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

  const getFeeLevelContent = (
    school: School,
    level: FeeLevel,
    feeType: FeeType,
    lang: Language
  ): string => {
    const key = `admissions_breakdown_fees_${level}_${feeType}` as keyof School;
    const enKey = `${key}_en` as keyof School;
    const jpKey = `${key}_jp` as keyof School;
    return getLocalizedContent(school[enKey] as string, school[jpKey] as string, lang) || '';
  };

  const hasFeeLevelFees = (school: School, level: FeeLevel): boolean => {
    return (
      !!getFeeLevelContent(school, level, 'tuition', 'en') ||
      !!getFeeLevelContent(school, level, 'registration_fee', 'en') ||
      !!getFeeLevelContent(school, level, 'maintenance_fee', 'en')
    );
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            school={school}
            translations={translations}
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
            language={language}
          />
        );

      case 'education':
        return (
          <EducationTab
            translations={translations}
            programs={programs}
            academicSupport={academicSupport}
            extracurricular={extracurricular}
          />
        );

      case 'admissions':
        return (
          <AdmissionsTab
            school={school}
            translations={translations}
            language={language}
            getFeeLevelContent={getFeeLevelContent}
            hasFeeLevelFees={hasFeeLevelFees}
          />
        );

      case 'campus':
        return (
          <CampusTab
            school={school}
            translations={translations}
            language={language}
            facilities={facilities}
          />
        );

      case 'studentLife':
        return (
          <StudentLifeTab
            school={school}
            translations={translations}
            language={language}
            supportServices={supportServices}
          />
        );

      case 'employment':
        return (
          <EmploymentTab
            school={school}
            translations={translations}
            language={language}
            openPositions={openPositions}
            staffList={staffList}
            boardMembers={boardMembers}
          />
        );

      case 'policies':
        return <PoliciesTab school={school} translations={translations} language={language} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <BrowsingHistoryRecorder schoolId={school.school_id} />

        {/* Navigation */}
        <div className="mb-8">
          <Link href="/list" className="text-green-500 hover:underline mb-4 inline-block">
            {translations.backToList}
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-4 overflow-x-auto pb-2">
            {Object.entries(translations.tabs).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === key
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTab()}
      </div>
    </div>
  );
}
