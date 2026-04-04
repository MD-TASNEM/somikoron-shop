import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, Filter, SortAsc, MoreVertical, 
  Pin, Archive, Trash2, Edit, Eye, Download,
  Grid, List, Calendar, Tag, Star, BarChart3,
  X, Check, ChevronDown, RefreshCw, Loader2
} from 'lucide-react';
import { useMemoryStore, useMemoryActions, useMemoryData, useMemoryFilters } from '../store/memoryStore';
import { MEMORY_CATEGORIES, MEMORY_PRIORITIES, MEMORY_SORT_OPTIONS, memoryHelpers } from '../types/memoryTypes';
import { MemoryCard } from './MemoryCard';
import { MemoryForm } from './MemoryForm';
import { MemoryAnalytics } from './MemoryAnalytics';
import { toast } from 'react-toastify';

export const MemoryManager = () => {
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [viewingMemory, setViewingMemory] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const {
    memories,
    loading,
    error,
    pagination,
    analytics,
    selectedMemories,
    bulkActionMode
  } = useMemoryData();
  
  const {
    setFilters,
    setSort,
    fetchMemories,
    clearError,
    toggleMemorySelection,
    selectAllMemories,
    clearSelection,
    setBulkActionMode
  } = useMemoryFilters();
  
  const {
    createMemory,
    updateMemory,
    deleteMemory,
    toggleMemoryPin,
    toggleMemoryArchive,
    performBulkAction,
    exportMemories
  } = useMemoryActions();

  // Initialize data
  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  // Handle search with suggestions
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setFilters({ search: query });
    
    if (query.length >= 2) {
      try {
        const result = await fetch('/api/memories/suggestions?q=' + encodeURIComponent(query));
        const data = await result.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle memory actions
  const handleCreateMemory = async (memoryData) => {
    try {
      await createMemory(memoryData);
      setShowForm(false);
      toast.success('Memory created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create memory');
    }
  };

  const handleUpdateMemory = async (memoryData) => {
    try {
      await updateMemory(editingMemory._id, memoryData);
      setShowForm(false);
      setEditingMemory(null);
      toast.success('Memory updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update memory');
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      try {
        await deleteMemory(memoryId);
        toast.success('Memory deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete memory');
      }
    }
  };

  const handleTogglePin = async (memoryId, isPinned) => {
    try {
      await toggleMemoryPin(memoryId, isPinned);
      toast.success(`Memory ${isPinned ? 'pinned' : 'unpinned'} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle pin');
    }
  };

  const handleToggleArchive = async (memoryId, isArchived) => {
    try {
      await toggleMemoryArchive(memoryId, isArchived);
      toast.success(`Memory ${isArchived ? 'archived' : 'unarchived'} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle archive');
    }
  };

  const handleBulkAction = async (action, data = {}) => {
    try {
      await performBulkAction(action, data);
      toast.success(`Bulk ${action} completed successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to perform bulk action');
    }
  };

  const handleExport = async (format) => {
    try {
      await exportMemories(format);
      toast.success(`Memories exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to export memories');
    }
  };

  const handleRefresh = () => {
    fetchMemories();
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      priority: 'all',
      status: 'active',
      tags: [],
      dateFrom: null,
      dateTo: null
    });
    setSearchQuery('');
  };

  // Filter memories based on current filters
  const filteredMemories = memories.filter(memory => {
    if (pagination.status === 'active' && memory.isArchived) return false;
    if (pagination.status === 'archived' && !memory.isArchived) return false;
    if (pagination.status === 'pinned' && !memory.isPinned) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-secondary/5 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary mb-2">Memory Manager</h1>
            <p className="text-secondary/60">Organize and manage your personal memories</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary/20 rounded-lg hover:bg-secondary/5 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary/20 rounded-lg hover:bg-secondary/5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Memory
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Panel */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-7xl mx-auto mb-6"
          >
            <MemoryAnalytics onClose={() => setShowAnalytics(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-secondary/10 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary/40" />
                <input
                  type="text"
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary/20 rounded-lg shadow-lg z-10">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-secondary/5 cursor-pointer border-b border-secondary/10 last:border-b-0"
                      onClick={() => {
                        setSearchQuery(suggestion.title);
                        setFilters({ search: suggestion.title });
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      <div className="text-xs text-secondary/60 truncate">{suggestion.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-secondary/10 text-secondary/60'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'bg-secondary/10 text-secondary/60'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filters.category !== 'all' || filters.priority !== 'all' || filters.status !== 'active') && (
                <span className="w-2 h-2 bg-primary rounded-full" />
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort.id}
                onChange={(e) => setSort(MEMORY_SORT_OPTIONS.find(opt => opt.id === e.target.value))}
                className="appearance-none bg-secondary/10 border border-secondary/20 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {MEMORY_SORT_OPTIONS.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <SortAsc className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary/40 pointer-events-none" />
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-secondary/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-secondary/60 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ category: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="all">All Categories</option>
                      {MEMORY_CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-sm font-medium text-secondary/60 mb-2">Priority</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters({ priority: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="all">All Priorities</option>
                      {MEMORY_PRIORITIES.map(priority => (
                        <option key={priority.id} value={priority.id}>
                          {priority.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-secondary/60 mb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ status: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                      <option value="pinned">Pinned</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end gap-2">
                    <button
                      onClick={clearAllFilters}
                      className="flex-1 px-3 py-2 bg-secondary/10 text-secondary/60 rounded-lg hover:bg-secondary/20 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={clearError}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedMemories.length > 0 && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-primary font-medium">
                  {selectedMemories.length} memories selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-primary/60 hover:text-primary"
                >
                  Clear selection
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('archive')}
                  className="px-3 py-1 bg-white border border-secondary/20 rounded hover:bg-secondary/5 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBulkAction('pin')}
                  className="px-3 py-1 bg-white border border-secondary/20 rounded hover:bg-secondary/5 transition-colors"
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memories Grid/List */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-secondary/40" />
            </div>
            <h3 className="text-lg font-medium text-secondary mb-2">No memories found</h3>
            <p className="text-secondary/60 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Create your first memory to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Memory
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredMemories.map((memory) => (
              <MemoryCard
                key={memory._id}
                memory={memory}
                viewMode={viewMode}
                isSelected={selectedMemories.includes(memory._id)}
                onSelect={() => toggleMemorySelection(memory._id)}
                onEdit={() => {
                  setEditingMemory(memory);
                  setShowForm(true);
                }}
                onDelete={() => handleDeleteMemory(memory._id)}
                onTogglePin={(isPinned) => handleTogglePin(memory._id, isPinned)}
                onToggleArchive={(isArchived) => handleToggleArchive(memory._id, isArchived)}
                onView={() => setViewingMemory(memory)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="max-w-7xl mx-auto mt-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary/60">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} memories
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters({ page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-white border border-secondary/20 rounded hover:bg-secondary/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setFilters({ page })}
                    className={`w-8 h-8 rounded ${
                      page === pagination.page
                        ? 'bg-primary text-white'
                        : 'bg-white border border-secondary/20 hover:bg-secondary/5'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setFilters({ page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 bg-white border border-secondary/20 rounded hover:bg-secondary/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Memory Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <MemoryForm
                memory={editingMemory}
                onSubmit={editingMemory ? handleUpdateMemory : handleCreateMemory}
                onCancel={() => {
                  setShowForm(false);
                  setEditingMemory(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory View Modal */}
      <AnimatePresence>
        {viewingMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{viewingMemory.title}</h2>
                  <button
                    onClick={() => setViewingMemory(null)}
                    className="p-2 hover:bg-secondary/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: memoryHelpers.getCategory(viewingMemory.category).color + '20',
                      color: memoryHelpers.getCategory(viewingMemory.category).color
                    }}
                  >
                    {memoryHelpers.getCategory(viewingMemory.category).name}
                  </span>
                  
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: memoryHelpers.getPriority(viewingMemory.priority).color + '20',
                      color: memoryHelpers.getPriority(viewingMemory.priority).color
                    }}
                  >
                    {memoryHelpers.getPriority(viewingMemory.priority).name}
                  </span>
                  
                  {viewingMemory.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-secondary/10 text-secondary/60 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{viewingMemory.content}</p>
                </div>
                
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-secondary/10">
                  <div className="text-sm text-secondary/60">
                    Created: {memoryHelpers.formatDate(viewingMemory.createdAt)}
                    {viewingMemory.updatedAt !== viewingMemory.createdAt && (
                      <span> • Updated: {memoryHelpers.formatDate(viewingMemory.updatedAt)}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingMemory(viewingMemory);
                        setViewingMemory(null);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleTogglePin(viewingMemory._id, !viewingMemory.isPinned)}
                      className="p-2 hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                      <Pin className={`w-4 h-4 ${viewingMemory.isPinned ? 'text-primary' : 'text-secondary/40'}`} />
                    </button>
                    
                    <button
                      onClick={() => handleToggleArchive(viewingMemory._id, !viewingMemory.isArchived)}
                      className="p-2 hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                      <Archive className={`w-4 h-4 ${viewingMemory.isArchived ? 'text-primary' : 'text-secondary/40'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryManager;
