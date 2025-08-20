# 🎂 Buffet Junior's Kids - Sistema Financeiro

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/buffet-juniors-kids)
[![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen?style=for-the-badge)](https://github.com/seu-usuario/buffet-juniors-kids/releases)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **Sistema completo de gestão financeira para buffets infantis** - Transforme sonhos em realidade com nossa plataforma moderna e intuitiva.

## 🚀 Tech Stack

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.11-38B2AC?style=flat&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.23.12-FF006E?style=flat&logo=framer&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E699?style=flat&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat&logo=vercel&logoColor=white)

## ✨ Recursos Principais

### 🎨 **Design & UX**
- **Interface Moderna** - Design responsivo com tema infantil profissional
- **Animações Premium** - Micro-interações 3D com easing curves otimizadas
- **Hero Section** - Bolo de aniversário 3D animado com CSS puro
- **Modal Elegante** - Login integrado com backdrop blur e transições suaves

### 📊 **Gestão Financeira**
- **Dashboard Inteligente** - Métricas em tempo real com gráficos interativos
- **Gestão de Clientes** - CRUD completo com busca avançada e filtros
- **Controle de Eventos** - Calendário visual e gestão de agenda
- **Relatórios Avançados** - Export PDF/Excel com filtros personalizados
- **Analytics Detalhados** - Insights categorizados por tipo de evento

### 🚀 **Performance & Deploy**
- **Otimização Vercel** - Build otimizado com code splitting automático
- **SEO Completo** - Meta tags, Open Graph, Twitter Cards e dados estruturados
- **PWA Ready** - Favicon customizado e configurações mobile
- **Responsividade** - Suporte completo mobile com prefers-reduced-motion

## 🚀 Instalação e Deploy

### ⚡ Deploy Rápido (Recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/buffet-juniors-kids)

1. **Clone ou Fork** este repositório
2. **Conecte à Vercel** - Deploy automático em minutos
3. **Configure Neon DB** - PostgreSQL serverless incluído
4. **Ambiente pronto** - Acesse sua aplicação em produção

### 💻 Desenvolvimento Local

#### Pré-requisitos
```bash
Node.js 18+    # Runtime JavaScript
npm ou yarn    # Gerenciador de pacotes
Git            # Controle de versão
```

#### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/buffet-juniors-kids.git
cd buffet-juniors-kids

# 2. Instale dependências do backend
npm install

# 3. Instale dependências do frontend
cd frontend && npm install && cd ..

# 4. Configure variáveis de ambiente
cp .env.example .env
```

#### Configuração do Banco (.env)
```env
# 🗄️ Neon PostgreSQL (Recomendado)
DATABASE_URL=sua_conexao_neon_aqui

# 🔐 Segurança
SESSION_SECRET=seu_secret_super_seguro_aqui
NODE_ENV=development

# 🌐 URLs da aplicação
FRONTEND_URL=http://localhost:5173
BACKEND_PORT=3001
```

#### Execução

```bash
# Terminal 1: Backend
npm run db:push    # Sincronizar schema
npm run init-db    # Criar usuário admin
npm run dev        # Iniciar servidor (porta 3001)

# Terminal 2: Frontend  
cd frontend
npm run dev        # Iniciar interface (porta 5173)
```

### 🔐 Credenciais Padrão

```
Usuário: admin
Senha: admin123
```

## 📁 Estrutura do Projeto

```
buffet-juniors-kids/
├── 📂 backend/                    # 🔧 Servidor Node.js + Express
│   ├── src/routes/               # 🛣️ Endpoints da API
│   ├── src/models/               # 📊 Schemas Drizzle ORM
│   └── src/middleware/           # 🔐 Auth & validação
├── 📂 frontend/                   # ⚛️ React 19 + TypeScript
│   ├── src/components/           # 🧩 Componentes UI
│   ├── src/pages/                # 📄 Páginas principais
│   ├── src/lib/animations.ts     # ✨ Animações premium
│   └── src/components/HeroSection.tsx  # 🎂 Bolo 3D animado
├── 📂 shared/                     # 🔗 Tipos compartilhados
├── vercel.json                   # 🚀 Config Vercel deploy
├── .env.example                  # ⚙️ Variáveis ambiente
└── README.md                     # 📖 Esta documentação
```

## 🛠️ Scripts Disponíveis

### Backend
```bash
npm run dev        # 🔄 Desenvolvimento com hot-reload
npm run build      # 📦 Build para produção
npm run db:push    # 🗄️ Sincronizar schema Drizzle
npm run init-db    # 👤 Criar usuário admin inicial
```

### Frontend  
```bash
npm run dev            # 🔄 Vite dev server
npm run build          # 📦 Build otimizado para produção
npm run preview        # 👀 Preview do build local
npm run build:analyze  # 📊 Análise do bundle size
```

## 🧪 Testes & Validação

### ✅ Checklist de Validação

1. **Backend Health** - http://localhost:3001/health
2. **Frontend Load** - http://localhost:5173
3. **Login Flow** - Testar credenciais admin/admin123
4. **Responsividade** - Redimensionar janela/mobile
5. **Console Limpo** - Sem erros no DevTools

### 🔍 Logs Esperados

```bash
# Backend
✅ Database connection established successfully
✅ Express server listening on port 3001
✅ Authentication middleware configured

# Frontend  
✅ VITE ready in ~500ms
✅ Local: http://localhost:5173/
```

## 🚨 Solução de Problemas

| Problema | Solução |
|----------|---------|
| **Erro DB Connection** | Verificar DATABASE_URL no .env |
| **CORS Error** | Confirmar FRONTEND_URL=http://localhost:5173 |
| **Login Falha** | Reiniciar backend + limpar cookies |
| **Build Error** | npm install && npm run build |

## 📝 Changelog

### v1.0.0 - Final Enhancement
- ✨ Animações premium com easing curves 3D
- 🎂 Hero section com bolo animado CSS puro  
- 🔐 Modal login elegante com backdrop blur
- 🚀 Configuração Vercel deploy otimizada
- 📱 SEO completo + PWA ready
- 🎨 Favicon customizado SVG gradiente

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`) 
5. Abra um Pull Request

---

<div align="center">

**🎂 Feito com ❤️ para transformar sonhos em realidade**

[![Deploy](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/buffet-juniors-kids)

</div>

