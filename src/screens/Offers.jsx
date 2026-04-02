import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ShoppingBag,
  Menu,
  ShoppingCart,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../types"; // Imported from your home page setup

export const Offers = () => {
  // State for the countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: "08",
    minutes: "42",
    seconds: "15",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Simulating a rolling daily countdown or set a specific end date
      const hours = String(23 - now.getHours()).padStart(2, "0");
      const minutes = String(59 - now.getMinutes()).padStart(2, "0");
      const seconds = String(59 - now.getSeconds()).padStart(2, "0");
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const deals = [
    {
      id: 1,
      title: "হেরিটেজ লেদার ব্যাগ",
      category: "Premium",
      price: "৳৪,৫০০",
      oldPrice: "৳৬,০০০",
      discount: "Save 25%",
      img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 2,
      title: "সাউন্ড মাস্টার প্রো",
      category: "Audio",
      price: "৳৭,২০০",
      oldPrice: "৳৮,৫০০",
      discount: "Save 15%",
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 3,
      title: "মিনিমালিস্ট রিস্ট ওয়াচ",
      category: "Classic",
      price: "৳৩,০০০",
      oldPrice: "৳৫,০০০",
      discount: "Save 40%",
      img: "https://images.unsplash.com/photo-1524592093825-b1200b367ad4?auto=format&fit=crop&w=500&q=80",
    },
    {
      id: 4,
      title: "অ্যাক্টিভ স্পোর্টস শুজ",
      category: "Active",
      price: "৳৫,৬০০",
      oldPrice: "৳৭,০০০",
      discount: "Save 20%",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
    },
  ];

  // Animation variants for the parent grid
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Staggers the arrival of each card
      },
    },
  };

  // Animation variants for individual cards
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-[#191c1d] font-sans pb-24 space-y-20">
      <main className="pt-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="relative overflow-hidden rounded-premium aspect-[4/5] md:aspect-video flex flex-col items-center justify-center p-8 text-white bg-gradient-to-br from-primary to-primary/90 shadow-2xl">
            <img
              alt="Heritage Offer"
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 pointer-events-none"
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
            />

            {/* Centered content container */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs md:text-sm font-bold tracking-widest uppercase border border-white/20"
              >
                Limited Edition
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-extrabold leading-[0.95] tracking-tighter"
              >
                Heritage Offer 2026
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-2xl font-medium opacity-90 max-w-[500px]"
              >
                আমাদের সেরা সংগ্রহে বিশেষ ছাড় উপভোগ করুন।
              </motion.p>

              {/* Countdown Timer */}
              <div className="flex gap-3 pt-4">
                {[
                  { val: timeLeft.hours, label: "Hours" },
                  { val: timeLeft.minutes, label: "Mins" },
                  { val: timeLeft.seconds, label: "Secs" },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="bg-white text-primary rounded-xl px-5 py-3 min-w-[70px] flex flex-col items-center justify-center shadow-lg backdrop-blur-md"
                  >
                    <span className="text-2xl font-bold font-mono">
                      {item.val}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-tighter opacity-80">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Category Ribbon from Home Page */}
     <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        id="products"
      >
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold text-secondary">Our Products</h2>
          <p className="text-secondary/60">
            High-quality customized products for all your needs
          </p>
        </div>

        {/* Changed overflow-x-auto to flex-wrap and centered the wrapped items */}
        <div className="flex flex-wrap gap-4 justify-center">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className="px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all border border-secondary/5 hover:bg-primary hover:text-white group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold group-hover:text-white">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

        {/* Best Deals Grid (Refactored to match Home grid constraints) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h3 className="text-2xl md:text-3xl font-extrabold text-secondary tracking-tight">
                Today's Best Deals
              </h3>
              <p className="text-secondary/60 text-sm">
                সেরা মূল্যে সেরা পণ্যসমূহ
              </p>
            </div>
            <button className="text-primary font-bold text-sm tracking-tight flex items-center gap-1 hover:text-primary/80 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid setup with motion for staggered children mapped safely */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show" // Switched to whileInView to trigger nicely when scrolling down
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {deals.map((deal) => (
              <motion.div
                key={deal.id}
                variants={itemVariants}
                className="bg-white rounded-premium overflow-hidden shadow-sm relative group hover:shadow-md transition-all"
              >
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-[#805600] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {deal.discount}
                  </span>
                </div>
                <div className="aspect-square relative bg-slate-100 overflow-hidden">
                  <img
                    src={deal.img}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-primary p-2.5 rounded-full shadow-lg active:scale-95 transition-all hover:bg-primary hover:text-white">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-1">
                  <p className="text-xs text-secondary/50 font-bold uppercase tracking-widest">
                    {deal.category}
                  </p>
                  <h4 className="font-bold text-base text-secondary line-clamp-1">
                    {deal.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-extrabold text-lg">
                      {deal.price}
                    </span>
                    <span className="text-secondary/40 text-sm line-through">
                      {deal.oldPrice}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  );
};
