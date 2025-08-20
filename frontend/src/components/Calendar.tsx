import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendarEvents } from '@/hooks/useEvents';
import { CalendarEvent, getStatusInfo, formatEventTime } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus
} from 'lucide-react';
import { CARD_STYLES } from '@/lib/constants';

interface CalendarProps {
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onCreateEvent?: () => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export default function Calendar({ onEventClick, onDateClick, onCreateEvent }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { events, loading, error } = useCalendarEvents(year, month + 1);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();

    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    const daysFromPrevMonth = firstDayOfWeek;
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i + 1);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        events: [],
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === date.toDateString();
      });

      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        events: dayEvents,
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        events: [],
      });
    }

    return days;
  }, [year, month, events]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(month - 1);
    } else {
      newDate.setMonth(month + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.isCurrentMonth) {
      setSelectedDate(day.date);
      onDateClick?.(day.date);
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (error) {
    return (
      <Card className={CARD_STYLES.primary}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">Erro ao carregar calendário</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className={CARD_STYLES.primary}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <CalendarIcon className="w-5 h-5 text-purple-600" />
              Calendário de Eventos
            </CardTitle>
            <Button
              onClick={onCreateEvent}
              className="flex items-center gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Novo Evento
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Navigation */}
      <Card className={CARD_STYLES.primary}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            
            <motion.h2 
              key={`${year}-${month}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-slate-900"
            >
              {monthNames[month]} {year}
            </motion.h2>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="flex items-center gap-2"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="h-10 flex items-center justify-center text-sm font-semibold text-slate-600 bg-slate-50 rounded-lg"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={`calendar-${year}-${month}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-7 gap-2"
              >
                {calendarDays.map((day, index) => {
                  const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                  const hasEvents = day.events.length > 0;
                  
                  return (
                    <motion.div
                      key={`${day.date.getTime()}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.01 }}
                      onClick={() => handleDateClick(day)}
                      className={`
                        min-h-[120px] p-2 rounded-lg border cursor-pointer transition-all duration-200
                        ${day.isCurrentMonth 
                          ? 'bg-white hover:bg-slate-50 border-slate-200' 
                          : 'bg-slate-50 border-slate-100 opacity-50'
                        }
                        ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
                        ${day.isToday ? 'bg-blue-50 border-blue-300' : ''}
                        ${hasEvents && day.isCurrentMonth ? 'border-purple-300' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`
                          text-sm font-medium
                          ${day.isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}
                          ${day.isToday ? 'text-blue-700 font-bold' : ''}
                        `}>
                          {day.date.getDate()}
                        </span>
                        {hasEvents && (
                          <Badge 
                            variant="secondary" 
                            className="h-5 text-xs bg-purple-100 text-purple-700"
                          >
                            {day.events.length}
                          </Badge>
                        )}
                      </div>

                      {/* Events for this day */}
                      <div className="space-y-1">
                        {day.events.slice(0, 3).map((event) => {
                          const statusInfo = getStatusInfo(event.status);
                          
                          return (
                            <motion.div
                              key={event.id}
                              whileHover={{ scale: 1.02 }}
                              onClick={(e) => handleEventClick(event, e)}
                              className={`
                                p-2 rounded text-xs cursor-pointer
                                ${statusInfo.bgColor} ${statusInfo.textColor}
                                hover:shadow-sm transition-shadow
                              `}
                            >
                              <div className="font-medium truncate">
                                {event.title}
                              </div>
                              <div className="flex items-center gap-1 mt-1 opacity-80">
                                <Clock className="w-3 h-3" />
                                <span>{formatEventTime(event.startTime, event.endTime)}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-80">
                                <Users className="w-3 h-3" />
                                <span>{event.guestsCount} pessoas</span>
                              </div>
                            </motion.div>
                          );
                        })}
                        
                        {day.events.length > 3 && (
                          <div className="text-xs text-slate-500 text-center py-1">
                            +{day.events.length - 3} mais
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-pulse text-sm text-slate-500">
                Carregando eventos...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={CARD_STYLES.primary}>
              <CardHeader>
                <CardTitle className="text-slate-900">
                  Eventos de {selectedDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const dayEvents = events.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate.toDateString() === selectedDate.toDateString();
                  });

                  if (dayEvents.length === 0) {
                    return (
                      <div className="text-center py-6 text-slate-500">
                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhum evento agendado para este dia</p>
                        <Button
                          onClick={onCreateEvent}
                          className="mt-3"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Evento
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {dayEvents.map((event) => {
                        const statusInfo = getStatusInfo(event.status);
                        
                        return (
                          <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => onEventClick?.(event)}
                            className="p-4 rounded-lg border border-slate-200 hover:border-purple-300 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 mb-1">
                                  {event.title}
                                </h4>
                                <p className="text-sm text-slate-600 mb-2">
                                  Cliente: {event.clientName}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatEventTime(event.startTime, event.endTime)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {event.guestsCount} pessoas
                                  </div>
                                </div>
                              </div>
                              <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0`}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}