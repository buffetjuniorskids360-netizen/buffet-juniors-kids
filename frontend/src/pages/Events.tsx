import { useState } from 'react';
import { motion } from 'framer-motion';
import { useEvents } from '@/hooks/useEvents';
import { Event, CreateEventData, UpdateEventData, getStatusInfo, formatEventTime, formatEventDate, formatEventValue } from '@/types/event';
import EventForm from '@/components/EventForm';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  Users,
  ArrowLeft
} from 'lucide-react';
import { useLocation } from 'wouter';
import { pageVariants, pageTransition, containerVariants, itemVariants } from '@/lib/animations';
import { CARD_STYLES } from '@/lib/constants';

export default function Events() {
  const {
    events,
    pagination,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    setSorting,
    setPage,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();

  const [, setLocation] = useLocation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setShowEditForm(true);
  };

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedEvent) {
      try {
        await deleteEvent(selectedEvent.id);
        setShowDeleteConfirm(false);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleCreateEvent = async (data: CreateEventData | UpdateEventData) => {
    try {
      // For create form, we know it's CreateEventData
      await createEvent(data as CreateEventData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const handleUpdateEvent = async (data: CreateEventData | UpdateEventData) => {
    if (!selectedEvent) return;
    
    try {
      // For update form, we know it's UpdateEventData
      await updateEvent(selectedEvent.id, data as UpdateEventData);
      setShowEditForm(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedEvent(null);
  };

  if (error) {
    return (
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="min-h-screen bg-slate-50 p-6 w-full"
      >
        <div className="max-w-7xl mx-auto">
          <Card className={CARD_STYLES.primary}>
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                <p className="text-lg font-semibold">Erro ao carregar eventos</p>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="min-h-screen bg-slate-50 w-full"
      style={{ padding: '24px 16px' }}
    >
      <div className="max-w-7xl mx-auto" style={{ gap: '32px' }}>
        <div className="space-y-8">
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between"
          style={{ marginBottom: '32px' }}
        >
          <div className="flex items-center" style={{ gap: '24px' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <div className="flex items-center" style={{ gap: '24px' }}>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <div style={{ gap: '8px' }}>
                <h1 className="text-3xl font-bold text-slate-900" style={{ marginBottom: '8px' }}>Eventos</h1>
                <p className="text-slate-600">
                  Gerencie os eventos do seu buffet
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center" style={{ gap: '16px' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/calendar')}
              className="flex items-center"
              style={{ gap: '8px', padding: '10px 20px' }}
            >
              <Calendar className="w-4 h-4" />
              Ver Calendário
            </Button>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center"
              style={{ gap: '8px', padding: '12px 24px' }}
            >
              <Plus className="h-5 w-5" />
              Novo Evento
            </Button>
          </div>
        </motion.div>

        {/* Search and Stats */}
        <motion.div 
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-4"
          style={{ gap: '24px', marginBottom: '32px' }}
        >
          <motion.div variants={itemVariants} className="md:col-span-3">
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '24px' }}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Buscar por título, pacote ou observações..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '24px' }}>
                <div className="text-center" style={{ gap: '8px' }}>
                  <p className="text-2xl font-bold text-purple-600" style={{ marginBottom: '8px' }}>
                    {pagination?.total || 0}
                  </p>
                  <p className="text-sm text-slate-600">Total de Eventos</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Events Table */}
        <motion.div variants={itemVariants}>
          <Card className={CARD_STYLES.primary}>
            <CardHeader style={{ padding: '32px 32px 24px' }}>
              <CardTitle className="flex items-center justify-between text-slate-900" style={{ gap: '16px' }}>
                <span>Lista de Eventos</span>
                {loading && (
                  <Badge variant="secondary" className="animate-pulse">
                    Carregando...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '0 32px 32px' }}>
              {events.length === 0 && !loading ? (
                <motion.div 
                  variants={itemVariants}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto" style={{ marginBottom: '24px' }}>
                    <Calendar className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900" style={{ marginBottom: '16px' }}>Nenhum evento encontrado</h3>
                  <p className="text-slate-600" style={{ marginBottom: '32px' }}>
                    {searchQuery 
                      ? 'Tente ajustar os filtros de busca ou adicionar um novo evento.'
                      : 'Comece adicionando seu primeiro evento.'}
                  </p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center"
                    style={{ gap: '8px', padding: '12px 24px' }}
                  >
                    <Plus className="h-5 w-5" />
                    Adicionar Primeiro Evento
                  </Button>
                </motion.div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-50 text-slate-700 font-semibold"
                          onClick={() => setSorting('title', 'asc')}
                        >
                          Evento
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold">Cliente</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-50 text-slate-700 font-semibold"
                          onClick={() => setSorting('date', 'asc')}
                        >
                          Data & Horário
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold">Detalhes</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-slate-50 text-slate-700 font-semibold"
                          onClick={() => setSorting('totalValue', 'desc')}
                        >
                          Valor
                        </TableHead>
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
                            <TableCell style={{ padding: '20px 12px' }}>
                              <div style={{ gap: '4px' }}>
                                <p className="font-medium text-slate-900" style={{ marginBottom: '4px' }}>{event.title}</p>
                                <p className="text-sm text-slate-500">{event.packageType}</p>
                              </div>
                            </TableCell>
                            <TableCell style={{ padding: '20px 12px' }}>
                              <div style={{ gap: '4px' }}>
                                <p className="font-medium text-slate-900" style={{ marginBottom: '4px' }}>{event.client?.name}</p>
                                {event.client?.phone && (
                                  <p className="text-sm text-slate-500">{event.client.phone}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell style={{ padding: '20px 12px' }}>
                              <div style={{ gap: '8px' }}>
                                <div className="flex items-center text-sm text-slate-600" style={{ gap: '8px', marginBottom: '6px' }}>
                                  <Calendar className="h-4 w-4 text-purple-500" />
                                  {formatEventDate(event.date)}
                                </div>
                                <div className="flex items-center text-sm text-slate-600" style={{ gap: '8px' }}>
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  {formatEventTime(event.startTime, event.endTime)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell style={{ padding: '20px 12px' }}>
                              <div className="flex items-center text-sm text-slate-600" style={{ gap: '8px' }}>
                                <Users className="h-4 w-4 text-green-500" />
                                {event.guestsCount} convidados
                              </div>
                            </TableCell>
                            <TableCell style={{ padding: '20px 12px' }}>
                              <Badge 
                                className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0`}
                                style={{ padding: '6px 12px' }}
                              >
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell style={{ padding: '20px 12px' }}>
                              <span className="font-medium text-slate-900">
                                {formatEventValue(event.totalValue)}
                              </span>
                            </TableCell>
                            <TableCell style={{ padding: '20px 12px' }}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white border-slate-200">
                                  <DropdownMenuItem 
                                    onClick={() => handleEdit(event)}
                                    className="hover:bg-slate-50"
                                    style={{ gap: '12px', padding: '12px 16px' }}
                                  >
                                    <Edit className="h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(event)}
                                    className="text-red-600 hover:bg-red-50"
                                    style={{ gap: '12px', padding: '12px 16px' }}
                                  >
                                    <Trash2 className="h-4 w-4" />
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
                  className="flex items-center justify-between border-t border-slate-200"
                  style={{ marginTop: '32px', paddingTop: '24px' }}
                >
                  <p className="text-sm text-slate-600">
                    Mostrando {events.length} de {pagination.total} eventos
                  </p>
                  <div className="flex items-center" style={{ gap: '16px' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="border-slate-300"
                      style={{ padding: '8px 16px' }}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-slate-600" style={{ padding: '0 8px' }}>
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="border-slate-300"
                      style={{ padding: '8px 16px' }}
                    >
                      Próxima
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Event Form Modals */}
        <EventForm
          isOpen={showCreateForm}
          onClose={handleCloseCreateForm}
          onSubmit={handleCreateEvent}
          isLoading={loading}
        />

        <EventForm
          isOpen={showEditForm}
          onClose={handleCloseEditForm}
          onSubmit={handleUpdateEvent}
          event={selectedEvent}
          isLoading={loading}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Excluir Evento"
          description={`Tem certeza que deseja excluir o evento "${selectedEvent?.title}"?`}
          isLoading={loading}
        />
        </div>
      </div>
    </motion.div>
  );
}