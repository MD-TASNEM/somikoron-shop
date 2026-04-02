import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { UserCollection } from '@/lib/db/collections/user';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request) {
  try {
    const body = await request.json();

    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, phone, address } = validationResult.data;

    const db = await getDb();
    const userCollection = new UserCollection(db);

    const existingUser = await userCollection.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    const newUser = await userCollection.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim() || undefined,
      address: address ? {
        street: address.street?.trim() || '',
        city: address.city?.trim() || '',
        district: address.district?.trim() || '',
        zip: address.zip?.trim() || ''
      } : undefined,
      role: 'user'
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error during registration', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Registration endpoint - POST only' },
    { status: 405 }
  );
}
