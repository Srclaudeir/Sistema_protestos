# Manual do Usuário - Sistema de Gestão de Protestos Financeiros

## Introdução

Bem-vindo ao Sistema de Gestão de Protestos Financeiros, uma solução moderna e eficiente para substituir a planilha tradicional de gerenciamento de protestos. Este manual irá guiá-lo através das funcionalidades e operações do sistema.

## Requisitos do Sistema

### Para Acesso Web
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Conexão com internet estável
- Resolução mínima de tela: 1024x768

### Para Administração do Sistema
- Node.js 18+
- MySQL 8.0+
- Docker e Docker Compose (opcional)

## Primeiro Acesso

### Login no Sistema

1. Abra seu navegador e acesse a URL do sistema
2. Na tela de login, informe suas credenciais:
   - **Usuário**: Seu nome de usuário
   - **Senha**: Sua senha
3. Clique em "Entrar"

### Primeiro Login (Administrador)

Para o primeiro acesso, utilize as credenciais padrão:
- **Usuário**: admin
- **Senha**: admin123

Após o primeiro login, é altamente recomendável alterar a senha padrão.

## Painel Principal

Após o login, você será direcionado para o painel principal que contém:

1. **Menu de Navegação** (lateral esquerda)
2. **Barra de Ferramentas** (superior)
3. **Área de Conteúdo** (central)
4. **Rodapé** (inferior)

### Menu de Navegação

O menu lateral contém os seguintes itens:
- **Dashboard**: Visão geral do sistema
- **Clientes**: Gerenciamento de clientes
- **Contratos**: Gerenciamento de contratos
- **Protestos**: Gerenciamento de protestos
- **Avalistas**: Gerenciamento de avalistas
- **Relatórios**: Geração de relatórios
- **Configurações**: Configurações do sistema

### Barra de Ferramentas

A barra superior contém:
- **Busca Global**: Pesquisa em todo o sistema
- **Notificações**: Alertas e mensagens importantes
- **Perfil do Usuário**: Acesso às configurações pessoais

## Gestão de Clientes

### Visualizando Clientes

1. Clique em "Clientes" no menu lateral
2. A lista de clientes será exibida com:
   - Nome
   - CPF/CNPJ
   - Tipo de Conta (PF/PJ)
   - Cidade
   - Data de Cadastro

### Adicionando um Novo Cliente

1. Na tela de clientes, clique em "Adicionar Cliente"
2. Preencha os campos obrigatórios:
   - **Nome Completo/Razão Social** (*)
   - **Tipo de Conta** (*): Pessoa Física (PF) ou Pessoa Jurídica (PJ)
3. Preencha os campos opcionais:
   - **CPF/CNPJ**: Documento do cliente
   - **Cidade**: Cidade onde o cliente reside
4. Clique em "Salvar"

### Editando um Cliente

1. Na lista de clientes, clique no botão "Editar" ao lado do cliente desejado
2. Modifique os campos necessários
3. Clique em "Atualizar"

### Removendo um Cliente

1. Na lista de clientes, clique no botão "Excluir" ao lado do cliente desejado
2. Confirme a exclusão na caixa de diálogo
3. O cliente será removido (apenas se não tiver contratos associados)

## Gestão de Contratos

### Visualizando Contratos

1. Clique em "Contratos" no menu lateral
2. A lista de contratos será exibida com:
   - Número do Contrato SISBR
   - Cliente Associado
   - Espécie
   - Ponto de Atendimento
   - Data de Cadastro

### Adicionando um Novo Contrato

1. Na tela de contratos, clique em "Adicionar Contrato"
2. Preencha os campos obrigatórios:
   - **Número do Contrato SISBR** (*)
   - **Cliente** (*): Selecione o cliente associado
3. Preencha os campos opcionais:
   - **Número do Contrato Legado**: Identificador do contrato no sistema anterior
   - **Espécie**: Tipo do contrato (ex: CARTÃO, VEÍCULO, PRONAMPE, etc.)
   - **Ponto de Atendimento**: Local onde o contrato foi registrado
4. Clique em "Salvar"

### Editando um Contrato

1. Na lista de contratos, clique no botão "Editar" ao lado do contrato desejado
2. Modifique os campos necessários
3. Clique em "Atualizar"

### Removendo um Contrato

1. Na lista de contratos, clique no botão "Excluir" ao lado do contrato desejado
2. Confirme a exclusão na caixa de diálogo
3. O contrato será removido (apenas se não tiver protestos associados)

## Gestão de Protestos

### Visualizando Protestos

