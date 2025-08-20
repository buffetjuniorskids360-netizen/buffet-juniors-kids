// Report utility functions for data processing and filtering

export interface FilteredMetrics {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  averageTicket: number;
  conversionRate: number;
  paymentRate: number;
}

export interface ReportExportData {
  headers: string[];
  rows: string[][];
  filename: string;
}

// Calculate metrics from filtered data
export const calculateFilteredMetrics = (
  payments: any[],
  events: any[],
  reportType: string
): FilteredMetrics => {
  const paidPayments = payments.filter(p => p.status === 'paid');
  const totalRevenue = paidPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  
  // Estimate expenses as 30% of revenue (can be enhanced with actual expense tracking)
  const totalExpenses = totalRevenue * 0.3;
  const profit = totalRevenue - totalExpenses;
  
  const averageTicket = events.length > 0 
    ? events.reduce((sum, event) => sum + parseFloat(event.totalValue), 0) / events.length 
    : 0;
  
  const conversionRate = events.length > 0 ? (paidPayments.length / events.length) * 100 : 0;
  const paymentRate = payments.length > 0 ? (paidPayments.length / payments.length) * 100 : 0;

  return {
    totalRevenue,
    totalExpenses,
    profit,
    averageTicket,
    conversionRate,
    paymentRate,
  };
};

// Format currency for Brazilian Real
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Format date for Brazilian locale
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
};

// Format date and time
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('pt-BR');
};

// Get status labels in Portuguese
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    paid: 'Pago',
    overdue: 'Atrasado',
  };
  return labels[status] || status;
};

// Get payment method labels in Portuguese
export const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    cash: 'Dinheiro',
    card: 'Cartão',
    pix: 'PIX',
    transfer: 'Transferência',
  };
  return labels[method] || method;
};

// Get status colors for charts
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: '#EA580C',
    confirmed: '#059669',
    completed: '#1E40AF',
    cancelled: '#DC2626',
    paid: '#059669',
    overdue: '#DC2626',
  };
  return colors[status] || '#6B7280';
};

// Prepare data for CSV export based on report type
export const prepareExportData = (
  reportType: string,
  payments: any[],
  events: any[],
  clients: any[],
  filters: any
): ReportExportData => {
  const dateRange = `${filters.dateFrom}_${filters.dateTo}`;
  
  switch (reportType) {
    case 'financial':
    case 'payments':
      return {
        headers: [
          'Data do Pagamento',
          'Data de Vencimento', 
          'Evento',
          'Cliente',
          'Valor',
          'Método',
          'Status',
          'Observações'
        ],
        rows: payments.map(payment => [
          payment.paymentDate ? formatDate(payment.paymentDate) : '',
          payment.dueDate ? formatDate(payment.dueDate) : '',
          payment.event?.title || '',
          payment.client?.name || '',
          formatCurrency(parseFloat(payment.amount)),
          getPaymentMethodLabel(payment.paymentMethod),
          getStatusLabel(payment.status),
          payment.notes || ''
        ]),
        filename: `relatorio_${reportType}_${dateRange}.csv`
      };

    case 'events':
      return {
        headers: [
          'Data do Evento',
          'Título',
          'Cliente',
          'Valor Total',
          'Número de Convidados',
          'Status',
          'Tipo de Pacote',
          'Observações'
        ],
        rows: events.map(event => [
          formatDate(event.date),
          event.title,
          event.client?.name || '',
          formatCurrency(parseFloat(event.totalValue)),
          event.guestsCount?.toString() || '',
          getStatusLabel(event.status),
          event.packageType || '',
          event.notes || ''
        ]),
        filename: `relatorio_eventos_${dateRange}.csv`
      };

    case 'clients':
      // Create client performance summary
      const clientPerformance = events.reduce((acc, event) => {
        const clientId = event.clientId;
        const client = clients.find(c => c.id === clientId);
        
        if (!acc[clientId]) {
          acc[clientId] = {
            name: client?.name || 'Cliente Desconhecido',
            email: client?.email || '',
            phone: client?.phone || '',
            events: 0,
            totalRevenue: 0,
            createdAt: client?.createdAt || ''
          };
        }
        
        acc[clientId].events += 1;
        acc[clientId].totalRevenue += parseFloat(event.totalValue);
        
        return acc;
      }, {} as Record<string, any>);

      return {
        headers: [
          'Nome',
          'Email',
          'Telefone',
          'Total de Eventos',
          'Receita Total',
          'Receita Média por Evento',
          'Data de Cadastro'
        ],
        rows: Object.values(clientPerformance).map((client: any) => [
          client.name,
          client.email,
          client.phone,
          client.events.toString(),
          formatCurrency(client.totalRevenue),
          formatCurrency(client.events > 0 ? client.totalRevenue / client.events : 0),
          client.createdAt ? formatDate(client.createdAt) : ''
        ]),
        filename: `relatorio_clientes_${dateRange}.csv`
      };

    default:
      return {
        headers: ['Dados'],
        rows: [['Tipo de relatório não suportado']],
        filename: `relatorio_${dateRange}.csv`
      };
  }
};

