import { useState } from 'react';
import { motion } from 'framer-motion';
import { Event } from '@/types/event';
import { useEventPayments } from '@/hooks/usePayments';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import PaymentForm from '@/components/PaymentForm';
import { paymentService } from '@/services/paymentService';
import { CreatePaymentData, UpdatePaymentData } from '@/types/payment';
import { 
  DollarSign, 
  CreditCard, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  TrendingUp
} from 'lucide-react';
import { 
  formatPaymentValue, 
  formatPaymentDate, 
  getPaymentStatusInfo, 
  getPaymentMethodInfo 
} from '@/types/payment';
import { itemVariants } from '@/lib/animations';
import { CARD_STYLES } from '@/lib/constants';

interface EventFinancialStatusProps {
  event: Event;
  compact?: boolean;
  showActions?: boolean;
  onPaymentAdded?: () => void;
}

export default function EventFinancialStatus({ 
  event, 
  compact = false, 
  showActions = true,
  onPaymentAdded 
}: EventFinancialStatusProps) {
  const { payments, summary, loading, error, refreshEventPayments } = useEventPayments(event.id);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  const handlePaymentCreated = async (data: CreatePaymentData | UpdatePaymentData) => {
    try {
      // Since we're only creating payments in this context, we know it's CreatePaymentData
      await paymentService.createPayment(data as CreatePaymentData);
      setShowPaymentForm(false);
      refreshEventPayments();
      onPaymentAdded?.();
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  };

  // Calculate financial status
  const eventTotal = parseFloat(event.totalValue);
  const paidAmount = summary?.paidAmount || 0;
  const pendingAmount = summary?.pendingAmount || 0;
  const paymentProgress = eventTotal > 0 ? (paidAmount / eventTotal) * 100 : 0;
  const isFullyPaid = paidAmount >= eventTotal;
  const hasOverduePayments = summary?.overduePayments && summary.overduePayments > 0;

  // Status determination
  const getFinancialStatus = () => {
    if (isFullyPaid) return { label: 'Pago', color: 'green', icon: CheckCircle };
    if (hasOverduePayments) return { label: 'Atrasado', color: 'red', icon: AlertCircle };
    if (pendingAmount > 0) return { label: 'Pendente', color: 'orange', icon: Clock };
    return { label: 'Sem Pagamentos', color: 'gray', icon: DollarSign };
  };

  const financialStatus = getFinancialStatus();
  const StatusIcon = financialStatus.icon;

  if (loading && compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
        <span className="text-sm text-slate-500">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Erro ao carregar</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <StatusIcon 
          className={`w-4 h-4 ${
            financialStatus.color === 'green' ? 'text-green-600' :
            financialStatus.color === 'red' ? 'text-red-600' :
            financialStatus.color === 'orange' ? 'text-orange-600' :
            'text-slate-400'
          }`} 
        />
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-slate-900">
            {formatPaymentValue(paidAmount)}
          </span>
          <span className="text-xs text-slate-500">
            / {formatPaymentValue(eventTotal)}
          </span>
        </div>
        {paymentProgress > 0 && (
          <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                financialStatus.color === 'green' ? 'bg-green-500' :
                financialStatus.color === 'red' ? 'bg-red-500' :
                'bg-orange-500'
              }`}
              style={{ width: `${Math.min(paymentProgress, 100)}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className={CARD_STYLES.primary}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Status Financeiro
            </CardTitle>
            
            {showActions && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {payments.length} Pagamentos
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowPaymentForm(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Plus className="w-4 h-4" />
                  Pagamento
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-600">Valor Total</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatPaymentValue(eventTotal)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-600">Recebido</p>
              <p className="text-2xl font-bold text-green-800">
                {formatPaymentValue(paidAmount)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-600">Pendente</p>
              <p className="text-2xl font-bold text-orange-800">
                {formatPaymentValue(pendingAmount)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Progresso de Pagamento
              </span>
              <span className="text-sm text-slate-500">
                {paymentProgress.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={paymentProgress} 
              className="h-3"
            />
          </div>

          {/* Financial Status Badge */}
          <div className="flex items-center justify-center">
            <Badge
              variant="outline"
              className={`flex items-center gap-2 px-4 py-2 text-sm ${
                financialStatus.color === 'green' ? 'border-green-200 text-green-800 bg-green-50' :
                financialStatus.color === 'red' ? 'border-red-200 text-red-800 bg-red-50' :
                financialStatus.color === 'orange' ? 'border-orange-200 text-orange-800 bg-orange-50' :
                'border-slate-200 text-slate-600 bg-slate-50'
              }`}
            >
              <StatusIcon className="w-4 h-4" />
              {financialStatus.label}
            </Badge>
          </div>

          {/* Payment Details */}
          {showPaymentDetails && payments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 border-t border-slate-200 pt-4"
            >
              <h4 className="font-semibold text-slate-900">Detalhes dos Pagamentos</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {payments.map((payment) => {
                  const statusInfo = getPaymentStatusInfo(payment.status);
                  const methodInfo = getPaymentMethodInfo(payment.paymentMethod);
                  
                  return (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg">{methodInfo.icon}</div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {formatPaymentValue(payment.amount)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {methodInfo.label}
                            {payment.dueDate && ` • Vence ${formatPaymentDate(payment.dueDate)}`}
                          </p>
                        </div>
                      </div>
                      
                      <Badge
                        variant="outline"
                        className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0`}
                      >
                        {statusInfo.label}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {payments.length === 0 && (
            <div className="text-center py-6">
              <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 mb-4">Nenhum pagamento registrado</p>
              {showActions && (
                <Button
                  onClick={() => setShowPaymentForm(true)}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Primeiro Pagamento
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentForm
          isOpen={showPaymentForm}
          onClose={() => setShowPaymentForm(false)}
          onSubmit={handlePaymentCreated}
          eventId={event.id}
          eventTotal={eventTotal}
          alreadyPaid={paidAmount}
        />
      )}
    </motion.div>
  );
}