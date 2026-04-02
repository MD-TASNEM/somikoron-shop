import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { Package, Calendar, CreditCard, ChevronRight, ShoppingBag, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-secondary/20" />
        <h2 className="text-2xl font-bold">No orders yet</h2>
        <Link to="/products" className="text-primary font-bold hover:underline">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-extrabold">My Orders</h1>
        <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold">
          {orders.length} Orders
        </span>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Link 
            key={order._id} 
            to={`/orders/${order._id}`}
            className="block bg-white p-6 rounded-premium shadow-sm hover:shadow-md transition-all group border border-secondary/5"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/5 rounded-xl flex items-center justify-center text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Order ID</p>
                  <p className="font-bold text-secondary">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-grow max-w-xl">
                <div>
                  <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date
                  </p>
                  <p className="font-bold text-secondary text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Total
                  </p>
                  <p className="font-bold text-primary text-sm">৳{order.finalTotal}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mt-1 ${
                    order.status === 'delivered' ? 'bg-success/10 text-success' :
                    order.status === 'pending' ? 'bg-warning/10 text-warning' :
                    order.status === 'cancelled' ? 'bg-error/10 text-error' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <ChevronRight className="hidden md:block w-6 h-6 text-secondary/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
