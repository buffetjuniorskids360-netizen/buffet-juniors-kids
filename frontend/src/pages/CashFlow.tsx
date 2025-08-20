import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DollarSign,
  Plus,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  Banknote,
  PiggyBank,
  Filter,
  Edit,
  BarChart3,
  LineChart,
  Calendar,
  FileText
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { pageVariants, pageTransition, containerVariants, itemVariants } from '@/lib/animations';
import { CARD_STYLES } from '@/lib/constants';
import { getPaymentMethodInfo } from '@/types/payment';
import { useCashFlow, formatCurrency, getStatusColor, getTypeColor, CashFlowEntry } from '@/hooks/useCashFlow';

type FilterPeriod = '7' | '30' | '90' | '365';
type FilterType = 'all' | 'income' | 'expense';
type FilterStatus = 'all' | 'pending' | 'confirmed' | 'cancelled';

export default function CashFlow() {
  const [, setLocation] = useLocation();
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CashFlowEntry | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'charts'>('table');
  
  // Use the custom cash flow hook
  const {
    entries,
    filteredEntries,
    summary,
    availableCategories,
    loading,
    error,
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
    refreshData
  } = useCashFlow();
  
  const {
    totalIncome,
    totalExpenses,
    netCashFlow,
    pendingIncome,
    pendingExpenses,
    chartData,
    categoryData
  } = summary;

  // Form state
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'confirmed' as 'pending' | 'confirmed' | 'cancelled',
    paymentMethod: 'cash' as 'cash' | 'card' | 'pix' | 'transfer',
  });

  // Predefined categories
  const incomeCategories = [
    'Receita de Eventos',
    'Entrada de Cliente',
    'Pagamento à Vista',
    'Parcela de Evento',
    'Serviços Extras',
    'Decoração',
    'Buffet Premium',
    'Outros'
  ];

  const expenseCategories = [
    'Compra de Ingredientes',
    'Decoração e Materiais',
    'Salários e Funcionários',
    'Aluguel e Instalações',
    'Marketing e Publicidade',
    'Equipamentos e Utensílios',
    'Transportes e Entregas',
    'Impostos e Taxas',
    'Manutenção',
    'Outros'
  ];

  const handleAddEntry = () => {
    // In a real implementation, this would call an API to add a new entry
    console.log('Add entry:', formData);
    setIsAddingEntry(false);
    resetForm();
  };

  const handleEditEntry = (entry: CashFlowEntry) => {
    setEditingEntry(entry);
    setFormData({
      type: entry.type,
      category: entry.category,
      amount: entry.amount.toString(),
      description: entry.description,
      date: entry.date,
      status: entry.status,
      paymentMethod: entry.paymentMethod,
    });
  };

  const handleUpdateEntry = () => {
    if (!editingEntry) return;
    // In a real implementation, this would call an API to update the entry
    console.log('Update entry:', editingEntry.id, formData);
    setEditingEntry(null);
    resetForm();
  };

  const handleDeleteEntry = (id: string) => {
    // In a real implementation, this would call an API to delete the entry
    console.log('Delete entry:', id);
  };

  const resetForm = () => {
    setFormData({
      type: 'income',
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      paymentMethod: 'cash',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'pix': return <DollarSign className="w-4 h-4" />;
      case 'transfer': return <PiggyBank className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

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
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div style={{ gap: '8px' }}>
                <h1 className="text-3xl font-bold text-slate-900" style={{ marginBottom: '8px' }}>Fluxo de Caixa</h1>
                <p className="text-slate-600">
                  Controle completo de entradas e saídas
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center" style={{ gap: '16px' }}>
            <div className="flex bg-white rounded-lg border" style={{ padding: '4px', gap: '4px' }}>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="flex items-center"
                style={{ gap: '8px', padding: '8px 16px' }}
              >
                <FileText className="h-4 w-4" />
                Tabela
              </Button>
              <Button
                variant={viewMode === 'charts' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('charts')}
                className="flex items-center"
                style={{ gap: '8px', padding: '8px 16px' }}
              >
                <BarChart3 className="h-4 w-4" />
                Gráficos
              </Button>
            </div>
            
            <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
              <DialogTrigger asChild>
                <Button className="flex items-center" style={{ gap: '8px', padding: '12px 24px' }}>
                  <Plus className="h-5 w-5" />
                  Nova Movimentação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Movimentação</DialogTitle>
                </DialogHeader>
                <CashFlowForm
                  formData={formData}
                  setFormData={setFormData}
                  incomeCategories={incomeCategories}
                  expenseCategories={expenseCategories}
                  onSubmit={handleAddEntry}
                  onCancel={() => {
                    setIsAddingEntry(false);
                    resetForm();
                  }}
                />
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="flex items-center" style={{ gap: '8px', padding: '10px 20px' }}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={loading}
              className="flex items-center"
              style={{ gap: '8px', padding: '10px 20px' }}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-4"
          style={{ gap: '24px', marginBottom: '32px' }}
        >
          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardContent style={{ padding: '24px' }}>
                <div className="flex items-center justify-between">
                  <div style={{ gap: '8px' }}>
                    <p className="text-sm font-medium text-slate-600" style={{ marginBottom: '8px' }}>Receitas Confirmadas</p>
                    <p className="text-2xl font-bold text-green-600" style={{ marginBottom: '4px' }}>
                      {formatCurrency(totalIncome)}
                    </p>
                    {loading && (
                      <p className="text-xs text-slate-500 animate-pulse">Carregando...</p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
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
                    <p className="text-sm font-medium text-slate-600" style={{ marginBottom: '8px' }}>Despesas</p>
                    <p className="text-2xl font-bold text-red-600" style={{ marginBottom: '4px' }}>
                      {formatCurrency(totalExpenses)}
                    </p>
                    <p className="text-xs text-slate-500">Gastos operacionais</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-600" />
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
                    <p className="text-sm font-medium text-slate-600" style={{ marginBottom: '8px' }}>Saldo Líquido</p>
                    <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} style={{ marginBottom: '4px' }}>
                      {formatCurrency(netCashFlow)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {netCashFlow >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    netCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <DollarSign className={`w-6 h-6 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
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
                    <p className="text-sm font-medium text-slate-600" style={{ marginBottom: '8px' }}>Receitas Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600" style={{ marginBottom: '4px' }}>
                      {formatCurrency(pendingIncome)}
                    </p>
                    <p className="text-xs text-slate-500">A receber</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
          <Card className={CARD_STYLES.primary}>
            <CardHeader style={{ padding: '24px 24px 16px' }}>
              <CardTitle className="flex items-center" style={{ gap: '12px' }}>
                <Filter className="w-5 h-5 text-blue-600" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '0 24px 24px' }}>
              <div className="grid grid-cols-1 md:grid-cols-6" style={{ gap: '20px' }}>
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11"
                />

                <Select value={filterPeriod} onValueChange={(value: FilterPeriod) => setFilterPeriod(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="365">1 ano</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {availableCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterPeriod('30');
                    setFilterType('all');
                    setFilterStatus('all');
                    setFilterCategory('all');
                  }}
                  style={{ padding: '10px 20px' }}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dynamic Content - Table or Charts */}
        {viewMode === 'table' ? (
          <motion.div variants={itemVariants}>
            <Card className={CARD_STYLES.primary}>
              <CardHeader style={{ padding: '32px 32px 24px' }}>
                <CardTitle className="flex items-center justify-between" style={{ gap: '16px' }}>
                  <span>Movimentações ({filteredEntries.length})</span>
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <Badge variant="outline" style={{ padding: '6px 12px' }}>
                      {loading ? 'Carregando...' : `${filteredEntries.length} registros`}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: '0 32px 32px' }}>
                {error && (
                  <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">Erro ao carregar dados: {error}</p>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-slate-500" style={{ padding: '48px 24px' }}>
                            {loading ? (
                              <div className="flex items-center justify-center" style={{ gap: '12px' }}>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Carregando movimentações...
                              </div>
                            ) : (
                              'Nenhuma movimentação encontrada para o período selecionado'
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell style={{ padding: '16px 12px' }}>
                              {new Date(entry.date).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell style={{ padding: '16px 12px' }}>
                              <Badge variant={entry.type === 'income' ? 'default' : 'destructive'} style={{ padding: '4px 12px' }}>
                                {entry.type === 'income' ? 'Receita' : 'Despesa'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium" style={{ padding: '16px 12px' }}>
                              {entry.category}
                            </TableCell>
                            <TableCell style={{ padding: '16px 12px' }}>{entry.description}</TableCell>
                            <TableCell className={getTypeColor(entry.type)} style={{ padding: '16px 12px' }}>
                              {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                            </TableCell>
                            <TableCell style={{ padding: '16px 12px' }}>
                              <div className="flex items-center" style={{ gap: '8px' }}>
                                {getPaymentMethodIcon(entry.paymentMethod)}
                                <span className="capitalize">
                                  {getPaymentMethodInfo(entry.paymentMethod).label}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell style={{ padding: '16px 12px' }}>
                              <div className="flex items-center" style={{ gap: '8px' }}>
                                {getStatusIcon(entry.status)}
                                <span className="capitalize">
                                  {entry.status === 'confirmed' ? 'Confirmado' :
                                   entry.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell style={{ padding: '16px 12px' }}>
                              <div className="flex items-center" style={{ gap: '8px' }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditEntry(entry)}
                                  style={{ padding: '8px 12px' }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  style={{ padding: '8px 12px' }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Charts View */
          <motion.div variants={containerVariants} className="space-y-6">
            {/* Cash Flow Trend Chart */}
            <motion.div variants={itemVariants}>
              <Card className={CARD_STYLES.primary}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-blue-600" />
                    Tendência do Fluxo de Caixa - Últimos {filterPeriod} dias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip 
                          formatter={(value, name) => [
                            formatCurrency(Number(value)), 
                            name === 'income' ? 'Receitas' : 
                            name === 'expenses' ? 'Despesas' : 'Fluxo Líquido'
                          ]}
                          labelFormatter={(label) => `Data: ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="income" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Receitas"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="expenses" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          name="Despesas"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="netFlow" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          name="Fluxo Líquido"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Cash Flow Bar Chart */}
              <motion.div variants={itemVariants}>
                <Card className={CARD_STYLES.primary}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      Receitas vs Despesas Diárias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis tickFormatter={(value) => formatCurrency(value)} />
                          <Tooltip 
                            formatter={(value, name) => [
                              formatCurrency(Number(value)), 
                              name === 'income' ? 'Receitas' : 'Despesas'
                            ]}
                          />
                          <Legend />
                          <Bar dataKey="income" fill="#10b981" name="Receitas" />
                          <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Category Distribution Pie Chart */}
              <motion.div variants={itemVariants}>
                <Card className={CARD_STYLES.primary}>
                  <CardHeader>
                    <CardTitle>Distribuição por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Edit Entry Dialog */}
        <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Movimentação</DialogTitle>
            </DialogHeader>
            <CashFlowForm
              formData={formData}
              setFormData={setFormData}
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              onSubmit={handleUpdateEntry}
              onCancel={() => {
                setEditingEntry(null);
                resetForm();
              }}
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </motion.div>
  );
}

// Form Component
interface CashFlowFormProps {
  formData: any;
  setFormData: (data: any) => void;
  incomeCategories: string[];
  expenseCategories: string[];
  onSubmit: () => void;
  onCancel: () => void;
}

function CashFlowForm({
  formData,
  setFormData,
  incomeCategories,
  expenseCategories,
  onSubmit,
  onCancel
}: CashFlowFormProps) {
  const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Tipo
          </label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({...formData, type: value, category: ''})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Categoria
          </label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData({...formData, category: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Valor (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            placeholder="0,00"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Data
          </label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Descrição
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Descreva a movimentação..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Método de Pagamento
          </label>
          <Select 
            value={formData.paymentMethod} 
            onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Dinheiro</SelectItem>
              <SelectItem value="card">Cartão</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="transfer">Transferência</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Status
          </label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData({...formData, status: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={!formData.category || !formData.amount || !formData.description}
        >
          Salvar
        </Button>
      </div>
    </div>
  );
}