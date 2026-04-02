'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';



const STATIC_CATEGORIES = [
  { name: 'photo-frames', nameBn: 'ফটো ফ্রেম', icon: '🖼️', count: 0 },
  { name: 'nikah-nama', nameBn: 'নিকাহ নামা', icon: '📜', count: 0 },
  { name: 'cups', nameBn: 'কাপ ও মগ', icon: '☕', count: 0 },
  { name: 'plates', nameBn: 'প্লেট', icon: '🍽️', count: 0 },
  { name: 'files', nameBn: 'ফাইল', icon: '📁', count: 0 },
  { name: 'pens', nameBn: 'কলম', icon: '✒️', count: 0 },
  { name: 'scales', nameBn: 'স্কেল', icon: '📏', count: 0 },
];



export default function CategoryFilter({ className = '' }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentCategory = searchParams.get('category') || '';

  const handleCategoryClick = (category) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (category === '') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    newParams.set('page', '1');
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-nowrap">
        {/* All Products */}
        <button
          onClick={() => handleCategoryClick('')}
          className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${currentCategory === ''
              ? 'bg-primary text-white border-primary shadow-md scale-105'
              : 'bg-white text-secondary border-medium-gray hover:border-primary hover:text-primary'
            }`}
        >
          🛍️ সব পণ্য
        </button>

        {STATIC_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${currentCategory === cat.name
                ? 'bg-primary text-white border-primary shadow-md scale-105'
                : 'bg-white text-secondary border-medium-gray hover:border-primary hover:text-primary'
              }`}
          >
            {cat.icon} {cat.nameBn}
          </button>
        ))}
      </div>

      {currentCategory && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-dark-gray">ফিল্টার:</span>
          <span className="text-sm font-semibold text-primary capitalize">
            {STATIC_CATEGORIES.find(c => c.name === currentCategory)?.nameBn || currentCategory}
          </span>
          <button
            onClick={() => handleCategoryClick('')}
            className="text-xs text-primary hover:underline"
          >
            ✕ সরান
          </button>
        </div>
      )}

      {`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}





export default function CategoryFilter({ className = '' }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentCategory = searchParams.get('category') || '';

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const db = await getDb();
      const productsCollection = db.collection('products');

      // Use aggregation to get distinct categories with counts
      const categoryData = await productsCollection.aggregate([
        {
          $match: {
            category: { $exists, $ne, $ne: '' }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            sampleProduct: { $first: '$$ROOT' }
          }
        },
        {
          $sort: { count: -1 } // Sort by most products
        },
        {
          $project: {
            name: '$_id',
            count: '$count',
            // Include a sample product for image/icon if needed
            hasBadge: { $ne: ['$sampleProduct.badge', null] },
            avgPrice: { $avg: '$sampleProduct.price' }
          }
        }
      ]);

      // Transform data
      const transformedCategories = categoryData.map((cat) => ({
        name));

      setCategories(transformedCategories);
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle category click
  const handleCategoryClick = (category) => {
    // Create new URLSearchParams
    const newParams = new URLSearchParams(searchParams.toString());

    if (category === '') {
      // Remove category parameter for "All Products"
      newParams.delete('category');
    } else {
      // Set or update category parameter
      newParams.set('category', category);
    }

    // Reset to first page when changing category
    newParams.set('page', '1');

    // Update URL
    const newUrl = `${pathname}?${newParams.toString()}`;
    router.push(newUrl);
  };

  // Render category pill
  const renderCategoryPill = (category) => {
    const isActive = currentCategory === category.name;
    const isAllProducts = category.name === '';

    return (
      <button
        onClick={() => handleCategoryClick(category.name)}
        className={`
          inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
          transition-all duration-200 ease-in-out
          whitespace-nowrap
          shrink-0
          ${isActive
            ? 'bg-primary text-white shadow-lg scale-105'
            : 'bg-white text-secondary border border-medium-gray hover:border-primary hover:text-primary hover:shadow-md'
          }
          ${isAllProducts
            ? 'border-2 border-primary font-semibold'
            : ''
          }
        `}
      >
        {/* Category Icon for popular categories */}
        {!isAllProducts && (
          <span className="mr-2">
            {category.name === 'electronics' && '📱'}
            {category.name === 'clothing' && '👕'}
            {category.name === 'home' && '🏠'}
            {category.name === 'books' && '📚'}
            {category.name === 'toys' && '🎮'}
            {category.name === 'beauty' && '💄'}
            {category.name === 'sports' && '⚽'}
            {category.name === 'food' && '🍔'}
          </span>
        )}

        {isAllProducts ? 'All Products' : category.name}</span>

        {/* Product count badge */}
        {!isAllProducts && (
          <span className={`
            ml-2 px-2 py-0.5 text-xs rounded-full
            ${isActive
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-600'
            }
          `}>
            {category.count}
          </span>
        )}
      </button>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="shrink-0">
              <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center py-4">
          <div className="text-red-500 mb-2">Error loading categories</div>
          <p className="text-dark-gray text-sm">{error}</p>
          <button
            onClick={fetchCategories}
            className="btn btn-primary mt-3 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-secondary">
          Shop by Category
        </h2>
        {categories.length > 0 && (
          <div className="text-sm text-dark-gray">
            {categories.reduce((sum, cat) => sum + cat.count, 0)} products
          </div>
        )}
      </div>

      {/* Category Pills Container */}
      <div className="relative">
        {/* Mobile Scroll Indicator */}
        <div className="lg:hidden absolute top-0 right-0 w-8 h-full bg-linear-to-l from-transparent via-white to-white z-10 pointer-events-none"></div>

        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide lg:overflow-x-visible lg:flex-wrap">
          {/* All Products Button */}
          <div className="shrink-0">
            {renderCategoryPill({
              name: '',
              count: categories.reduce((sum, cat) => sum + cat.count, 0)
            })}
          </div>

          {/* Category Pills */}
          {categories.map((category) => (
            <div key={category.name} className="shrink-0">
              {renderCategoryPill(category)}
            </div>
          ))}

          {/* Loading/Empty States */}
          {!loading && categories.length === 0 && (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="shrink-0">
                <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Category Info */}
      {currentCategory && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-red-600">Currently viewing:</span>
              <span className="text-sm font-bold text-red-700 capitalize">{currentCategory}</span>
            </div>
            <button
              onClick={() => handleCategoryClick('')}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      {`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Smooth scroll behavior for mobile */
        @media (max-width: 1024px) {
          .overflow-x-auto {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }
        }

        /* Category pill animations */
        .category-pill {
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        /* Active category highlight animation */
        .category-pill.active {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        /* Hover effects */
        .category-pill:hover {
          transform: translateY(-1px);
        }

        /* Focus styles for accessibility */
        .category-pill:focus {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion) {
          .category-pill {
            transition: none;
          }

          .category-pill:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
