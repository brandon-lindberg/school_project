import React from 'react';
import { redirect } from 'next/navigation';
import rawData from '../../../../normalized_output.json';
import { NormalizedDataItem, SubPage } from '../../../interfaces/NormalizedData';
import { School } from '../../../interfaces/School';
import Link from 'next/link';

interface Params {
  id: string;
}

// Function to parse raw data and extract school information
const parseSchools = (): School[] => {
  const schools: School[] = [];
  let idCounter = 1;

  (rawData as NormalizedDataItem[]).forEach((item) => {
    const schoolName = item.source.title.split("|")[0].trim();
    const website = item.source.url;

    let contactEmail = 'N/A';
    let contactPhone = 'N/A';
    let description = 'No description available.';

    if (item.content.sub_pages.length > 0) {
      const firstSubPage = item.content.sub_pages[0];
      description = firstSubPage.data.length > 200 ? `${firstSubPage.data.substring(0, 200)}...` : firstSubPage.data;
    }

    item.content.sub_pages.forEach((subPage: SubPage) => {
      const data = subPage.data;

      // Extract Email
      if (contactEmail === 'N/A') {
        const emailMatch = data.match(/Email:\s*([\w.+-]+@[\w-]+\.[A-Za-z]{2,})/);
        if (emailMatch) {
          contactEmail = emailMatch[1];
        }
      }

      // Extract Phone
      if (contactPhone === 'N/A') {
        const phoneMatch = data.match(/TEL：[^\d]*(\+?\d{1,3}[-.\s]?)?(\d{2,4}[-.\s]?){2}\d{4}/);
        if (phoneMatch) {
          contactPhone = phoneMatch[0];
        }
      }

      // If both email and phone are found, no need to continue
      if (contactEmail !== 'N/A' && contactPhone !== 'N/A') {
        return;
      }
    });

    schools.push({
      id: (idCounter++).toString(), // Ensure id is a string
      name: schoolName || 'Unnamed School',
      description,
      contactEmail,
      contactPhone,
      website: website || '#',
    });
  });

  return schools;
}

export async function generateStaticParams() {
  const schools: School[] = parseSchools().slice(0, 5); // Ensure only 5 schools
  return schools.map((school) => ({
    id: school.id.toString(),
  }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const resolvedParams = await params; // Await params as it's now a Promise
  const schools: School[] = parseSchools();
  const school = schools.find((s) => s.id.toString() === resolvedParams.id);

  return {
    title: school ? `${school.name} - Details` : 'School Not Found',
    description: school ? school.description : 'No description available.',
  };
}

// Function to fetch school details
const fetchSchoolDetails = async (id: string): Promise<{ school: School; details: string[] } | null> => {
  const schools: School[] = parseSchools();
  const school = schools.find((s) => s.id.toString() === id);

  if (!school) {
    return null;
  }

  // Extract detailed information from sub_pages
  const dataItem = (rawData as NormalizedDataItem[])[parseInt(id) - 1];
  const detailedData = dataItem.content.sub_pages.map((subPage: SubPage) => subPage.data);

  return {
    school,
    details: detailedData,
  };
};

export default async function SchoolDetailPage({ params }: { params: Params }) {
  const resolvedParams = await params; // Await params as it's now a Promise
  const { id } = resolvedParams;

  if (!id) {
    redirect('/login');
  }

  const schoolDetails = await fetchSchoolDetails(id);

  if (!schoolDetails) {
    redirect('/join');
  }

  const { school, details } = schoolDetails;

  return (
    <div className="container mx-auto py-8">
      <Link href="/list" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to School List
      </Link>
      <div className="border rounded-lg p-6 shadow-md">
        <h1 className="text-3xl font-bold mb-4">{school.name}</h1>
        <p className="text-gray-700 mb-4">{school.description}</p>
        <div className="mb-4">
          <strong>Contact Email:</strong>{' '}
          <a href={`mailto:${school.contactEmail}`} className="text-blue-500 hover:underline">
            {school.contactEmail}
          </a>
        </div>
        <div className="mb-4">
          <strong>Contact Phone:</strong>{' '}
          <a href={`tel:${school.contactPhone}`} className="text-blue-500 hover:underline">
            {school.contactPhone}
          </a>
        </div>
        <div className="mb-4">
          <strong>Website:</strong>{' '}
          <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {school.website}
          </a>
        </div>
        <div>
          <strong>Additional Details:</strong>
          <ul className="list-disc list-inside mt-2">
            {details.map((detail, index) => (
              <li key={index} className="text-gray-700">
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
