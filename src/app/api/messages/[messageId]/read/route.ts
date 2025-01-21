import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/options';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { messageId: string } }) {
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

    const messageId = parseInt(params.messageId);
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    // Mark message as read
    await prisma.messageRecipient.update({
      where: {
        message_id_user_id: {
          message_id: messageId,
          user_id: user.user_id,
        },
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return NextResponse.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json({ error: 'Failed to mark message as read' }, { status: 500 });
  }
}
