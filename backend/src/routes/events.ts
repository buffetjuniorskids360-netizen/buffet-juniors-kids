import { Router } from 'express';
import { eq, ilike, or, desc, asc, and, gte, lte, between } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { events, clients } from '../db/schema.js';
import { logger } from '../middleware/logging.js';

const router = Router();

// Validation schemas
const createEventSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1).max(100),
  date: z.string().datetime(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  guestsCount: z.number().int().min(1),
  packageType: z.string().min(1).max(50),
  totalValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid decimal format'),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional().default('pending'),
  notes: z.string().optional(),
});

const updateEventSchema = createEventSchema.partial();

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  clientId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['date', 'title', 'createdAt', 'totalValue']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// GET /api/events - List events with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const validation = querySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validation.error.issues,
      });
    }

    const { page, limit, search, status, clientId, dateFrom, dateTo, sortBy, sortOrder } = validation.data;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(events.title, `%${search}%`),
          ilike(events.packageType, `%${search}%`),
          ilike(events.notes, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(events.status, status));
    }

    if (clientId) {
      conditions.push(eq(events.clientId, clientId));
    }

    if (dateFrom && dateTo) {
      conditions.push(between(events.date, new Date(dateFrom), new Date(dateTo)));
    } else if (dateFrom) {
      conditions.push(gte(events.date, new Date(dateFrom)));
    } else if (dateTo) {
      conditions.push(lte(events.date, new Date(dateTo)));
    }

    const whereConditions = conditions.length > 0 ? and(...conditions) : undefined;

    // Build sort conditions
    const orderBy = sortOrder === 'asc' 
      ? asc(events[sortBy]) 
      : desc(events[sortBy]);

    // Execute query with client data joined
    const eventsList = await db
      .select({
        id: events.id,
        clientId: events.clientId,
        title: events.title,
        date: events.date,
        startTime: events.startTime,
        endTime: events.endTime,
        guestsCount: events.guestsCount,
        packageType: events.packageType,
        totalValue: events.totalValue,
        status: events.status,
        notes: events.notes,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        client: {
          id: clients.id,
          name: clients.name,
          phone: clients.phone,
          email: clients.email,
        },
      })
      .from(events)
      .leftJoin(clients, eq(events.clientId, clients.id))
      .where(whereConditions)
      .orderBy(orderBy)
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: events.id })
      .from(events)
      .where(whereConditions);

    const total = totalResult.length;
    const totalPages = Math.ceil(total / parseInt(limit));

    logger.info(`Listed events: ${eventsList.length} of ${total} total (page: ${page}, limit: ${limit}, filters: status=${status || 'all'}, client=${clientId || 'all'})`);

    res.json({
      events: eventsList,
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
    res.status(500).json({ error: 'Failed to list events' });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const eventResult = await db
      .select({
        id: events.id,
        clientId: events.clientId,
        title: events.title,
        date: events.date,
        startTime: events.startTime,
        endTime: events.endTime,
        guestsCount: events.guestsCount,
        packageType: events.packageType,
        totalValue: events.totalValue,
        status: events.status,
        notes: events.notes,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        client: {
          id: clients.id,
          name: clients.name,
          phone: clients.phone,
          email: clients.email,
          address: clients.address,
        },
      })
      .from(events)
      .leftJoin(clients, eq(events.clientId, clients.id))
      .where(eq(events.id, id))
      .limit(1);

    if (eventResult.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    logger.info(`Retrieved event: ${eventResult[0].title} (eventId: ${id})`);
    res.json(eventResult[0]);
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to retrieve event' });
  }
});

