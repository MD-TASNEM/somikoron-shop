import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';

export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const db = await getDb();
    const subscribers = await db.collection('newsletter').find({}).toArray();
    const csv = ['email,name,subscribedAt', ...subscribers.map((s) => `${s.email},${s.name || ''},${s.subscribedAt?.toISOString() || ''}`)].join('\n');

    return new Response(csv, {
      status: 200,
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="subscribers.csv"' },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
