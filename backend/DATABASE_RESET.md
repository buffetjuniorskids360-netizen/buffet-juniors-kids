# Database Reset Guide

## Overview
This document explains how to reset your Neon PostgreSQL database for the Buffet Financial System and recreate all tables with the correct schema.

## What Was Done

### 1. Database Reset Script Created
A comprehensive reset script was created at `C:\Users\Kira\Desktop\Financeiro bjrk\backend\src\scripts\reset-database.ts` that:

- Executes DROP statements from `reset-db.sql` to remove all existing tables
- Uses Drizzle Kit to recreate tables with the correct schema
- Creates a default admin user for system access

### 2. NPM Script Added
Added `db:reset` script to `package.json` for easy execution:
```json
"db:reset": "tsx src/scripts/reset-database.ts"
```

### 3. Database Tables Recreated
The following tables were successfully recreated with proper schema and relationships:

- **users** - Sistema de autenticação com roles (admin/operator)
- **clients** - Clientes do buffet
- **events** - Eventos/festas agendadas
- **payments** - Pagamentos de eventos
- **documents** - Documentos vinculados
- **expenses** - Despesas operacionais
- **cash_flow** - Fluxo de caixa

### 4. Default Admin User
Created default admin user with credentials:
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@buffet.com`
- **Role**: `admin`

**⚠️ IMPORTANT: Change the password after first login!**

## How to Use

### To Reset the Database
From the backend directory, run:
```bash
npm run db:reset
```

This will:
1. Drop all existing tables
2. Recreate tables with current schema
3. Create default admin user (if not exists)

### Alternative Commands
- **Push schema only**: `npm run db:push`
- **Generate migrations**: `npm run db:generate`
- **Run migrations**: `npm run db:migrate`
- **Open Drizzle Studio**: `npm run db:studio`
- **Initialize with admin only**: `npm run init-db`

## Schema Details

### Key Features
- **CUID2 IDs**: All primary keys use CUID2 for better performance and uniqueness
- **Foreign Keys**: Proper relationships between tables
- **Timestamps**: Automatic created_at/updated_at fields
- **Data Types**: Appropriate field types (varchar, text, decimal, timestamp)
- **Constraints**: Unique constraints on username and email

### Relationships
- **Events** belong to **Clients**
- **Payments** belong to **Events**
- **Documents** can belong to **Clients** or **Events**
- **Documents** are uploaded by **Users**
- **Cash Flow** can reference **Payments** or **Expenses**

## Files Involved

### Created/Modified Files
- `C:\Users\Kira\Desktop\Financeiro bjrk\backend\src\scripts\reset-database.ts` - New reset script
- `C:\Users\Kira\Desktop\Financeiro bjrk\backend\package.json` - Added db:reset command

### Existing Files Used
- `C:\Users\Kira\Desktop\Financeiro bjrk\backend\reset-db.sql` - DROP statements
- `C:\Users\Kira\Desktop\Financeiro bjrk\backend\src\db\schema.ts` - Drizzle schema
- `C:\Users\Kira\Desktop\Financeiro bjrk\backend\src\db\connection.ts` - Database connection
- `C:\Users\Kira\Desktop\Financeiro bjrk\backend\drizzle.config.ts` - Drizzle configuration

## Success Indicators
✅ All tables dropped successfully
✅ Schema applied with Drizzle Kit
✅ Foreign key relationships created
✅ Default admin user created
✅ Database ready for Buffet Financial System

## Next Steps
1. **Change admin password** after first login
2. **Test database connection** with your application
3. **Create additional users** as needed
4. **Start using the system** for buffet financial management

## Troubleshooting

### Environment Variables
Ensure your `.env` file contains:
```
DATABASE_URL=your_neon_postgresql_connection_string
```

### Permissions
The database user must have permissions to:
- DROP tables
- CREATE tables
- INSERT, UPDATE, DELETE data

### Connection Issues
If connection fails:
1. Check DATABASE_URL format
2. Verify Neon database is running
3. Check firewall/network settings
4. Ensure SSL settings match your environment