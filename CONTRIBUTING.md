# 🤝 Contribuindo para o Buffet Junior's Kids

Obrigado por querer contribuir! Este guia ajudará você a configurar o projeto e fazer contribuições de qualidade.

## 🚀 Configuração do Ambiente

### Pré-requisitos
- **Node.js** 18 ou superior
- **npm** ou **yarn**
- **Git**
- **Neon PostgreSQL** (recomendado)

### Instalação

1. **Fork e Clone**
```bash
git clone https://github.com/seu-usuario/buffet-juniors-kids.git
cd buffet-juniors-kids
```

2. **Instalar Dependências**
```bash
# Backend
npm install

# Frontend
cd frontend && npm install && cd ..
```

3. **Configurar Ambiente**
```bash
cp .env.example .env
# Configure suas variáveis de ambiente
```

4. **Configurar Banco**
```bash
npm run db:push
npm run init-db
```

5. **Executar Desenvolvimento**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 📋 Diretrizes de Contribuição

### 🌿 Branch Strategy

- **main**: Código de produção estável
- **develop**: Desenvolvimento ativo
- **feature/nome-da-feature**: Novas funcionalidades
- **fix/nome-do-fix**: Correções de bugs
- **docs/nome-da-doc**: Atualizações de documentação

### 📝 Commit Convention

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade de relatórios
fix: corrige bug no cálculo de pagamentos
docs: atualiza documentação da API
style: formata código com prettier
refactor: refatora componente de dashboard
test: adiciona testes para módulo de clientes
chore: atualiza dependências
```

### ✅ Checklist antes do Pull Request

- [ ] Código seguindo as convenções do projeto
- [ ] Testes passando (`npm test`)
- [ ] Build funcionando (`npm run build`)
- [ ] TypeScript sem erros (`npm run type-check`)
- [ ] ESLint sem warnings (`npm run lint`)
- [ ] Componentes responsivos testados
- [ ] Animações otimizadas para mobile
- [ ] Acessibilidade verificada

## 🎨 Padrões de Código

### TypeScript
- Use tipos explícitos quando necessário
- Evite `any` - prefira `unknown` ou tipos específicos
- Use interfaces para objetos complexos

### React
- Componentes funcionais com hooks
- Props tipadas com TypeScript
- Use `memo()` para componentes pesados
- Prefira custom hooks para lógica reutilizável

### Styling
- Tailwind CSS para estilos
- Componentes shadcn/ui para UI base
- CSS Modules para estilos específicos
- Design system consistente

### Animações
- Framer Motion para animações
- Respeitar `prefers-reduced-motion`
- Animações otimizadas para mobile
- Uso do hook `useAnimationConfig`

## 🧪 Testes

### Executar Testes
```bash
# Frontend
cd frontend && npm test

# Backend
npm test

# Coverage
npm run test:coverage
```

### Padrões de Teste
- Testes unitários para funções puras
- Testes de integração para hooks
- Testes E2E para fluxos críticos
- Mocks para APIs externas

## 📚 Estrutura do Projeto

```
buffet-juniors-kids/
├── 📁 backend/           # API Node.js + Express
│   ├── src/routes/       # Endpoints da API
│   ├── src/models/       # Schemas Drizzle ORM
│   └── src/middleware/   # Auth, validação, logs
├── 📁 frontend/          # React + TypeScript
│   ├── src/components/   # Componentes reutilizáveis
│   ├── src/pages/        # Páginas da aplicação
│   ├── src/hooks/        # Custom hooks
│   └── src/lib/          # Utilitários e config
├── 📁 shared/            # Tipos compartilhados
├── vercel.json           # Config deploy Vercel
└── README.md             # Documentação principal
```

## 🐛 Reportando Bugs

Use nosso [template de issue](https://github.com/seu-usuario/buffet-juniors-kids/issues/new?template=bug_report.md):

**Informações necessárias:**
- [ ] Versão do Node.js
- [ ] Sistema operacional
- [ ] Navegador (se frontend)
- [ ] Passos para reproduzir
- [ ] Comportamento esperado vs atual
- [ ] Screenshots/logs

## ✨ Sugerindo Features

Use nosso [template de feature](https://github.com/seu-usuario/buffet-juniors-kids/issues/new?template=feature_request.md):

**Inclua:**
- [ ] Problema que resolve
- [ ] Solução proposta
- [ ] Alternativas consideradas
- [ ] Mockups/wireframes (se UI)

## 📖 Documentação

### Adicionando Documentação
- README.md para visão geral
- Comentários JSDoc para funções
- Storybook para componentes
- API docs para endpoints

### Estilo de Documentação
- Português brasileiro
- Exemplos práticos
- Links para recursos externos
- Emojis para melhor legibilidade

## 🔍 Code Review

### Como Revisor
- [ ] Funcionalidade implementada corretamente
- [ ] Código limpo e legível
- [ ] Performance adequada
- [ ] Segurança verificada
- [ ] Testes adequados
- [ ] Documentação atualizada

### Como Contributor
- Responda feedback construtivamente
- Faça commits pequenos e focados
- Teste suas mudanças localmente
- Mantenha PR descriptions detalhadas

## 🎯 Áreas para Contribuição

### 🚀 Frontend
- Novos componentes UI
- Melhorias de UX/UI
- Otimizações de performance
- Testes de componentes
- Acessibilidade

### ⚙️ Backend
- Novos endpoints
- Otimizações de queries
- Melhorias de segurança
- Testes de API
- Documentação de API

### 📱 Mobile/Responsivo
- Otimizações para dispositivos móveis
- Melhorias de animações mobile
- Testes cross-browser
- PWA features

### 🧪 Testes
- Aumentar cobertura de testes
- Testes E2E
- Testes de performance
- Testes de acessibilidade

### 📚 Documentação
- Tutoriais de uso
- Guias de desenvolvimento
- Exemplos de código
- API documentation

## 🤝 Comunidade

### Canais de Comunicação
- **Issues**: Para bugs e features
- **Discussions**: Para dúvidas gerais
- **Wiki**: Para documentação colaborativa

### Código de Conduta
- Seja respeitoso e inclusivo
- Construa sobre ideias dos outros
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a [MIT License](LICENSE).

---

**🎂 Obrigado por ajudar a tornar festas infantis ainda mais especiais!**