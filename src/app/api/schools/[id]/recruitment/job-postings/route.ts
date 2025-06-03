import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

const jobPostingSchema = z.object({
  title: z.string(),
  description: z.string(),
  requirements: z.array(z.string()),
  location: z.string(),
  employmentType: z.string(),
  status: z.string().optional(),
});

export async function GET(request: NextRequest, context: unknown) {
  // Extract dynamic route params
  const { params } = context as { params: { id: string } };
  const { id } = params;
  const schoolId = id;
  if (!schoolId) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }
  try {
    // Determine user session and permissions
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    let isAuthorized = false;
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { managedSchools: true },
      });
      isAuthorized =
        user?.role === UserRole.SUPER_ADMIN ||
        (user?.managedSchools || []).some(admin => admin.school_id === schoolId);
    }
    // Debug logging
    console.log('Debug GET job-postings for schoolId:', schoolId, 'isAuthorized:', isAuthorized);
    // Build filter for postings
    const whereClause: Prisma.JobPostingWhereInput = { schoolId };
    console.log('Initial whereClause:', whereClause);
    if (!isAuthorized) {
      whereClause.isArchived = false;
    }
    console.log('Final whereClause with archive filter:', whereClause);
    // Fetch job postings for the school
    const jobPostings = await prisma.jobPosting.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    // Determine if user has applied to each posting
    const userId = session?.user?.id || null;
    let appliedSet = new Set<number>();
    if (userId) {
      const userApps = await prisma.application.findMany({
        where: { userId, jobPosting: { schoolId } },
        select: { jobPostingId: true },
      });
      appliedSet = new Set(userApps.map(a => a.jobPostingId));
    }

    // Map postings with hasApplied flag
    const result = jobPostings.map(job => ({
      ...job,
      hasApplied: appliedSet.has(job.id),
    }));
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error fetching job postings:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: unknown) {
  // Extract dynamic route params
  const { params } = context as { params: { id: string } };
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { managedSchools: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const schoolId = params.id;
  if (!schoolId) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }
  const isAuthorized =
    user.role === UserRole.SUPER_ADMIN ||
    (user.managedSchools || []).some(admin => admin.school_id === schoolId);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const data = jobPostingSchema.parse(body);
    const jobPosting = await prisma.jobPosting.create({
      data: {
        schoolId,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        location: data.location,
        employmentType: data.employmentType,
        status: data.status ?? 'OPEN',
      },
    });
    return NextResponse.json(jobPosting, { status: 201 });
  } catch (error) {
    console.error('Error creating job posting:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create job posting' }, { status: 500 });
  }
}
