import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { staggeredLoadingVariants, staggeredItemVariants, progressVariants } from '@/lib/animations';

// Progressive loading stage interface
export interface LoadingStage {
  id: string;
  label: string;
  component: React.ReactNode;
  duration?: number; // Optional duration override
  dependencies?: string[]; // Other stages this depends on
}

// Progressive loader props
export interface ProgressiveLoaderProps {
  stages: LoadingStage[];
  autoStart?: boolean;
  className?: string;
  showProgress?: boolean;
  onStageComplete?: (stageId: string) => void;
  onAllComplete?: () => void;
}

// Stage status type
type StageStatus = 'pending' | 'loading' | 'complete' | 'error';

export function ProgressiveLoader({
  stages,
  autoStart = true,
  className,
  showProgress = true,
  onStageComplete,
  onAllComplete,
}: ProgressiveLoaderProps) {
  const [stageStatuses, setStageStatuses] = useState<Record<string, StageStatus>>({});
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Initialize stage statuses
  useEffect(() => {
    const initialStatuses = stages.reduce((acc, stage) => {
      acc[stage.id] = 'pending';
      return acc;
    }, {} as Record<string, StageStatus>);
    setStageStatuses(initialStatuses);
  }, [stages]);

  // Check if dependencies are met for a stage
  const areDependenciesMet = useCallback((stage: LoadingStage) => {
    if (!stage.dependencies || stage.dependencies.length === 0) return true;
    return stage.dependencies.every(depId => stageStatuses[depId] === 'complete');
  }, [stageStatuses]);

  // Start loading a stage
  const startStage = useCallback(async (stageIndex: number) => {
    const stage = stages[stageIndex];
    if (!stage || !areDependenciesMet(stage)) return;

    setStageStatuses(prev => ({ ...prev, [stage.id]: 'loading' }));

    try {
      // Simulate loading time or use stage duration
      const duration = stage.duration || 1000;
      await new Promise(resolve => setTimeout(resolve, duration));

      setStageStatuses(prev => ({ ...prev, [stage.id]: 'complete' }));
      onStageComplete?.(stage.id);

      // Update progress
      const newProgress = ((stageIndex + 1) / stages.length) * 100;
      setProgress(newProgress);

      // Check if all stages are complete
      if (stageIndex === stages.length - 1) {
        onAllComplete?.();
      }
    } catch (error) {
      setStageStatuses(prev => ({ ...prev, [stage.id]: 'error' }));
    }
  }, [stages, areDependenciesMet, onStageComplete, onAllComplete]);

  // Auto-start loading
  useEffect(() => {
    if (!autoStart) return;

    const loadNextStage = () => {
      const nextIndex = stages.findIndex(stage => 
        stageStatuses[stage.id] === 'pending' && areDependenciesMet(stage)
      );
      
      if (nextIndex !== -1) {
        setCurrentStageIndex(nextIndex);
        startStage(nextIndex);
      }
    };

    loadNextStage();
  }, [autoStart, stageStatuses, stages, areDependenciesMet, startStage]);

  // Get stage status icon
  const getStageIcon = (status: StageStatus) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <div className="w-4 h-4 rounded-full bg-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-slate-300" />;
    }
  };

  // Get stage color classes
  const getStageColorClasses = (status: StageStatus) => {
    switch (status) {
      case 'loading':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'complete':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Bar */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-700">Carregando conteúdo</span>
            <span className="text-slate-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              variants={progressVariants}
              initial="initial"
              animate="animate"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* Loading Stages */}
      <motion.div
        variants={staggeredLoadingVariants}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        {stages.map((stage, index) => {
          const status = stageStatuses[stage.id] || 'pending';
          
          return (
            <motion.div
              key={stage.id}
              variants={staggeredItemVariants}
              className={cn(
                'rounded-lg border p-4 transition-all duration-300',
                getStageColorClasses(status)
              )}
            >
              {/* Stage Header */}
              <div className="flex items-center gap-3 mb-3">
                {getStageIcon(status)}
                <div>
                  <h3 className="font-medium">{stage.label}</h3>
                  <p className="text-xs opacity-70 capitalize">{status}</p>
                </div>
              </div>

              {/* Stage Content */}
              <AnimatePresence mode="wait">
                {status === 'complete' ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {stage.component}
                  </motion.div>
                ) : status === 'loading' ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm opacity-70"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Carregando...</span>
                  </motion.div>
                ) : status === 'error' ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm"
                  >
                    Erro ao carregar este conteúdo
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// Hook for managing progressive loading
export function useProgressiveLoading(stages: LoadingStage[]) {
  const [isLoading, setIsLoading] = useState(true);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const handleStageComplete = useCallback((stageId: string) => {
    setCompletedStages(prev => [...prev, stageId]);
    const newProgress = (completedStages.length + 1) / stages.length * 100;
    setProgress(newProgress);
  }, [completedStages.length, stages.length]);

  const handleAllComplete = useCallback(() => {
    setIsLoading(false);
    setProgress(100);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(true);
    setCompletedStages([]);
    setProgress(0);
  }, []);

  return {
    isLoading,
    completedStages,
    progress,
    handleStageComplete,
    handleAllComplete,
    reset,
  };
}

// Pre-built progressive loading patterns
export const DashboardLoadingStages: LoadingStage[] = [
  {
    id: 'header',
    label: 'Carregando cabeçalho',
    component: <div className="h-16 bg-slate-100 rounded animate-pulse" />,
    duration: 300,
  },
  {
    id: 'stats',
    label: 'Carregando estatísticas',
    component: <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 bg-slate-100 rounded animate-pulse" />
      ))}
    </div>,
    dependencies: ['header'],
    duration: 800,
  },
  {
    id: 'charts',
    label: 'Carregando gráficos',
    component: <div className="grid grid-cols-2 gap-4">
      <div className="h-64 bg-slate-100 rounded animate-pulse" />
      <div className="h-64 bg-slate-100 rounded animate-pulse" />
    </div>,
    dependencies: ['stats'],
    duration: 1200,
  },
];

export const TableLoadingStages: LoadingStage[] = [
  {
    id: 'table-header',
    label: 'Carregando estrutura da tabela',
    component: <div className="h-12 bg-slate-100 rounded animate-pulse" />,
    duration: 200,
  },
  {
    id: 'table-data',
    label: 'Carregando dados',
    component: <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
      ))}
    </div>,
    dependencies: ['table-header'],
    duration: 600,
  },
];

export const FormLoadingStages: LoadingStage[] = [
  {
    id: 'form-structure',
    label: 'Carregando formulário',
    component: <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
          <div className="h-10 bg-slate-100 rounded animate-pulse" />
        </div>
      ))}
    </div>,
    duration: 400,
  },
  {
    id: 'form-validation',
    label: 'Configurando validações',
    component: <div className="text-sm text-green-600">Validações configuradas</div>,
    dependencies: ['form-structure'],
    duration: 200,
  },
];