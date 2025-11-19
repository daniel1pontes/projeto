-- Script de inicialização do banco de dados
-- Este script será executado automaticamente quando o container PostgreSQL iniciar

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar se o banco foi criado corretamente
SELECT 'Database fisio_db initialized successfully' as status;
