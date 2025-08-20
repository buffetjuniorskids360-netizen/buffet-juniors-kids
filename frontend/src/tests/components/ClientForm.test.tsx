import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientForm from '@/components/ClientForm';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('ClientForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    render(<ClientForm {...defaultProps} />);

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/endereço/i)).toBeInTheDocument();
    expect(screen.getByText('Salvar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(<ClientForm {...defaultProps} />);

    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/telefone é obrigatório/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/e-mail deve ter um formato válido/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates phone number format', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);

    const phoneInput = screen.getByLabelText(/telefone/i);
    await user.type(phoneInput, '123');

    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/telefone deve ter pelo menos 10 dígitos/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);

    // Fill in all required fields
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/e-mail/i), 'joao@email.com');
    await user.type(screen.getByLabelText(/telefone/i), '11987654321');
    await user.type(screen.getByLabelText(/endereço/i), 'Rua das Flores, 123');

    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11987654321',
        address: 'Rua das Flores, 123',
        notes: '',
      });
    });
  });

  it('populates form when editing existing client', () => {
    const existingClient = {
      id: '1',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '11999888777',
      address: 'Av. Principal, 456',
      notes: 'Cliente VIP',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      events: []
    };

    render(<ClientForm {...defaultProps} client={existingClient} />);

    expect(screen.getByDisplayValue('Maria Santos')).toBeInTheDocument();
    expect(screen.getByDisplayValue('maria@email.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('11999888777')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Av. Principal, 456')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cliente VIP')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ClientForm {...defaultProps} />);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('disables submit button when loading', () => {
    render(<ClientForm {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByText('Salvando...');
    expect(submitButton).toBeDisabled();
  });

  it('formats phone number on input', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);

    const phoneInput = screen.getByLabelText(/telefone/i);
    await user.type(phoneInput, '11987654321');

    // The phone should be formatted as (11) 98765-4321
    expect(phoneInput).toHaveValue('(11) 98765-4321');
  });

  it('prevents form submission on Enter key in input fields', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/nome completo/i);
    await user.type(nameInput, 'Test Name{enter}');

    // Form should not be submitted with incomplete data
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('closes dialog when form is not open', () => {
    render(<ClientForm {...defaultProps} isOpen={false} />);

    // Dialog should not be visible
    expect(screen.queryByText('Salvar')).not.toBeInTheDocument();
  });

  it('handles form reset correctly', async () => {
    const user = userEvent.setup();
    render(<ClientForm {...defaultProps} />);

    // Fill form
    await user.type(screen.getByLabelText(/nome completo/i), 'Test Name');
    await user.type(screen.getByLabelText(/e-mail/i), 'test@email.com');

    // Cancel form
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows correct title for new vs edit mode', () => {
    // Test new client mode
    const { rerender } = render(<ClientForm {...defaultProps} />);
    expect(screen.getByText('Novo Cliente')).toBeInTheDocument();

    // Test edit client mode
    const existingClient = {
      id: '1',
      name: 'Test Client',
      email: 'test@email.com',
      phone: '11999888777',
      address: 'Test Address',
      notes: '',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      events: []
    };

    rerender(<ClientForm {...defaultProps} client={existingClient} />);
    expect(screen.getByText('Editar Cliente')).toBeInTheDocument();
  });
});