'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import AdminNav from './components/AdminNav';
import { UserRole } from '@prisma/client';
import { Session } from 'next-auth';
import { Toaster } from 'react-hot-toast';

type ExtendedSession = Session & {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: UserRole;
    managedSchoolId?: string;
  };
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if we're definitely not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Only check role if we have a session
    if (status === 'authenticated' && session?.user?.role !== 'SUPER_ADMIN') {
      // Allow SCHOOL_ADMIN to access their own school's edit page
      if (!(session?.user?.role === 'SCHOOL_ADMIN' && pathname?.startsWith('/admin/schools/'))) {
        router.push('/');
        return;
      }
    }
  }, [session, status, router, pathname]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only block rendering if we're definitely not authorized
  if (status === 'authenticated' && session?.user?.role !== 'SUPER_ADMIN') {
    // Allow SCHOOL_ADMIN to access their own school's edit page
    if (!(session?.user?.role === 'SCHOOL_ADMIN' && pathname?.startsWith('/admin/schools/'))) {
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {session?.user?.role === UserRole.SUPER_ADMIN && <AdminNav />}
      <Toaster position="top-center" />
      <main className="py-6">{children}</main>
    </div>
  );
}
