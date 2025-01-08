import React from 'react';
import { redirect } from 'next/navigation';
import { School } from '../../../interfaces/School';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../app/api/auth/[...nextauth]/auth';
import FallbackImage from '../../components/FallbackImage';
import BrowsingHistoryRecorder from '../../components/BrowsingHistoryRecorder';

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

export default async function SchoolDetailPage({ params }: { params: Params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const school = await getSchool(params.id);
  if (!school) {
    console.error('School not found for ID:', params.id);
    redirect('/list');
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <BrowsingHistoryRecorder schoolId={school.school_id} />
      <Link href="/list" className="text-green-500 hover:underline mb-4 inline-block">
        &larr; Back to School List
      </Link>

      {/* Header Section */}
      <div className="space-y-6">
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <div className="flex items-center mb-6">
            <FallbackImage
              src={school.logo_id ? `/logos/${school.logo_id}.png` : '/logo.png'}
              alt={`${school.name_jp || school.name_en || 'School'} Logo`}
              className="w-16 h-16 object-contain mr-4"
              fallbackSrc="/logo.png"
            />
            <div>
              <h1 className="text-3xl font-bold">
                {school.name_jp || school.name_en || 'Unnamed School'}
              </h1>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p className="text-gray-700">
                {[
                  school.location_jp || school.location_en,
                  school.address_jp || school.address_en,
                  school.region_jp || school.region_en,
                  school.country_jp || school.country_en
                ].filter(Boolean).join(', ')}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
              <div className="space-y-2">
                {school.email_en && (
                  <div>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${school.email_en}`} className="text-blue-500 hover:underline">
                      {school.email_en}
                    </a>
                  </div>
                )}
                {school.phone_en && (
                  <div>
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:${school.phone_en}`} className="text-blue-500 hover:underline">
                      {school.phone_en}
                    </a>
                  </div>
                )}
                {school.url_en && (
                  <div>
                    <strong>Website:</strong>{' '}
                    <a href={school.url_en} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">About the School</h2>
          <p className="text-gray-700 mb-4">
            {school.description_jp || school.description_en || 'No description available.'}
          </p>

          {/* Affiliations & Accreditations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {((school.affiliations_jp && school.affiliations_jp.length > 0) ||
              (school.affiliations_en && school.affiliations_en.length > 0)) && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Affiliations</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {(school.affiliations_jp || school.affiliations_en || []).map((affiliation, index) => (
                      <li key={index}>{affiliation}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Accreditations */}
            {((school.accreditation_jp && school.accreditation_jp.length > 0) ||
              (school.accreditation_en && school.accreditation_en.length > 0)) && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Accreditations</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {(school.accreditation_jp || school.accreditation_en || []).map((accreditation, index) => (
                      <li key={index}>{accreditation}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Virtual Tour Link */}
            {(school.campus_virtual_tour_jp || school.campus_virtual_tour_en) && (
              <div className="mt-4">
                <a
                  href={school.campus_virtual_tour_jp || school.campus_virtual_tour_en || '#' as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Take a Virtual Tour
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Education Programs Section */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">Education</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Programs Offered</h3>
              {((school.education_programs_offered_jp && school.education_programs_offered_jp.length > 0) ||
                (school.education_programs_offered_en && school.education_programs_offered_en.length > 0)) ? (
                <ul className="list-disc list-inside text-gray-700">
                  {(school.education_programs_offered_jp || school.education_programs_offered_en || []).map((program, index) => (
                    <li key={index}>{program}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No programs listed</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Curriculum</h3>
              <p className="text-gray-700">
                {school.education_curriculum_jp || school.education_curriculum_en || 'No curriculum information available'}
              </p>
            </div>
          </div>
        </div>

        {/* Admissions Section */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">Admissions</h2>
          <div>
            <h3 className="text-lg font-semibold mb-2">Acceptance Policy</h3>
            <p className="text-gray-700">
              {school.admissions_acceptance_policy_jp || school.admissions_acceptance_policy_en || 'No acceptance policy information available'}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Application Guidelines</h3>
            <p className="text-gray-700">
              {school.admissions_application_guidelines_jp || school.admissions_application_guidelines_en || 'No application guidelines available'}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Fees Overview</h3>
            <p className="text-gray-700">
              {school.admissions_fees_jp || school.admissions_fees_en || 'No fees information available'}
            </p>
          </div>
        </div>

        {/* Detailed Fee Structure */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">Detailed Fee Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Application Fee */}
            {(school.admissions_breakdown_fees_application_fee_jp || school.admissions_breakdown_fees_application_fee_en) && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Application Fee</h3>
                <p className="text-gray-700">
                  {school.admissions_breakdown_fees_application_fee_jp || school.admissions_breakdown_fees_application_fee_en}
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
                  <h3 className="text-lg font-semibold mb-2">Day Care Fees</h3>
                  <ul className="space-y-2 text-gray-700">
                    {(school.admissions_breakdown_fees_day_care_fee_tuition_jp || school.admissions_breakdown_fees_day_care_fee_tuition_en) && (
                      <li><strong>Tuition:</strong> {school.admissions_breakdown_fees_day_care_fee_tuition_jp || school.admissions_breakdown_fees_day_care_fee_tuition_en}</li>
                    )}
                    {(school.admissions_breakdown_fees_day_care_fee_registration_fee_jp || school.admissions_breakdown_fees_day_care_fee_registration_fee_en) && (
                      <li><strong>Registration:</strong> {school.admissions_breakdown_fees_day_care_fee_registration_fee_jp || school.admissions_breakdown_fees_day_care_fee_registration_fee_en}</li>
                    )}
                    {(school.admissions_breakdown_fees_day_care_fee_maintenance_fee_jp || school.admissions_breakdown_fees_day_care_fee_maintenance_fee_en) && (
                      <li><strong>Maintenance:</strong> {school.admissions_breakdown_fees_day_care_fee_maintenance_fee_jp || school.admissions_breakdown_fees_day_care_fee_maintenance_fee_en}</li>
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
                  <h3 className="text-lg font-semibold mb-2">Elementary School Fees</h3>
                  <ul className="space-y-2 text-gray-700">
                    {(school.admissions_breakdown_fees_grade_elementary_tuition_jp || school.admissions_breakdown_fees_grade_elementary_tuition_en) && (
                      <li><strong>Tuition:</strong> {school.admissions_breakdown_fees_grade_elementary_tuition_jp || school.admissions_breakdown_fees_grade_elementary_tuition_en}</li>
                    )}
                    {(school.admissions_breakdown_fees_grade_elementary_registration_fee_jp || school.admissions_breakdown_fees_grade_elementary_registration_fee_en) && (
                      <li><strong>Registration:</strong> {school.admissions_breakdown_fees_grade_elementary_registration_fee_jp || school.admissions_breakdown_fees_grade_elementary_registration_fee_en}</li>
                    )}
                    {(school.admissions_breakdown_fees_grade_elementary_maintenance_fee_jp || school.admissions_breakdown_fees_grade_elementary_maintenance_fee_en) && (
                      <li><strong>Maintenance:</strong> {school.admissions_breakdown_fees_grade_elementary_maintenance_fee_jp || school.admissions_breakdown_fees_grade_elementary_maintenance_fee_en}</li>
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
                  <h3 className="text-lg font-semibold mb-2">Junior High School Fees</h3>
                  <ul className="space-y-2 text-gray-700">
                    {(school.admissions_breakdown_fees_grade_junior_high_tuition_jp || school.admissions_breakdown_fees_grade_junior_high_tuition_en) && (
                      <li><strong>Tuition:</strong> {school.admissions_breakdown_fees_grade_junior_high_tuition_jp || school.admissions_breakdown_fees_grade_junior_high_tuition_en}</li>
                    )}
                    {(school.admissions_breakdown_fees_grade_junior_high_registration_fee_jp || school.admissions_breakdown_fees_grade_junior_high_registration_fee_en) && (
                      <li><strong>Registration:</strong> {school.admissions_breakdown_fees_grade_junior_high_registration_fee_jp || school.admissions_breakdown_fees_grade_junior_high_registration_fee_en}</li>
                    )}
                    {(school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp || school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_en) && (
                      <li><strong>Maintenance:</strong> {school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp || school.admissions_breakdown_fees_grade_junior_high_maintenance_fee_en}</li>
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
                  <h3 className="text-lg font-semibold mb-2">High School Fees</h3>
                  <ul className="space-y-2 text-gray-700">
                    {(school.admissions_breakdown_fees_grade_high_school_tuition_jp || school.admissions_breakdown_fees_grade_high_school_tuition_en) && (
                      <li><strong>Tuition:</strong> {school.admissions_breakdown_fees_grade_high_school_tuition_jp || school.admissions_breakdown_fees_grade_high_school_tuition_en}</li>
                    )}
                    {(school.admissions_breakdown_fees_grade_high_school_registration_fee_jp || school.admissions_breakdown_fees_grade_high_school_registration_fee_en) && (
                      <li><strong>Registration:</strong> {school.admissions_breakdown_fees_grade_high_school_registration_fee_jp || school.admissions_breakdown_fees_grade_high_school_registration_fee_en}</li>
                    )}
                    {(school.admissions_breakdown_fees_grade_high_school_maintenance_fee_jp || school.admissions_breakdown_fees_grade_high_school_maintenance_fee_en) && (
                      <li><strong>Maintenance:</strong> {school.admissions_breakdown_fees_grade_high_school_maintenance_fee_jp || school.admissions_breakdown_fees_grade_high_school_maintenance_fee_en}</li>
                    )}
                  </ul>
                </div>
              )}
          </div>
        </div>

        {/* Campus Facilities Section */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">Campus Facilities</h2>
          {((school.campus_facilities_jp && school.campus_facilities_jp.length > 0) ||
            (school.campus_facilities_en && school.campus_facilities_en.length > 0)) ? (
            <ul className="list-disc list-inside text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              {(school.campus_facilities_jp || school.campus_facilities_en || []).map((facility, index) => (
                <li key={index}>{facility}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No facilities information available</p>
          )}
        </div>

        {/* Student Life Section */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">Student Life</h2>

          {/* Counseling */}
          {(school.student_life_counseling_jp || school.student_life_counseling_en) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Counseling Services</h3>
              <p className="text-gray-700">
                {school.student_life_counseling_jp || school.student_life_counseling_en}
              </p>
            </div>
          )}

          {/* Support Services */}
          {((school.student_life_support_services_jp && school.student_life_support_services_jp.length > 0) ||
            (school.student_life_support_services_en && school.student_life_support_services_en.length > 0)) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Support Services</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {(school.student_life_support_services_jp || school.student_life_support_services_en || []).map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Library */}
          {(school.student_life_library_jp || school.student_life_library_en) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Library</h3>
              <p className="text-gray-700">
                {school.student_life_library_jp || school.student_life_library_en}
              </p>
            </div>
          )}

          {/* Calendar */}
          {(school.student_life_calendar_jp || school.student_life_calendar_en) && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Academic Calendar</h3>
              <p className="text-gray-700">
                {school.student_life_calendar_jp || school.student_life_calendar_en}
              </p>
            </div>
          )}
        </div>

        {/* Academic Support & Activities */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">Academic Support & Activities</h2>

          {/* Academic Support */}
          {((school.education_academic_support_jp && school.education_academic_support_jp.length > 0) ||
            (school.education_academic_support_en && school.education_academic_support_en.length > 0)) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Academic Support</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {(school.education_academic_support_jp || school.education_academic_support_en || []).map((support, index) => (
                    <li key={index}>{support}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Extracurricular Activities */}
          {((school.education_extracurricular_activities_jp && school.education_extracurricular_activities_jp.length > 0) ||
            (school.education_extracurricular_activities_en && school.education_extracurricular_activities_en.length > 0)) && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Extracurricular Activities</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {(school.education_extracurricular_activities_jp || school.education_extracurricular_activities_en || []).map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        {/* Staff & Employment */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">Staff & Employment</h2>

          {/* Staff List */}
          {((school.staff_staff_list_jp && school.staff_staff_list_jp.length > 0) ||
            (school.staff_staff_list_en && school.staff_staff_list_en.length > 0)) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Staff</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {(school.staff_staff_list_jp || school.staff_staff_list_en || []).map((staff, index) => (
                    <li key={index}>{staff}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Board Members */}
          {((school.staff_board_members_jp && school.staff_board_members_jp.length > 0) ||
            (school.staff_board_members_en && school.staff_board_members_en.length > 0)) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Board Members</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {(school.staff_board_members_jp || school.staff_board_members_en || []).map((member, index) => (
                    <li key={index}>{member}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Employment Opportunities */}
          {((school.employment_open_positions_jp && school.employment_open_positions_jp.length > 0) ||
            (school.employment_open_positions_en && school.employment_open_positions_en.length > 0)) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Open Positions</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {(school.employment_open_positions_jp || school.employment_open_positions_en || []).map((position, index) => (
                    <li key={index}>{position}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Application Process */}
          {(school.employment_application_process_jp || school.employment_application_process_en) && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Application Process</h3>
              <p className="text-gray-700">
                {school.employment_application_process_jp || school.employment_application_process_en}
              </p>
            </div>
          )}
        </div>

        {/* Events */}
        {((school.events_jp && school.events_jp.length > 0) ||
          (school.events_en && school.events_en.length > 0)) && (
            <div className="border rounded-lg p-6 shadow-md bg-white">
              <h2 className="text-2xl font-semibold mb-4">School Events</h2>
              <ul className="list-disc list-inside text-gray-700">
                {(school.events_jp || school.events_en || []).map((event, index) => (
                  <li key={index}>{event}</li>
                ))}
              </ul>
            </div>
          )}

        {/* Policies */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-2xl font-semibold mb-4">School Policies</h2>

          {/* Privacy Policy */}
          {(school.policies_privacy_policy_jp || school.policies_privacy_policy_en) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Privacy Policy</h3>
              <p className="text-gray-700">
                {school.policies_privacy_policy_jp || school.policies_privacy_policy_en}
              </p>
            </div>
          )}

          {/* Terms of Use */}
          {(school.policies_terms_of_use_jp || school.policies_terms_of_use_en) && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Terms of Use</h3>
              <p className="text-gray-700">
                {school.policies_terms_of_use_jp || school.policies_terms_of_use_en}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

