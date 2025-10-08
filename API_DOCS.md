# Documentação da API - Sistema de Protestos Financeiros

## Visão Geral

Esta documentação descreve os endpoints da API REST do Sistema de Protestos Financeiros. A API permite gerenciar clientes, contratos, protestos e avalistas através de operações CRUD.

## Base URL

```
http://localhost:3000/api/v1
```

## Autenticação

A maioria dos endpoints requer autenticação via token JWT. O token deve ser enviado no header `Authorization`:

```
Authorization: Bearer <token>
```

## Endpoints

### Autenticação

#### POST /auth/login
Realiza o login do usuário.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "username": "usuario",
      "email": "usuario@email.com",
      "nome": "Nome do Usuário",
      "role": "admin"
    },
    "token": "jwt-token"
  }
}
```

#### POST /auth/register
Registra um novo usuário.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "nome": "string",
  "role": "admin|operador|supervisor" (opcional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "username": "usuario",
      "email": "usuario@email.com",
      "nome": "Nome do Usuário",
      "role": "operador"
    },
    "token": "jwt-token"
  }
}
```

#### GET /auth/profile
Obtém o perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "usuario",
    "email": "usuario@email.com",
    "nome": "Nome do Usuário",
    "role": "admin",
    "ativo": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /auth/profile
Atualiza o perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nome": "string" (opcional),
  "email": "string" (opcional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Perfil atualizado com sucesso",
  "data": {
    "id": 1,
    "username": "usuario",
    "email": "novousuario@email.com",
    "nome": "Novo Nome",
    "role": "admin",
    "ativo": true
  }
}
```

#### PUT /auth/change-password
Altera a senha do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

### Clientes

#### GET /clientes
Lista todos os clientes com paginação e filtros.

**Query Parameters:**
- `page` (integer, opcional) - Número da página (padrão: 1)
- `limit` (integer, opcional) - Limite de itens por página (padrão: 10, máximo: 100)
- `search` (string, opcional) - Termo de busca
- `sort` (string, opcional) - Ordenação (ex: "nome:asc", "created_at:desc")
- `cidade` (string, opcional) - Filtrar por cidade
- `tipo_conta` (string, opcional) - Filtrar por tipo de conta (PF/PJ)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "pages": 10,
  "currentPage": 1,
  "hasNextPage": true,
  "hasPrevPage": false,
  "nextPage": 2,
  "prevPage": null,
  "data": [
    {
      "id": 1,
      "nome": "Nome do Cliente",
      "cpf_cnpj": "123.456.789-00",
      "tipo_conta": "PF",
      "cidade": "Dourados",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /clientes/:id
Obtém um cliente específico pelo ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Nome do Cliente",
    "cpf_cnpj": "123.456.789-00",
    "tipo_conta": "PF",
    "cidade": "Dourados",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "contratos": [
      {
        "id": 1,
        "numero_contrato_sisbr": "CT123456",
        "numero_contrato_legado": "LEG001",
        "especie": "CARTÃO",
        "ponto_atendimento": "Agência Central",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### POST /clientes
Cria um novo cliente.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nome": "string",
  "cpf_cnpj": "string" (opcional),
  "tipo_conta": "PF|PJ",
  "cidade": "string" (opcional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "data": {
    "id": 1,
    "nome": "Nome do Cliente",
    "cpf_cnpj": "123.456.789-00",
    "tipo_conta": "PF",
    "cidade": "Dourados",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /clientes/:id
Atualiza um cliente existente.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nome": "string" (opcional),
  "cpf_cnpj": "string" (opcional),
  "tipo_conta": "PF|PJ" (opcional),
  "cidade": "string" (opcional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cliente atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "Novo Nome do Cliente",
    "cpf_cnpj": "987.654.321-00",
    "tipo_conta": "PJ",
    "cidade": "Nova Andradina",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-02T00:00:00.000Z"
  }
}
```

