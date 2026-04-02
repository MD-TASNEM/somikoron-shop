import React from 'react';
import { Gift, Zap, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Offers = () => {
  const offers = [
    {
      id: 1,
      title: 'Eid Special Collection',
      discount: 'Up to 30% OFF',
      description: 'Exclusive Panjabi and Saree collection for the upcoming Eid festival.',
      code: 'EID2026',
      image: 'https://picsum.photos/seed/eid/800/600',
      color: 'bg-primary'
    },
    {
      id: 2,
      title: 'New User Discount',
      discount: '৳200 Flat OFF',
      description: 'Get flat ৳200 discount on your first order above ৳1000.',
      code: 'WELCOME200',
      image: 'https://picsum.photos/seed/welcome/800/600',
      color: 'bg-secondary'
    },
    {
      id: 3,
      title: 'Free Shipping',
      discount: 'FREE DELIVERY',
      description: 'Enjoy free delivery on all orders above ৳2000 across Bangladesh.',
      code: 'FREESHIP',
      image: 'https://picsum.photos/seed/shipping/800/600',
      color: 'bg-success'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <h1 className="text-5xl font-extrabold text-secondary">Exclusive Offers</h1>
        <p className="text-lg text-secondary/60">Grab the best deals on your favorite products before they're gone!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white rounded-premium shadow-xl overflow-hidden border border-secondary/5 group hover:shadow-2xl transition-all">
            <div className="h-64 relative overflow-hidden">
              <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className={`absolute top-4 right-4 ${offer.color} text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg`}>
                {offer.discount}
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-secondary">{offer.title}</h3>
                <p className="text-secondary/60 text-sm mt-2 leading-relaxed">{offer.description}</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-xl border border-dashed border-secondary/20">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/40">Promo Code</p>
                  <p className="text-lg font-mono font-bold text-secondary">{offer.code}</p>
                </div>
                <button className="text-primary font-bold hover:underline text-sm">Copy</button>
              </div>

              <Link 
                to="/products"
                className="w-full bg-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all group"
              >
                Shop Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Flash Sale Section */}
      <section className="mt-32 bg-secondary rounded-premium p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-primary text-sm font-bold uppercase tracking-widest">
              <Zap className="w-4 h-4 fill-current" /> Flash Sale
            </div>
            <h2 className="text-5xl font-extrabold leading-tight">Limited Time Midnight Madness!</h2>
            <p className="text-white/60 text-lg">Get up to 50% off on selected items. Offer valid until midnight tonight.</p>
            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <p className="text-4xl font-extrabold">08</p>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">Hours</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-extrabold">45</p>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-extrabold">12</p>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">Seconds</p>
              </div>
            </div>
            <Link 
              to="/products"
              className="inline-flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 group"
            >
              <ShoppingBag className="w-6 h-6" />
              Shop the Sale
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="hidden lg:block relative">
            <div className="w-full aspect-square bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Gift className="w-48 h-48 text-primary/40 animate-bounce" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
