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
  resumeUrl: z.string().optional(),
  coverLetter: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // Require authenticated user
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const jobId = parseInt(params.id, 10);
  if (isNaN(jobId)) {
    return NextResponse.json({ error: 'Invalid job posting ID' }, { status: 400 });
  }
  try {
    const body = await request.json();
    const data = applicationSchema.parse(body);
    const userId = parseInt((await getServerSession(authOptions))?.user?.id!);
    // create application with user association
    const application = await prisma.application.create({
      data: {
        jobPostingId: jobId,
        userId,
        applicantName: data.applicantName,
        email: data.email,
        phone: data.phone,
        hasJapaneseVisa: data.hasJapaneseVisa ?? false,
        comment: data.comment,
        certifications: data.certifications ?? [],
        degrees: data.degrees ?? [],
        currentResidence: data.currentResidence,
        nationality: data.nationality,
        resumeUrl: data.resumeUrl,
        coverLetter: data.coverLetter,
      },
    });
    // create notification for applicant
    await prisma.notification.create({
      data: {
        user_id: userId,
        type: 'MESSAGE_RECEIVED',
        title: 'Application Received',
        message: `Your application for job #${jobId} has been received.`,
      },
    });
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
