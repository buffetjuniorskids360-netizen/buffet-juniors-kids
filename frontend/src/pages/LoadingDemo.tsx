import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LoadingWrapper, 
  PageLoader, 
  TableLoader, 
  ChartLoader, 
  FormLoader, 
  CardLoader, 
  StatsLoader 
} from '@/components/ui/loading-wrapper';
import { ProgressiveLoader, DashboardLoadingStages } from '@/components/ui/progressive-loader';
import { 
  SkeletonDashboard, 
  SkeletonKPIGrid, 
  SkeletonDataTable, 
  SkeletonChart, 
  SkeletonForm,
  SkeletonStats,
  SkeletonCalendar
} from '@/components/ui/skeleton';
import { useLoadingState, useSimpleLoading } from '@/hooks/useLoadingState';
import { useLoading, useGlobalLoading, useLoadingNotifications } from '@/contexts/LoadingContext';
import { Loader2, Play, Pause, RotateCcw } from 'lucide-react';
import { pageVariants, pageTransition } from '@/lib/animations';

export default function LoadingDemo() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const { showGlobalLoading, hideGlobalLoading } = useGlobalLoading();
  const { showNotification } = useLoadingNotifications();
  
  // Different loading states for demos
  const tableLoading = useSimpleLoading();
  const chartLoading = useSimpleLoading();
  const formLoading = useSimpleLoading();
  const cardLoading = useSimpleLoading();
  const enhancedLoading = useLoadingState({ minimumDelay: 1000 });

  // Demo data
  const mockTableData = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', status: 'Ativo' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', status: 'Inativo' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', status: 'Ativo' },
  ];

  const mockChartData = [
    { month: 'Jan', value: 1200 },
    { month: 'Fev', value: 1500 },
    { month: 'Mar', value: 1800 },
    { month: 'Abr', value: 1400 },
  ];

  // Demo functions
  const runDemo = async (demoType: string, loadingHook: any) => {
    setActiveDemo(demoType);
    loadingHook.startLoading();
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    loadingHook.stopLoading();
    setActiveDemo(null);
  };

  const runGlobalLoadingDemo = async () => {
    showGlobalLoading('Processando dados globais...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    hideGlobalLoading();
  };

  const runNotificationDemo = () => {
    const loadingId = showNotification({
      type: 'loading',
      message: 'Carregando dados...',
      persistent: true,
    });

    setTimeout(() => {
      showNotification({
        type: 'success',
        message: 'Dados carregados com sucesso!',
      });
    }, 2000);
  };

  const runProgressDemo = () => {
    const progressId = showNotification({
      type: 'loading',
      message: 'Upload em progresso...',
      progress: 0,
      persistent: true,
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      
      if (progress <= 100) {
        // Update notification with progress
        showNotification({
          type: 'loading',
          message: `Upload em progresso... ${progress}%`,
          progress,
          persistent: true,
        });
      } else {
        clearInterval(interval);
        showNotification({
          type: 'success',
          message: 'Upload concluído!',
        });
      }
    }, 300);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen bg-slate-50 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">
            Loading States & Skeleton Screens Demo
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Demonstração completa dos estados de carregamento e telas de esqueleto implementados 
            no sistema financeiro. Explore diferentes padrões de loading para uma UX superior.
          </p>
        </div>

        {/* Global Loading Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Controles de Loading Global</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={runGlobalLoadingDemo}>
                <Loader2 className="w-4 h-4 mr-2" />
                Global Loading
              </Button>
              <Button onClick={runNotificationDemo} variant="outline">
                Notification Loading
              </Button>
              <Button onClick={runProgressDemo} variant="outline">
                Progress Notification
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton Components Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonDashboard />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>KPI Grid Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonKPIGrid columns={6} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Table Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonDataTable rows={4} columns={4} hasActions={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonForm fields={5} hasSubmit={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar Skeleton</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonCalendar />
            </CardContent>
          </Card>
        </div>

        {/* Interactive Loading Demos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Table Loading Demo
                {activeDemo === 'table' && (
                  <Badge variant="secondary" className="animate-pulse">
                    Loading...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => runDemo('table', tableLoading)}
                disabled={tableLoading.isLoading}
              >
                {tableLoading.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Start Table Loading
              </Button>
              
              <TableLoader isLoading={tableLoading.isLoading}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTableData.map(row => (
                        <tr key={row.id} className="border-b">
                          <td className="p-2">{row.name}</td>
                          <td className="p-2">{row.email}</td>
                          <td className="p-2">
                            <Badge variant={row.status === 'Ativo' ? 'default' : 'secondary'}>
                              {row.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TableLoader>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Chart Loading Demo
                {activeDemo === 'chart' && (
                  <Badge variant="secondary" className="animate-pulse">
                    Loading...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => runDemo('chart', chartLoading)}
                disabled={chartLoading.isLoading}
              >
                {chartLoading.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Start Chart Loading
              </Button>
              
              <ChartLoader isLoading={chartLoading.isLoading}>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      Gráfico de Vendas
                    </h3>
                    <div className="flex items-end gap-2 justify-center">
                      {mockChartData.map((item, i) => (
                        <div key={i} className="text-center">
                          <div 
                            className="bg-blue-500 rounded-t w-8 mb-1"
                            style={{ height: `${item.value / 20}px` }}
                          />
                          <span className="text-xs text-slate-600">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ChartLoader>
            </CardContent>
          </Card>
        </div>

        {/* Progressive Loading Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Progressive Loading Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressiveLoader
              stages={DashboardLoadingStages}
              autoStart={false}
              showProgress={true}
            />
          </CardContent>
        </Card>

        {/* Loading Strategy Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Strategy Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['skeleton', 'spinner', 'overlay', 'fade', 'shimmer'].map((strategy) => (
                <div key={strategy} className="space-y-4">
                  <h4 className="font-semibold capitalize">{strategy} Loading</h4>
                  <LoadingWrapper
                    isLoading={true}
                    strategy={strategy as any}
                    context="card"
                    minHeight="200px"
                  >
                    <div className="p-4 bg-white rounded-lg border">
                      <h5 className="font-medium mb-2">Sample Content</h5>
                      <p className="text-sm text-slate-600">
                        This is sample content that would be shown when loading is complete.
                      </p>
                    </div>
                  </LoadingWrapper>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Loading Hook Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Loading Hook Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={() => enhancedLoading.startLoading('Processando com delay mínimo...')}
                disabled={enhancedLoading.isLoading}
              >
                Start Enhanced Loading
              </Button>
              <Button 
                onClick={() => enhancedLoading.stopLoading()}
                disabled={!enhancedLoading.isLoading}
                variant="outline"
              >
                Stop Loading
              </Button>
              <Button 
                onClick={() => enhancedLoading.reset()}
                variant="outline"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={enhancedLoading.isLoading ? 'default' : 'secondary'}>
                    {enhancedLoading.isLoading ? 'Loading' : 'Idle'}
                  </Badge>
                </div>
                {enhancedLoading.loadingMessage && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Message:</span>
                    <span className="text-sm text-slate-600">{enhancedLoading.loadingMessage}</span>
                  </div>
                )}
                {enhancedLoading.progress > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress:</span>
                    <span className="text-sm text-slate-600">{enhancedLoading.progress}%</span>
                  </div>
                )}
                {enhancedLoading.error && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Error:</span>
                    <span className="text-sm text-red-600">{enhancedLoading.error}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}