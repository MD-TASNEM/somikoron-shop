'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X, Plus, Trash2, Save, Eye, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  nameBn: z.string().max(200).optional(),
  slug: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  originalPrice: z.number().min(0).optional(),
  category: z.string().min(1, 'Category is required'),
  badge: z.string().max(50).optional(),
  stock: z.number().min(0, 'Stock must be positive'),
  description: z.string().min(1, 'Description is required'),
  descriptionBn: z.string().optional(),
  features: z.array(z.string()).optional(),
  featuresBn: z.array(z.string()).optional(),
  specifications: z.record(z.any()).optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().min(0).optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  tags: z.array(z.string()).optional(),
});

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [features, setFeatures] = useState(['']);
  const [featuresBn, setFeaturesBn] = useState(['']);
  const [specifications, setSpecifications] = useState({});
  const [tags, setTags] = useState([]);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', nameBn: '', price: 0, originalPrice: 0, category: '', badge: '',
      stock: 0, description: '', descriptionBn: '', features: [], featuresBn: [],
      specifications: {}, images: [], rating: 0, reviews: 0,
      seoTitle: '', seoDescription: '', tags: [],
    },
  });

  const watchedName = watch('name');

  useEffect(() => {
    if (watchedName) {
      const generatedSlug = watchedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
      setValue('slug', generatedSlug);
    }
  }, [watchedName, setValue]);

  useEffect(() => {
    const checkSlug = async () => {
      if (!slug) { setSlugError(null); return; }
      try {
        setCheckingSlug(true);
        const res = await fetch(`/api/products/check-slug?slug=${encodeURIComponent(slug)}`);
        const result = await res.json();
        setSlugError(result.exists ? 'This slug is already taken' : null);
      } catch { /* ignore */ } finally { setCheckingSlug(false); }
    };
    const t = setTimeout(checkSlug, 500);
    return () => clearTimeout(t);
  }, [slug]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/products/categories');
        const result = await res.json();
        if (result.success) setCategories(result.data.categories.map((c) => c.name));
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (file, isMainImage = false) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to upload image');
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to upload image');
      if (isMainImage) { setPreviewImage(result.data.url); setValue('image', result.data.url); }
      else { const imgs = [...previewImages, result.data.url]; setPreviewImages(imgs); setValue('images', imgs); }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload image');
    } finally { setUploading(false); }
  };

  const handleRemoveImage = (index, isMainImage = false) => {
    if (isMainImage) { setPreviewImage(null); setValue('image', ''); }
    else { const imgs = previewImages.filter((_, i) => i !== index); setPreviewImages(imgs); setValue('images', imgs); }
  };

  const addFeature = (isBengali = false) => {
    if (isBengali) setFeaturesBn([...featuresBn, '']);
    else setFeatures([...features, '']);
  };

  const updateFeature = (index, value, isBengali = false) => {
    if (isBengali) { const f = [...featuresBn]; f[index] = value; setFeaturesBn(f); setValue('featuresBn', f.filter(x => x.trim())); }
    else { const f = [...features]; f[index] = value; setFeatures(f); setValue('features', f.filter(x => x.trim())); }
  };

  const removeFeature = (index, isBengali = false) => {
    if (isBengali) { const f = featuresBn.filter((_, i) => i !== index); setFeaturesBn(f); setValue('featuresBn', f); }
    else { const f = features.filter((_, i) => i !== index); setFeatures(f); setValue('features', f); }
  };

  const addSpecification = () => {
    const newSpecs = { ...specifications, [`spec${Object.keys(specifications).length + 1}`]: '' };
    setSpecifications(newSpecs);
  };

  const updateSpecification = (key, value) => {
    const newSpecs = { ...specifications, [key]: value };
    setSpecifications(newSpecs); setValue('specifications', newSpecs);
  };

  const removeSpecification = (key) => {
    const newSpecs = { ...specifications }; delete newSpecs[key];
    setSpecifications(newSpecs); setValue('specifications', newSpecs);
  };

  const addTag = (tag) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      const t = [...tags, tag.trim()]; setTags(t); setValue('tags', t);
    }
  };

  const removeTag = (tag) => {
    const t = tags.filter(x => x !== tag); setTags(t); setValue('tags', t);
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true); setError(null);
      if (slugError) throw new Error('Please fix the slug error before submitting');
      const productData = {
        ...data, slug,
        features: features.filter(f => f.trim()),
        featuresBn: featuresBn.filter(f => f.trim()),
        specifications: Object.fromEntries(Object.entries(specifications).filter(([, v]) => v.trim())),
        tags, image: previewImage, images: previewImages,
      };
      const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) });
      if (!res.ok) { const r = await res.json(); throw new Error(r.message || 'Failed to create product'); }
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to create product');
      router.push('/admin/products?success=product-created');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-dark-gray">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/products" className="flex items-center space-x-2 text-dark-gray hover:text-primary transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" /><span>Back to Products</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary">Add New Product</h1>
            <p className="text-dark-gray">Create a new product for your store</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-secondary mb-6">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Product Name <span className="text-red-500">*</span></label>
                  <input type="text" {...register('name')} placeholder="Enter product name" className={`w-full px-4 py-3 border rounded-lg focus:ring-primary focus:border-primary ${errors.name ? 'border-red-500' : 'border-medium-gray'}`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Bengali Name (Optional)</label>
                  <input type="text" {...register('nameBn')} placeholder="পণ্যের বাংলা নাম" className="w-full px-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">URL Slug <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="product-url-slug" className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-primary focus:border-primary ${slugError ? 'border-red-500' : 'border-medium-gray'}`} />
                    {checkingSlug && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>}
                    {!checkingSlug && slug && !slugError && <div className="absolute right-3 top-1/2 -translate-y-1/2"><CheckCircle className="h-4 w-4 text-green-500" /></div>}
                  </div>
                  {slugError && <p className="text-red-500 text-xs mt-1">{slugError}</p>}
                  <p className="text-xs text-dark-gray mt-1">URL: /products/{slug}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Category <span className="text-red-500">*</span></label>
                  <select {...register('category')} className={`w-full px-4 py-3 border rounded-lg focus:ring-primary focus:border-primary ${errors.category ? 'border-red-500' : 'border-medium-gray'}`}>
                    <option value="">Select a category</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Badge (Optional)</label>
                  <input type="text" {...register('badge')} placeholder="New, Sale, Featured, etc." className="w-full px-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Selling Price <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-gray">৳</span>
                      <input type="number" {...register('price', { valueAsNumber: true })} placeholder="0.00" className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-primary focus:border-primary ${errors.price ? 'border-red-500' : 'border-medium-gray'}`} />
                    </div>
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Original Price (Optional)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-gray">৳</span>
                      <input type="number" {...register('originalPrice', { valueAsNumber: true })} placeholder="0.00" className="w-full pl-8 pr-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Stock Quantity <span className="text-red-500">*</span></label>
                  <input type="number" {...register('stock', { valueAsNumber: true })} placeholder="0" className={`w-full px-4 py-3 border rounded-lg focus:ring-primary focus:border-primary ${errors.stock ? 'border-red-500' : 'border-medium-gray'}`} />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Description <span className="text-red-500">*</span></label>
                  <textarea {...register('description')} rows={4} placeholder="Enter product description" className={`w-full px-4 py-3 border rounded-lg focus:ring-primary focus:border-primary resize-none ${errors.description ? 'border-red-500' : 'border-medium-gray'}`} />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Bengali Description (Optional)</label>
                  <textarea {...register('descriptionBn')} rows={4} placeholder="পণ্যের বাংলা বর্ণনা" className="w-full px-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary resize-none" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-secondary mb-6">Features</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">English Features</label>
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input type="text" value={feature} onChange={(e) => updateFeature(index, e.target.value)} placeholder="Enter feature" className="flex-1 px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                      <button type="button" onClick={() => removeFeature(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addFeature(false)} className="btn btn-outline text-sm"><Plus className="h-4 w-4 mr-1" />Add Feature</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Bengali Features (Optional)</label>
                  {featuresBn.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input type="text" value={feature} onChange={(e) => updateFeature(index, e.target.value, true)} placeholder="বৈশিষ্ট্য লিখুন" className="flex-1 px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                      <button type="button" onClick={() => removeFeature(index, true)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addFeature(true)} className="btn btn-outline text-sm"><Plus className="h-4 w-4 mr-1" />Add Bengali Feature</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-secondary mb-6">Specifications</h2>
              <div className="space-y-4">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input type="text" value={key} onChange={(e) => { const s = { ...specifications }; delete s[key]; s[e.target.value] = value; setSpecifications(s); }} placeholder="Specification name" className="flex-1 px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    <input type="text" value={value} onChange={(e) => updateSpecification(key, e.target.value)} placeholder="Specification value" className="flex-1 px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    <button type="button" onClick={() => removeSpecification(key)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={addSpecification} className="btn btn-outline text-sm"><Plus className="h-4 w-4 mr-1" />Add Specification</button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-secondary mb-6">Tags</h2>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-primary hover:text-primary-dark"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <input type="text" placeholder="Add tag and press Enter" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(e.currentTarget.value); e.currentTarget.value = ''; } }} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-secondary mb-6">Product Images</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Main Image <span className="text-red-500">*</span></label>
                  <div className="relative">
                    {previewImage ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image src={previewImage} alt="Product preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                        <button type="button" onClick={() => handleRemoveImage(0, true)} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg hover:bg-red-700"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <div className="w-full h-48 border-2 border-dashed border-medium-gray rounded-lg flex items-center justify-center">
                        <div className="text-center"><Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" /><p className="text-sm text-dark-gray">Upload main image</p></div>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, true); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Additional Images</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {previewImages.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image src={img} alt={`Product ${index + 1}`} fill className="object-cover" sizes="100px" />
                        <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="relative w-full h-24 border-2 border-dashed border-medium-gray rounded-lg flex items-center justify-center">
                    <div className="text-center"><Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" /><p className="text-xs text-dark-gray">Add more images</p></div>
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, false); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-secondary mb-6">SEO</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">SEO Title</label>
                  <input type="text" {...register('seoTitle')} placeholder="SEO title (max 60 chars)" className="w-full px-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">SEO Description</label>
                  <textarea {...register('seoDescription')} rows={3} placeholder="SEO description (max 160 chars)" className="w-full px-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary resize-none" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving || !!slugError} className="w-full btn btn-primary flex items-center justify-center space-x-2 disabled:opacity-50">
              {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div><span>Creating...</span></> : <><Save className="h-4 w-4" /><span>Create Product</span></>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
