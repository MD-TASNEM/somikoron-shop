import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function POST(request) {
  try {
    const { email, name } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address' }, { status: 400 });
    }
    const db = await getDb();
    const existing = await db.collection('newsletter').findOne({ email });
    if (existing) return NextResponse.json({ success: false, message: 'Email already subscribed' }, { status: 409 });

    await db.collection('newsletter').insertOne({ email, name: name || '', isActive: true, subscribedAt: new Date() });
    return NextResponse.json({ success: true, message: 'Successfully subscribed!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
