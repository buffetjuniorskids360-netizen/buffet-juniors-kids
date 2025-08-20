import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Event, CreateEventData, UpdateEventData, PACKAGE_TYPES, TIME_SLOTS, EVENT_STATUS } from '@/types/event';
import { useClients } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Calendar, Clock, Users, Package, DollarSign, FileText } from 'lucide-react';

const eventSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  guestsCount: z.number().min(1, 'Mínimo 1 convidado').max(1000, 'Máximo 1000 convidados'),
  packageType: z.string().min(1, 'Tipo de pacote é obrigatório'),
  totalValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valor inválido'),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  notes: z.string().optional(),
});

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEventData | UpdateEventData) => Promise<void>;
  event?: Event | null;
  isLoading?: boolean;
}

export default function EventForm({
  isOpen,
  onClose,
  onSubmit,
  event,
  isLoading = false,
}: EventFormProps) {
  const { clients } = useClients();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<{
    clientId: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    guestsCount: string;
    packageType: string;
    totalValue: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    notes: string;
  }>({
    clientId: '',
    title: '',
    date: '',
    startTime: '14:00',
    endTime: '18:00',
    guestsCount: '20',
    packageType: 'standard',
    totalValue: '1500.00',
    status: 'pending',
    notes: '',
  });

  // Initialize form with event data when editing
  useEffect(() => {
    if (event) {
      setFormData({
        clientId: event.clientId,
        title: event.title,
        date: event.date.toISOString().split('T')[0], // YYYY-MM-DD format
        startTime: event.startTime,
        endTime: event.endTime,
        guestsCount: event.guestsCount.toString(),
        packageType: event.packageType,
        totalValue: event.totalValue,
        status: event.status,
        notes: event.notes || '',
      });
    } else {
      // Reset form for new event
      setFormData({
        clientId: '',
        title: '',
        date: '',
        startTime: '14:00',
        endTime: '18:00',
        guestsCount: '20',
        packageType: 'standard',
        totalValue: '1500.00',
        status: 'pending',
        notes: '',
      });
    }
    setErrors({});
    setSubmitError('');
  }, [event, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateTimeRange = (startTime: string, endTime: string): boolean => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    try {
      // Validate time range
      if (!validateTimeRange(formData.startTime, formData.endTime)) {
        setErrors({ endTime: 'Horário de fim deve ser posterior ao horário de início' });
        return;
      }

      // Prepare data for validation
      const dataToValidate = {
        ...formData,
        guestsCount: parseInt(formData.guestsCount),
        date: new Date(formData.date).toISOString(),
      };

      const validatedData = eventSchema.parse(dataToValidate);

      await onSubmit(validatedData);
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Erro inesperado ao salvar evento');
      }
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ padding: '32px' }}>
        <DialogHeader style={{ marginBottom: '24px' }}>
          <DialogTitle className="flex items-center text-slate-900" style={{ gap: '12px' }}>
            <Calendar className="w-6 h-6 text-blue-600" />
            {event ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              style={{ padding: '16px' }}
            >
              {submitError}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Selection */}
            <div className="md:col-span-2">
              <Label htmlFor="clientId" className="flex items-center text-sm font-medium text-slate-700" style={{ gap: '8px', marginBottom: '8px' }}>
                <Users className="w-4 h-4 text-blue-600" />
                Cliente *
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => handleInputChange('clientId', value)}
              >
                <SelectTrigger className={`h-12 ${errors.clientId ? 'border-red-300' : 'border-slate-300'}`}>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-red-500 text-sm" style={{ marginTop: '8px' }}>{errors.clientId}</p>
              )}
            </div>

            {/* Event Title */}
            <div className="md:col-span-2">
              <Label htmlFor="title" className="flex items-center text-sm font-medium text-slate-700" style={{ gap: '8px', marginBottom: '8px' }}>
                <FileText className="w-4 h-4 text-blue-600" />
                Título do Evento *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Aniversário de 8 anos da Sofia"
                className={`h-12 ${errors.title ? 'border-red-300' : 'border-slate-300'}`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm" style={{ marginTop: '8px' }}>{errors.title}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date" className="flex items-center text-sm font-medium text-slate-700" style={{ gap: '8px', marginBottom: '8px' }}>
                <Calendar className="w-4 h-4 text-blue-600" />
                Data *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`h-12 ${errors.date ? 'border-red-300' : 'border-slate-300'}`}
              />
              {errors.date && (
                <p className="text-red-500 text-sm" style={{ marginTop: '8px' }}>{errors.date}</p>
              )}
            </div>

            {/* Guests Count */}
            <div>
              <Label htmlFor="guestsCount" className="flex items-center text-sm font-medium text-slate-700" style={{ gap: '8px', marginBottom: '8px' }}>
                <Users className="w-4 h-4 text-blue-600" />
                Nº de Convidados *
              </Label>
              <Input
                id="guestsCount"
                type="number"
                min="1"
                max="1000"
                value={formData.guestsCount}
                onChange={(e) => handleInputChange('guestsCount', e.target.value)}
                className={`h-12 ${errors.guestsCount ? 'border-red-300' : 'border-slate-300'}`}
              />
              {errors.guestsCount && (
                <p className="text-red-500 text-sm" style={{ marginTop: '8px' }}>{errors.guestsCount}</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <Label htmlFor="startTime" className="flex items-center text-sm font-medium text-slate-700" style={{ gap: '8px', marginBottom: '8px' }}>
                <Clock className="w-4 h-4 text-blue-600" />
                Horário Início *
              </Label>
              <Select
                value={formData.startTime}
                onValueChange={(value) => handleInputChange('startTime', value)}
              >
                <SelectTrigger className={`h-12 ${errors.startTime ? 'border-red-300' : 'border-slate-300'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.startTime && (
                <p className="text-red-500 text-sm" style={{ marginTop: '8px' }}>{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <Label htmlFor="endTime" className="flex items-center text-sm font-medium text-slate-700" style={{ gap: '8px', marginBottom: '8px' }}>
                <Clock className="w-4 h-4 text-blue-600" />
                Horário Fim *
              </Label>
              <Select
                value={formData.endTime}
                onValueChange={(value) => handleInputChange('endTime', value)}
              >
                <SelectTrigger className={`h-12 ${errors.endTime ? 'border-red-300' : 'border-slate-300'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.endTime && (
                <p className="text-red-500 text-sm" style={{ marginTop: '8px' }}>{errors.endTime}</p>
              )}
            </div>

            {/* Package Type */}
            <div>
              <Label htmlFor="packageType" className="flex items-center text-sm font-medium text-slate-700" style={{ gap: '8px', marginBottom: '8px' }}>
                <Package className="w-4 h-4 text-blue-600" />
                Tipo de Pacote *
              </Label>
              <Select
                value={formData.packageType}
                onValueChange={(value) => handleInputChange('packageType', value)}
              >
                <SelectTrigger className={`h-12 ${errors.packageType ? 'border-red-300' : 'border-slate-300'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGE_TYPES.map((pkg) => (
                    <SelectItem key={pkg.value} value={pkg.value}>
                      <div>
                        <div className="font-medium">{pkg.label}</div>
                        <div className="text-xs text-slate-500">{pkg.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.packageType && (
                <p className="text-red-500 text-sm" style={{ marginTop: '8px' }}>{errors.packageType}</p>
              )}
            </div>

            {/* Total Value */}
            <div>
              <Label htmlFor="totalValue" className="flex items-center text-sm font-medium text-slate-700" style={{ gap: '8px', marginBottom: '8px' }}>
                <DollarSign className="w-4 h-4 text-blue-600" />
                Valor Total *
              </Label>
              <Input
                id="totalValue"
                value={formData.totalValue}
                onChange={(e) => handleInputChange('totalValue', e.target.value)}
                placeholder="1500.00"
                className={`h-12 ${errors.totalValue ? 'border-red-300' : 'border-slate-300'}`}
              />
              {errors.totalValue && (
                <p className="text-red-500 text-sm" style={{ marginTop: '8px' }}>{errors.totalValue}</p>
              )}
            </div>

            {/* Status */}
            {event && (
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-slate-700" style={{ marginBottom: '8px', display: 'block' }}>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="h-12 border-slate-300">
                    <SelectValue />
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
            )}

            {/* Notes */}
            <div className="md:col-span-2">
              <Label htmlFor="notes" className="text-sm font-medium text-slate-700" style={{ marginBottom: '8px', display: 'block' }}>Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Informações adicionais sobre o evento..."
                rows={4}
                className="resize-none min-h-[100px] border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end border-t border-slate-200" style={{ gap: '16px', paddingTop: '24px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              style={{ padding: '12px 24px' }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              style={{ padding: '12px 24px' }}
            >
              {isLoading ? 'Salvando...' : event ? 'Atualizar' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}