'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Calendar, CreditCard, Truck, CheckCircle, Clock, XCircle, ArrowLeft, MapPin, Phone, Mail, User, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { showSuccessToast } from '@/lib/toast';

const statusColors = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  processing: 'text-blue-600 bg-blue-50 border-blue-200',
  shipped: 'text-purple-600 bg-purple-50 border-purple-200',
  delivered: 'text-green-600 bg-green-50 border-green-200',
  cancelled: 'text-red-600 bg-red-50 border-red-200',
};

export default function OrderDetailPage() {
  const params = useParams();
  const { addItem } = useCartStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setOrder(data.data); else setError(data.message || 'Order not found'); })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleReorder = () => {
    if (!order?.items) return;
    order.items.forEach((item) => addItem({ productId: item.productId, name: item.name, nameBn: item.nameBn, slug: item.slug, price: item.price, image: item.image, category: item.category }, item.quantity));
    showSuccessToast('Items added to cart!');
  };

  if (loading) return <div className="min-h-screen bg-light-bg flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div></div>;

  if (error || !order) return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center">
      <div className="text-center max-w-md p-8">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-secondary mb-4">Order Not Found</h1>
        <p className="text-dark-gray mb-6">{error}</p>
        <Link href="/orders" className="btn btn-primary">View All Orders</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light-bg py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/orders" className="inline-flex items-center gap-2 text-dark-gray hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary">Order #{order.orderId}</h1>
              <div className="flex items-center gap-2 text-sm text-dark-gray mt-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(order.createdAt).toLocaleDateString('en-BD')}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[order.status] || 'text-gray-600 bg-gray-50'}`}>
                <span className="capitalize">{order.status}</span>
              </span>
              <button onClick={handleReorder} className="btn btn-outline text-sm">Reorder</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-secondary mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b border-medium-gray last:border-0">
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden">
                      <Image src={item.image || 'https://placehold.co/64x64'} alt={item.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary">{item.nameBn || item.name}</p>
                      <p className="text-sm text-dark-gray">Qty: {item.quantity} × ৳{item.price?.toLocaleString('en-BD')}</p>
                      <p className="text-sm font-semibold text-primary">৳{(item.price * item.quantity)?.toLocaleString('en-BD')}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-medium-gray pt-4 mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-dark-gray">Subtotal</span><span>৳{order.subtotal?.toLocaleString('en-BD')}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{order.discount?.toLocaleString('en-BD')}</span></div>}
                <div className="flex justify-between"><span className="text-dark-gray">Tax</span><span>৳{order.tax?.toLocaleString('en-BD')}</span></div>
                <div className="flex justify-between"><span className="text-dark-gray">Shipping</span><span className="text-green-600">{order.shippingCost === 0 ? 'FREE' : `৳${order.shippingCost}`}</span></div>
                <div className="flex justify-between pt-2 border-t border-medium-gray font-bold text-base">
                  <span>Total</span><span className="text-primary">৳{order.total?.toLocaleString('en-BD')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-secondary mb-4">Shipping Address</h2>
              <div className="space-y-3 text-sm text-dark-gray">
                <div className="flex items-center gap-2"><User className="h-4 w-4 shrink-0" /><span>{order.shippingAddress?.name}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /><span>{order.shippingAddress?.phone}</span></div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /><span>{order.shippingAddress?.email}</span></div>
                <div className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /><span>{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.district}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-secondary mb-4">Payment</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-dark-gray">Method</span><span className="capitalize">{order.paymentMethod?.replace('-', ' ')}</span></div>
                <div className="flex justify-between"><span className="text-dark-gray">Status</span><span className={`capitalize font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span></div>
                {order.transactionId && <div className="flex justify-between"><span className="text-dark-gray">TXN ID</span><span className="text-xs font-mono">{order.transactionId}</span></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
