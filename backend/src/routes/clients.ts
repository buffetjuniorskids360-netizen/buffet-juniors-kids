import { Router } from 'express';
import { eq, ilike, or, desc, asc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/connection.js';
import { clients } from '../db/schema.js';
import { logger } from '../middleware/logging.js';

const router = Router();

// Validation schemas
const createClientSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial();

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// GET /api/clients - List clients with pagination and search
router.get('/', async (req, res) => {
  try {
    const validation = querySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validation.error.issues,
      });
    }

    const { page, limit, search, sortBy, sortOrder } = validation.data;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query conditions
    let whereConditions;
    if (search) {
      whereConditions = or(
        ilike(clients.name, `%${search}%`),
        ilike(clients.email, `%${search}%`),
        ilike(clients.phone, `%${search}%`)
      );
    }

    // Build sort conditions
    const orderBy = sortOrder === 'asc' 
      ? asc(clients[sortBy]) 
      : desc(clients[sortBy]);

    // Execute query
    const clientsList = await db
      .select()
      .from(clients)
      .where(whereConditions)
      .orderBy(orderBy)
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: clients.id })
      .from(clients)
      .where(whereConditions);

    const total = totalResult.length;
    const totalPages = Math.ceil(total / parseInt(limit));

    logger.info(`Listed clients: ${clientsList.length} of ${total} total (page: ${page}, limit: ${limit}, search: ${search || 'none'}, sort: ${sortBy} ${sortOrder})`);

    res.json({
      clients: clientsList,
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
    logger.error(`Error listing clients: ${error}`);
    res.status(500).json({ error: 'Failed to list clients' });
  }
});

// GET /api/clients/:id - Get single client
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (client.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    logger.info(`Retrieved client: ${client[0].name} (clientId: ${id})`);
    res.json(client[0]);
  } catch (error) {
    logger.error(`Error retrieving client: ${error}`);
    res.status(500).json({ error: 'Failed to retrieve client' });
  }
});

// POST /api/clients - Create new client
router.post('/', async (req, res) => {
  try {
    const validation = createClientSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid client data',
        details: validation.error.issues,
      });
    }

    const clientData = validation.data;

    // Check if email already exists (if provided)
    if (clientData.email) {
      const existingClient = await db
        .select()
        .from(clients)
        .where(eq(clients.email, clientData.email))
        .limit(1);

      if (existingClient.length > 0) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    const newClient = await db
      .insert(clients)
      .values({
        ...clientData,
        updatedAt: new Date(),
      })
      .returning();

    logger.info(`Created new client: ${newClient[0].name} (clientId: ${newClient[0].id}, email: ${newClient[0].email || 'none'})`);

    res.status(201).json(newClient[0]);
  } catch (error) {
    logger.error(`Error creating client: ${error}`);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validation = updateClientSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid client data',
        details: validation.error.issues,
      });
    }

    const updateData = validation.data;

    // Check if client exists
    const existingClient = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (existingClient.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Check if email already exists (if updating email)
    if (updateData.email && updateData.email !== existingClient[0].email) {
      const emailExists = await db
        .select()
        .from(clients)
        .where(eq(clients.email, updateData.email))
        .limit(1);

      if (emailExists.length > 0) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    const updatedClient = await db
      .update(clients)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();

    logger.info(`Updated client: ${updatedClient[0].name} (clientId: ${id}, changes: ${Object.keys(updateData).join(', ')})`);

    res.json(updatedClient[0]);
  } catch (error) {
    logger.error(`Error updating client: ${error}`);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id - Delete client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if client exists
    const existingClient = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (existingClient.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // TODO: Add check for related events before deletion
    // For now, we'll allow deletion but should add CASCADE behavior later

    await db
      .delete(clients)
      .where(eq(clients.id, id));

    logger.info(`Deleted client: ${existingClient[0].name} (clientId: ${id})`);

    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting client: ${error}`);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;