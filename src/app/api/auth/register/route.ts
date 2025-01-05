// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, familyName, firstName, phoneNumber } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already in use.' },
        { status: 400 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create the new user with correct field names
    const newUser = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        family_name: familyName ?? null,      // Changed from familyName to family_name
        first_name: firstName ?? null,        // Changed from firstName to first_name
        phone_number: phoneNumber ?? null,    // Changed from phoneNumber to phone_number
      },
    });

    return NextResponse.json({ userId: newUser.user_id }, { status: 201 });
  } catch (error: unknown) {
    let message = 'Something went wrong.';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