#### DELETE /clientes/:id
Remove um cliente.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cliente removido com sucesso"
}
```

### Contratos

#### GET /contratos
Lista todos os contratos com paginação e filtros.

**Query Parameters:**
- `page` (integer, opcional) - Número da página (padrão: 1)
- `limit` (integer, opcional) - Limite de itens por página (padrão: 10, máximo: 100)
- `search` (string, opcional) - Termo de busca
- `sort` (string, opcional) - Ordenação
- `cliente_id` (integer, opcional) - Filtrar por ID do cliente
- `especie` (string, opcional) - Filtrar por espécie
- `ponto_atendimento` (string, opcional) - Filtrar por ponto de atendimento

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "pages": 10,
  "currentPage": 1,
  "hasNextPage": true,
  "hasPrevPage": false,
  "nextPage": 2,
  "prevPage": null,
  "data": [
    {
      "id": 1,
      "numero_contrato_sisbr": "CT123456",
      "numero_contrato_legado": "LEG001",
      "especie": "CARTÃO",
      "ponto_atendimento": "Agência Central",
      "created_at": "2024-01-01T00:00:00.000Z",
      "cliente_id": 1,
      "cliente": {
        "id": 1,
        "nome": "Nome do Cliente",
        "cpf_cnpj": "123.456.789-00",
        "tipo_conta": "PF",
        "cidade": "Dourados",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

#### GET /contratos/:id
Obtém um contrato específico pelo ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "numero_contrato_sisbr": "CT123456",
    "numero_contrato_legado": "LEG001",
    "especie": "CARTÃO",
    "ponto_atendimento": "Agência Central",
    "created_at": "2024-01-01T00:00:00.000Z",
    "cliente_id": 1,
    "cliente": {
      "id": 1,
      "nome": "Nome do Cliente",
      "cpf_cnpj": "123.456.789-00",
      "tipo_conta": "PF",
      "cidade": "Dourados",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "protestos": [
      {
        "id": 1,
        "valor_protestado": "1500.00",
        "numero_parcela": "1/12",
        "data_registro": "2024-01-15",
        "protocolo": "PROT001",
        "status": "PROTESTADO",
        "situacao": null,
        "data_baixa_cartorio": null,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "contrato_id": 1
      }
    ]
  }
}
```

#### POST /contratos
Cria um novo contrato.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "numero_contrato_sisbr": "string",
  "numero_contrato_legado": "string" (opcional),
  "especie": "string" (opcional),
  "ponto_atendimento": "string" (opcional),
  "cliente_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contrato criado com sucesso",
  "data": {
    "id": 1,
    "numero_contrato_sisbr": "CT123456",
    "numero_contrato_legado": "LEG001",
    "especie": "CARTÃO",
    "ponto_atendimento": "Agência Central",
    "created_at": "2024-01-01T00:00:00.000Z",
    "cliente_id": 1
  }
}
```

#### PUT /contratos/:id
Atualiza um contrato existente.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "numero_contrato_sisbr": "string" (opcional),
  "numero_contrato_legado": "string" (opcional),
  "especie": "string" (opcional),
  "ponto_atendimento": "string" (opcional),
  "cliente_id": 1 (opcional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contrato atualizado com sucesso",
  "data": {
    "id": 1,
    "numero_contrato_sisbr": "CT789012",
    "numero_contrato_legado": "LEG002",
    "especie": "VEICULO",
    "ponto_atendimento": "Agência Norte",
    "created_at": "2024-01-01T00:00:00.000Z",
    "cliente_id": 1
  }
}
```

