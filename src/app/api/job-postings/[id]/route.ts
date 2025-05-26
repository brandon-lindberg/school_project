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
  status: z.string(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const jobId = parseInt(params.id, 10);
  if (isNaN(jobId)) {
    return NextResponse.json({ error: 'Invalid job posting ID' }, { status: 400 });
  }
  try {
    const jobPosting = await prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!jobPosting) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id as string, 10) : null;
    let hasApplied = false;
    if (userId) {
      const existingApp = await prisma.application.findFirst({ where: { jobPostingId: jobId, userId } });
      hasApplied = existingApp !== null;
    }
    return NextResponse.json({
      ...jobPosting,
      hasApplied,
    });
  } catch (error) {
    console.error('Error fetching job posting:', error);
    return NextResponse.json({ error: 'Failed to fetch job posting' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
  const jobId = parseInt(params.id, 10);
  if (isNaN(jobId)) {
    return NextResponse.json({ error: 'Invalid job posting ID' }, { status: 400 });
  }
  const existing = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  if (!existing) {
    return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
  }
  const schoolId = existing.schoolId;
  const isAuthorized =
    user.role === UserRole.SUPER_ADMIN ||
    (user.managedSchools || []).some(admin => admin.school_id === schoolId);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const data = jobPostingSchema.parse(body);
    const updated = await prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        location: data.location,
        employmentType: data.employmentType,
        status: data.status,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating job posting:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update job posting' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
  const jobId = parseInt(params.id, 10);
  if (isNaN(jobId)) {
    return NextResponse.json({ error: 'Invalid job posting ID' }, { status: 400 });
  }
  const existing = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  if (!existing) {
    return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
  }
  const isAuthorized =
    user.role === UserRole.SUPER_ADMIN ||
    (user.managedSchools || []).some(admin => admin.school_id === existing.schoolId);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  try {
    await prisma.jobPosting.delete({ where: { id: jobId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job posting:', error);
    return NextResponse.json({ error: 'Failed to delete job posting' }, { status: 500 });
  }
}
