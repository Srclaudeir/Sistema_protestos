// src/controllers/ContratoController.js
const { Contrato, Cliente, Protesto } = require("../models");
const { Op } = require("sequelize");
const {
  parsePaginationParams,
  buildPaginationResponse,
  parseSortParams,
  parseFilterParams,
} = require("../utils/pagination");

/**
 * Get all contratos with pagination and filtering
 * @param {Request} req
 * @param {Response} res
 */
const getContratos = async (req, res) => {
  try {
    // Parse pagination parameters
    const pagination = parsePaginationParams(req.query);

    // Define allowed sort fields
    const allowedSortFields = [
      "id",
      "numero_contrato_sisbr",
      "numero_contrato_legado",
      "especie",
      "ponto_atendimento",
      "created_at",
    ];

    // Parse sort parameters
    const sort = parseSortParams(req.query, allowedSortFields) || [
      ["created_at", "DESC"],
    ];

    // Define allowed filter fields
    const allowedFilterFields = [
      "cliente_id",
      "especie",
      "ponto_atendimento",
      "numero_contrato_sisbr",
      "numero_contrato_legado",
    ];

    // Parse filter parameters
    const where = parseFilterParams(req.query, allowedFilterFields);

    // Add search filter if present
    if (req.query.search) {
      where[Op.or] = [
        { numero_contrato_sisbr: { [Op.like]: `%${req.query.search}%` } },
        { numero_contrato_legado: { [Op.like]: `%${req.query.search}%` } },
        { "$cliente.nome$": { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    // Espécie filter
    if (req.query.especie) {
      where.especie = req.query.especie;
    }

    // Cidade filter
    if (req.query.cidade) {
      where.cidade = req.query.cidade;
    }

    // Cliente filter
    if (req.query.cliente_id) {
      where.cliente_id = req.query.cliente_id;
    }

    // Build query options
    const options = {
      limit: pagination.limit,
      offset: pagination.offset,
      order: sort,
      where,
      include: [
        {
          model: Cliente,
          as: "cliente",
          required: false,
          attributes: ["id", "nome", "cpf_cnpj", "tipo_conta", "cidade"],
        },
        {
          model: Protesto,
          as: "protestos",
          required: false,
        },
      ],
      subQuery: false,
    };

    // Execute query
    const { count, rows } = await Contrato.findAndCountAll(options);

    // Build and return response
    const response = buildPaginationResponse(count, rows, pagination);
    res.json(response);
  } catch (error) {
    console.error("Error fetching contratos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar contratos",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Get a single contrato by ID
 * @param {Request} req
 * @param {Response} res
 */
const getContrato = async (req, res) => {
  try {
    const { id } = req.params;

    // Find contrato with associated cliente and protestos
    const contrato = await Contrato.findByPk(id, {
      include: [
        {
          model: Cliente,
          as: "cliente",
        },
        {
          model: Protesto,
          as: "protestos",
        },
      ],
    });

    // Check if contrato exists
    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: "Contrato não encontrado",
      });
    }

    // Return success response
    res.json({
      success: true,
      data: contrato,
    });
  } catch (error) {
    console.error("Error fetching contrato:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar contrato",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Create a new contrato
 * @param {Request} req
 * @param {Response} res
 */
const createContrato = async (req, res) => {
  try {
    // Validate required fields
    const { numero_contrato_sisbr, cliente_id } = req.body;

    if (!numero_contrato_sisbr || !cliente_id) {
      return res.status(400).json({
        success: false,
        message: "Número do contrato SISBR e cliente são obrigatórios",
      });
    }

    // Check if cliente exists
    const cliente = await Cliente.findByPk(cliente_id);
    if (!cliente) {
      return res.status(400).json({
        success: false,
        message: "Cliente não encontrado",
      });
    }

    // Create new contrato
    const contrato = await Contrato.create({
      numero_contrato_sisbr,
      numero_contrato_legado: req.body.numero_contrato_legado || null,
      especie: req.body.especie || null,
      ponto_atendimento: req.body.ponto_atendimento || null,
      cliente_id,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "Contrato criado com sucesso",
      data: contrato,
    });
  } catch (error) {
    console.error("Error creating contrato:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar contrato",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Update an existing contrato
 * @param {Request} req
 * @param {Response} res
 */
const updateContrato = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numero_contrato_sisbr,
      numero_contrato_legado,
      especie,
      ponto_atendimento,
      cliente_id,
    } = req.body;

    // Find contrato
    const contrato = await Contrato.findByPk(id);

    // Check if contrato exists
    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: "Contrato não encontrado",
      });
    }

    // Check if cliente exists (if provided)
    if (cliente_id) {
      const cliente = await Cliente.findByPk(cliente_id);
      if (!cliente) {
        return res.status(400).json({
          success: false,
          message: "Cliente não encontrado",
        });
      }
    }

    // Update contrato
    await contrato.update({
      numero_contrato_sisbr:
        numero_contrato_sisbr || contrato.numero_contrato_sisbr,
      numero_contrato_legado:
        numero_contrato_legado || contrato.numero_contrato_legado,
      especie: especie || contrato.especie,
      ponto_atendimento: ponto_atendimento || contrato.ponto_atendimento,
      cliente_id: cliente_id || contrato.cliente_id,
    });

    // Return success response
    res.json({
      success: true,
      message: "Contrato atualizado com sucesso",
      data: contrato,
    });
  } catch (error) {
    console.error("Error updating contrato:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar contrato",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Delete a contrato
 * @param {Request} req
 * @param {Response} res
 */
const deleteContrato = async (req, res) => {
  try {
    const { id } = req.params;

    // Find contrato
    const contrato = await Contrato.findByPk(id);

    // Check if contrato exists
    if (!contrato) {
      return res.status(404).json({
        success: false,
        message: "Contrato não encontrado",
      });
    }

    // Check if contrato has associated protestos
    const protestosCount = await Protesto.count({
      where: { contrato_id: id },
    });

    if (protestosCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Não é possível excluir contrato com protestos associados",
      });
    }

    // Delete contrato
    await contrato.destroy();

    // Return success response
    res.json({
      success: true,
      message: "Contrato removido com sucesso",
    });
  } catch (error) {
    console.error("Error deleting contrato:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover contrato",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

module.exports = {
  getContratos,
  getContrato,
  createContrato,
  updateContrato,
  deleteContrato,
};
