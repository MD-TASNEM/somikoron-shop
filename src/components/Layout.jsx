import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, User, X, Phone, MessageCircle as WhatsAppIcon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WhatsAppFloat } from './WhatsAppFloat';
import { CartSidebar } from './CartSidebar';
import { useCartStore } from '../store/cartStore';
import { CATEGORIES } from '../types';

export const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const location = useLocation();
  const totalItems = useCartStore(state => state.getTotalItems());

  React.useEffect(() => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-secondary text-white py-2 text-[10px] sm:text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="bengali tracking-normal">সমীকরণ শপে আপনাকে স্বাগতম। আমাদের যে কোন পণ্য অর্ডার করতে WhatsApp করুন:</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="tel:01996570203" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-3 h-3" /> 01996-570203
            </a>
            <a href="https://wa.me/8801996570203" className="flex items-center gap-2 hover:text-primary transition-colors">
              <WhatsAppIcon className="w-3 h-3" /> +880 1996-570203
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 text-secondary hover:text-primary transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-secondary leading-none">
                  <span className="text-primary">সমীকরণ</span> শপ
                </span>
                <span className="text-[8px] tracking-[0.3em] text-secondary/60 font-bold uppercase">Somikoron Shop</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { name: 'Home', path: '/' },
                { name: 'Products', path: '/category/all' },
                { name: 'Offers', path: '/#offers' },
                { name: 'Features', path: '/#features' },
                { name: 'Contact', path: '/#contact' }
              ].map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path}
                  className="text-sm font-bold text-secondary hover:text-primary transition-colors tracking-wide relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-secondary hover:text-primary transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <button className="hidden sm:block p-2 text-secondary hover:text-primary transition-colors">
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-secondary hover:text-primary transition-colors relative group"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {totalItems}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-t border-secondary/5 overflow-hidden"
            >
              <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="relative">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Search for products (e.g. Panjabi, Mugs...)" 
                    className="w-full bg-secondary/5 border-none rounded-full px-6 py-4 text-secondary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-secondary/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-secondary/5 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-bold">সমীকরণ শপ</span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-secondary/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-secondary" />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6 space-y-8 no-scrollbar">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Categories</p>
                  <nav className="flex flex-col gap-2">
                    {CATEGORIES.map((cat) => (
                      <Link 
                        key={cat.id} 
                        to={`/category/${cat.id}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
                      >
                        <span className="font-bold">{cat.name}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Quick Links</p>
                  <nav className="flex flex-col gap-4 pl-3">
                    <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
                    <Link to="/category/all" className="text-sm font-medium hover:text-primary transition-colors">All Products</Link>
                    <a href="#offers" className="text-sm font-medium hover:text-primary transition-colors">Special Offers</a>
                    <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">Contact Us</a>
                  </nav>
                </div>
              </div>
              
              <div className="p-6 border-t border-secondary/5 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Need Help?</p>
                    <a href="https://wa.me/8801996570203" className="text-sm font-bold text-success hover:underline">WhatsApp Us</a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-secondary text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-8 h-8 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold tracking-tight text-white leading-none">
                    <span className="text-primary">সমীকরণ</span> শপ
                  </span>
                  <span className="text-[8px] tracking-[0.3em] text-white/60 font-bold uppercase">Somikoron Shop</span>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                বিশ্বস্ত ঠিকানায় আপনাকে স্বাগতম। "সমীকরণ শপ" এটি একটি অনলাইন ব্যবসায়ী প্রতিষ্ঠান। আমাদের পন্য সমুহঃ ১. যে কোন কাস্টমাইজ টি-শার্ট, ক্যাপ, মগ, প্লেট, কলম সহ যাবতীয় প্রিন্টের পন্য সামগ্রী। ২. ক্রেষ্ট ৩. ট্রফি ৪. পতাকা ৫. হালখাতার কার্ড
              </p>
              <div className="flex gap-4">
                {/* Social icons */}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-8 relative pb-4 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-primary">Quick Links</h4>
              <ul className="space-y-4 text-sm text-white/60">
                <li><Link to="/" className="hover:text-primary transition-colors flex items-center gap-2">Home</Link></li>
                <li><Link to="/category/all" className="hover:text-primary transition-colors flex items-center gap-2">Products</Link></li>
                <li><a href="#offers" className="hover:text-primary transition-colors flex items-center gap-2">Special Offers</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors flex items-center gap-2">Why Choose Us</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors flex items-center gap-2">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-8 relative pb-4 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-primary">Contact Info</h4>
              <ul className="space-y-4 text-sm text-white/60">
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <span>01996-570203</span>
                </li>
                <li className="flex items-start gap-3">
                  <WhatsAppIcon className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <span>+880 1996-570203</span>
                </li>
                <li className="flex items-start gap-3">
                  <Menu className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <span>Islamic university, Bangladesh Main gate, Jhenaidah, kushtia</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-8 relative pb-4 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-primary">Newsletter</h4>
              <p className="text-sm text-white/60 mb-6">Subscribe to get updates on new arrivals and special offers.</p>
              <div className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-white/10 border-none rounded-subtle px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <button className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-subtle text-sm font-bold transition-colors">Subscribe Now</button>
              </div>
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-white/10 text-center text-xs text-white/40">
            <p>© 2026 Somikoron Shop. All rights reserved. | Designed with ❤️ for Bangladesh</p>
          </div>
        </div>
      </footer>

      <WhatsAppFloat />
    </div>
  );
};
