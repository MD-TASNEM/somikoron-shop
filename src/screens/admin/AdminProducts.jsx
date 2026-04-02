import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { 
  Plus, Search, Edit2, Trash2, 
  ExternalLink, Filter, ChevronLeft, ChevronRight, 
  Package, AlertCircle, ShoppingBag 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          console.error('Expected array of products, got:', response.data);
          setProducts([]);
        }
      } catch (error) {
        if (!error.isWarmup) {
          console.error('Error fetching products:', error);
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-secondary">Product Management</h1>
          <p className="text-secondary/60 text-lg">Manage your inventory, prices, and categories.</p>
        </div>
        <Link 
          to="/admin/products/new" 
          className="px-8 py-4 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-premium shadow-sm border border-secondary/5 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <button className="px-6 py-3 bg-secondary/5 text-secondary rounded-xl font-bold flex items-center gap-2 hover:bg-secondary/10 transition-all">
          <Filter className="w-5 h-5" /> Filter
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-premium shadow-sm border border-secondary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/5 text-secondary/40 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-6">Product</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Price</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/5">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-secondary/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-secondary/5 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <p className="font-bold text-secondary text-sm">{product.name}</p>
                        <p className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest mt-1">ID: #{product._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-secondary/5 text-secondary rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-primary">৳{product.price}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center gap-1.5 text-success text-[10px] font-bold uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" /> Active
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link 
                        to={`/product/${product._id}`} 
                        target="_blank"
                        className="p-2 text-secondary/20 hover:text-primary transition-colors"
                        title="View Product"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/admin/products/${product._id}/edit`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-secondary/5 text-secondary hover:bg-secondary hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-secondary/20 hover:text-error transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="p-20 text-center space-y-4 opacity-40">
            <ShoppingBag className="w-16 h-16 mx-auto" />
            <p className="text-lg font-bold">No products found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="p-8 border-t border-secondary/5 flex items-center justify-between">
          <p className="text-xs text-secondary/40 font-bold uppercase tracking-widest">
            Showing {filteredProducts.length} of {products.length} Products
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-secondary/5 rounded-lg text-secondary/20 cursor-not-allowed">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 bg-secondary/5 rounded-lg text-secondary hover:bg-primary hover:text-white transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
