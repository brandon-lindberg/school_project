'use client';

import React, { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { School } from '../../../interfaces/School';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import FallbackImage from '../../components/FallbackImage';
import BrowsingHistoryRecorder from '../../components/BrowsingHistoryRecorder';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedContent, getLocalizedArray } from '@/utils/language';

interface Params {
  id: string;
}

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
  const { language } = useLanguage();
  const { status } = useSession();
  const [school, setSchool] = useState<School | null>(null);

  const translations = {
    backToList: language === 'en' ? '← Back to School List' : '← 学校一覧に戻る',
    sections: {
      location: language === 'en' ? 'Location' : '所在地',
      contactInfo: language === 'en' ? 'Contact Information' : '連絡先',
      email: language === 'en' ? 'Email' : 'メール',
      phone: language === 'en' ? 'Phone' : '電話',
      website: language === 'en' ? 'Website' : 'ウェブサイト',
      visitWebsite: language === 'en' ? 'Visit Website' : 'ウェブサイトを見る',
      aboutSchool: language === 'en' ? 'About the School' : '学校について',
      affiliations: language === 'en' ? 'Affiliations' : '提携',
      accreditations: language === 'en' ? 'Accreditations' : '認定',
      virtualTour: language === 'en' ? 'Take a Virtual Tour' : 'バーチャルツアーを見る',
      education: language === 'en' ? 'Education' : '教育',
      programsOffered: language === 'en' ? 'Programs Offered' : '提供プログラム',
      noProgramsListed: language === 'en' ? 'No programs listed' : 'プログラムの記載なし',
      curriculum: language === 'en' ? 'Curriculum' : 'カリキュラム',
      noCurriculum:
        language === 'en' ? 'No curriculum information available' : 'カリキュラム情報なし',
      admissions: language === 'en' ? 'Admissions' : '入学',
      acceptancePolicy: language === 'en' ? 'Acceptance Policy' : '入学方針',
      noAcceptancePolicy:
        language === 'en' ? 'No acceptance policy information available' : '入学方針情報なし',
      applicationGuidelines: language === 'en' ? 'Application Guidelines' : '出願ガイドライン',
      noGuidelines:
        language === 'en' ? 'No application guidelines available' : '出願ガイドラインなし',
      feesOverview: language === 'en' ? 'Fees Overview' : '費用概要',
      noFees: language === 'en' ? 'No fees information available' : '費用情報なし',
      detailedFees: language === 'en' ? 'Detailed Fee Structure' : '詳細な費用構成',
      applicationFee: language === 'en' ? 'Application Fee' : '出願料',
      dayCare: language === 'en' ? 'Day Care Fees' : '保育料',
      elementary: language === 'en' ? 'Elementary School Fees' : '小学校費用',
      juniorHigh: language === 'en' ? 'Junior High School Fees' : '中学校費用',
      highSchool: language === 'en' ? 'High School Fees' : '高校費用',
      tuition: language === 'en' ? 'Tuition' : '授業料',
      registration: language === 'en' ? 'Registration' : '登録料',
      maintenance: language === 'en' ? 'Maintenance' : '施設維持費',
      facilities: language === 'en' ? 'Campus Facilities' : 'キャンパス施設',
      noFacilities: language === 'en' ? 'No facilities information available' : '施設情報なし',
      studentLife: language === 'en' ? 'Student Life' : '学生生活',
      counseling: language === 'en' ? 'Counseling Services' : 'カウンセリングサービス',
      supportServices: language === 'en' ? 'Support Services' : 'サポートサービス',
      library: language === 'en' ? 'Library' : '図書館',
      calendar: language === 'en' ? 'Academic Calendar' : '学年暦',
      academicSupport:
        language === 'en' ? 'Academic Support & Activities' : '学習支援とアクティビティ',
      academicSupportTitle: language === 'en' ? 'Academic Support' : '学習支援',
      extracurricular: language === 'en' ? 'Extracurricular Activities' : '課外活動',
      staffEmployment: language === 'en' ? 'Staff & Employment' : 'スタッフと採用',
      staff: language === 'en' ? 'Staff' : 'スタッフ',
      boardMembers: language === 'en' ? 'Board Members' : '理事会メンバー',
      openPositions: language === 'en' ? 'Open Positions' : '求人情報',
      applicationProcess: language === 'en' ? 'Application Process' : '応募プロセス',
      events: language === 'en' ? 'School Events' : '学校行事',
      policies: language === 'en' ? 'School Policies' : '学校方針',
      privacyPolicy: language === 'en' ? 'Privacy Policy' : 'プライバシーポリシー',
      termsOfUse: language === 'en' ? 'Terms of Use' : '利用規約',
    },
  };

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
    return <div>Loading...</div>;
  }

  // Get localized content
  const name = getLocalizedContent(school.name_en, school.name_jp, language);
  const description = getLocalizedContent(school.description_en, school.description_jp, language);
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
  const events = getLocalizedArray(school.events_en, school.events_jp, language);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <BrowsingHistoryRecorder schoolId={school.school_id} />
      <Link href="/list" className="text-green-500 hover:underline mb-4 inline-block">
        {translations.backToList}
      </Link>

      {/* Header Section */}
      <div className="space-y-6">
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <div className="flex items-center mb-6">
            <FallbackImage
              src={school.logo_id ? `/logos/${school.logo_id}.png` : '/logo.png'}
              alt={`${name || 'School'} Logo`}
              className="w-16 h-16 object-contain mr-4"
              fallbackSrc="/logo.png"
            />
            <div>
              <h1 className="text-3xl font-bold">
                {name || (language === 'en' ? 'Unnamed School' : '名称未設定の学校')}
              </h1>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{translations.sections.location}</h2>
              <p className="text-gray-700">
                {[location, address, region, country].filter(Boolean).join(', ')}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">{translations.sections.contactInfo}</h2>
              <div className="space-y-2">
                {email && (
                  <div>
                    <strong>{translations.sections.email}:</strong>{' '}
                    <a href={`mailto:${email}`} className="text-blue-500 hover:underline">
                      {email}
                    </a>
                  </div>
                )}
                {phone && (
                  <div>
                    <strong>{translations.sections.phone}:</strong>{' '}
                    <a href={`tel:${phone}`} className="text-blue-500 hover:underline">
                      {phone}
                    </a>
                  </div>
                )}
                {url && (
                  <div>
                    <strong>{translations.sections.website}:</strong>{' '}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {translations.sections.visitWebsite}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">{translations.sections.aboutSchool}</h2>
          <p className="text-gray-700 mb-4">
            {description ||
              (language === 'en' ? 'No description available.' : '説明がありません。')}
          </p>

          {/* Affiliations & Accreditations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {affiliations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">{translations.sections.affiliations}</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {affiliations.map((affiliation, index) => (
                    <li key={index}>{affiliation}</li>
                  ))}
                </ul>
              </div>
            )}

            {accreditations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {translations.sections.accreditations}
                </h3>
                <ul className="list-disc list-inside text-gray-700">
                  {accreditations.map((accreditation, index) => (
                    <li key={index}>{accreditation}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Virtual Tour Link */}
            {(school.campus_virtual_tour_jp || school.campus_virtual_tour_en) && (
              <div className="mt-4">
                <a
                  href={
                    getLocalizedContent(
                      school.campus_virtual_tour_en,
                      school.campus_virtual_tour_jp,
                      language
                    ) || '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {translations.sections.virtualTour}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Education Programs Section */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">{translations.sections.education}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {translations.sections.programsOffered}
              </h3>
              {(school.education_programs_offered_jp &&
                school.education_programs_offered_jp.length > 0) ||
              (school.education_programs_offered_en &&
                school.education_programs_offered_en.length > 0) ? (
                <ul className="list-disc list-inside text-gray-700">
                  {(
                    school.education_programs_offered_jp ||
                    school.education_programs_offered_en ||
                    []
                  ).map((program, index) => (
                    <li key={index}>{program}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">{translations.sections.noProgramsListed}</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">{translations.sections.curriculum}</h3>
              <p className="text-gray-700">
                {school.education_curriculum_jp ||
                  school.education_curriculum_en ||
                  translations.sections.noCurriculum}
              </p>
            </div>
          </div>
        </div>

        {/* Admissions Section */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">{translations.sections.admissions}</h2>
          <div>
            <h3 className="text-lg font-semibold mb-2">{translations.sections.acceptancePolicy}</h3>
            <p className="text-gray-700">
              {school.admissions_acceptance_policy_jp ||
                school.admissions_acceptance_policy_en ||
                translations.sections.noAcceptancePolicy}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">
              {translations.sections.applicationGuidelines}
            </h3>
            <p className="text-gray-700">
              {school.admissions_application_guidelines_jp ||
                school.admissions_application_guidelines_en ||
                translations.sections.noGuidelines}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{translations.sections.feesOverview}</h3>
            <p className="text-gray-700">
              {school.admissions_fees_jp ||
                school.admissions_fees_en ||
                translations.sections.noFees}
            </p>
          </div>
        </div>

        {/* Detailed Fee Structure */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">{translations.sections.detailedFees}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Application Fee */}
            {(school.admissions_breakdown_fees_application_fee_jp ||
              school.admissions_breakdown_fees_application_fee_en) && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {translations.sections.applicationFee}
                </h3>
                <p className="text-gray-700">
                  {school.admissions_breakdown_fees_application_fee_jp ||
                    school.admissions_breakdown_fees_application_fee_en}
                </p>
              </div>
            )}

            {/* Day Care Fees */}
            {(school.admissions_breakdown_fees_day_care_fee_tuition_jp ||
              school.admissions_breakdown_fees_day_care_fee_tuition_en ||
              school.admissions_breakdown_fees_day_care_fee_registration_fee_jp ||
              school.admissions_breakdown_fees_day_care_fee_registration_fee_en ||
              school.admissions_breakdown_fees_day_care_fee_maintenance_fee_jp ||
              school.admissions_breakdown_fees_day_care_fee_maintenance_fee_en) && (
              <div>
                <h3 className="text-lg font-semibold mb-2">{translations.sections.dayCare}</h3>
                <ul className="space-y-2 text-gray-700">
                  {(school.admissions_breakdown_fees_day_care_fee_tuition_jp ||
                    school.admissions_breakdown_fees_day_care_fee_tuition_en) && (
                    <li>
                      <strong>{translations.sections.tuition}:</strong>{' '}
                      {school.admissions_breakdown_fees_day_care_fee_tuition_jp ||
                        school.admissions_breakdown_fees_day_care_fee_tuition_en}
                    </li>
                  )}
                  {(school.admissions_breakdown_fees_day_care_fee_registration_fee_jp ||
                    school.admissions_breakdown_fees_day_care_fee_registration_fee_en) && (
                    <li>
                      <strong>{translations.sections.registration}:</strong>{' '}
                      {school.admissions_breakdown_fees_day_care_fee_registration_fee_jp ||
                        school.admissions_breakdown_fees_day_care_fee_registration_fee_en}
                    </li>
                  )}
                  {(school.admissions_breakdown_fees_day_care_fee_maintenance_fee_jp ||
                    school.admissions_breakdown_fees_day_care_fee_maintenance_fee_en) && (
                    <li>
                      <strong>{translations.sections.maintenance}:</strong>{' '}
                      {school.admissions_breakdown_fees_day_care_fee_maintenance_fee_jp ||
                        school.admissions_breakdown_fees_day_care_fee_maintenance_fee_en}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Elementary School Fees */}
            {(school.admissions_breakdown_fees_grade_elementary_tuition_jp ||
              school.admissions_breakdown_fees_grade_elementary_tuition_en ||
              school.admissions_breakdown_fees_grade_elementary_registration_fee_jp ||
              school.admissions_breakdown_fees_grade_elementary_registration_fee_en ||
              school.admissions_breakdown_fees_grade_elementary_maintenance_fee_jp ||
              school.admissions_breakdown_fees_grade_elementary_maintenance_fee_en) && (
              <div>
                <h3 className="text-lg font-semibold mb-2">{translations.sections.elementary}</h3>
                <ul className="space-y-2 text-gray-700">
                  {(school.admissions_breakdown_fees_grade_elementary_tuition_jp ||
                    school.admissions_breakdown_fees_grade_elementary_tuition_en) && (
                    <li>
                      <strong>{translations.sections.tuition}:</strong>{' '}
                      {school.admissions_breakdown_fees_grade_elementary_tuition_jp ||
                        school.admissions_breakdown_fees_grade_elementary_tuition_en}
                    </li>
                  )}
                  {(school.admissions_breakdown_fees_grade_elementary_registration_fee_jp ||
                    school.admissions_breakdown_fees_grade_elementary_registration_fee_en) && (
                    <li>
                      <strong>{translations.sections.registration}:</strong>{' '}
                      {school.admissions_breakdown_fees_grade_elementary_registration_fee_jp ||
                        school.admissions_breakdown_fees_grade_elementary_registration_fee_en}
                    </li>
                  )}
                  {(school.admissions_breakdown_fees_grade_elementary_maintenance_fee_jp ||
                    school.admissions_breakdown_fees_grade_elementary_maintenance_fee_en) && (
                    <li>
                      <strong>{translations.sections.maintenance}:</strong>{' '}
                      {school.admissions_breakdown_fees_grade_elementary_maintenance_fee_jp ||
                        school.admissions_breakdown_fees_grade_elementary_maintenance_fee_en}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Junior High School Fees */}
            {(school.admissions_breakdown_fees_grade_junior_high_tuition_jp ||
              school.admissions_breakdown_fees_grade_junior_high_tuition_en ||
              school.admissions_breakdown_fees_grade_junior_high_registration_fee_jp ||
              school.admissions_breakdown_fees_grade_junior_high_registration_fee_en ||
              school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp ||
              school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_en) && (
              <div>
                <h3 className="text-lg font-semibold mb-2">{translations.sections.juniorHigh}</h3>
                <ul className="space-y-2 text-gray-700">
                  {(school.admissions_breakdown_fees_grade_junior_high_tuition_jp ||
                    school.admissions_breakdown_fees_grade_junior_high_tuition_en) && (
                    <li>
                      <strong>{translations.sections.tuition}:</strong>{' '}
                      {school.admissions_breakdown_fees_grade_junior_high_tuition_jp ||
                        school.admissions_breakdown_fees_grade_junior_high_tuition_en}
                    </li>
                  )}
                  {(school.admissions_breakdown_fees_grade_junior_high_registration_fee_jp ||
                    school.admissions_breakdown_fees_grade_junior_high_registration_fee_en) && (
                    <li>
                      <strong>{translations.sections.registration}:</strong>{' '}
                      {school.admissions_breakdown_fees_grade_junior_high_registration_fee_jp ||
                        school.admissions_breakdown_fees_grade_junior_high_registration_fee_en}
                    </li>
                  )}
                  {(school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp ||
                    school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_en) && (
                    <li>
                      <strong>{translations.sections.maintenance}:</strong>{' '}
                      {school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp ||
                        school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_en}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* High School Fees */}
            {(school.admissions_breakdown_fees_grade_high_school_tuition_jp ||
              school.admissions_breakdown_fees_grade_high_school_tuition_en ||
              school.admissions_breakdown_fees_grade_high_school_registration_fee_jp ||
              school.admissions_breakdown_fees_grade_high_school_registration_fee_en ||
              school.admissions_breakdown_fees_grade_high_school_maintenance_fee_jp ||
              school.admissions_breakdown_fees_grade_high_school_maintenance_fee_en) && (
              <div>
                <h3 className="text-lg font-semibold mb-2">{translations.sections.highSchool}</h3>
                <ul className="space-y-2 text-gray-700">
                  {(school.admissions_breakdown_fees_grade_high_school_tuition_jp ||
                    school.admissions_breakdown_fees_grade_high_school_tuition_en) && (
                    <li>
                      <strong>{translations.sections.tuition}:</strong>{' '}
                      {school.admissions_breakdown_fees_grade_high_school_tuition_jp ||
                        school.admissions_breakdown_fees_grade_high_school_tuition_en}
                    </li>
                  )}
                  {(school.admissions_breakdown_fees_grade_high_school_registration_fee_jp ||
                    school.admissions_breakdown_fees_grade_high_school_registration_fee_en) && (
                    <li>
                      <strong>{translations.sections.registration}:</strong>{' '}
                      {school.admissions_breakdown_fees_grade_high_school_registration_fee_jp ||
                        school.admissions_breakdown_fees_grade_high_school_registration_fee_en}
                    </li>
                  )}
                  {(school.admissions_breakdown_fees_grade_high_school_maintenance_fee_jp ||
                    school.admissions_breakdown_fees_grade_high_school_maintenance_fee_en) && (
                    <li>
                      <strong>{translations.sections.maintenance}:</strong>{' '}
                      {school.admissions_breakdown_fees_grade_high_school_maintenance_fee_jp ||
                        school.admissions_breakdown_fees_grade_high_school_maintenance_fee_en}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Campus Facilities Section */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">{translations.sections.facilities}</h2>
          {(school.campus_facilities_jp && school.campus_facilities_jp.length > 0) ||
          (school.campus_facilities_en && school.campus_facilities_en.length > 0) ? (
            <ul className="list-disc list-inside text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              {(school.campus_facilities_jp || school.campus_facilities_en || []).map(
                (facility, index) => (
                  <li key={index}>{facility}</li>
                )
              )}
            </ul>
          ) : (
            <p className="text-gray-500">{translations.sections.noFacilities}</p>
          )}
        </div>

        {/* Student Life Section */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">{translations.sections.studentLife}</h2>

          {/* Counseling */}
          {(school.student_life_counseling_jp || school.student_life_counseling_en) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{translations.sections.counseling}</h3>
              <p className="text-gray-700">
                {school.student_life_counseling_jp || school.student_life_counseling_en}
              </p>
            </div>
          )}

          {/* Support Services */}
          {((school.student_life_support_services_jp &&
            school.student_life_support_services_jp.length > 0) ||
            (school.student_life_support_services_en &&
              school.student_life_support_services_en.length > 0)) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {translations.sections.supportServices}
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                {(
                  school.student_life_support_services_jp ||
                  school.student_life_support_services_en ||
                  []
                ).map((service, index) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Library */}
          {(school.student_life_library_jp || school.student_life_library_en) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{translations.sections.library}</h3>
              <p className="text-gray-700">
                {school.student_life_library_jp || school.student_life_library_en}
              </p>
            </div>
          )}

          {/* Calendar */}
          {(school.student_life_calendar_jp || school.student_life_calendar_en) && (
            <div>
              <h3 className="text-lg font-semibold mb-2">{translations.sections.calendar}</h3>
              <p className="text-gray-700">
                {school.student_life_calendar_jp || school.student_life_calendar_en}
              </p>
            </div>
          )}
        </div>

        {/* Academic Support & Activities */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">{translations.sections.academicSupport}</h2>

          {/* Academic Support */}
          {((school.education_academic_support_jp &&
            school.education_academic_support_jp.length > 0) ||
            (school.education_academic_support_en &&
              school.education_academic_support_en.length > 0)) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {translations.sections.academicSupportTitle}
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                {(
                  school.education_academic_support_jp ||
                  school.education_academic_support_en ||
                  []
                ).map((support, index) => (
                  <li key={index}>{support}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Extracurricular Activities */}
          {((school.education_extracurricular_activities_jp &&
            school.education_extracurricular_activities_jp.length > 0) ||
            (school.education_extracurricular_activities_en &&
              school.education_extracurricular_activities_en.length > 0)) && (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {translations.sections.extracurricular}
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                {(
                  school.education_extracurricular_activities_jp ||
                  school.education_extracurricular_activities_en ||
                  []
                ).map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Staff & Employment */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">{translations.sections.staffEmployment}</h2>

          {/* Staff List */}
          {((school.staff_staff_list_jp && school.staff_staff_list_jp.length > 0) ||
            (school.staff_staff_list_en && school.staff_staff_list_en.length > 0)) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{translations.sections.staff}</h3>
              <ul className="list-disc list-inside text-gray-700">
                {(school.staff_staff_list_jp || school.staff_staff_list_en || []).map(
                  (staff, index) => (
                    <li key={index}>{staff}</li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Board Members */}
          {((school.staff_board_members_jp && school.staff_board_members_jp.length > 0) ||
            (school.staff_board_members_en && school.staff_board_members_en.length > 0)) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{translations.sections.boardMembers}</h3>
              <ul className="list-disc list-inside text-gray-700">
                {(school.staff_board_members_jp || school.staff_board_members_en || []).map(
                  (member, index) => (
                    <li key={index}>{member}</li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Employment Opportunities */}
          {((school.employment_open_positions_jp &&
            school.employment_open_positions_jp.length > 0) ||
            (school.employment_open_positions_en &&
              school.employment_open_positions_en.length > 0)) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{translations.sections.openPositions}</h3>
              <ul className="list-disc list-inside text-gray-700">
                {(
                  school.employment_open_positions_jp ||
                  school.employment_open_positions_en ||
                  []
                ).map((position, index) => (
                  <li key={index}>{position}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Application Process */}
          {(school.employment_application_process_jp ||
            school.employment_application_process_en) && (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {translations.sections.applicationProcess}
              </h3>
              <p className="text-gray-700">
                {school.employment_application_process_jp ||
                  school.employment_application_process_en}
              </p>
            </div>
          )}
        </div>

        {/* Events */}
        {((school.events_jp && school.events_jp.length > 0) ||
          (school.events_en && school.events_en.length > 0)) && (
          <div className="border rounded-lg p-6 shadow-md bg-white">
            <h2 className="text-2xl font-semibold mb-4">{translations.sections.events}</h2>
            <ul className="list-disc list-inside text-gray-700">
              {(school.events_jp || school.events_en || []).map((event, index) => (
                <li key={index}>{event}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Policies */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">{translations.sections.policies}</h2>

          {/* Privacy Policy */}
          {(school.policies_privacy_policy_jp || school.policies_privacy_policy_en) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{translations.sections.privacyPolicy}</h3>
              <p className="text-gray-700">
                {school.policies_privacy_policy_jp || school.policies_privacy_policy_en}
              </p>
            </div>
          )}

          {/* Terms of Use */}
          {(school.policies_terms_of_use_jp || school.policies_terms_of_use_en) && (
            <div>
              <h3 className="text-lg font-semibold mb-2">{translations.sections.termsOfUse}</h3>
              <p className="text-gray-700">
                {school.policies_terms_of_use_jp || school.policies_terms_of_use_en}
              </p>
            </div>
          )}
        </div>

        {/* Programs Section */}
        {programs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{translations.sections.programsOffered}</h3>
            <ul className="list-disc list-inside text-gray-700">
              {programs.map((program, index) => (
                <li key={index}>{program}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Facilities Section */}
        {facilities.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{translations.sections.facilities}</h3>
            <ul className="list-disc list-inside text-gray-700">
              {facilities.map((facility, index) => (
                <li key={index}>{facility}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Support Services Section */}
        {supportServices.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{translations.sections.supportServices}</h3>
            <ul className="list-disc list-inside text-gray-700">
              {supportServices.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Academic Support Section */}
        {academicSupport.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">
              {translations.sections.academicSupportTitle}
            </h3>
            <ul className="list-disc list-inside text-gray-700">
              {academicSupport.map((support, index) => (
                <li key={index}>{support}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Extracurricular Activities Section */}
        {extracurricular.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{translations.sections.extracurricular}</h3>
            <ul className="list-disc list-inside text-gray-700">
              {extracurricular.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Staff Section */}
        {staffList.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{translations.sections.staff}</h3>
            <ul className="list-disc list-inside text-gray-700">
              {staffList.map((staff, index) => (
                <li key={index}>{staff}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Board Members Section */}
        {boardMembers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{translations.sections.boardMembers}</h3>
            <ul className="list-disc list-inside text-gray-700">
              {boardMembers.map((member, index) => (
                <li key={index}>{member}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Open Positions Section */}
        {openPositions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{translations.sections.openPositions}</h3>
            <ul className="list-disc list-inside text-gray-700">
              {openPositions.map((position, index) => (
                <li key={index}>{position}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Events Section */}
        {events.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">{translations.sections.events}</h3>
            <ul className="list-disc list-inside text-gray-700">
              {events.map((event, index) => (
                <li key={index}>{event}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
