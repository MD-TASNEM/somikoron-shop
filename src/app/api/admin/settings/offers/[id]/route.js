import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request, context) {
  const { id } = await context.params;
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const data = await request.json();
    const db = await getDb();
    const result = await db.collection('offers').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!result) return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { ...result, _id: result._id.toString() } });
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
    const result = await db.collection('offers').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { deletedId: id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
