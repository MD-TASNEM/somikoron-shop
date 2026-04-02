import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';

export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const db = await getDb();
    const subscribers = await db.collection('newsletter').find({}).sort({ subscribedAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: subscribers.map((s) => ({ ...s, _id: s._id.toString() })) });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
