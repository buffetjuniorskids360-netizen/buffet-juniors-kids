import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Event } from '@/types/event';
import { Payment, CreatePaymentData, UpdatePaymentData, formatPaymentValue, getPaymentStatusInfo, getPaymentMethodInfo, isPaymentOverdue } from '@/types/payment';
import { useEventPayments } from '@/hooks/usePayments';
import PaymentForm from '@/components/PaymentForm';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  DollarSign,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { CARD_STYLES } from '@/lib/constants';

interface EventPaymentsProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onCreatePayment: (paymentData: CreatePaymentData) => Promise<void>;
  onUpdatePayment: (paymentId: string, paymentData: UpdatePaymentData) => Promise<void>;
  onDeletePayment: (paymentId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function EventPayments({
  event,
  isOpen,
  onClose,
  onCreatePayment,
  onUpdatePayment,
  onDeletePayment,
  isLoading = false,
}: EventPaymentsProps) {
  const { payments, summary, loading: paymentsLoading, refreshEventPayments } = useEventPayments(event.id);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowEditForm(true);
  };

  const handleDelete = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedPayment) {
      try {
        await onDeletePayment(selectedPayment.id);
        setShowDeleteConfirm(false);
        setSelectedPayment(null);
        refreshEventPayments();
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  const handleCreatePayment = async (paymentData: any) => {
    try {
      await onCreatePayment({ ...paymentData, eventId: event.id });
      setShowCreateForm(false);
      refreshEventPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  };

  const handleUpdatePayment = async (paymentData: any) => {
    if (!selectedPayment) return;
    
    try {
      await onUpdatePayment(selectedPayment.id, paymentData);
      setShowEditForm(false);
      setSelectedPayment(null);
      refreshEventPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  };

  const paymentProgress = summary ? (summary.paidAmount / summary.totalAmount) * 100 : 0;
  const overduePayments = payments.filter(isPaymentOverdue);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <DollarSign className="w-5 h-5 text-green-600" />
            Pagamentos - {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Summary */}
          <Card className={CARD_STYLES.primary}>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{event.title}</h4>
                  <p className="text-sm text-slate-600">Cliente: {event.client?.name}</p>
                  <p className="text-sm text-slate-600">
                    Data: {event.date.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPaymentValue(event.totalValue)}
                  </div>
                  <p className="text-sm text-slate-600">Valor Total do Evento</p>
                </div>
                <div className="flex items-center justify-center">
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Pagamento
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <Card className={CARD_STYLES.primary}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPaymentValue(summary.paidAmount)}
                  </div>
                  <p className="text-sm text-slate-600">Pago</p>
                  <div className="flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">{summary.paidPayments} pagamentos</span>
                  </div>
                </CardContent>
              </Card>

              <Card className={CARD_STYLES.primary}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatPaymentValue(summary.pendingAmount)}
                  </div>
                  <p className="text-sm text-slate-600">Pendente</p>
                  <div className="flex items-center justify-center mt-1">
                    <Clock className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-xs text-orange-600">{summary.pendingPayments} pagamentos</span>
                  </div>
                </CardContent>
              </Card>

              <Card className={CARD_STYLES.primary}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {summary.overduePayments}
                  </div>
                  <p className="text-sm text-slate-600">Em Atraso</p>
                  <div className="flex items-center justify-center mt-1">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-xs text-red-600">pagamentos</span>
                  </div>
                </CardContent>
              </Card>

              <Card className={CARD_STYLES.primary}>
                <CardContent className="p-4">
                  <div className="text-center mb-2">
                    <div className="text-lg font-bold text-slate-900">
                      {paymentProgress.toFixed(1)}%
                    </div>
                    <p className="text-sm text-slate-600">Progresso</p>
                  </div>
                  <Progress value={paymentProgress} className="h-2" />
                  <div className="flex items-center justify-center mt-1">
                    <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-xs text-blue-600">
                      {summary.paidPayments}/{summary.totalPayments}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Overdue Alerts */}
          {overduePayments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-900">
                      Pagamentos em Atraso ({overduePayments.length})
                    </h4>
                  </div>
                  <p className="text-sm text-red-700">
                    Existem pagamentos vencidos que precisam de atenção imediata.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payments Table */}
          <Card className={CARD_STYLES.primary}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-slate-900">
                <span>Lista de Pagamentos</span>
                {paymentsLoading && (
                  <Badge variant="secondary" className="animate-pulse">
                    Carregando...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 && !paymentsLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Nenhum pagamento cadastrado
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Comece adicionando o primeiro pagamento para este evento.
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Primeiro Pagamento
                  </Button>
                </motion.div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-slate-700 font-semibold">Valor</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Método</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Vencimento</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Pagamento</TableHead>
                        <TableHead className="text-slate-700 font-semibold">Observações</TableHead>
                        <TableHead className="w-[100px] text-slate-700 font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {payments.map((payment) => {
                          const statusInfo = getPaymentStatusInfo(payment.status);
                          const methodInfo = getPaymentMethodInfo(payment.paymentMethod);
                          const overdue = isPaymentOverdue(payment);
                          
                          return (
                            <motion.tr
                              key={payment.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className={`hover:bg-slate-50 transition-colors ${
                                overdue ? 'bg-red-50' : ''
                              }`}
                            >
                              <TableCell>
                                <div className="font-semibold text-slate-900">
                                  {formatPaymentValue(payment.amount)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0`}
                                >
                                  {statusInfo.label}
                                </Badge>
                                {overdue && (
                                  <AlertTriangle className="w-4 h-4 text-red-500 ml-2 inline" />
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span>{methodInfo.icon}</span>
                                  <span className="text-sm">{methodInfo.label}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {payment.dueDate ? (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    {payment.dueDate.toLocaleDateString('pt-BR')}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {payment.paymentDate ? (
                                  <div className="flex items-center gap-2 text-sm text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    {payment.paymentDate.toLocaleDateString('pt-BR')}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-slate-600 truncate max-w-[150px] block">
                                  {payment.notes || '-'}
                                </span>
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
                                      onClick={() => handleEdit(payment)}
                                      className="hover:bg-slate-50"
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(payment)}
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
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>

        {/* Payment Form Modals */}
        <PaymentForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreatePayment}
          preselectedEvent={event}
          isLoading={isLoading}
        />

        <PaymentForm
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setSelectedPayment(null);
          }}
          onSubmit={handleUpdatePayment}
          payment={selectedPayment}
          isLoading={isLoading}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Excluir Pagamento"
          description={`Tem certeza que deseja excluir este pagamento de ${
            selectedPayment ? formatPaymentValue(selectedPayment.amount) : ''
          }?`}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}