import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // For demonstration, fetch the first user from the database
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }
    return NextResponse.json({ userId: user.user_id });
  } catch (error: unknown) {
    let message = 'An unexpected error occurred.';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
