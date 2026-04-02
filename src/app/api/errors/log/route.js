import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDb();
    await db.collection('error_logs').insertOne({ ...body, timestamp: new Date() });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
