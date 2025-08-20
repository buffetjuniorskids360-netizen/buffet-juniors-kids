import { useState, useEffect } from 'react';
import { Client, CreateClientData, UpdateClientData, ClientFormData, ClientFormErrors } from '@/types/client';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClientData | UpdateClientData) => Promise<void>;
  client?: Client | null;
  isLoading?: boolean;
}

export default function ClientForm({ isOpen, onClose, onSubmit, client, isLoading = false }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [serverError, setServerError] = useState<string>('');

  // Reset form when dialog opens/closes or client changes
  useEffect(() => {
    if (isOpen) {
      if (client) {
        // Edit mode - populate form with client data
        setFormData({
          name: client.name || '',
          phone: client.phone || '',
          email: client.email || '',
          address: client.address || '',
          notes: client.notes || '',
        });
      } else {
        // Create mode - reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          address: '',
          notes: '',
        });
      }
      setErrors({});
      setServerError('');
    }
  }, [isOpen, client]);

  const validateForm = (): boolean => {
    const newErrors: ClientFormErrors = {};

    // Name is required
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Email validation (if provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    // Phone validation (if provided)
    if (formData.phone.trim()) {
      const phoneRegex = /^[\d\s()\-+]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Telefone deve conter apenas números e símbolos válidos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous server errors
    setServerError('');
    setErrors({});
    
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data for submission (remove empty strings)
      const submitData: CreateClientData | UpdateClientData = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (error instanceof ApiError) {
        // Handle server-side validation errors
        if (error.status === 400) {
          // Try to parse validation errors from server response
          try {
            const errorMessage = error.message;
            
            // Check if it's a field-specific validation error
            if (errorMessage.toLowerCase().includes('name')) {
              setErrors(prev => ({ ...prev, name: errorMessage }));
            } else if (errorMessage.toLowerCase().includes('email')) {
              setErrors(prev => ({ ...prev, email: errorMessage }));
            } else if (errorMessage.toLowerCase().includes('phone')) {
              setErrors(prev => ({ ...prev, phone: errorMessage }));
            } else {
              setServerError(errorMessage);
            }
          } catch {
            setServerError('Dados inválidos. Por favor, verifique as informações fornecidas.');
          }
        } else if (error.status === 409) {
          setServerError('Cliente já existe. Por favor, verifique os dados informados.');
        } else if (error.status >= 500) {
          setServerError('Erro interno do servidor. Tente novamente em alguns minutos.');
        } else {
          setServerError(error.message || 'Erro ao salvar cliente.');
        }
      } else {
        setServerError('Erro de conexão. Verifique sua internet e tente novamente.');
      }
    }
  };

  const handleChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear server error when user makes changes
    if (serverError) {
      setServerError('');
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length <= 10) {
      // Format as (XX) XXXX-XXXX
      return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, (match, p1, p2, p3) => {
        if (p3) {
          return `(${p1}) ${p2}-${p3}`;
        } else if (p2) {
          return `(${p1}) ${p2}`;
        } else if (p1) {
          return `(${p1}`;
        }
        return match;
      });
    } else {
      // Format as (XX) XXXXX-XXXX for mobile
      return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, (match, p1, p2, p3) => {
        if (p3) {
          return `(${p1}) ${p2}-${p3}`;
        } else if (p2) {
          return `(${p1}) ${p2}`;
        } else if (p1) {
          return `(${p1}`;
        }
        return match;
      });
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleChange('phone', formatted);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white" style={{ padding: '32px' }}>
        <DialogHeader style={{ marginBottom: '24px' }}>
          <DialogTitle style={{ marginBottom: '8px' }}>
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {client 
              ? 'Faça as alterações necessárias e clique em salvar.'
              : 'Preencha os dados do novo cliente. Campos com * são obrigatórios.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {serverError && (
          <div className="bg-destructive/15 border border-destructive/50 text-destructive rounded-md text-sm" style={{ padding: '16px', marginBottom: '24px' }}>
            {serverError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nome completo do cliente"
              disabled={isLoading}
              className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-sm text-destructive" style={{ marginTop: '8px' }}>{errors.name}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(XX) XXXXX-XXXX"
              disabled={isLoading}
              className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.phone && (
              <p className="text-sm text-destructive" style={{ marginTop: '8px' }}>{errors.phone}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@exemplo.com"
              disabled={isLoading}
              className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-sm text-destructive" style={{ marginTop: '8px' }}>{errors.email}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="address" className="text-sm font-medium text-slate-700">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Endereço completo do cliente"
              rows={3}
              disabled={isLoading}
              className="min-h-[80px] border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.address && (
              <p className="text-sm text-destructive" style={{ marginTop: '8px' }}>{errors.address}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes" className="text-sm font-medium text-slate-700">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Observações adicionais sobre o cliente"
              rows={4}
              disabled={isLoading}
              className="min-h-[100px] border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.notes && (
              <p className="text-sm text-destructive" style={{ marginTop: '8px' }}>{errors.notes}</p>
            )}
          </div>

          <DialogFooter style={{ marginTop: '32px', gap: '12px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              style={{ padding: '12px 24px' }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              style={{ padding: '12px 24px' }}
            >
              {isLoading ? 'Salvando...' : (client ? 'Salvar Alterações' : 'Criar Cliente')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}