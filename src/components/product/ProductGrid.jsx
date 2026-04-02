'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, ShoppingCart, Eye, Package, Search } from 'lucide-react';







export default function ProductGrid({ initialFilters = {}, className = '' }: ProductGridProps) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0,
    hasNext);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      
      // Add filter parameters
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.badge) queryParams.append('badge', filters.badge);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.inStock) queryParams.append('inStock', 'true');
      
      // Add pagination parameters
      queryParams.append('page', filters.page?.toString() || '1');
      queryParams.append('limit', filters.limit?.toString() || '20');

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('❌ Product fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and fetch on filter change
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  // Render skeleton loader
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-8"></div>
              <div className="h-8 bg-gray-200 rounded w-8"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <Package className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-secondary mb-2">No products found</h3>
      <p className="text-dark-gray text-center max-w-md">
        Try adjusting your filters or search terms to find what you're looking for.
      </p>
      <button
        onClick={() => handleFilterChange({})}
        className="mt-6 btn btn-outline"
      >
        Clear Filters
      </button>
    </div>
  );

  // Render product card
  const renderProductCard = (product) => {
    const discountPercentage = product.discountPercentage || 0;
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const isOutOfStock = product.stock <= 0;

    return (
      <div className="group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.images[0] || '/images/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
          
          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3">
              <span className={`inline-block px-3 py-1 text-xs font-bold text-white rounded-full ${
                product.badge === 'New' ? 'bg-green-500' :
                product.badge === 'Sale' ? 'bg-red-500' :
                product.badge === 'Featured' ? 'bg-accent' :
                'bg-primary'
              }`}>
                {product.badge}
              </span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-secondary mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {product.nameBn || product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-accent fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-dark-gray ml-1">
              {product.rating.toFixed(1)} ({product.reviewCount || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-secondary">
                ৳{product.price.toLocaleString('en-BD')}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  ৳{product.originalPrice?.toLocaleString('en-BD')}
                </span>
              )}
            </div>
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                // Add to cart functionality
                console.log('Add to cart:', product.id);
              }}
              disabled={isOutOfStock}
              className={`flex-1 btn ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">Add to Cart</span>
            </button>
            
            <a
              href={`/products/${product.slug}`}
              className="btn btn-outline flex items-center justify-center"
            >
              <Eye className="h-4 w-4" />
            </a>
          </div>

          {/* Stock Info */}
          <div className="mt-2 text-xs text-dark-gray">
            {isOutOfStock ? (
              <span className="text-red-500">Out of stock</span>
            ) : (
              Only {product.stock} left in stock</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange({ search)}
                className="w-full pl-10 pr-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange({ category)}
            className="px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Garden</option>
            <option value="books">Books</option>
            <option value="toys">Toys & Games</option>
          </select>

          {/* Sort */}
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => handleFilterChange({ sort)}
            className="px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          {/* In Stock Filter */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock || false}
              onChange={(e) => handleFilterChange({ inStock)}
              className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
            />
            <span className="text-sm text-secondary">In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mb-8">
        {loading ? (
          renderSkeleton()
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-500 mb-4">Error loading products</div>
            <p className="text-dark-gray">{error}</p>
            <button
              onClick={fetchProducts}
              className="btn btn-primary mt-4"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              
                {renderProductCard(product)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && products.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              const isCurrentPage = pageNum === pagination.currentPage;
              const isNearCurrent = Math.abs(pageNum - pagination.currentPage) <= 2;
              
              if (isNearCurrent || pageNum === 1 || pageNum === pagination.totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors duration-200 ${
                      isCurrentPage
                        ? 'bg-primary text-white'
                        : 'bg-white text-secondary hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              
              if (pageNum === 3 && pagination.currentPage > 5) {
                return <span key="dots">...</span>;
              }
              
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Results Info */}
      {!loading && !error && (
        <div className="text-center text-dark-gray text-sm mt-4">
          Showing {products.length} of {pagination.totalProducts} products
          {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
        </div>
      )}
    </div>
  );
}
