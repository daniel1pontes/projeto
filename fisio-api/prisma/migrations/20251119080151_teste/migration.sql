-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('ADMIN', 'FISIOTERAPEUTA', 'RECEPCIONISTA');

-- CreateEnum
CREATE TYPE "StatusConsulta" AS ENUM ('AGENDADA', 'CONFIRMADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'NAO_COMPARECEU');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" TEXT,
    "papel" "PapelUsuario" NOT NULL DEFAULT 'RECEPCIONISTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fisioterapeutas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "crefito" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fisioterapeutas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recepcionistas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recepcionistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "convenio" TEXT,
    "historico" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultas" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "fisioterapeutaId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "duracao" INTEGER NOT NULL DEFAULT 60,
    "status" "StatusConsulta" NOT NULL DEFAULT 'AGENDADA',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fisioterapeutas_usuarioId_key" ON "fisioterapeutas"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "fisioterapeutas_crefito_key" ON "fisioterapeutas"("crefito");

-- CreateIndex
CREATE UNIQUE INDEX "recepcionistas_usuarioId_key" ON "recepcionistas"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_email_key" ON "pacientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_cpf_key" ON "pacientes"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "consultas_pacienteId_dataHora_key" ON "consultas"("pacienteId", "dataHora");

-- CreateIndex
CREATE UNIQUE INDEX "consultas_fisioterapeutaId_dataHora_key" ON "consultas"("fisioterapeutaId", "dataHora");

-- AddForeignKey
ALTER TABLE "fisioterapeutas" ADD CONSTRAINT "fisioterapeutas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcionistas" ADD CONSTRAINT "recepcionistas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_fisioterapeutaId_fkey" FOREIGN KEY ("fisioterapeutaId") REFERENCES "fisioterapeutas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
