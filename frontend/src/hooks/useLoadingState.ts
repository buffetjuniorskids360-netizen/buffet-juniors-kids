import { useState, useCallback, useRef, useEffect } from 'react';

// Enhanced loading state interface
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
  error?: string | null;
  startTime?: number;
  hasMinimumDelay?: boolean;
}

// Loading state configuration
export interface LoadingConfig {
  minimumDelay?: number; // Minimum time to show loading (prevents flashing)
  message?: string;
  showProgress?: boolean;
  timeout?: number; // Auto-fail after timeout
}

// Default configuration
const DEFAULT_CONFIG: LoadingConfig = {
  minimumDelay: 300, // 300ms minimum delay
  showProgress: false,
  timeout: 30000, // 30 seconds timeout
};

/**
 * Enhanced loading state hook with minimum delay, progress tracking, and error handling
 */
export function useLoadingState(config: LoadingConfig = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    loadingMessage: mergedConfig.message,
    progress: 0,
    error: null,
    startTime: undefined,
    hasMinimumDelay: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minimumDelayRef = useRef<NodeJS.Timeout | null>(null);

  // Start loading with optional message
  const startLoading = useCallback((message?: string) => {
    // Clear any existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (minimumDelayRef.current) clearTimeout(minimumDelayRef.current);

    const startTime = Date.now();
    setState({
      isLoading: true,
      loadingMessage: message || mergedConfig.message,
      progress: 0,
      error: null,
      startTime,
      hasMinimumDelay: false,
    });

    // Set minimum delay flag
    if (mergedConfig.minimumDelay && mergedConfig.minimumDelay > 0) {
      minimumDelayRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, hasMinimumDelay: true }));
      }, mergedConfig.minimumDelay);
    }

    // Set timeout if configured
    if (mergedConfig.timeout && mergedConfig.timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Operation timed out',
        }));
      }, mergedConfig.timeout);
    }
  }, [mergedConfig.message, mergedConfig.minimumDelay, mergedConfig.timeout]);

  // Stop loading with optional delay for minimum duration
  const stopLoading = useCallback((error?: string) => {
    // Clear timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const now = Date.now();
    const elapsed = state.startTime ? now - state.startTime : 0;
    const remainingDelay = Math.max(0, (mergedConfig.minimumDelay || 0) - elapsed);

    const finishLoading = () => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error || null,
        progress: 100,
      }));
    };

    if (remainingDelay > 0) {
      setTimeout(finishLoading, remainingDelay);
    } else {
      finishLoading();
    }
  }, [state.startTime, mergedConfig.minimumDelay]);

  // Update progress (0-100)
  const setProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
    }));
  }, []);

  // Update loading message
  const setMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      loadingMessage: message,
    }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (minimumDelayRef.current) clearTimeout(minimumDelayRef.current);
    
    setState({
      isLoading: false,
      loadingMessage: mergedConfig.message,
      progress: 0,
      error: null,
      startTime: undefined,
      hasMinimumDelay: false,
    });
  }, [mergedConfig.message]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (minimumDelayRef.current) clearTimeout(minimumDelayRef.current);
    };
  }, []);

  return {
    ...state,
    startLoading,
    stopLoading,
    setProgress,
    setMessage,
    reset,
  };
}

/**
 * Simple loading state hook for basic use cases
 */
export function useSimpleLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);
  const toggleLoading = useCallback(() => setIsLoading(prev => !prev), []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading,
  };
}

/**
 * Hook for managing multiple loading states
 */
export function useMultipleLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const startLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  const reset = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    startLoading,
    stopLoading,
    isLoading,
    isAnyLoading,
    reset,
  };
}

/**
 * Hook for async operations with automatic loading state management
 */
export function useAsyncOperation<T = any>(config: LoadingConfig = {}) {
  const loading = useLoadingState(config);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: { message?: string; onSuccess?: (data: T) => void; onError?: (error: any) => void }
  ) => {
    try {
      loading.startLoading(options?.message);
      const result = await operation();
      setData(result);
      loading.stopLoading();
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      loading.stopLoading(errorMessage);
      options?.onError?.(error);
      throw error;
    }
  }, [loading]);

  return {
    ...loading,
    data,
    execute,
    setData,
  };
}