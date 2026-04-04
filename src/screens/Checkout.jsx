import React, { useState } from "react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  ShoppingBag,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Loader2,
  Smartphone,
  Wallet,
  Building2,
} from "lucide-react";

export const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    area: "Kushtia",
    paymentMethod: "cod",
    paymentGateway: "bkash",
  });

  const shippingFee = formData.area === "Kushtia" ? 70 : 130;
  const totalPrice = getTotalPrice();
  const finalTotal = totalPrice + shippingFee;

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(01[3-9]\d{8})$/.test(formData.phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Please enter a valid Bangladeshi phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please enter a complete address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          selectedVariant: item.selectedVariant || null,
        })),
        totalPrice,
        shippingFee,
        finalTotal,
        formData: {
          ...formData,
          phone: formData.phone.replace(/[\s-]/g, ""), // Clean phone number
        },
      };

      console.log("Order data being sent:", orderData);
      const response = await api.post("/api/orders", orderData);
      console.log("Order response:", response.data);
      console.log("Response success field:", response.data.success);
      console.log("Full response:", JSON.stringify(response.data, null, 2));

      if (response.data.success === true) {
        if (formData.paymentMethod === "sslcommerz") {
          // Redirect to SSLCommerz payment gateway
          if (response.data.paymentUrl) {
            toast.info("Redirecting to payment gateway...");
            window.location.href = response.data.paymentUrl;
          } else {
            toast.error("Payment gateway error. Please try again.");
          }
        } else if (formData.paymentMethod === "cod") {
          // Cash on delivery - clear cart and redirect
          clearCart();
          toast.success("Order placed successfully!");
          navigate("/payment/success?order_id=" + response.data.orderId);
        } else {
          toast.error("Invalid payment method selected");
        }
      } else {
        toast.error(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order creation error:", error);

      if (error.response) {
        // Server responded with error
        const errorMessage =
          error.response.data?.message || "Server error occurred";
        toast.error(errorMessage);

        if (error.response.data?.error) {
          console.error("Detailed error:", error.response.data.error);
        }
      } else if (error.request) {
        // Network error
        toast.error(
          "Network error. Please check your connection and try again.",
        );
      } else {
        // Other error
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-secondary/20" />
        <h2 className="text-2xl font-bold">Your bag is empty</h2>
        <Link to="/products" className="text-primary font-bold hover:underline">
          Start Shopping
        </Link>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-16 h-16 text-secondary/20" />
        <h2 className="text-2xl font-bold">Please Login First</h2>
        <p className="text-secondary/60">You need to login to place an order</p>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all"
          >
            Login
          </Link>
          <Link
            to="/products"
            className="text-primary font-bold hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-12">
        <Link
          to="/cart"
          className="p-2 hover:bg-secondary/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-4xl font-extrabold text-secondary">Checkout</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-12"
      >
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Shipping Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary/60">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                    errors.name ? "ring-2 ring-red-500" : ""
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary/60">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                    errors.phone ? "ring-2 ring-red-500" : ""
                  }`}
                  placeholder="017XXXXXXXX"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-secondary/60">
                  Full Address
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24 ${
                    errors.address ? "ring-2 ring-red-500" : ""
                  }`}
                  placeholder="House #12, Road #5, Sector #3, Uttara, Kushtia"
                />
                {errors.address && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.address}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-secondary/60">
                  Shipping Area
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange("area", "Kushtia")}
                    className={`p-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                      formData.area === "Kushtia"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-secondary/5 hover:border-secondary/20"
                    }`}
                  >
                    <Truck className="w-5 h-5" /> Inside Kushtia
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("area", "outside")}
                    className={`p-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                      formData.area === "outside"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-secondary/5 hover:border-secondary/20"
                    }`}
                  >
                    <Truck className="w-5 h-5" /> Outside Kushtia
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Payment Method
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange("paymentMethod", "cod")}
                  className={`p-6 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-3 ${
                    formData.paymentMethod === "cod"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-secondary/5 hover:border-secondary/20"
                  }`}
                >
                  <Wallet className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-bold">Cash on Delivery</p>
                    <p className="text-xs text-secondary/60">
                      Pay when you receive
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("paymentMethod", "sslcommerz")
                  }
                  className={`p-6 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-3 ${
                    formData.paymentMethod === "sslcommerz"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-secondary/5 hover:border-secondary/20"
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-bold">Online Payment</p>
                    <p className="text-xs text-secondary/60">
                      bKash, Nagad, Rocket & Cards
                    </p>
                  </div>
                </button>
              </div>

              {formData.paymentMethod === "sslcommerz" && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <p className="text-sm font-bold text-primary mb-3">
                    Choose Payment Gateway:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: "bkash", name: "bKash", icon: "📱" },
                      { id: "nagad", name: "Nagad", icon: "💳" },
                      { id: "rocket", name: "Rocket", icon: "🚀" },
                      { id: "card", name: "Card", icon: "💳" },
                    ].map((gateway) => (
                      <button
                        key={gateway.id}
                        type="button"
                        onClick={() =>
                          handleInputChange("paymentGateway", gateway.id)
                        }
                        className={`p-3 rounded-lg border-2 font-bold transition-all flex flex-col items-center gap-2 ${
                          formData.paymentGateway === gateway.id
                            ? "border-primary bg-primary text-white"
                            : "border-secondary/5 hover:border-secondary/20"
                        }`}
                      >
                        <span className="text-2xl">{gateway.icon}</span>
                        <span className="text-xs">{gateway.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.paymentMethod === "cod" && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <p className="text-sm font-bold">
                      Cash on Delivery Selected
                    </p>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Pay the full amount when your order is delivered. No
                    additional charges for COD orders.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Order Summary */}
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> Order Summary
            </h2>
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4">
                    <div className="w-12 h-16 bg-secondary/5 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-bold text-secondary line-clamp-1">
                        {item.name}
                      </p>
                      {item.selectedVariant && (
                        <p className="text-[10px] font-bold text-primary uppercase">
                          {Object.entries(item.selectedVariant.attributes || {})
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(", ")}
                        </p>
                      )}
                      <p className="text-xs text-secondary/40 font-bold uppercase tracking-widest">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        ৳{item.price * item.quantity}
                      </p>
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
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Place Order Now"
              )}
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
