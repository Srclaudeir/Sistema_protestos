# Backend - Sistema de Protestos Financeiros

## Descrição

Backend da aplicação de gestão de protestos financeiros, construído com Node.js, Express e MySQL.

## Tecnologias

- Node.js v18+
- Express.js
- MySQL 8.0+
- Sequelize ORM
- JWT para autenticação
- bcryptjs para criptografia de senhas
- Joi para validação de dados

## Estrutura de Pastas

```
/backend
├── src/
│   ├── config/         # Configurações do banco de dados
│   ├── controllers/     # Controladores das rotas
│   ├── middleware/     # Middlewares personalizados
│   ├── models/         # Modelos do Sequelize
│   ├── routes/         # Definição das rotas
│   └── utils/          # Funções utilitárias
├── .env.example        # Exemplo de variáveis de ambiente
├── package.json        # Dependências e scripts
└── server.js           # Ponto de entrada da aplicação
```

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. Inicie o servidor em modo de desenvolvimento:
```bash
npm run dev
```

4. Para produção:
```bash
npm start
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo de desenvolvimento com nodemon
- `npm start` - Inicia o servidor em modo de produção
- `npm test` - Executa os testes automatizados

## Variáveis de Ambiente

Consulte o arquivo `.env.example` para ver todas as variáveis necessárias.

## Endpoints da API

### Clientes
- `GET /api/v1/clientes` - Lista todos os clientes
- `GET /api/v1/clientes/:id` - Obtém um cliente específico
- `POST /api/v1/clientes` - Cria um novo cliente
- `PUT /api/v1/clientes/:id` - Atualiza um cliente
- `DELETE /api/v1/clientes/:id` - Remove um cliente

### Contratos
- `GET /api/v1/contratos` - Lista todos os contratos
- `GET /api/v1/contratos/:id` - Obtém um contrato específico
- `POST /api/v1/contratos` - Cria um novo contrato
- `PUT /api/v1/contratos/:id` - Atualiza um contrato
- `DELETE /api/v1/contratos/:id` - Remove um contrato

### Protestos
- `GET /api/v1/protestos` - Lista todos os protestos
- `GET /api/v1/protestos/:id` - Obtém um protesto específico
- `POST /api/v1/protestos` - Cria um novo protesto
- `PUT /api/v1/protestos/:id` - Atualiza um protesto
- `DELETE /api/v1/protestos/:id` - Remove um protesto

### Avalistas
- `GET /api/v1/avalistas` - Lista todos os avalistas
- `GET /api/v1/avalistas/:id` - Obtém um avalista específico
- `POST /api/v1/avalistas` - Cria um novo avalista
- `PUT /api/v1/avalistas/:id` - Atualiza um avalista
- `DELETE /api/v1/avalistas/:id` - Remove um avalista

## Desenvolvimento

O backend segue o padrão MVC (Model-View-Controller), onde:
- **Models**: Representam as entidades do banco de dados
- **Controllers**: Contêm a lógica de negócio
- **Routes**: Definem os endpoints da API

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

MIT