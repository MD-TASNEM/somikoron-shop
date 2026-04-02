import React from 'react';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

export const Cart = () => {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-secondary/20" />
        <h2 className="text-2xl font-bold">Your bag is empty</h2>
        <Link to="/products" className="text-primary font-bold hover:underline">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-12">
        <Link to="/products" className="p-2 hover:bg-secondary/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-4xl font-extrabold">Your Shopping Bag</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.cartItemId} className="bg-white p-6 rounded-premium shadow-sm border border-secondary/5 flex gap-6 group">
              <div className="w-24 h-32 bg-secondary/5 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-secondary">{item.name}</h3>
                      <p className="bengali text-xs text-secondary/40 font-bold uppercase tracking-widest mt-1">{item.nameBn}</p>
                      {item.selectedVariant && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(item.selectedVariant.attributes || {}).map(([key, value]) => (
                            <span key={key} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded-full border border-primary/10 uppercase tracking-wider">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => removeItem(item.cartItemId)}
                      className="p-2 text-secondary/20 hover:text-error transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-primary font-extrabold text-lg">৳{item.price}</p>
                    <span className="text-secondary/20 text-sm">|</span>
                    <p className="text-secondary/40 text-sm font-bold">Total: ৳{item.price * item.quantity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-4 bg-secondary/5 rounded-full px-3 py-1">
                    <button 
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="p-1 hover:text-primary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      disabled={item.quantity >= (item.selectedVariant ? item.selectedVariant.stock : item.stock)}
                      className="p-1 hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">
                    {item.selectedVariant 
                      ? `${item.selectedVariant.stock} available`
                      : `${item.stock} available`
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-premium shadow-xl border border-secondary/5 space-y-6 sticky top-24">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-secondary/60">
                <span>Total Items</span>
                <span className="font-bold">{getTotalItems()}</span>
              </div>
              <div className="flex justify-between text-secondary/60">
                <span>Subtotal</span>
                <span className="font-bold">৳{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between text-secondary/60">
                <span>Shipping</span>
                <span className="text-xs italic">Calculated at checkout</span>
              </div>
              <div className="pt-6 border-t border-secondary/5 flex justify-between text-2xl font-extrabold">
                <span>Total</span>
                <span className="text-primary">৳{getTotalPrice()}</span>
              </div>
            </div>
            <Link 
              to="/checkout"
              className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 group"
            >
              Checkout Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};
