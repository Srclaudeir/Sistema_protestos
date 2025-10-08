# API Documentation - Sistema de Protestos Financeiros

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All API endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Clientes (Customers)

### Get all customers
```http
GET /api/v1/clientes
```

Query Parameters:
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search term
- `cidade` (optional) - Filter by city
- `tipo_conta` (optional) - Filter by account type (PF or PJ)

Response:
```json
{
  "success": true,
  "count": 10,
  "total": 1247,
  "pages": 125,
  "currentPage": 1,
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "cpf_cnpj": "123.456.789-00",
      "tipo_conta": "PF",
      "cidade": "Dourados",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get customer by ID
```http
GET /api/v1/clientes/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "João Silva",
    "cpf_cnpj": "123.456.789-00",
    "tipo_conta": "PF",
    "cidade": "Dourados",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "contratos": [
      {
        "id": 1,
        "numero_contrato_sisbr": "CT123456",
        "numero_contrato_legado": "LEG001",
        "especie": "CARTÃO",
        "ponto_atendimento": "Agência Central",
        "cliente_id": 1,
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Create customer
```http
POST /api/v1/clientes
```

Request Body:
```json
{
  "nome": "João Silva",
  "cpf_cnpj": "123.456.789-00",
  "tipo_conta": "PF",
  "cidade": "Dourados"
}
```

Response:
```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "cpf_cnpj": "123.456.789-00",
    "tipo_conta": "PF",
    "cidade": "Dourados",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update customer
```http
PUT /api/v1/clientes/:id
```

Request Body:
```json
{
  "nome": "João Silva",
  "cpf_cnpj": "123.456.789-00",
  "tipo_conta": "PF",
  "cidade": "Dourados"
}
```

Response:
```json
{
  "success": true,
  "message": "Cliente atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "João Silva Atualizado",
    "cpf_cnpj": "123.456.789-00",
    "tipo_conta": "PF",
    "cidade": "Dourados",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:45:00.000Z"
  }
}
```

### Delete customer
```http
DELETE /api/v1/clientes/:id
```

Response:
```json
{
  "success": true,
  "message": "Cliente removido com sucesso"
}
```

## Contratos (Contracts)

### Get all contracts
```http
GET /api/v1/contratos
```

Query Parameters:
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search term (contract numbers)
- `especie` (optional) - Filter by type (CARTÃO, VEICULO, etc.)
- `cliente_id` (optional) - Filter by customer

Response:
```json
{
  "success": true,
  "count": 10,
  "total": 892,
  "pages": 90,
  "currentPage": 1,
  "data": [
    {
      "id": 1,
      "numero_contrato_sisbr": "CT123456",
      "numero_contrato_legado": "LEG001",
      "especie": "CARTÃO",
      "ponto_atendimento": "Agência Central",
      "cliente_id": 1,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get contract by ID
```http
GET /api/v1/contratos/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "numero_contrato_sisbr": "CT123456",
    "numero_contrato_legado": "LEG001",
    "especie": "CARTÃO",
    "ponto_atendimento": "Agência Central",
    "cliente_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "cliente": {
      "id": 1,
      "nome": "João Silva",
      "cpf_cnpj": "123.456.789-00",
      "tipo_conta": "PF",
      "cidade": "Dourados"
    },
    "protestos": [
      {
        "id": 1,
        "valor_protestado": 1500.00,
        "numero_parcela": "1/12",
        "data_registro": "2024-01-15",
        "protocolo": "PROT001",
        "status": "PROTESTADO",
        "situacao": "Descrição da situação...",
        "data_baixa_cartorio": null,
        "contrato_id": 1,
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Create contract
```http
POST /api/v1/contratos
```

Request Body:
```json
{
  "numero_contrato_sisbr": "CT123456",
  "numero_contrato_legado": "LEG001",
  "especie": "CARTÃO",
  "ponto_atendimento": "Agência Central",
  "cliente_id": 1
}
```

Response:
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
    "cliente_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update contract
```http
PUT /api/v1/contratos/:id
```

Request Body:
```json
{
  "numero_contrato_sisbr": "CT123456",
  "numero_contrato_legado": "LEG001",
  "especie": "CARTÃO",
  "ponto_atendimento": "Agência Central",
  "cliente_id": 1
}
```

Response:
```json
{
  "success": true,
  "message": "Contrato atualizado com sucesso",
  "data": {
    "id": 1,
    "numero_contrato_sisbr": "CT123456",
    "numero_contrato_legado": "LEG001",
    "especie": "CARTÃO",
    "ponto_atendimento": "Agência Central",
    "cliente_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Delete contract
```http
DELETE /api/v1/contratos/:id
```

Response:
```json
{
  "success": true,
  "message": "Contrato removido com sucesso"
}
```

## Protestos (Protests)

### Get all protests
```http
GET /api/v1/protestos
```

Query Parameters:
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search term
- `status` (optional) - Filter by status (PROTESTADO, PAGO, ACORDO, etc.)
- `cliente_id` (optional) - Filter by customer
- `contrato_id` (optional) - Filter by contract
- `data_inicio` (optional) - Filter by start date (YYYY-MM-DD)
- `data_fim` (optional) - Filter by end date (YYYY-MM-DD)
- `valor_min` (optional) - Filter by minimum value
- `valor_max` (optional) - Filter by maximum value

Response:
```json
{
  "success": true,
  "count": 10,
  "total": 1247,
  "pages": 125,
  "currentPage": 1,
  "data": [
    {
      "id": 1,
      "valor_protestado": 1500.00,
      "numero_parcela": "1/12",
      "data_registro": "2024-01-15",
      "protocolo": "PROT001",
      "status": "PROTESTADO",
      "situacao": "Descrição da situação...",
      "data_baixa_cartorio": null,
      "contrato_id": 1,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get protest by ID
```http
GET /api/v1/protestos/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "valor_protestado": 1500.00,
    "numero_parcela": "1/12",
    "data_registro": "2024-01-15",
    "protocolo": "PROT001",
    "status": "PROTESTADO",
    "situacao": "Descrição da situação...",
    "data_baixa_cartorio": null,
    "contrato_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "contrato": {
      "id": 1,
      "numero_contrato_sisbr": "CT123456",
      "numero_contrato_legado": "LEG001",
      "especie": "CARTÃO",
      "ponto_atendimento": "Agência Central",
      "cliente_id": 1,
      "created_at": "2024-01-15T10:30:00.000Z",
      "cliente": {
        "id": 1,
        "nome": "João Silva",
        "cpf_cnpj": "123.456.789-00",
        "tipo_conta": "PF",
        "cidade": "Dourados"
      }
    },
    "avalistas": [
      {
        "id": 1,
        "nome": "Carlos Oliveira",
        "cpf_cnpj": "111.222.333-44",
        "protesto_id": 1
      }
    ]
  }
}
```

### Create protest
```http
POST /api/v1/protestos
```

Request Body:
```json
{
  "valor_protestado": 1500.00,
  "numero_parcela": "1/12",
  "data_registro": "2024-01-15",
  "protocolo": "PROT001",
  "status": "PROTESTADO",
  "situacao": "Descrição da situação...",
  "contrato_id": 1
}
```

Response:
```json
{
  "success": true,
  "message": "Protesto criado com sucesso",
  "data": {
    "id": 1,
    "valor_protestado": 1500.00,
    "numero_parcela": "1/12",
    "data_registro": "2024-01-15",
    "protocolo": "PROT001",
    "status": "PROTESTADO",
    "situacao": "Descrição da situação...",
    "data_baixa_cartorio": null,
    "contrato_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update protest
```http
PUT /api/v1/protestos/:id
```

Request Body:
```json
{
  "valor_protestado": 1500.00,
  "numero_parcela": "1/12",
  "data_registro": "2024-01-15",
  "protocolo": "PROT001",
  "status": "PROTESTADO",
  "situacao": "Descrição da situação...",
  "contrato_id": 1
}
```

Response:
```json
{
  "success": true,
  "message": "Protesto atualizado com sucesso",
  "data": {
    "id": 1,
    "valor_protestado": 1500.00,
    "numero_parcela": "1/12",
    "data_registro": "2024-01-15",
    "protocolo": "PROT001",
    "status": "PROTESTADO",
    "situacao": "Descrição da situação...",
    "data_baixa_cartorio": null,
    "contrato_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:45:00.000Z"
  }
}
```

### Delete protest
```http
DELETE /api/v1/protestos/:id
```

Response:
```json
{
  "success": true,
  "message": "Protesto removido com sucesso"
}
```

## Avalistas (Co-makers)

### Get all co-makers
```http
GET /api/v1/avalistas
```

Query Parameters:
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search term (name or CPF/CNPJ)
- `protesto_id` (optional) - Filter by protest

Response:
```json
{
  "success": true,
  "count": 10,
  "total": 342,
  "pages": 35,
  "currentPage": 1,
  "data": [
    {
      "id": 1,
      "nome": "Carlos Oliveira",
      "cpf_cnpj": "111.222.333-44",
      "protesto_id": 1
    }
  ]
}
```

### Get co-maker by ID
```http
GET /api/v1/avalistas/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Carlos Oliveira",
    "cpf_cnpj": "111.222.333-44",
    "protesto_id": 1
  }
}
```

### Create co-maker
```http
POST /api/v1/avalistas
```

Request Body:
```json
{
  "nome": "Carlos Oliveira",
  "cpf_cnpj": "111.222.333-44",
  "protesto_id": 1
}
```

Response:
```json
{
  "success": true,
  "message": "Avalista criado com sucesso",
  "data": {
    "id": 1,
    "nome": "Carlos Oliveira",
    "cpf_cnpj": "111.222.333-44",
    "protesto_id": 1
  }
}
```

### Update co-maker
```http
PUT /api/v1/avalistas/:id
```

Request Body:
```json
{
  "nome": "Carlos Oliveira",
  "cpf_cnpj": "111.222.333-44",
  "protesto_id": 1
}
```

Response:
```json
{
  "success": true,
  "message": "Avalista atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "Carlos Oliveira Atualizado",
    "cpf_cnpj": "111.222.333-44",
    "protesto_id": 1
  }
}
```

### Delete co-maker
```http
DELETE /api/v1/avalistas/:id
```

Response:
```json
{
  "success": true,
  "message": "Avalista removido com sucesso"
}
```

## Error Handling

All API responses follow the same structure:

Success Response:
```json
{
  "success": true,
  "message": "Description of the action performed",
  "data": { /* Optional data */ }
}
```

Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "error": { /* Optional error details (only in development) */ }
}
```

Status codes:
- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `500` Internal Server Error