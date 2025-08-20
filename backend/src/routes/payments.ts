import { Router } from 'express';
import { eq, ilike, or, desc, asc, and, gte, lte, between, isNull, isNotNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { payments, events, clients, cashFlow } from '../db/schema.js';
import { logger } from '../middleware/logging.js';

const router = Router();

// Validation schemas
const createPaymentSchema = z.object({
  eventId: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid decimal format'),
  paymentMethod: z.enum(['cash', 'card', 'pix', 'transfer']),
  status: z.enum(['pending', 'paid', 'overdue']).optional().default('pending'),
  dueDate: z.string().datetime().optional(),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const updatePaymentSchema = createPaymentSchema.partial();

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  paymentMethod: z.enum(['cash', 'card', 'pix', 'transfer']).optional(),
  eventId: z.string().optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  sortBy: z.enum(['dueDate', 'paymentDate', 'amount', 'createdAt']).optional().default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// GET /api/payments - List payments with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const validation = querySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validation.error.issues,
      });
    }

    const { 
      page, 
      limit, 
      search, 
      status, 
      paymentMethod, 
      eventId, 
      dueDateFrom, 
      dueDateTo, 
      sortBy, 
      sortOrder 
    } = validation.data;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(events.title, `%${search}%`),
          ilike(clients.name, `%${search}%`),
          ilike(payments.notes, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(payments.status, status));
    }

    if (paymentMethod) {
      conditions.push(eq(payments.paymentMethod, paymentMethod));
    }

    if (eventId) {
      conditions.push(eq(payments.eventId, eventId));
    }

    if (dueDateFrom && dueDateTo) {
      conditions.push(between(payments.dueDate, new Date(dueDateFrom), new Date(dueDateTo)));
    } else if (dueDateFrom) {
      conditions.push(gte(payments.dueDate, new Date(dueDateFrom)));
    } else if (dueDateTo) {
      conditions.push(lte(payments.dueDate, new Date(dueDateTo)));
    }

    const whereConditions = conditions.length > 0 ? and(...conditions) : undefined;

    // Build sort conditions
    const orderBy = sortOrder === 'asc' 
      ? asc(payments[sortBy]) 
      : desc(payments[sortBy]);

    // Execute query with joined data
    const paymentsList = await db
      .select({
        id: payments.id,
        eventId: payments.eventId,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        status: payments.status,
        dueDate: payments.dueDate,
        notes: payments.notes,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
        event: {
          id: events.id,
          title: events.title,
          date: events.date,
          totalValue: events.totalValue,
          status: events.status,
        },
        client: {
          id: clients.id,
          name: clients.name,
          phone: clients.phone,
          email: clients.email,
        },
      })
      .from(payments)
      .leftJoin(events, eq(payments.eventId, events.id))
      .leftJoin(clients, eq(events.clientId, clients.id))
      .where(whereConditions)
      .orderBy(orderBy)
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: payments.id })
      .from(payments)
      .leftJoin(events, eq(payments.eventId, events.id))
      .leftJoin(clients, eq(events.clientId, clients.id))
      .where(whereConditions);

    const total = totalResult.length;
    const totalPages = Math.ceil(total / parseInt(limit));

    logger.info(`Listed payments: ${paymentsList.length} of ${total} total (page: ${page}, limit: ${limit}, filters: status=${status || 'all'}, method=${paymentMethod || 'all'})`);

    res.json({
      payments: paymentsList,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to list payments' });
  }
});

// GET /api/payments/:id - Get single payment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const paymentResult = await db
      .select({
        id: payments.id,
        eventId: payments.eventId,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        status: payments.status,
        dueDate: payments.dueDate,
        notes: payments.notes,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
        event: {
          id: events.id,
          title: events.title,
          date: events.date,
          totalValue: events.totalValue,
          status: events.status,
          guestsCount: events.guestsCount,
        },
        client: {
          id: clients.id,
          name: clients.name,
          phone: clients.phone,
          email: clients.email,
          address: clients.address,
        },
      })
      .from(payments)
      .leftJoin(events, eq(payments.eventId, events.id))
      .leftJoin(clients, eq(events.clientId, clients.id))
      .where(eq(payments.id, id))
      .limit(1);

    if (paymentResult.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    logger.info(`Retrieved payment for event: ${paymentResult[0].event?.title} (paymentId: ${id})`);
    res.json(paymentResult[0]);
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to retrieve payment' });
  }
});

