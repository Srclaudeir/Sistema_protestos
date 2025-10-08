# Sistema de Gestao de Protestos Financeiros

Plataforma web para centralizar o controle de protestos financeiros, substituindo a planilha atual por uma solucao moderna, auditavel e segura.

## Visao Geral
- API REST em Node.js com autenticacao JWT, segregacao de perfis e documentacao Swagger em `/api-docs`.
- Frontend React com roteamento protegido, dashboard inicial e CRUD completos para clientes, contratos, protestos e avalistas.
- Scripts Node.js para migrar dados da planilha CSV, validar registros e importar para MySQL.
- Base MySQL estruturada em `database/init.sql`, pronta para provisionamento automatizado.

### Funcionalidades Entregues
- Cadastro, edicao, listagem (com paginacao/busca no frontend) e exclusao das entidades principais.
- Autenticacao, registro de usuarios e atualizacao de perfil com senhas criptografadas.
- Middlewares de seguranca (Helmet, CORS), logs HTTP (Morgan) e tratamento padronizado de erros.
- Experiencia de usuario com layout responsivo (TailwindCSS) e protecao de rotas via contexto de autenticacao.
- Scripts de migracao com saneamento de datas, moedas e documentos.

### Pendencias Principais
- Cobertura de testes automatizados (Jest no backend, suites de UI ou integracao no frontend).
- Pipeline de CI/CD, configuracao de deploy e monitoramento.
- Ajustes finos de UX (metricas reais no dashboard, feedbacks e carregamento otimizado).

## Stack Tecnologica

### Backend
- Node.js 18+
- Express 4
- Sequelize + MySQL 8
- JSON Web Tokens (jsonwebtoken)
- Joi para validacao
- Winston para logs (via middleware de erro)

### Frontend
- React 18 com Vite
- React Router 6
- TailwindCSS
- Axios

### Infraestrutura
- Docker e Docker Compose
- Variaveis `.env` para credenciais e chaves JWT

## Estrutura do Projeto
```
Sistema_Protestos/
  API_DOCS.md
  PROJECT_MANAGEMENT.md
  README.md
  USER_MANUAL.md
  docker-compose.yml
  protesto2.csv
  backend/
    Dockerfile
    index.js
    package.json
    package-lock.json
    server.js
    .env.example
    src/
      app.js
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
    logs/
  frontend/
    index.html
    package.json
    package-lock.json
    postcss.config.js
    tailwind.config.js
    vite.config.js
    public/
    src/
      App.jsx
      App.css
      components/
      contexts/
      hooks/
      pages/
      services/
      utils/
  database/
    init.sql
  scripts/
    migrateCSV.js
    migrateCSVSimple.js
    importMigratedData.js
    convertCSVToJSON.js
    checkImportedData.js
    protestos_migrados.json
```

## Como Executar

### Backend
1. `cd backend`
2. `cp .env.example .env`
3. Ajuste variaveis (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`).
4. `npm install`
5. Ambiente de desenvolvimento: `npm run dev`
6. Ambiente de producao: `npm start`

Endpoints uteis:
- `GET /health` para verificar conexao com o banco.
- `GET /api-docs` para documentacao interativa.

### Frontend
1. `cd frontend`
2. `npm install`
3. (Opcional) configure `VITE_API_URL` em `.env.local` (padrao `http://localhost:3000/api/v1`).
4. `npm run dev`
5. Acesse `http://localhost:5173`

### Docker Compose
```
docker-compose up -d --build
```
O arquivo cria os servicos `api`, `web` e `mysql`, ja integrados.

## Scripts de Migracao
- `migrateCSV.js`: le `protesto2.csv`, normaliza campos e popula tabelas via Sequelize.
- `migrateCSVSimple.js`: versao simplificada para validar o pipeline.
- `importMigratedData.js`: injeta dados ja transformados no banco.
- `checkImportedData.js`: verificacao basica apos a carga.
- `convertCSVToJSON.js`: gera `protestos_migrados.json` para inspecao manual.

Execute com:
```
cd scripts
node migrateCSV.js
node importMigratedData.js
```
Certifique-se de que o backend esteja configurado e o banco acessivel.

## Testes
Ainda nao ha suites implementadas. Utilize `npm test` no backend para preparar o ambiente Jest; adicionar specs para controllers e servicos e2e e incorporar ao pipeline futuro.

## Contato
Para suporte ou duvidas: suporte@protestos.com.br

