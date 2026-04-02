import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';

export async function PUT(request, context) {
  const { id } = await context.params;
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const bannerData = await request.json();
    const db = await getDb();
    await db.collection('settings').updateOne(
      { 'banners._id': id },
      { $set: { 'banners.$': { ...bannerData, _id: id, updatedAt: new Date() } } }
    );
    return NextResponse.json({ success: true, data: { ...bannerData, _id: id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const { id } = await context.params;
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const db = await getDb();
    await db.collection('settings').updateOne({}, { $pull: { banners: { _id: id } } });
    return NextResponse.json({ success: true, data: { deletedId: id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
