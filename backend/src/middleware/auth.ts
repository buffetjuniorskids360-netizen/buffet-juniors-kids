import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { users, type User } from '../db/schema.js';
import type { Request, Response, NextFunction } from 'express';

// Configurar estratégia local do Passport
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username: string, password: string, done) => {
      try {
        // Buscar usuário no banco
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          return done(null, false, { message: 'Usuário não encontrado' });
        }

        // Verificar senha
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          return done(null, false, { message: 'Senha incorreta' });
        }

        // Sucesso - retornar usuário sem hash da senha
        const { passwordHash, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialização do usuário para sessão
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialização do usuário da sessão
passport.deserializeUser(async (id: string, done) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return done(null, false);
    }

    const { passwordHash, ...userWithoutPassword } = user;
    done(null, userWithoutPassword);
  } catch (error) {
    done(error);
  }
});

// Middleware para verificar se usuário está autenticado
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ 
    error: 'Não autorizado', 
    message: 'Você precisa estar logado para acessar este recurso' 
  });
};

// Middleware para verificar role de admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && (req.user as any)?.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Acesso negado', 
    message: 'Você precisa ser administrador para acessar este recurso' 
  });
};

// Helper para hash de senhas
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export default passport;