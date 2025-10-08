// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Gestão de Protestos Financeiros - API',
      version: '1.0.0',
      description: 'API REST para o sistema de gestão de protestos financeiros',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html'
      },
      contact: {
        name: 'Sistema Protestos',
        url: 'https://sistemaprotestos.com.br',
        email: 'suporte@sistemaprotestos.com.br'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento'
      },
      {
        url: 'https://api.sistemaprotestos.com.br',
        description: 'Servidor de produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    }
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ] // files containing annotations for the OpenAPI spec
};

const specs = swaggerJsdoc(options);

module.exports = specs;