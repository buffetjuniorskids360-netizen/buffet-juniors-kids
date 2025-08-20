import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { users } from '../db/schema.js';
import { hashPassword } from '../middleware/auth.js';
import { logger } from '../middleware/logging.js';

dotenv.config();

async function initDatabase() {
  try {
    logger.info('🔄 Inicializando banco de dados...');

    // Verificar se já existe um admin
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(1);

    if (existingAdmin.length > 0) {
      logger.info('✅ Admin já existe no banco de dados');
      return;
    }

    // Criar usuário admin padrão
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminPassword = await hashPassword(defaultPassword);
    
    const [newAdmin] = await db
      .insert(users)
      .values({
        username: 'admin',
        email: 'admin@buffet.com',
        passwordHash: adminPassword,
        role: 'admin',
        updatedAt: new Date(),
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
      });

    logger.info(`🎉 Usuário admin criado com sucesso! (id: ${newAdmin.id}, username: admin, password: ${defaultPassword}) - MUDE A SENHA APÓS O PRIMEIRO LOGIN!`);

  } catch (error) {
    logger.error(`❌ Erro ao inicializar banco de dados: ${error}`);
    throw error;
  } finally {
    // Fechar conexões para permitir exit
    process.exit(0);
  }
}

// Executar se chamado diretamente  
const isMainModule = process.argv[1] && process.argv[1].includes('init-db');
if (isMainModule) {
  initDatabase()
    .then(() => {
      logger.info('✨ Inicialização concluída!');
      setTimeout(() => process.exit(0), 1000);
    })
    .catch((error) => {
      logger.error('💥 Falha na inicialização:', error);
      setTimeout(() => process.exit(1), 1000);
    });
}

export { initDatabase };