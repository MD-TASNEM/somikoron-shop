import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';
import { UserCollection } from '@/lib/db/collections/user';
import { ObjectId } from 'mongodb';

export async function PUT(request, context) {
  const { id } = await context.params;
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const { role } = await request.json();
    if (!role || !['user', 'admin'].includes(role)) return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });

    const db = await getDb();
    const target = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!target) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    if (target._id.toString() === session.id && role !== 'admin') return NextResponse.json({ success: false, error: 'Cannot demote yourself' }, { status: 400 });

    await db.collection('users').updateOne({ _id: new ObjectId(id) }, { $set: { role, updatedAt: new Date() } });
    const updated = await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });

    return NextResponse.json({ success: true, data: { ...updated, _id: updated._id.toString() } });
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
    const target = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!target) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    if (target._id.toString() === session.id) return NextResponse.json({ success: false, error: 'Cannot delete yourself' }, { status: 400 });

    const orderCount = await db.collection('orders').countDocuments({ userId: new ObjectId(id) });
    if (orderCount > 0) return NextResponse.json({ success: false, error: `User has ${orderCount} order(s)` }, { status: 400 });

    await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, data: { deletedId: id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
