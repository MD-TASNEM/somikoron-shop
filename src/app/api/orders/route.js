import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';
import { OrderCollection } from '@/lib/db/collections/order';
import { UserCollection } from '@/lib/db/collections/user';

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.items || !body.shippingAddress || !body.total) {
      return NextResponse.json({ success: false, error: 'Missing required order data' }, { status: 400 });
    }
    const db = await getDb();
    const orderCollection = new OrderCollection(db);
    const session = await getSessionUser(request);
    const newOrder = await orderCollection.create({
      userId: session?.id,
      items: body.items,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod || 'cash-on-delivery',
      notes: body.notes,
      subtotal: body.subtotal,
      tax: body.tax,
      shippingCost: body.shippingCost,
      discount: body.discount,
    });
    return NextResponse.json({ success: true, data: { orderId: newOrder.orderId, _id: newOrder._id.toString() } });
  } catch (error) {
    console.error('Order POST error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const db = await getDb();
    const orderCollection = new OrderCollection(db);
    const userCollection = new UserCollection(db);
    const user = await userCollection.findById(session.id);
    const isAdmin = user?.role === 'admin';

    const result = await orderCollection.search({
      userId: isAdmin ? undefined : session.id,
      status, paymentStatus, search, page, limit, sortBy, sortOrder,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
