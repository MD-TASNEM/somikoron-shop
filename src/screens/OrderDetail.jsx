import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  ShoppingBag,
} from "lucide-react";

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);
      } catch (error) {
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) return null;

  const steps = [
    { status: "pending", icon: Clock, label: "Order Placed" },
    { status: "processing", icon: Package, label: "Processing" },
    { status: "shipped", icon: Truck, label: "Shipped" },
    { status: "delivered", icon: CheckCircle, label: "Delivered" },
  ];

  const currentStep = steps.findIndex((s) => s.status === order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <Link
          to="/orders"
          className="p-2 hover:bg-secondary/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold">Order Details</h1>
          <p className="text-secondary/60 text-sm font-bold uppercase tracking-widest">
            #{order._id?.toUpperCase() || "N/A"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tracking & Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tracking */}
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5">
            <h2 className="text-xl font-bold mb-8">Tracking Status</h2>
            <div className="relative flex justify-between">
              <div className="absolute top-5 left-0 w-full h-1 bg-secondary/5 -z-10" />
              <div
                className="absolute top-5 left-0 h-1 bg-primary transition-all duration-1000 -z-10"
                style={{
                  width: `${(currentStep / (steps.length - 1)) * 100}%`,
                }}
              />
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;
                return (
                  <div
                    key={step.status}
                    className="flex flex-col items-center gap-3"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                          : "bg-white border-2 border-secondary/5 text-secondary/20"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest text-center ${
                        isActive ? "text-primary" : "text-secondary/20"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Items */}
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> Order Items
            </h2>
            <div className="space-y-6">
              {(order.items || []).map((item) => (
                <div
                  key={item.cartItemId || item.id}
                  className="flex gap-6 group"
                >
                  <div className="w-20 h-24 bg-secondary/5 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <h3 className="font-bold text-secondary">{item.name}</h3>
                    {item.selectedVariant && (
                      <p className="text-[10px] font-bold text-primary uppercase mt-1">
                        {Object.entries(item.selectedVariant.attributes || {})
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-secondary/40 font-bold uppercase tracking-widest">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-xs text-secondary/40 font-bold uppercase tracking-widest">
                        Price: ৳{item.price}
                      </p>
                    </div>
                    <p className="text-primary font-bold mt-1">
                      Total: ৳{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Summary & Info */}
        <div className="space-y-8">
          {/* Order Summary */}
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-secondary/60">
                <span>Subtotal</span>
                <span className="font-bold">৳{order.totalPrice || 0}</span>
              </div>
              <div className="flex justify-between text-secondary/60">
                <span>Shipping Fee</span>
                <span className="font-bold">৳{order.shippingFee || 0}</span>
              </div>
              <div className="pt-4 border-t border-secondary/5 flex justify-between text-xl font-extrabold">
                <span>Total</span>
                <span className="text-primary">৳{order.finalTotal || 0}</span>
              </div>
            </div>
          </section>

          {/* Shipping Info */}
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Shipping Info
            </h2>
            <div className="space-y-2">
              <p className="font-bold text-secondary">
                {order.formData?.name || "N/A"}
              </p>
              <p className="text-sm text-secondary/60 leading-relaxed">
                {order.formData?.address || "N/A"}
              </p>
              <p className="text-sm text-secondary/60 font-bold">
                {order.formData?.area || "N/A"}
              </p>
              <p className="text-sm font-bold text-primary mt-4">
                {order.formData?.phone || "N/A"}
              </p>
            </div>
          </section>

          {/* Payment Info */}
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Payment
            </h2>
            <div className="p-4 bg-secondary/5 rounded-xl">
              <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">
                Method
              </p>
              <p className="font-bold text-secondary uppercase mt-1">
                {order.formData?.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
