// 'use client' directive for client-side interactivity
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function RecruitmentLayout({ children }: { children: React.ReactNode }) {
  const { id: schoolId } = useParams() as { id: string };
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const userRole = session?.user?.role;
  const managedFromSession = session?.user?.managedSchools as { school_id: string }[] ?? [];
  const isAdmin = isAuthenticated && (
    userRole === 'SUPER_ADMIN' ||
    (userRole === 'SCHOOL_ADMIN' && managedFromSession.some(s => s.school_id === schoolId))
  );
  const pathname = usePathname() || '';
  const base = `/schools/${schoolId}/employment/recruitment`;

  let navItems = [
    { label: 'Job Postings', href: `${base}/job-postings` },
  ];
  if (isAdmin) {
    navItems.push({ label: 'Applications', href: `${base}/applications` });
  }
  // Hide Job Postings tab for non-admin users on application detail pages
  if (!isAdmin && pathname.startsWith(`${base}/applications`)) {
    navItems = [];
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {navItems.length > 0 && (
          <nav className="flex space-x-6 border-b mb-6">
            {navItems.map(item => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`pb-2 text-sm font-medium ${isActive
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
