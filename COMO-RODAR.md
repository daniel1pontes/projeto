# 🚀 Como Rodar a Aplicação

## 📋 Pré-requisitos

- **Node.js 18+** - [Download aqui](https://nodejs.org/)
- **Docker e Docker Compose** - [Download aqui](https://www.docker.com/products/docker-desktop/)
- **PostgreSQL** (se não usar Docker)
- **Git** - [Download aqui](https://git-scm.com/)

---

## 🐳 Opção 1: Com Docker (Recomendado)

### 1. Iniciar o Banco de Dados

```bash
# Na raiz do projeto
docker-compose up -d
```

Isso irá iniciar:

- PostgreSQL na porta 5432
- pgAdmin (interface web) na porta 5050

### 2. Configurar o Backend

```bash
cd fisio-api
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3. Configurar o Frontend

```bash
cd ../fisio-frontend
npm install
npm run dev
```

---

## 💻 Opção 2: Sem Docker

### 1. Configurar PostgreSQL Manualmente

- Instale PostgreSQL localmente
- Crie um banco de dados: `fisio_db`
- Configure as variáveis de ambiente no backend

### 2. Backend

```bash
cd fisio-api
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3. Frontend

```bash
cd ../fisio-frontend
npm install
npm run dev
```

---

## 🔧 Configuração das Variáveis de Ambiente

### Backend (fisio-api/.env)

```env
# Banco de Dados
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/fisio_db"

# JWT
JWT_SECRET="sua-chave-secreta-aqui"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=3333
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (fisio-frontend/.env)

```env
VITE_API_URL=http://localhost:3333
```

---

## 🌐 Acessando a Aplicação

Após iniciar os serviços:

- **Frontend**: http://localhost:5173
- **API Backend**: http://localhost:3333
- **Documentação Swagger**: http://localhost:3333/api-docs
- **pgAdmin** (se usar Docker): http://localhost:5050

---

## 👤 Usuários Padrão para Testes

### Admin

- **Email**: admin@fisio.com
- **Senha**: admin123

### Fisioterapeuta

- **Email**: fisio@fisio.com
- **Senha**: fisio123

### Recepcionista

- **Email**: recep@fisio.com
- **Senha**: recep123

> **Nota**: Se não existirem usuários, cadastre-os através da interface após o login inicial.

---

## 🛠️ Comandos Úteis

### Backend

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Rodar migrações
npx prisma migrate dev

# Criar novo usuário admin
npx prisma db seed

# Iniciar em desenvolvimento
npm run dev

# Iniciar em produção
npm run build
npm start

# Verificar tipos
npm run type-check

# Lint
npm run lint
```

### Frontend

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Verificar tipos
npm run type-check

# Lint
npm run lint
```

### Docker

```bash
# Iniciar containers
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar containers
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Reconstruir imagem
docker-compose build --no-cache
```

---

## 🐛 Problemas Comuns

### 1. Porta em uso

```bash
# Verificar processo na porta
netstat -ano | findstr :3333
netstat -ano | findstr :5173

# Matar processo
taskkill /PID <PID> /F
```

### 2. Erro de conexão com banco

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no .env
- Verifique se o banco foi criado

### 3. Erro de permissão no Prisma

```bash
# Limpar e gerar novamente
npx prisma migrate reset
npx prisma generate
npx prisma migrate dev
```

### 4. Erro de CORS

- Verifique se a variável `CORS_ORIGIN` está correta
- Confirme se o frontend está rodando na porta 5173

### 5. Erro de módulos não encontrados

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Estrutura de Pastas

```
projeto/
├── fisio-api/           # Backend Node.js
│   ├── src/
│   │   ├── controllers/ # Controladores
│   │   ├── services/    # Lógica de negócio
│   │   ├── routes/      # Rotas da API
│   │   ├── middleware/  # Middlewares
│   │   ├── schemas/     # Validação Zod
│   │   └── index.ts     # Servidor
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── package.json
│
├── fisio-frontend/      # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes
│   │   ├── pages/       # Páginas
│   │   ├── hooks/       # Hooks customizados
│   │   ├── services/    # API calls
│   │   ├── types/       # Tipos TS
│   │   └── main.tsx     # Entrada
│   └── package.json
│
├── docker-compose.yml   # Orquestração Docker
└── README.md           # Documentação
```

---

## 🚀 Deploy em Produção

### Backend

```bash
cd fisio-api
npm run build
npm start
```

### Frontend

```bash
cd fisio-frontend
npm run build
# Deploy da pasta dist/
```

### Docker Produção

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs do terminal
2. Confirme as variáveis de ambiente
3. Verifique se as portas estão livres
4. Reinicie os serviços na ordem: BD → Backend → Frontend

**Pronto! Sua aplicação está rodando! 🎉**
