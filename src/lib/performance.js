// Performance optimization utilities

// Debounce utility function
export function debounce<T extends (...args) => any>(
  func): (...args) => void {
  let timeout = null;
  
  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Throttle utility function
export function throttle<T extends (...args) => any>(
  func): (...args) => void {
  let inThrottle = false;
  
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Memoize utility function
export function memoize<T extends (...args) => any>(
  func,
  resolver?: (...args) => string
) {
  const cache = new Map<string, ReturnType>();
  
  return ((...args) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  });
}

// Lazy load utility
export function lazyLoad(
  loader: () => Promise,
  fallback?: () => T
): () => Promise {
  let instance = null;
  let loading = null;
  
  return async () => {
    if (instance) {
      return instance;
    }
    
    if (loading) {
      return loading;
    }
    
    loading = loader();
    
    try {
      instance = await loading;
      return instance;
    } catch (error) {
      if (fallback) {
        instance = fallback();
        return instance;
      }
      throw error;
    }
  };
}

// Image optimization utilities
export function getOptimizedImageUrl(
  src,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
) { width, height, quality = 80, format = 'webp' } = options;
  
  // If it's an external URL, return as-is
  if (src.startsWith('http')) {
    return src;
  }
  
  // Build optimized URL for local images
  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('f', format);
  
  const baseUrl = src.split('?')[0];
  return `${baseUrl}?${params.toString()}`;
}

// Performance monitoring utilities
export class PerformanceMonitor {
  static metrics: Map = new Map();
  
  static startTimer(name): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      this.metrics.get(name).push(duration);
    };
  }
  
  static getMetrics(name): {
    count: number;
    average: number;
    min: number;
    max: number;
  } | null {
    const values = this.metrics.get(name);
    
    if (!values || values.length === 0) {
      return null;
    }
    
    const count = values.length;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / count;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { count, average, min, max };
  }
  
  static getAllMetrics() {
    const result, ReturnType> = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name);
    }
    
    return result;
  }
  
  static clearMetrics(name?) {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
}

// Resource loading utilities
export class ResourceLoader {
  static loadedResources: Set = new Set();
  static loadingPromises, Promise> = new Map();
  
  static async loadScript(src) {
    if (this.loadedResources.has(src)) {
      return;
    }
    
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }
    
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => {
        this.loadedResources.add(src);
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error(`Failed to load script: ${src}`));
      };
      
      document.head.appendChild(script);
    });
    
    this.loadingPromises.set(src, promise);
    return promise;
  }
  
  static async loadStyle(href) {
    if (this.loadedResources.has(href)) {
      return;
    }
    
    if (this.loadingPromises.has(href)) {
      return this.loadingPromises.get(href);
    }
    
    const promise = new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      
      link.onload = () => {
        this.loadedResources.add(href);
        resolve();
      };
      
      link.onerror = () => {
        reject(new Error(`Failed to load stylesheet: ${href}`));
      };
      
      document.head.appendChild(link);
    });
    
    this.loadingPromises.set(href, promise);
    return promise;
  }
  
  static preloadImage(src) {
    if (this.loadedResources.has(src)) {
      return Promise.resolve(new Image());
    }
    
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }
    
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        this.loadedResources.add(src);
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${src}`));
      };
    });
    
    this.loadingPromises.set(src, promise);
    return promise;
  }
}

// Virtual scrolling utilities
export class VirtualScrollManager {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  scrollTop: number = 0;
  
  constructor(items) {
    this.items = items;
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
  }
  
  getVisibleItems(): {
    items: T[];
    startIndex: number;
    endIndex: number;
    offsetY: number;
  } {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(this.containerHeight / this.itemHeight) + 1,
      this.items.length - 1
    );
    
    const offsetY = startIndex * this.itemHeight;
    const visibleItems = this.items.slice(startIndex, endIndex + 1);
    
    return {
      items,
      offsetY
    };
  }
  
  updateScrollTop(scrollTop) {
    this.scrollTop = scrollTop;
  }
  
  getTotalHeight() {
    return this.items.length * this.itemHeight;
  }
  
  getItemIndex(position) {
    return Math.floor(position / this.itemHeight);
  }
}

// Cache utilities
export class CacheManager {
  cache, { value: T; timestamp: number; ttl: number }> = new Map();
  
  set(key, ttl: number = 300000) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  has(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  delete(key) {
    return this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  size() {
    return this.cache.size;
  }
  
  // Clean up expired items
  cleanup() {
    let cleaned = 0;
    const now = Date.now();
    
    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

// Animation utilities
export class AnimationUtils {
  static easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  static animate(
    from,
    callback: (value) => void,
    easing: (t) => number = this.easeInOutCubic
  ) {
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = from + (to - from) * easing(progress);
      
      callback(value);
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  }
  
  static scrollTo(
    element,
    duration: number = 300
  ) {
    const from = element.scrollTop;
    this.animate(from, to, duration, (value) => {
      element.scrollTop = value;
    });
  }
}

// Bundle size optimization utilities
export class BundleOptimizer {
  static loadedChunks: Set = new Set();
  
  static async loadChunk(chunkName) {
    if (this.loadedChunks.has(chunkName)) {
      return;
    }
    
    try {
      // Dynamic import based on chunk name
      const chunk = await import(`@/chunks/${chunkName}`);
      this.loadedChunks.add(chunkName);
      return chunk;
    } catch (error) {
      console.error(`Failed to load chunk ${chunkName}:`, error);
      throw error;
    }
  }
  
  static preloadChunks(chunkNames) {
    return Promise.all(
      chunkNames.map(name => this.loadChunk(name))
    );
  }
  
  static isChunkLoaded(chunkName) {
    return this.loadedChunks.has(chunkName);
  }
}

// Memory usage monitoring
export class MemoryMonitor {
  static getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } | null {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }
    
    const memory = (performance).memory;
    const used = memory.usedJSHeapSize;
    const total = memory.totalJSHeapSize;
    const percentage = (used / total) * 100;
    
    return { used, total, percentage };
  }
  
  static logMemoryUsage(label: string = 'Memory') {
    const usage = this.getMemoryUsage();
    
    if (usage) {
      console.log(`${label}: ${(usage.used / 1024 / 1024).toFixed(2)}MB (${usage.percentage.toFixed(1)}%)`);
    }
  }
}
