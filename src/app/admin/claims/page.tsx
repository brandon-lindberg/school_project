import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import ClaimsDashboard from './ClaimsDashboard';
import { Session } from 'next-auth';
import { UserRole } from '@prisma/client';

type ExtendedSession = Session & {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: UserRole;
    managedSchoolId?: number;
  };
};

export default async function AdminClaimsPage() {
  const session = (await getServerSession(authOptions)) as ExtendedSession | null;

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/claims');
  }

  // Check if user is super admin directly from session
  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/');
  }

  // Fetch pending claims with related data
  const claims = await prisma.schoolClaim.findMany({
    where: { status: 'PENDING' },
    include: {
      school: {
        select: {
          school_id: true,
          name_en: true,
          name_jp: true,
          email_en: true,
        },
      },
      user: {
        select: {
          user_id: true,
          email: true,
          first_name: true,
          family_name: true,
        },
      },
    },
    orderBy: { submitted_at: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">School Claims Dashboard</h1>
      <ClaimsDashboard initialClaims={claims} />
    </div>
  );
}
