import React from 'react';
import { CheckCircle, ArrowRight, Package, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const PaymentSuccess = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-premium shadow-2xl text-center space-y-8 border border-success/10"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-success/10 rounded-full text-success mb-4 relative">
          <CheckCircle className="w-12 h-12" />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-success/20 rounded-full"
          />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-secondary">Payment Success!</h1>
          <p className="text-secondary/60">Your order has been placed successfully. Thank you for shopping with us!</p>
        </div>

        <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/5 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-secondary/40 font-bold uppercase tracking-widest">Order ID</span>
            <span className="font-bold text-secondary">#SOM-982341</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary/40 font-bold uppercase tracking-widest">Amount Paid</span>
            <span className="font-bold text-primary">৳2,450</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Link 
            to="/orders"
            className="w-full bg-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all shadow-lg group"
          >
            <Package className="w-5 h-5" />
            Track Order
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/products"
            className="w-full bg-white text-secondary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/5 transition-all border border-secondary/10"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
