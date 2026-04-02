"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Camera, Heart, Coffee } from "lucide-react";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    title: "Customized Photo Frames",
    description:
      "Personalize your memories with our beautiful custom photo frames. Perfect for gifts and home decor.",
    category: "photo-frames",
    icon: Camera,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1544716278-e513176f20b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    title: "Elegant Nikah Nama Covers",
    description:
      "Beautifully crafted Nikah Nama covers for your special day. Custom designs available.",
    category: "nikah-nama",
    icon: Heart,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    title: "Personalized Cups & Mugs",
    description:
      "Start your day with a personalized touch. Our custom mugs make perfect gifts for any occasion.",
    category: "cups",
    icon: Coffee,
  },
];

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="carousel-section">
      <div className="container">
        <div className="carousel-container">
          <div
            className="carousel"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className="carousel-slide">
                <img src={slide.image} alt={slide.title} />
                <div className="slide-content">
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                  <a
                    href="#products"
                    data-category={slide.category}
                    className="btn"
                  >
                    <slide.icon className="h-4 w-4" />
                    Shop Now
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="carousel-controls">
            <button className="carousel-btn prev" onClick={prevSlide}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="carousel-btn next" onClick={nextSlide}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="carousel-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${currentSlide === index ? "active" : ""}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
