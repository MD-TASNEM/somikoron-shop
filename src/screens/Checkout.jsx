import React, { useState, useEffect } from "react";
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
  Clock,
  RefreshCw,
} from "lucide-react";

export const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errors, setErrors] = useState({});
  const [retryCount, setRetryCount] = useState(0);
  const [submitError, setSubmitError] = useState(""); // Fixed: Added missing error state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    area: "Kushtia",
    paymentMethod: "cod",
    paymentGateway: "bkash",
  });

  // Load saved form data from localStorage
  useEffect(() => {
    const savedFormData = localStorage.getItem("checkout_form_data");
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to load saved form data:", e);
      }
    }
  }, []);

  // Save form data to localStorage
  useEffect(() => {
    localStorage.setItem("checkout_form_data", JSON.stringify(formData));
  }, [formData]);

  // Check if user session is valid
  useEffect(() => {
    if (user && token) {
      // Verify token expiry (assuming token has exp field)
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        if (tokenData.exp && tokenData.exp * 1000 < Date.now()) {
          toast.error("Session expired. Please login again.");
          logout();
          navigate("/login");
        }
      } catch (e) {
        console.error("Token validation error:", e);
      }
    }
  }, [user, token, logout, navigate]);

  const shippingFee = formData.area === "Kushtia" ? 70 : 130;
  const totalPrice = getTotalPrice();
  const finalTotal = totalPrice + shippingFee;

  // Validate cart
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

  // Validate user authentication
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

  // Format phone number for display
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/[\s-]/g, "");
    if (cleaned.length <= 11) return cleaned;
    return cleaned.slice(0, 11);
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const cleanPhone = formData.phone.replace(/[\s-]/g, "");
      if (!/^(01[3-9]\d{8})$/.test(cleanPhone)) {
        newErrors.phone = "Please enter a valid Bangladeshi phone number (01XXXXXXXXX)";
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please enter a complete address (minimum 10 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous error
    setSubmitError("");

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty. Please add items before checkout.");
      navigate("/products");
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = formData.phone.replace(/[\s-]/g, "");
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
          phone: cleanPhone,
        },
      };

      console.log("Order data being sent:", orderData);
      const response = await api.post("/api/orders", orderData);
      console.log("Order response:", response.data);

      if (response.data.success === true) {
        if (formData.paymentMethod === "sslcommerz") {
          // Redirect to SSLCommerz payment gateway
          if (response.data.paymentUrl) {
            setRedirecting(true);
            toast.info("Redirecting to payment gateway...");

            // Clear saved form data after successful order
            localStorage.removeItem("checkout_form_data");

            // Set timeout for redirect
            const redirectTimeout = setTimeout(() => {
              setRedirecting(false);
              setSubmitError("Redirect timeout. Please try again.");
              toast.error("Redirect timeout. Please try again.");
            }, 10000);

            // Store order ID for reference
            sessionStorage.setItem("pending_order_id", response.data.orderId);

            window.location.href = response.data.paymentUrl;
            clearTimeout(redirectTimeout);
          } else {
            setSubmitError("Payment gateway error. Please try again.");
            toast.error("Payment gateway error. Please try again.");
            setLoading(false);
          }
        } else if (formData.paymentMethod === "cod") {
          // Cash on delivery - clear cart and redirect
          clearCart();
          localStorage.removeItem("checkout_form_data");
          toast.success("Order placed successfully!");
          navigate(`/payment/success?order_id=${response.data.orderId}&method=cod`);
        } else {
          setSubmitError("Invalid payment method selected");
          toast.error("Invalid payment method selected");
          setLoading(false);
        }
      } else {
        const errorMsg = response.data.message || "Failed to place order";
        setSubmitError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
      }
    } catch (error) {
      console.error("Order creation error:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || "Server error occurred";

        if (error.response.status === 401) {
          toast.error("Session expired. Please login again.");
          logout();
          navigate("/login");
          return;
        } else if (error.response.status === 429) {
          errorMessage = "Too many attempts. Please wait a moment and try again.";
        }

        if (error.response.data?.error) {
          console.error("Detailed error:", error.response.data.error);
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection and try again.";
      }

      setSubmitError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setSubmitError("");
      handleSubmit(new Event('submit'));
    } else {
      const errorMsg = "Multiple failed attempts. Please refresh the page and try again.";
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleInputChange = (field, value) => {
    let processedValue = value;

    if (field === "phone") {
      processedValue = formatPhoneNumber(value);
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError("");
    }
  };

  // Delivery time estimation
  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + (formData.area === "Kushtia" ? 2 : 4));
    return deliveryDate.toLocaleDateString('en-BD', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (redirecting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <h2 className="text-2xl font-bold">Redirecting to Payment Gateway</h2>
        <p className="text-secondary/60">Please wait while we redirect you to complete your payment...</p>
        <p className="text-sm text-secondary/40">Do not close this window</p>
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
                  Full Name *
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
                  disabled={loading}
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
                  Phone Number *
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
                  disabled={loading}
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
                  Full Address *
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24 ${
                    errors.address ? "ring-2 ring-red-500" : ""
                  }`}
                  placeholder="House #12, Road #5, Sector #3, Uttara, Kushtia"
                  disabled={loading}
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
                  Shipping Area *
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
                    disabled={loading}
                  >
                    <Truck className="w-5 h-5" /> Inside Kushtia (৳70)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("area", "outside")}
                    className={`p-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                      formData.area === "outside"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-secondary/5 hover:border-secondary/20"
                    }`}
                    disabled={loading}
                  >
                    <Truck className="w-5 h-5" /> Outside Kushtia (৳130)
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
                  disabled={loading}
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
                  disabled={loading}
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
                      { id: "nagad", name: "Nagad", icon: "📱" },
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
                        disabled={loading}
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

          {/* Delivery Information */}
          <section className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">Estimated Delivery</h3>
            </div>
            <p className="text-sm text-blue-800">
              Your order will be delivered on {getEstimatedDelivery()}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              *Delivery time may vary based on your location and product availability
            </p>
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6 sticky top-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> Order Summary
            </h2>
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {items.map((item, index) => (
                  <div key={item.cartItemId || item.id || index} className="flex gap-4">
                    <div className="w-12 h-16 bg-secondary/5 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
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
                  <span className="font-bold">৳{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-secondary/60">
                  <span>Shipping Fee</span>
                  <span className="font-bold">৳{shippingFee.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-secondary/5 flex justify-between text-2xl font-extrabold">
                  <span>Total</span>
                  <span className="text-primary">৳{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-600">{submitError}</p>
                {retryCount < 3 && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-2 text-sm text-red-700 font-bold flex items-center gap-1 hover:text-red-800 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || redirecting}
              className="w-full bg-primary text-white py-5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Place Order • ৳${finalTotal.toFixed(2)}`
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