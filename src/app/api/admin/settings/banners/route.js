import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';

export async function GET(request) {
  try {
    const db = await getDb();
    const settings = await db.collection('settings').findOne({});
    return NextResponse.json({ success: true, data: settings?.banners || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const banner = await request.json();
    if (!banner.title || !banner.image) return NextResponse.json({ success: false, error: 'Title and image required' }, { status: 400 });

    const db = await getDb();
    banner._id = new Date().getTime().toString();
    banner.createdAt = new Date();

    await db.collection('settings').updateOne({}, { $push: { banners: banner }, $set: { updatedAt: new Date() } }, { upsert: true });
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
