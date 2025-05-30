"use client";

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import SchoolForm from '@/app/admin/components/SchoolForm';
import { Session } from 'next-auth';
import { UserRole } from '@prisma/client';

// Extend default session to include user role
type ExtendedSession = Session & {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: UserRole;
  };
};

export default function CreateSchoolPage() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.email) {
      router.push('/login');
      return;
    }
    if (session.user.role !== UserRole.SUPER_ADMIN) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const handleSubmit = async (formData: {
    name: string;
    address: string;
    city: string;
    country: string;
    website: string;
    phone_number: string;
    email: string;
  }) => {
    try {
      const response = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to create school');
      }
      toast.success('School created successfully');
      router.push('/admin/schools');
    } catch (error) {
      console.error('Error creating school:', error);
      toast.error('Failed to create school');
    }
  };

  if (status === 'loading' || !session) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create New School</h1>
      <SchoolForm submitLabel="Create School" onSubmit={handleSubmit} />
    </div>
  );
}
