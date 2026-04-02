'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Truck, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) { setError('Order ID not found'); setLoading(false); return; }
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setOrder(data.data); else setError(data.message || 'Order not found'); })
      .catch(() => setError('Failed to load order details'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-dark-gray">Loading order details...</p>
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <h1 className="text-2xl font-bold text-secondary mb-4">Order Not Found</h1>
        <p className="text-dark-gray mb-6">{error}</p>
        <Link href="/orders" className="btn btn-outline block mb-3">View Orders</Link>
        <Link href="/products" className="btn btn-primary block">Continue Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light-bg py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-dark-gray hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-secondary mb-4">Payment Successful!</h1>
          <p className="text-lg text-dark-gray mb-6">Thank you for your order. Your payment has been processed successfully.</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 inline-block text-left">
            <p className="font-semibold text-green-800">Order ID: <span className="font-bold">#{order.orderId}</span></p>
            {paymentId && <p className="text-sm text-green-700">Payment ID: {paymentId}</p>}
            <p className="text-sm text-green-700">Status: {order.status}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/orders" className="btn btn-outline">View Orders</Link>
            <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-secondary mb-6">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-secondary mb-3">Order Info</h3>
              <div className="space-y-2 text-sm">
                {[['Order ID', `#${order.orderId}`], ['Status', order.status], ['Payment', order.paymentStatus], ['Date', new Date(order.createdAt).toLocaleDateString('en-BD')]].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-dark-gray">{k}:</span>
                    <span className="font-medium capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-secondary mb-3">Shipping Address</h3>
              <div className="space-y-2 text-sm text-dark-gray">
                <div className="flex items-center gap-2"><Package className="h-4 w-4 shrink-0" /><span>{order.shippingAddress.name}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /><span>{order.shippingAddress.phone}</span></div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /><span>{order.shippingAddress.email}</span></div>
                <div className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /><span>{order.shippingAddress.address}, {order.shippingAddress.city}</span></div>
              </div>
            </div>
          </div>

          <div className="border-t border-medium-gray pt-6 space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4 pb-4 border-b border-medium-gray last:border-0">
                <img src={item.image || 'https://placehold.co/64x64'} alt={item.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-secondary">{item.nameBn || item.name}</p>
                  <p className="text-sm text-dark-gray">Qty: {item.quantity} × ৳{item.price.toLocaleString('en-BD')}</p>
                  <p className="text-sm font-semibold text-primary">৳{(item.price * item.quantity).toLocaleString('en-BD')}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-medium-gray pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-dark-gray">Subtotal</span><span>৳{order.subtotal?.toLocaleString('en-BD')}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{order.discount.toLocaleString('en-BD')}</span></div>}
            <div className="flex justify-between"><span className="text-dark-gray">Tax</span><span>৳{order.tax?.toLocaleString('en-BD')}</span></div>
            <div className="flex justify-between"><span className="text-dark-gray">Shipping</span><span className="text-green-600">{order.shippingCost === 0 ? 'FREE' : `৳${order.shippingCost}`}</span></div>
            <div className="flex justify-between pt-2 border-t border-medium-gray font-bold text-base">
              <span>Total</span><span className="text-primary">৳{order.total?.toLocaleString('en-BD')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-secondary mb-6">What&apos;s Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: Truck, color: 'bg-blue-100 text-blue-600', title: 'Processing', desc: 'Your order is being prepared and will ship within 1-2 business days.' },
              { icon: Package, color: 'bg-green-100 text-green-600', title: 'Shipping', desc: "You'll receive tracking info once your order ships." },
              { icon: CheckCircle, color: 'bg-purple-100 text-purple-600', title: 'Delivery', desc: 'Expected delivery within 2-3 business days after shipping.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title}>
                <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-secondary mb-2">{title}</h4>
                <p className="text-sm text-dark-gray">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
