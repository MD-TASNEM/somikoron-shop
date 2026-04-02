'use client';

import React, { memo, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductImage } from '@/components/ui/optimized-image';

// Memoized Product Card
;
  onAddToCart?: (productId) => void;
  onQuickView?: (product) => void;
  className?: string;
}

export const ProductCard = memo(({
  product,
  onAddToCart,
  onQuickView,
  className = ''
}) => {
  const discount = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= product.price) {
      return 0;
    }
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product.originalPrice, product.price]);

  const handleAddToCart = useCallback(() => {
    onAddToCart?.(product._id);
  }, [onAddToCart, product._id]);

  const handleQuickView = useCallback(() => {
    onQuickView?.(product);
  }, [onQuickView, product]);

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div className="relative">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-48"
        />
        
        {product.badge && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
            {product.badge}
          </span>
        )}
        
        {discount > 0 && (
          <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
            -{discount}%
          </span>
        )}

        <button
          onClick={handleQuickView}
          className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 6C3.732 5.43 5.191 5 7 5c1.809 0 3.268.43 4.542 1" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-medium text-gray-900 line-clamp-2">
            {product.nameBn || product.name}
          </h3>
          <p className="text-sm text-gray-500">{product.category}</p>
        </div>

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462a1 1 0 00.95-.69l1.07-3.292a1 1 0 00-1.902 0l-1.07 3.292a1 1 0 101.902 0l-1.07-3.292a1 1 0 00-.95.69z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          
            <span className="text-lg font-bold text-gray-900">৳{product.price.toLocaleString('en-BD')}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ৳{product.originalPrice.toLocaleString('en-BD')}
              </span>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            product.stock === 0 
              ? 'bg-red-100 text-red-600'
              : product.stock < 10 
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-green-100 text-green-600'
          }`}>
            {product.stock === 0 ? 'Out of Stock' : product.stock}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

// Memoized Category Card
;
  className?: string;
}

export const CategoryCard = memo(({
  category,
  className = ''
}) => {
  return (
    <Link href={`/category/${category.slug}`} className={`block ${className}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-32">
          <ProductImage
            src={category.image}
            alt={category.name}
            className="h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-2 text-white">
            <h3 className="font-semibold text-lg">
              {category.nameBn || category.name}
            </h3>
            <p className="text-sm opacity-90">{category.productCount} products</p>
          </div>
        </div>
      </div>
    </Link>
  );
});

CategoryCard.displayName = 'CategoryCard';

// Memoized Order Summary
>;
    subtotal: number;
    tax: number;
    shippingCost: number;
    discount: number;
    total: number;
    status: string;
    createdAt: string;
  };
  className?: string;
}

export const OrderSummary = memo(({
  order,
  className = ''
}) => {
  const formattedDate = useMemo(() => {
    return new Date(order.createdAt).toLocaleDateString('en-BD');
  }, [order.createdAt]);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        
          <h2 className="text-lg font-semibold text-gray-900">Order #{order.orderId}</h2>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          order.status === 'delivered' ? 'bg-green-100 text-green-600' :
          order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
          order.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
          order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          {order.status}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {order.items.slice(0, 3).map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <ProductImage
                src={item.image}
                alt={item.name}
                className="h-full w-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
              <p className="text-sm text-gray-500">৳{item.price.toLocaleString('en-BD')} × {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                ৳{(item.price * item.quantity).toLocaleString('en-BD')}
              </p>
            </div>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-sm text-gray-500 text-center">
            +{order.items.length - 3} more items
          </p>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal:</span>
            <span className="font-medium">৳{order.subtotal.toLocaleString('en-BD')}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Discount:</span>
              <span className="font-medium text-green-600">
                -৳{order.discount.toLocaleString('en-BD')}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax:</span>
            <span className="font-medium">৳{order.tax.toLocaleString('en-BD')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping:</span>
            <span className="font-medium">
              {order.shippingCost === 0 ? 'FREE' : `৳${order.shippingCost.toLocaleString('en-BD')}`}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            Total:</span>
            <span className="text-primary">৳{order.total.toLocaleString('en-BD')}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

OrderSummary.displayName = 'OrderSummary';

// Memoized User Avatar
;
  size?: 'sm' | 'md' | 'lg';
  showEmail?: boolean;
  className?: string;
}

export const UserAvatar = memo(({
  user,
  size = 'md',
  showEmail = false,
  className = ''
}) => {
  const sizeClasses = useMemo(() => ({
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }), [size]);

  const textSizeClasses = useMemo(() => ({
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }), [size]);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200`}>
        {user.avatar ? (
          <ProductImage
            src={user.avatar}
            alt={user.name}
            className="h-full w-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`${textSizeClasses[size]} font-medium text-gray-600`}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
        <p className={`${textSizeClasses[size]} font-medium text-gray-900`}>
          {user.name}
        </p>
        {showEmail && (
          <p className="text-xs text-gray-500">{user.email}</p>
        )}
      </div>
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

// Memoized Price Display


export const PriceDisplay = memo(({
  price,
  originalPrice,
  currency = '৳',
  showDiscount = true,
  className = ''
}) => {
  const discount = useMemo(() => {
    if (!originalPrice || originalPrice <= price) {
      return 0;
    }
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }, [originalPrice, price]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="font-bold text-gray-900">
        {currency}{price.toLocaleString('en-BD')}
      </span>
      {originalPrice && originalPrice > price && (
        <>
          <span className="text-sm text-gray-500 line-through">
            {currency}{originalPrice.toLocaleString('en-BD')}
          </span>
          {showDiscount && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
              -{discount}%
            </span>
          )}
        </>
      )}
    </div>
  );
});

PriceDisplay.displayName = 'PriceDisplay';

// Memoized Stock Badge


export const StockBadge = memo(({
  stock,
  className = ''
}) => {
  const status = useMemo(() => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return `Only ${stock} left`;
    return 'In Stock';
  }, [stock]);

  const colorClasses = useMemo(() => ({
    'Out of Stock': 'bg-red-100 text-red-600',
    'Only 1 left': 'bg-orange-100 text-orange-600',
    'Only 2 left': 'bg-orange-100 text-orange-600',
    'Only 3 left': 'bg-orange-100 text-orange-600',
    'Only 4 left': 'bg-orange-100 text-orange-600',
    'Only 5 left': 'bg-orange-100 text-orange-600',
    'Only 6 left': 'bg-orange-100 text-orange-600',
    'Only 7 left': 'bg-orange-100 text-orange-600',
    'Only 8 left': 'bg-orange-100 text-orange-600',
    'Only 9 left': 'bg-orange-100 text-orange-600',
    'In Stock': 'bg-green-100 text-green-600'
  }), [stock])[status] || 'bg-gray-100 text-gray-600';

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorClasses} ${className}`}>
      {status}
    </span>
  );
});

StockBadge.displayName = 'StockBadge';

// Memoized Rating Display


export const RatingDisplay = memo(({
  rating,
  reviews,
  showCount = true,
  size = 'md',
  className = ''
}) => {
  const starSize = useMemo(() => ({
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }), [size]);

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`${starSize[size]} ${
              i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462a1 1 0 00.95-.69l1.07-3.292a1 1 0 00-1.902 0l-1.07 3.292a1 1 0 101.902 0l-1.07-3.292a1 1 0 00-.95.69z" />
          </svg>
        ))}
      </div>
      {showCount && (
        <span className="text-sm text-gray-500">({reviews})</span>
      )}
    </div>
  );
});

RatingDisplay.displayName = 'RatingDisplay';
