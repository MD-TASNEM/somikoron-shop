import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDb();
    await db.collection('error_logs').insertOne({ type: '404', path: body.path, timestamp: new Date(), ip: request.headers.get('x-forwarded-for') || 'unknown' });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