1. Clique em "Protestos" no menu lateral
2. A lista de protestos será exibida com:
   - Valor Protestado
   - Número da Parcela
   - Data de Registro
   - Protocolo
   - Status
   - Contrato Associado
   - Cliente Associado

### Adicionando um Novo Protesto

1. Na tela de protestos, clique em "Adicionar Protesto"
2. Preencha os campos obrigatórios:
   - **Valor Protestado** (*)
   - **Data de Registro** (*)
   - **Contrato** (*): Selecione o contrato associado
3. Preencha os campos opcionais:
   - **Número da Parcela**: Identificador da parcela protestada
   - **Protocolo**: Número do protocolo do cartório
   - **Status**: Estado atual do protesto (padrão: PROTESTADO)
   - **Situação**: Detalhes adicionais sobre o protesto
   - **Data de Baixa Cartório**: Data em que o protesto foi pago/removido
4. Adicione avalistas (opcional):
   - Clique em "Adicionar Avalista"
   - Informe o nome e CPF/CNPJ do avalista
   - É possível adicionar múltiplos avalistas
5. Clique em "Salvar"

### Editando um Protesto

1. Na lista de protestos, clique no botão "Editar" ao lado do protesto desejado
2. Modifique os campos necessários
3. Atualize os avalistas se necessário
4. Clique em "Atualizar"

### Removendo um Protesto

1. Na lista de protestos, clique no botão "Excluir" ao lado do protesto desejado
2. Confirme a exclusão na caixa de diálogo
3. O protesto será removido juntamente com seus avalistas

### Alterando o Status de um Protesto

1. Na lista de protestos, clique no botão "Editar" ao lado do protesto desejado
2. No campo "Status", selecione uma das opções:
   - **PROTESTADO**: Protesto registrado
   - **PAGO**: Protesto liquidado
   - **ACORDO**: Protesto em acordo
   - **RENEGOCIADO**: Protesto renegociado
   - **DESISTENCIA**: Protesto cancelado por desistência
   - **ANUENCIA**: Protesto com anuência
   - **LIQUIDADO**: Protesto liquidado
   - **CANCELADO**: Protesto cancelado
   - **JUDICIAL**: Protesto em processo judicial
3. Preencha os campos relacionados ao novo status:
   - **Situação**: Detalhes sobre a mudança de status
   - **Data de Baixa Cartório**: Data em que o protesto foi pago/removido
4. Clique em "Atualizar"

## Gestão de Avalistas

### Visualizando Avalistas

1. Clique em "Avalistas" no menu lateral
2. A lista de avalistas será exibida com:
   - Nome
   - CPF/CNPJ
   - Protesto Associado
   - Cliente do Protesto

### Adicionando um Novo Avalista

1. Na tela de avalistas, clique em "Adicionar Avalista"
2. Preencha os campos:
   - **Nome Completo/Razão Social** (*)
   - **CPF/CNPJ**: Documento do avalista (opcional)
   - **Protesto**: Selecione o protesto associado
3. Clique em "Salvar"

### Editando um Avalista

1. Na lista de avalistas, clique no botão "Editar" ao lado do avalista desejado
2. Modifique os campos necessários
3. Clique em "Atualizar"

### Removendo um Avalista

1. Na lista de avalistas, clique no botão "Excluir" ao lado do avalista desejado
2. Confirme a exclusão na caixa de diálogo
3. O avalista será removido

## Busca e Filtros

### Busca Global

Utilize a barra de busca na barra de ferramentas para pesquisar em todo o sistema por:
- Nomes de clientes
- Números de CPF/CNPJ
- Números de contratos
- Protocolos de protestos

### Filtros Específicos

Cada tela possui filtros específicos que podem ser acessados clicando no ícone de filtro:

#### Filtros em Clientes
- Por cidade
- Por tipo de conta (PF/PJ)

#### Filtros em Contratos
- Por cliente
- Por espécie
- Por ponto de atendimento

#### Filtros em Protestos
- Por status
- Por data de registro (período)
- Por valor (faixa)
- Por cidade
- Por espécie
- Por cliente
- Por contrato

#### Filtros em Avalistas
- Por protesto
- Por nome

## Relatórios

### Tipos de Relatórios Disponíveis

1. **Relatório de Clientes**: Lista detalhada de todos os clientes
2. **Relatório de Contratos**: Lista detalhada de todos os contratos
3. **Relatório de Protestos**: Lista detalhada de todos os protestos
4. **Relatório de Avalistas**: Lista detalhada de todos os avalistas
5. **Relatório Financeiro**: Demonstrativo financeiro dos protestos
6. **Relatório por Status**: Distribuição dos protestos por status
7. **Relatório por Cidade**: Distribuição dos protestos por cidade
8. **Relatório por Espécie**: Distribuição dos protestos por espécie