// POST /api/events - Create new event
router.post('/', async (req, res) => {
  try {
    const validation = createEventSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid event data',
        details: validation.error.issues,
      });
    }

    const eventData = validation.data;

    // Verify client exists
    const clientExists = await db
      .select()
      .from(clients)
      .where(eq(clients.id, eventData.clientId))
      .limit(1);

    if (clientExists.length === 0) {
      return res.status(400).json({ error: 'Client not found' });
    }

    // Validate that endTime is after startTime
    const [startHour, startMin] = eventData.startTime.split(':').map(Number);
    const [endHour, endMin] = eventData.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Check for time conflicts on the same date
    const eventDate = new Date(eventData.date);
    const conflictingEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.date, eventDate),
          or(
            and(
              lte(events.startTime, eventData.startTime),
              gte(events.endTime, eventData.startTime)
            ),
            and(
              lte(events.startTime, eventData.endTime),
              gte(events.endTime, eventData.endTime)
            ),
            and(
              gte(events.startTime, eventData.startTime),
              lte(events.endTime, eventData.endTime)
            )
          )
        )
      );

    if (conflictingEvents.length > 0) {
      return res.status(409).json({ 
        error: 'Time conflict with existing event',
        conflictingEvent: conflictingEvents[0],
      });
    }

    const newEvent = await db
      .insert(events)
      .values({
        ...eventData,
        date: new Date(eventData.date),
        updatedAt: new Date(),
      })
      .returning();

    logger.info(`Created new event: ${newEvent[0].title} (eventId: ${newEvent[0].id}, clientId: ${newEvent[0].clientId})`);

    res.status(201).json(newEvent[0]);
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validation = updateEventSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid event data',
        details: validation.error.issues,
      });
    }

    const updateData = validation.data;

    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (existingEvent.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify client exists (if clientId is being updated)
    if (updateData.clientId) {
      const clientExists = await db
        .select()
        .from(clients)
        .where(eq(clients.id, updateData.clientId))
        .limit(1);

      if (clientExists.length === 0) {
        return res.status(400).json({ error: 'Client not found' });
      }
    }

    // Validate time range (if times are being updated)
    if (updateData.startTime && updateData.endTime) {
      const [startHour, startMin] = updateData.startTime.split(':').map(Number);
      const [endHour, endMin] = updateData.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }
    }

    // Check for time conflicts (if date or times are being updated)
    if (updateData.date || updateData.startTime || updateData.endTime) {
      const eventDate = updateData.date ? new Date(updateData.date) : existingEvent[0].date;
      const startTime = updateData.startTime || existingEvent[0].startTime;
      const endTime = updateData.endTime || existingEvent[0].endTime;

      const conflictingEvents = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.date, eventDate),
            or(
              and(
                lte(events.startTime, startTime),
                gte(events.endTime, startTime)
              ),
              and(
                lte(events.startTime, endTime),
                gte(events.endTime, endTime)
              ),
              and(
                gte(events.startTime, startTime),
                lte(events.endTime, endTime)
              )
            )
          )
        );

      // Filter out the current event from conflicts
      const otherConflicts = conflictingEvents.filter(event => event.id !== id);
      
      if (otherConflicts.length > 0) {
        return res.status(409).json({ 
          error: 'Time conflict with existing event',
          conflictingEvent: otherConflicts[0],
        });
      }
    }

    // Convert dates and prepare data for DB
    const { date: dateString, ...restUpdateData } = updateData;
    const dbUpdateData = {
      ...restUpdateData,
      ...(dateString && { date: new Date(dateString) }),
    };

    const updatedEvent = await db
      .update(events)
      .set(dbUpdateData)
      .where(eq(events.id, id))
      .returning();

    logger.info(`Updated event: ${updatedEvent[0].title} (eventId: ${id}, changes: ${Object.keys(updateData).join(', ')})`);

    res.json(updatedEvent[0]);
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (existingEvent.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // TODO: Add check for related payments before deletion
    // For now, we'll allow deletion but should add CASCADE behavior later

    await db
      .delete(events)
      .where(eq(events.id, id));

    logger.info(`Deleted event: ${existingEvent[0].title} (eventId: ${id})`);

    res.status(204).send();
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// GET /api/events/calendar/:year/:month - Get events for calendar view
router.get('/calendar/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0); // Last day of the month

    const calendarEvents = await db
      .select({
        id: events.id,
        title: events.title,
        date: events.date,
        startTime: events.startTime,
        endTime: events.endTime,
        status: events.status,
        guestsCount: events.guestsCount,
        packageType: events.packageType,
        totalValue: events.totalValue,
        clientName: clients.name,
      })
      .from(events)
      .leftJoin(clients, eq(events.clientId, clients.id))
      .where(between(events.date, startDate, endDate))
      .orderBy(asc(events.date), asc(events.startTime));

    logger.info(`Retrieved calendar events for ${year}-${month}: ${calendarEvents.length} events`);

    res.json({
      year: yearNum,
      month: monthNum,
      events: calendarEvents,
    });
  } catch (error) {
    logger.error(`Error occurred: ${error}`);
    res.status(500).json({ error: 'Failed to retrieve calendar events' });
  }
});

export default router;