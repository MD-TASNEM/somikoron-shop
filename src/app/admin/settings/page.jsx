'use client';

import { useState, useEffect } from 'react';
import {
  Settings, Save, Plus, Trash2, Edit, Download, Upload, Image, Link,
  Mail, Tag, Search, Filter, ChevronDown, ChevronUp, RefreshCw,
  AlertCircle, CheckCircle, X
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [siteSettings, setSiteSettings] = useState({
    siteName: '', siteNameBn: '', siteDescription: '', siteDescriptionBn: '',
    siteUrl: '', contactEmail: '', contactPhone: '', contactPhoneBn: '',
    contactAddress: '', contactAddressBn: '',
    socialMedia: { facebook: '', instagram: '', twitter: '', youtube: '', linkedin: '' },
    seo: { defaultTitle: '', defaultDescription: '', defaultKeywords: [], ogImage: '' },
    currency: { code: 'BDT', symbol: '৳', position: 'before' },
    tax: { enabled: true, rate: 15, included: false },
    shipping: { freeShippingThreshold: 1000, standardCost: 60, expressCost: 100 },
  });

  const [banners, setBanners] = useState([]);
  const [editingBanner, setEditingBanner] = useState(null);
  const [offers, setOffers] = useState([]);
  const [editingOffer, setEditingOffer] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [seoPages, setSeoPages] = useState({});

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true); setError(null);
      const [sRes, bRes, oRes, nRes, seoRes] = await Promise.all([
        fetch('/api/admin/settings/general'), fetch('/api/admin/settings/banners'),
        fetch('/api/admin/settings/offers'), fetch('/api/admin/settings/newsletter'),
        fetch('/api/admin/settings/seo'),
      ]);
      const [sR, bR, oR, nR, seoR] = await Promise.all([sRes.json(), bRes.json(), oRes.json(), nRes.json(), seoRes.json()]);
      if (sR.success) setSiteSettings(sR.data);
      if (bR.success) setBanners(bR.data);
      if (oR.success) setOffers(oR.data);
      if (nR.success) setSubscribers(nR.data);
      if (seoR.success) setSeoPages(seoR.data);
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    try {
      setSaving(true); setError(null);
      const res = await fetch('/api/admin/settings/general', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteSettings) });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to save settings');
      setSuccess('General settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally { setSaving(false); }
  };

  const handleSaveBanner = async (banner) => {
    try {
      setSaving(true); setError(null);
      const url = editingBanner?._id ? `/api/admin/settings/banners/${editingBanner._id}` : '/api/admin/settings/banners';
      const res = await fetch(url, { method: editingBanner?._id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(banner) });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to save banner');
      await fetchSettings(); setEditingBanner(null);
      setSuccess('Banner saved successfully'); setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save banner');
    } finally { setSaving(false); }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      setSaving(true); setError(null);
      const res = await fetch(`/api/admin/settings/banners/${bannerId}`, { method: 'DELETE' });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to delete banner');
      await fetchSettings(); setSuccess('Banner deleted successfully'); setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete banner');
    } finally { setSaving(false); }
  };

  const handleSaveOffer = async (offer) => {
    try {
      setSaving(true); setError(null);
      const url = editingOffer?._id ? `/api/admin/settings/offers/${editingOffer._id}` : '/api/admin/settings/offers';
      const res = await fetch(url, { method: editingOffer?._id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(offer) });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to save offer');
      await fetchSettings(); setEditingOffer(null);
      setSuccess('Offer saved successfully'); setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save offer');
    } finally { setSaving(false); }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      setSaving(true); setError(null);
      const res = await fetch(`/api/admin/settings/offers/${offerId}`, { method: 'DELETE' });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to delete offer');
      await fetchSettings(); setSuccess('Offer deleted successfully'); setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete offer');
    } finally { setSaving(false); }
  };

  const handleExportSubscribers = async () => {
    try {
      setSaving(true); setError(null);
      const res = await fetch('/api/admin/settings/newsletter/export');
      if (!res.ok) throw new Error('Failed to export subscribers');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none'; a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
      setSuccess('Subscribers exported successfully'); setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export subscribers');
    } finally { setSaving(false); }
  };

  const handleSaveSEO = async () => {
    try {
      setSaving(true); setError(null);
      const res = await fetch('/api/admin/settings/seo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(seoPages) });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || 'Failed to save SEO settings');
      setSuccess('SEO settings saved successfully'); setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save SEO settings');
    } finally { setSaving(false); }
  };

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-dark-gray">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Settings</h1>
          <p className="text-dark-gray">Manage your store configuration</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-medium-gray">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'general', label: 'General', icon: Settings },
              { id: 'banners', label: 'Homepage Banners', icon: Image },
              { id: 'offers', label: 'Offers', icon: Tag },
              { id: 'newsletter', label: 'Newsletter', icon: Mail },
              { id: 'seo', label: 'SEO', icon: Search },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-dark-gray hover:text-secondary'}`}>
                <div className="flex items-center space-x-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Site Name</label>
                      <input type="text" value={siteSettings.siteName} onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Site Name (Bangla)</label>
                      <input type="text" value={siteSettings.siteNameBn || ''} onChange={(e) => setSiteSettings({...siteSettings, siteNameBn: e.target.value})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Site Description</label>
                      <textarea value={siteSettings.siteDescription} onChange={(e) => setSiteSettings({...siteSettings, siteDescription: e.target.value})} rows={3} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Site URL</label>
                      <input type="url" value={siteSettings.siteUrl} onChange={(e) => setSiteSettings({...siteSettings, siteUrl: e.target.value})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Contact Email</label>
                      <input type="email" value={siteSettings.contactEmail} onChange={(e) => setSiteSettings({...siteSettings, contactEmail: e.target.value})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Contact Phone</label>
                      <input type="tel" value={siteSettings.contactPhone} onChange={(e) => setSiteSettings({...siteSettings, contactPhone: e.target.value})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Contact Address</label>
                      <textarea value={siteSettings.contactAddress} onChange={(e) => setSiteSettings({...siteSettings, contactAddress: e.target.value})} rows={3} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary resize-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-4">Social Media</h3>
                  <div className="space-y-4">
                    {['facebook', 'instagram', 'twitter', 'youtube'].map((platform) => (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-secondary mb-2 capitalize">{platform}</label>
                        <input type="url" value={siteSettings.socialMedia[platform] || ''} onChange={(e) => setSiteSettings({...siteSettings, socialMedia: {...siteSettings.socialMedia, [platform]: e.target.value}})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-4">Currency</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Currency Code</label>
                      <input type="text" value={siteSettings.currency.code} onChange={(e) => setSiteSettings({...siteSettings, currency: {...siteSettings.currency, code: e.target.value}})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Currency Symbol</label>
                      <input type="text" value={siteSettings.currency.symbol || '৳'} onChange={(e) => setSiteSettings({...siteSettings, currency: {...siteSettings.currency, symbol: e.target.value}})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Symbol Position</label>
                      <select value={siteSettings.currency.position} onChange={(e) => setSiteSettings({...siteSettings, currency: {...siteSettings.currency, position: e.target.value}})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary">
                        <option value="before">Before</option>
                        <option value="after">After</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-4">Tax & Shipping</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="taxEnabled" checked={siteSettings.tax.enabled} onChange={(e) => setSiteSettings({...siteSettings, tax: {...siteSettings.tax, enabled: e.target.checked}})} className="w-4 h-4 text-primary border-primary focus:ring-primary" />
                      <label htmlFor="taxEnabled" className="text-sm font-medium text-secondary">Enable Tax</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Tax Rate (%)</label>
                      <input type="number" value={siteSettings.tax.rate} onChange={(e) => setSiteSettings({...siteSettings, tax: {...siteSettings.tax, rate: parseFloat(e.target.value)}})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Free Shipping Threshold</label>
                      <input type="number" value={siteSettings.shipping.freeShippingThreshold} onChange={(e) => setSiteSettings({...siteSettings, shipping: {...siteSettings.shipping, freeShippingThreshold: parseFloat(e.target.value)}})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSaveGeneralSettings} disabled={saving} className="btn btn-primary flex items-center space-x-2 disabled:opacity-50">
                  {saving ? <><RefreshCw className="h-4 w-4 animate-spin" /><span>Saving...</span></> : <><Save className="h-4 w-4" /><span>Save Settings</span></>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-secondary">Homepage Banners</h3>
                <button onClick={() => setEditingBanner({ title: '', titleBn: '', subtitle: '', subtitleBn: '', image: '', link: '', buttonText: '', buttonTextBn: '', isActive: true, order: banners.length })} className="btn btn-primary flex items-center space-x-2">
                  <Plus className="h-4 w-4" /><span>Add Banner</span>
                </button>
              </div>
              {editingBanner && (
                <div className="bg-light-bg rounded-lg p-6">
                  <h4 className="font-medium text-secondary mb-4">{editingBanner._id ? 'Edit Banner' : 'Add New Banner'}</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[['title', 'Title', 'text'], ['titleBn', 'Title (Bangla)', 'text'], ['subtitle', 'Subtitle', 'text'], ['subtitleBn', 'Subtitle (Bangla)', 'text'], ['image', 'Image URL', 'url'], ['link', 'Link', 'url'], ['buttonText', 'Button Text', 'text'], ['buttonTextBn', 'Button Text (Bangla)', 'text']].map(([field, label, type]) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-secondary mb-2">{label}</label>
                        <input type={type} value={editingBanner[field] || ''} onChange={(e) => setEditingBanner({...editingBanner, [field]: e.target.value})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="bannerActive" checked={editingBanner.isActive} onChange={(e) => setEditingBanner({...editingBanner, isActive: e.target.checked})} className="w-4 h-4 text-primary border-primary focus:ring-primary" />
                      <label htmlFor="bannerActive" className="text-sm font-medium text-secondary">Active</label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button onClick={() => setEditingBanner(null)} className="btn btn-outline">Cancel</button>
                    <button onClick={() => handleSaveBanner(editingBanner)} disabled={saving} className="btn btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Banner'}</button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {banners.sort((a, b) => a.order - b.order).map((banner) => (
                  <div key={banner._id} className="bg-light-bg rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-secondary">{banner.title}</h4>
                        {banner.titleBn && <p className="text-sm text-dark-gray">{banner.titleBn}</p>}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${banner.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{banner.isActive ? 'Active' : 'Inactive'}</span>
                          <span className="text-xs text-dark-gray">Order: {banner.order}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setEditingBanner(banner)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteBanner(banner._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'offers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-secondary">Offers & Promotions</h3>
                <button onClick={() => setEditingOffer({ title: '', titleBn: '', description: '', descriptionBn: '', type: 'percentage', value: 0, startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], isActive: true })} className="btn btn-primary flex items-center space-x-2">
                  <Plus className="h-4 w-4" /><span>Add Offer</span>
                </button>
              </div>
              {editingOffer && (
                <div className="bg-light-bg rounded-lg p-6">
                  <h4 className="font-medium text-secondary mb-4">{editingOffer._id ? 'Edit Offer' : 'Add New Offer'}</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Title</label>
                      <input type="text" value={editingOffer.title} onChange={(e) => setEditingOffer({...editingOffer, title: e.target.value})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Title (Bangla)</label>
                      <input type="text" value={editingOffer.titleBn || ''} onChange={(e) => setEditingOffer({...editingOffer, titleBn: e.target.value})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Description</label>
                      <textarea value={editingOffer.description} onChange={(e) => setEditingOffer({...editingOffer, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Type</label>
                      <select value={editingOffer.type} onChange={(e) => setEditingOffer({...editingOffer, type: e.target.value})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary">
                        <option value="percentage">Percentage Discount</option>
                        <option value="fixed">Fixed Amount</option>
                        <option value="buy-one-get-one">Buy One Get One</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Value</label>
                      <input type="number" value={editingOffer.value} onChange={(e) => setEditingOffer({...editingOffer, value: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Start Date</label>
                      <input type="date" value={editingOffer.startDate} onChange={(e) => setEditingOffer({...editingOffer, startDate: e.target.value})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">End Date</label>
                      <input type="date" value={editingOffer.endDate} onChange={(e) => setEditingOffer({...editingOffer, endDate: e.target.value})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="offerActive" checked={editingOffer.isActive} onChange={(e) => setEditingOffer({...editingOffer, isActive: e.target.checked})} className="w-4 h-4 text-primary border-primary focus:ring-primary" />
                      <label htmlFor="offerActive" className="text-sm font-medium text-secondary">Active</label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button onClick={() => setEditingOffer(null)} className="btn btn-outline">Cancel</button>
                    <button onClick={() => handleSaveOffer(editingOffer)} disabled={saving} className="btn btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Offer'}</button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div key={offer._id} className="bg-light-bg rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-secondary">{offer.title}</h4>
                        <p className="text-sm text-dark-gray mt-1">{offer.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${offer.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{offer.isActive ? 'Active' : 'Inactive'}</span>
                          <span className="text-xs text-dark-gray capitalize">{offer.type}</span>
                          <span className="text-xs text-dark-gray">{offer.type === 'percentage' ? `${offer.value}%` : `৳${offer.value}`}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setEditingOffer(offer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteOffer(offer._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'newsletter' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-secondary">Newsletter Subscribers</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search subscribers..." className="pl-10 pr-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                  </div>
                  <button onClick={handleExportSubscribers} disabled={saving} className="btn btn-outline flex items-center space-x-2 disabled:opacity-50">
                    {saving ? <><RefreshCw className="h-4 w-4 animate-spin" /><span>Exporting...</span></> : <><Download className="h-4 w-4" /><span>Export CSV</span></>}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-medium-gray bg-light-bg">
                      <th className="text-left py-3 px-4 font-medium text-dark-gray">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-dark-gray">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-dark-gray">Subscribed</th>
                      <th className="text-left py-3 px-4 font-medium text-dark-gray">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber._id} className="border-b border-medium-gray">
                        <td className="py-3 px-4"><div className="flex items-center space-x-2"><Mail className="h-4 w-4 text-gray-400" /><span className="text-sm text-dark-gray">{subscriber.email}</span></div></td>
                        <td className="py-3 px-4"><span className="text-sm text-dark-gray">{subscriber.name || 'N/A'}</span></td>
                        <td className="py-3 px-4"><span className="text-sm text-dark-gray">{new Date(subscriber.subscribedAt).toLocaleDateString('en-BD')}</span></td>
                        <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full ${subscriber.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{subscriber.isActive ? 'Active' : 'Inactive'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredSubscribers.length === 0 && (
                <div className="text-center py-8"><Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-dark-gray">No subscribers found</p></div>
              )}
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary">SEO Settings</h3>
              <div className="space-y-6">
                {Object.entries(seoPages).map(([page, settings]) => (
                  <div key={page} className="bg-light-bg rounded-lg p-6">
                    <h4 className="font-medium text-secondary mb-4 capitalize">{page} Page SEO</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Title</label>
                        <input type="text" value={settings?.title || ''} onChange={(e) => setSeoPages({...seoPages, [page]: {...settings, title: e.target.value}})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Description</label>
                        <textarea value={settings?.description || ''} onChange={(e) => setSeoPages({...seoPages, [page]: {...settings, description: e.target.value}})} rows={3} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary resize-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Keywords (comma separated)</label>
                        <input type="text" value={settings?.keywords?.join(', ') || ''} onChange={(e) => setSeoPages({...seoPages, [page]: {...settings, keywords: e.target.value.split(',').map(k => k.trim())}})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">OG Image URL</label>
                        <input type="url" value={settings?.ogImage || ''} onChange={(e) => setSeoPages({...seoPages, [page]: {...settings, ogImage: e.target.value}})} className="w-full px-4 py-2 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={handleSaveSEO} disabled={saving} className="btn btn-primary flex items-center space-x-2 disabled:opacity-50">
                  {saving ? <><RefreshCw className="h-4 w-4 animate-spin" /><span>Saving...</span></> : <><Save className="h-4 w-4" /><span>Save SEO Settings</span></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
