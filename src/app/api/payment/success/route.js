import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { OrderCollection } from '@/lib/db/collections/order';

export async function POST(request) {
  try {
    const body = await request.json();
    const { tran_id, val_id, amount, store_amount } = body;

    if (!tran_id || !val_id) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/fail?error=missing_params`);
    }

    const db = await getDb();
    const orderCollection = new OrderCollection(db);
    const order = await orderCollection.findByOrderId(tran_id);

    if (!order) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/fail?error=order_not_found`);

    await orderCollection.update(order._id.toString(), {
      paymentStatus: 'paid',
      status: 'processing',
      transactionId: val_id,
    });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/success?order_id=${tran_id}&payment_id=${val_id}`);
  } catch (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/fail?error=server_error`);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tran_id = searchParams.get('tran_id');
  const val_id = searchParams.get('val_id');
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/success?order_id=${tran_id}&payment_id=${val_id}`);
}
