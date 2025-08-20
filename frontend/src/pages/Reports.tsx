import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useEvents } from '@/hooks/useEvents';
import { useClients } from '@/hooks/useClients';
import { useReports } from '@/hooks/useReports';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ExportButton } from '@/components/ExportButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { 
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  ArrowLeft,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Settings
} from 'lucide-react';
import { pageVariants, pageTransition, containerVariants, itemVariants } from '@/lib/animations';
import { CARD_STYLES } from '@/lib/constants';
import { collectChartElements } from '@/utils/reportUtils';
import { exportService } from '@/services/exportService';

type ReportPeriod = '7' | '30' | '90' | '365';
type ReportType = 'financial' | 'clients' | 'events' | 'payments';
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';
type CategoryFilter = 'all' | 'basic' | 'standard' | 'premium' | 'deluxe' | 'custom';

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  type: 'period' | 'reportType' | 'status' | 'category' | 'client';
}

export default function Reports() {
  const [, setLocation] = useLocation();
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('30');
  const [reportType, setReportType] = useState<ReportType>('financial');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [customDateRange, setCustomDateRange] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  const { metrics, loading: metricsLoading, refreshMetrics } = useDashboardMetrics();
  const { events } = useEvents();
  const { clients } = useClients();
  const {
    filters,
    reportData,
    loading: reportsLoading,
    error,
    availableClients,
    updateFilters,
    setDateRange,
    exportToCSV,
    refreshData
  } = useReports();

  const loading = metricsLoading || reportsLoading;

  // Auto-set date range based on period
  useEffect(() => {
    if (!customDateRange) {
      setDateRange(reportPeriod);
    }
  }, [reportPeriod, customDateRange, setDateRange]);

  // Update report filters when local filters change
  useEffect(() => {
    const newFilters: any = {
      reportType,
    };

    if (statusFilter !== 'all') {
      newFilters.status = statusFilter;
    }

    if (clientFilter !== 'all') {
      newFilters.clientId = clientFilter;
    }

    updateFilters(newFilters);
  }, [reportType, statusFilter, clientFilter, updateFilters]);

  // Update active filters display
  useEffect(() => {
    const newActiveFilters: ActiveFilter[] = [];

    // Period filter
    const periodLabels = { '7': '7 dias', '30': '30 dias', '90': '90 dias', '365': '1 ano' };
    newActiveFilters.push({
      id: 'period',
      label: 'Período',
      value: periodLabels[reportPeriod],
      type: 'period'
    });

    // Report type filter
    const reportTypeLabels = {
      'financial': 'Financeiro',
      'clients': 'Clientes', 
      'events': 'Eventos',
      'payments': 'Pagamentos'
    };
    newActiveFilters.push({
      id: 'reportType',
      label: 'Tipo',
      value: reportTypeLabels[reportType],
      type: 'reportType'
    });

    // Status filter
    if (statusFilter !== 'all') {
      const statusLabels = {
        'pending': 'Pendente',
        'confirmed': 'Confirmado',
        'cancelled': 'Cancelado',
        'completed': 'Concluído'
      };
      newActiveFilters.push({
        id: 'status',
        label: 'Status',
        value: statusLabels[statusFilter as keyof typeof statusLabels],
        type: 'status'
      });
    }

    // Category filter
    if (categoryFilter !== 'all') {
      const categoryLabels = {
        'basic': 'Básico',
        'standard': 'Padrão',
        'premium': 'Premium',
        'deluxe': 'Deluxe',
        'custom': 'Personalizado'
      };
      newActiveFilters.push({
        id: 'category',
        label: 'Categoria',
        value: categoryLabels[categoryFilter as keyof typeof categoryLabels],
        type: 'category'
      });
    }

    // Client filter
    if (clientFilter !== 'all') {
      const client = availableClients.find(c => c.id === clientFilter);
      if (client) {
        newActiveFilters.push({
          id: 'client',
          label: 'Cliente',
          value: client.name,
          type: 'client'
        });
      }
    }

    setActiveFilters(newActiveFilters);
  }, [reportPeriod, reportType, statusFilter, categoryFilter, clientFilter, availableClients]);

  // Filter management functions
  const clearAllFilters = () => {
    setReportPeriod('30');
    setReportType('financial');
    setStatusFilter('all');
    setCategoryFilter('all');
    setClientFilter('all');
    setCustomDateRange(false);
  };

  const removeFilter = (filterId: string) => {
    switch (filterId) {
      case 'status':
        setStatusFilter('all');
        break;
      case 'category':
        setCategoryFilter('all');
        break;
      case 'client':
        setClientFilter('all');
        break;
    }
  };

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

  const exportReport = () => {
    if (reportData) {
      exportToCSV();
    } else {
      console.log('No data available for export');
    }
  };

  // Prepare enhanced export data
  const prepareEnhancedExportData = () => {
    if (!reportData) return null;

    const tableData = {
      headers: ['Período', 'Receita', 'Eventos', 'Eficiência'],
      rows: reportData.revenueByPeriod.map(period => [
        period.period,
        formatCurrency(period.revenue),
        period.events.toString(),
        formatCurrency(period.events > 0 ? period.revenue / period.events : 0)
      ])
    };

    return exportService.prepareExportData(
      {
        monthlyRevenue: reportData.totalRevenue,
        confirmedEvents: reportData.rawEvents?.filter(e => e.status === 'confirmed').length || 0,
        activeClients: new Set(reportData.rawEvents?.map(e => e.clientId)).size || 0,
        conversionRate: displayMetrics.efficiency,
        growthRate: 0, // Could be calculated from period data
        averageEventValue: reportData.averageTicket,
        paymentRate: displayMetrics.roi,
        pendingPayments: reportData.rawPayments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0,
      },
      tableData,
      collectChartElements('#reports-container'),
      filters,
      `Relatório ${reportType} - ${reportPeriod} dias`
    );
  };

  // Export handlers
  const handleExportStart = () => {
    console.log('Export started');
  };

  const handleExportComplete = (success: boolean, type: string) => {
    console.log(`Export ${type} ${success ? 'completed' : 'failed'}`);
  };

  // Chart colors
  const chartColors = {
    primary: '#1E40AF',
    secondary: '#7C3AED', 
    success: '#059669',
    warning: '#EA580C',
    danger: '#DC2626',
    info: '#0284C7',
  };

  // Use filtered data from useReports hook or fallback to metrics
  const performanceData = reportData?.revenueByPeriod?.map(period => ({
    month: period.period,
    revenue: period.revenue,
    target: period.revenue * 1.1, // 10% growth target
    efficiency: period.events > 0 ? (period.revenue / period.events) : 0,
    events: period.events
  })) || metrics?.revenueByMonth?.map(month => ({
    ...month,
    target: month.revenue * 1.1,
    efficiency: month.events > 0 ? (month.revenue / month.events) : 0,
  })) || [];

  // Client trends data - use filtered data or fallback
  const clientTrendData = reportData?.clientPerformance?.slice(0, 6).map((client, index) => ({
    month: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][index] || `Cliente ${index + 1}`,
    new: Math.floor(client.events * 0.3),
    retained: client.events,
    churn: Math.floor(client.events * 0.1)
  })) || [
    { month: 'Jan', new: 12, retained: 45, churn: 3 },
    { month: 'Fev', new: 15, retained: 48, churn: 2 },
    { month: 'Mar', new: 18, retained: 52, churn: 4 },
    { month: 'Abr', new: 22, retained: 58, churn: 1 },
    { month: 'Mai', new: 19, retained: 61, churn: 3 },
    { month: 'Jun', new: 25, retained: 66, churn: 2 },
  ];

  // Event distribution by status - use filtered data or fallback
  const eventStatusData = reportData?.eventsByStatus || [
    { status: 'Confirmados', count: metrics?.confirmedEvents || 0, color: chartColors.success, percentage: 0 },
    { status: 'Pendentes', count: metrics?.pendingEvents || 0, color: chartColors.warning, percentage: 0 },
    { status: 'Cancelados', count: metrics?.cancelledEvents || 0, color: chartColors.danger, percentage: 0 },
    { status: 'Concluídos', count: metrics?.completedEvents || 0, color: chartColors.primary, percentage: 0 },
  ];

  // Calculate filtered KPIs
  const displayMetrics = {
    roi: reportData?.profit && reportData?.totalRevenue ? 
         ((reportData.profit / reportData.totalRevenue) * 100) : (metrics?.paymentRate || 0),
    averageTicket: reportData?.averageTicket || metrics?.averageEventValue || 0,
    efficiency: reportData ? 
                ((reportData.totalRevenue / (reportData.rawEvents?.length || 1)) / reportData.averageTicket * 100) :
                (metrics?.conversionRate || 0),
    projection: reportData?.totalRevenue ? (reportData.totalRevenue * 1.2) : (metrics?.nextMonthProjection || 0)
  };

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen bg-slate-50 p-6 w-full"
    >
      <div id="reports-container" className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between"
          style={{ marginBottom: '32px' }}
        >
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/dashboard')}
              className="flex items-center gap-3 px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-green-600" />
              </div>
              <div style={{ gap: '8px' }} className="flex flex-col">
                <h1 className="text-3xl font-bold text-slate-900">Relatórios & Analytics</h1>
                <p className="text-slate-600 mt-2">
                  Análises detalhadas e insights do seu negócio
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                refreshMetrics();
                refreshData();
              }}
              disabled={loading}
              className="flex items-center gap-3 px-4 py-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            {prepareEnhancedExportData() && (
              <ExportButton
                data={prepareEnhancedExportData()!}
                charts={collectChartElements('#reports-container')}
                onExportStart={handleExportStart}
                onExportComplete={handleExportComplete}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              />
            )}
          </div>
        </motion.div>

        {/* Report Controls */}
        <motion.div variants={itemVariants} style={{ marginBottom: '40px' }}>
          <Card className={CARD_STYLES.primary}>
            <CardHeader style={{ paddingBottom: '24px' }}>
              <CardTitle className="flex items-center gap-4">
                <Filter className="w-6 h-6 text-blue-600" />
                Configurações do Relatório
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '24px' }}>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Tipo de Relatório</label>
                  <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Tipo de Relatório" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Receita</SelectItem>
                      <SelectItem value="events">Eventos</SelectItem>
                      <SelectItem value="clients">Clientes</SelectItem>
                      <SelectItem value="payments">Resumo Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Período</label>
                  <Select value={reportPeriod} onValueChange={(value: ReportPeriod) => setReportPeriod(value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                      <SelectItem value="90">Últimos 90 dias</SelectItem>
                      <SelectItem value="365">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Categoria</label>
                  <Select value={categoryFilter} onValueChange={(value: CategoryFilter) => setCategoryFilter(value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Categorias</SelectItem>
                      <SelectItem value="basic">Aniversário</SelectItem>
                      <SelectItem value="standard">Casamento</SelectItem>
                      <SelectItem value="premium">Corporativo</SelectItem>
                      <SelectItem value="custom">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Cliente</label>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Clientes</SelectItem>
                      {availableClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Intervalo Custom</label>
                  <Button
                    variant={customDateRange ? "default" : "outline"}
                    onClick={() => setCustomDateRange(!customDateRange)}
                    className="h-11 w-full flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    {customDateRange ? 'Ativo' : 'Desativado'}
                  </Button>
                </div>
              </div>

              {/* Custom Date Range */}
              {customDateRange && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Data Inicial</label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                      placeholder="Data inicial"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Data Final</label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => updateFilters({ dateTo: e.target.value })}
                      placeholder="Data final"
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              {/* Active Filters */}
              {activeFilters.length > 2 && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 mr-2">Filtros ativos:</span>
                    {activeFilters.filter(f => !['period', 'reportType'].includes(f.type)).map((filter) => (
                      <div
                        key={filter.id}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        <span>{filter.label}: {filter.value}</span>
                        <button
                          onClick={() => removeFilter(filter.id)}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-slate-600 hover:text-slate-800 ml-2"
                    >
                      Limpar todos
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Performance Indicators */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          style={{ marginBottom: '48px' }}
        >
          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '32px' }}>
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-600">ROI do Período</p>
                    <p className="text-2xl font-bold text-green-600" style={{ marginTop: '12px' }}>
                      {loading ? '...' : formatPercentage(displayMetrics.roi)}
                    </p>
                  </div>
                  <div style={{ marginLeft: '24px' }}>
                    <Target className="w-10 h-10 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '32px' }}>
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-blue-600" style={{ marginTop: '12px' }}>
                      {loading ? '...' : formatCurrency(displayMetrics.averageTicket)}
                    </p>
                  </div>
                  <div style={{ marginLeft: '24px' }}>
                    <DollarSign className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '32px' }}>
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-600">Eficiência</p>
                    <p className="text-2xl font-bold text-purple-600" style={{ marginTop: '12px' }}>
                      {loading ? '...' : formatPercentage(displayMetrics.efficiency)}
                    </p>
                  </div>
                  <div style={{ marginLeft: '24px' }}>
                    <TrendingUp className="w-10 h-10 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '32px' }}>
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-600">Projeção Mensal</p>
                    <p className="text-2xl font-bold text-orange-600" style={{ marginTop: '12px' }}>
                      {loading ? '...' : formatCurrency(displayMetrics.projection)}
                    </p>
                  </div>
                  <div style={{ marginLeft: '24px' }}>
                    <Calendar className="w-10 h-10 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          style={{ marginBottom: '48px' }}
        >
          {/* Performance vs Target */}
          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary} data-export-chart="performance-vs-target">
              <CardHeader style={{ paddingBottom: '24px' }}>
                <CardTitle className="flex items-center gap-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Performance vs Meta
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: '24px', paddingTop: '0' }}>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={{ strokeWidth: 1 }} />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value).replace('R$ ', 'R$ ')} 
                      tick={{ fontSize: 12 }}
                      axisLine={{ strokeWidth: 1 }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [formatCurrency(value as number), name]}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="revenue" fill={chartColors.primary} name="Receita Real" />
                    <Bar dataKey="target" fill={chartColors.warning} name="Meta" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Event Status Distribution */}
          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary} data-export-chart="event-status-distribution">
              <CardHeader style={{ paddingBottom: '24px' }}>
                <CardTitle className="flex items-center gap-4">
                  <PieChartIcon className="w-6 h-6 text-purple-600" />
                  Status dos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: '24px', paddingTop: '0' }}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <Pie
                      data={eventStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ status, percent }) => `${status} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                      labelLine={false}
                    >
                      {eventStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Client Acquisition Trends */}
          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary} data-export-chart="client-trends">
              <CardHeader style={{ paddingBottom: '24px' }}>
                <CardTitle className="flex items-center gap-4">
                  <Users className="w-6 h-6 text-green-600" />
                  Tendências de Clientes
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: '24px', paddingTop: '0' }}>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={clientTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={{ strokeWidth: 1 }} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={{ strokeWidth: 1 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="new" stroke={chartColors.success} name="Novos" strokeWidth={3} />
                    <Line type="monotone" dataKey="retained" stroke={chartColors.primary} name="Retidos" strokeWidth={3} />
                    <Line type="monotone" dataKey="churn" stroke={chartColors.danger} name="Perdidos" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue Trend Analysis */}
          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary} data-export-chart="revenue-trends">
              <CardHeader style={{ paddingBottom: '24px' }}>
                <CardTitle className="flex items-center gap-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Análise de Tendência
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: '24px', paddingTop: '0' }}>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.success} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={{ strokeWidth: 1 }} />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value).replace('R$ ', 'R$ ')} 
                      tick={{ fontSize: 12 }}
                      axisLine={{ strokeWidth: 1 }}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value as number), 'Receita']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={chartColors.success}
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Insights & Recommendations */}
        <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
          <Card className={CARD_STYLES.primary}>
            <CardHeader style={{ paddingBottom: '24px' }}>
              <CardTitle className="flex items-center gap-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                Insights & Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '32px', paddingTop: '0' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-4 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h4 className="font-semibold text-green-800 text-lg">Pontos Fortes</h4>
                  </div>
                  <ul className="text-sm text-green-700 space-y-3">
                    <li style={{ lineHeight: '1.6' }}>• Alta taxa de conversão de clientes</li>
                    <li style={{ lineHeight: '1.6' }}>• Crescimento constante da receita</li>
                    <li style={{ lineHeight: '1.6' }}>• Boa retenção de clientes</li>
                  </ul>
                </div>

                <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-4 mb-4">
                    <Clock className="w-6 h-6 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800 text-lg">Oportunidades</h4>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-3">
                    <li style={{ lineHeight: '1.6' }}>• Aumentar ticket médio por evento</li>
                    <li style={{ lineHeight: '1.6' }}>• Expandir para novos segmentos</li>
                    <li style={{ lineHeight: '1.6' }}>• Melhorar eficiência operacional</li>
                  </ul>
                </div>

                <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-4 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h4 className="font-semibold text-red-800 text-lg">Atenção</h4>
                  </div>
                  <ul className="text-sm text-red-700 space-y-3">
                    <li style={{ lineHeight: '1.6' }}>• Monitorar pagamentos em atraso</li>
                    <li style={{ lineHeight: '1.6' }}>• Reduzir tempo de confirmação</li>
                    <li style={{ lineHeight: '1.6' }}>• Otimizar custos operacionais</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}