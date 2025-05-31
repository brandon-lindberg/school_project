import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const schoolIds = url.searchParams.get('schoolIds')?.split(',');

    if (!userId || !schoolIds) {
      return NextResponse.json({ error: 'User ID and School IDs are required.' }, { status: 400 });
    }

    // Get all user list schools in one query
    const userListSchools = await prisma.userListSchools.findMany({
      where: {
        school_id: {
          in: schoolIds,
        },
        list: {
          user_id: userId,
        },
      },
      select: {
        school_id: true,
        list_id: true,
      },
    });

    // Create a map of school_id to list status
    const schoolListMap = Object.fromEntries(
      schoolIds.map(schoolId => [
        schoolId,
        {
          isInList: false,
          listId: null as number | null,
        },
      ])
    );

    // Update the map with actual results
    userListSchools.forEach(({ school_id, list_id }) => {
      schoolListMap[school_id] = {
        isInList: true,
        listId: list_id,
      };
    });

    return NextResponse.json(schoolListMap);
  } catch (error: unknown) {
    let message = 'An unexpected error occurred.';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
