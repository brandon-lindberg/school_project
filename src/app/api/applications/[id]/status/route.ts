import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import fs from 'fs/promises';
import path from 'path';
import { sendEmail } from '@/lib/email';

const statusSchema = z.object({
  status: z.enum(['APPLIED', 'SCREENING', 'IN_PROCESS', 'REJECTED', 'OFFER', 'ACCEPTED_OFFER', 'REJECTED_OFFER', 'WITHDRAWN']),
});

export async function PATCH(request: NextRequest, { params }: { params: any }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Await params for NextJS 15 dynamic API handling
  const { id } = await params;
  const applicationId = parseInt(id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  // Authorization check
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, include: { managedSchools: true } });
  const app = await prisma.application.findUnique({ where: { id: applicationId }, include: { jobPosting: true } });
  if (!user || !app) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const schoolId = app.jobPosting.schoolId;
  // Determine admin-level authorization (super or school admin)
  const isAdmin = user.role === 'SUPER_ADMIN' || user.managedSchools.some(s => s.school_id === schoolId);

  try {
    const { status } = statusSchema.parse(await request.json());
    // Allow candidate to withdraw their own application
    const isCandidate = session.user.id === app.userId;
    // If not admin, only allow candidate withdrawal
    if (!isAdmin && !(status === 'WITHDRAWN' && isCandidate)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: status as any },
    });

    // Create in-app notification
    await prisma.notification.create({
      data: {
        user_id: app.userId || 0,
        type: 'APPLICATION_STATUS_UPDATED',
        title: `Application ${status}`,
        message: `Your application for "${app.jobPosting.title}" has been ${status.toLowerCase()}.`,
        url: `/schools/${app.jobPosting.schoolId}/employment/recruitment/applications/${applicationId}`,
      } as any,
    });

    // Send email for rejection
    if (status === 'REJECTED') {
      const templatePath = path.join(process.cwd(), 'emails', 'recruitment', 'rejection.txt');
      const template = await fs.readFile(templatePath, 'utf-8');
      const emailText = template
        .replace('{{applicantName}}', app.applicantName)
        .replace('{{jobTitle}}', app.jobPosting.title);
      try {
        await sendEmail({
          to: app.email,
          subject: `Application Update: ${app.jobPosting.title}`,
          text: emailText,
        });
      } catch (emailErr) {
        console.error('Failed to send rejection email, continuing', emailErr);
      }
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Error updating application status:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
