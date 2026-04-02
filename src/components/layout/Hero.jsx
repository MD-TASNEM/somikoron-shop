"use client";

import { useRef } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function Hero() {
  const productsSectionRef = useRef(null);

  const scrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToWhatsApp = () => {
    window.open("https://wa.me/8801996570203", "_blank");
  };

  return (
    <>
      <section className="hero" id="home">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(231, 76, 60, 0.9), rgba(52, 73, 94, 0.9))",
            mixBlendMode: "multiply",
          }}
        />

        <div className="container relative z-10">
          <h1 className="text-white mb-5">সমীকরণ শপে স্বাগতম</h1>
          <p className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto opacity-90">
            আপনার সব ধরনের কাস্টমাইজড পণ্যের একমাত্র ঠিকানা। কাপ, প্লেট, ফটো
            ফ্রেম, নিকাহ নামা, কলম, স্কেল এবং আরও অনেক কিছু!
          </p>

          <div className="hero-btns flex gap-4 justify-center flex-wrap">
            <button
              onClick={scrollToProducts}
              className="btn hover:shadow-lg hover:-translate-y-1"
            >
              <ArrowRight className="h-4 w-4" />
              পণ্য দেখুন
            </button>

            <button
              onClick={scrollToWhatsApp}
              className="btn btn-whatsapp hover:shadow-lg hover:-translate-y-1"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp এ অর্ডার করুন
            </button>
          </div>
        </div>
      </section>

      <div ref={productsSectionRef} className="scroll-mt-16" />
    </>
  );
}
