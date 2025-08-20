import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Carregar variáveis de ambiente primeiro
dotenv.config();

console.log('📋 Verificando variáveis de ambiente...');
console.log('DATABASE_URL existe:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL (primeiros 30 chars):', process.env.DATABASE_URL?.substring(0, 30));

async function createAdmin() {
  try {
    console.log('🔌 Importando conexão com banco...');
    const { db } = await import('../db/connection.js');
    const { users } = await import('../db/schema.js');
    
    console.log('🔍 Verificando se admin já existe...');
    
    // Verificar se já existe um admin
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('✅ Admin já existe no banco de dados:', existingAdmin[0].username);
      return;
    }

    console.log('🔐 Criando hash da senha...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    console.log('👤 Inserindo novo admin...');
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

    console.log('🎉 Usuário admin criado com sucesso!');
    console.log('📝 Credenciais:', {
      username: 'admin',
      password: 'admin123',
      note: 'MUDE A SENHA APÓS O PRIMEIRO LOGIN!'
    });

  } catch (error) {
    console.error('❌ Erro detalhado:', error);
    throw error;
  }
}

// Executar
createAdmin()
  .then(() => {
    console.log('✨ Inicialização concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na inicialização:', error);
    process.exit(1);
  });