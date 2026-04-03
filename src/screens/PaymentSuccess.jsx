import React, { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Package, ShoppingBag } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get("order_id");
  const tranId = searchParams.get("tran_id");

  useEffect(() => {
    const fetchOrderInfo = async () => {
      if (orderId) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setOrderInfo(response.data);
        } catch (error) {
          console.error("Error fetching order info:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchOrderInfo();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-extrabold text-secondary">
            Your Order Success!
          </h1>
          <p className="text-secondary/60">
            Your order has been placed successfully. Thank you for shopping with
            us!
          </p>
        </div>

        <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/5 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-secondary/40 font-bold uppercase tracking-widest">
              Order ID
            </span>
            <span className="font-bold text-secondary">
              #{orderId ? orderId.slice(-6).toUpperCase() : "SOM-982341"}
            </span>
          </div>
          {orderInfo && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-secondary/40 font-bold uppercase tracking-widest">
                  Amount Paid
                </span>
                <span className="font-bold text-primary">
                  ৳{orderInfo.finalTotal}
                </span>
              </div>
              {tranId && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary/40 font-bold uppercase tracking-widest">
                    Transaction ID
                  </span>
                  <span className="font-bold text-secondary text-xs">
                    {tranId}
                  </span>
                </div>
              )}
            </>
          )}
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
