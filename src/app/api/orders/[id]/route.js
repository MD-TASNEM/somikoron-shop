import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db/mongodb';
import { OrderCollection } from '@/lib/db/collections/order';
import { UserCollection } from '@/lib/db/collections/user';

async function getOrder(orderCollection, id) {
  let order = await orderCollection.findByOrderId(id);
  if (!order) order = await orderCollection.findById(id);
  return order;
}

export async function GET(request, context) {
  const { id } = await context.params;
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const orderCollection = new OrderCollection(db);
    const userCollection = new UserCollection(db);
    const user = await userCollection.findById(session.id);
    const isAdmin = user?.role === 'admin';
    const order = await getOrder(orderCollection, id);

    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    if (!isAdmin && order.userId?.toString() !== session.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        _id: order._id.toString(),
        userId: order.userId?.toString() || null,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        deliveredAt: order.deliveredAt?.toISOString() || null,
        shippedAt: order.shippedAt?.toISOString() || null,
        cancelledAt: order.cancelledAt?.toISOString() || null,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  const { id } = await context.params;
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const orderCollection = new OrderCollection(db);
    const userCollection = new UserCollection(db);
    const user = await userCollection.findById(session.id);
    if (user?.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const order = await getOrder(orderCollection, id);
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

    const body = await request.json();
    const updated = await orderCollection.update(order._id.toString(), body);
    if (!updated) return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });

    return NextResponse.json({ success: true, data: { orderId: updated.orderId, status: updated.status, updatedAt: updated.updatedAt.toISOString() } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const { id } = await context.params;
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const orderCollection = new OrderCollection(db);
    const userCollection = new UserCollection(db);
    const user = await userCollection.findById(session.id);
    const isAdmin = user?.role === 'admin';
    const order = await getOrder(orderCollection, id);

    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    if (!isAdmin) {
      if (order.userId?.toString() !== session.id) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      if (order.status !== 'pending') return NextResponse.json({ success: false, error: 'Only pending orders can be cancelled' }, { status: 400 });
    }

    const cancelled = await orderCollection.cancelOrder(order._id.toString());
    if (!cancelled) return NextResponse.json({ success: false, error: 'Cancellation failed' }, { status: 500 });

    return NextResponse.json({ success: true, data: { orderId: cancelled.orderId, status: cancelled.status } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  const { id } = await context.params;
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const db = await getDb();
    const orderCollection = new OrderCollection(db);
    const userCollection = new UserCollection(db);
    const user = await userCollection.findById(session.id);
    const isAdmin = user?.role === 'admin';
    const order = await getOrder(orderCollection, id);

    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

    const { action, ...updateData } = await request.json();
    let result;

    if (action === 'update_payment_status') {
      if (!isAdmin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      result = await orderCollection.updatePaymentStatus(order._id.toString(), updateData.paymentStatus, updateData.transactionId);
    } else if (action === 'update_status') {
      if (!isAdmin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      result = await orderCollection.updateStatus(order._id.toString(), updateData.status, updateData.transactionId, updateData.trackingNumber);
    } else if (action === 'add_notes') {
      if (!isAdmin && order.userId?.toString() !== session.id) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      result = await orderCollection.update(order._id.toString(), { notes: updateData.notes });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    if (!result) return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
    return NextResponse.json({ success: true, data: { updatedAt: result.updatedAt.toISOString() } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
