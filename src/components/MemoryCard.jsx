import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Pin, Archive, Trash2, Edit, Eye, Calendar, 
  Clock, Tag, MoreVertical, CheckSquare, Square
} from 'lucide-react';
import { MEMORY_CATEGORIES, MEMORY_PRIORITIES, memoryHelpers } from '../types/memoryTypes';

export const MemoryCard = ({ 
  memory, 
  viewMode = 'grid', 
  isSelected = false, 
  onSelect, 
  onEdit, 
  onDelete, 
  onTogglePin, 
  onToggleArchive, 
  onView 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const category = memoryHelpers.getCategory(memory.category);
  const priority = memoryHelpers.getPriority(memory.priority);
  const readingTime = memoryHelpers.getReadingTime(memory.content);
  const summary = memoryHelpers.generateSummary(memory);

  const handleAction = (action) => {
    switch (action) {
      case 'edit':
        onEdit();
        break;
      case 'delete':
        onDelete();
        break;
      case 'pin':
        onTogglePin(!memory.isPinned);
        break;
      case 'archive':
        onToggleArchive(!memory.isArchived);
        break;
      case 'view':
        onView();
        break;
      default:
        break;
    }
    setShowActions(false);
  };

  const cardContent = (
    <div
      className={`
        relative bg-white rounded-xl shadow-sm border transition-all duration-200
        ${viewMode === 'grid' ? 'p-6' : 'p-4'}
        ${isSelected ? 'border-primary bg-primary/5' : 'border-secondary/10'}
        ${isHovered ? 'shadow-lg border-primary/30' : ''}
        ${memory.isArchived ? 'opacity-75' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Checkbox */}
      <div
        className="absolute top-3 left-3 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <div className={`
          w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
          ${isSelected 
            ? 'bg-primary border-primary text-white' 
            : 'border-secondary/30 bg-white hover:border-primary/50'
          }
        `}>
          {isSelected && <CheckSquare className="w-3 h-3" />}
        </div>
      </div>

      {/* Pin Indicator */}
      {memory.isPinned && (
        <div className="absolute top-3 right-3 z-10">
          <Pin className="w-4 h-4 text-primary fill-current" />
        </div>
      )}

      {/* Priority Indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
          style={{
            backgroundColor: priority.color + '20',
            color: priority.color
          }}
        >
          <span>{priority.icon}</span>
          {priority.name}
        </span>
        
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: category.color + '20',
            color: category.color
          }}
        >
          {category.name}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-secondary mb-2 line-clamp-2">
        {memory.title}
      </h3>

      {/* Content Preview */}
      <p className="text-secondary/60 text-sm mb-3 line-clamp-3">
        {memory.content}
      </p>

      {/* Tags */}
      {memory.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {memory.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-secondary/10 text-secondary/60 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
          {memory.tags.length > 3 && (
            <span className="px-2 py-1 bg-secondary/10 text-secondary/60 rounded text-xs">
              +{memory.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-secondary/40">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readingTime} min read
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {memoryHelpers.formatDate(memory.createdAt)}
          </span>
        </div>
        
        {isHovered && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction('view');
              }}
              className="p-1 hover:bg-secondary/10 rounded transition-colors"
            >
              <Eye className="w-3 h-3" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 hover:bg-secondary/10 rounded transition-colors"
            >
              <MoreVertical className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Actions Dropdown */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute top-12 right-3 bg-white border border-secondary/20 rounded-lg shadow-lg z-20 min-w-[150px]"
        >
          <button
            onClick={() => handleAction('edit')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-secondary/5 transition-colors flex items-center gap-2"
          >
            <Edit className="w-3 h-3" />
            Edit
          </button>
          
          <button
            onClick={() => handleAction('pin')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-secondary/5 transition-colors flex items-center gap-2"
          >
            <Pin className="w-3 h-3" />
            {memory.isPinned ? 'Unpin' : 'Pin'}
          </button>
          
          <button
            onClick={() => handleAction('archive')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-secondary/5 transition-colors flex items-center gap-2"
          >
            <Archive className="w-3 h-3" />
            {memory.isArchived ? 'Unarchive' : 'Archive'}
          </button>
          
          <button
            onClick={() => handleAction('delete')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </motion.div>
      )}

      {/* Archive Badge */}
      {memory.isArchived && (
        <div className="absolute inset-0 bg-secondary/50 rounded-xl flex items-center justify-center">
          <span className="bg-secondary/80 text-white px-3 py-1 rounded-full text-sm font-medium">
            Archived
          </span>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={viewMode === 'grid' ? '' : 'w-full'}
      onClick={() => onView()}
    >
      {cardContent}
    </motion.div>
  );
};

export default MemoryCard;