### Gerando Relatórios

1. Clique em "Relatórios" no menu lateral
2. Selecione o tipo de relatório desejado
3. Configure os parâmetros do relatório:
   - Período (data inicial e final)
   - Filtros específicos (cidade, espécie, status, etc.)
4. Clique em "Gerar Relatório"
5. O relatório será exibido na tela e poderá ser:
   - Impresso (botão "Imprimir")
   - Exportado para PDF (botão "Exportar PDF")
   - Exportado para Excel (botão "Exportar Excel")

## Configurações do Usuário

### Alterando Senha

1. Clique no seu nome de usuário no canto superior direito
2. Selecione "Perfil" no menu suspenso
3. Na aba "Segurança", clique em "Alterar Senha"
4. Informe:
   - **Senha Atual**
   - **Nova Senha**
   - **Confirmação da Nova Senha**
5. Clique em "Salvar"

### Atualizando Informações Pessoais

1. Clique no seu nome de usuário no canto superior direito
2. Selecione "Perfil" no menu suspenso
3. Na aba "Informações Pessoais", modifique os campos desejados:
   - **Nome Completo**
   - **Email**
4. Clique em "Salvar"

## Notificações

O sistema gera notificações para eventos importantes:
- Novos protestos registrados
- Protestos com data de vencimento próxima
- Protestos pagos
- Protestos cancelados
- Erros no sistema

As notificações podem ser acessadas clicando no ícone de sino na barra de ferramentas.

## Suporte e Problemas Comuns

### Problemas de Login

**Esqueci minha senha**:
1. Clique em "Esqueci minha senha" na tela de login
2. Informe seu email cadastrado
3. Siga as instruções enviadas para o email

**Conta bloqueada**:
Entre em contato com o administrador do sistema.

### Erros Comuns

**"Cliente não encontrado"**:
Verifique se o cliente foi cadastrado corretamente.

**"Contrato não encontrado"**:
Verifique se o contrato foi cadastrado e associado corretamente ao cliente.

**"Protesto não encontrado"**:
Verifique se o protesto foi cadastrado e associado corretamente ao contrato.

### Contato com Suporte

Para problemas técnicos ou dúvidas, entre em contato:
- **Email**: suporte@protestos.com.br
- **Telefone**: (67) 3421-XXXX
- **Horário de Atendimento**: Segunda a Sexta, das 8h às 18h

## Boas Práticas

### Segurança
- Mantenha sua senha segura e não a compartilhe com ninguém
- Altere sua senha periodicamente
- Faça logout do sistema ao terminar o uso, especialmente em computadores compartilhados

### Manutenção de Dados
- Mantenha os dados dos clientes sempre atualizados
- Registre adequadamente todas as alterações de status dos protestos
- Documente as situações especiais nos campos apropriados

### Backup
- O sistema realiza backups automáticos diariamente
- Em caso de necessidade, entre em contato com o administrador para restauração

## Glossário

**Protesto**: Ato formal de exigir o cumprimento de obrigação não paga no vencimento, registrado em cartório.

**Avalista**: Pessoa que assume solidariamente com o devedor a obrigação de pagar a dívida.

**Contrato SISBR**: Contrato registrado no sistema SISBR da cooperativa.

**Contrato Legado**: Contrato registrado no sistema anterior (legado).

**Espécie**: Tipo de contrato (CARTÃO, VEÍCULO, PRONAMPE, etc.).

**Ponto de Atendimento**: Agência ou posto onde o contrato foi registrado.

**Protocolo**: Número único atribuído pelo cartório ao registrar o protesto.

**Status**: Estado atual do protesto (PROTESTADO, PAGO, ACORDO, etc.).

**Situação**: Informações adicionais sobre a condição específica do protesto.

**Data de Baixa Cartório**: Data em que o protesto foi pago ou removido do cartório.

## Histórico de Versões

### v1.0.0 (2024-10-XX)
- Lançamento inicial do sistema
- Funcionalidades básicas de gestão de clientes, contratos, protestos e avalistas
- Sistema de autenticação e autorização
- Relatórios básicos
- Interface responsiva

### Próximas Versões
- Integração com sistemas cartorários
- Notificações por email/SMS
- Módulo de negociação
- Controle de acesso avançado
- Relatórios personalizados
- Integração com outros sistemas da cooperativa