// Generate CSV content from export data
export const generateCSVContent = (exportData: ReportExportData): string => {
  const rows = [exportData.headers, ...exportData.rows];
  return rows.map(row => 
    row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');
};

// Download CSV file
export const downloadCSV = (content: string, filename: string): void => {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Validate date range
export const validateDateRange = (dateFrom: string, dateTo: string): string | null => {
  if (!dateFrom || !dateTo) {
    return 'Por favor, selecione o período para o relatório';
  }
  
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  
  if (fromDate > toDate) {
    return 'A data inicial deve ser anterior à data final';
  }
  
  const diffTime = toDate.getTime() - fromDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 365) {
    return 'O período máximo para relatórios é de 1 ano';
  }
  
  return null;
};

// Generate time periods for charts based on date range
export const generateTimePeriods = (
  fromDate: Date, 
  toDate: Date
): Array<{ start: Date; end: Date; label: string }> => {
  const periods = [];
  const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 30) {
    // Daily periods for up to 30 days
    for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      const start = new Date(d);
      const end = new Date(d);
      end.setDate(end.getDate() + 1);
      
      periods.push({
        start,
        end,
        label: start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      });
    }
  } else if (daysDiff <= 90) {
    // Weekly periods for up to 3 months
    const current = new Date(fromDate);
    current.setDate(current.getDate() - current.getDay()); // Start of week
    
    while (current <= toDate) {
      const start = new Date(current);
      const end = new Date(current);
      end.setDate(end.getDate() + 7);
      
      periods.push({
        start,
        end,
        label: `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`,
      });
      
      current.setDate(current.getDate() + 7);
    }
  } else {
    // Monthly periods for longer ranges
    const current = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
    
    while (current <= toDate) {
      const start = new Date(current);
      const end = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      
      periods.push({
        start,
        end,
        label: start.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      });
      
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  return periods;
};

// Calculate payment distribution for pie charts
export const calculatePaymentDistribution = (
  payments: any[]
): Array<{ method: string; count: number; amount: number; percentage: number }> => {
  const distribution = payments.reduce((acc, payment) => {
    const method = payment.paymentMethod;
    if (!acc[method]) {
      acc[method] = { count: 0, amount: 0 };
    }
    acc[method].count += 1;
    acc[method].amount += parseFloat(payment.amount);
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return Object.entries(distribution).map(([method, data]) => {
    const typedData = data as { count: number; amount: number };
    return {
      method: getPaymentMethodLabel(method),
      count: typedData.count,
      amount: typedData.amount,
      percentage: totalAmount > 0 ? (typedData.amount / totalAmount) * 100 : 0,
    };
  });
};

// Calculate event status distribution for pie charts
export const calculateEventStatusDistribution = (
  events: any[]
): Array<{ status: string; count: number; color: string; percentage: number }> => {
  const statusCounts = events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEvents = events.length;

  return Object.entries(statusCounts).map(([status, count]) => {
    const numCount = count as number;
    return {
      status: getStatusLabel(status),
      count: numCount,
      color: getStatusColor(status),
      percentage: totalEvents > 0 ? (numCount / totalEvents) * 100 : 0,
    };
  });
};

// Enhanced export data preparation for integration with new export service
export const prepareEnhancedExportData = (
  reportType: string,
  payments: any[],
  events: any[],
  clients: any[],
  filters: any,
  metrics?: any
) => {
  const basicExportData = prepareExportData(reportType, payments, events, clients, filters);
  
  // Add metrics for enhanced PDF/Excel export
  const enhancedData = {
    ...basicExportData,
    metrics: metrics ? {
      totalRevenue: metrics.monthlyRevenue || 0,
      confirmedEvents: metrics.confirmedEvents || 0,
      activeClients: metrics.activeClients || 0,
      conversionRate: metrics.conversionRate || 0,
      growthRate: metrics.growthRate || 0,
      averageTicket: metrics.averageEventValue || 0,
      paymentRate: metrics.paymentRate || 0,
      pendingPayments: metrics.pendingPayments || 0,
    } : null,
    summary: {
      totalRecords: basicExportData.rows.length,
      dateRange: filters.dateFrom && filters.dateTo 
        ? `${formatDate(filters.dateFrom)} - ${formatDate(filters.dateTo)}`
        : 'Período completo',
      reportType: getReportTypeLabel(reportType),
      generatedAt: formatDateTime(new Date()),
    }
  };

  return enhancedData;
};

// Get report type labels in Portuguese
export const getReportTypeLabel = (reportType: string): string => {
  const labels: Record<string, string> = {
    financial: 'Financeiro',
    payments: 'Pagamentos',
    events: 'Eventos',
    clients: 'Clientes',
  };
  return labels[reportType] || reportType;
};

// Prepare data specifically for Excel export with multiple sheets
export const prepareExcelSheetsData = (
  payments: any[],
  events: any[],
  clients: any[],
  metrics?: any
) => {
  const sheets = [];

  // Summary sheet
  if (metrics) {
    sheets.push({
      name: 'Resumo Executivo',
      data: [
        ['Indicador', 'Valor'],
        ['Receita Total', formatCurrency(metrics.monthlyRevenue || 0)],
        ['Eventos Confirmados', (metrics.confirmedEvents || 0).toString()],
        ['Clientes Ativos', (metrics.activeClients || 0).toString()],
        ['Taxa de Conversão', formatPercentage(metrics.conversionRate || 0)],
        ['Crescimento', formatPercentage(metrics.growthRate || 0)],
        ['Ticket Médio', formatCurrency(metrics.averageEventValue || 0)],
        ['Taxa de Pagamento', formatPercentage(metrics.paymentRate || 0)],
        ['Pagamentos Pendentes', formatCurrency(metrics.pendingPayments || 0)],
      ]
    });
  }

  // Payments sheet
  if (payments.length > 0) {
    sheets.push({
      name: 'Pagamentos',
      data: [
        [
          'Data Pagamento',
          'Data Vencimento',
          'Evento',
          'Cliente',
          'Valor',
          'Método',
          'Status',
          'Observações'
        ],
        ...payments.map(payment => [
          payment.paymentDate ? formatDate(payment.paymentDate) : '',
          payment.dueDate ? formatDate(payment.dueDate) : '',
          payment.event?.title || '',
          payment.client?.name || '',
          formatCurrency(parseFloat(payment.amount)),
          getPaymentMethodLabel(payment.paymentMethod),
          getStatusLabel(payment.status),
          payment.notes || ''
        ])
      ]
    });
  }

  // Events sheet
  if (events.length > 0) {
    sheets.push({
      name: 'Eventos',
      data: [
        [
          'Data Evento',
          'Título',
          'Cliente',
          'Valor Total',
          'Convidados',
          'Status',
          'Tipo Pacote',
          'Observações'
        ],
        ...events.map(event => [
          formatDate(event.date),
          event.title,
          event.client?.name || '',
          formatCurrency(parseFloat(event.totalValue)),
          event.guestsCount?.toString() || '',
          getStatusLabel(event.status),
          event.packageType || '',
          event.notes || ''
        ])
      ]
    });
  }

  // Clients sheet
  if (clients.length > 0) {
    const clientPerformance = events.reduce((acc, event) => {
      const clientId = event.clientId;
      const client = clients.find(c => c.id === clientId);
      
      if (!acc[clientId]) {
        acc[clientId] = {
          name: client?.name || 'Cliente Desconhecido',
          email: client?.email || '',
          phone: client?.phone || '',
          events: 0,
          totalRevenue: 0,
          createdAt: client?.createdAt || ''
        };
      }
      
      acc[clientId].events += 1;
      acc[clientId].totalRevenue += parseFloat(event.totalValue);
      
      return acc;
    }, {} as Record<string, any>);

    sheets.push({
      name: 'Clientes',
      data: [
        [
          'Nome',
          'Email',
          'Telefone',
          'Total Eventos',
          'Receita Total',
          'Receita Média',
          'Data Cadastro'
        ],
        ...Object.values(clientPerformance).map((client: any) => [
          client.name,
          client.email,
          client.phone,
          client.events.toString(),
          formatCurrency(client.totalRevenue),
          formatCurrency(client.events > 0 ? client.totalRevenue / client.events : 0),
          client.createdAt ? formatDate(client.createdAt) : ''
        ])
      ]
    });
  }

  return sheets;
};

// Utility to collect chart elements for export
export const collectChartElements = (containerSelector?: string): HTMLElement[] => {
  const container = containerSelector 
    ? document.querySelector(containerSelector) 
    : document;
  
  if (!container) return [];

  const chartElements: HTMLElement[] = [];
  
  // Look for common chart containers (Recharts)
  const rechartContainers = container.querySelectorAll('.recharts-wrapper');
  rechartContainers.forEach(element => {
    if (element instanceof HTMLElement) {
      chartElements.push(element);
    }
  });

  // Look for custom chart containers
  const customCharts = container.querySelectorAll('[data-export-chart]');
  customCharts.forEach(element => {
    if (element instanceof HTMLElement) {
      chartElements.push(element);
    }
  });

  return chartElements;
};