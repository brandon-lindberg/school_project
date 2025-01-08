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
      include: {
        schools: {
          include: {
            school: {
              select: {
                name_en: true,
                name_jp: true
              }
            }
          }
        }
      },
    });

    // Transform the response to include the current timestamp for each school
    const listsWithDates = {
      lists: lists.map(list => ({
        ...list,
        schools: list.schools.map(school => ({
          ...school,
          created_at: new Date().toISOString() // Using current date as fallback
        }))
      }))
    };

    return NextResponse.json(listsWithDates);
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

    let userList;
    if (!listId) {
      // First, try to find an existing "My Schools" list for the user
      userList = await prisma.userList.findFirst({
        where: {
          user_id: parseInt(userId, 10),
          list_name: "My Schools"
        }
      });

      if (!userList) {
        // If no list exists, create a new one
        userList = await prisma.userList.create({
          data: {
            list_name: "My Schools",
            user_id: parseInt(userId, 10)
          }
        });
      }
    }

    // Add school to the list (either existing or newly created)
    const listToUse = listId ? parseInt(listId, 10) : userList?.list_id;

    if (!listToUse) {
      return NextResponse.json(
        { error: 'Could not determine list ID.' },
        { status: 500 }
      );
    }

    const userListSchool = await prisma.userListSchools.create({
      data: {
        list_id: listToUse,
        school_id: parseInt(schoolId, 10)
      }
    });

    return NextResponse.json({ success: true, userList: userListSchool });
  } catch (error: unknown) {
    let message = 'An unexpected error occurred.';
    if (error instanceof Error) {
      message = error.message;
    }
    console.error('Error in POST /api/userLists:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const listId = url.searchParams.get('listId');
    const schoolId = url.searchParams.get('schoolId');

    if (!listId || !schoolId) {
      return NextResponse.json(
        { error: 'List ID and School ID are required.' },
        { status: 400 }
      );
    }

    // Delete the school from the list
    await prisma.userListSchools.delete({
      where: {
        list_id_school_id: {
          list_id: parseInt(listId, 10),
          school_id: parseInt(schoolId, 10)
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let message = 'An unexpected error occurred.';
    if (error instanceof Error) {
      message = error.message;
    }
    console.error('Error in DELETE /api/userLists:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
