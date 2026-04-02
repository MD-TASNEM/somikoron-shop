import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, MessageCircle as WhatsAppIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../types';
import { CountdownTimer } from '../components/CountdownTimer';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const Home = () => {
  const [latestProducts, setLatestProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/products');
        if (Array.isArray(response.data)) {
          setLatestProducts(response.data.slice(0, 8));
        } else {
          console.error('Expected array of products, got:', response.data);
          setLatestProducts([]);
        }
      } catch (error) {
        if (!error.isWarmup) {
          console.error('Error fetching products:', error);
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
      description: "Personalize your memories with our beautiful custom photo frames. Perfect for gifts and home decor.",
      image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      link: "/category/photo-frames"
    },
    {
      id: 2,
      title: "Elegant Nikah Nama Covers",
      description: "Premium Nikah Nama covers for your special day. Handcrafted with love and tradition.",
      image: "https://images.unsplash.com/photo-1544716278-e513176f20b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      link: "/category/nikah-nama"
    },
    {
      id: 3,
      title: "Personalized Coffee Mugs",
      description: "Start your morning with a custom mug. Great for personal use or corporate gifting.",
      image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      link: "/category/cups"
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] overflow-hidden bg-secondary flex items-center justify-center text-center px-4" id="home">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Hero" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-br from-primary/90 to-secondary/90 mix-blend-multiply" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-3xl space-y-8"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-bold tracking-tight">
            সমীকরণ শপে স্বাগতম
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            আপনার সব ধরনের কাস্টমাইজড পণ্যের একমাত্র ঠিকানা। কাপ, প্লেট, ফটো ফ্রেম, নিকah নামা, কলম, স্কেল এবং আরও অনেক কিছু!
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
              className="bg-success hover:bg-[#128c7e] px-8 py-4 rounded-full text-white font-bold flex items-center gap-2 transition-all shadow-lg"
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
          className="rounded-premium overflow-hidden shadow-2xl aspect-[16/9] sm:aspect-[21/9]"
        >
          {carouselSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full h-full">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover opacity-70 bg-secondary"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="max-w-2xl space-y-4"
                  >
                    <h2 className="text-3xl sm:text-5xl font-bold">{slide.title}</h2>
                    <p className="text-white/80 text-lg">{slide.description}</p>
                    <Link to={slide.link} className="inline-flex items-center gap-2 bg-primary px-6 py-3 rounded-full font-bold hover:bg-primary-dark transition-colors">
                      Shop Now <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Offer Zone with Countdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="offers">
        <div className="bg-linear-to-br from-primary to-primary-dark rounded-premium p-10 sm:p-16 text-center text-white shadow-2xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Special Offer Zone</h2>
            <p className="text-xl text-white/80">Get up to 50% off on selected items. Limited time offer!</p>
          </div>
          <CountdownTimer />
          <div className="pt-4">
            <Link to="/category/all" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-8 py-4 rounded-full font-bold transition-all border border-white/30 backdrop-blur-md">
              View All Offers <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="products">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold text-secondary">Our Products</h2>
          <p className="text-secondary/60">High-quality customized products for all your needs</p>
        </div>
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 justify-start sm:justify-center">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className="flex-shrink-0 px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all border border-secondary/5 hover:bg-primary hover:text-white group"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {latestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="features">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-premium shadow-sm text-center space-y-4 hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Free Shipping</h3>
            <p className="text-sm text-secondary/60">Free delivery on all orders over ৳500</p>
          </div>
          <div className="bg-white p-8 rounded-premium shadow-sm text-center space-y-4 hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Secure Payment</h3>
            <p className="text-sm text-secondary/60">100% secure payment processing</p>
          </div>
          <div className="bg-white p-8 rounded-premium shadow-sm text-center space-y-4 hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <RotateCcw className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">Easy Returns</h3>
            <p className="text-sm text-secondary/60">Easy returns within 7 days</p>
          </div>
          <div className="bg-white p-8 rounded-premium shadow-sm text-center space-y-4 hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <WhatsAppIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">24/7 Support</h3>
            <p className="text-sm text-secondary/60">Round-the-clock customer service</p>
          </div>
        </div>
      </section>
    </div>
  );
};
