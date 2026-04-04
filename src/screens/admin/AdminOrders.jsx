import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import axios from "axios";
import {
  ShoppingBag,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router-dom";

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.patch(
        `/api/admin/orders/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setOrders(orders.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch {
      // Handle error silently
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.formData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.formData?.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-secondary">
          Order Management
        </h1>
        <p className="text-secondary/60 text-lg">
          Track, manage and update customer orders.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-premium shadow-sm border border-secondary/5 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-3 bg-secondary/5 text-secondary rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-premium shadow-sm border border-secondary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/5 text-secondary/40 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-6">Order ID</th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6">Date</th>
                <th className="px-8 py-6">Total</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/5">
              {filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-secondary/5 transition-all group"
                >
                  <td className="px-8 py-6">
                    <p className="font-bold text-secondary text-sm">
                      #{order._id?.slice(-8).toUpperCase() || "N/A"}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="font-bold text-secondary text-sm">
                        {order.formData?.name || "N/A"}
                      </p>
                      <p className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest mt-1">
                        {order.formData?.phone || "N/A"}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-secondary/60">
                      {new Date(
                        order.createdAt || Date.now(),
                      ).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-primary">
                      ৳{order.finalTotal || 0}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order._id, e.target.value)
                      }
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-none outline-none focus:ring-2 focus:ring-primary/20 ${
                        order.status === "delivered"
                          ? "bg-success/10 text-success"
                          : order.status === "pending"
                            ? "bg-warning/10 text-warning"
                            : order.status === "cancelled"
                              ? "bg-error/10 text-error"
                              : "bg-primary/10 text-primary"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="inline-flex items-center gap-2 p-2 text-secondary/20 hover:text-primary transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-20 text-center space-y-4 opacity-40">
            <Package className="w-16 h-16 mx-auto" />
            <p className="text-lg font-bold">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};
