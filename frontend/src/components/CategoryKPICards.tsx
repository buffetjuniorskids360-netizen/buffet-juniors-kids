import { motion } from 'framer-motion';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Target,
  Clock,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  AnalyticsCategory, 
  OverallMetrics, 
  ClientMetrics, 
  EventMetrics,
  formatMetricValue,
  getMetricTrend
} from '@/types/analytics';
import { CARD_STYLES } from '@/lib/constants';

// Helper function to get consistent color classes
const getIconColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    emerald: "text-emerald-600",
    indigo: "text-indigo-600",
    orange: "text-orange-600",
    red: "text-red-600",
    teal: "text-teal-600",
  };
  return colorMap[color] || "text-blue-600";
};

interface CategoryKPICardsProps {
  category: AnalyticsCategory;
  metrics: OverallMetrics | ClientMetrics | EventMetrics | null;
  loading?: boolean;
  className?: string;
}

export function CategoryKPICards({ 
  category, 
  metrics, 
  loading = false, 
  className 
}: CategoryKPICardsProps) {
  
  if (loading || !metrics) {
    return (
      <motion.div 
        className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4", className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Card className={cn(CARD_STYLES.metric, "overflow-hidden relative")}>
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="w-full space-y-2">
                  <div className="w-3/4 h-3 bg-slate-200 rounded animate-pulse" />
                  <div className="w-1/2 h-2 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="w-4 h-4 bg-slate-200 rounded-full animate-pulse" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full h-6 bg-slate-200 rounded animate-pulse mb-1" />
                <div className="w-2/3 h-3 bg-slate-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  const renderKPICards = () => {
    switch (category) {
      case 'todas':
        return renderOverallKPIs(metrics as OverallMetrics);
      case 'clientes':
        return renderClientKPIs(metrics as ClientMetrics);
      case 'eventos':
        return renderEventKPIs(metrics as EventMetrics);
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      {renderKPICards()}
    </motion.div>
  );
}

function renderOverallKPIs(metrics: OverallMetrics) {
  const kpis = [
    {
      title: 'Receita Total',
      value: formatMetricValue(metrics.totalRevenue, 'currency'),
      change: metrics.growthRate,
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Receita Mensal',
      value: formatMetricValue(metrics.monthlyRevenue, 'currency'),
      change: metrics.growthRate,
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total de Eventos',
      value: formatMetricValue(metrics.totalEvents, 'number'),
      change: 0,
      icon: Calendar,
      color: 'purple',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Clientes Ativos',
      value: formatMetricValue(metrics.totalClients, 'number'),
      change: 0,
      icon: Users,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Taxa de Conversão',
      value: formatMetricValue(metrics.conversionRate, 'percentage'),
      change: 5.2,
      icon: Target,
      color: 'orange',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Valor Médio Evento',
      value: formatMetricValue(metrics.averageEventValue, 'currency'),
      change: 2.1,
      icon: Award,
      color: 'teal',
      bgColor: 'bg-teal-100',
    },
  ];

  return kpis.map((kpi, index) => (
    <KPICard key={index} {...kpi} index={index} />
  ));
}

function renderClientKPIs(metrics: ClientMetrics) {
  const trend = getMetricTrend(metrics.newClientsThisMonth, metrics.newClientsLastMonth);
  
  const kpis = [
    {
      title: 'Total de Clientes',
      value: formatMetricValue(metrics.totalClients, 'number'),
      change: metrics.clientGrowthRate,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Novos Este Mês',
      value: formatMetricValue(metrics.newClientsThisMonth, 'number'),
      change: trend.value,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Taxa de Retenção',
      value: formatMetricValue(metrics.retentionRate, 'percentage'),
      change: 1.5,
      icon: Target,
      color: 'purple',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Valor Vitalício',
      value: formatMetricValue(metrics.clientLifetimeValue, 'currency'),
      change: 8.3,
      icon: DollarSign,
      color: 'emerald',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Clientes Recorrentes',
      value: formatMetricValue(metrics.repeatClientRate, 'percentage'),
      change: 3.7,
      icon: RefreshCw,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Tempo Médio Entre Eventos',
      value: formatMetricValue(metrics.averageTimeBetweenEvents, 'days'),
      change: -5.2,
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-100',
    },
  ];

  return kpis.map((kpi, index) => (
    <KPICard key={index} {...kpi} index={index} />
  ));
}

function renderEventKPIs(metrics: EventMetrics) {
  const kpis = [
    {
      title: 'Total de Eventos',
      value: formatMetricValue(metrics.totalEvents, 'number'),
      change: 0,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Eventos Confirmados',
      value: formatMetricValue(metrics.confirmedEvents, 'number'),
      change: 12.3,
      icon: Target,
      color: 'green',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Taxa de Conversão',
      value: formatMetricValue(metrics.bookingConversionRate, 'percentage'),
      change: 4.1,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Receita por Evento',
      value: formatMetricValue(metrics.averageEventValue, 'currency'),
      change: 7.8,
      icon: DollarSign,
      color: 'emerald',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Taxa de Cancelamento',
      value: formatMetricValue(metrics.cancellationRate, 'percentage'),
      change: -2.1,
      icon: TrendingDown,
      color: 'red',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Utilização de Capacidade',
      value: formatMetricValue(metrics.capacityUtilization, 'percentage'),
      change: 6.4,
      icon: Award,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
    },
  ];

  return kpis.map((kpi, index) => (
    <KPICard key={index} {...kpi} index={index} />
  ));
}

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  index: number;
}

function KPICard({ title, value, change, icon: Icon, color, bgColor, index }: KPICardProps) {
  const getTrendIcon = (change: number) => {
    if (change > 0) return ArrowUp;
    if (change < 0) return ArrowDown;
    return Minus;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-slate-500';
  };

  const TrendIcon = getTrendIcon(change);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
    >
      <Card className={cn(CARD_STYLES.metric, "hover:shadow-md transition-shadow duration-200")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-slate-700 line-clamp-2">
            {title}
          </CardTitle>
          <div className={cn("w-4 h-4 rounded flex items-center justify-center", bgColor)}>
            <Icon className={cn("h-2 w-2", getIconColorClass(color))} />
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          <div className="text-base font-bold text-slate-900 line-clamp-1">
            {value}
          </div>
          {change !== 0 && (
            <div className="flex items-center gap-1">
              <TrendIcon className={cn("h-3 w-3", getTrendColor(change))} />
              <span className={cn("text-xs font-medium", getTrendColor(change))}>
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}