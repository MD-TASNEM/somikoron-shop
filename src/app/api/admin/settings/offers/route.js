import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';

export async function GET(request) {
  try {
    const db = await getDb();
    const offers = await db.collection('offers').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: offers.map((o) => ({ ...o, _id: o._id.toString() })) });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const offer = await request.json();
    if (!offer.title || !offer.type) return NextResponse.json({ success: false, error: 'Title and type required' }, { status: 400 });

    const db = await getDb();
    const result = await db.collection('offers').insertOne({ ...offer, isActive: true, createdAt: new Date(), updatedAt: new Date() });
    return NextResponse.json({ success: true, data: { _id: result.insertedId.toString() } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