// POST /api/payments - Create new payment
router.post('/', async (req, res) => {
  try {
    const validation = createPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid payment data',
        details: validation.error.issues,
      });
    }

    const paymentData = validation.data;

    // Verify event exists
    const eventExists = await db
      .select()
      .from(events)
      .where(eq(events.id, paymentData.eventId))
      .limit(1);

    if (eventExists.length === 0) {
      return res.status(400).json({ error: 'Event not found' });
    }

    // Create payment with database transaction
    const result = await db.transaction(async (tx) => {
      // Convert dates and prepare data for DB
      const { dueDate: dueDateString, paymentDate: paymentDateString, ...restPaymentData } = paymentData;
      const dbPaymentData = {
        ...restPaymentData,
        ...(dueDateString && { dueDate: new Date(dueDateString) }),
        ...(paymentDateString && { paymentDate: new Date(paymentDateString) }),
      };

      const newPayment = await tx
        .insert(payments)
        .values(dbPaymentData)
        .returning();

      // If payment is marked as paid, create cash flow entry
      if (paymentData.status === 'paid' && paymentData.paymentDate) {
        await tx.insert(cashFlow).values({
          type: 'income',
          amount: paymentData.amount,
          description: `Pagamento recebido - ${eventExists[0].title}`,
          referenceId: newPayment[0].id,
          referenceType: 'payment',
          transactionDate: new Date(paymentData.paymentDate),
        });
      }

      return newPayment[0];
    });

    logger.info(`Created new payment for event: ${eventExists[0].title} (paymentId: ${result.id}, amount: ${paymentData.amount}, status: ${paymentData.status})`);

    res.status(201).json(result);
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// PUT /api/payments/:id - Update payment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validation = updatePaymentSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid payment data',
        details: validation.error.issues,
      });
    }

    const updateData = validation.data;

    // Check if payment exists
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    if (existingPayment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const wasNotPaid = existingPayment[0].status !== 'paid';
    const willBePaid = updateData.status === 'paid';

    // Update payment with database transaction
    const result = await db.transaction(async (tx) => {
      // Convert dates and prepare data for DB
      const { dueDate: dueDateString, paymentDate: paymentDateString, ...restUpdateData } = updateData;
      const dbUpdateData = {
        ...restUpdateData,
        ...(dueDateString && { dueDate: new Date(dueDateString) }),
        ...(paymentDateString && { paymentDate: new Date(paymentDateString) }),
      };

      const updatedPayment = await tx
        .update(payments)
        .set(dbUpdateData)
        .where(eq(payments.id, id))
        .returning();

      // Handle cash flow entries when payment status changes to paid
      if (wasNotPaid && willBePaid && updateData.paymentDate) {
        // Get event details for cash flow description
        const eventDetails = await tx
          .select({ title: events.title })
          .from(events)
          .where(eq(events.id, existingPayment[0].eventId))
          .limit(1);

        await tx.insert(cashFlow).values({
          type: 'income',
          amount: updateData.amount || existingPayment[0].amount,
          description: `Pagamento recebido - ${eventDetails[0]?.title || 'Evento'}`,
          referenceId: id,
          referenceType: 'payment',
          transactionDate: new Date(updateData.paymentDate),
        });
      }

      return updatedPayment[0];
    });

    logger.info(`Updated payment (paymentId: ${id}, changes: ${Object.keys(updateData).join(', ')}, statusChange: ${wasNotPaid && willBePaid ? 'marked as paid' : 'no status change'})`);

    res.json(result);
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// DELETE /api/payments/:id - Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if payment exists
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    if (existingPayment.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Delete payment and related cash flow entries
    await db.transaction(async (tx) => {
      // Delete related cash flow entries
      await tx
        .delete(cashFlow)
        .where(and(
          eq(cashFlow.referenceId, id),
          eq(cashFlow.referenceType, 'payment')
        ));

      // Delete payment
      await tx
        .delete(payments)
        .where(eq(payments.id, id));
    });

    logger.info(`Deleted payment (paymentId: ${id})`);

    res.status(204).send();
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// GET /api/payments/event/:eventId - Get payments for specific event
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const eventPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        status: payments.status,
        dueDate: payments.dueDate,
        notes: payments.notes,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
      })
      .from(payments)
      .where(eq(payments.eventId, eventId))
      .orderBy(asc(payments.dueDate));

    // Calculate totals
    const totalAmount = eventPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const paidAmount = eventPayments
      .filter(payment => payment.status === 'paid')
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const pendingAmount = totalAmount - paidAmount;

    logger.info(`Retrieved ${eventPayments.length} payments for event (eventId: ${eventId}, total: ${totalAmount}, paid: ${paidAmount}, pending: ${pendingAmount})`);

    res.json({
      payments: eventPayments,
      summary: {
        totalAmount,
        paidAmount,
        pendingAmount,
        totalPayments: eventPayments.length,
        paidPayments: eventPayments.filter(p => p.status === 'paid').length,
        pendingPayments: eventPayments.filter(p => p.status === 'pending').length,
        overduePayments: eventPayments.filter(p => p.status === 'overdue').length,
      },
    });
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to retrieve event payments' });
  }
});

