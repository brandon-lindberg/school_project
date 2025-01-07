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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, schoolId, listId } = body;

    if (!userId || !schoolId) {
      return NextResponse.json(
        { error: 'User ID and School ID are required.' },
        { status: 400 }
      );
    }

    // If no listId is provided, create a new list called "My Schools"
    let userList;
    if (!listId) {
      userList = await prisma.userList.create({
        data: {
          list_name: "My Schools",
          user_id: parseInt(userId, 10),
          schools: {
            create: {
              school_id: parseInt(schoolId, 10)
            }
          }
        }
      });
    } else {
      // Add school to existing list
      userList = await prisma.userListSchools.create({
        data: {
          list_id: parseInt(listId, 10),
          school_id: parseInt(schoolId, 10)
        }
      });
    }

    return NextResponse.json({ success: true, userList });
  } catch (error: unknown) {
    let message = 'An unexpected error occurred.';
    if (error instanceof Error) {
      message = error.message;
    }
    console.error('Error in POST /api/userLists:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
