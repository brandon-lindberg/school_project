import prisma from '@/lib/prisma';

export async function canEditSchool(userId: string, schoolId: number): Promise<boolean> {
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { user_id: parseInt(userId) },
    include: {
      managedSchools: {
        where: { school_id: schoolId },
      },
    },
  });

  // Super admins can edit any school
  if (user?.role === 'SUPER_ADMIN') return true;

  // School admins can only edit their assigned schools
  return Boolean(user?.managedSchools?.length);
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { user_id: parseInt(userId) },
    select: { role: true },
  });

  return user?.role === 'SUPER_ADMIN';
}

export async function isSchoolAdmin(userId: string, schoolId?: number): Promise<boolean> {
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { user_id: parseInt(userId) },
    include: schoolId
      ? {
          managedSchools: {
            where: { school_id: schoolId },
          },
        }
      : {
          managedSchools: true,
        },
  });

  return user?.role === 'SCHOOL_ADMIN' && (!schoolId || user.managedSchools.length > 0);
}
