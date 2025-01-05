import React from 'react';
import SchoolCard from '../components/SchoolCard';
import rawData from '../../../normalized_output.json';
import { NormalizedDataItem, SubPage } from '../../interfaces/NormalizedData';
import { School } from '../../interfaces/School';

const ListPage: React.FC = () => {
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
  };

  const schools: School[] = parseSchools().slice(0, 5); // Ensure only 5 schools are displayed

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">School List</h1>
      {schools.length === 0 ? (
        <p>No schools found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListPage;
