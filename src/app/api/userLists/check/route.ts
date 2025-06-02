import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const schoolId = url.searchParams.get('schoolId');

    if (!userId || !schoolId) {
      return NextResponse.json({ error: 'User ID and School ID are required.' }, { status: 400 });
    }

    // Directly query the UserListSchools table through the relationship
    const userListSchool = await prisma.userListSchools.findFirst({
      where: {
        school_id: schoolId,
        list: {
          user_id: userId,
        },
      },
      select: {
        list_id: true,
      },
    });

    return NextResponse.json({
      isInList: !!userListSchool,
      listId: userListSchool?.list_id || null,
    });
  } catch (error: unknown) {
    let message = 'An unexpected error occurred.';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
