# 🏥 Sistema de Gestão para Consultório de Fisioterapia

Sistema completo de gestão para consultórios de fisioterapia com múltiplos perfis de usuário e funcionalidades avançadas.

## 🏗️ Estrutura do Projeto

```
.
├── fisio-api/          # Backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── controllers/    # Camada de controle de requisições
│   │   ├── services/       # Lógica de negócio
│   │   ├── routes/         # Definição de rotas
│   │   ├── middlewares/    # Middlewares de validação
│   │   ├── schemas/        # Schemas Zod de validação
│   │   ├── database/       # Configuração do Prisma
│   │   └── index.ts        # Ponto de entrada
│   ├── prisma/
│   │   ├── schema.prisma   # Modelo de dados
│   │   └── migrations/     # Histórico de migrações
│   └── package.json
│
├── fisio-frontend/     # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/     # Componentes React reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Chamadas à API
│   │   ├── schemas/        # Schemas de validação
│   │   ├── types/          # Tipos TypeScript
│   │   ├── App.tsx         # Componente raiz
│   │   └── main.tsx        # Ponto de entrada
│   └── package.json
│
└── docker-compose.yml   # Orquestração de containers
```

## 👤 Perfis do Sistema

- **Admin**: Acesso total ao sistema
- **Fisioterapeuta**: Gestão de pacientes e consultas
- **Recepcionista**: Agendamento e cadastros básicos
- **Paciente**: Acesso limitado (preparado para futuro)

## 📋 Funcionalidades

- 🔐 Sistema de autenticação com JWT
- 📊 Dashboard com métricas em tempo real
- 👥 CRUD completo para pacientes, fisioterapeutas e recepcionistas
- 📅 Sistema de agendamento com validação de conflitos
- 🗓️ Agenda semanal interativa
- 📑 Relatórios com exportação PDF/Excel
- 🎨 Interface moderna e responsiva

## 🚀 Guia de Instalação

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Git

### Setup do Banco de Dados

```bash
docker-compose up -d
```

### Setup do Backend

```bash
cd fisio-api
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Setup do Frontend

```bash
cd ../fisio-frontend
npm install
npm run dev
```

## 📊 Tecnologias

### Backend

- Node.js 18+
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod
- JWT
- Swagger

### Frontend

- React 19
- TypeScript
- Vite
- Material-UI
- Axios
- React Router 6
- Recharts

## 🔗 Endpoints Principais

- API: http://localhost:3333
- Swagger: http://localhost:3333/api-docs
- Frontend: http://localhost:5173
