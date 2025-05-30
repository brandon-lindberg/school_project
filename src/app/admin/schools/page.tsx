'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { UserRole } from '@prisma/client';

type ExtendedSession = Session & {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: UserRole;
    managedSchoolId?: string;
  };
};

interface School {
  school_id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  website: string | null;
  phone_number: string | null;
  email: string | null;
}

export default function SchoolsManagement() {
  const router = useRouter();
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);

  const fetchSchools = useCallback(async () => {
    try {
      let response;
      if (session?.user.role === 'SUPER_ADMIN') {
        response = await fetch('/api/admin/schools');
      } else {
        // Fetch only the managed school for school admins
        response = await fetch(`/api/admin/schools/${session?.user.managedSchoolId}`);
      }

      if (!response.ok) {
        throw new Error('Failed to fetch schools');
      }

      const data = await response.json();
      // Handle both array (super admin) and single object (school admin) responses
      setSchools(Array.isArray(data) ? data : [data]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error('Failed to fetch schools');
      setLoading(false);
    }
  }, [session?.user.role, session?.user.managedSchoolId]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (
      !session.user.role ||
      (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'SCHOOL_ADMIN')
    ) {
      router.push('/');
      return;
    }

    fetchSchools();
  }, [session, status, router, fetchSchools]);

  const handleEditClick = (school: School) => {
    setEditingSchool(school);
  };

  const handleCancelEdit = () => {
    setEditingSchool(null);
  };

  const handleSaveEdit = async (school: School) => {
    try {
      const response = await fetch(`/api/admin/schools/${school.school_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(school),
      });

      if (!response.ok) {
        throw new Error('Failed to update school');
      }

      const updatedSchool = await response.json();
      setSchools(schools.map(s => (s.school_id === updatedSchool.school_id ? updatedSchool : s)));
      setEditingSchool(null);
      toast.success('School updated successfully');
    } catch (error) {
      console.error('Error updating school:', error);
      toast.error('Failed to update school');
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {session?.user.role === 'SUPER_ADMIN' ? 'Schools Management' : 'Manage Your School'}
      </h1>
      {session?.user.role === 'SUPER_ADMIN' && (
        <div className="mb-4">
          <button
            onClick={() => router.push('/admin/schools/create')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add School
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Address</th>
              <th className="px-4 py-2 border">City</th>
              <th className="px-4 py-2 border">Country</th>
              <th className="px-4 py-2 border">Website</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map(school => (
              <tr key={school.school_id}>
                {editingSchool?.school_id === school.school_id ? (
                  <>
                    <td className="px-4 py-2 border">
                      <input
                        type="text"
                        value={editingSchool.name ?? ''}
                        onChange={e => setEditingSchool({ ...editingSchool, name: e.target.value })}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        type="text"
                        value={editingSchool.address ?? ''}
                        onChange={e =>
                          setEditingSchool({ ...editingSchool, address: e.target.value })
                        }
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        type="text"
                        value={editingSchool.city ?? ''}
                        onChange={e => setEditingSchool({ ...editingSchool, city: e.target.value })}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        type="text"
                        value={editingSchool.country ?? ''}
                        onChange={e =>
                          setEditingSchool({ ...editingSchool, country: e.target.value })
                        }
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        type="text"
                        value={editingSchool.website ?? ''}
                        onChange={e =>
                          setEditingSchool({ ...editingSchool, website: e.target.value })
                        }
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        type="text"
                        value={editingSchool.phone_number ?? ''}
                        onChange={e =>
                          setEditingSchool({ ...editingSchool, phone_number: e.target.value })
                        }
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        type="text"
                        value={editingSchool.email ?? ''}
                        onChange={e =>
                          setEditingSchool({ ...editingSchool, email: e.target.value })
                        }
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleSaveEdit(editingSchool)}
                        className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 border">{school.name}</td>
                    <td className="px-4 py-2 border">{school.address}</td>
                    <td className="px-4 py-2 border">{school.city}</td>
                    <td className="px-4 py-2 border">{school.country}</td>
                    <td className="px-4 py-2 border">{school.website}</td>
                    <td className="px-4 py-2 border">{school.phone_number}</td>
                    <td className="px-4 py-2 border">{school.email}</td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleEditClick(school)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
