// import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function GET(request: NextRequest) {
//   try {
//     const userId = request.nextUrl.searchParams.get('userId');
//     if (!userId) {
//       return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
//     }

//     const browsingHistory = await prisma.browsingHistory.findMany({
//       where: { user_id: parseInt(userId, 10) },
//       include: { school: true },
//     });

//     return NextResponse.json({ browsingHistory });
//   } catch (error: unknown) {
//     let message = 'An unexpected error occurred.';
//     if (error instanceof Error) {
//       message = error.message;
//     }
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }
