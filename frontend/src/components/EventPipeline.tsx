import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvents } from '@/hooks/useEvents';
import { Event, formatEventTime, formatEventDate, formatEventValue, EVENT_STATUS } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  Package,
  DollarSign,
  Plus,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';
import { CARD_STYLES } from '@/lib/constants';

interface EventPipelineProps {
  onEventClick?: (event: Event) => void;
  onCreateEvent?: () => void;
  onStatusChange?: (eventId: string, newStatus: Event['status']) => void;
}

interface PipelineColumn {
  status: Event['status'];
  label: string;
  color: string;
  bgColor: string;
  events: Event[];
  count: number;
}

type ViewMode = 'compact' | 'expanded';

export default function EventPipeline({ onEventClick, onCreateEvent, onStatusChange }: EventPipelineProps) {
  const { events, loading, error, searchQuery, setSearchQuery } = useEvents();
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: 'all', // all, thisWeek, thisMonth, nextMonth
    packageType: 'all',
    clientFilter: '',
  });

  // Group events by status
  const pipelineColumns = useMemo((): PipelineColumn[] => {
    const filteredEvents = events.filter(event => {
      // Apply search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          event.title.toLowerCase().includes(searchLower) ||
          event.client?.name.toLowerCase().includes(searchLower) ||
          event.packageType.toLowerCase().includes(searchLower) ||
          event.notes?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Apply date range filter
      if (selectedFilters.dateRange !== 'all') {
        const eventDate = new Date(event.date);
        const now = new Date();
        
        switch (selectedFilters.dateRange) {
          case 'thisWeek':
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            if (eventDate < weekStart || eventDate > weekEnd) return false;
            break;
          case 'thisMonth':
            if (eventDate.getMonth() !== now.getMonth() || eventDate.getFullYear() !== now.getFullYear()) return false;
            break;
          case 'nextMonth':
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1);
            if (eventDate.getMonth() !== nextMonth.getMonth() || eventDate.getFullYear() !== nextMonth.getFullYear()) return false;
            break;
        }
      }

      // Apply package type filter
      if (selectedFilters.packageType !== 'all' && event.packageType !== selectedFilters.packageType) {
        return false;
      }

      // Apply client filter
      if (selectedFilters.clientFilter && !event.client?.name.toLowerCase().includes(selectedFilters.clientFilter.toLowerCase())) {
        return false;
      }

      return true;
    });

    return EVENT_STATUS.map(status => {
      const statusEvents = filteredEvents.filter(event => event.status === status.value);
      
      return {
        status: status.value,
        label: status.label,
        color: status.color,
        bgColor: status.bgColor,
        events: statusEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        count: statusEvents.length,
      };
    });
  }, [events, searchQuery, selectedFilters]);

  const totalEvents = pipelineColumns.reduce((sum, col) => sum + col.count, 0);
  const totalValue = pipelineColumns.reduce((sum, col) => 
    sum + col.events.reduce((colSum, event) => colSum + parseFloat(event.totalValue), 0), 0
  );

  const handleEventClick = (event: Event) => {
    onEventClick?.(event);
  };

  const handleStatusChange = async (event: Event, newStatus: Event['status']) => {
    if (onStatusChange) {
      await onStatusChange(event.id, newStatus);
    }
  };

  if (error) {
    return (
      <Card className={CARD_STYLES.primary}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">Erro ao carregar pipeline</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <Card className={CARD_STYLES.primary}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Package className="w-5 h-5 text-blue-600" />
              Pipeline de Eventos
            </CardTitle>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                  className={`h-8 ${viewMode === 'compact' ? 'bg-blue-600 text-white' : ''}`}
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'expanded' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('expanded')}
                  className={`h-8 ${viewMode === 'expanded' ? 'bg-blue-600 text-white' : ''}`}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                onClick={onCreateEvent}
                className="flex items-center gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Novo Evento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedFilters.dateRange} onValueChange={(value) => 
              setSelectedFilters(prev => ({ ...prev, dateRange: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="thisWeek">Esta semana</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="nextMonth">Próximo mês</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedFilters.packageType} onValueChange={(value) => 
              setSelectedFilters(prev => ({ ...prev, packageType: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de pacote" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os pacotes</SelectItem>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="standard">Padrão</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filtrar por cliente..."
              value={selectedFilters.clientFilter}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, clientFilter: e.target.value }))}
            />
          </div>

          {/* Pipeline Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalEvents}</div>
              <div className="text-sm text-slate-600">Total de Eventos</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
              </div>
              <div className="text-sm text-slate-600">Valor Total</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {pipelineColumns.find(col => col.status === 'confirmed')?.count || 0}
              </div>
              <div className="text-sm text-slate-600">Confirmados</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {pipelineColumns.find(col => col.status === 'pending')?.count || 0}
              </div>
              <div className="text-sm text-slate-600">Pendentes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pipelineColumns.map((column) => (
          <motion.div
            key={column.status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Column Header */}
            <Card className={`${CARD_STYLES.primary} border-t-4 border-t-${column.color}-500`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${column.color}-500`} />
                    {column.label}
                  </span>
                  <Badge variant="secondary" className={`${column.bgColor} text-${column.color}-800 border-0`}>
                    {column.count}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Events in Column */}
            <div className="space-y-3 min-h-[400px]">
              <AnimatePresence>
                {column.events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleEventClick(event)}
                    className="cursor-pointer"
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-200 bg-white/90 backdrop-blur-sm">
                      <CardContent className="p-4">
                        {/* Event Title and Status */}
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-slate-900 text-sm leading-tight">
                            {event.title}
                          </h4>
                          <Select 
                            value={event.status} 
                            onValueChange={(newStatus) => handleStatusChange(event, newStatus as Event['status'])}
                          >
                            <SelectTrigger className="h-6 w-6 p-0 border-0 bg-transparent">
                              <MoreHorizontal className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVENT_STATUS.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full bg-${status.color}-500`} />
                                    {status.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Client */}
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                          <Users className="w-3 h-3" />
                          <span className="truncate">{event.client?.name}</span>
                        </div>

                        {/* Date and Time */}
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                          <Calendar className="w-3 h-3 text-purple-500" />
                          <span>{formatEventDate(event.date)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{formatEventTime(event.startTime, event.endTime)}</span>
                        </div>

                        {/* Expanded View Details */}
                        {viewMode === 'expanded' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 pt-2 border-t border-slate-100"
                          >
                            {event.client?.phone && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Phone className="w-3 h-3 text-green-500" />
                                <span>{event.client.phone}</span>
                              </div>
                            )}
                            
                            {event.client?.email && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Mail className="w-3 h-3 text-blue-500" />
                                <span className="truncate">{event.client.email}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Package className="w-3 h-3 text-purple-500" />
                              <span>{event.packageType}</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Users className="w-3 h-3 text-orange-500" />
                              <span>{event.guestsCount} convidados</span>
                            </div>
                          </motion.div>
                        )}

                        {/* Value */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3 h-3 text-green-500" />
                            <span className="text-sm font-semibold text-green-600">
                              {formatEventValue(event.totalValue)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {event.guestsCount} pessoas
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty State */}
              {column.events.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-slate-400"
                >
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum evento {column.label.toLowerCase()}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-pulse text-slate-500">
            Carregando pipeline...
          </div>
        </div>
      )}
    </div>
  );
}