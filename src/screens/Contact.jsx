import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle as WhatsAppIcon,
  Send,
  Mail as MailIcon,
  Navigation,
} from "lucide-react";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen pb-32">
      <main className="pt-24 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="mb-12">
          <h2 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight leading-tight mb-4">
            Connect with our <span className="text-primary">Atelier</span>
          </h2>
          <p className="text-secondary font-body leading-relaxed max-w-xs">
            Crafting meaningful connections. Our team is here to assist with
            your bespoke inquiries and orders.
          </p>
        </section>

        {/* Contact Cards - Heritage Editorial Style */}
        <div className="grid grid-cols-1 gap-6 mb-12">
          {/* WhatsApp Card */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_30px_rgba(44,62,80,0.04)] flex items-start gap-6 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <MessageCircle className="text-9xl" />
            </div>
            <div className="bg-success/10 p-4 rounded-full">
              <WhatsAppIcon className="text-success text-3xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-headline font-bold text-xl mb-1">WhatsApp</h3>
              <p className="text-secondary text-sm mb-4">
                Immediate support for active orders and quick questions.
              </p>
              <a
                href="https://wa.me/8801996570203"
                className="text-primary font-semibold tracking-wide hover:underline"
              >
                +880 1996-570203
              </a>
            </div>
          </div>

          {/* Hotline Card */}
          <div className="bg-surface-container-low p-8 rounded-xl flex items-start gap-6 hover:shadow-md transition-all">
            <div className="bg-primary/10 p-4 rounded-full">
              <Phone className="text-primary text-3xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-headline font-bold text-xl mb-1">Hotline</h3>
              <p className="text-secondary text-sm mb-4">
                Available Sat-Thu, 10 AM to 8 PM for voice assistance.
              </p>
              <a
                href="tel:01996570203"
                className="text-on-surface font-semibold tracking-wide hover:underline"
              >
                01996-570203
              </a>
            </div>
          </div>

          {/* Editorial Card */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_12px_30px_rgba(44,62,80,0.04)] border border-outline-variant/10 flex items-start gap-6 hover:shadow-md transition-all">
            <div className="bg-tertiary/10 p-4 rounded-full">
              <MailIcon className="text-tertiary text-3xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-headline font-bold text-xl mb-1">
                Editorial Inquiry
              </h3>
              <p className="text-secondary text-sm mb-4">
                For collaborations, wholesale, and creative partnerships.
              </p>
              <a
                href="mailto:atelier@somikoron.com"
                className="text-primary font-semibold tracking-wide hover:underline"
              >
                atelier@somikoron.com
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <section className="mb-12">
          <h3 className="font-headline font-bold text-2xl mb-8">
            Send Message
          </h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative">
              <input
                type="text"
                id="name"
                placeholder=" "
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="block w-full px-0 py-3 text-on-surface bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-primary peer transition-all duration-300 outline-none"
              />
              <label
                htmlFor="name"
                className="absolute text-sm text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-primary"
              >
                Full Name
              </label>
            </div>

            <div className="relative">
              <input
                type="email"
                id="email"
                placeholder=" "
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="block w-full px-0 py-3 text-on-surface bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-primary peer transition-all duration-300 outline-none"
              />
              <label
                htmlFor="email"
                className="absolute text-sm text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-primary"
              >
                Email Address
              </label>
            </div>

            <div className="relative">
              <textarea
                id="message"
                placeholder=" "
                rows="3"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="block w-full px-0 py-3 text-on-surface bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-primary peer transition-all duration-300 resize-none outline-none"
              />
              <label
                htmlFor="message"
                className="absolute text-sm text-secondary duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-primary"
              >
                Your Message
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#b1241a] to-[#d43e30] text-white font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
            >
              Submit Inquiry
            </button>
          </form>
        </section>

        {/* Atelier Location */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-headline font-bold text-2xl mb-1">
                Atelier Location
              </h3>
              <p className="text-secondary text-sm">
                Visit our flagship studio
              </p>
            </div>
            <a
              href="#"
              className="text-primary font-semibold text-sm flex items-center gap-1 hover:underline"
            >
              Get Directions <Navigation className="w-4 h-4" />
            </a>
          </div>

          <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-sm">
            <img
              className="w-full h-full object-cover grayscale opacity-80"
              alt="Atelier Location Map"
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 animate-pulse rounded-full"></div>
                <div className="relative bg-primary p-2 rounded-full border-4 border-white shadow-xl">
                  <MapPin className="text-white text-xl" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-3 rounded-lg border border-black/5">
              <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-0.5">
                Headquarters
              </p>
              <p className="text-xs font-semibold text-on-surface">
                Banani, Road 11, Dhaka
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/8801996570203"
        className="fixed bottom-24 right-6 z-50 w-16 h-16 bg-success rounded-full flex items-center justify-center shadow-[0_12px_30px_rgba(37,211,102,0.3)] active:scale-90 duration-200 hover:shadow-[0_16px_40px_rgba(37,211,102,0.4)] transition-all"
      >
        <WhatsAppIcon className="text-white text-3xl" />
      </a>
    </div>
  );
};

function MessageCircle(props) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
}
