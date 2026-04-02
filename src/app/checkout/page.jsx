'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore, cartActions } from '@/store/cart';
import { toast } from 'react-toastify';
import { ArrowLeft, CreditCard, Truck, User, Mail, MapPin, CheckCircle, Smartphone, Shield } from 'lucide-react';
import Link from 'next/link';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Enter a valid Bangladesh mobile number'),
  email: z.string().email('Enter a valid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(2, 'District is required'),
  zip: z.string().min(4, 'ZIP code is required'),
  paymentMethod: z.enum(['sslcommerz', 'cash-on-delivery']),
  notes: z.string().max(500).optional(),
});

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { calculateSavings } = cartActions;
  const { savings, savingsPercentage } = calculateSavings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  const { control, handleSubmit, register, watch, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cash-on-delivery', notes: '' },
  });

  const watchedPaymentMethod = watch('paymentMethod');
  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.15);
  const shippingCost = subtotal > 1000 ? 0 : 60;
  const discount = savings;
  const total = subtotal + tax + shippingCost - discount;

  const onSubmit = async (data) => {
    try {
      setIsProcessing(true);
      const orderItems = items.map((item) => ({
        productId: item.productId, name: item.name, nameBn: item.nameBn || '',
        price: item.price, quantity: item.quantity, image: item.image,
        slug: item.slug, category: item.category,
      }));
      const shippingAddress = {
        name: data.name, phone: data.phone, email: data.email,
        address: data.address, city: data.city, district: data.district, zip: data.zip,
      };

      if (data.paymentMethod === 'sslcommerz') {
        const res = await fetch('/api/payment/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderData: { items: orderItems, shippingAddress, paymentMethod: 'sslcommerz', notes: data.notes, subtotal, tax, shippingCost, discount, total } }),
        });
        const result = await res.json();
        if (result.success && result.gatewayUrl) {
          clearCart();
          window.location.href = result.gatewayUrl;
        } else {
          throw new Error(result.message || 'Payment initiation failed');
        }
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: orderItems, shippingAddress, paymentMethod: 'cash-on-delivery', notes: data.notes, subtotal, tax, shippingCost, discount, total }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to place order');
        setPlacedOrderId(result.data?.orderId || result.orderId || 'N/A');
        setOrderPlaced(true);
        clearCart();
        toast.success('Order placed successfully! We will contact you soon.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-gray mb-4">Your cart is empty.</p>
          <Link href="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <Link href="/cart" className="inline-flex items-center gap-2 text-dark-gray hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /><span>Back to Cart</span>
          </Link>
        </div>

        {!orderPlaced ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-secondary mb-6">Shipping Information</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="text" {...register('name')} placeholder="Your full name" className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.name ? 'border-red-400' : 'border-medium-gray'}`} />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Phone Number *</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="tel" {...register('phone')} placeholder="01XXXXXXXXX" className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.phone ? 'border-red-400' : 'border-medium-gray'}`} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="email" {...register('email')} placeholder="your@email.com" className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.email ? 'border-red-400' : 'border-medium-gray'}`} />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Street Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea {...register('address')} placeholder="Full address" rows={2} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.address ? 'border-red-400' : 'border-medium-gray'}`} />
                    </div>
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">City *</label>
                      <input type="text" {...register('city')} placeholder="Dhaka" className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.city ? 'border-red-400' : 'border-medium-gray'}`} />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">District *</label>
                      <input type="text" {...register('district')} placeholder="Dhaka" className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.district ? 'border-red-400' : 'border-medium-gray'}`} />
                      {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">ZIP *</label>
                      <input type="text" {...register('zip')} placeholder="1000" className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.zip ? 'border-red-400' : 'border-medium-gray'}`} />
                      {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip.message}</p>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-secondary mb-3">Payment Method</h3>
                    <Controller name="paymentMethod" control={control} render={({ field }) => (
                      <div className="space-y-2">
                        <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${field.value === 'cash-on-delivery' ? 'border-primary bg-red-50' : 'border-medium-gray hover:border-primary/50'}`}>
                          <input type="radio" {...field} value="cash-on-delivery" className="text-primary" />
                          <Truck className="h-5 w-5 text-primary" />
                          <div><p className="font-medium text-secondary text-sm">Cash on Delivery</p><p className="text-xs text-dark-gray">Pay when you receive</p></div>
                        </label>
                        <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${field.value === 'sslcommerz' ? 'border-primary bg-red-50' : 'border-medium-gray hover:border-primary/50'}`}>
                          <input type="radio" {...field} value="sslcommerz" className="text-primary" />
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div><p className="font-medium text-secondary text-sm">SSLCommerz</p><p className="text-xs text-dark-gray">Card, Mobile Banking, Net Banking</p></div>
                        </label>
                      </div>
                    )} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Order Notes (Optional)</label>
                    <textarea {...register('notes')} placeholder="Special instructions..." rows={2} className="w-full px-4 py-2.5 border border-medium-gray rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <button type="submit" disabled={isProcessing} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isProcessing ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /><span>Processing...</span></>
                    ) : watchedPaymentMethod === 'sslcommerz' ? (
                      <><Shield className="h-5 w-5" /><span>Proceed to Payment</span></>
                    ) : (
                      <><CheckCircle className="h-5 w-5" /><span>Place Order</span></>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-secondary mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3 pb-3 border-b border-medium-gray last:border-0">
                      <img src={item.image || '/images/placeholder-product.jpg'} alt={item.name} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-secondary text-sm truncate">{item.nameBn || item.name}</p>
                        <p className="text-xs text-dark-gray">Qty: {item.quantity} × ৳{item.price.toLocaleString('en-BD')}</p>
                        <p className="text-sm font-semibold text-primary">৳{(item.price * item.quantity).toLocaleString('en-BD')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t border-medium-gray pt-4 text-sm">
                  <div className="flex justify-between"><span className="text-dark-gray">Subtotal</span><span>৳{subtotal.toLocaleString('en-BD')}</span></div>
                  {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({savingsPercentage}%)</span><span>-৳{discount.toLocaleString('en-BD')}</span></div>}
                  <div className="flex justify-between"><span className="text-dark-gray">Tax (15%)</span><span>৳{tax.toLocaleString('en-BD')}</span></div>
                  <div className="flex justify-between"><span className="text-dark-gray">Shipping</span><span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>{shippingCost === 0 ? 'FREE' : `৳${shippingCost}`}</span></div>
                  <div className="flex justify-between font-bold text-base border-t border-medium-gray pt-2 mt-2">
                    <span className="text-secondary">Total</span>
                    <span className="text-primary">৳{total.toLocaleString('en-BD')}</span>
                  </div>
                </div>
                {subtotal < 1000 && <p className="text-xs text-dark-gray mt-3 text-center">Add ৳{(1000 - subtotal).toLocaleString('en-BD')} more for free shipping</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-secondary mb-2">Order Placed!</h1>
              <p className="text-dark-gray mb-4">Order ID: <span className="font-bold text-primary">#{placedOrderId}</span></p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-green-800">We will contact you to confirm delivery details. Thank you for shopping with সমীকরণ শপ!</p>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/orders" className="w-full flex items-center justify-center gap-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-white font-bold py-3 px-6 rounded-full transition-all duration-300">View My Orders</Link>
                <Link href="/products" className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-full transition-all duration-300">Continue Shopping</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
