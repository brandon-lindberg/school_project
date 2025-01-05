'use client';

interface SchoolDetailActionsProps {
  contactEmail: string;
  contactPhone: string;
  website: string;
}

const SchoolDetailActions: React.FC<SchoolDetailActionsProps> = ({ contactEmail, contactPhone, website }) => {
  return (
    <>
      <div className="mb-4">
        <strong>Contact Email:</strong>{' '}
        <a href={`mailto:${contactEmail}`} className="text-blue-500 hover:underline">
          {contactEmail}
        </a>
      </div>
      <div className="mb-4">
        <strong>Contact Phone:</strong>{' '}
        <a href={`tel:${contactPhone}`} className="text-blue-500 hover:underline">
          {contactPhone}
        </a>
      </div>
      <div className="mb-4">
        <strong>Website:</strong>{' '}
        <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          {website}
        </a>
      </div>
    </>
  );
};

export default SchoolDetailActions;
