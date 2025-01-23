'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import MessageManagement from '../components/admin/MessageManagement';
import { UserRole } from '@prisma/client';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated' || session?.user?.role !== UserRole.SUPER_ADMIN) {
      router.replace('/');
    }
  }, [status, router, session]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    return null; // or a "Not authorized" message
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* School Claims Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">School Claims</h2>
          <p className="text-gray-600 mb-4">Manage and review school ownership claims</p>
          <button
            onClick={() => router.push('/admin/claims')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            View Claims
          </button>
        </div>

        {/* Users Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Manage Users
          </button>
        </div>

        {/* Schools Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Schools</h2>
          <p className="text-gray-600 mb-4">Manage school listings and information</p>
          <button
            onClick={() => router.push('/admin/schools')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Manage Schools
          </button>
        </div>
      </div>

      {/* Message Management Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Message Management</h2>
        <MessageManagement />
      </div>
    </div>
  );
}
