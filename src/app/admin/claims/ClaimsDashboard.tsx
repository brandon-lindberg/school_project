'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

type Claim = {
  claim_id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verification_method: string;
  verification_data: string;
  submitted_at: Date;
  notes?: string | null;
  school: {
    school_id: number;
    name_en: string | null;
    name_jp: string | null;
    email_en: string | null;
  };
  user: {
    user_id: number;
    email: string;
    first_name: string | null;
    family_name: string | null;
  };
};

type Props = {
  initialClaims: Claim[];
};

export default function ClaimsDashboard({ initialClaims }: Props) {
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [processing, setProcessing] = useState<number | null>(null);

  const handleProcessClaim = async (
    claimId: number,
    status: 'APPROVED' | 'REJECTED',
    notes?: string
  ) => {
    if (processing) return;
    setProcessing(claimId);

    try {
      const response = await fetch('/api/schools/claims/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, status, notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process claim');
      }

      // Remove the processed claim from the list
      setClaims(claims.filter(claim => claim.claim_id !== claimId));
      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process claim');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Claimant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {claims.map(claim => (
              <tr key={claim.claim_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {claim.school.name_en || claim.school.name_jp}
                  </div>
                  <div className="text-sm text-gray-500">{claim.school.email_en}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {[claim.user.first_name, claim.user.family_name].filter(Boolean).join(' ') ||
                      'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">{claim.user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{claim.verification_method}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {claim.verification_data}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(claim.submitted_at), 'PPp')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleProcessClaim(claim.claim_id, 'APPROVED')}
                    disabled={processing === claim.claim_id}
                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const notes = window.prompt('Enter rejection reason:');
                      if (notes !== null) {
                        handleProcessClaim(claim.claim_id, 'REJECTED', notes);
                      }
                    }}
                    disabled={processing === claim.claim_id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {claims.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No pending claims
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
