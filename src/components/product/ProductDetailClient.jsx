'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, MessageCircle, Star, Minus, Plus, ChevronRight, Home, Shield, Truck, RotateCcw, Headphones } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { showSuccessToast } from '@/lib/toast';

const badgeColors = {
  featured: 'bg-primary',
  'best-seller': 'bg-accent',
  new: 'bg-green-500',
  sale: 'bg-red-500',
};

const placeholder = 'https://placehold.co/600x600/f8f9fa/2c3e50?text=Product';

export default function ProductDetailClient({ product, related }) {
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { addItem } = useCartStore();

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      nameBn: product.nameBn,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0] || '',
      originalPrice: product.originalPrice,
      category: product.category,
      badge: product.badge,
    }, qty);
    showSuccessToast(`${product.nameBn || product.name} added to cart!`);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hello! I want to order:\n\n${product.nameBn || product.name}\nQty: ${qty}\nPrice: ${(product.price * qty).toLocaleString('en-BD')} BDT\n\nPlease confirm.`
    );
    window.open(`https://wa.me/8801996570203?text=${msg}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-light-bg">
      <nav className="bg-white border-b border-medium-gray">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm text-dark-gray flex-wrap">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                <Home className="inline h-4 w-4" />
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li><Link href="/products" className="hover:text-primary transition-colors">Products</Link></li>
            <ChevronRight className="h-3 w-3" />
            <li>
              <Link href={`/products?category=${product.category}`} className="hover:text-primary transition-colors capitalize">
                {product.category?.replace('-', ' ')}
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li className="text-secondary font-medium truncate max-w-xs">{product.nameBn || product.name}</li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg mb-3">
              {product.badge && (
                <span className={`absolute top-3 left-3 z-10 px-3 py-1 text-xs font-bold text-white rounded-full ${badgeColors[product.badge] || 'bg-primary'}`}>
                  {product.badge === 'best-seller' ? 'Best Seller' : product.badge}
                </span>
              )}
              {discountPct > 0 && (
                <span className="absolute top-3 right-3 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  -{discountPct}%
                </span>
              )}
              <Image
                src={product.images?.[activeImg] || placeholder}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary scale-105' : 'border-medium-gray'}`}
                  >
                    <Image src={img} alt={`thumb-${i}`} width={64} height={64} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">{product.nameBn || product.name}</h1>
            {product.nameBn && <p className="text-dark-gray text-sm mb-4">{product.name}</p>}

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`h-5 w-5 ${s <= Math.round(product.rating) ? 'text-accent fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-dark-gray">({product.reviews?.length || 0} reviews)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">৳{product.price?.toLocaleString('en-BD')}</span>
              {hasDiscount && <span className="text-xl text-dark-gray line-through">৳{product.originalPrice?.toLocaleString('en-BD')}</span>}
              {hasDiscount && <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-0.5 rounded">Save {discountPct}%</span>}
            </div>

            <p className="text-dark-gray leading-relaxed mb-6 text-sm">{product.description}</p>

            <div className={`inline-flex items-center gap-1.5 text-sm font-medium mb-6 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-secondary">Quantity:</span>
              <div className="flex items-center border border-medium-gray rounded-lg overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={qty >= product.stock} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-dark-gray">
                Total: <strong className="text-primary">৳{(product.price * qty)?.toLocaleString('en-BD')}</strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-light text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />Add to Cart
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:shadow-lg"
              >
                <MessageCircle className="h-5 w-5" />WhatsApp Order
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-medium-gray">
              {[
                { icon: Truck, text: 'Free Delivery' },
                { icon: Shield, text: 'Secure Payment' },
                { icon: RotateCcw, text: '7-Day Returns' },
                { icon: Headphones, text: '24/7 Support' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-dark-gray">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-secondary mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link
                  key={p._id}
                  href={`/products/${p.slug}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={p.images?.[0] || placeholder}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-secondary truncate group-hover:text-primary transition-colors">
                      {p.nameBn || p.name}
                    </h3>
                    <p className="text-primary font-bold mt-1">৳{p.price?.toLocaleString('en-BD')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
