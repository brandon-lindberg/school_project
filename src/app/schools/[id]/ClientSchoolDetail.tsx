'use client';

import React, { useEffect, useState } from 'react';
import { School } from '@/types/school';
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

// Insert an inline job postings list component
function InlineJobPostings({ schoolId, canEdit, isAuthenticated, filter }: { schoolId: string; canEdit: boolean; isAuthenticated: boolean; filter: 'ACTIVE' | 'ARCHIVED'; }) {
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function fetchJobPostings() {
      try {
        const res = await fetch(`/api/schools/${schoolId}/recruitment/job-postings`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch job postings');
        const data = await res.json();
        setJobPostings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJobPostings();
  }, [schoolId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    setError(null);
    setDeletingIds(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/job-postings/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete job posting');
      }
      setJobPostings(prev => prev.filter(job => job.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <ul className="space-y-4">
        {[1, 2, 3].map(n => (
          <li key={n} className="bg-white p-4 rounded shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </li>
        ))}
      </ul>
    );
  }
  if (error) return <div className="text-red-500">Error loading job postings: {error}</div>;

  // Filter job postings based on Active/Archived filter prop
  const filteredJobs = jobPostings.filter(job => filter === 'ACTIVE' ? !job.isArchived : job.isArchived);
  if (filteredJobs.length === 0) return (
    <p>
      {canEdit
        ? filter === 'ACTIVE'
          ? 'No active job postings.'
          : 'No archived job postings.'
        : 'No job postings yet.'}
    </p>
  );

  return (
    <>
      <ul className="space-y-4">
        {filteredJobs.map((job: any) => (
          <li key={job.id} className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-semibold flex items-center">
              {job.title}
              {job.isArchived && (
                <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-700 rounded">
                  Archived
                </span>
              )}
            </h3>
            <p className="text-gray-600">{job.location} — {job.employmentType}</p>
            {job.description && (
              <div className="mt-2 prose prose-sm" dangerouslySetInnerHTML={{ __html: job.description }} />
            )}
            {job.requirements && job.requirements.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold">Requirements</h4>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {job.requirements.map((req: string, idx: number) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-gray-500 text-sm">Created at: {new Date(job.createdAt).toLocaleString()}</p>
            <div className="mt-2 flex items-center space-x-4">
              {isAuthenticated ? (
                canEdit ? (
                  <Link href={`/schools/${schoolId}/employment/recruitment/applications`} className="text-green-500 hover:underline">Applications</Link>
                ) : job.hasApplied ? (
                  <button disabled className="text-gray-400 cursor-not-allowed">Applied</button>
                ) : (
                  <Link href={`/schools/${schoolId}/employment/recruitment/job-postings/${job.id}/apply`} className="text-green-500 hover:underline">Apply</Link>
                )
              ) : (
                <Link href={`/register?next=/schools/${schoolId}/employment/recruitment/job-postings/${job.id}/apply`} className="text-green-500 hover:underline">Sign up to Apply</Link>
              )}
              {canEdit && (
                <Link href={`/schools/${schoolId}/employment/recruitment/job-postings/${job.id}`} className="text-blue-500 hover:underline">Manage</Link>
              )}
              {canEdit && (
                <button
                  onClick={() => handleDelete(job.id)}
                  disabled={deletingIds[job.id]}
                  className="ml-auto bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {deletingIds[job.id] ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
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
  // State for active/archived filter in job postings list
  const [activeFilter, setActiveFilter] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  const translations = getSchoolDetailTranslations(language);

  // Check if user is a school admin for this school or a super admin
  const canEdit = !!(
    session?.user?.role === 'SUPER_ADMIN' ||
    (session?.user?.role === 'SCHOOL_ADMIN' &&
      session?.user?.managedSchools?.some(s => s.school_id === school.school_id))
  );

  const isAuthenticated = status === 'authenticated';

  // Determine if job postings feature is currently open
  const now = new Date();
  const isFeatureOpen =
    school.job_postings_enabled &&
    school.job_postings_start &&
    school.job_postings_end &&
    now >= new Date(school.job_postings_start) &&
    now <= new Date(school.job_postings_end);

  const handleTabClick = (tab: string) => {
    if (!isAuthenticated && tab !== 'overview' && tab !== 'employment') {
      // Redirect to list page for non-authenticated users trying to access other tabs
      window.location.href = '/login';
      return;
    }
    setActiveTab(tab as 'ACTIVE' | 'ARCHIVED');
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
        policies: 'policies',
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
        ...data,
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
            programs={programs}
            academicSupport={academicSupport}
            extracurricular={extracurricular}
            curriculum={getLocalizedContent(
              school.education_curriculum_en,
              school.education_curriculum_jp,
              language
            )}
          />
        );
      case 'admissions':
        return <AdmissionsTab {...commonTabProps} school={school} />;
      case 'campus':
        return <CampusTab {...commonTabProps} school={school} facilities={facilities} />;
      case 'studentLife':
        return (
          <StudentLifeTab {...commonTabProps} school={school} supportServices={supportServices} />
        );
      case 'employment':
        return (
          <div className="relative min-h-[60vh]">
            {/* Overlay for SCHOOL_ADMIN when feature is closed */}
            {session?.user?.role === 'SCHOOL_ADMIN' && !isFeatureOpen && (
              <>
                {/* Subtle full overlay blur */}
                <div className="absolute inset-0 backdrop-blur-sm z-50" />
                {/* Centered card */}
                <div className="absolute inset-0 flex items-center justify-center z-50 px-4">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h3 className="text-2xl font-bold mb-2">
                      {language === 'en' ? 'Feature Locked' : '機能がロックされています'}
                    </h3>
                    <p className="text-base">
                      {language === 'en' ? (
                        <>The Job Posting feature is not enabled. Please contact <a href="mailto:info@isdb-j.com" className="underline text-blue-600">info@isdb-j.com</a> to request access.</>
                      ) : (
                        <>求人機能は有効になっていません。アクセスをリクエストするには <a href="mailto:info@isdb-j.com" className="underline text-blue-600">info@isdb-j.com</a> までご連絡ください。</>
                      )}
                    </p>
                  </div>
                </div>
              </>
            )}
            <div className="mt-6 pl-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{language === 'en' ? 'Job Postings' : '求人情報'}</h2>
                <div className="flex items-center space-x-4">
                  {canEdit && (
                    <>
                      <button
                        onClick={() => setActiveFilter('ACTIVE')}
                        className={`pb-2 font-medium ${activeFilter === 'ACTIVE'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                          }`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => setActiveFilter('ARCHIVED')}
                        className={`pb-2 pr-4 font-medium ${activeFilter === 'ARCHIVED'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                          }`}
                      >
                        Archived
                      </button>
                    </>
                  )}
                  {canEdit && isFeatureOpen && (
                    <Link
                      href={`/schools/${school.school_id}/employment/recruitment/job-postings/new`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      {language === 'en' ? 'Add Job Posting' : '求人を追加'}
                    </Link>
                  )}
                </div>
              </div>
              <InlineJobPostings
                schoolId={school.school_id}
                canEdit={canEdit}
                isAuthenticated={isAuthenticated}
                filter={activeFilter}
              />
            </div>
          </div>
        );
      case 'policies':
        return <PoliciesTab {...commonTabProps} school={school} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BrowsingHistoryRecorder schoolId={school.school_id} />

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
          <nav className="overflow-x-auto" aria-label="Tabs">
            <div className="flex min-w-full whitespace-nowrap">
              {[
                { id: 'overview', name: translations.tabs.overview },
                { id: 'education', name: translations.tabs.education },
                { id: 'admissions', name: translations.tabs.admissions },
                { id: 'campus', name: translations.tabs.campus },
                { id: 'studentLife', name: translations.tabs.studentLife },
                { id: 'employment', name: translations.tabs.employment },
                { id: 'policies', name: translations.tabs.policies },
              ].map(tab => {
                const isDisabled = !isAuthenticated && tab.id !== 'overview' && tab.id !== 'employment';
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
                      whitespace-nowrap border-b-2 py-3 px-3 sm:px-4 text-sm font-medium flex-shrink-0
                      flex items-center
                    `}
                    disabled={isDisabled}
                  >
                    {tab.name}
                    {isDisabled && (
                      <span className="ml-1 text-xs text-gray-400 hidden sm:inline">
                        {language === 'en' ? '(Login required)' : '(ログインが必要)'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
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
