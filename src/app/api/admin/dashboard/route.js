import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';

export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const db = await getDb();
    const [totalProducts, totalOrders, pendingOrders, revenueResult, recentOrders, lowStockProducts] = await Promise.all([
      db.collection('products').countDocuments(),
      db.collection('orders').countDocuments(),
      db.collection('orders').countDocuments({ status: 'pending' }),
      db.collection('orders').aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]).toArray(),
      db.collection('orders').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('products').find({ stock: { $lt: 10 } }).sort({ stock: 1 }).limit(5).toArray(),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Last 7 days chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const [dayOrders, dayRevenue] = await Promise.all([
        db.collection('orders').countDocuments({ createdAt: { $gte: start, $lte: end } }),
        db.collection('orders').aggregate([
          { $match: { createdAt: { $gte: start, $lte: end }, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]).toArray(),
      ]);
      chartData.push({ date: start.toLocaleDateString('en-BD'), orders: dayOrders, revenue: dayRevenue[0]?.total || 0 });
    }

    return NextResponse.json({
      success: true,
      data: {
        kpis: { totalProducts, totalOrders, totalRevenue, pendingOrders },
        recentOrders: recentOrders.map((o) => ({ ...o, _id: o._id.toString(), userId: o.userId?.toString() })),
        lowStockProducts: lowStockProducts.map((p) => ({ ...p, _id: p._id.toString(), image: p.images?.[0] || '' })),
        chartData,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
