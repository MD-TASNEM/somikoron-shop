import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';

export const CartSidebar = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore();

  const handleWhatsAppCheckout = () => {
    const message = `Hi Somikoron Shop! I'd like to order:
${items.map(item => {
  const variantInfo = item.selectedVariant 
    ? ` (${Object.entries(item.selectedVariant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ')})`
    : '';
  return `- ${item.name}${variantInfo} x${item.quantity} (৳${item.price * item.quantity})`;
}).join('\n')}

Total: ৳${getTotalPrice()}
Please confirm my order.`;
    
    window.open(`https://wa.me/8801996570203?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-secondary/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-surface z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-secondary/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Your Bag ({getTotalItems()})</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-secondary/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <ShoppingBag className="w-16 h-16" />
                  <p className="text-lg">Your bag is empty</p>
                  <button 
                    onClick={onClose}
                    className="text-primary font-bold hover:underline"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 group">
                    <div className="w-20 h-24 bg-surface-container-low rounded-subtle overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                      <p className="bengali text-xs text-secondary/60">{item.nameBn}</p>
                      {item.selectedVariant && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {Object.entries(item.selectedVariant.attributes || {}).map(([key, value]) => (
                            <span key={key} className="px-1.5 py-0.5 bg-primary/5 text-primary text-[9px] font-bold rounded-full border border-primary/10 uppercase tracking-wider">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <p className="text-primary font-bold text-sm">৳{item.price}</p>
                        <span className="text-secondary/20 text-xs">|</span>
                        <p className="text-secondary/40 text-[10px] font-bold">Total: ৳{item.price * item.quantity}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-2 py-1">
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            disabled={item.quantity >= (item.selectedVariant ? item.selectedVariant.stock : item.stock)}
                            className="p-1 hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[10px] font-bold text-secondary/40">
                          {item.selectedVariant ? item.selectedVariant.stock : item.stock} in stock
                        </p>
                        <button 
                          onClick={() => removeItem(item.cartItemId)}
                          className="p-2 text-secondary/20 hover:text-primary transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 bg-surface-container-lowest border-t border-secondary/5 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">৳{getTotalPrice()}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={handleWhatsAppCheckout}
                    className="w-full bg-success text-white py-4 rounded-subtle font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    Order via WhatsApp
                  </button>
                  <Link 
                    to="/checkout"
                    onClick={onClose}
                    className="w-full bg-secondary text-white py-4 rounded-subtle font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
