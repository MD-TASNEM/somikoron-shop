import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, Clock } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <h1 className="text-5xl font-extrabold text-secondary">Contact Us</h1>
        <p className="text-lg text-secondary/60">Have questions about our products or your order? We're here to help you 24/7.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Info Cards */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 flex items-start gap-6 group hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary">Call Us</h3>
              <p className="text-secondary/60 text-sm mt-1">Available 10 AM - 10 PM</p>
              <a href="tel:01996570203" className="text-primary font-bold mt-2 block hover:underline">01996-570203</a>
            </div>
          </div>

          <div className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 flex items-start gap-6 group hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center text-success group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary">WhatsApp</h3>
              <p className="text-secondary/60 text-sm mt-1">Chat with our support team</p>
              <a href="https://wa.me/8801996570203" className="text-success font-bold mt-2 block hover:underline">+880 1996-570203</a>
            </div>
          </div>

          <div className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 flex items-start gap-6 group hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary">Location</h3>
              <p className="text-secondary/60 text-sm mt-1 leading-relaxed">
                Islamic university, Bangladesh Main gate, Jhenaidah, kushtia
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-10 rounded-premium shadow-xl border border-secondary/5">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <Send className="w-6 h-6 text-primary" /> Send us a Message
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-secondary/60">Full Name</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-secondary/60">Email Address</label>
              <input 
                type="email" 
                className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-secondary/60">Subject</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="How can we help?"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-secondary/60">Message</label>
              <textarea 
                className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all h-40"
                placeholder="Write your message here..."
              />
            </div>
            <div className="md:col-span-2">
              <button 
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
