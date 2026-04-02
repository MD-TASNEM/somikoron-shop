import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, MapPin, CreditCard, 
  Truck, ShoppingBag, ShieldCheck,
  AlertCircle, CheckCircle
} from 'lucide-react';

export const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    area: 'dhaka',
    paymentMethod: 'cod'
  });

  const shippingFee = formData.area === 'dhaka' ? 70 : 130;
  const totalPrice = getTotalPrice();
  const finalTotal = totalPrice + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        items,
        totalPrice,
        shippingFee,
        finalTotal,
        formData
      };

      const response = await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (formData.paymentMethod === 'online') {
        // Redirect to payment gateway (SSLCommerz)
        window.location.href = response.data.paymentUrl;
      } else {
        clearCart();
        navigate('/payment/success');
      }
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-secondary/20" />
        <h2 className="text-2xl font-bold">Your bag is empty</h2>
        <Link to="/products" className="text-primary font-bold hover:underline">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-12">
        <Link to="/cart" className="p-2 hover:bg-secondary/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-4xl font-extrabold text-secondary">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Shipping Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary/60">Full Name</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary/60">Phone Number</label>
                <input 
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="017XXXXXXXX"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-secondary/60">Full Address</label>
                <textarea 
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24"
                  placeholder="House #12, Road #5, Sector #3, Uttara, Dhaka"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-secondary/60">Shipping Area</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, area: 'dhaka'})}
                    className={`p-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                      formData.area === 'dhaka' ? 'border-primary bg-primary/5 text-primary' : 'border-secondary/5 hover:border-secondary/20'
                    }`}
                  >
                    <Truck className="w-5 h-5" /> Inside Dhaka
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, area: 'outside'})}
                    className={`p-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                      formData.area === 'outside' ? 'border-primary bg-primary/5 text-primary' : 'border-secondary/5 hover:border-secondary/20'
                    }`}
                  >
                    <Truck className="w-5 h-5" /> Outside Dhaka
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Payment Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setFormData({...formData, paymentMethod: 'cod'})}
                className={`p-6 rounded-xl border-2 font-bold transition-all text-left flex items-start gap-4 ${
                  formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5 text-primary' : 'border-secondary/5 hover:border-secondary/20'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  formData.paymentMethod === 'cod' ? 'border-primary' : 'border-secondary/20'
                }`}>
                  {formData.paymentMethod === 'cod' && <div className="w-3 h-3 bg-primary rounded-full" />}
                </div>
                <div>
                  <p className="text-lg">Cash on Delivery</p>
                  <p className="text-xs font-normal opacity-60">Pay when you receive the product</p>
                </div>
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, paymentMethod: 'online'})}
                className={`p-6 rounded-xl border-2 font-bold transition-all text-left flex items-start gap-4 ${
                  formData.paymentMethod === 'online' ? 'border-primary bg-primary/5 text-primary' : 'border-secondary/5 hover:border-secondary/20'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  formData.paymentMethod === 'online' ? 'border-primary' : 'border-secondary/20'
                }`}>
                  {formData.paymentMethod === 'online' && <div className="w-3 h-3 bg-primary rounded-full" />}
                </div>
                <div>
                  <p className="text-lg">Online Payment</p>
                  <p className="text-xs font-normal opacity-60">bKash, Nagad, Rocket or Card</p>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-premium shadow-xl border border-secondary/5 space-y-6 sticky top-24">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4">
                    <div className="w-12 h-16 bg-secondary/5 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-bold text-secondary line-clamp-1">{item.name}</p>
                      {item.selectedVariant && (
                        <p className="text-[10px] font-bold text-primary uppercase">
                          {Object.entries(item.selectedVariant.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-secondary/40 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-primary">৳{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-secondary/5 space-y-3 text-sm">
                <div className="flex justify-between text-secondary/60">
                  <span>Subtotal</span>
                  <span className="font-bold">৳{totalPrice}</span>
                </div>
                <div className="flex justify-between text-secondary/60">
                  <span>Shipping Fee</span>
                  <span className="font-bold">৳{shippingFee}</span>
                </div>
                <div className="pt-4 border-t border-secondary/5 flex justify-between text-2xl font-extrabold">
                  <span>Total</span>
                  <span className="text-primary">৳{finalTotal}</span>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order Now'}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-secondary/40 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Secure Checkout Guaranteed
            </div>
          </section>
        </div>
      </form>
    </div>
  );
};
