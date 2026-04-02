import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

async function checkAdmin(request) {
  const session = await getSessionUser(request);
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function PUT(request) {
  try {
    const session = await checkAdmin(request);
    if (!session) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const { productIds, category } = await request.json();
    if (!productIds?.length || !category) return NextResponse.json({ success: false, error: 'productIds and category required' }, { status: 400 });

    const db = await getDb();
    const result = await db.collection('products').updateMany(
      { _id: { $in: productIds.map((id) => new ObjectId(id)) } },
      { $set: { category, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, data: { matched: result.matchedCount, modified: result.modifiedCount } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await checkAdmin(request);
    if (!session) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const { productIds } = await request.json();
    if (!productIds?.length) return NextResponse.json({ success: false, error: 'productIds required' }, { status: 400 });

    const db = await getDb();
    const result = await db.collection('products').deleteMany(
      { _id: { $in: productIds.map((id) => new ObjectId(id)) } }
    );

    return NextResponse.json({ success: true, data: { deletedCount: result.deletedCount } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
