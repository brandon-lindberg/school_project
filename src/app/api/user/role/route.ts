import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user from database with managed schools
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        role: true,
        managedSchools: {
          select: {
            school_id: true,
            school: {
              select: {
                name_en: true,
                name_jp: true,
                job_postings_enabled: true,
                job_postings_start: true,
                job_postings_end: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      role: user.role,
      managedSchools: user.managedSchools.map(admin => ({
        school_id: admin.school_id,
        name: admin.school.name_en || admin.school.name_jp,
        job_postings_enabled: admin.school.job_postings_enabled,
        job_postings_start: admin.school.job_postings_start,
        job_postings_end: admin.school.job_postings_end,
      })),
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json({ error: 'Failed to get user role' }, { status: 500 });
  }
}
