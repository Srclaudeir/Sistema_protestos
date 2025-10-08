// src/utils/validation.js
const Joi = require('joi');

// Validation schemas
const clienteSchema = Joi.object({
  nome: Joi.string().min(3).max(255).required().messages({
    'string.min': 'Nome deve ter pelo menos 3 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  cpf_cnpj: Joi.string().pattern(/^(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})$/).messages({
    'string.pattern.base': 'CPF/CNPJ inválido'
  }).allow(null, ''),
  tipo_conta: Joi.string().valid('PF', 'PJ').required().messages({
    'any.only': 'Tipo de conta deve ser PF ou PJ',
    'any.required': 'Tipo de conta é obrigatório'
  }),
  cidade: Joi.string().max(100).allow(null, '').messages({
    'string.max': 'Cidade deve ter no máximo 100 caracteres'
  })
});

const contratoSchema = Joi.object({
  numero_contrato_sisbr: Joi.string().max(50).allow(null, '').messages({
    'string.max': 'Número do contrato SISBR deve ter no máximo 50 caracteres'
  }),
  numero_contrato_legado: Joi.string().max(50).allow(null, '').messages({
    'string.max': 'Número do contrato legado deve ter no máximo 50 caracteres'
  }),
  especie: Joi.string().max(50).valid(
    'CARTÃO', 'VEICULO', 'PRONAMPE', 'BNDES', 'CAPITAL DE GIRO', 
    'CHEQUE ESPECIAL', 'ANTECIPAÇÃO', 'FINANCIAMENTO', 'PRONAMP'
  ).allow(null, '').messages({
    'string.max': 'Espécie deve ter no máximo 50 caracteres',
    'any.only': 'Espécie inválida'
  }),
  ponto_atendimento: Joi.string().max(100).allow(null, '').messages({
    'string.max': 'Ponto de atendimento deve ter no máximo 100 caracteres'
  }),
  cliente_id: Joi.number().integer().positive().required().messages({
    'number.integer': 'ID do cliente deve ser um número inteiro',
    'number.positive': 'ID do cliente deve ser positivo',
    'any.required': 'ID do cliente é obrigatório'
  })
});

const protestoSchema = Joi.object({
  valor_protestado: Joi.number().precision(2).positive().required().messages({
    'number.positive': 'Valor protestado deve ser positivo',
    'number.precision': 'Valor protestado deve ter no máximo 2 casas decimais',
    'any.required': 'Valor protestado é obrigatório'
  }),
  numero_parcela: Joi.string().max(20).allow(null, '').messages({
    'string.max': 'Número da parcela deve ter no máximo 20 caracteres'
  }),
  data_registro: Joi.date().iso().allow(null).messages({
    'date.iso': 'Data de registro deve estar no formato ISO (AAAA-MM-DD)'
  }),
  protocolo: Joi.string().max(50).allow(null, '').messages({
    'string.max': 'Protocolo deve ter no máximo 50 caracteres'
  }),
  status: Joi.string().max(50).valid(
    'PROTESTADO', 'PAGO', 'ACORDO', 'RENEGOCIADO', 'DESISTENCIA', 
    'ANUENCIA', 'LIQUIDADO', 'CANCELADO', 'JUDICIAL'
  ).default('PROTESTADO').messages({
    'string.max': 'Status deve ter no máximo 50 caracteres',
    'any.only': 'Status inválido'
  }),
  situacao: Joi.string().allow(null, '').messages({
  }),
  data_baixa_cartorio: Joi.date().iso().allow(null).messages({
    'date.iso': 'Data de baixa cartório deve estar no formato ISO (AAAA-MM-DD)'
  }),
  contrato_id: Joi.number().integer().positive().required().messages({
    'number.integer': 'ID do contrato deve ser um número inteiro',
    'number.positive': 'ID do contrato deve ser positivo',
    'any.required': 'ID do contrato é obrigatório'
  })
});

const avalistaSchema = Joi.object({
  nome: Joi.string().min(3).max(255).allow(null, '').messages({
    'string.min': 'Nome deve ter pelo menos 3 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres'
  }),
  cpf_cnpj: Joi.string().pattern(/^(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})$/).messages({
    'string.pattern.base': 'CPF/CNPJ inválido'
  }).allow(null, ''),
  protesto_id: Joi.number().integer().positive().required().messages({
    'number.integer': 'ID do protesto deve ser um número inteiro',
    'number.positive': 'ID do protesto deve ser positivo',
    'any.required': 'ID do protesto é obrigatório'
  })
});

// Validation function
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        details: error.details.map(detail => detail.message)
      });
    }
    
    // Update req.body with validated values
    req.body = value;
    next();
  };
};

module.exports = {
  clienteSchema,
  contratoSchema,
  protestoSchema,
  avalistaSchema,
  validate
};