#### DELETE /contratos/:id
Remove um contrato.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Contrato removido com sucesso"
}
```

### Protestos

#### GET /protestos
Lista todos os protestos com paginação e filtros.

**Query Parameters:**
- `page` (integer, opcional) - Número da página (padrão: 1)
- `limit` (integer, opcional) - Limite de itens por página (padrão: 10, máximo: 100)
- `search` (string, opcional) - Termo de busca
- `sort` (string, opcional) - Ordenação
- `status` (string, opcional) - Filtrar por status
- `data_inicio` (date, opcional) - Filtrar por data de início
- `data_fim` (date, opcional) - Filtrar por data de fim
- `valor_min` (number, opcional) - Filtrar por valor mínimo
- `valor_max` (number, opcional) - Filtrar por valor máximo
- `cidade` (string, opcional) - Filtrar por cidade
- `especie` (string, opcional) - Filtrar por espécie
- `cliente_id` (integer, opcional) - Filtrar por ID do cliente
- `contrato_id` (integer, opcional) - Filtrar por ID do contrato

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "pages": 10,
  "currentPage": 1,
  "hasNextPage": true,
  "hasPrevPage": false,
  "nextPage": 2,
  "prevPage": null,
  "data": [
    {
      "id": 1,
      "valor_protestado": "1500.00",
      "numero_parcela": "1/12",
      "data_registro": "2024-01-15",
      "protocolo": "PROT001",
      "status": "PROTESTADO",
      "situacao": null,
      "data_baixa_cartorio": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "contrato_id": 1,
      "contrato": {
        "id": 1,
        "numero_contrato_sisbr": "CT123456",
        "numero_contrato_legado": "LEG001",
        "especie": "CARTÃO",
        "ponto_atendimento": "Agência Central",
        "created_at": "2024-01-01T00:00:00.000Z",
        "cliente_id": 1,
        "cliente": {
          "id": 1,
          "nome": "Nome do Cliente",
          "cpf_cnpj": "123.456.789-00",
          "tipo_conta": "PF",
          "cidade": "Dourados",
          "created_at": "2024-01-01T00:00:00.000Z"
        }
      },
      "avalistas": [
        {
          "id": 1,
          "nome": "Nome do Avalista",
          "cpf_cnpj": "987.654.321-00",
          "protesto_id": 1
        }
      ]
    }
  ]
}
```

#### GET /protestos/:id
Obtém um protesto específico pelo ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "valor_protestado": "1500.00",
    "numero_parcela": "1/12",
    "data_registro": "2024-01-15",
    "protocolo": "PROT001",
    "status": "PROTESTADO",
    "situacao": null,
    "data_baixa_cartorio": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "contrato_id": 1,
    "contrato": {
      "id": 1,
      "numero_contrato_sisbr": "CT123456",
      "numero_contrato_legado": "LEG001",
      "especie": "CARTÃO",
      "ponto_atendimento": "Agência Central",
      "created_at": "2024-01-01T00:00:00.000Z",
      "cliente_id": 1,
      "cliente": {
        "id": 1,
        "nome": "Nome do Cliente",
        "cpf_cnpj": "123.456.789-00",
        "tipo_conta": "PF",
        "cidade": "Dourados",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    },
    "avalistas": [
      {
        "id": 1,
        "nome": "Nome do Avalista",
        "cpf_cnpj": "987.654.321-00",
        "protesto_id": 1
      }
    ]
  }
}
```

#### POST /protestos
Cria um novo protesto.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "valor_protestado": 1500.00,
  "numero_parcela": "string" (opcional),
  "data_registro": "2024-01-15",
  "protocolo": "string" (opcional),
  "status": "PROTESTADO|PAGO|ACORDO|RENEGOCIADO|DESISTENCIA|ANUENCIA|LIQUIDADO|CANCELADO|JUDICIAL" (opcional, padrão: PROTESTADO),
  "situacao": "string" (opcional),
  "data_baixa_cartorio": "2024-01-20" (opcional),
  "contrato_id": 1,
  "avalistas": [
    {
      "nome": "string",
      "cpf_cnpj": "string" (opcional)
    }
  ] (opcional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Protesto criado com sucesso",
  "data": {
    "id": 1,
    "valor_protestado": "1500.00",
    "numero_parcela": "1/12",
    "data_registro": "2024-01-15",
    "protocolo": "PROT001",
    "status": "PROTESTADO",
    "situacao": null,
    "data_baixa_cartorio": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "contrato_id": 1,
    "contrato": {
      "id": 1,
      "numero_contrato_sisbr": "CT123456",
      "numero_contrato_legado": "LEG001",
      "especie": "CARTÃO",
      "ponto_atendimento": "Agência Central",
      "created_at": "2024-01-01T00:00:00.000Z",
      "cliente_id": 1,
      "cliente": {
        "id": 1,
        "nome": "Nome do Cliente",
        "cpf_cnpj": "123.456.789-00",
        "tipo_conta": "PF",
        "cidade": "Dourados",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    },
    "avalistas": [
      {
        "id": 1,
        "nome": "Nome do Avalista",
        "cpf_cnpj": "987.654.321-00",
        "protesto_id": 1
      }
    ]
  }
}
```

