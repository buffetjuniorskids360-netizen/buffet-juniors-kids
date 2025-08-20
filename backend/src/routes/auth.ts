import { Router } from 'express';
import passport from '../middleware/auth.js';
import { requireAuth, requireAdmin, hashPassword } from '../middleware/auth.js';
import { validate, loginSchema, createUserSchema } from '../middleware/validation.js';
import { db } from '../db/connection.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '../middleware/logging.js';
import type { Request, Response } from 'express';

const router = Router();

// GET /auth - Rotas disponíveis
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Authentication API',
    version: '1.0.0',
    endpoints: {
      'POST /auth/login': 'Fazer login',
      'POST /auth/logout': 'Fazer logout (autenticado)',
      'GET /auth/me': 'Obter dados do usuário atual (autenticado)',
      'POST /auth/create-user': 'Criar novo usuário (admin)',
      'GET /auth/users': 'Listar usuários (admin)',
    },
    status: 'online'
  });
});

// POST /auth/login - Fazer login
router.post('/login', validate({ body: loginSchema }), (req: Request, res: Response, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      logger.error({ error: err, correlationId: req.correlationId }, 'Login error');
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas',
        message: info?.message || 'Username ou senha incorretos'
      });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        logger.error({ error: err, correlationId: req.correlationId }, 'Session creation error');
        return res.status(500).json({ error: 'Erro ao criar sessão' });
      }
      
      logger.info({ 
        userId: user.id, 
        username: user.username, 
        correlationId: req.correlationId 
      }, 'User logged in successfully');
      
      res.json({
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    });
  })(req, res, next);
});

// POST /auth/logout - Fazer logout
router.post('/logout', requireAuth, (req: Request, res: Response) => {
  const userId = (req.user as any)?.id;
  
  req.logout((err) => {
    if (err) {
      logger.error({ error: err, correlationId: req.correlationId }, 'Logout error');
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    
    req.session.destroy((err) => {
      if (err) {
        logger.error({ error: err, correlationId: req.correlationId }, 'Session destruction error');
        return res.status(500).json({ error: 'Erro ao destruir sessão' });
      }
      
      logger.info({ userId, correlationId: req.correlationId }, 'User logged out successfully');
      res.json({ message: 'Logout realizado com sucesso' });
    });
  });
});

// GET /auth/me - Obter dados do usuário atual
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = req.user as any;
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /auth/create-user - Criar novo usuário (apenas admin)
router.post('/create-user', requireAuth, requireAdmin, validate({ body: createUserSchema }), async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Verificar se username já existe
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
      
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflito',
        message: 'Username já está em uso'
      });
    }
    
    // Verificar se email já existe
    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
      
    if (existingEmail) {
      return res.status(409).json({
        error: 'Conflito',
        message: 'Email já está em uso'
      });
    }
    
    // Hash da senha
    const passwordHash = await hashPassword(password);
    
    // Criar usuário
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash,
        role,
        updatedAt: new Date(),
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });
    
    logger.info({ 
      newUserId: newUser.id, 
      username: newUser.username,
      createdBy: (req.user as any).id,
      correlationId: req.correlationId 
    }, 'User created successfully');
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: newUser,
    });
    
  } catch (error) {
    logger.error({ error, correlationId: req.correlationId }, 'Create user error');
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /auth/users - Listar usuários (apenas admin)
router.get('/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const usersList = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(users.createdAt);
    
    res.json({
      users: usersList,
      total: usersList.length,
    });
    
  } catch (error) {
    logger.error({ error, correlationId: req.correlationId }, 'List users error');
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;