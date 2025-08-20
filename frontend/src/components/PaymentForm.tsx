import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { 
  Payment, 
  CreatePaymentData, 
  UpdatePaymentData, 
  PAYMENT_METHODS, 
  PAYMENT_STATUS,
  formatPaymentValue 
} from '@/types/payment';
import { Event } from '@/types/event';
import { useEvents } from '@/hooks/useEvents';
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
import { 
  DollarSign, 
  Calendar, 
  CreditCard, 
  FileText,
  Users,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const paymentSchema = z.object({
  eventId: z.string().min(1, 'Evento é obrigatório'),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valor inválido'),
  paymentMethod: z.enum(['cash', 'card', 'pix', 'transfer']),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  dueDate: z.string().optional(),
  paymentDate: z.string().optional(),
  notes: z.string().optional(),
});

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentData | UpdatePaymentData) => Promise<void>;
  payment?: Payment | null;
  preselectedEvent?: Event | null;
  eventId?: string;
  eventTotal?: number;
  alreadyPaid?: number;
  isLoading?: boolean;
}

export default function PaymentForm({
  isOpen,
  onClose,
  onSubmit,
  payment,
  preselectedEvent,
  eventId,
  eventTotal,
  alreadyPaid = 0,
  isLoading = false,
}: PaymentFormProps) {
  const { events } = useEvents();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<{
    eventId: string;
    amount: string;
    paymentMethod: 'cash' | 'card' | 'pix' | 'transfer';
    status: 'pending' | 'paid' | 'overdue';
    dueDate: string;
    paymentDate: string;
    notes: string;
  }>({
    eventId: '',
    amount: '',
    paymentMethod: 'card',
    status: 'pending',
    dueDate: '',
    paymentDate: '',
    notes: '',
  });

  // Get selected event for amount suggestions
  const selectedEvent = events.find(e => e.id === formData.eventId) || preselectedEvent || events.find(e => e.id === eventId);

  // Initialize form with payment data when editing
  useEffect(() => {
    if (payment) {
      setFormData({
        eventId: payment.eventId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        dueDate: payment.dueDate ? payment.dueDate.toISOString().split('T')[0] : '',
        paymentDate: payment.paymentDate ? payment.paymentDate.toISOString().split('T')[0] : '',
        notes: payment.notes || '',
      });
    } else {
      // Reset form for new payment
      const today = new Date().toISOString().split('T')[0];
      const suggestedAmount = eventTotal ? eventTotal.toString() : preselectedEvent?.totalValue || '';
      setFormData({
        eventId: eventId || preselectedEvent?.id || '',
        amount: suggestedAmount,
        paymentMethod: 'card',
        status: 'pending',
        dueDate: today,
        paymentDate: '',
        notes: '',
      });
    }
    setErrors({});
    setSubmitError('');
  }, [payment, preselectedEvent, eventId, eventTotal, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-fill amount when event is selected
    if (field === 'eventId' && !payment) {
      const event = events.find(e => e.id === value);
      if (event) {
        setFormData(prev => ({ ...prev, amount: event.totalValue }));
      }
    }

    // Auto-set payment date when status changes to paid
    if (field === 'status' && value === 'paid' && !formData.paymentDate) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, paymentDate: today }));
    }
  };

  const handleQuickAmount = (percentage: number) => {
    if (selectedEvent) {
      const amount = (parseFloat(selectedEvent.totalValue) * percentage / 100).toFixed(2);
      setFormData(prev => ({ ...prev, amount }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    try {
      // Prepare data for validation
      const dataToValidate = {
        ...formData,
        ...(formData.dueDate && { dueDate: new Date(formData.dueDate).toISOString() }),
        ...(formData.paymentDate && { paymentDate: new Date(formData.paymentDate).toISOString() }),
      };

      const validatedData = paymentSchema.parse(dataToValidate);

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
        setSubmitError('Erro inesperado ao salvar pagamento');
      }
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-orange-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <DollarSign className="w-5 h-5 text-green-600" />
            {payment ? 'Editar Pagamento' : 'Novo Pagamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {submitError}
            </motion.div>
          )}

          {/* Event Selection */}
          <div>
            <Label htmlFor="eventId" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              Evento *
            </Label>
            <Select
              value={formData.eventId}
              onValueChange={(value) => handleInputChange('eventId', value)}
              disabled={!!preselectedEvent}
            >
              <SelectTrigger className={errors.eventId ? 'border-red-300' : ''}>
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-slate-500">
                        {event.client?.name} - {formatPaymentValue(event.totalValue)}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventId && (
              <p className="text-red-500 text-xs mt-1">{errors.eventId}</p>
            )}
          </div>

          {/* Event Summary */}
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-50 rounded-lg"
            >
              <h4 className="font-medium text-slate-900 mb-2">Resumo do Evento</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Cliente:</span>
                  <span className="ml-2 font-medium">{selectedEvent.client?.name}</span>
                </div>
                <div>
                  <span className="text-slate-600">Data:</span>
                  <span className="ml-2 font-medium">
                    {selectedEvent.date.toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">Valor Total:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {formatPaymentValue(selectedEvent.totalValue)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-slate-500 mr-1" />
                  <span className="text-slate-600">{selectedEvent.guestsCount} convidados</span>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Valor *
              </Label>
              <Input
                id="amount"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="1500.00"
                className={errors.amount ? 'border-red-300' : ''}
              />
              {selectedEvent && !payment && (
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(25)}
                    className="text-xs"
                  >
                    25%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(50)}
                    className="text-xs"
                  >
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(100)}
                    className="text-xs"
                  >
                    Total
                  </Button>
                </div>
              )}
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="paymentMethod" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Forma de Pagamento *
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <span>{method.icon}</span>
                        {method.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status" className="flex items-center gap-2">
                {getStatusIcon(formData.status)}
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.value)}
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="dueDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                Data de Vencimento
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>

            {/* Payment Date - only if status is paid */}
            {formData.status === 'paid' && (
              <div className="md:col-span-2">
                <Label htmlFor="paymentDate" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Data do Pagamento
                </Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              Observações
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Informações adicionais sobre o pagamento..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isLoading ? 'Salvando...' : payment ? 'Atualizar' : 'Criar Pagamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}