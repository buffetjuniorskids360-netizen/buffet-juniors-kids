// Payment types for the frontend
export interface Payment {
  id: string;
  eventId: string;
  amount: string; // Decimal as string for precision
  paymentDate?: Date;
  paymentMethod: 'cash' | 'card' | 'pix' | 'transfer';
  status: 'pending' | 'paid' | 'overdue';
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  event?: {
    id: string;
    title: string;
    date: Date;
    totalValue: string;
    status: string;
    guestsCount?: number;
  };
  client?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
}

export interface CreatePaymentData {
  eventId: string;
  amount: string;
  paymentMethod: 'cash' | 'card' | 'pix' | 'transfer';
  status?: 'pending' | 'paid' | 'overdue';
  dueDate?: string; // ISO string format
  paymentDate?: string; // ISO string format
  notes?: string;
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> {
  id?: string;
}

export interface PaymentFilters {
  search?: string;
  status?: 'pending' | 'paid' | 'overdue';
  paymentMethod?: 'cash' | 'card' | 'pix' | 'transfer';
  eventId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface PaymentQueryParams extends PaymentFilters {
  page?: number;
  limit?: number;
  sortBy?: 'dueDate' | 'paymentDate' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentsResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface EventPaymentSummary {
  payments: Payment[];
  summary: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    totalPayments: number;
    paidPayments: number;
    pendingPayments: number;
    overduePayments: number;
  };
}

export interface PaymentAnalytics {
  period: string;
  totalPayments: number;
  paymentsByStatus: Record<string, { count: number; amount: number }>;
  paymentsByMethod: Record<string, { count: number; amount: number }>;
  overduePayments: {
    count: number;
    totalAmount: number;
  };
}

// Payment method options with labels and icons
export const PAYMENT_METHODS = [
  { 
    value: 'cash', 
    label: 'Dinheiro', 
    icon: '💵',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  { 
    value: 'card', 
    label: 'Cartão', 
    icon: '💳',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  { 
    value: 'pix', 
    label: 'PIX', 
    icon: '📱',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800'
  },
  { 
    value: 'transfer', 
    label: 'Transferência', 
    icon: '🏦',
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800'
  },
] as const;

// Payment status options with colors for UI
export const PAYMENT_STATUS = [
  { 
    value: 'pending', 
    label: 'Pendente', 
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800'
  },
  { 
    value: 'paid', 
    label: 'Pago', 
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800'
  },
  { 
    value: 'overdue', 
    label: 'Atrasado', 
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
] as const;

// Utility functions
export const formatPaymentValue = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
};

export const formatPaymentDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPaymentDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getPaymentStatusInfo = (status: Payment['status']) => {
  return PAYMENT_STATUS.find(s => s.value === status) || PAYMENT_STATUS[0];
};

export const getPaymentMethodInfo = (method: Payment['paymentMethod']) => {
  return PAYMENT_METHODS.find(m => m.value === method) || PAYMENT_METHODS[0];
};

export const isPaymentOverdue = (payment: Payment): boolean => {
  if (payment.status === 'paid' || !payment.dueDate) return false;
  return new Date(payment.dueDate) < new Date();
};

export const calculatePaymentSummary = (payments: Payment[]) => {
  const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const paidAmount = payments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const pendingAmount = payments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const overdueAmount = payments
    .filter(payment => payment.status === 'overdue')
    .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

  return {
    totalAmount,
    paidAmount,
    pendingAmount,
    overdueAmount,
    totalPayments: payments.length,
    paidPayments: payments.filter(p => p.status === 'paid').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    overduePayments: payments.filter(p => p.status === 'overdue').length,
    paymentRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
  };
};

// Payment installment helpers
export const generateInstallments = (
  totalAmount: number,
  installmentCount: number,
  firstDueDate: Date,
  intervalDays: number = 30
): Omit<CreatePaymentData, 'eventId'>[] => {
  const installmentAmount = totalAmount / installmentCount;
  const installments: Omit<CreatePaymentData, 'eventId'>[] = [];

  for (let i = 0; i < installmentCount; i++) {
    const dueDate = new Date(firstDueDate);
    dueDate.setDate(dueDate.getDate() + (i * intervalDays));

    installments.push({
      amount: installmentAmount.toFixed(2),
      paymentMethod: 'card', // Default, can be changed
      status: 'pending',
      dueDate: dueDate.toISOString(),
      notes: `Parcela ${i + 1}/${installmentCount}`,
    });
  }

  return installments;
};