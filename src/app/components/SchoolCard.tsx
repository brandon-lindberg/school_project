'use client';

import { useRouter } from 'next/navigation';
import { School } from '../../interfaces/School';

interface SchoolCardProps {
  school: School;
}

const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/schools/${school.id}`);
  };

  return (
    <div
      className="border rounded-lg p-6 shadow-md flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <h2 className="text-2xl font-semibold mb-2">{school.name}</h2>
      <p className="text-gray-600 mb-4">{school.description}</p>
      <div className="mt-auto">
        <a
          href={`mailto:${school.contactEmail}`}
          className="text-blue-500 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {school.contactEmail}
        </a>
        <br />
        <a
          href={`tel:${school.contactPhone}`}
          className="text-blue-500 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {school.contactPhone}
        </a>
        <br />
        <a
          href={school.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          Visit Website
        </a>
      </div>
    </div>
  );
};

export default SchoolCard;
