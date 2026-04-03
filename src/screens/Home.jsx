import React from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageCircle as WhatsAppIcon,
  Gift,
  Zap,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import axios from "axios";
import { ProductCard } from "../components/ProductCard";
import { CATEGORIES } from "../types";
import { CountdownTimer } from "../components/CountdownTimer";
import SEO from "../components/SEO";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const Home = () => {
  const [latestProducts, setLatestProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/products");
        if (Array.isArray(response.data)) {
          setLatestProducts(response.data.slice(0, 8));
        } else {
          console.error("Expected array of products, got:", response.data);
          setLatestProducts([]);
        }
      } catch (error) {
        if (!error.isWarmup) {
          console.error("Error fetching products:", error);
        }
        setLatestProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const carouselSlides = [
    {
      id: 1,
      title: "Customized Photo Frames",
      description:
        "Personalize your memories with our beautiful custom photo frames. Perfect for gifts and home decor.",
      image:
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      link: "/category/photo-frames",
    },
    {
      id: 2,
      title: "Elegant Nikah Nama Covers",
      description:
        "Premium Nikah Nama covers for your special day. Handcrafted with love and tradition.",
      image:
        "https://images.unsplash.com/photo-1544716278-e513176f20b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      link: "/category/nikah-nama",
    },
    {
      id: 3,
      title: "Personalized Coffee Mugs",
      description:
        "Start your morning with a custom mug. Great for personal use or corporate gifting.",
      image:
        "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      link: "/category/cups",
    },
  ];

  const offers = [
    {
      id: 1,
      title: "Eid Special Collection",
      discount: "Up to 30% OFF",
      description:
        "Exclusive Panjabi and Saree collection for the upcoming Eid festival.",
      code: "EID2026",
      image: "https://picsum.photos/seed/eid/800/600",
      color: "bg-primary",
    },
    {
      id: 2,
      title: "New User Discount",
      discount: "৳200 Flat OFF",
      description: "Get flat ৳200 discount on your first order above ৳1000.",
      code: "WELCOME200",
      image: "https://picsum.photos/seed/welcome/800/600",
      color: "bg-secondary",
    },
    {
      id: 3,
      title: "Free Shipping",
      discount: "FREE DELIVERY",
      description:
        "Enjoy free delivery on all orders above ৳2000 across Bangladesh.",
      code: "FREESHIP",
      image: "https://picsum.photos/seed/shipping/800/600",
      color: "bg-success",
    },
  ];

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    // You can add a toast notification here
    alert(`Promo code ${code} copied to clipboard!`);
  };

  return (
    <>
      <SEO
        title="Custom T-Shirts, Mugs & Merchandise | Islamic University Bangladesh"
        description="Shop custom printed T-shirts, mugs, trophies, flags and more at সমীকরণ শপ. Quality merchandise with fast delivery across Bangladesh. Special offers available."
        keywords={[
          "custom t-shirt bangladesh",
          "printed mugs",
          "islamic university merchandise",
          "custom trophies",
          "photo frames",
          "nikah nama covers",
          "hal khata cards",
          "custom gifts",
          "Kushtia",
          "jhenaidah",
          "kushtia",
          "online shopping bd",
        ]}
        image="https://somikoron-shop.com/homepage-og.jpg"
        type="website"
      />
      <div className="space-y-20 pb-20">
        {/* Hero Section */}
        <section
          className="relative h-[85vh] overflow-hidden bg-secondary flex items-center justify-center text-center px-4"
          id="home"
        >
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
              alt="Hero"
              className="w-full h-full object-cover opacity-30"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90 mix-blend-multiply" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 max-w-3xl space-y-8"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl text-white font-bold tracking-tight">
              সমীকরণ&nbsp;&nbsp;শপে&nbsp;&nbsp;আপনাকে
              <br />
              স্বাগতম
            </h1>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              আপনার সব ধরনের কাস্টমাইজড পণ্যের একমাত্র ঠিকানা।
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link
                to="/category/all"
                className="bg-primary hover:bg-primary-dark px-8 py-4 rounded-full text-white font-bold flex items-center gap-2 transition-all shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                পণ্য দেখুন
              </Link>
              <a
                href="https://wa.me/8801996570203"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-full text-white font-bold flex items-center gap-2 transition-all shadow-lg"
              >
                <WhatsAppIcon className="w-5 h-5" /> WhatsApp এ অর্ডার করুন
              </a>
            </div>
          </motion.div>
        </section>

        {/* Carousel Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{ delay: 5000 }}
            navigation
            pagination={{ clickable: true }}
            className="rounded-xl overflow-hidden shadow-2xl aspect-[16/9] sm:aspect-[21/9]"
          >
            {carouselSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="relative w-full h-full">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover opacity-70 bg-secondary"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-white">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="max-w-2xl space-y-4"
                    >
                      <h2 className="text-3xl sm:text-5xl font-bold">
                        {slide.title}
                      </h2>
                      <p className="text-white/80 text-lg">
                        {slide.description}
                      </p>
                      <Link
                        to={slide.link}
                        className="inline-flex items-center gap-2 bg-primary px-6 py-3 rounded-full font-bold hover:bg-primary-dark transition-colors"
                      >
                        Shop Now <ArrowRight className="w-5 h-5" />
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* Offer Zone - Flash Sale Section (Fixed) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-secondary to-secondary/95 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-primary text-sm font-bold uppercase tracking-widest backdrop-blur-sm">
                  <Zap className="w-4 h-4 fill-current" /> Flash Sale
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                  Limited Time Midnight Madness!
                </h2>
                <p className="text-white/70 text-lg leading-relaxed">
                  Get up to 50% off on selected items. Offer valid until
                  midnight tonight.
                </p>

                {/* Countdown Timer */}
                <div className="flex items-center gap-4 md:gap-8 pt-4">
                  <div className="text-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4">
                      <p className="text-3xl md:text-4xl font-extrabold">08</p>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/50 mt-2">
                      Hours
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4">
                      <p className="text-3xl md:text-4xl font-extrabold">45</p>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/50 mt-2">
                      Minutes
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4">
                      <p className="text-3xl md:text-4xl font-extrabold">12</p>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/50 mt-2">
                      Seconds
                    </p>
                  </div>
                </div>

                <Link
                  to="/offers"
                  className="inline-flex items-center gap-3 bg-primary text-white px-8 md:px-10 py-4 md:py-5 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 group mt-6"
                >
                  <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                  Shop the Sale
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="hidden lg:block relative">
                <div className="w-full aspect-square bg-gradient-to-br from-white/5 to-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm">
                  <Gift className="w-40 h-40 md:w-48 md:h-48 text-primary/40 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Ribbon */}
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
          id="products"
        >
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary">
              Our Products
            </h2>
            <p className="text-secondary/60">
              High-quality customized products for all your needs
            </p>
          </div>
          {/* Filters Bar */}
          <div className="flex flex-wrap gap-3 justify-start sm:justify-center">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100 hover:bg-primary hover:text-white group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Arrivals Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Trust Badges */}
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
          id="features"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm text-center space-y-4 hover:shadow-md transition-all group">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Free Shipping</h3>
              <p className="text-sm text-secondary/60">
                Free delivery on all orders over ৳2000
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm text-center space-y-4 hover:shadow-md transition-all group">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Secure Payment</h3>
              <p className="text-sm text-secondary/60">
                100% secure payment processing
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm text-center space-y-4 hover:shadow-md transition-all group">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Easy Returns</h3>
              <p className="text-sm text-secondary/60">
                Easy returns within 48 hours
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm text-center space-y-4 hover:shadow-md transition-all group">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <WhatsAppIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">15/7 Support</h3>
              <p className="text-sm text-secondary/60">
                Customer service is available on WhatsApp from 8 AM to 11 PM
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
