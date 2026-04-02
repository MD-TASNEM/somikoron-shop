'use client';

import { useState, useEffect, useRef, RefObject } from 'react';





export function useIntersectionObserver({
  threshold = 0,
  rootMargin = '0px',
  root = null,
  triggerOnce = false,
  enabled = true
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const observerRef = useRef(null);
  const elementRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current;
    if (!element) return;

    // Create new observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        setIsIntersecting(entry.isIntersecting);

        // Disconnect if triggerOnce and element is now intersecting
        if (triggerOnce && entry.isIntersecting) {
          observer.disconnect();
          observerRef.current = null;
        }
      },
      {
        threshold,
        rootMargin,
        root
      }
    );

    // Store observer reference
    observerRef.current = observer;

    // Start observing
    observer.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [threshold, rootMargin, root, triggerOnce, enabled]);

  return {
    isIntersecting,
    entry,
    observer,
    ref: elementRef;
}

// Hook for fade-in animations
export function useFadeIn(
  options?): [RefObject, boolean] {
  const { ref, isIntersecting } = useIntersectionObserver(options);
  
  return [ref, isIntersecting];
}

// Hook for slide-up animations
export function useSlideUp(
  options?): [RefObject, boolean] {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    ...options
  });
  
  return [ref, isIntersecting];
}

// Hook for scale animations
export function useScale(
  options?): [RefObject, boolean] {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    ...options
  });
  
  return [ref, isIntersecting];
}

// Hook for multiple elements
export function useMultipleIntersectionObserver(
  options?) {
  const [elements, setElements] = useState<Map<string, { isIntersecting: boolean; entry: IntersectionObserverEntry | null }>>(new Map());
  const observerRef = useRef(null);
  const elementRefs = useRef<Map>(new Map());

  useEffect(() => {
    if (!elementRefs.current.size) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target;
          const id = target.getAttribute('data-intersection-id') || '';
          
          setElements(prev => {
            const newMap = new Map(prev);
            newMap.set(id, { isIntersecting);
            return newMap;
          });
        });
      },
      {
        threshold,
        rootMargin: options?.rootMargin || '0px',
        root);

    observerRef.current = observer;

    // Observe all elements
    elementRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [options?.threshold, options?.rootMargin, options?.root]);

  const registerElement = useCallback((id) => {
    elementRefs.current.set(id, element);
    
    // Start observing if observer exists
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  const unregisterElement = useCallback((id) => {
    const element = elementRefs.current.get(id);
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
    }
    elementRefs.current.delete(id);
    
    // Remove from results
    setElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  return {
    elements,
    registerElement,
    unregisterElement,
    isIntersecting: (id) => elements.get(id)?.isIntersecting || false,
    getEntry: (id) => elements.get(id)?.entry || null
  };
}

// Hook for infinite scroll
export function useInfiniteScroll(
  callback: () => void,
  options?) {
  const { ref } = useIntersectionObserver({
    threshold: 1.0,
    rootMargin: '100px',
    ...options
  });

  useEffect(() => {
    // This effect will run when the element becomes visible
    if (ref.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            callback();
          }
        },
        {
          threshold: 1.0,
          rootMargin: '100px',
          ...options
        }
      );

      observer.observe(ref.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [callback, options]);

  return ref;
}

// Hook for parallax effect
export function useParallax(
  speed: number = 0.5,
  options?) {
  const [scrollY, setScrollY] = useState(0);
  const { ref, isIntersecting } = useIntersectionObserver(options);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    ref,
    isIntersecting,
    scrollY,
    transform: isIntersecting ? `translateY(${scrollY * speed}px)` : 'translateY(0)'
  };
}

// Hook for reveal animation with delay
export function useReveal(
  delay: number = 0,
  options?) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver(options);

  useEffect(() => {
    if (isIntersecting && !hasAnimated) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasAnimated(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isIntersecting, hasAnimated, delay]);

  return {
    ref,
    isVisible,
    hasAnimated
  };
}

// Hook for staggered animations
export function useStaggeredIntersection(
  staggerDelay: number = 100,
  options?) {
  const [visibleElements, setVisibleElements] = useState<Set>(new Set());
  const { elements, registerElement, unregisterElement } = useMultipleIntersectionObserver(options);

  useEffect(() => {
    elements.forEach((element, id) => {
      if (element.isIntersecting && !visibleElements.has(id)) {
        const timer = setTimeout(() => {
          setVisibleElements(prev => new Set(prev).add(id));
        }, Array.from(visibleElements).length * staggerDelay);

        return () => clearTimeout(timer);
      }
    });
  }, [elements, visibleElements, staggerDelay]);

  return {
    registerElement,
    unregisterElement,
    isElementVisible: (id) => visibleElements.has(id)
  };
}
