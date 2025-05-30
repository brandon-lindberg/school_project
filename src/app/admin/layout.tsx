'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminNav from './components/AdminNav';
import { UserRole } from '@prisma/client';
import { Session } from 'next-auth';

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

  useEffect(() => {
    // Only redirect if we're definitely not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Only check role if we have a session
    if (status === 'authenticated' && session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="py-6">{children}</main>
    </div>
  );
}
