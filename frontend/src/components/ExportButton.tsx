import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Image,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportService, ExportData, ExportOptions } from '@/services/exportService';

export interface ExportButtonProps {
  data: ExportData;
  charts?: HTMLElement[];
  dashboardElement?: HTMLElement;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
  onExportStart?: () => void;
  onExportComplete?: (success: boolean, type: string) => void;
}

interface ExportProgress {
  isExporting: boolean;
  progress: number;
  currentStep: string;
  type?: string;
}

export function ExportButton({
  data,
  charts = [],
  dashboardElement,
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
  onExportStart,
  onExportComplete,
}: ExportButtonProps) {
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isExporting: false,
    progress: 0,
    currentStep: '',
  });
  const [lastExportResult, setLastExportResult] = useState<{
    success: boolean;
    type: string;
    timestamp: Date;
  } | null>(null);

  const updateProgress = (progress: number, step: string) => {
    setExportProgress(prev => ({ ...prev, progress, currentStep: step }));
  };

  const handleExport = async (type: 'pdf' | 'excel' | 'csv', includeCharts = false) => {
    try {
      setExportProgress({
        isExporting: true,
        progress: 0,
        currentStep: 'Preparando exportação...',
        type,
      });

      onExportStart?.();

      const options: ExportOptions = {
        type,
        includeCharts,
        fileName: `relatorio_${type}_${new Date().toISOString().split('T')[0]}`,
      };

      // Add chart data if including charts
      const exportData = { ...data };
      if (includeCharts && charts.length > 0) {
        exportData.chartData = charts.map((chart, index) => ({
          chartElement: chart,
          title: `Gráfico ${index + 1}`,
          width: 160,
          height: 80,
        }));
      }

      updateProgress(25, 'Coletando dados...');

      switch (type) {
        case 'pdf':
          updateProgress(50, 'Gerando PDF...');
          if (includeCharts) {
            updateProgress(65, 'Capturando gráficos...');
          }
          await exportService.generatePDF(exportData, options);
          break;

        case 'excel':
          updateProgress(50, 'Criando planilha...');
          await exportService.generateExcel(exportData, options);
          break;

        case 'csv':
          updateProgress(50, 'Formatando dados...');
          await exportService.generateCSV(exportData, options);
          break;
      }

      updateProgress(100, 'Concluído!');

      setTimeout(() => {
        setExportProgress({
          isExporting: false,
          progress: 0,
          currentStep: '',
        });
        setLastExportResult({
          success: true,
          type,
          timestamp: new Date(),
        });
        onExportComplete?.(true, type);
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      setExportProgress({
        isExporting: false,
        progress: 0,
        currentStep: '',
      });
      setLastExportResult({
        success: false,
        type,
        timestamp: new Date(),
      });
      onExportComplete?.(false, type);
    }
  };

  const handleDashboardExport = async () => {
    if (!dashboardElement) return;

    try {
      setExportProgress({
        isExporting: true,
        progress: 0,
        currentStep: 'Capturando dashboard...',
        type: 'pdf',
      });

      onExportStart?.();

      updateProgress(50, 'Gerando PDF do dashboard...');

      await exportService.exportDashboard(dashboardElement, {
        type: 'pdf',
        fileName: `dashboard_${new Date().toISOString().split('T')[0]}.pdf`,
      });

      updateProgress(100, 'Concluído!');

      setTimeout(() => {
        setExportProgress({
          isExporting: false,
          progress: 0,
          currentStep: '',
        });
        setLastExportResult({
          success: true,
          type: 'dashboard-pdf',
          timestamp: new Date(),
        });
        onExportComplete?.(true, 'dashboard-pdf');
      }, 1000);

    } catch (error) {
      console.error('Dashboard export error:', error);
      setExportProgress({
        isExporting: false,
        progress: 0,
        currentStep: '',
      });
      setLastExportResult({
        success: false,
        type: 'dashboard-pdf',
        timestamp: new Date(),
      });
      onExportComplete?.(false, 'dashboard-pdf');
    }
  };

  const isExporting = exportProgress.isExporting;

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled || isExporting}
            className={cn(
              'flex items-center gap-2',
              isExporting && 'cursor-not-allowed',
              className
            )}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? 'Exportando...' : 'Exportar'}
            {!isExporting && <ChevronDown className="w-3 h-3 opacity-50" />}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs font-semibold text-slate-600">
            Opções de Exportação
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* PDF Options */}
          <DropdownMenuItem
            onClick={() => handleExport('pdf', false)}
            disabled={isExporting}
            className="flex items-center gap-3 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-red-600" />
            <div className="flex-1">
              <div className="font-medium">Relatório PDF</div>
              <div className="text-xs text-slate-500">KPIs e dados tabulares</div>
            </div>
          </DropdownMenuItem>

          {charts.length > 0 && (
            <DropdownMenuItem
              onClick={() => handleExport('pdf', true)}
              disabled={isExporting}
              className="flex items-center gap-3 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-red-600" />
              <div className="flex-1">
                <div className="font-medium">PDF Completo</div>
                <div className="text-xs text-slate-500">Com gráficos inclusos</div>
              </div>
            </DropdownMenuItem>
          )}

          {dashboardElement && (
            <DropdownMenuItem
              onClick={handleDashboardExport}
              disabled={isExporting}
              className="flex items-center gap-3 cursor-pointer"
            >
              <Image className="w-4 h-4 text-purple-600" />
              <div className="flex-1">
                <div className="font-medium">Dashboard PDF</div>
                <div className="text-xs text-slate-500">Captura completa da tela</div>
              </div>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Excel Options */}
          <DropdownMenuItem
            onClick={() => handleExport('excel')}
            disabled={isExporting}
            className="flex items-center gap-3 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <div className="flex-1">
              <div className="font-medium">Planilha Excel</div>
              <div className="text-xs text-slate-500">Múltiplas abas com dados</div>
            </div>
          </DropdownMenuItem>

          {/* CSV Option */}
          <DropdownMenuItem
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="flex items-center gap-3 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <div className="flex-1">
              <div className="font-medium">Arquivo CSV</div>
              <div className="text-xs text-slate-500">Dados tabulares apenas</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Progress Overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-80 p-4 bg-white rounded-lg shadow-lg border border-slate-200 z-50"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  Exportando {exportProgress.type?.toUpperCase()}
                </span>
              </div>

              <Progress value={exportProgress.progress} className="h-2" />

              <div className="text-xs text-slate-500">
                {exportProgress.currentStep}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success/Error Feedback */}
      <AnimatePresence>
        {lastExportResult && !isExporting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              'absolute top-full left-0 mt-2 p-3 rounded-lg shadow-lg border text-sm',
              lastExportResult.success
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            )}
            onAnimationComplete={() => {
              setTimeout(() => setLastExportResult(null), 3000);
            }}
          >
            <div className="flex items-center gap-2">
              {lastExportResult.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>
                {lastExportResult.success
                  ? `Arquivo ${lastExportResult.type} exportado com sucesso!`
                  : `Erro ao exportar ${lastExportResult.type}`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}