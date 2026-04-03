import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
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
  User,
  Phone,
  Mail,
  AlertCircle,
  XCircle,
} from "lucide-react";

export const AdminOrderDetail = () => {
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
        console.error("Error fetching order:", error);
        navigate("/admin/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, token, navigate]);

  const handleStatusUpdate = async (status) => {
    try {
      await axios.patch(
        `/api/admin/orders/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setOrder({ ...order, status });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/orders"
            className="p-2 hover:bg-secondary/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-secondary">
              Order Details
            </h1>
            <p className="text-secondary/60 text-sm font-bold uppercase tracking-widest">
              #{order._id.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={order.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            className="px-6 py-3 bg-secondary/5 text-secondary rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
            Print Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> Order Items
            </h2>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-6 group">
                  <div className="w-20 h-24 bg-secondary/5 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <h3 className="font-bold text-secondary">{item.name}</h3>
                    <p className="text-xs text-secondary/40 font-bold uppercase tracking-widest mt-1">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-primary font-bold mt-2">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5">
            <h2 className="text-xl font-bold mb-8">Order Timeline</h2>
            <div className="space-y-8">
              {[
                {
                  status: "pending",
                  icon: Clock,
                  label: "Order Received",
                  time: order.createdAt,
                },
                {
                  status: "processing",
                  icon: Package,
                  label: "Order Processing",
                  time: order.createdAt,
                },
                {
                  status: "shipped",
                  icon: Truck,
                  label: "Order Shipped",
                  time: null,
                },
                {
                  status: "delivered",
                  icon: CheckCircle,
                  label: "Order Delivered",
                  time: null,
                },
              ].map((step, index) => {
                const Icon = step.icon;
                const isCompleted =
                  order.status === step.status ||
                  index <
                    ["pending", "processing", "shipped", "delivered"].indexOf(
                      order.status,
                    );
                return (
                  <div key={step.status} className="flex gap-6 relative">
                    {index < 3 && (
                      <div
                        className={`absolute top-10 left-5 w-0.5 h-10 -z-10 ${isCompleted ? "bg-primary" : "bg-secondary/5"}`}
                      />
                    )}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "bg-secondary/5 text-secondary/20"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p
                        className={`font-bold ${isCompleted ? "text-secondary" : "text-secondary/20"}`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-secondary/40">
                        {step.time
                          ? new Date(step.time).toLocaleString()
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Customer & Summary */}
        <div className="space-y-8">
          {/* Customer Info */}
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Customer Info
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary/5 rounded-full flex items-center justify-center text-secondary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">
                    Name
                  </p>
                  <p className="font-bold text-secondary">
                    {order.shippingInfo?.name || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary/5 rounded-full flex items-center justify-center text-secondary">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">
                    Phone
                  </p>
                  <p className="font-bold text-secondary">
                    {order.shippingInfo?.phone || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-secondary/5 rounded-full flex items-center justify-center text-secondary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">
                    Address
                  </p>
                  <p className="text-sm text-secondary/60 leading-relaxed">
                    {order.shippingInfo?.address || "N/A"}
                  </p>
                  <p className="text-sm font-bold text-secondary mt-1">
                    {order.shippingInfo?.area || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Payment & Summary */}
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-secondary/60">
                <span>Subtotal</span>
                <span className="font-bold">৳{order.totalPrice}</span>
              </div>
              <div className="flex justify-between text-secondary/60">
                <span>Shipping Fee</span>
                <span className="font-bold">৳{order.shippingFee}</span>
              </div>
              <div className="pt-4 border-t border-secondary/5 flex justify-between text-xl font-extrabold">
                <span>Total</span>
                <span className="text-primary">৳{order.finalTotal}</span>
              </div>
            </div>
            <div className="p-4 bg-secondary/5 rounded-xl">
              <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">
                Payment Method
              </p>
              <p className="font-bold text-secondary uppercase mt-1">
                {order.paymentMethod === "cod"
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
