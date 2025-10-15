# 🚀 Instruções para Executar a Migração de Espécies

## ⚠️ Problema Identificado

Não foi possível conectar automaticamente ao banco de dados MySQL para executar a migração. Você precisa executar manualmente.

## 📋 Passos para Executar a Migração

### 1. Conectar ao MySQL

Abra o terminal/command prompt e conecte ao MySQL com suas credenciais:

```bash
# Opção 1: Sem senha
mysql -u root -p protestos_db

# Opção 2: Com senha específica
mysql -u root -p[SUA_SENHA] protestos_db

# Opção 3: Via MySQL Workbench ou phpMyAdmin
# Abra o MySQL Workbench e conecte ao banco 'protestos_db'
```

### 2. Executar o Script de Migração

Copie e cole o seguinte SQL no MySQL:

```sql
-- Criar tabela de espécies
CREATE TABLE IF NOT EXISTS `especies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL UNIQUE,
  `descricao` text,
  `ativo` boolean DEFAULT TRUE,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserir espécies padrão
INSERT INTO `especies` (`nome`, `descricao`, `ativo`) VALUES
('CARTAO', 'Cartão de crédito', TRUE),
('VEICULO', 'Financiamento de veículo', TRUE),
('PRONAMPE', 'Programa Nacional de Apoio ao Microempreendedor', TRUE),
('BNDES', 'Financiamento BNDES', TRUE),
('CAPITAL DE GIRO', 'Capital de giro empresarial', TRUE),
('CHEQUE ESPECIAL', 'Cheque especial', TRUE),
('ANTECIPACAO', 'Antecipação de recebíveis', TRUE),
('FINANCIAMENTO', 'Financiamento geral', TRUE),
('PRONAMP', 'Programa Nacional de Apoio ao Médio Produtor Rural', TRUE);

-- Verificar se foi criado corretamente
SELECT * FROM especies;
```

### 3. Verificar a Migração

Após executar o SQL, você deve ver 9 registros na tabela `especies`.

### 4. Reiniciar o Backend

Após a migração, reinicie o servidor backend:

```bash
cd backend
npm start
```

### 5. Testar o Sistema

1. Acesse o frontend
2. Vá para o menu "Espécies"
3. Verifique se as 9 espécies padrão aparecem
4. Teste criar uma nova espécie
5. Teste o cadastro de contratos para ver se as espécies carregam

## ✅ O que foi Implementado

### Backend:

- ✅ Modelo `Especie.js` criado
- ✅ Controller `EspecieController.js` com CRUD completo
- ✅ Rotas `/especies` configuradas
- ✅ Validações implementadas

### Frontend:

- ✅ Tela `EspeciesList.jsx` com busca e paginação
- ✅ Formulário `EspecieForm.jsx` para cadastro/edição
- ✅ Integração com `ContratoForm.jsx` para carregar espécies
- ✅ Navegação atualizada com link "Espécies"
- ✅ API de espécies configurada

### Funcionalidades:

- ✅ **CRUD completo** de espécies
- ✅ **Busca em tempo real** por nome
- ✅ **Paginação** com 20 itens por página
- ✅ **Status ativo/inativo** para espécies
- ✅ **Validação** antes de excluir espécies em uso
- ✅ **Integração automática** com formulário de contratos

## 🎯 Próximos Passos

1. **Execute a migração** seguindo os passos acima
2. **Reinicie o backend** para reconhecer o novo modelo
3. **Teste o sistema** acessando `/especies`
4. **Cadastre contratos** para verificar se as espécies carregam

## 🆘 Se Houver Problemas

- Verifique se o MySQL está rodando
- Confirme as credenciais de acesso ao banco
- Verifique se o banco `protestos_db` existe
- Consulte os logs do backend para erros

---

**🎉 Após a migração, você terá um sistema completo de gerenciamento de espécies!**
