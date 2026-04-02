'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';



export function DebouncedInput({
  debounceMs = 300,
  onDebounce,
  showLoader = false,
  clearOnDebounce = false,
  className,
  value) {
  const [value, setValue] = useState(controlledValue || '');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef(null);

  // Handle controlled vs uncontrolled input
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : value;

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    
    if (isControlled && controlledOnChange) {
      controlledOnChange(e);
    } else {
      setValue(newValue);
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set debouncing state
    if (newValue.trim()) {
      setIsDebouncing(true);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setIsDebouncing(false);
      
      if (onDebounce) {
        onDebounce(newValue);
      }

      if (clearOnDebounce && !isControlled) {
        setValue('');
      }
    }, debounceMs);
  }, [debounceMs, onDebounce, clearOnDebounce, isControlled, controlledOnChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Sync with controlled value
  useEffect(() => {
    if (isControlled && controlledValue !== value) {
      setValue(controlledValue);
    }
  }, [isControlled, controlledValue, value]);

  return (
    <div className="relative">
      <input
        value={currentValue}
        onChange={handleChange}
        className={cn(
          'w-full px-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary transition-colors duration-200',
          showLoader && isDebouncing && 'pr-10',
          className
        )}
        {...props}
      />
      
      {showLoader && isDebouncing && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent border-r-transparent border-b-transparent" />
        </div>
      )}
    </div>
  );
}

// Search input component with icon
export function SearchInput({
  placeholder = 'Search...',
  className,
  ...props
}: Omit<DebouncedInputProps, 'className'>) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      
      <DebouncedInput
        type="text"
        placeholder={placeholder}
        className={cn('pl-10', className)}
        showLoader
        {...props}
      />
    </div>
  );
}

// Debounced textarea component
export function DebouncedTextarea({
  debounceMs = 300,
  onDebounce,
  showLoader = false,
  className,
  value, 'className'> & {
  debounceMs?: number;
  onDebounce?: (value) => void;
  showLoader?: boolean;
  clearOnDebounce?: boolean;
  value?: string;
  onChange?: React.ChangeEventHandler;
}) {
  const [value, setValue] = useState(controlledValue || '');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef(null);

  // Handle controlled vs uncontrolled textarea
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : value;

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    
    if (isControlled && controlledOnChange) {
      controlledOnChange(e);
    } else {
      setValue(newValue);
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set debouncing state
    if (newValue.trim()) {
      setIsDebouncing(true);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setIsDebouncing(false);
      
      if (onDebounce) {
        onDebounce(newValue);
      }

      if (!isControlled) {
        setValue('');
      }
    }, debounceMs);
  }, [debounceMs, onDebounce, isControlled, controlledOnChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Sync with controlled value
  useEffect(() => {
    if (isControlled && controlledValue !== value) {
      setValue(controlledValue);
    }
  }, [isControlled, controlledValue, value]);

  return (
    <div className="relative">
      <textarea
        value={currentValue}
        onChange={handleChange}
        className={cn(
          'w-full px-4 py-3 border border-medium-gray rounded-lg focus:ring-primary focus:border-primary transition-colors duration-200 resize-none',
          showLoader && isDebouncing && 'pr-10',
          className
        )}
        {...props}
      />
      
      {showLoader && isDebouncing && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent border-r-transparent border-b-transparent" />
        </div>
      )}
    </div>
  );
}

// Hook for debounced values
export function useDebounce(value) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for debounced callback
export function useDebouncedCallback<T extends (...args) => any>(
  callback) {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}
