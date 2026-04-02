import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, BarChart3, PieChart, TrendingUp, Calendar, 
  Tag, Star, Archive, Pin, Activity, Clock,
  FileText, Hash, Download, RefreshCw
} from 'lucide-react';
import { useMemoryStore } from '../store/memoryStore';
import { MEMORY_CATEGORIES, MEMORY_PRIORITIES, memoryHelpers } from '../types/memoryTypes';

export const MemoryAnalytics = ({ onClose }) => {
  const { analytics, fetchAnalytics, loading } = useMemoryStore();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAnalytics();
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportAnalytics = () => {
    const data = {
      generated: new Date().toISOString(),
      period: selectedPeriod,
      analytics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `memory-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getCategoryColor = (categoryId) => {
    const category = MEMORY_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.color : '#6B7280';
  };

  const getPriorityColor = (priorityId) => {
    const priority = MEMORY_PRIORITIES.find(pri => pri.id === priorityId);
    return priority ? priority.color : '#6B7280';
  };

  return (
    <div className="bg-white rounded-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-secondary/10">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-secondary">Memory Analytics</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-secondary/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={exportAnalytics}
            className="p-2 hover:bg-secondary/10 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Total</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{analytics.totalMemories}</div>
                <div className="text-xs text-blue-700">All memories</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
                <div className="text-2xl font-bold text-green-900">{analytics.activeMemories}</div>
                <div className="text-xs text-green-700">Not archived</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <Pin className="w-5 h-5 text-yellow-600" />
                  <span className="text-xs text-yellow-600 font-medium">Pinned</span>
                </div>
                <div className="text-2xl font-bold text-yellow-900">{analytics.pinnedMemories}</div>
                <div className="text-xs text-yellow-700">Important</div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Archive className="w-5 h-5 text-gray-600" />
                  <span className="text-xs text-gray-600 font-medium">Archived</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{analytics.archivedMemories}</div>
                <div className="text-xs text-gray-700">Hidden</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <div className="bg-secondary/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Category Distribution
                </h3>
                
                {analytics.categoryStats.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.categoryStats.map(stat => (
                      <div key={stat._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getCategoryColor(stat._id) }}
                          />
                          <span className="text-sm font-medium capitalize">
                            {stat._id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-secondary/20 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                backgroundColor: getCategoryColor(stat._id),
                                width: `${(stat.count / analytics.totalMemories) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-secondary/60 w-8 text-right">
                            {stat.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-secondary/40">
                    <PieChart className="w-8 h-8 mx-auto mb-2" />
                    <p>No category data available</p>
                  </div>
                )}
              </div>

              {/* Priority Distribution */}
              <div className="bg-secondary/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Priority Distribution
                </h3>
                
                {analytics.priorityStats.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.priorityStats.map(stat => (
                      <div key={stat._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getPriorityColor(stat._id) }}
                          />
                          <span className="text-sm font-medium capitalize">
                            {stat._id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-secondary/20 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                backgroundColor: getPriorityColor(stat._id),
                                width: `${(stat.count / analytics.totalMemories) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-secondary/60 w-8 text-right">
                            {stat.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-secondary/40">
                    <Star className="w-8 h-8 mx-auto mb-2" />
                    <p>No priority data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Tags */}
            <div className="bg-secondary/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Top Tags
              </h3>
              
              {analytics.tagStats.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analytics.tagStats.slice(0, 20).map(stat => (
                    <span
                      key={stat._id}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      #{stat._id} ({stat.count})
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary/40">
                  <Hash className="w-8 h-8 mx-auto mb-2" />
                  <p>No tags found</p>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-secondary/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Activity
              </h3>
              
              {analytics.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentActivity.map(activity => (
                    <div key={activity._id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <div className="font-medium text-secondary">{activity.title}</div>
                        <div className="text-xs text-secondary/60">
                          {memoryHelpers.getCategory(activity.category).name} • 
                          {memoryHelpers.formatDate(activity.updatedAt)}
                        </div>
                      </div>
                      <div className="text-xs text-secondary/40">
                        Updated
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-secondary/40">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Insights
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="text-sm text-secondary/600 mb-1">Most Active Category</div>
                  <div className="font-semibold text-secondary">
                    {analytics.categoryStats.length > 0 
                      ? analytics.categoryStats[0]._id 
                      : 'N/A'
                    }
                  </div>
                </div>
                
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="text-sm text-secondary/600 mb-1">Most Used Priority</div>
                  <div className="font-semibold text-secondary">
                    {analytics.priorityStats.length > 0 
                      ? analytics.priorityStats[0]._id 
                      : 'N/A'
                    }
                  </div>
                </div>
                
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="text-sm text-secondary/600 mb-1">Archive Rate</div>
                  <div className="font-semibold text-secondary">
                    {analytics.totalMemories > 0 
                      ? Math.round((analytics.archivedMemories / analytics.totalMemories) * 100) + '%'
                      : '0%'
                    }
                  </div>
                </div>
                
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="text-sm text-secondary/600 mb-1">Pin Rate</div>
                  <div className="font-semibold text-secondary">
                    {analytics.totalMemories > 0 
                      ? Math.round((analytics.pinnedMemories / analytics.totalMemories) * 100) + '%'
                      : '0%'
                    }
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MemoryAnalytics;
