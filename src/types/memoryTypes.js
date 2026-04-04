// Memory Types and Constants
export const MEMORY_CATEGORIES = [
  { id: 'general', name: 'General', color: '#6B7280' },
  { id: 'work', name: 'Work', color: '#3B82F6' },
  { id: 'personal', name: 'Personal', color: '#10B981' },
  { id: 'ideas', name: 'Ideas', color: '#8B5CF6' },
  { id: 'tasks', name: 'Tasks', color: '#F59E0B' },
  { id: 'learning', name: 'Learning', color: '#EF4444' },
  { id: 'shopping', name: 'Shopping', color: '#EC4899' },
  { id: 'health', name: 'Health', color: '#14B8A6' },
  { id: 'finance', name: 'Finance', color: '#F97316' },
  { id: 'travel', name: 'Travel', color: '#06B6D4' }
];

export const MEMORY_PRIORITIES = [
  { id: 'low', name: 'Low', color: '#6B7280', icon: '↓' },
  { id: 'medium', name: 'Medium', color: '#F59E0B', icon: '→' },
  { id: 'high', name: 'High', color: '#EF4444', icon: '↑' }
];

export const MEMORY_SORT_OPTIONS = [
  { id: 'priority-desc', name: 'Priority (High to Low)', field: 'priority', order: -1 },
  { id: 'priority-asc', name: 'Priority (Low to High)', field: 'priority', order: 1 },
  { id: 'created-desc', name: 'Created (Newest First)', field: 'createdAt', order: -1 },
  { id: 'created-asc', name: 'Created (Oldest First)', field: 'createdAt', order: 1 },
  { id: 'updated-desc', name: 'Updated (Newest First)', field: 'updatedAt', order: -1 },
  { id: 'updated-asc', name: 'Updated (Oldest First)', field: 'updatedAt', order: 1 },
  { id: 'title-asc', name: 'Title (A-Z)', field: 'title', order: 1 },
  { id: 'title-desc', name: 'Title (Z-A)', field: 'title', order: -1 }
];

export const MEMORY_FILTER_OPTIONS = {
  status: [
    { id: 'all', name: 'All Memories' },
    { id: 'active', name: 'Active' },
    { id: 'archived', name: 'Archived' },
    { id: 'pinned', name: 'Pinned' }
  ],
  category: MEMORY_CATEGORIES,
  priority: MEMORY_PRIORITIES
};

export const MEMORY_VALIDATION = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 200,
    message: 'Title must be between 1 and 200 characters'
  },
  content: {
    required: true,
    minLength: 1,
    maxLength: 10000,
    message: 'Content must be between 1 and 10,000 characters'
  },
  tags: {
    maxTags: 10,
    maxTagLength: 50,
    message: 'Maximum 10 tags, each up to 50 characters'
  }
};

export const MEMORY_EXPORT_FORMATS = [
  { id: 'json', name: 'JSON', extension: '.json' },
  { id: 'csv', name: 'CSV', extension: '.csv' },
  { id: 'txt', name: 'Plain Text', extension: '.txt' },
  { id: 'md', name: 'Markdown', extension: '.md' }
];

// Memory Store State Structure
export const INITIAL_MEMORY_STATE = {
  memories: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    category: 'all',
    priority: 'all',
    status: 'active',
    tags: [],
    dateFrom: null,
    dateTo: null
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  sort: MEMORY_SORT_OPTIONS[0],
  analytics: {
    totalMemories: 0,
    pinnedMemories: 0,
    archivedMemories: 0,
    activeMemories: 0,
    categoryStats: [],
    tagStats: [],
    priorityStats: [],
    recentActivity: []
  },
  selectedMemories: [],
  bulkActionMode: false
};

// Memory Helper Functions
export const memoryHelpers = {
  // Format date for display
  formatDate: (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get category info
  getCategory: (categoryId) => {
    return MEMORY_CATEGORIES.find(cat => cat.id === categoryId) || MEMORY_CATEGORIES[0];
  },

  // Get priority info
  getPriority: (priorityId) => {
    return MEMORY_PRIORITIES.find(pri => pri.id === priorityId) || MEMORY_PRIORITIES[1];
  },

  // Calculate reading time
  getReadingTime: (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  },

  // Extract hashtags from content
  extractHashtags: (content) => {
    const hashtags = content.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.substring(1));
  },

  // Validate memory data
  validateMemory: (memory) => {
    const errors = {};
    
    if (!memory.title || memory.title.trim().length === 0) {
      errors.title = 'Title is required';
    } else if (memory.title.length > MEMORY_VALIDATION.title.maxLength) {
      errors.title = MEMORY_VALIDATION.title.message;
    }
    
    if (!memory.content || memory.content.trim().length === 0) {
      errors.content = 'Content is required';
    } else if (memory.content.length > MEMORY_VALIDATION.content.maxLength) {
      errors.content = MEMORY_VALIDATION.content.message;
    }
    
    if (memory.tags && memory.tags.length > MEMORY_VALIDATION.tags.maxTags) {
      errors.tags = MEMORY_VALIDATION.tags.message;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Export memories to different formats
  exportMemories: (memories, format) => {
    switch (format) {
      case 'json':
        return JSON.stringify(memories, null, 2);
      
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
        return csvContent;
      
      case 'txt':
        return memories.map(memory => 
          `Title: ${memory.title}\n` +
          `Category: ${memory.category}\n` +
          `Priority: ${memory.priority}\n` +
          `Tags: ${memory.tags.join(', ')}\n` +
          `Created: ${memory.createdAt}\n` +
          `Content:\n${memory.content}\n` +
          '\n---\n'
        ).join('\n');
      
      case 'md':
        return memories.map(memory => 
          `# ${memory.title}\n\n` +
          `**Category:** ${memory.category}  \n` +
          `**Priority:** ${memory.priority}  \n` +
          `**Tags:** ${memory.tags.map(tag => `#${tag}`).join(' ')}  \n` +
          `**Created:** ${memory.createdAt}\n\n` +
          `${memory.content}\n\n` +
          `---\n`
        ).join('\n');
      
      default:
        return JSON.stringify(memories, null, 2);
    }
  },

  // Generate memory summary
  generateSummary: (memory) => {
    const wordCount = memory.content.split(/\s+/).length;
    const readingTime = memoryHelpers.getReadingTime(memory.content);
    const hashtags = memoryHelpers.extractHashtags(memory.content);
    
    return {
      wordCount,
      readingTime,
      hashtags,
      characterCount: memory.content.length,
      lineCount: memory.content.split('\n').length
    };
  }
};

export default memoryHelpers;
