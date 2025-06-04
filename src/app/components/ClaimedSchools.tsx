import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from './shared/Card';
import { ClaimStatus } from '@prisma/client';

type ClaimedSchool = {
  claim_id: number;
  status: ClaimStatus;
  notes: string | null;
  processed_at: string | null;
  school: {
    school_id: number;
    name_en: string | null;
    name_jp: string | null;
  };
};

type Props = {
  claims: ClaimedSchool[];
};

export default function ClaimedSchools({ claims }: Props) {
  const { language } = useLanguage();

  if (!claims || claims.length === 0) {
    return null;
  }

  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ClaimStatus) => {
    if (language === 'jp') {
      switch (status) {
        case 'APPROVED':
          return '承認済み';
        case 'PENDING':
          return '保留中';
        case 'REJECTED':
          return '却下';
        default:
          return status;
      }
    }
    return status;
  };

  return (
    <Card>
      <h2 className="text-2xl font-heading font-semibold text-neutral-900 mb-6">
        {language === 'en' ? 'Claimed Schools' : '申請した学校'}
      </h2>
      <div className="space-y-4">
        {claims.map(claim => (
          <div
            key={claim.claim_id}
            className="flex flex-col p-4 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link
                  href={`/schools/${claim.school.school_id}`}
                  className="text-lg font-medium text-neutral-900 hover:text-primary/90 block mb-2"
                >
                  {language === 'en'
                    ? claim.school.name_en || claim.school.name_jp
                    : claim.school.name_jp || claim.school.name_en}
                </Link>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    claim.status
                  )}`}
                >
                  {getStatusText(claim.status)}
                </span>
              </div>
            </div>

            {claim.status === 'REJECTED' && claim.notes && (
              <div className="mt-4 text-sm bg-red-50 p-3 rounded-md">
                <p className="text-gray-700 font-medium mb-2">
                  {language === 'en' ? 'Rejection Reason:' : '却下の理由:'}
                </p>
                <p className="text-gray-700">{claim.notes}</p>
                {claim.processed_at && (
                  <p className="text-gray-500 text-xs mt-2">
                    {language === 'en' ? 'Rejected on: ' : '却下日: '}
                    {new Date(claim.processed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
