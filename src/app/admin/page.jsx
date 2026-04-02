'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Plus,
  Eye,
  Settings,
  Users,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching dashboard data...');

      const response = await fetch('/api/admin/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }

      setDashboardData(result.data);
      console.log('✅ Dashboard data fetched successfully');

    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'shipped':
        return 'text-purple-600 bg-purple-50';
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'unpaid':
        return 'text-yellow-600 bg-yellow-50';
      case 'refunded':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent border-r-transparent border-b-transparent mx-auto mb-4"></div>
          <p className="text-lg text-dark-gray">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-secondary mb-2">Dashboard Error</h3>
          <p className="text-dark-gray mb-6">{error || 'Failed to load dashboard data'}</p>
          <button
            onClick={fetchDashboardData}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // KPI Cards
  const kpiCards = [
    {
      title: 'Total Products',
      value: dashboardData.kpis.totalProducts.toLocaleString(),
      icon: <Package className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/products'
    },
    {
      title: 'Total Orders',
      value: dashboardData.kpis.totalOrders.toLocaleString(),
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/orders'
    },
    {
      title: 'Total Revenue',
      value: `৳${dashboardData.kpis.totalRevenue.toLocaleString('en-BD')}`,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending Orders',
      value: dashboardData.kpis.pendingOrders.toLocaleString(),
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/admin/orders?status=pending'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Dashboard</h1>
          <p className="text-dark-gray">Welcome back! Here's what's happening with your store today.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Link
            key={index}
            href={kpi.link || '#'}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                <div className={kpi.color}>
                  {kpi.icon}
                </div>
              </div>
              {kpi.change && (
                <div className={`flex items-center space-x-1 text-sm ${
                  kpi.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.changeType === 'increase' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  <span>{kpi.change}%</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-dark-gray mb-1">{kpi.title}</p>
              <p className="text-2xl font-bold text-secondary">{kpi.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 bg-light-bg rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary">#{order.orderId}</p>
                      <p className="text-sm text-dark-gray">{order.shippingAddress.name}</p>
                      <p className="text-xs text-dark-gray">{order.shippingAddress.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-secondary">
                      ৳{order.total.toLocaleString('en-BD')}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary">Low Stock Alerts</h2>
              <Link
                href="/admin/products?stock=low"
                className="text-primary hover:text-primary-dark text-sm font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {dashboardData.lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center space-x-3 p-3 bg-light-bg rounded-lg">
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={product.image || '/images/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary truncate">
                      {product.nameBn || product.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-dark-gray">
                        ৳{product.price.toLocaleString('en-BD')}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        product.stock === 0
                          ? 'bg-red-100 text-red-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-secondary mb-6">Orders Overview (Last 7 Days)</h2>

          <div className="space-y-4">
            {dashboardData.chartData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-dark-gray">{data.date}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-secondary">{data.orders} orders</p>
                    <p className="text-xs text-dark-gray">
                      ৳{data.revenue.toLocaleString('en-BD')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-secondary mb-6">Quick Actions</h2>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/products/new"
              className="flex flex-col items-center justify-center p-4 bg-light-bg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Plus className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm font-medium text-secondary">Add Product</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex flex-col items-center justify-center p-4 bg-light-bg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Eye className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm font-medium text-secondary">View Orders</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex flex-col items-center justify-center p-4 bg-light-bg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Users className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm font-medium text-secondary">Manage Users</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex flex-col items-center justify-center p-4 bg-light-bg rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Settings className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm font-medium text-secondary">Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-secondary mb-6">Performance Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {dashboardData.chartData.reduce((sum, data) => sum + data.orders, 0).toLocaleString()}
            </div>
            <p className="text-sm text-dark-gray">Total Orders (7 Days)</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              ৳{dashboardData.chartData.reduce((sum, data) => sum + data.revenue, 0).toLocaleString('en-BD')}
            </div>
            <p className="text-sm text-dark-gray">Total Revenue (7 Days)</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {dashboardData.chartData.length > 0
                ? Math.round(dashboardData.chartData.reduce((sum, data) => sum + data.revenue, 0) /
                   dashboardData.chartData.reduce((sum, data) => sum + data.orders, 0)).toLocaleString('en-BD')
                : '0'
              }
            </div>
            <p className="text-sm text-dark-gray">Average Order Value</p>
          </div>
        </div>
      </div>
    </div>
  );
}
