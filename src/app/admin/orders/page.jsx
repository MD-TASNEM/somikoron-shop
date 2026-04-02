'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';

const statusOptions = [
  { value: '', label: 'All Orders', color: 'text-gray-600 bg-gray-50' },
  { value: 'pending', label: 'Pending', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'processing', label: 'Processing', color: 'text-blue-600 bg-blue-50' },
  { value: 'shipped', label: 'Shipped', color: 'text-purple-600 bg-purple-50' },
  { value: 'delivered', label: 'Delivered', color: 'text-green-600 bg-green-50' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-600 bg-red-50' }
];

const paymentStatusOptions = [
  { value: '', label: 'All Payments', color: 'text-gray-600 bg-gray-50' },
  { value: 'unpaid', label: 'Unpaid', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'paid', label: 'Paid', color: 'text-green-600 bg-green-50' },
  { value: 'refunded', label: 'Refunded', color: 'text-red-600 bg-red-50' }
];

const sortOptions = [
  { value: 'createdAt', label: 'Order Date' },
  { value: 'total', label: 'Order Total' },
  { value: 'status', label: 'Status' },
  { value: 'paymentStatus', label: 'Payment Status' }
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(searchParams.get('paymentStatus') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [currentPage, debouncedSearch, statusFilter, paymentStatusFilter, sortBy, sortOrder]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter) params.set('status', statusFilter);
    if (paymentStatusFilter) params.set('paymentStatus', paymentStatusFilter);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const newUrl = `/admin/orders${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl);
  }, [searchTerm, statusFilter, paymentStatusFilter, sortBy, sortOrder, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }

      if (statusFilter) {
        params.set('status', statusFilter);
      }

      if (paymentStatusFilter) {
        params.set('paymentStatus', paymentStatusFilter);
      }

      if (sortBy !== 'createdAt') {
        params.set('sortBy', sortBy);
      }

      if (sortOrder !== 'desc') {
        params.set('sortOrder', sortOrder);
      }

      console.log('🔍 Fetching admin orders with params:', params.toString());

      const response = await fetch(`/api/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch orders');
      }

      setOrders(result.data.orders);
      setTotalPages(result.data.pages);
      setTotalOrders(result.data.total);
      setHasNext(result.data.hasNext);
      setHasPrev(result.data.hasPrev);

      console.log('✅ Admin orders fetched successfully:', {
        total: result.data.total
      });

    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change field and default to desc
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Calendar className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Package className="h-4 w-4" />;
      case 'delivered':
        return <Package className="h-4 w-4" />;
      case 'cancelled':
        return <Package className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CreditCard className="h-4 w-4" />;
      case 'unpaid':
        return <CreditCard className="h-4 w-4" />;
      case 'refunded':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent border-r-transparent border-b-transparent mx-auto mb-4"></div>
          <p className="text-lg text-dark-gray">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Orders</h1>
          <p className="text-dark-gray">
            {totalOrders > 0
              ? `Manage ${totalOrders} orders`
              : 'No orders found'
            }
          </p>
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order ID, customer name, or email..."
                className="w-full pl-10 pr-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary"
            >
              {statusOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="lg:w-48">
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary"
            >
              {paymentStatusOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary mb-2">Error Loading Orders</h3>
            <p className="text-dark-gray mb-6">{error}</p>
            <button
              onClick={fetchOrders}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-secondary mb-2">No Orders Found</h3>
            <p className="text-dark-gray mb-6">
              {searchTerm || statusFilter || paymentStatusFilter
                ? 'No orders match your current filters.'
                : 'No orders have been placed yet.'
              }
            </p>
            <div className="space-y-3">
              {(searchTerm || statusFilter || paymentStatusFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setPaymentStatusFilter('');
                  }}
                  className="btn btn-outline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="border-b border-medium-gray p-4">
              <div className="text-sm text-dark-gray">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalOrders)} of {totalOrders} orders
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-medium-gray bg-light-bg">
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">
                      <button
                        onClick={() => handleSort('orderId')}
                        className="flex items-center space-x-1 hover:text-primary transition-colors duration-200"
                      >
                        <span>Order ID</span>
                        {sortBy === 'orderId' && (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">Items</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">
                      <button
                        onClick={() => handleSort('total')}
                        className="flex items-center space-x-1 hover:text-primary transition-colors duration-200"
                      >
                        <span>Total</span>
                        {sortBy === 'total' && (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center space-x-1 hover:text-primary transition-colors duration-200"
                      >
                        <span>Status</span>
                        {sortBy === 'status' && (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">
                      <button
                        onClick={() => handleSort('paymentStatus')}
                        className="flex items-center space-x-1 hover:text-primary transition-colors duration-200"
                      >
                        <span>Payment</span>
                        {sortBy === 'paymentStatus' && (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">Date</th>
                    <th className="text-center py-3 px-4 font-medium text-dark-gray">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-medium-gray hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => router.push(`/admin/orders/${order._id}`)}
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-secondary">#{order.orderId}</div>
                          {order.transactionId && (
                            <div className="text-xs text-dark-gray">TXN: {order.transactionId}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-secondary">{order.shippingAddress.name}</div>
                          <div className="text-sm text-dark-gray">{order.shippingAddress.email}</div>
                          <div className="text-sm text-dark-gray">{order.shippingAddress.phone}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-dark-gray">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-secondary">
                          ৳{order.total.toLocaleString('en-BD')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusOptions.find(opt => opt.value === order.status)?.color || 'text-gray-600 bg-gray-50'
                          }`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${paymentStatusOptions.find(opt => opt.value === order.paymentStatus)?.color || 'text-gray-600 bg-gray-50'
                          }`}>
                          {getPaymentStatusIcon(order.paymentStatus)}
                          <span className="capitalize">{order.paymentStatus}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-dark-gray">
                          {new Date(order.createdAt).toLocaleDateString('en-BD')}
                        </div>
                        <div className="text-xs text-dark-gray">
                          {new Date(order.createdAt).toLocaleTimeString('en-BD')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/orders/${order._id}`);
                            }}
                            className="p-2 text-primary hover:text-primary-dark hover:bg-primary/10 rounded-lg transition-colors duration-200"
                            title="View Order"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-medium-gray p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <div className="text-sm text-dark-gray">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalOrders)} of {totalOrders} orders
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPrev}
                      className={`p-2 rounded-lg transition-colors duration-200 ${hasPrev
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-gray-300 cursor-not-allowed'
                        }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-200 ${currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'text-dark-gray hover:bg-gray-100'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNext}
                      className={`p-2 rounded-lg transition-colors duration-200 ${hasNext
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-gray-300 cursor-not-allowed'
                        }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
