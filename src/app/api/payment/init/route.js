import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { OrderCollection } from '@/lib/db/collections/order';
import { getSessionUser } from '@/lib/auth';

const isProduction = process.env.NODE_ENV === 'production';
const SSLCOMMERZ = {
  store_id: isProduction ? process.env.SSLCOMMERZ_STORE_ID_LIVE : (process.env.SSLCOMMERZ_STORE_ID_SANDBOX || 'testbox'),
  store_passwd: isProduction ? process.env.SSLCOMMERZ_STORE_PASSWORD_LIVE : (process.env.SSLCOMMERZ_STORE_PASSWORD_SANDBOX || 'testbox'),
  session_url: isProduction
    ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
    : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
};

export async function POST(request) {
  try {
    const { orderData } = await request.json();
    if (!orderData?.items || !orderData?.shippingAddress || !orderData?.total) {
      return NextResponse.json({ success: false, error: 'Missing required order data' }, { status: 400 });
    }

    const session = await getSessionUser(request);
    const db = await getDb();
    const orderCollection = new OrderCollection(db);

    const newOrder = await orderCollection.create({
      userId: session?.id,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: 'sslcommerz',
      notes: orderData.notes,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      shippingCost: orderData.shippingCost,
      discount: orderData.discount,
    });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      store_id: SSLCOMMERZ.store_id,
      store_passwd: SSLCOMMERZ.store_passwd,
      total_amount: orderData.total.toString(),
      currency: 'BDT',
      tran_id: newOrder.orderId,
      success_url: `${baseUrl}/api/payment/success`,
      fail_url: `${baseUrl}/api/payment/fail`,
      cancel_url: `${baseUrl}/api/payment/cancel`,
      cus_name: orderData.shippingAddress.name,
      cus_email: orderData.shippingAddress.email,
      cus_phone: orderData.shippingAddress.phone,
      cus_add1: orderData.shippingAddress.address,
      cus_city: orderData.shippingAddress.city,
      cus_country: 'Bangladesh',
      shipping_method: 'NO',
      product_name: 'E-Commerce Order',
      product_category: 'E-Commerce',
      product_profile: 'general',
    });

    const sslResponse = await fetch(SSLCOMMERZ.session_url, { method: 'POST', body: params });
    const sslData = await sslResponse.json();

    if (sslData.status !== 'SUCCESS') {
      return NextResponse.json({ success: false, error: 'Payment gateway error', message: sslData.failedreason }, { status: 400 });
    }

    return NextResponse.json({ success: true, gatewayUrl: sslData.GatewayPageURL, orderId: newOrder.orderId });
  } catch (error) {
    console.error('Payment init error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
