import { CARD_STYLES } from "@/lib/constants";
import { motion } from 'framer-motion';
import { Event, EventsResponse } from '@/types/event';
import EventFinancialStatus from '@/components/EventFinancialStatus';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  DollarSign
} from 'lucide-react';
import { itemVariants } from '@/lib/animations';
import { 
  EVENT_STATUS, 
  formatEventValue 
} from '@/types/event';

interface EventListProps {
  events: Event[];
  pagination: EventsResponse['pagination'] | null;
  loading: boolean;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onPageChange: (page: number) => void;
  onSort: (field: 'date' | 'title' | 'createdAt' | 'totalValue', order: 'asc' | 'desc') => void;
  onManagePayments?: (event: Event) => void;
}

export default function EventList({
  events,
  pagination,
  loading,
  onEdit,
  onDelete,
  onPageChange,
  onSort,
  onManagePayments,
}: EventListProps) {
  const getStatusInfo = (status: Event['status']) => {
    return EVENT_STATUS.find(s => s.value === status) || EVENT_STATUS[0];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  if (loading && events.length === 0) {
    return (
      <Card className={CARD_STYLES.primary}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className={CARD_STYLES.primary}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-slate-900">
            <span>Lista de Eventos</span>
            {loading && (
              <Badge variant="secondary" className="animate-pulse">
                Carregando...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {events.length === 0 && !loading ? (
            <motion.div 
              variants={itemVariants}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum evento encontrado</h3>
              <p className="text-slate-600 mb-6">
                Tente ajustar os filtros de busca ou adicionar um novo evento.
              </p>
            </motion.div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 text-slate-700 font-semibold"
                      onClick={() => onSort('title', 'asc')}
                    >
                      Evento
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 text-slate-700 font-semibold"
                      onClick={() => onSort('date', 'asc')}
                    >
                      Data & Horário
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">Cliente</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Detalhes</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-slate-50 text-slate-700 font-semibold"
                      onClick={() => onSort('totalValue', 'desc')}
                    >
                      Valor
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">Status Evento</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Status Financeiro</TableHead>
                    <TableHead className="w-[100px] text-slate-700 font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {events.map((event) => {
                    const statusInfo = getStatusInfo(event.status);
                    
                    return (
                      <motion.tr 
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{event.title}</p>
                            <p className="text-sm text-slate-500">
                              {event.packageType}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-slate-600">
                              <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                              {formatDate(event.date)}
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                              <Clock className="h-3 w-3 mr-1 text-purple-500" />
                              {formatTime(event.startTime, event.endTime)}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">
                              {event.client?.name || 'Cliente não encontrado'}
                            </p>
                            
                            <div className="space-y-1 mt-1">
                              {event.client?.phone && (
                                <div className="flex items-center text-xs text-slate-500">
                                  <Phone className="h-2 w-2 mr-1" />
                                  {event.client.phone}
                                </div>
                              )}
                              {event.client?.email && (
                                <div className="flex items-center text-xs text-slate-500">
                                  <Mail className="h-2 w-2 mr-1" />
                                  {event.client.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1 text-green-500" />
                              {event.guestsCount} convidados
                            </div>
                            {event.notes && (
                              <p className="text-xs text-slate-500 truncate max-w-[150px]" title={event.notes}>
                                {event.notes}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="font-semibold text-slate-900">
                            {formatEventValue(event.totalValue)}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <EventFinancialStatus 
                            event={event} 
                            compact={true} 
                            showActions={false}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-slate-200">
                              <DropdownMenuItem 
                                onClick={() => onEdit(event)}
                                className="hover:bg-slate-50"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              {onManagePayments && (
                                <DropdownMenuItem 
                                  onClick={() => onManagePayments(event)}
                                  className="hover:bg-slate-50"
                                >
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Pagamentos
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => onDelete(event)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200"
            >
              <p className="text-sm text-slate-600">
                Mostrando {events.length} de {pagination.total} eventos
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="border-slate-300"
                >
                  Anterior
                </Button>
                <span className="text-sm text-slate-600">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="border-slate-300"
                >
                  Próxima
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