// GET /api/payments/analytics - Get payment analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get payment analytics
    const analytics = await db.transaction(async (tx) => {
      // Total payments summary
      const totalPayments = await tx
        .select({
          status: payments.status,
          count: payments.id,
          totalAmount: payments.amount,
        })
        .from(payments)
        .where(gte(payments.createdAt, startDate));

      // Payment methods distribution
      const paymentMethods = await tx
        .select({
          method: payments.paymentMethod,
          count: payments.id,
          totalAmount: payments.amount,
        })
        .from(payments)
        .where(and(
          gte(payments.createdAt, startDate),
          eq(payments.status, 'paid')
        ));

      // Overdue payments
      const overduePayments = await tx
        .select({
          count: payments.id,
          totalAmount: payments.amount,
        })
        .from(payments)
        .where(and(
          eq(payments.status, 'overdue'),
          lte(payments.dueDate, new Date())
        ));

      return {
        period: `${days} days`,
        totalPayments: totalPayments.length,
        paymentsByStatus: totalPayments.reduce((acc, payment) => {
          if (!acc[payment.status]) {
            acc[payment.status] = { count: 0, amount: 0 };
          }
          acc[payment.status].count += 1;
          acc[payment.status].amount += parseFloat(payment.totalAmount);
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
        paymentsByMethod: paymentMethods.reduce((acc, payment) => {
          if (!acc[payment.method]) {
            acc[payment.method] = { count: 0, amount: 0 };
          }
          acc[payment.method].count += 1;
          acc[payment.method].amount += parseFloat(payment.totalAmount);
          return acc;
        }, {} as Record<string, { count: number; amount: number }>),
        overduePayments: {
          count: overduePayments.length,
          totalAmount: overduePayments.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0),
        },
      };
    });

    logger.info(`Retrieved payment analytics for ${days} days`);
    res.json(analytics);
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to retrieve payment analytics' });
  }
});

