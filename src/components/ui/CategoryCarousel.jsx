'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide, SwiperRef } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import Swiper styles
import 'swiper/css/bundle';



const categorySlides = [
  {
    id: '1',
    title: 'Personalized Gifts',
    description: 'Custom-made gifts for your loved ones with unique designs and personal touches.',
    image: '/images/categories/personalized-gifts.jpg',
    link: '/products?category=personalized-gifts'
  },
  {
    id: '2',
    title: 'Custom Products',
    description: 'Tailored products designed specifically for your needs and preferences.',
    image: '/images/categories/custom-products.jpg',
    link: '/products?category=custom-products'
  },
  {
    id: '3',
    title: 'Special Collections',
    description: 'Exclusive limited edition items and seasonal collections for discerning customers.',
    image: '/images/categories/special-collections.jpg',
    link: '/products?category=special-collections'
  }
];

export default function CategoryCarousel() {
  const swiperRef = useRef(null);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  const handleMouseEnter = () => {
    setIsAutoplayPaused(true);
    if (swiperRef.current) {
      swiperRef.current.swiper.autoplay.stop();
    }
  };

  const handleMouseLeave = () => {
    setIsAutoplayPaused(false);
    if (swiperRef.current) {
      swiperRef.current.swiper.autoplay.start();
    }
  };

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };

  return (
    <div 
      className="relative w-full overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Swiper Container */}
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction,
        }}
        pagination={{
          clickable,
          renderBullet: (index, className) => {
            return `<span class="!bg-white !opacity-100 ${className}"></span>`;
          },
        }}
        navigation={{
          prevEl: '.swiper-button-prev',
          nextEl: '.swiper-button-next',
        }}
        className="category-swiper"
        style={{
          '--swiper-pagination-bullet-size': '10px',
          '--swiper-pagination-bullet-horizontal-gap': '8px',
          '--swiper-pagination-color': 'rgba(255, 255, 255, 0.5)',
          '--swiper-pagination-bullet-inactive-color': 'rgba(255, 255, 255, 0.3)',
          '--swiper-pagination-bullet-active-color': '#ffffff',
        }((slide) => (
          
            <div className="relative w-full h-full">
              {/* Full-bleed Image */}
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  height: 'clamp(300px, 40vh, 500px)',
                  minHeight: '300px',
                  maxHeight: '500px'
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                />
                
                {/* Bottom Gradient Overlay */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                ></div>
              </div>

              {/* Text Panel */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="max-w-md mx-auto">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
                    {slide.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed opacity-90 mb-4">
                    {slide.description}
                  </p>
                  <a
                    href={slide.link}
                    className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    Shop Now</span>
                    <ChevronRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 z-20 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 transform transition-transform duration-300 group-hover:-translate-x-0.5" />
      </button>

      <button
        onClick={handleNext}
        className="swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 z-20 group"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>

      {/* Autoplay Pause Indicator */}
      {isAutoplayPaused && (
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium z-20">
          Paused
        </div>
      )}

      {/* Custom Styles */}
      {`
        .category-swiper {
          width: 100%;
          height: clamp(300px, 40vh, 500px);
        }

        .category-swiper .swiper-slide {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-swiper .swiper-pagination {
          bottom: 20px;
          z-index: 10;
        }

        .category-swiper .swiper-pagination-bullet {
          width: var(--swiper-pagination-bullet-size);
          height: var(--swiper-pagination-bullet-size);
          background: var(--swiper-pagination-bullet-inactive-color);
          opacity: var(--swiper-pagination-color);
          transition: all 0.3s ease;
          margin: 0 calc(var(--swiper-pagination-bullet-horizontal-gap) / 2);
        }

        .category-swiper .swiper-pagination-bullet-active {
          background: var(--swiper-pagination-bullet-active-color);
          opacity: 1;
          transform: scale(1.2);
        }

        .swiper-button-prev,
        .swiper-button-next {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .swiper-button-prev,
        .swiper-button-next:hover {
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        /* Hide default navigation buttons */
        .category-swiper .swiper-button-prev,
        .category-swiper .swiper-button-next {
          display: none;
        }

        /* Custom scrollbar for overflow content */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .swiper-button-prev,
          .swiper-button-next {
            width: 40px;
            height: 40px;
          }
          
          .category-swiper .swiper-pagination {
            bottom: 15px;
          }
        }
      `}</style>
    </div>
  );
}
