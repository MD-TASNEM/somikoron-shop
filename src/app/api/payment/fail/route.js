import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { OrderCollection } from '@/lib/db/collections/order';

export async function POST(request) {
  try {
    const body = await request.json();
    const { tran_id } = body;
    if (tran_id) {
      const db = await getDb();
      const orderCollection = new OrderCollection(db);
      const order = await orderCollection.findByOrderId(tran_id);
      if (order) await orderCollection.update(order._id.toString(), { paymentStatus: 'unpaid' });
    }
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/fail?error=payment_failed${tran_id ? `&order_id=${tran_id}` : ''}`);
  } catch (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/fail?error=server_error`);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tran_id = searchParams.get('tran_id');
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/fail?error=payment_failed${tran_id ? `&order_id=${tran_id}` : ''}`);
}
