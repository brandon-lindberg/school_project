import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

// Get messages for a user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const messages = await prisma.messageRecipient.findMany({
      where: { user_id: user.user_id },
      include: {
        message: {
          include: {
            sender: {
              select: {
                email: true,
                family_name: true,
                first_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        message: {
          created_at: 'desc',
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// Send a new message
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, role: true },
    });

    if (!sender || sender.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, recipientIds, isBroadcast } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Start a transaction
    const result = await prisma.$transaction(async tx => {
      // Create the message
      const message = await tx.message.create({
        data: {
          title,
          content,
          sender_id: sender.user_id,
          is_broadcast: isBroadcast,
        },
      });

      // Get recipient IDs
      let recipients;
      if (isBroadcast) {
        // Get all user IDs if it's a broadcast
        recipients = await tx.user.findMany({
          select: { user_id: true },
        });
      } else {
        // Use provided recipient IDs
        if (!recipientIds?.length) {
          throw new Error('Recipient IDs are required for non-broadcast messages');
        }
        recipients = recipientIds.map((id: number) => ({ user_id: id }));
      }

      // Create message recipients
      await tx.messageRecipient.createMany({
        data: recipients.map((recipient: { user_id: number }) => ({
          message_id: message.message_id,
          user_id: recipient.user_id,
        })),
      });

      // Create notifications for recipients
      await tx.notification.createMany({
        data: recipients.map((recipient: { user_id: number }) => ({
          user_id: recipient.user_id,
          type: 'MESSAGE_RECEIVED',
          title: 'New Message',
          message: `You have received a new message: ${title}`,
          is_read: false,
        })),
      });

      return message;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
