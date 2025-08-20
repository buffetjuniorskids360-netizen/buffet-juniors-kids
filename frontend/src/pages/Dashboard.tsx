import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useAnalyticsCategories } from '@/hooks/useAnalyticsCategories';
import { useLocation } from 'wouter';
import { usePageLoading, useLoadingNotifications } from '@/contexts/LoadingContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  SkeletonDashboard, 
  SkeletonKPIGrid, 
  SkeletonChart, 
  SkeletonStats 
} from '@/components/ui/skeleton';
import { AnalyticsCategoryTabs } from '@/components/AnalyticsCategoryTabs';
import { CategoryKPICards } from '@/components/CategoryKPICards';
import { CategoryCharts } from '@/components/CategoryCharts';
import { ExportButton } from '@/components/ExportButton';
import { 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Plus,
  CalendarDays,
  Receipt,
  AlertCircle,
  DollarSign,
  Clock,
  CheckCircle,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Filter,
  Eye
} from 'lucide-react';
import { pageVariants, pageTransition, containerVariants, itemVariants } from '@/lib/animations';
import { CARD_STYLES, SPACING, TYPOGRAPHY, GRADIENTS, ICON_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { collectChartElements } from '@/utils/reportUtils';
import { exportService } from '@/services/exportService';
import { useRef, useState } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { metrics, loading, lastUpdated, refreshMetrics } = useDashboardMetrics();
  const { 
    selectedCategory, 
    categoryMetrics, 
    currentMetrics, 
    handleCategoryChange 
  } = useAnalyticsCategories();
  
  // Enhanced loading states
  const pageLoading = usePageLoading('dashboard');
  const { showNotification } = useLoadingNotifications();
  
  // Refs for export functionality
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [exportState, setExportState] = useState<{ isExporting: boolean; message: string }>({
    isExporting: false,
    message: ''
  });

  // Helper functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-3 h-3 text-green-600" />;
    if (value < 0) return <ArrowDownRight className="w-3 h-3 text-red-600" />;
    return null;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  // Chart colors matching our design system
  const chartColors = {
    primary: '#1E40AF',
    secondary: '#7C3AED', 
    success: '#059669',
    warning: '#EA580C',
    danger: '#DC2626',
    info: '#0284C7',
  };

  // Prepare export data
  const prepareExportData = () => {
    if (!metrics) return null;

    // Mock table data - in a real scenario, this would come from your data
    const tableData = {
      headers: ['Métrica', 'Valor', 'Período'],
      rows: [
        ['Receita Mensal', formatCurrency(metrics.monthlyRevenue || 0), 'Mês Atual'],
        ['Eventos Confirmados', (metrics.confirmedEvents || 0).toString(), 'Mês Atual'],
        ['Clientes Ativos', (metrics.activeClients || 0).toString(), 'Total'],
        ['Taxa de Conversão', formatPercentage(metrics.conversionRate || 0), 'Mês Atual'],
        ['Crescimento', formatPercentage(metrics.growthRate || 0), 'vs Mês Anterior'],
        ['Projeção Próximo Mês', formatCurrency(metrics.nextMonthProjection || 0), 'Estimativa'],
      ]
    };

    return exportService.prepareExportData(
      metrics,
      tableData,
      collectChartElements('#dashboard-container'),
      {},
      'Dashboard Executivo'
    );
  };

  // Export handlers
  const handleExportStart = () => {
    setExportState({ isExporting: true, message: 'Iniciando exportação...' });
  };

  const handleExportComplete = (success: boolean, type: string) => {
    setExportState({ 
      isExporting: false, 
      message: success ? `Exportação ${type} concluída!` : `Erro na exportação ${type}` 
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setExportState({ isExporting: false, message: '' });
    }, 3000);
  };

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen w-full"
    >
      <div 
        ref={dashboardRef}
        id="dashboard-container"
        className={cn("max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8", "space-y-4 sm:space-y-6 lg:space-y-8")} 
        style={{ padding: '24px 16px' }}
      >
        {/* Welcome Section */}
        <motion.div 
          variants={itemVariants}
          className={SPACING.verticalSpacingLarge}
          style={{ marginBottom: '32px' }}
        >
          <div className="flex items-center justify-between">
            <div className={cn(
              "flex items-center gap-3 lg:gap-4", 
              SPACING.dashboardHeaderMargin // mb-8 for proper separation
            )}>
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                <TrendingUp className="w-8 h-8 lg:w-10 lg:h-10" style={{ color: ICON_COLORS.GROWTH }} />
              </div>
              <div className={cn(
                "space-y-3 lg:space-y-4",
                SPACING.lineHeightRelaxed
              )}>
                <h1 className={cn(
                  "text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight",
                  SPACING.titleMargin // mb-2 for proper title spacing
                )}>Dashboard Executivo</h1>
                <p className={cn(
                  "text-base lg:text-lg text-slate-600",
                  SPACING.lineHeightRelaxed
                )}>
                  Bem-vindo de volta, <span className="font-semibold text-slate-900">{user?.username}</span>! 
                  <span className="text-slate-500"> ({user?.role})</span>
                </p>
              </div>
            </div>
            
            {/* Export Button */}
            <div className="flex items-center gap-3">
              {exportState.message && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-sm text-slate-600 bg-white/80 px-3 py-1 rounded-lg border border-slate-200"
                >
                  {exportState.message}
                </motion.div>
              )}
              
              {metrics && prepareExportData() && (
                <ExportButton
                  data={prepareExportData()!}
                  charts={collectChartElements('#dashboard-container')}
                  dashboardElement={dashboardRef.current || undefined}
                  onExportStart={handleExportStart}
                  onExportComplete={handleExportComplete}
                  variant="outline"
                  disabled={loading || exportState.isExporting}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white"
                />
              )}
            </div>
          </div>
          
          {/* Quick Stats Bar - RADICAL compact design */}
          {loading ? (
            <SkeletonStats />
          ) : (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div 
                className="text-center space-y-1"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <p className="text-base font-bold text-blue-600">{metrics?.confirmedEvents || 0}</p>
                <p className="text-xs text-slate-600 font-medium">Eventos Confirmados</p>
              </motion.div>
              <motion.div 
                className="text-center space-y-1"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <p className="text-base font-bold text-green-600">
                  {formatCurrency(metrics?.monthlyRevenue || 0).split(' ')[1]}
                </p>
                <p className="text-xs text-slate-600 font-medium">Receita do Mês</p>
              </motion.div>
              <motion.div 
                className="text-center space-y-1"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <p className="text-base font-bold text-purple-600">{metrics?.activeClients || 0}</p>
                <p className="text-xs text-slate-600 font-medium">Clientes Ativos</p>
              </motion.div>
              <motion.div 
                className="text-center space-y-1"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <p className="text-base font-bold text-orange-600">
                  {formatPercentage(metrics?.conversionRate || 0)}
                </p>
                <p className="text-xs text-slate-600 font-medium">Taxa de Conversão</p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Analytics Category Navigation */}
        <motion.div 
          variants={itemVariants}
          className="mb-8"
        >
          <AnalyticsCategoryTabs
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </motion.div>

        {/* Category-Specific KPI Cards */}
        <motion.div 
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <CategoryKPICards
            category={selectedCategory}
            metrics={currentMetrics}
            loading={loading}
          />
        </motion.div>

        {/* Category-Specific Charts */}
        <motion.div 
          variants={containerVariants}
          className="mb-8"
        >
          <CategoryCharts
            category={selectedCategory}
            metrics={currentMetrics}
            loading={loading}
          />
        </motion.div>

        {/* Legacy Dashboard Content - Conditionally shown for "Todas Analytics" */}
        {selectedCategory === 'todas' && (
          <>
            {/* Emergency Spacer Between Header and Metrics - Force HMR */}
            <div style={{ height: '24px' }}></div>

            {/* Executive KPI Dashboard - RADICAL high-density layout */}
            <motion.div 
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className={cn(
                "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6", // Progressive high density
                "gap-2 mb-6" // RADICAL spacing reduction with proper bottom margin
              )}
              style={{ marginBottom: '32px', gap: '16px' }}
            >
          <motion.div variants={itemVariants}>
            <Card className={cn(
              CARD_STYLES.metric,
              "flex flex-col justify-between"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-xs font-medium text-slate-700">
                  Receita do Mês
                </CardTitle>
                <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                  <DollarSign className="h-2 w-2 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-0">
                <div className="text-base font-bold text-slate-900">
                  {loading ? '...' : formatCurrency(metrics?.monthlyRevenue || 0)}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                  {loading ? 'Carregando...' : (
                    <>
                      {getGrowthIcon(metrics?.growthRate || 0)}
                      <span className={getGrowthColor(metrics?.growthRate || 0)}>
                        {formatPercentage(metrics?.growthRate || 0)}
                      </span>
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={cn(
              CARD_STYLES.metric,
              "flex flex-col justify-between"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-xs font-medium text-slate-700">
                  Eventos Confirmados
                </CardTitle>
                <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                  <CheckCircle className="h-2 w-2 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-0">
                <div className="text-base font-bold text-slate-900">
                  {loading ? '...' : metrics?.confirmedEvents || 0}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {loading ? '...' : `${metrics?.pendingEvents || 0} pendentes`}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={cn(
              CARD_STYLES.metric,
              "flex flex-col justify-between"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-xs font-medium text-slate-700">
                  Taxa de Conversão
                </CardTitle>
                <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                  <Target className="h-2 w-2 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-0">
                <div className="text-base font-bold text-slate-900">
                  {loading ? '...' : formatPercentage(metrics?.conversionRate || 0)}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Cliente → Evento
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={cn(
              CARD_STYLES.metric,
              "flex flex-col justify-between"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-xs font-medium text-slate-700">
                  Projeção Próximo Mês
                </CardTitle>
                <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                  <TrendingUp className="h-2 w-2 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-0">
                <div className="text-base font-bold text-slate-900">
                  {loading ? '...' : formatCurrency(metrics?.nextMonthProjection || 0)}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Baseado em tendências
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={cn(
              CARD_STYLES.metric,
              "flex flex-col justify-between"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-xs font-medium text-slate-700">
                  Eventos Pendentes
                </CardTitle>
                <div className="w-4 h-4 bg-yellow-100 rounded flex items-center justify-center">
                  <Clock className="h-2 w-2 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-0">
                <div className="text-base font-bold text-slate-900">
                  {loading ? '...' : metrics?.pendingEvents || 0}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Aguardando confirmação
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={cn(
              CARD_STYLES.metric,
              "flex flex-col justify-between"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
                <CardTitle className="text-xs font-medium text-slate-700">
                  Crescimento Mensal
                </CardTitle>
                <div className="w-4 h-4 bg-teal-100 rounded flex items-center justify-center">
                  <ArrowUpRight className="h-2 w-2 text-teal-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-0">
                <div className="text-base font-bold text-slate-900">
                  {loading ? '...' : formatPercentage(metrics?.growthRate || 0)}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Vs mês anterior
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        {/* Emergency Spacer Between Metrics and Charts */}
        <div style={{ height: '32px' }}></div>

        {/* Real-time Analytics & Controls */}
        <motion.div 
          variants={containerVariants}
          className={cn(
            "grid grid-cols-1 lg:grid-cols-3",
            "gap-2 mb-6" // RADICAL spacing reduction with proper bottom margin
          )}
          style={{ marginBottom: '32px', gap: '16px' }}
        >
          {/* Revenue Evolution Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className={CARD_STYLES.chart} data-export-chart="revenue-evolution">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Evolução da Receita (12 meses)
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refreshMetrics()}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </CardHeader>
              <CardContent className="pt-2">
                {loading ? (
                  <motion.div 
                    className="h-40 space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Chart loading skeleton */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="w-20 h-3 bg-slate-200 rounded animate-pulse" />
                      <div className="w-12 h-3 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-end gap-2">
                          <div className="w-full bg-slate-200 rounded animate-pulse" style={{ height: `${Math.random() * 60 + 20}px` }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-slate-500 pt-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Carregando dados financeiros...</span>
                    </div>
                  </motion.div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={metrics?.revenueByMonth || []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        className="text-xs text-slate-600"
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        className="text-xs text-slate-600"
                        tickFormatter={(value) => formatCurrency(value).replace('R$\u00A0', 'R$ ')}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                                <p className="font-semibold text-slate-900">{label}</p>
                                <p className="text-blue-600">
                                  Receita: {formatCurrency(payload[0].value as number)}
                                </p>
                                <p className="text-slate-600 text-sm">
                                  Eventos: {payload[0].payload.events}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke={chartColors.primary}
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Methods Distribution */}
          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.chart} data-export-chart="payment-methods">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-purple-600" />
                  Métodos de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                {loading ? (
                  <div className="h-32 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={metrics?.paymentMethodDistribution || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        fill={chartColors.primary}
                        dataKey="amount"
                        label={({ method, percent }) => `${method} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                      >
                        {(metrics?.paymentMethodDistribution || []).map((entry, index) => {
                          const colors = [chartColors.primary, chartColors.secondary, chartColors.success, chartColors.warning];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [formatCurrency(value as number), name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        {/* Emergency Spacer Between Charts and Popular Packages */}
        <div style={{ height: '32px' }}></div>

        {/* Popular Packages Analysis */}
        <motion.div variants={itemVariants} className="mb-6" style={{ marginBottom: '32px' }}>
          <Card className={CARD_STYLES.chart} data-export-chart="popular-packages">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                Pacotes Mais Populares
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              {loading ? (
                <div className="h-40 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={metrics?.popularPackages || []}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="package" 
                      axisLine={false}
                      tickLine={false}
                      className="text-xs text-slate-600"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      className="text-xs text-slate-600"
                      tickFormatter={(value) => formatCurrency(value).replace('R$ ', 'R$ ')}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                              <p className="font-semibold text-slate-900">{label}</p>
                              <p className="text-green-600">
                                Receita: {formatCurrency(data.revenue)}
                              </p>
                              <p className="text-slate-600 text-sm">
                                Eventos: {data.count}
                              </p>
                              <p className="text-slate-600 text-sm">
                                Média: {formatCurrency(data.revenue / data.count)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill={chartColors.success}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Emergency Spacer Between Popular Packages and Financial Alerts */}
        <div style={{ height: '32px' }}></div>

        {/* Financial Alerts & Quick Actions */}
        <motion.div 
          variants={containerVariants}
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2",
            "gap-2" // RADICAL spacing reduction with final section
          )}
          style={{ gap: '16px', paddingBottom: '32px' }}
        >
          {/* Financial Status & Alerts */}
          <motion.div variants={itemVariants}>
            <Card className={cn(CARD_STYLES.primary, "h-fit")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  Status Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-1">
                {/* Payment Rate */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-green-800">Taxa de Pagamento</p>
                    <p className="text-sm font-bold text-green-900">
                      {loading ? '...' : formatPercentage(metrics?.paymentRate || 0)}
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>

                {/* Pending Payments Alert */}
                {!loading && metrics && metrics.pendingPayments > 0 && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-orange-800">Pagamentos Pendentes</p>
                      <p className="text-sm font-bold text-orange-900">
                        {formatCurrency(metrics.pendingPayments)}
                      </p>
                    </div>
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                )}

                {/* Overdue Payments Alert */}
                {!loading && metrics && metrics.overduePayments > 0 && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-red-800">Pagamentos Atrasados</p>
                      <p className="text-sm font-bold text-red-900">
                        {formatCurrency(metrics.overduePayments)}
                      </p>
                    </div>
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                )}

                {/* Client Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-600">Clientes Ativos</p>
                    <p className="text-sm font-bold text-slate-900">
                      {loading ? '...' : metrics?.activeClients || 0}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-600">Novos Este Mês</p>
                    <p className="text-sm font-bold text-slate-900">
                      {loading ? '...' : metrics?.newClientsThisMonth || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Executive Actions */}
          <motion.div variants={itemVariants}>
            <Card className={cn(CARD_STYLES.primary, "h-fit")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  Ações Executivas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-1">
                <Button 
                  className="w-full justify-start h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" 
                  onClick={() => setLocation('/agenda')}
                >
                  <CalendarDays className="mr-2 h-3 w-3" />
                  Central de Eventos
                </Button>
                <Button 
                  className="w-full justify-start h-10" 
                  variant="outline"
                  onClick={() => setLocation('/clients')}
                >
                  <Users className="mr-2 h-3 w-3" />
                  Gestão de Clientes
                </Button>
                <Button 
                  className="w-full justify-start h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white" 
                  onClick={() => setLocation('/cashflow')}
                >
                  <CreditCard className="mr-2 h-3 w-3" />
                  Fluxo de Caixa
                </Button>
                <Button 
                  className="w-full justify-start h-10" 
                  variant="outline"
                  onClick={() => setLocation('/reports')}
                >
                  <Receipt className="mr-2 h-3 w-3" />
                  Relatórios & Analytics
                </Button>

                {/* Last Update Info */}
                {lastUpdated && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500 text-center">
                      Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}