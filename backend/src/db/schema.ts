import { pgTable, text, integer, timestamp, decimal, varchar, boolean } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Users table - Sistema de autenticação
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('operator'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Clients table - Clientes do buffet
export const clients = pgTable('clients', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  address: text('address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Events table - Eventos/festas agendadas
export const events = pgTable('events', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  clientId: text('client_id').notNull().references(() => clients.id),
  title: varchar('title', { length: 100 }).notNull(),
  date: timestamp('date').notNull(),
  startTime: varchar('start_time', { length: 5 }).notNull(), // HH:mm format
  endTime: varchar('end_time', { length: 5 }).notNull(),     // HH:mm format
  guestsCount: integer('guests_count').notNull(),
  packageType: varchar('package_type', { length: 50 }).notNull(),
  totalValue: decimal('total_value', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, confirmed, cancelled, completed
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payments table - Pagamentos de eventos
export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  eventId: text('event_id').notNull().references(() => events.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp('payment_date'),
  paymentMethod: varchar('payment_method', { length: 30 }).notNull(), // cash, card, pix, transfer
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, paid, overdue
  dueDate: timestamp('due_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Documents table - Documentos vinculados
export const documents = pgTable('documents', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  clientId: text('client_id').references(() => clients.id),
  eventId: text('event_id').references(() => events.id),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
});

// Expenses table - Despesas operacionais
export const expenses = pgTable('expenses', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  expenseDate: timestamp('expense_date').notNull(),
  receiptPath: varchar('receipt_path', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cash Flow table - Fluxo de caixa
export const cashFlow = pgTable('cash_flow', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  type: varchar('type', { length: 20 }).notNull(), // income, expense
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: varchar('description', { length: 200 }).notNull(),
  referenceId: text('reference_id'), // ID do pagamento, despesa, etc.
  referenceType: varchar('reference_type', { length: 20 }), // payment, expense
  transactionDate: timestamp('transaction_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types para TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type CashFlow = typeof cashFlow.$inferSelect;
export type NewCashFlow = typeof cashFlow.$inferInsert;