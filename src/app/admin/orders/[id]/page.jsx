'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Edit,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  RefreshCw,
  FileText,
  Printer
} from 'lucide-react';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [newNotes, setNewNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!orderId) {
        setError('Order ID not found');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching admin order details for:', orderId);

      const response = await fetch(`/api/orders/${orderId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        } else if (response.status === 401) {
          throw new Error('Please login to view order details');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to view this order');
        } else {
          throw new Error('Failed to fetch order details');
        }
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch order details');
      }

      setOrder(result.data);
      setNewNotes(result.data.notes || '');

      // Generate status history from timestamps
      const history = [
        {
          status: 'pending',
          timestamp: result.data.createdAt,
          updatedBy: 'System'
        }
      ];

      if (result.data.updatedAt !== result.data.createdAt) {
        history.push({
          status: 'processing',
          timestamp: result.data.updatedAt,
          updatedBy: 'System'
        });
      }

      if (result.data.shippedAt) {
        history.push({
          status: 'shipped',
          timestamp: result.data.shippedAt,
          updatedBy: 'System',
          notes: result.data.trackingNumber ? `Tracking: ${result.data.trackingNumber}` : undefined
        });
      }

      if (result.data.deliveredAt) {
        history.push({
          status: 'delivered',
          timestamp: result.data.deliveredAt,
          updatedBy: 'System'
        });
      }

      if (result.data.cancelledAt) {
        history.push({
          status: 'cancelled',
          timestamp: result.data.cancelledAt,
          updatedBy: 'System'
        });
      }

      setStatusHistory(history);

      console.log('✅ Admin order details fetched successfully:', result.data.orderId);

    } catch (err) {
      console.error('❌ Error fetching order details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!order) return;

    try {
      setUpdating(true);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to update order status');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update order status');
      }

      // Refresh order details
      await fetchOrderDetails();

      console.log('✅ Order status updated successfully');

    } catch (err) {
      console.error('❌ Error updating order status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusToggle = async () => {
    if (!order) return;

    const newPaymentStatus = order.paymentStatus === 'paid' ? 'unpaid' : 'paid';

    try {
      setUpdating(true);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_payment_status',
          paymentStatus: newPaymentStatus
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to update payment status');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update payment status');
      }

      // Refresh order details
      await fetchOrderDetails();

      console.log('✅ Payment status updated successfully');

    } catch (err) {
      console.error('❌ Error updating payment status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleNotesUpdate = async () => {
    if (!order) return;

    try {
      setUpdating(true);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'add_notes',
          notes: newNotes
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to update order notes');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update order notes');
      }

      // Refresh order details
      await fetchOrderDetails();
      setEditingNotes(false);

      console.log('✅ Order notes updated successfully');

    } catch (err) {
      console.error('❌ Error updating order notes:', err);
      alert(err instanceof Error ? err.message : 'Failed to update order notes');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    try {
      setDownloadingInvoice(true);

      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${order.orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('✅ Invoice downloaded successfully');

    } catch (err) {
      console.error('❌ Error downloading invoice:', err);
      alert('Failed to download invoice');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!order) return;

    window.print();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'processing':
        return <Truck className="h-5 w-5" />;
      case 'shipped':
        return <Package className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPaymentStatusIcon = (status) => {
    return <CreditCard className="h-4 w-4" />;
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unpaid':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'refunded':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent border-r-transparent border-b-transparent mx-auto mb-4"></div>
          <p className="text-lg text-dark-gray">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary mb-4">Order Not Found</h1>
          <p className="text-dark-gray mb-6">{error || 'We could not find your order details.'}</p>
          <div className="space-y-3">
            <Link href="/admin/orders" className="block w-full btn btn-outline">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/orders"
            className="inline-flex items-center space-x-2 text-dark-gray hover:text-primary transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-secondary mb-2">Order #{order.orderId}</h1>
              <div className="flex items-center space-x-4 text-sm text-dark-gray">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(order.createdAt).toLocaleDateString('en-BD')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(order.createdAt).toLocaleTimeString('en-BD')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Status Update Dropdown */}
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updating}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors duration-200 disabled:opacity-50 ${getStatusColor(order.status)}`}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Payment Status Toggle */}
              <button
                onClick={handlePaymentStatusToggle}
                disabled={updating}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors duration-200 disabled:opacity-50 ${getPaymentStatusColor(order.paymentStatus)}`}
              >
                {getPaymentStatusIcon(order.paymentStatus)}
                <span className="ml-2 capitalize">{order.paymentStatus}</span>
              </button>

              {/* Print Invoice */}
              <button
                onClick={handlePrintInvoice}
                className="btn btn-outline flex items-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>

              {/* Download Invoice */}
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                className="btn btn-outline flex items-center space-x-2 disabled:opacity-50"
              >
                {downloadingInvoice ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {downloadingInvoice ? 'Generating...' : 'Download Invoice'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-secondary mb-6">Order Items</h2>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex space-x-4 pb-4 border-b border-medium-gray last:border-b-0">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={item.image || '/images/placeholder-product.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-secondary mb-1">
                        {item.nameBn || item.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-dark-gray mb-2">
                        <span>Category: {item.category}</span>
                        <span>•</span>
                        <span>Quantity: {item.quantity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-primary">
                            ৳{item.price.toLocaleString('en-BD')}
                          </span>
                          <span className="text-sm text-dark-gray">×</span>
                          <span className="text-sm text-dark-gray">{item.quantity}</span>
                        </div>
                        <div className="text-sm font-bold text-secondary">
                          ৳{(item.price * item.quantity).toLocaleString('en-BD')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="border-t border-medium-gray pt-6 mt-6">
                <h3 className="text-lg font-semibold text-secondary mb-4">Price Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-gray">Subtotal:</span>
                    <span className="font-medium">৳{order.subtotal.toLocaleString('en-BD')}</span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount:</span>
                      <span className="font-medium text-green-600">
                        -৳{order.discount.toLocaleString('en-BD')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-dark-gray">Tax (15%):</span>
                    <span className="font-medium">৳{order.tax.toLocaleString('en-BD')}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-dark-gray">Shipping:</span>
                    <span className="font-medium text-green-600">
                      {order.shippingCost === 0 ? 'FREE' : `৳${order.shippingCost.toLocaleString('en-BD')}`}
                    </span>
                  </div>

                  <div className="border-t border-medium-gray pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-secondary">Total:</span>
                      <span className="text-lg font-bold text-primary">
                        ৳{order.total.toLocaleString('en-BD')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-secondary mb-6">Order Notes</h2>

              <div className="space-y-4">
                {editingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      rows={4}
                      placeholder="Add order notes..."
                      className="w-full px-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary resize-none"
                    />
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleNotesUpdate}
                        disabled={updating}
                        className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
                      >
                        {updating ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save Notes</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotes(false);
                          setNewNotes(order.notes || '');
                        }}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {order.notes ? (
                      <div className="p-4 bg-light-bg rounded-lg">
                        <p className="text-sm text-dark-gray">{order.notes}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-dark-gray">No notes added yet.</p>
                    )}
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="btn btn-outline flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Notes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-secondary mb-6">Customer Information</h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-secondary">{order.shippingAddress.name}</p>
                    {order.user && (
                      <p className="text-sm text-dark-gray">Account: {order.user.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-dark-gray">{order.shippingAddress.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-dark-gray">{order.shippingAddress.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-dark-gray">
                      {order.shippingAddress.address},<br />
                      {order.shippingAddress.city}, {order.shippingAddress.district},<br />
                      {order.shippingAddress.zip}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-secondary mb-6">Payment Information</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-dark-gray">Payment Method:</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod.replace('-', ' ')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-dark-gray">Payment Status:</span>
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {getPaymentStatusIcon(order.paymentStatus)}
                    <span className="capitalize">{order.paymentStatus}</span>
                  </span>
                </div>

                {order.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-dark-gray">Transaction ID:</span>
                    <span className="font-medium text-xs">{order.transactionId}</span>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-dark-gray">Tracking Number:</span>
                    <span className="font-medium text-xs">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-secondary mb-6">Status History</h2>

              <div className="space-y-4">
                {statusHistory.map((event, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-secondary capitalize">{event.status}</h4>
                        <span className="text-xs text-dark-gray">
                          {new Date(event.timestamp).toLocaleDateString('en-BD')}
                        </span>
                      </div>
                      <p className="text-sm text-dark-gray">
                        {new Date(event.timestamp).toLocaleTimeString('en-BD')}
                      </p>
                      {event.notes && (
                        <p className="text-sm text-dark-gray mt-1">{event.notes}</p>
                      )}
                      <div className="text-xs text-dark-gray">
                        Updated by: {event.updatedBy}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
