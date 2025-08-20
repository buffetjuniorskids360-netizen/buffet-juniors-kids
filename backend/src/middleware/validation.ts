import { z, ZodSchema } from 'zod';
import type { Request, Response, NextFunction } from 'express';

// Middleware genérico para validação usando Zod
export const validate = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar body se schema fornecido
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      
      // Validar query params se schema fornecido
      if (schema.query) {
        req.query = schema.query.parse(req.query) as any;
      }
      
      // Validar route params se schema fornecido
      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dados de entrada inválidos',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      
      next(error);
    }
  };
};

// Schemas comuns de validação

// Schema para IDs UUID
export const uuidSchema = z.string().uuid('ID deve ser um UUID válido');

// Schema para paginação
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Schemas para autenticação
export const loginSchema = z.object({
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email deve ser válido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['admin', 'operator']).default('operator'),
});

// Schemas para clientes
export const createClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial();

// Schemas para eventos
export const createEventSchema = z.object({
  clientId: uuidSchema,
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  date: z.string().datetime('Data deve estar no formato ISO 8601'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:mm'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:mm'),
  guestsCount: z.number().int().min(1, 'Deve haver pelo menos 1 convidado'),
  packageType: z.string().min(1, 'Tipo de pacote é obrigatório'),
  totalValue: z.number().min(0, 'Valor deve ser positivo'),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('pending'),
  notes: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial().omit({ clientId: true });

// Schemas para pagamentos
export const createPaymentSchema = z.object({
  eventId: uuidSchema,
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  paymentMethod: z.enum(['cash', 'card', 'pix', 'transfer']),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  amount: z.number().min(0.01).optional(),
  paymentMethod: z.enum(['cash', 'card', 'pix', 'transfer']).optional(),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  paymentDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// Schemas para despesas
export const createExpenseSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  expenseDate: z.string().datetime('Data deve estar no formato ISO 8601'),
});