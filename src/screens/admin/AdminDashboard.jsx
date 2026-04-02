import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import axios from "axios";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Revenue",
      value: `৳${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-success",
      trend: "+12.5%",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "bg-primary",
      trend: "+8.2%",
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-secondary",
      trend: "+3.1%",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-warning",
      trend: "+15.4%",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-secondary">
            Dashboard Overview
          </h1>
          <p className="text-secondary/60 text-lg">
            Welcome back, Admin! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/offers"
            className="px-6 py-3 bg-white border border-secondary/10 rounded-xl font-bold text-sm hover:bg-secondary/5 transition-all"
          >
            Manage Offers
          </Link>
          <button className="px-6 py-3 bg-white border border-secondary/10 rounded-xl font-bold text-sm hover:bg-secondary/5 transition-all">
            Download Report
          </button>
          <Link
            to="/admin/products/new"
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            Add New Product
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 group hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div
                className={`w-14 h-14 ${kpi.color}/10 rounded-2xl flex items-center justify-center text-${kpi.color.split("-")[1]} group-hover:scale-110 transition-transform`}
              >
                <kpi.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-success text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" /> {kpi.trend}
              </span>
            </div>
            <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">
              {kpi.label}
            </p>
            <h3 className="text-3xl font-black text-secondary mt-1">
              {kpi.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-premium shadow-sm border border-secondary/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Sales Analytics</h2>
            <select className="bg-secondary/5 border-none rounded-lg px-4 py-2 text-xs font-bold outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Mon", sales: 4000 },
                  { name: "Tue", sales: 3000 },
                  { name: "Wed", sales: 2000 },
                  { name: "Thu", sales: 2780 },
                  { name: "Fri", sales: 1890 },
                  { name: "Sat", sales: 2390 },
                  { name: "Sun", sales: 3490 },
                ]}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#999" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#999" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ fill: "#f8f8f8" }}
                />
                <Bar dataKey="sales" fill="#ff4d4d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-primary text-xs font-bold hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-6">
            {stats.recentOrders.map((order) => (
              <Link
                key={order._id}
                to={`/admin/orders/${order._id}`}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary/5 rounded-xl flex items-center justify-center text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-secondary">
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest">
                      ৳{order.finalTotal}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                      order.status === "delivered"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {order.status}
                  </span>
                  <p className="text-[8px] text-secondary/40 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
