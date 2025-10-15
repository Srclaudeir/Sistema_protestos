-- Migration para ajustar tipos de dados baseado na planilha CSV
-- Arquivo: migration_fix_data_types.sql

USE protestos_db;

-- Alterar data_baixa_cartorio de DATE para VARCHAR(255) para permitir texto livre
ALTER TABLE protestos 
MODIFY COLUMN data_baixa_cartorio VARCHAR(255) NULL;

-- Alterar numero_parcela de VARCHAR(20) para VARCHAR(50) para permitir valores maiores
ALTER TABLE protestos 
MODIFY COLUMN numero_parcela VARCHAR(50) NULL;

-- Verificar se as alterações foram aplicadas
DESCRIBE protestos;
