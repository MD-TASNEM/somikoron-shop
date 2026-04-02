import React from 'react';
import { XCircle, ArrowRight, RefreshCw, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const PaymentFail = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-premium shadow-2xl text-center space-y-8 border border-error/10"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-error/10 rounded-full text-error mb-4 relative">
          <XCircle className="w-12 h-12" />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-error/20 rounded-full"
          />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-secondary">Payment Failed!</h1>
          <p className="text-secondary/60">Something went wrong during the transaction. Please try again or contact support.</p>
        </div>

        <div className="p-6 bg-error/5 rounded-2xl border border-error/10 flex items-start gap-4 text-left">
          <AlertTriangle className="w-6 h-6 text-error flex-shrink-0 mt-1" />
          <div className="space-y-1">
            <p className="font-bold text-error text-sm uppercase tracking-widest">Error Details</p>
            <p className="text-xs text-error/60 leading-relaxed">Transaction declined by bank. Please check your card balance or try a different payment method.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Link 
            to="/checkout"
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg group"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Retry Payment
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/contact"
            className="w-full bg-white text-secondary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/5 transition-all border border-secondary/10"
          >
            Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
