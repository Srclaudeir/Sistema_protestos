-- Migration: Add 'consultor' role to usuarios table
-- Date: 2025-10-17
-- Description: Adiciona o perfil 'consultor' ao enum de roles da tabela usuarios

USE protestos_db;

-- Atualizar o enum da coluna role para incluir 'consultor'
ALTER TABLE usuarios 
MODIFY COLUMN role ENUM('admin', 'supervisor', 'operador', 'consultor') 
DEFAULT 'operador';

-- Verificar a alteração
DESC usuarios;

-- Exibir usuários existentes
SELECT id, username, nome, role, ativo FROM usuarios;

