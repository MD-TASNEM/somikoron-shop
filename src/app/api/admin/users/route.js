import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';
import { UserCollection } from '@/lib/db/collections/user';

export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const db = await getDb();
    const userCollection = new UserCollection(db);
    const result = await userCollection.findAll({ page, limit, role, search, sortBy, sortOrder });

    // Add order stats per user
    const usersWithStats = await Promise.all(result.users.map(async (user) => {
      const stats = await db.collection('orders').aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, totalOrders: { $sum: 1 }, totalSpent: { $sum: '$total' } } },
      ]).toArray();
      return { ...user, _id: user._id.toString(), stats: stats[0] ? { totalOrders: stats[0].totalOrders, totalSpent: stats[0].totalSpent } : { totalOrders: 0, totalSpent: 0 } };
    }));

    return NextResponse.json({ success: true, data: { ...result, users: usersWithStats } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