// GET /api/payments/analytics/detailed - Get detailed payment analytics with filters
router.get('/analytics/detailed', async (req, res) => {
  try {
    const { 
      dateFrom, 
      dateTo, 
      clientId, 
      status, 
      paymentMethod 
    } = req.query;

    // Build filter conditions
    const conditions = [];
    
    if (dateFrom && dateTo) {
      conditions.push(between(payments.createdAt, new Date(dateFrom as string), new Date(dateTo as string)));
    } else if (dateFrom) {
      conditions.push(gte(payments.createdAt, new Date(dateFrom as string)));
    } else if (dateTo) {
      conditions.push(lte(payments.createdAt, new Date(dateTo as string)));
    }

    if (status) {
      conditions.push(eq(payments.status, status as string));
    }

    if (paymentMethod) {
      conditions.push(eq(payments.paymentMethod, paymentMethod as string));
    }

    // If client filter is specified, join with events to filter by clientId
    if (clientId && clientId !== 'all') {
      conditions.push(eq(events.clientId, clientId as string));
    }

    const whereConditions = conditions.length > 0 ? and(...conditions) : undefined;

    // Get detailed analytics
    const analytics = await db.transaction(async (tx) => {
      // Base query with joins
      const baseQuery = tx
        .select({
          paymentId: payments.id,
          amount: payments.amount,
          status: payments.status,
          method: payments.paymentMethod,
          paymentDate: payments.paymentDate,
          dueDate: payments.dueDate,
          createdAt: payments.createdAt,
          eventId: events.id,
          eventTitle: events.title,
          eventDate: events.date,
          eventValue: events.totalValue,
          clientId: clients.id,
          clientName: clients.name,
        })
        .from(payments)
        .leftJoin(events, eq(payments.eventId, events.id))
        .leftJoin(clients, eq(events.clientId, clients.id));

      const allPayments = whereConditions 
        ? await baseQuery.where(whereConditions)
        : await baseQuery;

      // Calculate summary metrics
      const totalAmount = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const paidAmount = allPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const pendingAmount = allPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      // Payment status distribution
      const statusDistribution = allPayments.reduce((acc, payment) => {
        if (!acc[payment.status]) {
          acc[payment.status] = { count: 0, amount: 0 };
        }
        acc[payment.status].count += 1;
        acc[payment.status].amount += parseFloat(payment.amount);
        return acc;
      }, {} as Record<string, { count: number; amount: number }>);

      // Payment method distribution
      const methodDistribution = allPayments.reduce((acc, payment) => {
        if (!acc[payment.method]) {
          acc[payment.method] = { count: 0, amount: 0 };
        }
        acc[payment.method].count += 1;
        acc[payment.method].amount += parseFloat(payment.amount);
        return acc;
      }, {} as Record<string, { count: number; amount: number }>);

      // Client performance (top performers)
      const clientPerformance = allPayments.reduce((acc, payment) => {
        const clientId = payment.clientId;
        const clientName = payment.clientName || 'Cliente Desconhecido';
        
        if (!acc[clientId]) {
          acc[clientId] = {
            clientId,
            clientName,
            totalAmount: 0,
            paidAmount: 0,
            paymentCount: 0,
            eventCount: new Set()
          };
        }
        
        acc[clientId].totalAmount += parseFloat(payment.amount);
        acc[clientId].paymentCount += 1;
        acc[clientId].eventCount.add(payment.eventId);
        
        if (payment.status === 'paid') {
          acc[clientId].paidAmount += parseFloat(payment.amount);
        }
        
        return acc;
      }, {} as Record<string, any>);

      // Convert client performance to array and calculate metrics
      const topClients = Object.values(clientPerformance)
        .map((client: any) => ({
          clientId: client.clientId,
          clientName: client.clientName,
          totalAmount: client.totalAmount,
          paidAmount: client.paidAmount,
          paymentCount: client.paymentCount,
          eventCount: client.eventCount.size,
          paymentRate: client.totalAmount > 0 ? (client.paidAmount / client.totalAmount) * 100 : 0,
          averagePayment: client.paymentCount > 0 ? client.totalAmount / client.paymentCount : 0,
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);

      // Time-based analysis (monthly breakdown)
      const monthlyData = allPayments.reduce((acc, payment) => {
        const month = new Date(payment.createdAt).toISOString().slice(0, 7); // YYYY-MM
        
        if (!acc[month]) {
          acc[month] = {
            month,
            totalAmount: 0,
            paidAmount: 0,
            paymentCount: 0,
            paidCount: 0
          };
        }
        
        acc[month].totalAmount += parseFloat(payment.amount);
        acc[month].paymentCount += 1;
        
        if (payment.status === 'paid') {
          acc[month].paidAmount += parseFloat(payment.amount);
          acc[month].paidCount += 1;
        }
        
        return acc;
      }, {} as Record<string, any>);

      const monthlyBreakdown = Object.values(monthlyData)
        .sort((a: any, b: any) => a.month.localeCompare(b.month));

      return {
        summary: {
          totalPayments: allPayments.length,
          totalAmount,
          paidAmount,
          pendingAmount,
          paymentRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
          averagePayment: allPayments.length > 0 ? totalAmount / allPayments.length : 0,
        },
        distributions: {
          byStatus: statusDistribution,
          byMethod: methodDistribution,
        },
        topClients,
        monthlyBreakdown,
        filters: {
          dateFrom,
          dateTo,
          clientId,
          status,
          paymentMethod,
          recordCount: allPayments.length,
        }
      };
    });

    logger.info(`Retrieved detailed payment analytics with filters: ${JSON.stringify(req.query)}`);
    res.json(analytics);
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to retrieve detailed payment analytics' });
  }
});

export default router;