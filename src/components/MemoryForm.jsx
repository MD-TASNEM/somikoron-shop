import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, Save, Tag, Calendar, Hash, FileText, 
  AlertCircle, CheckCircle, Plus, X as CloseIcon
} from 'lucide-react';
import { MEMORY_CATEGORIES, MEMORY_PRIORITIES, memoryHelpers } from '../types/memoryTypes';

export const MemoryForm = ({ memory, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    tags: [],
    metadata: {}
  });
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Initialize form with memory data if editing
  useEffect(() => {
    if (memory) {
      setFormData({
        title: memory.title || '',
        content: memory.content || '',
        category: memory.category || 'general',
        priority: memory.priority || 'medium',
        tags: memory.tags || [],
        metadata: memory.metadata || {}
      });
      setCharCount(memory.content?.length || 0);
    }
  }, [memory]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Update character count for content
    if (field === 'content') {
      setCharCount(value.length);
    }
  };

  // Handle tag input
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Extract hashtags from content
  const extractHashtags = () => {
    const hashtags = memoryHelpers.extractHashtags(formData.content);
    const newTags = [...new Set([...formData.tags, ...hashtags])];
    setFormData(prev => ({
      ...prev,
      tags: newTags.slice(0, 10)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const validation = memoryHelpers.validateMemory(formData);
    
    if (!validation.isValid) {
      return validation.errors;
    }
    
    return {};
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = formData.content.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = memoryHelpers.getReadingTime(formData.content);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-secondary/10">
        <h2 className="text-2xl font-bold text-secondary">
          {memory ? 'Edit Memory' : 'Create Memory'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-secondary/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-secondary/60 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary/40" />
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.title ? 'border-red-500' : 'border-secondary/20'
              }`}
              placeholder="Enter memory title..."
              maxLength={200}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-secondary/40">
              {formData.title.length}/200
            </div>
          </div>
          {errors.title && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-secondary/60 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none ${
                errors.content ? 'border-red-500' : 'border-secondary/20'
              }`}
              placeholder="Write your memory content..."
              rows={8}
              maxLength={10000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-secondary/40">
              {charCount}/10,000
            </div>
          </div>
          {errors.content && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.content}
            </p>
          )}
          
          {/* Content Stats */}
          {formData.content && (
            <div className="mt-2 flex items-center gap-4 text-xs text-secondary/60">
              <span>{wordCount} words</span>
              <span>~{readingTime} min read</span>
              <button
                type="button"
                onClick={extractHashtags}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Hash className="w-3 h-3" />
                Extract hashtags
              </button>
            </div>
          )}
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary/60 mb-2">
              Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary/40" />
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                {MEMORY_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary/60 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MEMORY_PRIORITIES.map(priority => (
                <button
                  key={priority.id}
                  type="button"
                  onClick={() => handleChange('priority', priority.id)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    formData.priority === priority.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-secondary/20 hover:border-secondary/30'
                  }`}
                >
                  {priority.icon} {priority.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-secondary/60 mb-2">
            Tags <span className="text-xs text-secondary/40">(max 10)</span>
          </label>
          <div className="space-y-3">
            {/* Tag Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary/40" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Add tags (press Enter or comma)..."
                  maxLength={50}
                />
              </div>
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || formData.tags.length >= 10}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Tag List */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary/60 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <CloseIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Metadata (hidden fields) */}
        <div className="hidden">
          <input type="hidden" name="wordCount" value={wordCount} />
          <input type="hidden" name="characterCount" value={charCount} />
        </div>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-secondary/10">
        <div className="text-sm text-secondary/60">
          {memory ? 'Last updated: ' + memoryHelpers.formatDate(memory.updatedAt) : 'Creating new memory'}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title || !formData.content}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {memory ? 'Update' : 'Create'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryForm;
