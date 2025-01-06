import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const lists = await prisma.userList.findMany({
      where: { user_id: parseInt(userId, 10) },
      include: { schools: true },
    });

    return NextResponse.json({ lists });
  } catch (error: unknown) {
    let message = 'An unexpected error occurred.';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
