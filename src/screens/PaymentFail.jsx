import React from "react";
import { X, ArrowLeft, RefreshCw, ShoppingBag } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";

export const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const message = searchParams.get("message") || "Payment failed";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-premium shadow-2xl text-center space-y-8 border border-danger/10"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-danger/10 rounded-full text-danger mb-4">
          <X className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-secondary">
            Payment Failed!
          </h1>
          <p className="text-secondary/60">
            {message}. Please try again or contact support.
          </p>
        </div>

        {orderId && (
          <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-secondary/40 font-bold uppercase tracking-widest">
                Order ID
              </span>
              <span className="font-bold text-secondary">
                #{orderId.slice(-6).toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-secondary/60">
              Your order has been saved but payment was not completed. You can
              try paying again from your orders page.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {orderId ? (
            <Link
              to={`/checkout?order_id=${orderId}`}
              className="w-full bg-danger text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-danger/90 transition-all shadow-lg group"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
              <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link
              to="/cart"
              className="w-full bg-danger text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-danger/90 transition-all shadow-lg group"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
              <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          <Link
            to="/orders"
            className="w-full bg-white text-secondary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/5 transition-all border border-secondary/10"
          >
            <ShoppingBag className="w-5 h-5" />
            View Orders
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