#### PUT /protestos/:id
Atualiza um protesto existente.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "valor_protestado": 1500.00 (opcional),
  "numero_parcela": "string" (opcional),
  "data_registro": "2024-01-15" (opcional),
  "protocolo": "string" (opcional),
  "status": "PROTESTADO|PAGO|ACORDO|RENEGOCIADO|DESISTENCIA|ANUENCIA|LIQUIDADO|CANCELADO|JUDICIAL" (opcional),
  "situacao": "string" (opcional),
  "data_baixa_cartorio": "2024-01-20" (opcional),
  "contrato_id": 1 (opcional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Protesto atualizado com sucesso",
  "data": {
    "id": 1,
    "valor_protestado": "1500.00",
    "numero_parcela": "1/12",
    "data_registro": "2024-01-15",
    "protocolo": "PROT001",
    "status": "PAGO",
    "situacao": "Pago via cartório",
    "data_baixa_cartorio": "2024-01-20",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-02T00:00:00.000Z",
    "contrato_id": 1
  }
}
```

#### DELETE /protestos/:id
Remove um protesto.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Protesto removido com sucesso"
}
```

### Avalistas

#### GET /avalistas
Lista todos os avalistas com paginação e filtros.

**Query Parameters:**
- `page` (integer, opcional) - Número da página (padrão: 1)
- `limit` (integer, opcional) - Limite de itens por página (padrão: 10, máximo: 100)
- `search` (string, opcional) - Termo de busca
- `sort` (string, opcional) - Ordenação
- `protesto_id` (integer, opcional) - Filtrar por ID do protesto

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "pages": 10,
  "currentPage": 1,
  "hasNextPage": true,
  "hasPrevPage": false,
  "nextPage": 2,
  "prevPage": null,
  "data": [
    {
      "id": 1,
      "nome": "Nome do Avalista",
      "cpf_cnpj": "987.654.321-00",
      "protesto_id": 1,
      "protesto": {
        "id": 1,
        "valor_protestado": "1500.00",
        "numero_parcela": "1/12",
        "data_registro": "2024-01-15",
        "protocolo": "PROT001",
        "status": "PROTESTADO",
        "situacao": null,
        "data_baixa_cartorio": null,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z",
        "contrato_id": 1
      }
    }
  ]
}
```

#### GET /avalistas/:id
Obtém um avalista específico pelo ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Nome do Avalista",
    "cpf_cnpj": "987.654.321-00",
    "protesto_id": 1,
    "protesto": {
      "id": 1,
      "valor_protestado": "1500.00",
      "numero_parcela": "1/12",
      "data_registro": "2024-01-15",
      "protocolo": "PROT001",
      "status": "PROTESTADO",
      "situacao": null,
      "data_baixa_cartorio": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "contrato_id": 1
    }
  }
}
```

#### POST /avalistas
Cria um novo avalista.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nome": "string",
  "cpf_cnpj": "string" (opcional),
  "protesto_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Avalista criado com sucesso",
  "data": {
    "id": 1,
    "nome": "Nome do Avalista",
    "cpf_cnpj": "987.654.321-00",
    "protesto_id": 1
  }
}
```

#### PUT /avalistas/:id
Atualiza um avalista existente.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "nome": "string" (opcional),
  "cpf_cnpj": "string" (opcional),
  "protesto_id": 1 (opcional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Avalista atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "Novo Nome do Avalista",
    "cpf_cnpj": "111.222.333-44",
    "protesto_id": 1
  }
}
```

#### DELETE /avalistas/:id
Remove um avalista.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Avalista removido com sucesso"
}
```

## Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `400 Bad Request` - Requisição malformada ou dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Não autorizado
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro interno do servidor

## Tratamento de Erros

Todos os erros seguem o mesmo formato:

```json
{
  "success": false,
  "message": "Mensagem de erro",
  "error": {} (somente em ambiente de desenvolvimento)
}
```

## Segurança

- Todas as senhas são armazenadas com hash bcrypt
- Tokens JWT são usados para autenticação
- CORS está configurado para permitir requisições do frontend
- Helmet é usado para proteção adicional contra vulnerabilidades web

## Versionamento

A API segue o versionamento semântico: `v1.0.0`

## Suporte

Para suporte ou dúvidas, entre em contato através do email: suporte@protestos.com.br