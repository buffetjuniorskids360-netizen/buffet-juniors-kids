import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import pg from 'pg';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Carregar variáveis de ambiente
dotenv.config();

const { Pool } = pg;

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');

async function resetDatabase() {
  console.log('🔄 Iniciando reset do banco de dados...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL environment variable is required');
  }

  // Conectar diretamente ao banco usando pg
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    // 1. Executar script de DROP das tabelas
    console.log('🗑️  Removendo tabelas existentes...');
    const resetSqlPath = join(__dirname, '../..', 'reset-db.sql');
    const resetSql = readFileSync(resetSqlPath, 'utf8');
    
    const client = await pool.connect();
    await client.query(resetSql);
    client.release();
    
    console.log('✅ Tabelas removidas com sucesso!');

    // 2. Fechar pool temporário
    await pool.end();

    // 3. Usar Drizzle Kit para aplicar o schema
    console.log('🏗️  Aplicando schema com Drizzle Kit...');
    
    // Executar drizzle-kit push para aplicar o schema
    const pushCommand = 'npm run db:push';
    console.log(`Executando: ${pushCommand}`);
    
    execSync(pushCommand, {
      cwd: join(__dirname, '../..'),
      stdio: 'inherit'
    });
    
    console.log('📋 Schema aplicado com sucesso!');

    // 4. Criar usuário admin padrão
    console.log('👤 Criando usuário admin padrão...');
    
    // Aguardar um pouco para garantir que as tabelas foram criadas
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Importar após aplicar o schema
    const { db } = await import('../db/connection.js');
    const { users } = await import('../db/schema.js');
    
    // Verificar se já existe um admin
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'))
      .limit(1);

    if (existingAdmin.length === 0) {
      const adminPassword = await bcrypt.hash('admin123', 12);
      
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
      console.log('📝 Credenciais de acesso:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   ⚠️  MUDE A SENHA APÓS O PRIMEIRO LOGIN!');
    } else {
      console.log('ℹ️  Usuário admin já existe');
    }

    console.log('✨ Reset do banco de dados concluído com sucesso!');
    console.log('🚀 Banco está pronto para uso com o sistema financeiro do buffet');

  } catch (error) {
    console.error('❌ Erro durante o reset do banco:', error);
    throw error;
  }
}

// Executar se chamado diretamente
const isMainModule = process.argv[1] && process.argv[1].includes('reset-database');
if (isMainModule) {
  resetDatabase()
    .then(() => {
      console.log('🎯 Processo finalizado!');
      setTimeout(() => process.exit(0), 1000);
    })
    .catch((error) => {
      console.error('💥 Falha no reset:', error);
      setTimeout(() => process.exit(1), 1000);
    });
}

export { resetDatabase };