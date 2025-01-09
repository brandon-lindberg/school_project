import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Since NextAuth handles the actual session cleanup,
    // this endpoint is mainly for testing purposes and
    // to provide a consistent API response
    return NextResponse.json({
      message: 'Logged out successfully'
    });
  } catch (error: unknown) {
    let message = 'Something went wrong.';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
