import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadingStateVariants, overlayVariants } from '@/lib/animations';

// Loading notification interface
export interface LoadingNotification {
  id: string;
  type: 'loading' | 'success' | 'error';
  message: string;
  progress?: number;
  duration?: number;
  persistent?: boolean;
}

// Global loading context interface
interface LoadingContextType {
  // Global loading overlay
  isGlobalLoading: boolean;
  globalMessage: string;
  showGlobalLoading: (message?: string) => void;
  hideGlobalLoading: () => void;
  
  // Loading notifications
  notifications: LoadingNotification[];
  showNotification: (notification: Omit<LoadingNotification, 'id'>) => string;
  updateNotification: (id: string, updates: Partial<LoadingNotification>) => void;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Page loading states
  pageLoading: Record<string, boolean>;
  setPageLoading: (page: string, loading: boolean) => void;
  
  // Operation tracking
  operationProgress: Record<string, number>;
  setOperationProgress: (operation: string, progress: number) => void;
  removeOperation: (operation: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Loading provider component
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState('Carregando...');
  const [notifications, setNotifications] = useState<LoadingNotification[]>([]);
  const [pageLoading, setPageLoadingState] = useState<Record<string, boolean>>({});
  const [operationProgress, setOperationProgressState] = useState<Record<string, number>>({});

  // Global loading overlay functions
  const showGlobalLoading = useCallback((message = 'Carregando...') => {
    setGlobalMessage(message);
    setIsGlobalLoading(true);
  }, []);

  const hideGlobalLoading = useCallback(() => {
    setIsGlobalLoading(false);
  }, []);

  // Notification functions
  const showNotification = useCallback((notification: Omit<LoadingNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: LoadingNotification = {
      ...notification,
      id,
      duration: notification.duration || (notification.type === 'loading' ? 0 : 3000),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-hide non-persistent notifications
    if (!notification.persistent && notification.type !== 'loading') {
      setTimeout(() => {
        hideNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const updateNotification = useCallback((id: string, updates: Partial<LoadingNotification>) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, ...updates } : notification
      )
    );
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Page loading functions
  const setPageLoading = useCallback((page: string, loading: boolean) => {
    setPageLoadingState(prev => ({
      ...prev,
      [page]: loading,
    }));
  }, []);

  // Operation progress functions
  const setOperationProgress = useCallback((operation: string, progress: number) => {
    setOperationProgressState(prev => ({
      ...prev,
      [operation]: Math.max(0, Math.min(100, progress)),
    }));
  }, []);

  const removeOperation = useCallback((operation: string) => {
    setOperationProgressState(prev => {
      const { [operation]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const contextValue: LoadingContextType = {
    isGlobalLoading,
    globalMessage,
    showGlobalLoading,
    hideGlobalLoading,
    notifications,
    showNotification,
    updateNotification,
    hideNotification,
    clearAllNotifications,
    pageLoading,
    setPageLoading,
    operationProgress,
    setOperationProgress,
    removeOperation,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <GlobalLoadingOverlay />
      <LoadingNotifications />
    </LoadingContext.Provider>
  );
}

// Global loading overlay component
function GlobalLoadingOverlay() {
  const context = useContext(LoadingContext);
  if (!context) return null;

  const { isGlobalLoading, globalMessage } = context;

  return (
    <AnimatePresence>
      {isGlobalLoading && (
        <motion.div
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            variants={loadingStateVariants}
            initial="loading"
            animate="loading"
            className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4"
          >
            <div className="flex items-center gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-slate-900">{globalMessage}</p>
                <p className="text-sm text-slate-500">Aguarde um momento...</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Loading notifications component
function LoadingNotifications() {
  const context = useContext(LoadingContext);
  if (!context) return null;

  const { notifications, hideNotification } = context;

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <LoadingNotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => hideNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Individual notification component
function LoadingNotificationItem({
  notification,
  onClose,
}: {
  notification: LoadingNotification;
  onClose: () => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'loading':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getIconColorClasses = () => {
    switch (notification.type) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'p-4 rounded-lg border shadow-lg backdrop-blur-sm',
        getColorClasses()
      )}
    >
      <div className="flex items-start gap-3">
        <div className={getIconColorClasses()}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{notification.message}</p>
          
          {notification.progress !== undefined && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Progresso</span>
                <span>{notification.progress}%</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-1.5">
                <motion.div
                  className="h-1.5 rounded-full bg-current"
                  initial={{ width: 0 }}
                  animate={{ width: `${notification.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>

        {notification.type !== 'loading' && (
          <button
            onClick={onClose}
            className="text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Custom hook to use loading context
export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Convenience hooks for specific use cases
export function useGlobalLoading() {
  const { isGlobalLoading, globalMessage, showGlobalLoading, hideGlobalLoading } = useLoading();
  return { isGlobalLoading, globalMessage, showGlobalLoading, hideGlobalLoading };
}

export function useLoadingNotifications() {
  const {
    notifications,
    showNotification,
    updateNotification,
    hideNotification,
    clearAllNotifications,
  } = useLoading();
  return {
    notifications,
    showNotification,
    updateNotification,
    hideNotification,
    clearAllNotifications,
  };
}

export function usePageLoading(pageName: string) {
  const { pageLoading, setPageLoading } = useLoading();
  const isLoading = pageLoading[pageName] || false;
  
  return {
    isLoading,
    startLoading: () => setPageLoading(pageName, true),
    stopLoading: () => setPageLoading(pageName, false),
  };
}

export function useOperationProgress(operationName: string) {
  const { operationProgress, setOperationProgress, removeOperation } = useLoading();
  const progress = operationProgress[operationName] || 0;
  
  return {
    progress,
    setProgress: (progress: number) => setOperationProgress(operationName, progress),
    complete: () => removeOperation(operationName),
  };
}