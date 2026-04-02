import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import { ArrowLeft, Star, MessageCircle, ShoppingBag, Truck, ShieldCheck, RotateCcw, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useCartStore } from '../store/cartStore';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
        
        // Initialize selected variant if available
        if (response.data.variants && response.data.variants.length > 0) {
          setSelectedVariant(response.data.variants[0]);
        }
        
        // Fetch related products
        const relatedResponse = await axios.get(`/api/products?category=${response.data.category}`);
        if (Array.isArray(relatedResponse.data)) {
          setRelatedProducts(relatedResponse.data.filter(p => p._id !== id).slice(0, 3));
        } else {
          setRelatedProducts([]);
        }
      } catch (error) {
        if (!error.isWarmup) {
          console.error('Error fetching product:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/" className="text-primary font-bold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const whatsappLink = `https://wa.me/8801996570203?text=Hi, I'm interested in the ${product.name} (৳${product.price}). Is it available?`;

  return (
    <div className="pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm text-secondary/40 mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/category/${product.category}`} className="hover:text-primary transition-colors capitalize">{product.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-secondary/80 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square rounded-premium overflow-hidden bg-surface-container-low group shadow-inner">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`aspect-square rounded-subtle overflow-hidden bg-surface-container-low cursor-pointer hover:opacity-80 transition-opacity ${i === 1 ? 'border-2 border-primary' : ''}`}>
                  <img 
                    src={product.image} 
                    alt={`${product.name} ${i}`} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="space-y-6 pb-8 border-b border-secondary/5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-tertiary text-tertiary' : 'text-secondary/20'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-secondary/60">{product.rating || 5.0} (120 Reviews)</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight">{product.name}</h1>
                <p className="bengali text-2xl text-primary font-bold">{product.nameBn}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-4xl font-extrabold text-primary">
                    ৳{selectedVariant ? selectedVariant.price : product.price}
                  </span>
                  <p className="text-xs font-bold text-secondary/40 mt-1">
                    {selectedVariant 
                      ? (selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock')
                      : (product.stock > 0 ? `${product.stock} in stock` : 'Out of stock')
                    }
                  </p>
                </div>
                {product.originalPrice && (
                  <span className="text-xl text-secondary/30 line-through">৳{product.originalPrice}</span>
                )}
                {product.originalPrice && (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              <p className="text-secondary/70 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="py-8 space-y-6">
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm font-bold uppercase tracking-widest text-secondary/40">Select Variant</p>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant) => (
                      <button 
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-subtle border-2 flex items-center justify-center font-bold transition-all ${selectedVariant?.id === variant.id ? 'border-primary bg-primary/5 text-primary' : 'border-secondary/5 hover:border-primary hover:text-primary'}`}
                      >
                        {Object.entries(variant.attributes || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(!product.variants || product.variants.length === 0) && (
                <div className="space-y-4">
                  <p className="text-sm font-bold uppercase tracking-widest text-secondary/40">Select Size</p>
                  <div className="flex flex-wrap gap-3">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <button 
                        key={size}
                        className={`w-12 h-12 rounded-subtle border-2 flex items-center justify-center font-bold transition-all ${size === 'M' ? 'border-primary bg-primary/5 text-primary' : 'border-secondary/5 hover:border-primary hover:text-primary'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-grow bg-success text-white px-8 py-5 rounded-premium font-bold flex items-center justify-center gap-3 hover:shadow-xl transition-all"
                >
                  <MessageCircle className="w-6 h-6 fill-current" />
                  WhatsApp এ অর্ডার করুন
                </a>
                <button 
                  onClick={() => product && addItem(product, selectedVariant)}
                  disabled={selectedVariant ? selectedVariant.stock <= 0 : product.stock <= 0}
                  className="bg-secondary text-white px-8 py-5 rounded-premium font-bold flex items-center justify-center gap-3 hover:bg-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-6 h-6" />
                  {selectedVariant 
                    ? (selectedVariant.stock > 0 ? 'কার্টে যোগ করুন' : 'আউট অফ স্টক')
                    : (product.stock > 0 ? 'কার্টে যোগ করুন' : 'আউট অফ স্টক')
                  }
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-secondary/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/5 flex items-center justify-center text-secondary">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">ফাস্ট ডেলিভারি</p>
                  <p className="text-xs text-secondary/60">৩-৫ কর্মদিবস</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/5 flex items-center justify-center text-secondary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">সিকিউর পেমেন্ট</p>
                  <p className="text-xs text-secondary/60">১০০% সুরক্ষিত</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/5 flex items-center justify-center text-secondary">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">সহজ রিটার্ন</p>
                  <p className="text-xs text-secondary/60">৭ দিনের মধ্যে</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="space-y-2 mb-12">
            <p className="text-xs font-bold text-primary uppercase tracking-[0.3em]">You might also like</p>
            <h2 className="text-4xl font-bold">Related Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
