import { useState, useEffect, useMemo } from 'react';
import { usePayments, usePaymentAnalytics } from './usePayments';
import { Payment } from '@/types/payment';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

export interface CashFlowEntry {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'pix' | 'transfer';
  tags?: string[];
  eventId?: string;
  clientId?: string;
  originalPayment?: Payment;
}

export interface CashFlowData {
  date: string;
  income: number;
  expenses: number;
  netFlow: number;
}

export interface CategoryData {
  name: string;
  value: number;
  fill: string;
}

export interface CashFlowSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  pendingIncome: number;
  pendingExpenses: number;
  chartData: CashFlowData[];
  categoryData: CategoryData[];
  incomeByMethod: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

type FilterPeriod = '7' | '30' | '90' | '365';
type FilterType = 'all' | 'income' | 'expense';
type FilterStatus = 'all' | 'pending' | 'confirmed' | 'cancelled';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

// Sample expense data to complement payment data
const SAMPLE_EXPENSES: CashFlowEntry[] = [
  {
    id: 'exp_1',
    type: 'expense',
    category: 'Compra de Ingredientes',
    amount: 450.00,
    description: 'Compras para eventos da semana',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    status: 'confirmed',
    paymentMethod: 'card',
    tags: ['ingredientes', 'semanal']
  },
  {
    id: 'exp_2',
    type: 'expense',
    category: 'Decoração e Materiais',
    amount: 320.00,
    description: 'Balões e decoração temática',
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    status: 'confirmed',
    paymentMethod: 'transfer'
  },
  {
    id: 'exp_3',
    type: 'expense',
    category: 'Salários e Funcionários',
    amount: 1200.00,
    description: 'Pagamento funcionários - semana',
    date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    status: 'confirmed',
    paymentMethod: 'transfer'
  },
  {
    id: 'exp_4',
    type: 'expense',
    category: 'Equipamentos e Utensílios',
    amount: 280.00,
    description: 'Compra de utensílios de cozinha',
    date: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    status: 'confirmed',
    paymentMethod: 'card'
  },
  {
    id: 'exp_5',
    type: 'expense',
    category: 'Marketing e Publicidade',
    amount: 150.00,
    description: 'Anúncios redes sociais',
    date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    status: 'pending',
    paymentMethod: 'card'
  }
];

export function useCashFlow(initialPeriod: FilterPeriod = '30') {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>(initialPeriod);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get payment data
  const { payments, loading: paymentsLoading, error: paymentsError, refreshPayments } = usePayments();
  const { analytics, loading: analyticsLoading } = usePaymentAnalytics(filterPeriod);

  // Convert payments to cash flow entries and combine with expenses
  const allEntries = useMemo((): CashFlowEntry[] => {
    if (!payments) return SAMPLE_EXPENSES;
    
    const incomeEntries: CashFlowEntry[] = payments.map(payment => ({
      id: payment.id,
      type: 'income' as const,
      category: payment.event?.title ? `Evento: ${payment.event.title}` : 'Receita de Eventos',
      amount: parseFloat(payment.amount),
      description: payment.notes || payment.event?.title || 'Pagamento de evento',
      date: payment.paymentDate ? format(payment.paymentDate, 'yyyy-MM-dd') : 
            payment.dueDate ? format(payment.dueDate, 'yyyy-MM-dd') : 
            format(new Date(), 'yyyy-MM-dd'),
      status: payment.status === 'paid' ? 'confirmed' : 
              payment.status === 'overdue' ? 'cancelled' : 'pending',
      paymentMethod: payment.paymentMethod,
      eventId: payment.eventId,
      clientId: payment.client?.id,
      originalPayment: payment
    }));
    
    return [...incomeEntries, ...SAMPLE_EXPENSES];
  }, [payments]);

  // Apply filters
  const filteredEntries = useMemo(() => {
    let filtered = [...allEntries];

    // Period filter
    const today = new Date();
    const periodDays = parseInt(filterPeriod);
    const cutoffDate = subDays(today, periodDays);
    
    filtered = filtered.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(entry => entry.status === filterStatus);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === filterCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filtered;
  }, [allEntries, filterPeriod, filterType, filterStatus, filterCategory, searchQuery]);

  // Calculate summary data
  const summary = useMemo((): CashFlowSummary => {
    const confirmedIncome = filteredEntries
      .filter(e => e.type === 'income' && e.status === 'confirmed')
      .reduce((sum, e) => sum + e.amount, 0);

    const confirmedExpenses = filteredEntries
      .filter(e => e.type === 'expense' && e.status === 'confirmed')
      .reduce((sum, e) => sum + e.amount, 0);

    const netFlow = confirmedIncome - confirmedExpenses;

    const pendingInc = filteredEntries
      .filter(e => e.type === 'income' && e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);

    const pendingExp = filteredEntries
      .filter(e => e.type === 'expense' && e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);

    // Prepare chart data for the period
    const endDate = new Date();
    const startDate = subDays(endDate, parseInt(filterPeriod));
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    const dailyData: CashFlowData[] = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayEntries = filteredEntries.filter(e => 
        e.date === dateStr && e.status === 'confirmed'
      );
      
      const income = dayEntries
        .filter(e => e.type === 'income')
        .reduce((sum, e) => sum + e.amount, 0);
      
      const expenses = dayEntries
        .filter(e => e.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0);
      
      return {
        date: format(date, 'dd/MM'),
        income,
        expenses,
        netFlow: income - expenses
      };
    });

    // Prepare category data
    const categoryMap = new Map<string, number>();
    filteredEntries
      .filter(e => e.status === 'confirmed')
      .forEach(entry => {
        const current = categoryMap.get(entry.category) || 0;
        categoryMap.set(entry.category, current + entry.amount);
      });

    const categories: CategoryData[] = Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories

    // Income by payment method
    const incomeByMethod: Record<string, number> = {};
    filteredEntries
      .filter(e => e.type === 'income' && e.status === 'confirmed')
      .forEach(entry => {
        incomeByMethod[entry.paymentMethod] = (incomeByMethod[entry.paymentMethod] || 0) + entry.amount;
      });

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      statusBreakdown[entry.status] = (statusBreakdown[entry.status] || 0) + entry.amount;
    });

    return {
      totalIncome: confirmedIncome,
      totalExpenses: confirmedExpenses,
      netCashFlow: netFlow,
      pendingIncome: pendingInc,
      pendingExpenses: pendingExp,
      chartData: dailyData,
      categoryData: categories,
      incomeByMethod,
      statusBreakdown
    };
  }, [filteredEntries, filterPeriod]);

  // Get unique categories for filter dropdown
  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(allEntries.map(e => e.category)));
    return categories.sort();
  }, [allEntries]);

  return {
    // Data
    entries: allEntries,
    filteredEntries,
    summary,
    analytics,
    availableCategories,
    
    // Loading states
    loading: paymentsLoading || analyticsLoading,
    error: paymentsError,
    
    // Filters
    filterPeriod,
    setFilterPeriod,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    
    // Actions
    refreshData: refreshPayments,
  };
}

// Utility functions
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed': return 'text-green-600';
    case 'pending': return 'text-yellow-600';
    case 'cancelled': return 'text-red-600';
    default: return 'text-slate-600';
  }
};

export const getTypeColor = (type: string): string => {
  return type === 'income' ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
};