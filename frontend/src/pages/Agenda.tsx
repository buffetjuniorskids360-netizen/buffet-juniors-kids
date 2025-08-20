import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvents, useCalendarEvents } from '@/hooks/useEvents';
import { useClients } from '@/hooks/useClients';
import { Event, CalendarEvent, CreateEventData, UpdateEventData } from '@/types/event';
import EventForm from '@/components/EventForm';
import EventCalendar from '@/components/EventCalendar';
import EventList from '@/components/EventList';
import EventFinancialStatus from '@/components/EventFinancialStatus';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Calendar,
  List,
  Plus,
  Search, 
  Filter,
  ArrowLeft,
  CalendarDays,
  Clock,
  Users,
  DollarSign
} from 'lucide-react';
import { useLocation } from 'wouter';
import { pageVariants, pageTransition, containerVariants, itemVariants } from '@/lib/animations';
import { CARD_STYLES } from '@/lib/constants';
import { EVENT_STATUS, formatEventValue } from '@/types/event';

type ViewMode = 'calendar' | 'list';

export default function Agenda() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Persist view mode in localStorage
    const savedViewMode = localStorage.getItem('agenda-view-mode');
    return (savedViewMode === 'list' || savedViewMode === 'calendar') ? savedViewMode : 'calendar';
  });
  const [viewSwitching, setViewSwitching] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Current date for calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Hooks
  const {
    events,
    pagination,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    clientFilter,
    setClientFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    setSorting,
    setPage,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  } = useEvents();

  const { 
    events: calendarEvents, 
    loading: calendarLoading,
    error: calendarError,
    refreshCalendarEvents 
  } = useCalendarEvents(currentYear, currentMonth);

  const { clients } = useClients();

  // Data sync mechanism to prevent race conditions
  const syncDataSafely = useCallback(async () => {
    try {
      // Refresh both data sources with proper error handling
      const results = await Promise.allSettled([
        refreshEvents(),
        refreshCalendarEvents()
      ]);
      
      // Log any failures for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const source = index === 0 ? 'events list' : 'calendar events';
          console.error(`Failed to refresh ${source}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  }, [refreshEvents, refreshCalendarEvents]);

  // Effect to handle view mode changes and ensure data consistency
  useEffect(() => {
    // Only refresh data when view mode changes or on initial mount
    if (viewMode === 'calendar' && !calendarLoading) {
      refreshCalendarEvents();
    } else if (viewMode === 'list' && !loading) {
      refreshEvents();
    }
  }, [viewMode]); // Remove circular dependencies that cause infinite loop

  // Event handlers
  const handleEdit = (event: Event | CalendarEvent) => {
    // Convert CalendarEvent to Event if needed
    const fullEvent = 'clientId' in event ? event : {
      ...event,
      clientId: '', // Will be loaded from backend when editing
      createdAt: new Date(),
      updatedAt: new Date(),
      client: { id: '', name: event.clientName }
    };
    setSelectedEvent(fullEvent);
    setShowEditForm(true);
  };

  const handleDelete = (event: Event | CalendarEvent) => {
    // Convert CalendarEvent to Event if needed
    const fullEvent = 'clientId' in event ? event : {
      ...event,
      clientId: '', // Will be loaded from backend when deleting
      createdAt: new Date(),
      updatedAt: new Date(),
      client: { id: '', name: event.clientName }
    };
    setSelectedEvent(fullEvent);
    setShowDeleteConfirm(true);
  };

  const handleManagePayments = (event: Event) => {
    setSelectedEvent(event);
    setShowPaymentModal(true);
  };

  const confirmDelete = async () => {
    if (selectedEvent) {
      try {
        await deleteEvent(selectedEvent.id);
        setShowDeleteConfirm(false);
        setSelectedEvent(null);
        // Safely sync data across both views
        await syncDataSafely();
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
      // Safely sync data across both views
      await syncDataSafely();
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
      // Safely sync data across both views
      await syncDataSafely();
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

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setClientFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  // Enhanced view switching with proper error handling and loading states
  const handleViewModeChange = async (newViewMode: ViewMode) => {
    if (newViewMode === viewMode) return;
    
    try {
      setViewSwitching(true);
      
      // Small delay to show loading state during view transition
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Persist view mode selection
      localStorage.setItem('agenda-view-mode', newViewMode);
      setViewMode(newViewMode);
      
      // Refresh data for the new view if needed
      if (newViewMode === 'calendar') {
        refreshCalendarEvents();
      } else {
        refreshEvents();
      }
    } catch (error) {
      console.error('Error switching view mode:', error);
      // Keep the previous view mode if switching fails
    } finally {
      setViewSwitching(false);
    }
  };

  // Calculate stats
  const totalEvents = pagination?.total || 0;
  const confirmedEvents = events.filter(e => e.status === 'confirmed').length;
  const pendingEvents = events.filter(e => e.status === 'pending').length;
  const totalRevenue = events
    .filter(e => e.status === 'confirmed' || e.status === 'completed')
    .reduce((sum, e) => sum + parseFloat(e.totalValue), 0);

  // Combined error handling for both views
  const hasError = error || (viewMode === 'calendar' && calendarError);
  const displayError = error || calendarError;

  if (hasError && !viewSwitching) {
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
                <p className="text-lg font-semibold">Erro ao carregar agenda</p>
                <p className="text-sm">{displayError}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4"
                  variant="outline"
                >
                  Recarregar Página
                </Button>
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
                <CalendarDays className="w-8 h-8 text-purple-600" />
              </div>
              <div style={{ gap: '8px' }}>
                <h1 className="text-3xl font-bold text-slate-900" style={{ marginBottom: '8px' }}>Agenda</h1>
                <p className="text-slate-600">
                  Gerencie eventos e festas do seu buffet
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center" style={{ gap: '16px' }}>
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg border border-slate-200" style={{ padding: '4px', gap: '4px' }}>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('calendar')}
                disabled={viewSwitching}
                className="flex items-center"
                style={{ gap: '8px', padding: '8px 16px' }}
              >
                {viewSwitching && viewMode !== 'calendar' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Calendar className="w-4 h-4" />
                )}
                Calendário
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
                disabled={viewSwitching}
                className="flex items-center"
                style={{ gap: '8px', padding: '8px 16px' }}
              >
                {viewSwitching && viewMode !== 'list' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <List className="w-4 h-4" />
                )}
                Lista
              </Button>
            </div>
            
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

        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-4"
          style={{ gap: '24px', marginBottom: '32px' }}
        >
          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '24px' }}>
                <div className="flex items-center justify-between">
                  <div style={{ gap: '8px' }}>
                    <p className="text-sm font-medium text-slate-600" style={{ marginBottom: '8px' }}>Total de Eventos</p>
                    <p className="text-2xl font-bold text-blue-600">{totalEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '24px' }}>
                <div className="flex items-center justify-between">
                  <div style={{ gap: '8px' }}>
                    <p className="text-sm font-medium text-slate-600" style={{ marginBottom: '8px' }}>Confirmados</p>
                    <p className="text-2xl font-bold text-green-600">{confirmedEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '24px' }}>
                <div className="flex items-center justify-between">
                  <div style={{ gap: '8px' }}>
                    <p className="text-sm font-medium text-slate-600" style={{ marginBottom: '8px' }}>Pendentes</p>
                    <p className="text-2xl font-bold text-orange-600">{pendingEvents}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '24px' }}>
                <div className="flex items-center justify-between">
                  <div style={{ gap: '8px' }}>
                    <p className="text-sm font-medium text-slate-600" style={{ marginBottom: '8px' }}>Receita Confirmada</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatEventValue(totalRevenue.toString())}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters (only for list view) */}
        {viewMode === 'list' && (
          <motion.div 
            variants={itemVariants}
            style={{ marginBottom: '32px' }}
          >
            <Card className={CARD_STYLES.primary}>
              <CardHeader style={{ padding: '24px 24px 16px' }}>
                <CardTitle className="flex items-center text-slate-900" style={{ gap: '12px' }}>
                  <Filter className="w-5 h-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: '0 24px 24px' }}>
                <div className="grid grid-cols-1 md:grid-cols-5" style={{ gap: '20px', marginBottom: '24px' }}>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar eventos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-11 h-11"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os Status</SelectItem>
                      {EVENT_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status.bgColor}`} />
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Client Filter */}
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os Clientes</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Date From */}
                  <Input
                    type="date"
                    placeholder="Data inicial"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="h-11"
                  />

                  {/* Date To */}
                  <Input
                    type="date"
                    placeholder="Data final"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Active filters and clear */}
                {(searchQuery || statusFilter || clientFilter || dateFromFilter || dateToFilter) && (
                  <div className="flex items-center justify-between" style={{ paddingTop: '16px' }}>
                    <div className="flex items-center flex-wrap" style={{ gap: '8px' }}>
                      {searchQuery && (
                        <Badge variant="secondary">
                          Busca: {searchQuery}
                        </Badge>
                      )}
                      {statusFilter && (
                        <Badge variant="secondary">
                          Status: {EVENT_STATUS.find(s => s.value === statusFilter)?.label}
                        </Badge>
                      )}
                      {clientFilter && (
                        <Badge variant="secondary">
                          Cliente: {clients.find(c => c.id === clientFilter)?.name}
                        </Badge>
                      )}
                      {dateFromFilter && (
                        <Badge variant="secondary">
                          De: {new Date(dateFromFilter).toLocaleDateString('pt-BR')}
                        </Badge>
                      )}
                      {dateToFilter && (
                        <Badge variant="secondary">
                          Até: {new Date(dateToFilter).toLocaleDateString('pt-BR')}
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={clearFilters} style={{ padding: '8px 16px' }}>
                      Limpar Filtros
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div variants={itemVariants} className="relative" style={{ marginBottom: '32px' }}>
          {viewSwitching && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center" style={{ gap: '16px', padding: '24px' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium text-slate-600">
                  Alternando visualização...
                </span>
              </div>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {viewMode === 'calendar' ? (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <EventCalendar
                  events={calendarEvents}
                  loading={calendarLoading}
                  error={calendarError}
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  onEventClick={handleEdit}
                  onEventDelete={handleDelete}
                />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <EventList
                  events={events}
                  pagination={pagination}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPageChange={setPage}
                  onSort={setSorting}
                  onManagePayments={handleManagePayments}
                />
              </motion.div>
            )}
          </AnimatePresence>
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
          description={`Tem certeza que deseja excluir o evento "${selectedEvent?.title}"? Esta ação também removerá todos os pagamentos relacionados.`}
          isLoading={loading}
        />

        {/* Payment Management Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white" style={{ padding: '32px' }}>
            <DialogHeader style={{ marginBottom: '24px' }}>
              <DialogTitle className="flex items-center" style={{ gap: '12px' }}>
                <DollarSign className="w-6 h-6 text-green-600" />
                Gestão Financeira - {selectedEvent?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedEvent && (
              <EventFinancialStatus 
                event={selectedEvent} 
                compact={false} 
                showActions={true}
                onPaymentAdded={async () => {
                  // Safely sync data across both views
                  await syncDataSafely();
                }}
              />
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </motion.div>
  );
}