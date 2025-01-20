'use client';

import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
