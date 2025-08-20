import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent } from '@/types/event';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  Users,
  DollarSign,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { containerVariants, itemVariants } from '@/lib/animations';
import { EVENT_STATUS, formatEventValue, formatEventTime } from '@/types/event';
import { CARD_STYLES } from '@/lib/constants';

interface EventCalendarProps {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventDelete: (event: CalendarEvent) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export default function EventCalendar({
  events,
  loading,
  error,
  currentDate,
  onDateChange,
  onEventClick,
  onEventDelete,
}: EventCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getDate() === current.getDate() &&
          eventDate.getMonth() === current.getMonth() &&
          eventDate.getFullYear() === current.getFullYear()
        );
      });

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        events: dayEvents,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Navigation handlers
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // Get event color by status
  const getEventColor = (status: CalendarEvent['status']) => {
    const statusInfo = EVENT_STATUS.find(s => s.value === status);
    return statusInfo?.color || 'blue';
  };

  // Format month and year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  };

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
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      <Card className={CARD_STYLES.primary}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Calendar className="w-5 h-5" />
              {formatMonthYear(currentDate)}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Hoje
              </Button>
              
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="rounded-r-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextMonth}
                  className="rounded-l-none border-l-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="h-10 flex items-center justify-center text-sm font-semibold text-slate-600 bg-slate-50 rounded-lg"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <motion.div 
                className="grid grid-cols-7 gap-1"
                variants={containerVariants}
              >
                {calendarDays.map((day, index) => (
                  <motion.div
                    key={day.date.toISOString()}
                    variants={itemVariants}
                    className={`
                      relative min-h-24 p-2 rounded-lg border border-slate-200 cursor-pointer transition-all duration-200
                      ${day.isCurrentMonth 
                        ? 'bg-white hover:bg-slate-50' 
                        : 'bg-slate-50 opacity-60'
                      }
                      ${day.isToday 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : ''
                      }
                      hover:shadow-md
                    `}
                    onClick={() => setSelectedDay(day)}
                  >
                    {/* Day number */}
                    <div className={`
                      text-sm font-medium mb-1
                      ${day.isCurrentMonth ? 'text-slate-900' : 'text-slate-400'}
                      ${day.isToday ? 'text-blue-600 font-bold' : ''}
                    `}>
                      {day.date.getDate()}
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {day.events.slice(0, 2).map((event) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`
                            text-xs px-2 py-1 rounded text-white cursor-pointer
                            hover:opacity-80 transition-opacity truncate
                            ${getEventColor(event.status) === 'green' ? 'bg-green-500' : ''}
                            ${getEventColor(event.status) === 'orange' ? 'bg-orange-500' : ''}
                            ${getEventColor(event.status) === 'red' ? 'bg-red-500' : ''}
                            ${getEventColor(event.status) === 'blue' ? 'bg-blue-500' : ''}
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          title={`${event.title} - ${formatEventTime(event.startTime, event.endTime)}`}
                        >
                          {event.title}
                        </motion.div>
                      ))}
                      
                      {/* More events indicator */}
                      {day.events.length > 2 && (
                        <div className="text-xs text-slate-500 font-medium">
                          +{day.events.length - 2} mais
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day detail popover */}
      <AnimatePresence>
        {selectedDay && selectedDay.events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedDay(null)}
          >
            <Card 
              className="w-96 max-h-96 overflow-y-auto bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {selectedDay.date.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDay(null)}
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {selectedDay.events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {event.title}
                        </h4>
                        
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatEventTime(event.startTime, event.endTime)}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.guestsCount} convidados
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatEventValue(event.totalValue)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {event.packageType}
                          </Badge>
                          
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              EVENT_STATUS.find(s => s.value === event.status)?.bgColor
                            } ${
                              EVENT_STATUS.find(s => s.value === event.status)?.textColor
                            }`}
                          >
                            {EVENT_STATUS.find(s => s.value === event.status)?.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-36" align="end">
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => {
                                onEventClick(event);
                                setSelectedDay(null);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                onEventDelete(event);
                                setSelectedDay(null);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
