import React from 'react';
import { ShoppingBag, ArrowLeft, Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center space-y-12"
      >
        <div className="relative inline-block">
          <h1 className="text-[180px] font-black text-secondary/5 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-bounce">
              <ShoppingBag className="w-16 h-16" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-extrabold text-secondary">Oops! Page Not Found</h2>
          <p className="text-secondary/60 text-lg max-w-md mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/"
            className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 group"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <Link 
            to="/products"
            className="w-full sm:w-auto bg-secondary text-white px-10 py-5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-secondary/90 transition-all shadow-xl group"
          >
            <Search className="w-5 h-5" />
            Browse Products
          </Link>
        </div>

        <div className="pt-12 border-t border-secondary/5">
          <p className="text-sm text-secondary/40 font-bold uppercase tracking-widest mb-6">Popular Categories</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Panjabi', 'Saree', 'Kurti', 'Mugs', 'Crests'].map((cat) => (
              <Link 
                key={cat}
                to={`/category/${cat.toLowerCase()}`}
                className="px-6 py-3 bg-secondary/5 rounded-full text-sm font-bold text-secondary hover:bg-primary hover:text-white transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
