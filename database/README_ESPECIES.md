# Migração da Tabela de Espécies

## Instruções para Executar a Migração

Para criar a tabela de espécies e popular com dados iniciais, execute um dos seguintes comandos:

### Opção 1: Via MySQL Command Line

```bash
mysql -u root -p protestos_db < run_migration_especies.sql
```

### Opção 2: Via MySQL Workbench ou phpMyAdmin

1. Abra o MySQL Workbench ou phpMyAdmin
2. Conecte-se ao banco `protestos_db`
3. Execute o conteúdo do arquivo `run_migration_especies.sql`

### Opção 3: Via Docker (se estiver usando Docker)

```bash
docker exec -i mysql_container mysql -u root -p protestos_db < run_migration_especies.sql
```

## O que a migração faz:

1. **Cria a tabela `especies`** com os campos:

   - `id` (chave primária)
   - `nome` (nome único da espécie)
   - `descricao` (descrição opcional)
   - `ativo` (status ativo/inativo)
   - `created_at` e `updated_at` (timestamps)

2. **Insere espécies padrão**:
   - CARTAO
   - VEICULO
   - PRONAMPE
   - BNDES
   - CAPITAL DE GIRO
   - CHEQUE ESPECIAL
   - ANTECIPACAO
   - FINANCIAMENTO
   - PRONAMP

## Após a migração:

1. Reinicie o backend para que o modelo seja reconhecido
2. Acesse `/especies` no frontend para gerenciar as espécies
3. O formulário de contratos agora carregará as espécies da API

## Verificação:

Para verificar se a migração foi executada com sucesso:

```sql
SELECT * FROM especies;
```

Deve retornar 9 registros com as espécies padrão.
