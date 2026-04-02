'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Calendar, CreditCard, Truck, CheckCircle, Clock, XCircle, Eye, ArrowLeft } from 'lucide-react';

const statusColors = {
  pending: 'text-yellow-600 bg-yellow-50',
  processing: 'text-blue-600 bg-blue-50',
  shipped: 'text-purple-600 bg-purple-50',
  delivered: 'text-green-600 bg-green-50',
  cancelled: 'text-red-600 bg-red-50',
};

const statusIcons = { pending: Clock, processing: Package, shipped: Truck, delivered: CheckCircle, cancelled: XCircle };

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => { if (data.success) setOrders(data.data?.orders || []); else setError(data.message || 'Failed to load orders'); })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
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

        <h1 className="text-3xl font-bold text-secondary mb-8">My Orders</h1>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Link href="/login" className="btn btn-primary mt-4 inline-block">Login to view orders</Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary mb-2">No orders yet</h2>
            <p className="text-dark-gray mb-6">You haven&apos;t placed any orders yet.</p>
            <Link href="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusIcons[order.status] || Clock;
              return (
                <div key={order._id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="font-bold text-secondary text-lg">#{order.orderId}</p>
                      <div className="flex items-center gap-2 text-sm text-dark-gray mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString('en-BD')}</span>
                      </div>
                      <p className="text-sm text-dark-gray mt-1">{order.items?.length || 0} item(s)</p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <p className="text-xl font-bold text-primary">৳{order.total?.toLocaleString('en-BD')}</p>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'text-gray-600 bg-gray-50'}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span className="capitalize">{order.status}</span>
                      </div>
                      <Link href={`/orders/${order._id}`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                        <Eye className="h-4 w-4" />View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
