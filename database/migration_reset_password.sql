-- Migration: Add password reset functionality to usuarios table
-- Execute este script se você já tem o banco de dados criado

USE protestos_db;

-- Adicionar campos para recuperação de senha
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP NULL DEFAULT NULL;

-- Verificar se os campos foram adicionados
SHOW COLUMNS FROM usuarios;

