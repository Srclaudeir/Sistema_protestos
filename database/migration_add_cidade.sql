-- Adicionar coluna CIDADE na tabela contratos
-- Data: 2025-10-09

ALTER TABLE `contratos` 
ADD COLUMN `cidade` VARCHAR(100) NULL AFTER `especie`;

