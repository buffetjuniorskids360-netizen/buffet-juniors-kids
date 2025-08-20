import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import { AuthContext } from '@/hooks/useAuth';

// Mock the hooks
vi.mock('@/hooks/useDashboardMetrics', () => ({
  useDashboardMetrics: () => ({
    metrics: {
      monthlyRevenue: 45231.89,
      growthRate: 20.1,
      confirmedEvents: 23,
      pendingEvents: 5,
      conversionRate: 85.5,
      nextMonthProjection: 52000,
      revenueByMonth: [
        { month: 'Jan', revenue: 30000, events: 15 },
        { month: 'Fev', revenue: 35000, events: 18 },
        { month: 'Mar', revenue: 42000, events: 21 },
      ],
      paymentMethodDistribution: [
        { method: 'PIX', count: 45, amount: 25000 },
        { method: 'CARTÃO', count: 30, amount: 15000 },
        { method: 'DINHEIRO', count: 20, amount: 8000 },
      ],
      popularPackages: [
        { package: 'Premium', count: 15, revenue: 25000 },
        { package: 'Standard', count: 20, revenue: 18000 },
        { package: 'Basic', count: 25, revenue: 12000 },
      ]
    },
    loading: false,
    error: null,
    lastUpdated: new Date(),
    refreshMetrics: vi.fn(),
  }),
}));

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/dashboard', vi.fn()],
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Create a wrapper component with auth context
const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const mockAuthValue = {
    user: {
      id: '1',
      username: 'admin',
      email: 'admin@test.com',
      role: 'admin' as const,
      createdAt: new Date().toISOString(),
    },
    isAuthenticated: true,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  };

  return (
    <AuthContext.Provider value={mockAuthValue}>
      {children}
    </AuthContext.Provider>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with user greeting', () => {
    render(
      <DashboardWrapper>
        <Dashboard />
      </DashboardWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Bem-vindo, admin! (admin)')).toBeInTheDocument();
  });

  it('displays financial KPIs correctly', () => {
    render(
      <DashboardWrapper>
        <Dashboard />
      </DashboardWrapper>
    );

    expect(screen.getByText('Receita do Mês')).toBeInTheDocument();
    expect(screen.getByText('R$ 45.231,89')).toBeInTheDocument();
    expect(screen.getByText('Eventos Confirmados')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText('Taxa de Conversão')).toBeInTheDocument();
    expect(screen.getByText('85,5%')).toBeInTheDocument();
  });

  it('shows executive actions buttons', () => {
    render(
      <DashboardWrapper>
        <Dashboard />
      </DashboardWrapper>
    );

    expect(screen.getByText('Central de Eventos')).toBeInTheDocument();
    expect(screen.getByText('Gestão de Clientes')).toBeInTheDocument();
    expect(screen.getByText('Fluxo de Caixa')).toBeInTheDocument();
    expect(screen.getByText('Relatórios & Analytics')).toBeInTheDocument();
  });

  it('renders charts and analytics sections', () => {
    render(
      <DashboardWrapper>
        <Dashboard />
      </DashboardWrapper>
    );

    expect(screen.getByText('Evolução da Receita (12 meses)')).toBeInTheDocument();
    expect(screen.getByText('Métodos de Pagamento')).toBeInTheDocument();
    expect(screen.getByText('Pacotes Mais Populares')).toBeInTheDocument();
    expect(screen.getByText('Status Financeiro')).toBeInTheDocument();
  });

  it('handles refresh metrics action', async () => {
    const { useDashboardMetrics } = await import('@/hooks/useDashboardMetrics');
    const mockRefresh = vi.fn();
    
    vi.mocked(useDashboardMetrics).mockReturnValue({
      metrics: null,
      loading: false,
      error: null,
      lastUpdated: null,
      refreshMetrics: mockRefresh,
    });

    render(
      <DashboardWrapper>
        <Dashboard />
      </DashboardWrapper>
    );

    const refreshButton = screen.getByText('Atualizar');
    fireEvent.click(refreshButton);

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('displays loading state correctly', () => {
    const { useDashboardMetrics } = require('@/hooks/useDashboardMetrics');
    
    vi.mocked(useDashboardMetrics).mockReturnValue({
      metrics: null,
      loading: true,
      error: null,
      lastUpdated: null,
      refreshMetrics: vi.fn(),
    });

    render(
      <DashboardWrapper>
        <Dashboard />
      </DashboardWrapper>
    );

    expect(screen.getAllByText('...')).toHaveLength(4); // One for each KPI card
    expect(screen.getByText('Carregando dados financeiros...')).toBeInTheDocument();
  });

  it('handles logout functionality', async () => {
    const mockLogout = vi.fn();
    
    const DashboardWithMockLogout = () => {
      const mockAuthValue = {
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@test.com',
          role: 'admin' as const,
          createdAt: new Date().toISOString(),
        },
        isAuthenticated: true,
        loading: false,
        login: vi.fn(),
        logout: mockLogout,
        register: vi.fn(),
      };

      return (
        <AuthContext.Provider value={mockAuthValue}>
          <Dashboard />
        </AuthContext.Provider>
      );
    };

    render(<DashboardWithMockLogout />);

    const logoutButton = screen.getByText('Sair');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('displays financial status indicators', () => {
    render(
      <DashboardWrapper>
        <Dashboard />
      </DashboardWrapper>
    );

    expect(screen.getByText('Taxa de Pagamento')).toBeInTheDocument();
    expect(screen.getByText('Clientes Ativos')).toBeInTheDocument();
    expect(screen.getByText('Novos Este Mês')).toBeInTheDocument();
  });

  it('shows navigation buttons in header', () => {
    render(
      <DashboardWrapper>
        <Dashboard />
      </DashboardWrapper>
    );

    expect(screen.getByText('Agenda')).toBeInTheDocument();
    expect(screen.getByText('Calendário')).toBeInTheDocument();
    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.getByText('Sobre')).toBeInTheDocument();
  });
});