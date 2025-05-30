import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const applicationSchema = z.object({
  applicantName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  hasJapaneseVisa: z.boolean().optional(),
  comment: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  degrees: z.array(z.string()).optional(),
  currentResidence: z.string().optional(),
  nationality: z.string().optional(),
  jlpt: z.enum(['None', 'N1', 'N2', 'N3', 'N4', 'N5']).optional(),
  resumeUrl: z.string().optional(),
  coverLetter: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Require authenticated user
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const jobId = parseInt(id, 10);
  if (isNaN(jobId)) {
    return NextResponse.json({ error: 'Invalid job posting ID' }, { status: 400 });
  }
  try {
    const body = await request.json();
    const data = applicationSchema.parse(body);
    const userId = session.user.id as string;
    // Prevent duplicate applications
    const existingApps = (await prisma.application.findMany({ where: { jobPostingId: jobId, userId } })) ?? [];
    if (existingApps.length > 0) {
      return NextResponse.json({ error: 'You have already applied to this position' }, { status: 400 });
    }
    // create application with user association
    const application = await prisma.application.create({
      data: {
        jobPostingId: jobId,
        userId: userId,
        applicantName: data.applicantName,
        email: data.email,
        phone: data.phone,
        hasJapaneseVisa: data.hasJapaneseVisa ?? false,
        comment: data.comment,
        certifications: data.certifications ?? [],
        degrees: data.degrees ?? [],
        currentResidence: data.currentResidence,
        nationality: data.nationality,
        jlpt: data.jlpt ?? 'None',
        resumeUrl: data.resumeUrl,
        coverLetter: data.coverLetter,
        status: 'SCREENING',
        currentStage: 'SCREENING',
      } as any,
    });
    // Optionally fetch job and school info if available
    let jobInfo;
    if (prisma.jobPosting && typeof prisma.jobPosting.findUnique === 'function') {
      jobInfo = await prisma.jobPosting.findUnique({
        where: { id: jobId },
        select: {
          title: true,
          schoolId: true,
          school: { select: { name_en: true } },
        },
      });
    }
    if (jobInfo) {
      const { title: jobTitle, schoolId: schId, school } = jobInfo;
      const schoolName = school.name_en ?? '';
      // Notify applicant
      await prisma.notification.create({
        data: {
          user_id: userId,
          type: 'MESSAGE_RECEIVED',
          title: 'Application Received',
          message: `Your application for "${jobTitle}" at "${schoolName}" has been received.`,
        },
      });
      // Notify school admins and super admins
      const admins = await prisma.user.findMany({
        where: {
          OR: [
            { role: 'SUPER_ADMIN' },
            { managedSchools: { some: { school_id: schId } } },
          ],
        },
        select: { user_id: true },
      });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            user_id: admin.user_id,
            type: 'MESSAGE_RECEIVED',
            title: `New Application: ${jobTitle}`,
            message: `${session.user.email} applied for "${jobTitle}" at "${schoolName}".`,
          })),
        });
      }
    }
    // TODO: send confirmation email
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}
