'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, AlertTriangle, ArrowLeft, Eye, ShoppingBag, RefreshCw, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const error = searchParams.get('error');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setOrder(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  const errorMessages = {
    amount_mismatch: { title: 'Payment Amount Mismatch', desc: "The payment amount doesn't match the order total.", canRetry: false },
    payment_verification_failed: { title: 'Payment Verification Failed', desc: "We couldn't verify your payment. Please try again.", canRetry: true },
    server_error: { title: 'Server Error', desc: 'A server error occurred. Please try again.', canRetry: true },
  };

  const errorInfo = errorMessages[error] || { title: 'Payment Failed', desc: 'An error occurred during payment processing.', canRetry: true };

  if (loading) return (
    <div className="min-h-screen bg-light-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-light-bg py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-dark-gray hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-secondary mb-2">{errorInfo.title}</h1>
            <p className="text-lg text-dark-gray">{errorInfo.desc}</p>
          </div>

          {order && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div className="text-sm text-red-700 space-y-1">
                  <p><strong>Order ID:</strong> #{order.orderId}</p>
                  <p><strong>Amount:</strong> ৳{order.total?.toLocaleString('en-BD')}</p>
                  <p><strong>Status:</strong> Payment Failed</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6 text-sm text-gray-600">
              <strong>Error Code:</strong> {error}
            </div>
          )}

          <div className="space-y-3">
            {errorInfo.canRetry && (
              <Link href={`/checkout${orderId ? `?retry=${orderId}` : ''}`} className="w-full btn btn-primary flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5" />Retry Payment
              </Link>
            )}
            <Link href="/orders" className="w-full btn btn-outline flex items-center justify-center gap-2">
              <Eye className="h-5 w-5" />View My Orders
            </Link>
            <Link href="/products" className="w-full btn btn-outline flex items-center justify-center gap-2">
              <ShoppingBag className="h-5 w-5" />Continue Shopping
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-secondary mb-4">Need Help?</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="https://wa.me/8801996570203" target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium transition-colors">
              <Phone className="h-4 w-4" />WhatsApp Support
            </a>
            <a href="tel:+8801996570203" className="flex-1 flex items-center justify-center gap-2 border border-medium-gray text-secondary hover:border-primary hover:text-primary py-2.5 px-4 rounded-lg font-medium transition-colors">
              <Phone className="h-4 w-4" />Call Support
            </a>
            <a href="mailto:support@somikoronshop.com" className="flex-1 flex items-center justify-center gap-2 border border-medium-gray text-secondary hover:border-primary hover:text-primary py-2.5 px-4 rounded-lg font-medium transition-colors">
              <Mail className="h-4 w-4" />Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';
export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div></div>}>
      <PaymentFailContent />
    </Suspense>
  );
}
