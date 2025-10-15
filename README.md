# 🏦 Sistema de Gestão de Protestos Financeiros

Sistema completo e moderno para gestão de protestos financeiros, contratos, cooperados, avalistas e espécies de contratos, com interface intuitiva e design profissional.

![Status](https://img.shields.io/badge/status-produção-success)
![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green)
![React](https://img.shields.io/badge/react-18.3.1-blue)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Design System](#-design-system)
- [Estrutura](#-estrutura-do-projeto)
- [Scripts Úteis](#-scripts-úteis)
- [Suporte](#-suporte)

---

## 🎯 Visão Geral

Sistema web full-stack desenvolvido para cooperativas financeiras gerenciarem o ciclo completo de protestos, desde o cadastro de cooperados até o acompanhamento de protestos e baixas cartoriais.

### Características Principais:

✨ **Interface Moderna** - Design profissional com gradientes e animações suaves  
📊 **Dashboard Analítico** - Gráficos interativos e KPIs em tempo real  
🔍 **Busca Avançada** - Filtros múltiplos e busca em tempo real  
📤 **Exportação** - Relatórios em CSV para Excel  
🔐 **Segurança** - Autenticação JWT e proteção de rotas  
📱 **Responsivo** - Funciona perfeitamente em desktop, tablet e mobile

---

## ✨ Funcionalidades

### 📊 Dashboard Executivo

- **KPIs Dinâmicos**
  - Total de cooperados na carteira ativa
  - Instrumentos gerenciados (contratos)
  - Garantias registradas (avalistas)
  - Protestos baixados no sistema
  - Valor total em aberto com filtro por status
  - Ticket médio calculado automaticamente
  - Maior protesto registrado
- **Gráficos Interativos**

  - Protestos por status (Pizza)
  - Top 3 cidades (Barras)
  - Evolução mensal (Linhas)
  - Maiores protestos (Tabela)
  - Últimos protestos registrados

- **Filtros Inteligentes**
  - Visualização por status específico
  - Atualização automática a cada minuto
  - Dados agregados em tempo real

### 👥 Gestão de Cooperados

- CRUD completo (Criar, Ler, Atualizar, Deletar)
- Validação automática de CPF/CNPJ
- Detecção automática de tipo (PF/PJ)
- Busca em tempo real por nome ou documento
- Filtros por tipo de conta e cidade
- Paginação inteligente
- Prevenção de duplicação de documentos

### 📋 Gestão de Contratos

- CRUD completo
- Vinculação com cooperados
- Seleção de espécies predefinidas
- Campos: SISBR, Legado, Ponto de Atendimento, Cidade
- Busca por número ou cooperado
- Filtros por espécie e cidade
- Validação de dados obrigatórios

### ⚖️ Gestão de Protestos

- CRUD completo
- Vinculação com contratos
- Controle de valores protestados
- Status múltiplos (Protestado, Pago, Desistência, etc.)
- Campos detalhados: Protocolo, Data Registro, Parcela, Situação
- Busca avançada multi-campo
- Filtros: Status, Cidade, Valor (min/max), Data (início/fim)
- Exportação para CSV/Excel
- Histórico completo

### 🛡️ Gestão de Avalistas

- CRUD completo
- Vinculação com protestos
- Dados completos: Nome, CPF/CNPJ, Endereço, Contato
- Busca por nome e documento
- Paginação otimizada

### 📑 Gestão de Espécies

- CRUD completo
- Status ativo/inativo
- 9 espécies padrão pré-cadastradas
- Validação antes de exclusão (verifica contratos vinculados)
- Busca em tempo real
- Interface simplificada

### 🔐 Autenticação e Perfil

- Login com JWT
- Registro de novos usuários
- Recuperação de senha por email
- Redefinir senha com token
- Função "Lembre-me"
- Perfil do usuário editável
- Alteração de senha
- Proteção de rotas

---

## 🛠 Tecnologias

### Backend

| Tecnologia    | Versão | Uso                           |
| ------------- | ------ | ----------------------------- |
| **Node.js**   | 16+    | Runtime JavaScript            |
| **Express**   | 4.18+  | Framework web                 |
| **Sequelize** | 6.35+  | ORM para MySQL                |
| **MySQL**     | 8.0+   | Banco de dados relacional     |
| **JWT**       | 9.0+   | Autenticação segura           |
| **bcrypt**    | 5.1+   | Hash de senhas                |
| **Joi**       | 17.11+ | Validação de dados            |
| **Helmet**    | 7.1+   | Segurança HTTP                |
| **Morgan**    | 1.10+  | Logging de requisições        |
| **Winston**   | 3.11+  | Sistema de logs               |
| **CORS**      | 2.8+   | Cross-origin resource sharing |
| **Swagger**   | 6.2+   | Documentação da API           |
| **json2csv**  | 6.0+   | Exportação CSV                |
| **ExcelJS**   | 4.4+   | Manipulação de planilhas      |

### Frontend

| Tecnologia       | Versão | Uso                         |
| ---------------- | ------ | --------------------------- |
| **React**        | 18.3.1 | Biblioteca UI               |
| **Vite**         | 5.4+   | Build tool ultra-rápida     |
| **React Router** | 6.26+  | Roteamento SPA              |
| **Axios**        | 1.7+   | Cliente HTTP                |
| **Recharts**     | 2.12+  | Gráficos interativos        |
| **TailwindCSS**  | 3.4+   | Framework CSS utility-first |
| **PostCSS**      | 8.4+   | Processador CSS             |
| **Lodash**       | 4.17+  | Utilitários JavaScript      |
| **ESLint**       | 9.9+   | Linter JavaScript           |

---

## 📦 Instalação

### Pré-requisitos

- ✅ Node.js 16+ (recomendado: 18+)
- ✅ MySQL 8.0+
- ✅ npm ou yarn
- ✅ Git

### 1️⃣ Clone o Repositório

```bash
git clone <repository-url>
cd Sistema_Protestos
```

### 2️⃣ Instale as Dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Scripts de importação (opcional)
cd ../scripts
npm install
```

### 3️⃣ Configure o Banco de Dados

#### Opção A: Com Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d

# Aguarde o MySQL inicializar (30-60 segundos)
# Depois execute o script de inicialização
mysql -h localhost -P 3306 -u root -p protestos_db < database/init.sql
# Senha padrão: root_password
```

#### Opção B: MySQL Local

```bash
# 1. Crie o banco de dados
mysql -u root -p
CREATE DATABASE protestos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 2. Execute o script de inicialização
mysql -u root -p protestos_db < database/init.sql
```

### 4️⃣ Configure as Variáveis de Ambiente

Crie o arquivo `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=protestos_db
DB_USER=root
DB_PASSWORD=root_password

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=seu_secret_key_super_secreto_aqui_mude_em_producao
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 5️⃣ Inicie a Aplicação

```bash
# Terminal 1 - Backend (porta 3000)
cd backend
npm start

# Terminal 2 - Frontend (porta 5173)
cd frontend
npm run dev
```

### 6️⃣ Acesse o Sistema

- 🌐 **Frontend**: http://localhost:5173
- 🔌 **Backend API**: http://localhost:3000
- 📚 **API Docs (Swagger)**: http://localhost:3000/api-docs

### 7️⃣ Login Padrão

```
Usuário: admin
Senha: admin123
```

⚠️ **IMPORTANTE**: Altere a senha padrão após o primeiro acesso!

---

## ⚙️ Configuração

### Migrações do Banco de Dados

Execute as migrações conforme necessário:

```bash
# 1. Adicionar campo cidade aos clientes
mysql -u root -p protestos_db < database/migration_add_cidade.sql

# 2. Adicionar status "ESPERANDO_PROTESTO"
mysql -u root -p protestos_db < database/migration_add_esperando_protesto.sql

# 3. Corrigir tipos de dados
mysql -u root -p protestos_db < database/migration_fix_data_types.sql

# 4. Criar tabela de espécies (essencial!)
mysql -u root -p protestos_db < database/run_migration_especies.sql

# 5. Atualizar tamanho do campo status
mysql -u root -p protestos_db < database/migration_update_status_length.sql

# 6. Resetar senha do admin (se necessário)
mysql -u root -p protestos_db < database/migration_reset_password.sql
```

### Importação de Dados em Massa

Para importar dados de uma planilha Excel/CSV:

```bash
cd scripts
npm install

# Importar planilha completa
node importarPlanilhaCompleta.js

# Verificar totais
node calcularTotalExcel.js        # Totais na planilha
node calcularTotalProtestos.js    # Totais no banco
```

⚠️ **ATENÇÃO**: A importação limpa as tabelas existentes!

---

## 📖 Uso

### Fluxo Básico de Trabalho

#### 1. Cadastrar Cooperado

- Acesse **Cooperados** no menu
- Clique em **"Novo Cooperado"**
- Preencha: Nome, CPF/CNPJ, Tipo de Conta, Cidade
- CPF/CNPJ válido detecta automaticamente PF ou PJ

#### 2. Cadastrar Contrato

- Acesse **Contratos** no menu
- Clique em **"Novo Contrato"**
- Selecione o cooperado
- Escolha a espécie (Cartão, Veículo, etc.)
- Informe números SISBR/Legado, cidade, ponto de atendimento

#### 3. Registrar Protesto

- Acesse **Protestos** no menu
- Clique em **"Novo Protesto"**
- Selecione o contrato
- Informe: Valor, Data, Número da Parcela
- Opcionais: Protocolo, Status, Observações

#### 4. Adicionar Avalista (Opcional)

- Acesse **Avalistas** no menu
- Clique em **"Novo Avalista"**
- Vincule ao protesto correspondente
- Preencha dados de contato

#### 5. Acompanhar no Dashboard

- Visualize estatísticas consolidadas
- Filtre por status específico
- Analise evolução mensal
- Identifique maiores valores

### Funcionalidades Avançadas

#### Busca e Filtros

- **Busca em tempo real** - Digite e veja resultados instantaneamente
- **Filtros combinados** - Status + Cidade + Valor + Data
- **Indicador de filtros ativos** - Contador visual
- **Limpeza rápida** - Botão para resetar todos os filtros

#### Exportação de Dados

- **CSV com encoding UTF-8** - Compatível com Excel
- **Filtros aplicados** - Exporta apenas registros filtrados
- **Dados completos** - Inclui avalistas e informações relacionadas
- **Nome automático** - Arquivo com data de exportação

#### Validações Inteligentes

- **CPF/CNPJ** - Validação matemática automática
- **Campos obrigatórios** - Feedback visual imediato
- **Duplicação** - Previne registros duplicados
- **Relacionamentos** - Verifica dependências antes de deletar

---

## 🎨 Design System

### Paleta de Cores

```css
/* Cores Principais */
--brand-deep: #003E52        /* Azul escuro profissional */
--brand-navy: #002838        /* Azul marinho */
--brand-turquoise: #00AE9D   /* Turquesa vibrante */
--brand-turquoise-dark: #008C7E
--brand-green: #5E9F1A       /* Verde */
--brand-lime: #C9D200        /* Lima */
--brand-purple: #49479D      /* Roxo */
--brand-pink: #EC4899        /* Rosa */
--brand-orange: #F97316      /* Laranja */
--brand-forest: #1A3A2E      /* Verde floresta */
--brand-muted: #E2E8F0       /* Cinza claro */
```

### Componentes Visuais

#### Logo

- **Container branco** com borda e sombra
- **Tamanhos responsivos:**
  - Sidebar: 80x80px
  - Navbar Desktop: 64px
  - Navbar Mobile: 48px
  - Autenticação: 128px

#### Botões

**Primário** (Ações principais)

```jsx
className =
  "rounded-xl bg-gradient-to-r from-brand-deep to-brand-turquoise-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-turquoise-dark hover:to-brand-deep";
```

**Secundário** (Cancelar, Voltar)

```jsx
className =
  "rounded-xl border border-brand-muted px-5 py-3 text-sm font-semibold text-brand-deep transition hover:bg-brand-muted/60";
```

**Outline** (Exportar, Filtros)

```jsx
className =
  "rounded-xl border-2 border-brand-turquoise bg-white px-6 py-3 text-sm font-semibold text-brand-turquoise shadow-md transition hover:bg-brand-turquoise hover:text-white";
```

#### Cards e Containers

- Border-radius arredondado (`rounded-2xl`, `rounded-3xl`)
- Bordas sutis (`border-brand-muted/60`)
- Sombras em camadas (`shadow-xl`)
- Efeito glassmorphism em modais

### Tipografia

- **Títulos:** Font bold/semibold, tracking aumentado
- **Labels:** Uppercase com tracking expandido
- **Corpo:** Font regular, tamanho 14px (text-sm)

---

## 📁 Estrutura do Projeto

```
Sistema_Protestos/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── app.js                    # Configuração Express
│   │   ├── 📁 config/
│   │   │   ├── database.js           # Conexão Sequelize
│   │   │   ├── db.js                 # Config alternativa
│   │   │   └── swagger.js            # Configuração Swagger
│   │   ├── 📁 controllers/
│   │   │   ├── AuthController.js     # Autenticação
│   │   │   ├── ClienteController.js  # Cooperados
│   │   │   ├── ContratoController.js # Contratos
│   │   │   ├── ProtestoController.js # Protestos
│   │   │   ├── AvalistaController.js # Avalistas
│   │   │   ├── EspecieController.js  # Espécies
│   │   │   └── DashboardController.js # Dashboard
│   │   ├── 📁 middleware/
│   │   │   ├── auth.js               # Autenticação JWT
│   │   │   ├── errorHandler.js       # Tratamento de erros
│   │   │   └── logging.js            # Logging de requisições
│   │   ├── 📁 models/
│   │   │   ├── Cliente.js            # Model Cooperado
│   │   │   ├── Contrato.js           # Model Contrato
│   │   │   ├── Protesto.js           # Model Protesto
│   │   │   ├── Avalista.js           # Model Avalista
│   │   │   ├── Especie.js            # Model Espécie
│   │   │   ├── User.js               # Model Usuário
│   │   │   └── index.js              # Associations
│   │   ├── 📁 routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── cliente.routes.js
│   │   │   ├── contrato.routes.js
│   │   │   ├── protesto.routes.js
│   │   │   ├── avalista.routes.js
│   │   │   ├── especie.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   ├── health.routes.js
│   │   │   └── index.js
│   │   └── 📁 utils/
│   │       ├── errors.js             # Erros customizados
│   │       ├── format.js             # Formatação
│   │       ├── logger.js             # Winston logger
│   │       ├── pagination.js         # Paginação
│   │       └── validation.js         # Schemas Joi
│   ├── server.js                     # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 layout/
│   │   │   │   ├── Layout.jsx        # Layout principal
│   │   │   │   ├── Navbar.jsx        # Barra superior
│   │   │   │   └── Sidebar.jsx       # Menu lateral
│   │   │   └── ProtectedRoute.jsx    # Proteção de rotas
│   │   ├── 📁 constants/
│   │   │   └── navigation.jsx        # Itens do menu
│   │   ├── 📁 contexts/
│   │   │   ├── AuthContext.js
│   │   │   └── AuthProvider.jsx      # Context de autenticação
│   │   ├── 📁 hooks/
│   │   │   └── useAuth.js            # Hook de autenticação
│   │   ├── 📁 pages/
│   │   │   ├── Dashboard.jsx         # Dashboard principal
│   │   │   ├── ClientesList.jsx      # Lista cooperados
│   │   │   ├── ClienteForm.jsx       # Form cooperado
│   │   │   ├── ContratosList.jsx     # Lista contratos
│   │   │   ├── ContratoForm.jsx      # Form contrato
│   │   │   ├── ProtestosList.jsx     # Lista protestos
│   │   │   ├── ProtestoForm.jsx      # Form protesto
│   │   │   ├── AvalistasList.jsx     # Lista avalistas
│   │   │   ├── AvalistaForm.jsx      # Form avalista
│   │   │   ├── EspeciesList.jsx      # Lista espécies
│   │   │   ├── EspecieForm.jsx       # Form espécie
│   │   │   ├── Login.jsx             # Login
│   │   │   ├── Register.jsx          # Registro
│   │   │   ├── ForgotPassword.jsx    # Recuperar senha
│   │   │   ├── ResetPassword.jsx     # Redefinir senha
│   │   │   └── Profile.jsx           # Perfil do usuário
│   │   ├── 📁 services/
│   │   │   └── api.js                # Cliente Axios
│   │   ├── 📁 utils/
│   │   │   └── dateFormatter.js      # Formatação de datas
│   │   ├── App.jsx                   # App principal
│   │   ├── main.jsx                  # Entry point
│   │   ├── App.css
│   │   └── index.css
│   ├── 📁 public/
│   │   └── vite.svg                  # Logo do sistema
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── eslint.config.js
│
├── 📁 database/
│   ├── init.sql                      # Schema inicial + usuário padrão
│   ├── migration_*.sql               # Migrações diversas
│   ├── run_migration_especies.sql    # Criar espécies
│   └── README_ESPECIES.md            # Documentação espécies
│
├── 📁 scripts/
│   ├── importarPlanilhaCompleta.js   # Importação em massa
│   ├── calcularTotalExcel.js         # Verificar totais Excel
│   ├── calcularTotalProtestos.js     # Verificar totais DB
│   ├── package.json
│   └── README.md
│
├── docker-compose.yml                # Docker MySQL
├── exemplo_importacao.csv            # Exemplo de CSV
├── PLANILHA GERAL DE PROTESTOS.csv   # Dados de produção
├── INSTRUCOES_MIGRACAO.md            # Guia de migração
└── README.md                         # Este arquivo
```

---

## 🔧 Scripts Úteis

### Backend

```bash
npm start              # Iniciar servidor de produção
npm run dev            # Desenvolvimento com nodemon
npm test               # Executar testes (se disponível)
```

### Frontend

```bash
npm run dev            # Servidor de desenvolvimento (porta 5173)
npm run build          # Build para produção
npm run preview        # Preview do build de produção
npm run lint           # Executar ESLint
```

### Scripts de Dados

```bash
cd scripts

# Importar dados da planilha
node importarPlanilhaCompleta.js

# Verificar totais na planilha Excel
node calcularTotalExcel.js

# Verificar totais no banco de dados
node calcularTotalProtestos.js
```

---

## 🌟 Espécies Pré-Cadastradas

O sistema vem com 9 espécies de contratos prontas para uso:

| ID  | Espécie             | Descrição                                                   | Status   |
| --- | ------------------- | ----------------------------------------------------------- | -------- |
| 1   | **CARTÃO**          | Contratos de cartão de crédito/débito                       | ✅ Ativo |
| 2   | **VEÍCULO**         | Financiamento de veículos                                   | ✅ Ativo |
| 3   | **PRONAMPE**        | Programa Nacional de Apoio às Microempresas                 | ✅ Ativo |
| 4   | **BNDES**           | Financiamento BNDES                                         | ✅ Ativo |
| 5   | **CAPITAL DE GIRO** | Capital de giro para empresas                               | ✅ Ativo |
| 6   | **CHEQUE ESPECIAL** | Cheque especial                                             | ✅ Ativo |
| 7   | **ANTECIPAÇÃO**     | Antecipação de recebíveis                                   | ✅ Ativo |
| 8   | **FINANCIAMENTO**   | Financiamento em geral                                      | ✅ Ativo |
| 9   | **PRONAMP**         | Programa Nacional de Fortalecimento da Agricultura Familiar | ✅ Ativo |

---

## 📊 Status dos Protestos

O sistema suporta os seguintes status:

| Status                  | Descrição                        |
| ----------------------- | -------------------------------- |
| **PROTESTADO**          | Protesto efetivado em cartório   |
| **AGUARDANDO PROTESTO** | Aguardando protocolo em cartório |
| **ESPERANDO_PROTESTO**  | Em preparação para envio         |
| **PAGO**                | Protesto quitado                 |
| **DESISTÊNCIA**         | Cooperativa desistiu do protesto |
| **CANCELADO**           | Protesto cancelado               |
| **RETIRADO**            | Protesto retirado do cartório    |
| **DEVOLVIDO**           | Protesto devolvido pelo cartório |
| **ANUÊNCIA**            | Cooperado deu anuência           |
| **ACORDO**              | Acordo firmado                   |
| **RENEGOCIADO**         | Dívida renegociada               |
| **LIQUIDADO**           | Totalmente liquidado             |
| **JUDICIAL**            | Em processo judicial             |

---

## 🔐 Segurança

### Implementações de Segurança

- ✅ **JWT** - Tokens com expiração de 24h
- ✅ **bcrypt** - Hash de senhas com salt rounds 10
- ✅ **Helmet** - Headers de segurança HTTP
- ✅ **CORS** - Controle de origens permitidas
- ✅ **Rate Limiting** - Proteção contra brute force (planejado)
- ✅ **Input Validation** - Joi schemas no backend
- ✅ **SQL Injection** - Prevenido pelo Sequelize ORM
- ✅ **XSS** - Sanitização automática do React

### Boas Práticas

- 🔒 Senhas nunca armazenadas em plain text
- 🔑 JWT secret em variável de ambiente
- 🛡️ Validação tanto no frontend quanto backend
- 📝 Logs de acesso e erros
- ⚠️ Mensagens de erro genéricas para usuários

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Autenticação

Todas as rotas (exceto login/register) requerem token JWT no header:

```bash
Authorization: Bearer <seu_token_jwt>
```

### Endpoints Principais

#### 🔐 Autenticação

```
POST   /auth/login              # Login
POST   /auth/register           # Registro
POST   /auth/forgot-password    # Recuperar senha
POST   /auth/reset-password     # Redefinir senha
GET    /auth/profile            # Perfil do usuário
PUT    /auth/profile            # Atualizar perfil
PUT    /auth/change-password    # Mudar senha
```

#### 👥 Cooperados

```
GET    /clientes               # Listar (com filtros e busca)
GET    /clientes/:id           # Buscar por ID
POST   /clientes               # Criar
PUT    /clientes/:id           # Atualizar
DELETE /clientes/:id           # Deletar
```

#### 📋 Contratos

```
GET    /contratos              # Listar (com filtros e busca)
GET    /contratos/:id          # Buscar por ID
POST   /contratos              # Criar
PUT    /contratos/:id          # Atualizar
DELETE /contratos/:id          # Deletar
```

#### ⚖️ Protestos

```
GET    /protestos              # Listar (com filtros avançados)
GET    /protestos/:id          # Buscar por ID
POST   /protestos              # Criar
PUT    /protestos/:id          # Atualizar
DELETE /protestos/:id          # Deletar
GET    /protestos/export       # Exportar CSV
```

#### 🛡️ Avalistas

```
GET    /avalistas              # Listar
GET    /avalistas/:id          # Buscar por ID
POST   /avalistas              # Criar
PUT    /avalistas/:id          # Atualizar
DELETE /avalistas/:id          # Deletar
```

#### 📑 Espécies

```
GET    /especies               # Listar
GET    /especies/:id           # Buscar por ID
POST   /especies               # Criar
PUT    /especies/:id           # Atualizar
DELETE /especies/:id           # Deletar (com validação)
```

#### 📊 Dashboard

```
GET    /dashboard/summary      # Resumo executivo (KPIs)
GET    /dashboard/details      # Estatísticas detalhadas
```

### Documentação Interativa

Acesse o Swagger UI para testar os endpoints:

**http://localhost:3000/api-docs**

---

## 🎓 Guia de Desenvolvimento

### Adicionar Nova Funcionalidade

#### Backend

1. **Criar Model** em `backend/src/models/`
2. **Criar Controller** em `backend/src/controllers/`
3. **Criar Routes** em `backend/src/routes/`
4. **Adicionar Validation** em `backend/src/utils/validation.js`
5. **Registrar rotas** em `backend/src/routes/index.js`

#### Frontend

1. **Criar Page** em `frontend/src/pages/`
2. **Adicionar Rota** em `frontend/src/App.jsx`
3. **Adicionar API calls** em `frontend/src/services/api.js`
4. **Adicionar ao Menu** em `frontend/src/constants/navigation.jsx`

### Padrões de Código

#### Backend

- Use async/await para operações assíncronas
- Sempre trate erros com try/catch
- Valide dados com Joi antes de processar
- Use transactions para operações múltiplas
- Log de erros com Winston

#### Frontend

- Componentes funcionais com hooks
- useState para estado local
- useEffect para side effects
- useCallback para funções memoizadas
- useMemo para valores computados
- Nomes em PascalCase para componentes
- Props destructuring

---

## 📈 Métricas e Performance

### Banco de Dados Atual

- **Total de Protestos:** 2.687 registros
- **Valor Total:** R$ 16.987.530,71
- **Ticket Médio:** R$ 6.322,12
- **Menor Protesto:** R$ 1,32
- **Maior Protesto:** R$ 482.326,81

### Distribuição por Status

- **PROTESTADO:** 2.498 (85,36%) - R$ 14.500.461,97
- **AGUARDANDO PROTESTO:** 84 (12,14%) - R$ 2.061.805,77
- **PAGO:** 73 (1,41%) - R$ 238.827,91
- **DESISTÊNCIA:** 29 (0,91%) - R$ 155.367,90
- **Outros:** 3 registros - R$ 31.067,16

---

## 🚨 Troubleshooting

### Problema: Erro de Conexão com Banco de Dados

**Solução:**

1. Verifique se o MySQL está rodando: `docker ps` ou `service mysql status`
2. Confirme as credenciais no `.env`
3. Teste a conexão: `mysql -h localhost -u root -p`

### Problema: Erro ao Instalar Dependências

**Solução:**

```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problema: Frontend não carrega

**Solução:**

1. Verifique se o backend está rodando na porta 3000
2. Confirme a variável `VITE_API_URL` (se existir)
3. Limpe o cache: Ctrl+Shift+Delete no navegador
4. Tente: `npm run dev -- --force`

### Problema: Valores diferentes entre banco e frontend

**Solução:**

- Os valores estão corretos! Pode ser apenas formatação visual
- Verifique se há filtros ativos na interface
- Pressione Ctrl+F5 para atualizar o cache
- Dashboard mostra apenas protestos "PROTESTADO" por padrão

---

## 📝 Changelog

### v1.0.0 - Outubro 2025

#### ✨ Novidades

- ✅ Logo do sistema integrado (vite.svg)
- ✅ Terminologia atualizada: Cliente → Cooperado
- ✅ Botões padronizados com gradiente
- ✅ Interface moderna com glassmorphism
- ✅ Dashboard com gráficos interativos
- ✅ Sistema de espécies de contratos
- ✅ Exportação para CSV/Excel
- ✅ Filtros avançados em todas as listas
- ✅ Busca em tempo real com debounce
- ✅ Paginação otimizada
- ✅ Validação de CPF/CNPJ

#### 🎨 Design

- Paleta de cores profissional (turquesa + azul marinho)
- Botões com gradiente e sombras
- Cards arredondados e elevados
- Responsividade completa
- Avatar do usuário com gradiente
- Logo em todos os componentes

#### 🔧 Técnico

- Sequelize ORM configurado
- JWT com refresh token
- Middleware de autenticação
- Logger Winston
- Swagger documentation
- Error handling centralizado
- Validation schemas com Joi

---

## 🤝 Contribuindo

### Como Contribuir

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/MinhaFeature`
3. Commit: `git commit -m 'Adiciona MinhaFeature'`
4. Push: `git push origin feature/MinhaFeature`
5. Abra um Pull Request

### Padrões de Commit

```
feat: Adiciona nova funcionalidade
fix: Corrige um bug
docs: Atualiza documentação
style: Mudanças de estilo/formatação
refactor: Refatoração de código
test: Adiciona ou corrige testes
chore: Tarefas de manutenção
```

---

## 📞 Suporte

Para dúvidas, problemas ou sugestões:

- 📧 Email: suporte@sistema-protestos.com
- 📝 Issues: [GitHub Issues](link-do-repositorio/issues)
- 📖 Wiki: [Documentação Completa](link-da-wiki)

---

## 📄 Licença

Este projeto é **proprietário e confidencial**.

© 2025 Sistema de Protestos. Todos os direitos reservados.

---

## 👥 Equipe

Desenvolvido com ❤️ pela equipe de tecnologia.

---

## 🎯 Roadmap Futuro

### Próximas Funcionalidades

- [ ] Notificações por email
- [ ] Geração de boletos
- [ ] Integração com cartórios via API
- [ ] Relatórios PDF customizáveis
- [ ] App mobile (React Native)
- [ ] Auditoria e logs detalhados
- [ ] Backup automático
- [ ] Multi-tenancy (múltiplas cooperativas)
- [ ] Assinatura digital de documentos
- [ ] BI avançado com Power BI

---

**Status do Projeto:** ✅ **Pronto para Produção**

**Versão Atual:** `1.0.0`

**Última Atualização:** Outubro 2025

**Banco de Dados:** R$ 16.987.530,71 em 2.687 protestos

---

## 📸 Screenshots

### Dashboard

- Gráficos interativos
- KPIs em tempo real
- Filtros dinâmicos por status

### Listas

- Busca avançada
- Filtros múltiplos
- Paginação inteligente
- Ações rápidas (Editar/Excluir)

### Formulários

- Design moderno e limpo
- Validação em tempo real
- Feedback visual
- Auto-complete inteligente

### Autenticação

- Login com "Lembre-me"
- Recuperação de senha
- Logo destacado
- Design profissional

---

✨ **Desenvolvido para simplificar e automatizar a gestão de protestos financeiros!** ✨
