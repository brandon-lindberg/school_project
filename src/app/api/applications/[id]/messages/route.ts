import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

// Fetch all messages for a given application
export async function GET(request: NextRequest, { params }: { params: any }) {
  const { id } = await params;
  const applicationId = parseInt(id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // Fetch application to verify access
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { jobPosting: { select: { schoolId: true } }, user: { select: { user_id: true } } },
  });
  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  // Check admin privileges
  const user = await prisma.user.findUnique({ where: { user_id: userId }, select: { role: true } });
  const isAdmin =
    user?.role === 'SUPER_ADMIN' ||
    (user?.role === 'SCHOOL_ADMIN' &&
      (await prisma.schoolAdmin.findFirst({ where: { user_id: userId, school_id: application.jobPosting.schoolId } })));
  if (!isAdmin && application.userId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Retrieve messages
  // @ts-ignore: applicationMessage delegate may not yet be recognized on PrismaClient
  const messages = await prisma.applicationMessage.findMany({
    where: { applicationId },
    include: { sender: { select: { user_id: true, first_name: true, family_name: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}

// Post a new message for this application
export async function POST(request: NextRequest, { params }: { params: any }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;
  const applicationId = parseInt(id, 10);
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
  }

  // Fetch application and job's school for notifications
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { jobPosting: { select: { schoolId: true } } },
  });
  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  // Determine roles and permissions
  const user = await prisma.user.findUnique({ where: { user_id: userId }, select: { role: true } });
  const isAdmin =
    user?.role === 'SUPER_ADMIN' ||
    (user?.role === 'SCHOOL_ADMIN' &&
      (await prisma.schoolAdmin.findFirst({ where: { user_id: userId, school_id: application.jobPosting.schoolId } })));

  if (!isAdmin && application.userId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  // @ts-ignore: allowCandidateMessages is a new field on Application
  if (!isAdmin && !application.allowCandidateMessages) {
    return NextResponse.json({ error: 'Candidate communication not allowed' }, { status: 403 });
  }

  // Parse content
  let content: string;
  try {
    const body = await request.json();
    content = body.content;
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    // @ts-ignore: applicationMessage delegate may not yet be recognized on PrismaClient
    const message = await prisma.applicationMessage.create({
      data: {
        applicationId,
        senderId: userId,
        content,
      },
    });

    // Notify the other party
    if (isAdmin) {
      if (application.userId) {
        await prisma.notification.create({
          data: {
            user_id: application.userId,
            type: 'MESSAGE_RECEIVED',
            title: 'New message from admin',
            message: content,
            url: `/schools/${application.jobPosting.schoolId}/employment/recruitment/applications/${applicationId}`,
          },
        });
      }
    } else {
      const admins = await prisma.schoolAdmin.findMany({ where: { school_id: application.jobPosting.schoolId } });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            user_id: admin.user_id,
            type: 'MESSAGE_RECEIVED',
            title: 'New message from candidate',
            message: content,
            url: `/schools/${application.jobPosting.schoolId}/employment/recruitment/applications/${applicationId}`,
          })),
        });
      }
    }

    return NextResponse.json(message, { status: 201 });
  } catch (err: any) {
    console.error('Error creating application message:', err);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
