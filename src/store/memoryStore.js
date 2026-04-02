import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { INITIAL_MEMORY_STATE } from '../types/memoryTypes';
import axios from 'axios';

// Memory Store
export const useMemoryStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_MEMORY_STATE,

        // Actions
        setLoading: (loading) => set({ loading }),
        
        setError: (error) => set({ error }),
        
        setMemories: (memories) => set({ memories }),
        
        setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
        
        setPagination: (pagination) => set({ pagination: { ...get().pagination, ...pagination } }),
        
        setSort: (sort) => set({ sort }),
        
        setAnalytics: (analytics) => set({ analytics }),
        
        setSelectedMemories: (selectedMemories) => set({ selectedMemories }),
        
        setBulkActionMode: (bulkActionMode) => set({ bulkActionMode }),
        
        toggleMemorySelection: (memoryId) => {
          const { selectedMemories } = get();
          const isSelected = selectedMemories.includes(memoryId);
          
          if (isSelected) {
            set({ selectedMemories: selectedMemories.filter(id => id !== memoryId) });
          } else {
            set({ selectedMemories: [...selectedMemories, memoryId] });
          }
        },
        
        selectAllMemories: () => {
          const { memories } = get();
          set({ selectedMemories: memories.map(memory => memory._id) });
        },
        
        clearSelection: () => set({ selectedMemories: [] }),
        
        // API Actions
        fetchMemories: async (params = {}) => {
          try {
            set({ loading: true, error: null });
            
            const { filters, pagination, sort } = get();
            const queryParams = {
              ...filters,
              page: pagination.page,
              limit: pagination.limit,
              sortBy: sort.field,
              sortOrder: sort.order,
              ...params
            };
            
            // Remove empty filters
            Object.keys(queryParams).forEach(key => {
              if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
                delete queryParams[key];
              }
            });
            
            const response = await axios.get('/api/memories', { params: queryParams });
            
            set({
              memories: response.data.memories,
              pagination: response.data.pagination,
              loading: false
            });
            
            return response.data;
          } catch (error) {
            console.error('Error fetching memories:', error);
            set({ 
              error: error.response?.data?.message || 'Failed to fetch memories',
              loading: false 
            });
            throw error;
          }
        },
        
        createMemory: async (memoryData) => {
          try {
            set({ loading: true, error: null });
            
            const response = await axios.post('/api/memories', memoryData);
            const newMemory = response.data.memory;
            
            // Add to local state
            set(state => ({
              memories: [newMemory, ...state.memories],
              loading: false
            }));
            
            // Refresh analytics
            get().fetchAnalytics();
            
            return newMemory;
          } catch (error) {
            console.error('Error creating memory:', error);
            set({ 
              error: error.response?.data?.message || 'Failed to create memory',
              loading: false 
            });
            throw error;
          }
        },
        
        updateMemory: async (memoryId, updateData) => {
          try {
            set({ loading: true, error: null });
            
            const response = await axios.put(`/api/memories/${memoryId}`, updateData);
            const updatedMemory = response.data.memory;
            
            // Update local state
            set(state => ({
              memories: state.memories.map(memory => 
                memory._id === memoryId ? updatedMemory : memory
              ),
              loading: false
            }));
            
            // Refresh analytics
            get().fetchAnalytics();
            
            return updatedMemory;
          } catch (error) {
            console.error('Error updating memory:', error);
            set({ 
              error: error.response?.data?.message || 'Failed to update memory',
              loading: false 
            });
            throw error;
          }
        },
        
        deleteMemory: async (memoryId) => {
          try {
            set({ loading: true, error: null });
            
            await axios.delete(`/api/memories/${memoryId}`);
            
            // Remove from local state
            set(state => ({
              memories: state.memories.filter(memory => memory._id !== memoryId),
              selectedMemories: state.selectedMemories.filter(id => id !== memoryId),
              loading: false
            }));
            
            // Refresh analytics
            get().fetchAnalytics();
            
            return true;
          } catch (error) {
            console.error('Error deleting memory:', error);
            set({ 
              error: error.response?.data?.message || 'Failed to delete memory',
              loading: false 
            });
            throw error;
          }
        },
        
        toggleMemoryPin: async (memoryId, isPinned) => {
          try {
            await axios.patch(`/api/memories/${memoryId}/pin`, { isPinned });
            
            // Update local state
            set(state => ({
              memories: state.memories.map(memory => 
                memory._id === memoryId ? { ...memory, isPinned } : memory
              )
            }));
            
            // Refresh analytics
            get().fetchAnalytics();
            
            return true;
          } catch (error) {
            console.error('Error toggling memory pin:', error);
            set({ error: error.response?.data?.message || 'Failed to toggle memory pin' });
            throw error;
          }
        },
        
        toggleMemoryArchive: async (memoryId, isArchived) => {
          try {
            await axios.patch(`/api/memories/${memoryId}/archive`, { isArchived });
            
            // Update local state
            set(state => ({
              memories: state.memories.map(memory => 
                memory._id === memoryId ? { ...memory, isArchived } : memory
              )
            }));
            
            // Refresh analytics
            get().fetchAnalytics();
            
            return true;
          } catch (error) {
            console.error('Error toggling memory archive:', error);
            set({ error: error.response?.data?.message || 'Failed to toggle memory archive' });
            throw error;
          }
        },
        
        fetchAnalytics: async () => {
          try {
            const response = await axios.get('/api/memories/analytics');
            set({ analytics: response.data });
            return response.data;
          } catch (error) {
            console.error('Error fetching analytics:', error);
            set({ error: error.response?.data?.message || 'Failed to fetch analytics' });
            throw error;
          }
        },
        
        searchSuggestions: async (query) => {
          try {
            if (!query || query.length < 2) {
              return { suggestions: [] };
            }
            
            const response = await axios.get('/api/memories/suggestions', { params: { query } });
            return response.data;
          } catch (error) {
            console.error('Error fetching suggestions:', error);
            return { suggestions: [] };
          }
        },
        
        performBulkAction: async (action, data = {}) => {
          try {
            set({ loading: true, error: null });
            
            const { selectedMemories } = get();
            
            if (selectedMemories.length === 0) {
              throw new Error('No memories selected');
            }
            
            const response = await axios.post('/api/memories/bulk', {
              action,
              memoryIds: selectedMemories,
              data
            });
            
            // Refresh memories list
            await get().fetchMemories();
            
            // Clear selection
            set({ selectedMemories: [], bulkActionMode: false, loading: false });
            
            return response.data;
          } catch (error) {
            console.error('Error performing bulk action:', error);
            set({ 
              error: error.response?.data?.message || 'Failed to perform bulk action',
              loading: false 
            });
            throw error;
          }
        },
        
        exportMemories: async (format = 'json', filters = {}) => {
          try {
            set({ loading: true, error: null });
            
            // Fetch memories with filters
            const response = await get().fetchMemories(filters);
            const { memories } = response;
            
            // Export based on format
            let content, mimeType, filename;
            
            switch (format) {
              case 'json':
                content = JSON.stringify(memories, null, 2);
                mimeType = 'application/json';
                filename = `memories-${new Date().toISOString().split('T')[0]}.json`;
                break;
                
              case 'csv':
                const headers = ['Title', 'Content', 'Category', 'Priority', 'Tags', 'Created', 'Updated'];
                const csvContent = [
                  headers.join(','),
                  ...memories.map(memory => [
                    `"${memory.title.replace(/"/g, '""')}"`,
                    `"${memory.content.replace(/"/g, '""')}"`,
                    memory.category,
                    memory.priority,
                    `"${memory.tags.join('; ')}"`,
                    memory.createdAt,
                    memory.updatedAt
                  ].join(','))
                ].join('\n');
                content = csvContent;
                mimeType = 'text/csv';
                filename = `memories-${new Date().toISOString().split('T')[0]}.csv`;
                break;
                
              case 'txt':
                content = memories.map(memory => 
                  `Title: ${memory.title}\n` +
                  `Category: ${memory.category}\n` +
                  `Priority: ${memory.priority}\n` +
                  `Tags: ${memory.tags.join(', ')}\n` +
                  `Created: ${memory.createdAt}\n` +
                  `Content:\n${memory.content}\n` +
                  '\n---\n'
                ).join('\n');
                mimeType = 'text/plain';
                filename = `memories-${new Date().toISOString().split('T')[0]}.txt`;
                break;
                
              case 'md':
                content = memories.map(memory => 
                  `# ${memory.title}\n\n` +
                  `**Category:** ${memory.category}  \n` +
                  `**Priority:** ${memory.priority}  \n` +
                  `**Tags:** ${memory.tags.map(tag => `#${tag}`).join(' ')}  \n` +
                  `**Created:** ${memory.createdAt}\n\n` +
                  `${memory.content}\n\n` +
                  `---\n`
                ).join('\n');
                mimeType = 'text/markdown';
                filename = `memories-${new Date().toISOString().split('T')[0]}.md`;
                break;
                
              default:
                throw new Error('Unsupported export format');
            }
            
            // Create download link
            const blob = new Blob([content], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            set({ loading: false });
            
            return { success: true, filename };
          } catch (error) {
            console.error('Error exporting memories:', error);
            set({ 
              error: error.response?.data?.message || 'Failed to export memories',
              loading: false 
            });
            throw error;
          }
        },
        
        // Reset state
        resetState: () => set(INITIAL_MEMORY_STATE),
        
        // Clear error
        clearError: () => set({ error: null })
      }),
      {
        name: 'memory-store',
        partialize: (state) => ({
          filters: state.filters,
          sort: state.sort,
          pagination: state.pagination
        })
      }
    )
  )
);

// Memory hooks for common operations
export const useMemoryActions = () => {
  const {
    createMemory,
    updateMemory,
    deleteMemory,
    toggleMemoryPin,
    toggleMemoryArchive,
    performBulkAction,
    exportMemories
  } = useMemoryStore();
  
  return {
    createMemory,
    updateMemory,
    deleteMemory,
    toggleMemoryPin,
    toggleMemoryArchive,
    performBulkAction,
    exportMemories
  };
};

export const useMemoryData = () => {
  const {
    memories,
    loading,
    error,
    pagination,
    analytics,
    selectedMemories,
    bulkActionMode
  } = useMemoryStore();
  
  return {
    memories,
    loading,
    error,
    pagination,
    analytics,
    selectedMemories,
    bulkActionMode
  };
};

export const useMemoryFilters = () => {
  const {
    filters,
    sort,
    setFilters,
    setSort,
    fetchMemories,
    clearError
  } = useMemoryStore();
  
  return {
    filters,
    sort,
    setFilters,
    setSort,
    fetchMemories,
    clearError
  };
};

export default useMemoryStore;
