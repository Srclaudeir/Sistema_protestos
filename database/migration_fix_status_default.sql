-- Migration: Corrigir default do campo status na tabela protestos
-- Data: 2025-10-16
-- Descrição: Altera o default de NULL para 'ESPERANDO_PROTESTO'

USE protestos_db;

-- Alterar o campo status para ter default 'ESPERANDO_PROTESTO'
ALTER TABLE protestos 
MODIFY COLUMN status VARCHAR(255) DEFAULT 'ESPERANDO_PROTESTO';

-- Verificar a alteração
DESCRIBE protestos;

-- Comentário de sucesso
SELECT 'Migration concluída: status agora tem default ESPERANDO_PROTESTO' AS message;

