import { useState } from 'react';
import { motion } from 'framer-motion';
import { useEvents } from '@/hooks/useEvents';
import { CalendarEvent, Event, CreateEventData, UpdateEventData } from '@/types/event';
import Calendar from '@/components/Calendar';
import EventPipeline from '@/components/EventPipeline';
import EventForm from '@/components/EventForm';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Calendar as CalendarIcon,
  ArrowLeft,
  List,
  Grid,
  Kanban
} from 'lucide-react';
import { useLocation } from 'wouter';
import { pageVariants, pageTransition, itemVariants } from '@/lib/animations';
import { CARD_STYLES } from '@/lib/constants';

type ViewMode = 'calendar' | 'pipeline' | 'list';

export default function CalendarView() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);

  const {
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    loading,
  } = useEvents();

  const handleStatusChange = async (eventId: string, newStatus: Event['status']) => {
    try {
      await updateEvent(eventId, { status: newStatus });
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const handleEventClick = async (calendarEvent: CalendarEvent) => {
    try {
      const fullEvent = await getEvent(calendarEvent.id);
      setSelectedEvent(fullEvent);
      setShowEditForm(true);
    } catch (error) {
      console.error('Error loading event:', error);
    }
  };

  const handleDateClick = (date: Date) => {
    setPrefilledDate(date);
    setShowCreateForm(true);
  };

  const handleCreateEvent = () => {
    setPrefilledDate(null);
    setShowCreateForm(true);
  };

  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedEvent) {
      try {
        await deleteEvent(selectedEvent.id);
        setShowDeleteConfirm(false);
        setSelectedEvent(null);
        setShowEditForm(false);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleCreateEventSubmit = async (data: CreateEventData | UpdateEventData) => {
    try {
      // For create form, we know it's CreateEventData
      const createData = data as CreateEventData;
      
      // If there's a prefilled date, use it
      if (prefilledDate) {
        createData.date = prefilledDate.toISOString();
      }
      
      await createEvent(createData);
      setShowCreateForm(false);
      setPrefilledDate(null);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const handleUpdateEventSubmit = async (data: CreateEventData | UpdateEventData) => {
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
    setPrefilledDate(null);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedEvent(null);
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Agenda</h1>
                <p className="text-slate-600">
                  Calendário e pipeline de eventos
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={`h-8 ${viewMode === 'calendar' ? 'bg-purple-600 text-white' : ''}`}
                title="Visualização Calendário"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('pipeline')}
                className={`h-8 ${viewMode === 'pipeline' ? 'bg-purple-600 text-white' : ''}`}
                title="Visualização Pipeline"
              >
                <Kanban className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`h-8 ${viewMode === 'list' ? 'bg-purple-600 text-white' : ''}`}
                title="Visualização Lista"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/events')}
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              Lista Completa
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {viewMode === 'calendar' && (
            <Calendar
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onCreateEvent={handleCreateEvent}
            />
          )}
          
          {viewMode === 'pipeline' && (
            <EventPipeline
              onEventClick={(event) => {
                setSelectedEvent(event);
                setShowEditForm(true);
              }}
              onCreateEvent={handleCreateEvent}
              onStatusChange={handleStatusChange}
            />
          )}
          
          {viewMode === 'list' && (
            <Card className={CARD_STYLES.primary}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <List className="w-5 h-5 text-purple-600" />
                  Visualização em Lista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Visualização em Lista</p>
                  <p className="mb-4">A visualização em lista está em desenvolvimento.</p>
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={() => setViewMode('calendar')}
                      className="flex items-center gap-2"
                    >
                      <Grid className="w-4 h-4" />
                      Ver Calendário
                    </Button>
                    <Button
                      onClick={() => setViewMode('pipeline')}
                      className="flex items-center gap-2"
                    >
                      <Kanban className="w-4 h-4" />
                      Ver Pipeline
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setLocation('/events')}
                      className="flex items-center gap-2"
                    >
                      <List className="w-4 h-4" />
                      Lista Completa de Eventos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Floating Quick Actions */}
        <motion.div 
          variants={itemVariants}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleCreateEvent}
              className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              title="Criar Novo Evento"
            >
              <CalendarIcon className="w-6 h-6" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setLocation('/events')}
              className="w-14 h-14 rounded-full shadow-lg bg-white border-2 border-slate-200 hover:border-purple-300"
              title="Ver Lista de Eventos"
            >
              <List className="w-6 h-6" />
            </Button>
          </div>
        </motion.div>

        {/* Event Form Modals */}
        <EventForm
          isOpen={showCreateForm}
          onClose={handleCloseCreateForm}
          onSubmit={handleCreateEventSubmit}
          isLoading={loading}
        />

        <EventForm
          isOpen={showEditForm}
          onClose={handleCloseEditForm}
          onSubmit={handleUpdateEventSubmit}
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

        {/* Edit Event Actions */}
        {showEditForm && selectedEvent && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <Button
              variant="outline"
              onClick={() => handleDeleteEvent(selectedEvent)}
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              Excluir Evento
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}