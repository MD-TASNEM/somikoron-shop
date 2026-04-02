import React from 'react';
import { AlertCircle, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const PaymentCancel = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-premium shadow-2xl text-center space-y-8 border border-warning/10"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-warning/10 rounded-full text-warning mb-4 relative">
          <AlertCircle className="w-12 h-12" />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-warning/20 rounded-full"
          />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-secondary">Payment Cancelled</h1>
          <p className="text-secondary/60">The transaction was cancelled. Your order has not been placed.</p>
        </div>

        <div className="p-6 bg-warning/5 rounded-2xl border border-warning/10 text-left space-y-4">
          <p className="font-bold text-warning text-sm uppercase tracking-widest">What happened?</p>
          <p className="text-xs text-warning/60 leading-relaxed">You cancelled the payment process. If this was a mistake, you can return to the checkout page to complete your purchase.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Link 
            to="/checkout"
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Checkout
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
