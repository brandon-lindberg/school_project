import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const schoolId = parseInt(params.id, 10);
  if (isNaN(schoolId)) {
    return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
  }
  try {
    // Fetch job postings for the school
    const jobPostings = await prisma.jobPosting.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });

    // Determine if user has applied to each posting
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id as string, 10) : null;
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
    console.error('Error fetching job postings:', error);
    return NextResponse.json({ error: 'Failed to fetch job postings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
  const schoolId = parseInt(params.id, 10);
  if (isNaN(schoolId)) {
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
