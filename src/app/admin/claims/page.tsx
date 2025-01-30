'use client';

import { useState, useEffect } from 'react';
import { ClaimStatus } from '@prisma/client';

type Claim = {
  claim_id: number;
  school: {
    name_en: string;
    name_jp: string;
  };
  user: {
    email: string;
    family_name: string;
    first_name: string;
  };
  status: ClaimStatus;
  submitted_at: string;
  verification_method: string;
};

type User = {
  user_id: number;
  email: string;
  family_name: string | null;
  first_name: string | null;
};

export default function ClaimsManagementPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const fetchClaims = async () => {
    try {
      const response = await fetch('/api/admin/claims');
      if (response.ok) {
        const data = await response.json();
        setClaims(data);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  const handleRevokeClaim = async (claimId: number) => {
    try {
      const response = await fetch(`/api/admin/claims?claimId=${claimId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Claim revoked successfully');
        fetchClaims();
      } else {
        setMessage('Failed to revoke claim');
      }
    } catch (error) {
      console.error('Error revoking claim:', error);
      setMessage('Failed to revoke claim');
    }
  };

  const handleTransferClaim = async () => {
    if (!selectedUser) {
      setMessage('Please select a user');
      return;
    }

    try {
      const response = await fetch('/api/admin/claims', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimId: selectedClaim?.claim_id,
          newUserId: selectedUser.user_id,
        }),
      });

      if (response.ok) {
        setMessage('Claim transferred successfully');
        setSearchQuery('');
        setSelectedUser(null);
        setSelectedClaim(null);
        fetchClaims();
      } else {
        setMessage('Failed to transfer claim');
      }
    } catch (error) {
      console.error('Error transferring claim:', error);
      setMessage('Failed to transfer claim');
    }
  };

  const handleCloseModal = () => {
    setSelectedClaim(null);
    setSearchQuery('');
    setSelectedUser(null);
    setSearchResults([]);
  };

  const handleProcessClaim = async (
    claimId: number,
    status: 'APPROVED' | 'REJECTED',
    notes?: string
  ) => {
    try {
      const response = await fetch('/api/schools/claims/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ claimId, status, notes }),
      });

      if (response.ok) {
        setMessage(`Claim ${status.toLowerCase()} successfully`);
        fetchClaims();
      } else {
        setMessage(`Failed to ${status.toLowerCase()} claim`);
      }
    } catch (error) {
      console.error(`Error ${status.toLowerCase()}ing claim:`, error);
      setMessage(`Failed to ${status.toLowerCase()} claim`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">School Claims Management</h1>

      {message && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
          {message}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                Status
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
            {claims
              .filter(claim => claim.status !== 'REJECTED')
              .map(claim => (
                <tr key={claim.claim_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {claim.school.name_en || claim.school.name_jp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{claim.user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        claim.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : claim.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(claim.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {claim.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleProcessClaim(claim.claim_id, 'APPROVED')}
                          className="text-green-600 hover:text-green-900 mr-4"
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
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Transfer
                        </button>
                        <button
                          onClick={() => handleRevokeClaim(claim.claim_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Revoke
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {selectedClaim && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[40rem] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                Transfer School Claim
              </h3>

              {/* Current Claim Section */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Current Claim</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500">School</label>
                    <div className="text-sm font-medium">
                      {selectedClaim.school.name_en || selectedClaim.school.name_jp}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Current Claimant</label>
                    <div className="text-sm font-medium">
                      {selectedClaim.user.first_name} {selectedClaim.user.family_name}
                    </div>
                    <div className="text-sm text-gray-600">{selectedClaim.user.email}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Claim Status</label>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedClaim.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : selectedClaim.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedClaim.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transfer To Section */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Transfer To</h4>
                <div className="relative">
                  <label className="block text-sm text-gray-500 mb-2">
                    Search for user by name or email:
                    <span className="text-xs text-gray-400 ml-1">
                      (Only showing users without existing claims)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Start typing to search..."
                  />

                  {isSearching && <div className="mt-2 text-sm text-gray-500">Searching...</div>}

                  {searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
                    <div className="mt-2 text-sm text-gray-500">
                      No eligible users found. Users with existing claims are not shown.
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md shadow-sm">
                      {searchResults.map(user => (
                        <div
                          key={user.user_id}
                          onClick={() => setSelectedUser(user)}
                          className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                            selectedUser?.user_id === user.user_id ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <div className="font-medium">
                            {user.first_name} {user.family_name}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedUser && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700">Selected New Claimant:</h4>
                    <div className="mt-1">
                      <div className="font-medium">
                        {selectedUser.first_name} {selectedUser.family_name}
                      </div>
                      <div className="text-sm text-gray-600">{selectedUser.email}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferClaim}
                  disabled={!selectedUser}
                  className={`px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    selectedUser
                      ? 'bg-blue-500 hover:bg-blue-700'
                      : 'bg-blue-300 cursor-not-allowed'
                  }`}
                >
                  Transfer Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
