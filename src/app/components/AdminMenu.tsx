'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserRole } from '@prisma/client';

type Props = {
  userRole?: UserRole;
  managedSchoolId?: number;
};

export default function AdminMenu({ userRole }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Only show admin menu for super admins
  if (!userRole || userRole !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-[#F5F5F5] rounded-lg transition-colors group w-full"
      >
        <span className="group-hover:text-[#0057B7]">Admin</span>
        <svg
          className={`ml-1 h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Admin Dashboard
            </Link>
            <Link
              href="/admin/claims"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              School Claims
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Manage Users
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
