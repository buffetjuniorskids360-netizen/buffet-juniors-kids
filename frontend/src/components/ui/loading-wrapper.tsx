import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Skeleton, 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonChart, 
  SkeletonForm,
  SkeletonDataTable,
  SkeletonKPIGrid,
  SkeletonStats
} from './skeleton';
import { contentFadeInVariants, loadingStateVariants } from '@/lib/animations';

// Loading strategy types
export type LoadingStrategy = 
  | 'skeleton' 
  | 'spinner' 
  | 'overlay' 
  | 'fade' 
  | 'progressive'
  | 'shimmer';

// Loading context types
export type LoadingContext = 
  | 'page'
  | 'component' 
  | 'form'
  | 'table'
  | 'chart'
  | 'card'
  | 'grid'
  | 'stats';

// Enhanced loading wrapper props
export interface LoadingWrapperProps {
  isLoading: boolean;
  strategy?: LoadingStrategy;
  context?: LoadingContext;
  error?: string | null;
  retry?: () => void;
  children: React.ReactNode;
  className?: string;
  loadingMessage?: string;
  minHeight?: string;
  skeletonProps?: {
    rows?: number;
    columns?: number;
    cards?: number;
    animate?: boolean;
  };
  overlayProps?: {
    blur?: boolean;
    dark?: boolean;
  };
}

export function LoadingWrapper({
  isLoading,
  strategy = 'skeleton',
  context = 'component',
  error,
  retry,
  children,
  className,
  loadingMessage = 'Carregando...',
  minHeight = '200px',
  skeletonProps = {},
  overlayProps = {},
}: LoadingWrapperProps) {

  // Render error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'flex flex-col items-center justify-center p-8 text-center',
          'bg-red-50 border border-red-200 rounded-lg',
          className
        )}
        style={{ minHeight }}
      >
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Erro ao carregar conteúdo
        </h3>
        <p className="text-red-700 mb-4 max-w-md">{error}</p>
        {retry && (
          <button
            onClick={retry}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        )}
      </motion.div>
    );
  }

  // Render loading state based on strategy
  const renderLoadingState = () => {
    switch (strategy) {
      case 'skeleton':
        return renderSkeletonLoading();
      case 'spinner':
        return renderSpinnerLoading();
      case 'overlay':
        return renderOverlayLoading();
      case 'fade':
        return renderFadeLoading();
      case 'shimmer':
        return renderShimmerLoading();
      default:
        return renderSkeletonLoading();
    }
  };

  // Skeleton loading based on context
  const renderSkeletonLoading = () => {
    const skeletonClass = cn('animate-in fade-in duration-300', className);
    
    switch (context) {
      case 'table':
        return (
          <div className={skeletonClass} style={{ minHeight }}>
            <SkeletonDataTable 
              rows={skeletonProps.rows || 5}
              columns={skeletonProps.columns || 4}
              hasActions={true}
              animate={skeletonProps.animate}
            />
          </div>
        );
      
      case 'chart':
        return (
          <div className={skeletonClass} style={{ minHeight }}>
            <SkeletonChart animate={skeletonProps.animate} />
          </div>
        );
      
      case 'form':
        return (
          <div className={skeletonClass} style={{ minHeight }}>
            <SkeletonForm 
              fields={skeletonProps.rows || 4}
              animate={skeletonProps.animate}
            />
          </div>
        );
      
      case 'grid':
        return (
          <div className={skeletonClass} style={{ minHeight }}>
            <SkeletonKPIGrid 
              columns={skeletonProps.columns || 6}
              animate={skeletonProps.animate}
            />
          </div>
        );
      
      case 'stats':
        return (
          <div className={skeletonClass} style={{ minHeight }}>
            <SkeletonStats animate={skeletonProps.animate} />
          </div>
        );
      
      case 'card':
        return (
          <div className={skeletonClass} style={{ minHeight }}>
            {skeletonProps.cards ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: skeletonProps.cards }).map((_, i) => (
                  <SkeletonCard key={i} animate={skeletonProps.animate} />
                ))}
              </div>
            ) : (
              <SkeletonCard animate={skeletonProps.animate} />
            )}
          </div>
        );
      
      default:
        return (
          <div className={skeletonClass} style={{ minHeight }}>
            <div className="space-y-4">
              {Array.from({ length: skeletonProps.rows || 3 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  variant="text" 
                  lines={2} 
                  animate={skeletonProps.animate}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  // Spinner loading
  const renderSpinnerLoading = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'flex flex-col items-center justify-center',
        className
      )}
      style={{ minHeight }}
    >
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <p className="text-slate-600 text-sm">{loadingMessage}</p>
    </motion.div>
  );

  // Overlay loading
  const renderOverlayLoading = () => (
    <div className={cn('relative', className)} style={{ minHeight }}>
      <motion.div
        variants={loadingStateVariants}
        animate="loading"
        className={cn(
          overlayProps.blur && 'blur-sm',
          'pointer-events-none'
        )}
      >
        {children}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          overlayProps.dark ? 'bg-black/60' : 'bg-white/80',
          'backdrop-blur-sm rounded-lg'
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-700">{loadingMessage}</p>
        </div>
      </motion.div>
    </div>
  );

  // Fade loading
  const renderFadeLoading = () => (
    <motion.div
      variants={loadingStateVariants}
      animate="loading"
      className={cn(className)}
      style={{ minHeight }}
    >
      {children}
    </motion.div>
  );

  // Shimmer loading
  const renderShimmerLoading = () => (
    <div className={cn('relative loading-shimmer', className)} style={{ minHeight }}>
      <div className="space-y-4 opacity-60">
        {children}
      </div>
    </div>
  );

  // Main render logic
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div key="loading">
          {renderLoadingState()}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          variants={contentFadeInVariants}
          initial="initial"
          animate="animate"
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Specialized loading wrappers for common use cases
export const PageLoader: React.FC<Omit<LoadingWrapperProps, 'context' | 'strategy'> & { strategy?: LoadingStrategy }> = ({ strategy = 'skeleton', ...props }) => (
  <LoadingWrapper {...props} context="page" strategy={strategy} />
);

export const TableLoader: React.FC<Omit<LoadingWrapperProps, 'context' | 'strategy'>> = (props) => (
  <LoadingWrapper {...props} context="table" strategy="skeleton" />
);

export const ChartLoader: React.FC<Omit<LoadingWrapperProps, 'context' | 'strategy'>> = (props) => (
  <LoadingWrapper {...props} context="chart" strategy="skeleton" />
);

export const FormLoader: React.FC<Omit<LoadingWrapperProps, 'context' | 'strategy'>> = (props) => (
  <LoadingWrapper {...props} context="form" strategy="skeleton" />
);

export const CardLoader: React.FC<Omit<LoadingWrapperProps, 'context' | 'strategy'>> = (props) => (
  <LoadingWrapper {...props} context="card" strategy="skeleton" />
);

export const StatsLoader: React.FC<Omit<LoadingWrapperProps, 'context' | 'strategy'>> = (props) => (
  <LoadingWrapper {...props} context="stats" strategy="skeleton" />
);

// Loading state hook for components
export function useLoadingWrapper(isLoading: boolean, error?: string | null) {
  return {
    LoadingWrapper: ({ children, ...props }: Omit<LoadingWrapperProps, 'isLoading' | 'error'>) => (
      <LoadingWrapper {...props} isLoading={isLoading} error={error}>
        {children}
      </LoadingWrapper>
    ),
  };
}