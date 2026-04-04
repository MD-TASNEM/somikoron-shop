import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { ArrowLeft, Save, Image, ShoppingBag, Plus, Trash2, AlertCircle, X } from 'lucide-react';
import { CATEGORIES } from '../../types';

export const AdminEditProduct = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [variantTypes, setVariantTypes] = useState(['Size']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = useAuthStore(state => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setFormData(response.data);
        
        // Derive variant types from existing variants
        if (response.data.variants && response.data.variants.length > 0) {
          const types = new Set();
          response.data.variants.forEach(v => {
            Object.keys(v.attributes || {}).forEach(k => types.add(k));
          });
          if (types.size > 0) {
            setVariantTypes(Array.from(types));
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...(formData.features || []), ''] });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const addVariantType = () => {
    setVariantTypes([...variantTypes, '']);
  };

  const removeVariantType = (index) => {
    const typeToRemove = variantTypes[index];
    setVariantTypes(variantTypes.filter((_, i) => i !== index));
    // Also remove this attribute from all variants
    setFormData({
      ...formData,
      variants: (formData.variants || []).map(v => {
        const newAttrs = { ...v.attributes };
        delete newAttrs[typeToRemove];
        return { ...v, attributes: newAttrs };
      })
    });
  };

  const handleVariantTypeChange = (index, value) => {
    const oldType = variantTypes[index];
    const newVariantTypes = [...variantTypes];
    newVariantTypes[index] = value;
    setVariantTypes(newVariantTypes);
    
    // Update attribute keys in variants
    setFormData({
      ...formData,
      variants: (formData.variants || []).map(v => {
        const newAttrs = { ...v.attributes };
        if (oldType && newAttrs[oldType] !== undefined) {
          newAttrs[value] = newAttrs[oldType];
          delete newAttrs[oldType];
        }
        return { ...v, attributes: newAttrs };
      })
    });
  };

  const addVariant = () => {
    const newVariant = {
      id: Math.random().toString(36).substr(2, 9),
      attributes: {},
      price: formData.price,
      stock: formData.stock
    };
    variantTypes.forEach(type => {
      if (type) newVariant.attributes[type] = '';
    });
    setFormData({ ...formData, variants: [...(formData.variants || []), newVariant] });
  };

  const removeVariant = (id) => {
    setFormData({ ...formData, variants: formData.variants.filter(v => v.id !== id) });
  };

  const handleVariantChange = (id, field, value, attrType = null) => {
    setFormData({
      ...formData,
      variants: formData.variants.map(v => {
        if (v.id === id) {
          if (attrType) {
            return { ...v, attributes: { ...v.attributes, [attrType]: value } };
          }
          return { ...v, [field]: value };
        }
        return v;
      })
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { _id, createdAt, ...updateData } = formData;
      const formattedVariants = (formData.variants || []).map(v => ({
        ...v,
        price: Number(v.price),
        stock: Number(v.stock)
      }));
      await axios.put(`/api/products/${id}`, {
        ...updateData,
        variants: formattedVariants,
        price: Number(formData.price),
        stock: Number(formData.stock)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <Link to="/admin/products" className="p-2 hover:bg-secondary/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-4xl font-extrabold text-secondary">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary/60">Product Name (English)</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary/60">Product Name (Bengali)</label>
                <input 
                  required
                  type="text"
                  value={formData.nameBn}
                  onChange={(e) => setFormData({...formData, nameBn: e.target.value})}
                  className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary/60">Price (৳)</label>
                <input 
                  required
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary/60">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-secondary/60">Description</label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32"
              />
            </div>
          </section>

          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center justify-between">
              <span className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Product Features</span>
              <button 
                type="button"
                onClick={addFeature}
                className="text-xs font-bold text-primary hover:underline"
              >
                + Add Feature
              </button>
            </h2>
            <div className="space-y-4">
              {(formData.features || []).map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <input 
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-grow px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-4 text-secondary/20 hover:text-error transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Variants Section */}
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Product Variants
              </h2>
              <button 
                type="button"
                onClick={addVariant}
                className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-6">
              {/* Variant Types Definition */}
              <div className="p-4 bg-secondary/5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Variant Types (e.g. Size, Color)</label>
                  <button type="button" onClick={addVariantType} className="text-primary text-xs font-bold">+ Add Type</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variantTypes.map((type, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-secondary/10">
                      <input 
                        type="text"
                        value={type}
                        onChange={(e) => handleVariantTypeChange(index, e.target.value)}
                        className="w-20 text-xs font-bold outline-none"
                        placeholder="Type"
                      />
                      <button type="button" onClick={() => removeVariantType(index)} className="text-error"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variants List */}
              <div className="space-y-4">
                {(formData.variants || []).map((variant) => (
                  <div key={variant.id} className="p-6 border border-secondary/10 rounded-2xl space-y-4 relative group">
                    <button 
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="absolute top-4 right-4 text-secondary/20 hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {variantTypes.map((type) => (
                        <div key={type} className="space-y-1">
                          <label className="text-[10px] font-bold text-secondary/40 uppercase">{type}</label>
                          <input 
                            type="text"
                            value={variant.attributes[type] || ''}
                            onChange={(e) => handleVariantChange(variant.id, null, e.target.value, type)}
                            className="w-full px-3 py-2 bg-secondary/5 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary/20"
                            placeholder={`e.g. ${type === 'Size' ? 'XL' : 'Red'}`}
                          />
                        </div>
                      ))}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-secondary/40 uppercase">Price (৳)</label>
                        <input 
                          type="number"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                          className="w-full px-3 py-2 bg-secondary/5 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-secondary/40 uppercase">Stock</label>
                        <input 
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)}
                          className="w-full px-3 py-2 bg-secondary/5 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!formData.variants || formData.variants.length === 0) && (
                  <div className="text-center py-8 border-2 border-dashed border-secondary/10 rounded-2xl">
                    <p className="text-sm text-secondary/40">No variants added. This product will use base price and stock.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" /> Product Image
            </h2>
            <div className="space-y-4">
              <label className="w-full aspect-[3/4] bg-secondary/5 rounded-2xl overflow-hidden border-2 border-dashed border-secondary/10 flex items-center justify-center relative group cursor-pointer hover:border-primary/50 transition-all">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden" 
                />
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center space-y-2 opacity-40 group-hover:opacity-60">
                    <Plus className="w-12 h-12 mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-widest">Click to Upload Image</p>
                  </div>
                )}
              </label>
              <div className="space-y-2">
                <label className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Or Image URL</label>
                <input 
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-premium shadow-sm border border-secondary/5 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-secondary/60">Stock Quantity</label>
              <input 
                required
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full px-6 py-4 bg-secondary/5 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-white py-5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              <Save className="w-6 h-6" />
              {saving ? 'Saving...' : 'Update Product'}
            </button>
          </section>
        </div>
      </form>
    </div>
  );
};
