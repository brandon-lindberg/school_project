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
  isArchived: z.boolean().optional(),
});

const updateJobPostingSchema = jobPostingSchema.partial();

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  const jobId = parseInt(id, 10);
  if (isNaN(jobId)) {
    return NextResponse.json({ error: 'Invalid job posting ID' }, { status: 400 });
  }
  try {
    const jobPosting: any = await prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!jobPosting) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    let isAuthorized = false;
    if (email) {
      const user = await prisma.user.findUnique({ where: { email }, include: { managedSchools: true } });
      isAuthorized =
        user?.role === UserRole.SUPER_ADMIN ||
        (user?.managedSchools || []).some(admin => admin.school_id === jobPosting.schoolId);
    }
    if (jobPosting.isArchived && !isAuthorized) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }
    const userId = session?.user?.id ? parseInt(session.user.id as string, 10) : null;
    let hasApplied = false;
    if (userId) {
      const existingApp = await prisma.application.findFirst({ where: { jobPostingId: jobId, userId } });
      hasApplied = existingApp !== null;
    }
    return NextResponse.json({
      ...jobPosting,
      isArchived: jobPosting.isArchived,
      hasApplied,
    });
  } catch (error) {
    try {
      console.error(error instanceof Error ? error.message : String(error));
    } catch { }
    return NextResponse.json({ error: 'Failed to fetch job posting' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  const jobId = parseInt(id, 10);
  if (isNaN(jobId)) {
    return NextResponse.json({ error: 'Invalid job posting ID' }, { status: 400 });
  }
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
    const data = updateJobPostingSchema.parse(body);
    const updated = await prisma.jobPosting.update({
      where: { id: jobId },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    try {
      console.error(error instanceof Error ? error.message : String(error));
    } catch { }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update job posting' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  const jobId = parseInt(id, 10);
  if (isNaN(jobId)) {
    return NextResponse.json({ error: 'Invalid job posting ID' }, { status: 400 });
  }
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
    try {
      console.error(error instanceof Error ? error.message : String(error));
    } catch { }
    return NextResponse.json({ error: 'Failed to delete job posting' }, { status: 500 });
  }
}
