import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  Tag, 
  Percent,
  Gift,
  Search,
  Filter,
  X,
  Check,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    code: '',
    image: '',
    color: 'bg-primary',
    startDate: '',
    endDate: '',
    isActive: true,
    minOrderAmount: 0,
    maxDiscount: '',
    applicableProducts: [],
    applicableCategories: [],
    maxUsage: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/admin/offers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingOffer 
        ? `/api/admin/offers/${editingOffer._id}`
        : '/api/admin/offers';
      
      const method = editingOffer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchOffers();
        setShowModal(false);
        setEditingOffer(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving offer:', error);
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      discount: offer.discount,
      code: offer.code,
      image: offer.image,
      color: offer.color,
      startDate: new Date(offer.startDate).toISOString().split('T')[0],
      endDate: new Date(offer.endDate).toISOString().split('T')[0],
      isActive: offer.isActive,
      minOrderAmount: offer.minOrderAmount,
      maxDiscount: offer.maxDiscount || '',
      applicableProducts: offer.applicableProducts,
      applicableCategories: offer.applicableCategories,
      maxUsage: offer.maxUsage || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      try {
        await fetch(`/api/admin/offers/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await fetch(`/api/admin/offers/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOffers();
    } catch (error) {
      console.error('Error toggling offer:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount: '',
      code: '',
      image: '',
      color: 'bg-primary',
      startDate: '',
      endDate: '',
      isActive: true,
      minOrderAmount: 0,
      maxDiscount: '',
      applicableProducts: [],
      applicableCategories: [],
      maxUsage: ''
    });
  };

  const filteredOffers = offers.filter(offer =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (endDate) => new Date(endDate) < new Date();
  const isUpcoming = (startDate) => new Date(startDate) > new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Offer Management</h1>
          <p className="text-secondary/60 mt-1">Manage promotional offers and discounts</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingOffer(null);
            setShowModal(true);
          }}
          className="mt-4 sm:mt-0 bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Offer
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary/10 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search offers by title, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-secondary/40" />
            <span className="text-sm text-secondary/60">
              {filteredOffers.length} of {offers.length} offers
            </span>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer) => (
          <div key={offer._id} className="bg-white rounded-xl shadow-sm border border-secondary/10 overflow-hidden hover:shadow-lg transition-all">
            {/* Offer Header */}
            <div className="h-48 relative overflow-hidden">
              <img 
                src={offer.image || 'https://picsum.photos/seed/offer/400/300'} 
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-4 right-4 ${offer.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                {offer.discount}
              </div>
              <div className="absolute top-4 left-4 flex gap-2">
                {isExpired(offer.endDate) && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    Expired
                  </span>
                )}
                {isUpcoming(offer.startDate) && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                    Upcoming
                  </span>
                )}
                {!offer.isActive && !isExpired(offer.endDate) && (
                  <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-bold">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Offer Content */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-secondary mb-1">{offer.title}</h3>
                <p className="text-sm text-secondary/60 line-clamp-2">{offer.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-secondary/40" />
                  <span className="font-mono font-bold text-primary">{offer.code}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary/60">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}</span>
                </div>
                {offer.minOrderAmount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-secondary/60">
                    <TrendingUp className="w-4 h-4" />
                    <span>Min: ৳{offer.minOrderAmount}</span>
                  </div>
                )}
                {offer.usageCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-secondary/60">
                    <Users className="w-4 h-4" />
                    <span>Used {offer.usageCount} times</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-secondary/10">
                <button
                  onClick={() => handleEdit(offer)}
                  className="flex-1 bg-primary text-white py-2 rounded-lg font-medium flex items-center justify-center gap-1 hover:bg-primary-dark transition-all text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(offer._id)}
                  className={`p-2 rounded-lg transition-all ${
                    offer.isActive 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {offer.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(offer._id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-secondary">
                  {editingOffer ? 'Edit Offer' : 'Add New Offer'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-secondary/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Discount *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 20% or ৳500"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Color Theme
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="bg-primary">Primary</option>
                    <option value="bg-secondary">Secondary</option>
                    <option value="bg-success">Success</option>
                    <option value="bg-danger">Danger</option>
                    <option value="bg-warning">Warning</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Min Order Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Max Discount
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: parseFloat(e.target.value) || ''})}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">
                    Max Usage
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUsage}
                    onChange={(e) => setFormData({...formData, maxUsage: parseInt(e.target.value) || ''})}
                    className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-primary border-secondary/20 rounded focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-secondary">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all"
                >
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-secondary/10 text-secondary py-3 rounded-xl font-bold hover:bg-secondary/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffers;
