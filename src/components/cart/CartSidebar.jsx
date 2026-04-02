'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCartStore, cartActions } from '@/store/cart';
import { 
  X, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft,
  MessageCircle,
  CreditCard,
  Package
} from 'lucide-react';

export default function CartSidebar() {
  const { 
    items, 
    getTotalItems, 
    getTotalPrice, 
    clearCart, 
    updateQuantity, 
    removeItem 
  } = useCartStore();
  
  const { calculateSavings } = cartActions;
  const { savings, savingsPercentage } = calculateSavings();
  
  const [isOpen, setIsOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  // Update item quantity
  const handleQuantityChange = (productId) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  // Handle checkout via WhatsApp
  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    const cartItems = items.map(item => 
      `${item.name} x${item.quantity} = ৳${(item.price * item.quantity).toLocaleString('en-BD')}`
    ).join('\n');

    const message = encodeURIComponent(
      `Hello I would like to order the following items:\n\n${cartItems}\n\nTotal: ৳${getTotalPrice().toLocaleString('en-BD')}\n\nPlease confirm availability and delivery details.`
    );

    window.open(`https://wa.me/8801996570203?text=${message}`, '_blank');
  };

  // Handle proceed to checkout
  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/checkout';
  };

  return (
    <>
      {/* Cart Icon Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-secondary hover:text-primary transition-colors duration-200"
        aria-label="Shopping cart"
      >
        <ShoppingBag className="h-6 w-6" />
        {getTotalItems() > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {getTotalItems() > 99 ? '99+' : getTotalItems()}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-medium-gray">
          <h2 className="text-xl font-bold text-secondary flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart</span>
            {getTotalItems() > 0 && (
              <span className="text-sm font-normal text-dark-gray">
                ({getTotalItems()} items)
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-dark-gray" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-secondary mb-2">Your cart is empty</h3>
                <p className="text-dark-gray mb-6 max-w-xs">
                  Add some amazing products to your cart and come back here
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-primary"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              /* Cart Items List */
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="bg-light-bg rounded-lg p-3">
                    <div className="flex space-x-3">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={item.image || '/images/placeholder-product.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-secondary text-sm mb-1 line-clamp-2">
                              {item.nameBn || item.name}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-primary">
                                ৳{item.price.toLocaleString('en-BD')}
                              </span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-xs text-gray-400 line-through">
                                  ৳{item.originalPrice.toLocaleString('en-BD')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-dark-gray font-medium">Qty:</span>
                            <div className="flex items-center border border-medium-gray rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                                className="w-12 h-8 text-center border-0 focus:ring-0 text-sm"
                                min="1"
                                max="99"
                              />
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <div className="text-sm font-bold text-secondary">
                              ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                            </div>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <div className="text-xs text-green-600">
                                Save ৳{((item.originalPrice - item.price) * item.quantity).toLocaleString('en-BD')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {items.length > 0 && (
            <div className="border-t border-medium-gray bg-white p-4">
              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-gray">Subtotal:</span>
                  <span className="font-medium">৳{getTotalPrice().toLocaleString('en-BD')}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Savings:</span>
                    <span className="font-medium text-green-600">
                      -৳{savings.toLocaleString('en-BD')} ({savingsPercentage}%)
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-dark-gray">Delivery:</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>

                <div className="border-t border-medium-gray pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-secondary">Total:</span>
                    <span className="text-lg font-bold text-primary">
                      ৳{getTotalPrice().toLocaleString('en-BD')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full btn btn-outline flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping</span>
                </button>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full btn btn-whatsapp flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Checkout via WhatsApp</span>
                </button>

                <button
                  onClick={handleCheckout}
                  className="w-full btn btn-primary flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Proceed to Checkout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      {`
        /* Smooth transitions */
        .cart-sidebar {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Backdrop blur effect */
        .cart-overlay {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* Custom scrollbar for cart items */
        .cart-items::-webkit-scrollbar {
          width: 6px;
        }

        .cart-items::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .cart-items::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .cart-items::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }

        /* Quantity input styling */
        .quantity-input::-webkit-inner-spin-button,
        .quantity-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .quantity-input {
          -moz-appearance: textfield;
        }

        /* Animation for cart badge */
        @keyframes badge-bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .cart-badge {
          animation: badge-bounce 0.3s ease-in-out;
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .cart-sidebar {
            width: 100%;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion) {
          .cart-sidebar {
            transition: none;
          }
          
          .cart-overlay {
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
          }
        }
      `}</style>
    </>
  );
}
