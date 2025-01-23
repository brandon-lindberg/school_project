import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Delete messages that have passed their scheduled deletion date
    const result = await prisma.message.deleteMany({
      where: {
        scheduled_deletion: {
          lte: new Date(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} expired messages`,
    });
  } catch (error) {
    console.error('Error cleaning up messages:', error);
    return NextResponse.json({ error: 'Failed to clean up messages' }, { status: 500 });
  }
}
