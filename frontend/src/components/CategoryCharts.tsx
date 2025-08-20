import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp,
  Users,
  Calendar,
  Target,
  RefreshCw,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  AnalyticsCategory, 
  OverallMetrics, 
  ClientMetrics, 
  EventMetrics,
  formatMetricValue
} from '@/types/analytics';
import { CARD_STYLES } from '@/lib/constants';

interface CategoryChartsProps {
  category: AnalyticsCategory;
  metrics: OverallMetrics | ClientMetrics | EventMetrics | null;
  loading?: boolean;
  className?: string;
}

export function CategoryCharts({ 
  category, 
  metrics, 
  loading = false, 
  className 
}: CategoryChartsProps) {
  
  // Chart color scheme
  const chartColors = {
    primary: '#1E40AF',
    secondary: '#7C3AED', 
    success: '#059669',
    warning: '#EA580C',
    danger: '#DC2626',
    info: '#0284C7',
    purple: '#9333EA',
    emerald: '#10B981',
    indigo: '#6366F1',
    orange: '#F59E0B',
  };

  if (loading || !metrics) {
    return (
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
        {[...Array(4)].map((_, index) => (
          <Card key={index} className={CARD_STYLES.chart}>
            <CardHeader className="pb-3">
              <div className="w-3/4 h-5 bg-slate-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-slate-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const renderCharts = () => {
    switch (category) {
      case 'todas':
        return renderOverallCharts(metrics as OverallMetrics);
      case 'clientes':
        return renderClientCharts(metrics as ClientMetrics);
      case 'eventos':
        return renderEventCharts(metrics as EventMetrics);
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, staggerChildren: 0.2 }}
    >
      {renderCharts()}
    </motion.div>
  );

  function renderOverallCharts(metrics: OverallMetrics) {
    // Mock data for overall charts
    const revenueData = [
      { month: 'Jan', revenue: 15000, events: 8 },
      { month: 'Fev', revenue: 18000, events: 10 },
      { month: 'Mar', revenue: 22000, events: 12 },
      { month: 'Abr', revenue: 25000, events: 14 },
      { month: 'Mai', revenue: 28000, events: 16 },
      { month: 'Jun', revenue: 32000, events: 18 },
    ];

    const performanceData = [
      { metric: 'Receita', atual: metrics.monthlyRevenue, meta: metrics.revenueProjection },
      { metric: 'Eventos', atual: metrics.totalEvents, meta: metrics.totalEvents * 1.2 },
      { metric: 'Clientes', atual: metrics.totalClients, meta: metrics.totalClients * 1.15 },
    ];

    return (
      <>
        <ChartCard
          title="Evolução da Receita"
          icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" 
                     tickFormatter={(value) => formatMetricValue(value, 'currency').replace('R$\u00A0', 'R$ ')} />
              <Tooltip 
                formatter={(value) => [formatMetricValue(value as number, 'currency'), 'Receita']}
                labelFormatter={(label) => `Mês: ${label}`}
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
        </ChartCard>

        <ChartCard
          title="Performance vs Metas"
          icon={<Target className="w-4 h-4 text-green-600" />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="metric" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip />
              <Bar dataKey="atual" fill={chartColors.success} radius={[4, 4, 0, 0]} />
              <Bar dataKey="meta" fill={chartColors.secondary} radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </>
    );
  }

  function renderClientCharts(metrics: ClientMetrics) {
    const acquisitionData = metrics.clientAcquisitionTrend;
    const valueDistribution = metrics.clientValueDistribution;

    return (
      <>
        <ChartCard
          title="Aquisição de Clientes"
          icon={<Users className="w-4 h-4 text-purple-600" />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={acquisitionData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="newClients" 
                stroke={chartColors.purple} 
                strokeWidth={3}
                dot={{ fill: chartColors.purple, strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="retainedClients" 
                stroke={chartColors.emerald} 
                strokeWidth={3}
                dot={{ fill: chartColors.emerald, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Distribuição de Valor dos Clientes"
          icon={<PieChartIcon className="w-4 h-4 text-indigo-600" />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={valueDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill={chartColors.indigo}
                dataKey="count"
                label={({ segment, percentage }) => `${segment} (${percentage}%)`}
              >
                {valueDistribution.map((entry, index) => {
                  const colors = [chartColors.success, chartColors.warning, chartColors.danger];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, 'Clientes']}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top Clientes por Receita"
          icon={<BarChart3 className="w-4 h-4 text-emerald-600" />}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metrics.topClientsByRevenue.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                className="text-xs"
                tickFormatter={(value) => formatMetricValue(value, 'currency').replace('R$\u00A0', 'R$ ')}
              />
              <Tooltip 
                formatter={(value) => [formatMetricValue(value as number, 'currency'), 'Receita Total']}
              />
              <Bar 
                dataKey="totalRevenue" 
                fill={chartColors.emerald} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Atividade Sazonal dos Clientes"
          icon={<Activity className="w-4 h-4 text-orange-600" />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={metrics.seasonalClientActivity}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.orange} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors.orange} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="activeClients" 
                stroke={chartColors.orange}
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorActivity)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </>
    );
  }

  function renderEventCharts(metrics: EventMetrics) {
    const packageData = metrics.packagePerformance;
    const revenueData = metrics.revenuePerEvent;
    const timingData = metrics.eventTimingAnalysis;
    const guestData = metrics.guestCountDistribution;

    return (
      <>
        <ChartCard
          title="Performance por Pacote"
          icon={<BarChart3 className="w-4 h-4 text-green-600" />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={packageData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="packageType" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'revenue') return [formatMetricValue(value as number, 'currency'), 'Receita'];
                  return [value, 'Quantidade'];
                }}
              />
              <Bar dataKey="count" fill={chartColors.info} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Receita por Evento ao Longo do Tempo"
          icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                className="text-xs"
                tickFormatter={(value) => formatMetricValue(value, 'currency').replace('R$\u00A0', 'R$ ')}
              />
              <Tooltip 
                formatter={(value) => [formatMetricValue(value as number, 'currency'), 'Valor Médio']}
              />
              <Line 
                type="monotone" 
                dataKey="averageValue" 
                stroke={chartColors.primary} 
                strokeWidth={3}
                dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Análise por Período do Dia"
          icon={<Calendar className="w-4 h-4 text-purple-600" />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timingData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="timeSlot" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'averageRevenue') return [formatMetricValue(value as number, 'currency'), 'Receita Média'];
                  return [value, 'Eventos'];
                }}
              />
              <Bar dataKey="count" fill={chartColors.purple} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Distribuição por Número de Convidados"
          icon={<PieChartIcon className="w-4 h-4 text-emerald-600" />}
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={guestData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill={chartColors.emerald}
                dataKey="count"
                label={({ range, percentage }) => `${range} (${percentage}%)`}
              >
                {guestData.map((entry, index) => {
                  const colors = [chartColors.success, chartColors.info, chartColors.warning, chartColors.danger];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, 'Eventos']}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </>
    );
  }
}

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, icon, children, className }: ChartCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <Card className={CARD_STYLES.chart}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}