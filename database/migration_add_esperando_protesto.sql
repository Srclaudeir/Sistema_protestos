-- Migration: Adicionar status ESPERANDO_PROTESTO
-- Data: 2025-10-09
-- Descrição: Corrige a importação de protestos com STATUS vazio na planilha
--           Esses protestos deveriam ter sido importados como ESPERANDO_PROTESTO

USE protestos_db;

-- 1. Verificar registros atuais
SELECT 
    status, 
    COUNT(*) as total 
FROM protestos 
GROUP BY status 
ORDER BY status;

-- 2. Nota: O MySQL não valida ENUM via constraints como outros bancos
--    O campo status já é VARCHAR(50), então não precisa alterar a estrutura
--    Apenas garantir que o modelo do Sequelize aceita o novo valor

-- 3. Confirmar que não há constraint que bloqueie o novo status
-- (No MySQL com VARCHAR, não há constraint a remover)

SELECT 
    '✅ Migration preparada!' as status,
    'O campo status já é VARCHAR(50) e aceita qualquer valor' as info,
    'Próximo passo: executar script de correção' as proxima_acao;

-- 4. Verificar se existem protestos que deveriam ser ESPERANDO_PROTESTO
-- (registros importados com STATUS vazio na planilha)
SELECT 
    COUNT(*) as total_a_corrigir,
    'Protestos com status PROTESTADO que deveriam ser ESPERANDO_PROTESTO' as descricao
FROM protestos 
WHERE status = 'PROTESTADO';

-- Nota: A correção real será feita pelo script corrigirStatusProtestos.js
-- que mapeia os valores da planilha com os registros do banco

