import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Calendar,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  AnalyticsCategory, 
  ANALYTICS_CATEGORIES, 
  getCategoryConfig 
} from '@/types/analytics';
import { Card } from '@/components/ui/card';

interface AnalyticsCategoryTabsProps {
  selectedCategory: AnalyticsCategory;
  onCategoryChange: (category: AnalyticsCategory) => void;
  className?: string;
}

const categoryIcons = {
  BarChart3,
  Users,
  Calendar,
};

// Helper function to get category-specific styles
const getActiveCategoryStyles = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "border-blue-500 bg-blue-50 text-blue-700",
    purple: "border-purple-500 bg-purple-50 text-purple-700",
    green: "border-green-500 bg-green-50 text-green-700",
  };
  return colorMap[color] || "border-blue-500 bg-blue-50 text-blue-700";
};

const getIconBgStyles = (color: string, isActive: boolean) => {
  if (!isActive) return "bg-slate-100";
  
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100",
    purple: "bg-purple-100", 
    green: "bg-green-100",
  };
  return colorMap[color] || "bg-blue-100";
};

const getIconColorStyles = (color: string, isActive: boolean) => {
  if (!isActive) return "text-slate-500";
  
  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
  };
  return colorMap[color] || "text-blue-600";
};

const getTextColorStyles = (color: string, isActive: boolean) => {
  if (!isActive) return "text-slate-700";
  
  const colorMap: Record<string, string> = {
    blue: "text-blue-700",
    purple: "text-purple-700",
    green: "text-green-700",
  };
  return colorMap[color] || "text-blue-700";
};

const getSubtextColorStyles = (color: string, isActive: boolean) => {
  if (!isActive) return "text-slate-500";
  
  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
  };
  return colorMap[color] || "text-blue-600";
};

const getIndicatorStyles = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
  };
  return colorMap[color] || "bg-blue-500";
};

export function AnalyticsCategoryTabs({ 
  selectedCategory, 
  onCategoryChange, 
  className 
}: AnalyticsCategoryTabsProps) {
  
  const getIcon = (iconName: string) => {
    return categoryIcons[iconName as keyof typeof categoryIcons] || BarChart3;
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Category Tabs - Mobile-first responsive design */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {ANALYTICS_CATEGORIES.map((category) => {
          const Icon = getIcon(category.icon);
          const isActive = selectedCategory === category.id;
          
          return (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                "border-2 text-left flex-1 sm:flex-initial min-h-[60px]",
                isActive
                  ? getActiveCategoryStyles(category.color)
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              layout
            >
              {/* Icon */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                getIconBgStyles(category.color, isActive)
              )}>
                <Icon className={cn(
                  "w-4 h-4",
                  getIconColorStyles(category.color, isActive)
                )} />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-semibold text-sm",
                  getTextColorStyles(category.color, isActive)
                )}>
                  {category.name}
                </div>
                <div className={cn(
                  "text-xs line-clamp-2",
                  getSubtextColorStyles(category.color, isActive)
                )}>
                  {category.description}
                </div>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className={cn(
                    "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full",
                    getIndicatorStyles(category.color)
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Category Overview Card */}
      <motion.div
        key={selectedCategory}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {(() => {
                  const config = getCategoryConfig(selectedCategory);
                  const Icon = getIcon(config.icon);
                  return (
                    <>
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center",
                        getIconBgStyles(config.color, true)
                      )}>
                        <Icon className={cn(
                          "w-3 h-3",
                          getIconColorStyles(config.color, true)
                        )} />
                      </div>
                      <h3 className="font-semibold text-slate-900">
                        {config.name}
                      </h3>
                    </>
                  );
                })()}
              </div>
              <p className="text-sm text-slate-600 max-w-2xl">
                {getCategoryConfig(selectedCategory).description}
              </p>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <TrendingUp className="w-3 h-3" />
              <span>Análise Ativa</span>
            </div>
          </div>
          
          {/* Category Features Preview */}
          <div className="mt-3 flex flex-wrap gap-2">
            {getCategoryConfig(selectedCategory).primaryMetrics.map((metric) => {
              const config = getCategoryConfig(selectedCategory);
              return (
                <span
                  key={metric}
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    getIconBgStyles(config.color, true),
                    getTextColorStyles(config.color, true)
                  )}
                >
                  {formatMetricName(metric)}
                </span>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// Helper function to format metric names for display
function formatMetricName(metric: string): string {
  const metricNames: Record<string, string> = {
    revenue: 'Receita',
    events: 'Eventos',
    clients: 'Clientes', 
    growth: 'Crescimento',
    acquisition: 'Aquisição',
    retention: 'Retenção',
    lifetime_value: 'Valor Vitalício',
    satisfaction: 'Satisfação',
    bookings: 'Reservas',
    conversion: 'Conversão',
    capacity: 'Capacidade',
    revenue_per_event: 'Receita por Evento',
  };
  
  return metricNames[metric] || metric;
}