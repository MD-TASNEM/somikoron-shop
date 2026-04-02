import React from 'react';
import { motion } from 'motion/react';
import { Star, ShoppingBag } from 'lucide-react';
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
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "group relative flex flex-col bg-surface-container-lowest rounded-subtle overflow-hidden",
        "hover:shadow-[0_12px_30px_rgba(44,62,80,0.08)] transition-all duration-500",
        className
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Link to={`/product/${productId}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        {product.isNew && (
          <div className="absolute top-4 left-4 bg-success text-white px-3 py-1 text-[10px] font-bold rounded-sm z-10 uppercase tracking-wider">
            NEW
          </div>
        )}
        {product.isBestSeller && (
          <div className="absolute top-4 left-4 bg-tertiary text-white px-3 py-1 text-[10px] font-bold rounded-sm z-10 uppercase tracking-wider">
            BEST SELLER
          </div>
        )}
        <button 
          onClick={() => addItem(product)}
          className="absolute bottom-4 right-4 w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white"
        >
          <ShoppingBag className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 fill-tertiary text-tertiary" />
          <span className="text-xs font-medium text-secondary/60">{product.rating}</span>
        </div>
        
        <Link to={`/product/${productId}`} className="group-hover:text-primary transition-colors">
          <h3 className="text-lg font-bold leading-tight mb-1">{product.name}</h3>
          <p className="bengali text-sm text-secondary/70 mb-3">{product.nameBn}</p>
        </Link>
        
        <div className="mt-auto flex items-center gap-3">
          <span className="text-lg font-extrabold text-primary">৳{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-secondary/40 line-through">৳{product.originalPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
