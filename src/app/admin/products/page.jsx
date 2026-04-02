'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Package,
  Tag,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkCategory, setBulkCategory] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products and categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, debouncedSearch, categoryFilter]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (categoryFilter) params.set('category', categoryFilter);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const newUrl = `/admin/products${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl);
  }, [searchTerm, categoryFilter, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }

      if (categoryFilter) {
        params.set('category', categoryFilter);
      }

      console.log('🔍 Fetching products with params:', params.toString());

      const response = await fetch(`/api/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch products');
      }

      setProducts(result.data.products);
      setTotalPages(result.data.pages);
      setTotalProducts(result.data.total);
      setHasNext(result.data.hasNext);
      setHasPrev(result.data.hasPrev);

      console.log('✅ Products fetched successfully:', {
        total: result.data.total
      });
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories');

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const result = await response.json();

      if (result.success) {
        setCategories(result.data.categories);
      }

    } catch (err) {
      console.error('❌ Error fetching categories:', err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(productId);

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete product');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete product');
      }

      // Refresh products
      await fetchProducts();

      console.log('✅ Product deleted successfully');

    } catch (err) {
      console.error('❌ Error deleting product:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch('/api/products/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productIds: selectedProducts })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete products');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete products');
      }

      // Refresh products and reset selection
      await fetchProducts();
      setSelectedProducts([]);
      setShowBulkActions(false);
      setBulkAction('');

      console.log('✅ Products deleted successfully');

    } catch (err) {
      console.error('❌ Error deleting products:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete products');
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkCategoryChange = async () => {
    if (selectedProducts.length === 0 || !bulkCategory) return;

    try {
      setUpdating(true);

      const response = await fetch('/api/products/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productIds: selectedProducts })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to update products');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update products');
      }

      // Refresh products and reset selection
      await fetchProducts();
      setSelectedProducts([]);
      setShowBulkActions(false);
      setBulkAction('');
      setBulkCategory('');

      console.log('✅ Products updated successfully');

    } catch (err) {
      console.error('❌ Error updating products:', err);
      alert(err instanceof Error ? err.message : 'Failed to update products');
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    await fetchCategories();
    setRefreshing(false);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent border-r-transparent border-b-transparent mx-auto mb-4"></div>
          <p className="text-lg text-dark-gray">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Products</h1>
          <p className="text-dark-gray">
            {totalProducts > 0
              ? `Manage your ${totalProducts} products`
              : 'No products found'
            }
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link href="/admin/products/new" className="btn btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, slug, or description..."
                className="w-full pl-10 pr-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-dark-gray">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </span>

              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary text-sm"
              >
                <option value="">Choose action...</option>
                <option value="delete">Delete</option>
                <option value="category">Change Category</option>
              </select>

              {bulkAction === 'category' && (
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="px-3 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary text-sm"
                >
                  <option value="">Select category...</option>
                  {categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (bulkAction === 'delete') {
                    handleBulkDelete();
                  } else if (bulkAction === 'category' && bulkCategory) {
                    handleBulkCategoryChange();
                  }
                }}
                disabled={updating || (bulkAction === 'category' && !bulkCategory)}
                className="btn btn-primary text-sm disabled:opacity-50"
              >
                {updating ? 'Processing...' : 'Apply'}
              </button>

              <button
                onClick={() => {
                  setSelectedProducts([]);
                  setBulkAction('');
                  setBulkCategory('');
                }}
                className="btn btn-outline text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary mb-2">Error Loading Products</h3>
            <p className="text-dark-gray mb-6">{error}</p>
            <button
              onClick={fetchProducts}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-secondary mb-2">No Products Found</h3>
            <p className="text-dark-gray mb-6">
              {searchTerm || categoryFilter
                ? 'No products match your current filters.'
                : 'You haven\'t added any products yet.'
              }
            </p>
            <div className="space-y-3">
              {(searchTerm || categoryFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('');
                  }}
                  className="btn btn-outline"
                >
                  Clear Filters
                </button>
              )}
              <Link href="/admin/products/new" className="btn btn-primary">
                Add Product
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="border-b border-medium-gray p-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary border-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-dark-gray">
                    Select all ({products.length})
                  </span>
                </label>

                <div className="text-sm text-dark-gray">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalProducts)} of {totalProducts} products
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-medium-gray bg-light-bg">
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-dark-gray">Category</th>
                    <th className="text-center py-3 px-4 font-medium text-dark-gray">Price</th>
                    <th className="text-center py-3 px-4 font-medium text-dark-gray">Stock</th>
                    <th className="text-center py-3 px-4 font-medium text-dark-gray">Rating</th>
                    <th className="text-center py-3 px-4 font-medium text-dark-gray">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-medium-gray hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleSelectProduct(product._id)}
                            className="w-4 h-4 text-primary border-primary focus:ring-primary"
                          />
                          <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={product.image || '/images/placeholder-product.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-secondary truncate">
                              {product.nameBn || product.name}
                            </h3>
                            <p className="text-sm text-dark-gray truncate">{product.slug}</p>
                            {product.badge && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-600">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div>
                          <div className="font-medium text-primary">
                            ৳{product.price.toLocaleString('en-BD')}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-xs text-gray-400 line-through">
                              ৳{product.originalPrice.toLocaleString('en-BD')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.stock === 0
                          ? 'bg-red-100 text-red-600'
                          : product.stock < 10
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-green-100 text-green-600'
                          }`}>
                          {product.stock === 0 ? 'Out of Stock' : product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-accent fill-current' : 'text-gray-300'}`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462a1 1 0 00.95-.69l1.07-3.292a1 1 0 00-1.902 0l-1.07 3.292a1 1 0 101.902 0l-1.07-3.292a1 1 0 00-.95-.69H4.5a1 1 0 00-.95.69l-1.07 3.292a1 1 0 101.902 0l1.07-3.292a1 1 0 00.95.69z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-dark-gray">
                            ({product.reviews})
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/products/${product.slug}`}
                            className="p-2 text-primary hover:text-primary-dark hover:bg-primary/10 rounded-lg transition-colors duration-200"
                            title="View Product"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product._id}/edit`}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            disabled={deleting === product._id}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            title="Delete Product"
                          >
                            {deleting === product._id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-medium-gray p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <div className="text-sm text-dark-gray">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalProducts)} of {totalProducts} products
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPrev}
                      className={`p-2 rounded-lg transition-colors duration-200 ${hasPrev
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-gray-300 cursor-not-allowed'
                        }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-200 ${currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'text-dark-gray hover:bg-gray-100'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNext}
                      className={`p-2 rounded-lg transition-colors duration-200 ${hasNext
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-gray-300 cursor-not-allowed'
                        }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
