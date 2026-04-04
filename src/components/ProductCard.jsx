import React from 'react';
import { motion } from 'motion/react';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export const ProductCard = ({ product, className }) => {
  const addItem = useCartStore(state => state.addItem);
  const productId = product._id || product.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "bg-white rounded-premium shadow-xl overflow-hidden border border-secondary/5 group hover:shadow-2xl transition-all flex flex-col",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <Link to={`/product/${productId}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        {/* Labels */}
        {product.isNew && (
          <div className="absolute top-4 left-4 bg-success text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
            NEW
          </div>
        )}
        {product.isBestSeller && (
          <div className="absolute top-4 left-4 bg-tertiary text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
            BEST SELLER
          </div>
        )}
        {/* Add to Cart Button */}
        <button
          onClick={() => addItem(product)}
          className="absolute bottom-4 right-4 w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white"
        >
          <ShoppingBag className="w-5 h-5" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-6 flex flex-col flex-grow space-y-4">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 fill-tertiary text-tertiary" />
          <span className="text-xs font-medium text-secondary/60">{product.rating}</span>
        </div>

        {/* Name */}
        <Link to={`/product/${productId}`} className="group-hover:text-primary transition-colors">
          <h3 className="text-xl font-bold text-secondary">{product.name}</h3>
          {product.nameBn && (
            <p className="text-sm text-secondary/70 mt-1">{product.nameBn}</p>
          )}
        </Link>

        {/* Price */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-extrabold text-primary">৳{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-secondary/40 line-through">৳{product.originalPrice}</span>
          )}
        </div>

        {/* Shop Now Link */}
        <Link
          to={`/product/${productId}`}
          className="w-full bg-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all group mt-4"
        >
          Shop Now
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};