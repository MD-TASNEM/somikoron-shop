'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCartStore, cartActions } from '@/store/cart';
import { ArrowLeft, Trash2, Plus, Minus, Tag, MessageCircle, CreditCard, ShoppingBag, Package } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, getTotalItems, getTotalPrice, updateQuantity, removeItem, clearCart } = useCartStore();
  const { calculateSavings } = cartActions;
  const { savings, savingsPercentage } = calculateSavings();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isRemoving, setIsRemoving] = useState(null);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else if (newQuantity <= 99) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    setIsRemoving(productId);
    setTimeout(() => { removeItem(productId); setIsRemoving(null); }, 300);
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      if (promoCode.toUpperCase() === 'SAVE10') { setDiscount(10); setAppliedPromo(promoCode.toUpperCase()); }
      else if (promoCode.toUpperCase() === 'SAVE20') { setDiscount(20); setAppliedPromo(promoCode.toUpperCase()); }
      else { alert('Invalid promo code'); }
    }
  };

  const handleRemovePromo = () => { setDiscount(0); setAppliedPromo(''); setPromoCode(''); };

  const subtotal = getTotalPrice();
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-light-bg py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-dark-gray hover:text-primary transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-24 w-24 text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-secondary mb-4">Your cart is empty</h1>
            <p className="text-lg text-dark-gray mb-8 max-w-md">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/products" className="btn btn-primary">
              <ShoppingBag className="h-5 w-5" />
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-secondary mb-6">Shopping Cart ({getTotalItems()} items)</h2>
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-medium-gray">
                        <th className="text-left pb-3 font-medium text-dark-gray">Product</th>
                        <th className="text-center pb-3 font-medium text-dark-gray">Price</th>
                        <th className="text-center pb-3 font-medium text-dark-gray">Quantity</th>
                        <th className="text-center pb-3 font-medium text-dark-gray">Total</th>
                        <th className="text-center pb-3 font-medium text-dark-gray">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.productId} className={`border-b border-medium-gray transition-opacity duration-300 ${isRemoving === item.productId ? 'opacity-50' : 'opacity-100'}`}>
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                                <Image src={item.image || '/images/placeholder-product.jpg'} alt={item.name} fill className="object-cover" sizes="64px" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-secondary line-clamp-2 mb-1">{item.nameBn || item.name}</h3>
                                {item.category && <span className="text-xs text-dark-gray bg-light-bg px-2 py-1 rounded">{item.category}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <div>
                              <span className="text-sm font-bold text-primary">৳{item.price.toLocaleString('en-BD')}</span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <div className="text-xs text-gray-400 line-through">৳{item.originalPrice.toLocaleString('en-BD')}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button onClick={() => handleQuantityChange(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-medium-gray flex items-center justify-center hover:bg-gray-100" disabled={isRemoving === item.productId}>
                                <Minus className="h-3 w-3" />
                              </button>
                              <input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)} className="w-16 h-8 text-center border border-medium-gray rounded-lg" min="1" max="99" disabled={isRemoving === item.productId} />
                              <button onClick={() => handleQuantityChange(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-medium-gray flex items-center justify-center hover:bg-gray-100" disabled={isRemoving === item.productId}>
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <div>
                              <span className="text-sm font-bold text-secondary">৳{(item.price * item.quantity).toLocaleString('en-BD')}</span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <div className="text-xs text-green-600">Save ৳{((item.originalPrice - item.price) * item.quantity).toLocaleString('en-BD')}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <button onClick={() => handleRemoveItem(item.productId)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg" disabled={isRemoving === item.productId}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className={`bg-light-bg rounded-lg p-4 transition-opacity duration-300 ${isRemoving === item.productId ? 'opacity-50' : 'opacity-100'}`}>
                      <div className="flex space-x-3">
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image src={item.image || '/images/placeholder-product.jpg'} alt={item.name} fill className="object-cover" sizes="80px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-secondary line-clamp-2 mb-1">{item.nameBn || item.name}</h3>
                              {item.category && <span className="text-xs text-dark-gray bg-white px-2 py-1 rounded">{item.category}</span>}
                            </div>
                            <button onClick={() => handleRemoveItem(item.productId)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" disabled={isRemoving === item.productId}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-dark-gray font-medium">Qty:</span>
                              <div className="flex items-center border border-medium-gray rounded-lg">
                                <button onClick={() => handleQuantityChange(item.productId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100" disabled={isRemoving === item.productId}><Minus className="h-3 w-3" /></button>
                                <input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)} className="w-12 h-8 text-center border-0 focus:ring-0 text-sm" min="1" max="99" disabled={isRemoving === item.productId} />
                                <button onClick={() => handleQuantityChange(item.productId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100" disabled={isRemoving === item.productId}><Plus className="h-3 w-3" /></button>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-secondary">৳{(item.price * item.quantity).toLocaleString('en-BD')}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h3 className="text-xl font-bold text-secondary mb-6">Order Summary</h3>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary mb-2">Promo Code</label>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Enter promo code" className="w-full pl-10 pr-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" disabled={appliedPromo !== ''} />
                    </div>
                    {appliedPromo ? (
                      <button onClick={handleRemovePromo} className="px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700">Remove</button>
                    ) : (
                      <button onClick={handleApplyPromo} className="px-4 py-3 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">Apply</button>
                    )}
                  </div>
                  {appliedPromo && <div className="mt-2 text-sm text-green-600 font-medium">Promo code {appliedPromo} applied!</div>}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-dark-gray">Subtotal:</span><span className="font-medium">৳{subtotal.toLocaleString('en-BD')}</span></div>
                  {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Discount ({appliedPromo}):</span><span className="font-medium text-green-600">-৳{discountAmount.toLocaleString('en-BD')}</span></div>}
                  {savings > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">You Save:</span><span className="font-medium text-green-600">৳{savings.toLocaleString('en-BD')} ({savingsPercentage}%)</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-dark-gray">Delivery:</span><span className="font-medium text-green-600">Free</span></div>
                  <div className="border-t border-medium-gray pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-secondary">Total:</span>
                      <span className="text-lg font-bold text-primary">৳{finalTotal.toLocaleString('en-BD')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const message = encodeURIComponent(`Hello! I would like to order:\n\n${items.map(item => `${item.name} x${item.quantity} = ৳${(item.price * item.quantity).toLocaleString('en-BD')}`).join('\n')}\n\nTotal: ৳${finalTotal.toLocaleString('en-BD')}`);
                      window.open(`https://wa.me/8801996570203?text=${message}`, '_blank');
                    }}
                    className="w-full btn btn-whatsapp flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Checkout via WhatsApp</span>
                  </button>
                  <button onClick={() => { window.location.href = '/checkout'; }} className="w-full btn btn-primary flex items-center justify-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Proceed to Checkout</span>
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-medium-gray">
                  <button onClick={clearCart} className="w-full text-center text-sm text-red-600 hover:text-red-700">Clear Cart</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
