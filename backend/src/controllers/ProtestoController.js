// src/controllers/ProtestoController.js
const { Protesto, Contrato, Cliente, Avalista } = require("../models");
const { Op } = require("sequelize");
const { Parser } = require("json2csv");
const {
  parsePaginationParams,
  buildPaginationResponse,
  parseSortParams,
  parseFilterParams,
} = require("../utils/pagination");

/**
 * Get all protestos with pagination and filtering
 * @param {Request} req
 * @param {Response} res
 */
const getProtestos = async (req, res) => {
  try {
    // Pagination parameters
    const pagination = parsePaginationParams(req.query);

    // Define allowed sort fields
    const allowedSortFields = [
      "id",
      "valor_protestado",
      "numero_parcela",
      "data_registro",
      "protocolo",
      "status",
      "situacao",
      "data_baixa_cartorio",
      "created_at",
      "updated_at",
    ];

    // Parse sort parameters
    const sort = parseSortParams(req.query, allowedSortFields) || [
      ["data_registro", "DESC"],
    ];

    // Define allowed filter fields
    const allowedFilterFields = [
      "contrato_id",
      "status",
      "protocolo",
      "numero_parcela",
      "data_registro_gte",
      "data_registro_lte",
      "valor_protestado_gte",
      "valor_protestado_lte",
      "data_baixa_cartorio_gte",
      "data_baixa_cartorio_lte",
    ];

    // Parse filter parameters
    const where = parseFilterParams(req.query, allowedFilterFields);

    // Search filter
    if (req.query.search) {
      where[Op.or] = [
        {
          "$contrato.numero_contrato_sisbr$": {
            [Op.like]: `%${req.query.search}%`,
          },
        },
        {
          "$contrato.numero_contrato_legado$": {
            [Op.like]: `%${req.query.search}%`,
          },
        },
        { "$contrato.cliente.nome$": { [Op.like]: `%${req.query.search}%` } },
        {
          "$contrato.cliente.cpf_cnpj$": { [Op.like]: `%${req.query.search}%` },
        },
        { protocolo: { [Op.like]: `%${req.query.search}%` } },
        { numero_parcela: { [Op.like]: `%${req.query.search}%` } },
        { situacao: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    // Status filter (múltiplos)
    if (req.query.statusFilter) {
      const statusArray = Array.isArray(req.query.statusFilter)
        ? req.query.statusFilter
        : req.query.statusFilter.split(",");
      where.status = { [Op.in]: statusArray };
    }

    // City filter
    if (req.query.cidade) {
      where["$contrato.cidade$"] = req.query.cidade;
    }

    // Species filter
    if (req.query.especie) {
      where["$contrato.especie$"] = req.query.especie;
    }

    // Client ID filter
    if (req.query.cliente_id) {
      where["$contrato.cliente_id$"] = req.query.cliente_id;
    }

    // Valor min/max filter
    if (req.query.valorMin) {
      where.valor_protestado = {
        ...where.valor_protestado,
        [Op.gte]: parseFloat(req.query.valorMin),
      };
    }
    if (req.query.valorMax) {
      where.valor_protestado = {
        ...where.valor_protestado,
        [Op.lte]: parseFloat(req.query.valorMax),
      };
    }

    // Data início/fim filter
    if (req.query.dataInicio) {
      where.data_registro = {
        ...where.data_registro,
        [Op.gte]: req.query.dataInicio,
      };
    }
    if (req.query.dataFim) {
      where.data_registro = {
        ...where.data_registro,
        [Op.lte]: req.query.dataFim,
      };
    }

    // Build query options
    const options = {
      limit: pagination.limit,
      offset: pagination.offset,
      order: sort,
      where,
      include: [
        {
          model: Contrato,
          as: "contrato",
          required: false,
          attributes: [
            "id",
            "numero_contrato_sisbr",
            "numero_contrato_legado",
            "especie",
            "cidade",
            "ponto_atendimento",
          ],
          include: [
            {
              model: Cliente,
              as: "cliente",
              required: false,
              attributes: ["id", "nome", "cpf_cnpj", "tipo_conta", "cidade"],
            },
          ],
        },
        {
          model: Avalista,
          as: "avalistas",
          required: false,
        },
      ],
      subQuery: false,
    };

    // Execute query
    const { count, rows } = await Protesto.findAndCountAll(options);

    // Return success response
    const response = buildPaginationResponse(count, rows, pagination);
    res.json(response);
  } catch (error) {
    console.error("Error fetching protestos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar protestos",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Get a single protesto by ID
 * @param {Request} req
 * @param {Response} res
 */
const getProtesto = async (req, res) => {
  try {
    const { id } = req.params;

    // Find protesto with associated contrato, cliente and avalistas
    const protesto = await Protesto.findByPk(id, {
      include: [
        {
          model: Contrato,
          as: "contrato",
          include: [
            {
              model: Cliente,
              as: "cliente",
            },
          ],
        },
        {
          model: Avalista,
          as: "avalistas",
        },
      ],
    });

    // Check if protesto exists
    if (!protesto) {
      return res.status(404).json({
        success: false,
        message: "Protesto não encontrado",
      });
    }

    // Return success response
    res.json({
      success: true,
      data: protesto,
    });
  } catch (error) {
    console.error("Error fetching protesto:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar protesto",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Create a new protesto
 * @param {Request} req
 * @param {Response} res
 */
const createProtesto = async (req, res) => {
  try {
    // Validate required fields
    const { valor_protestado, data_registro, contrato_id } = req.body;

    if (!valor_protestado || !data_registro || !contrato_id) {
      return res.status(400).json({
        success: false,
        message:
          "Valor protestado, data de registro e contrato são obrigatórios",
      });
    }

    // Check if contrato exists
    const contrato = await Contrato.findByPk(contrato_id);
    if (!contrato) {
      return res.status(400).json({
        success: false,
        message: "Contrato não encontrado",
      });
    }

    // Create new protesto
    const protesto = await Protesto.create({
      valor_protestado: parseFloat(valor_protestado),
      numero_parcela: req.body.numero_parcela || null,
      data_registro,
      protocolo: req.body.protocolo || null,
      status: req.body.status || "PROTESTADO",
      situacao: req.body.situacao || null,
      data_baixa_cartorio: req.body.data_baixa_cartorio || null,
      contrato_id,
    });

    // Create associated avalistas if provided
    if (req.body.avalistas && Array.isArray(req.body.avalistas)) {
      const avalistas = req.body.avalistas.map((avalista) => ({
        ...avalista,
        protesto_id: protesto.id,
      }));

      await Avalista.bulkCreate(avalistas);
    }

    // Reload protesto with associations
    const protestoCompleto = await Protesto.findByPk(protesto.id, {
      include: [
        {
          model: Contrato,
          as: "contrato",
          include: [
            {
              model: Cliente,
              as: "cliente",
            },
          ],
        },
        {
          model: Avalista,
          as: "avalistas",
        },
      ],
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: "Protesto criado com sucesso",
      data: protestoCompleto,
    });
  } catch (error) {
    console.error("Error creating protesto:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar protesto",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Update an existing protesto
 * @param {Request} req
 * @param {Response} res
 */
const updateProtesto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      valor_protestado,
      numero_parcela,
      data_registro,
      protocolo,
      status,
      situacao,
      data_baixa_cartorio,
      contrato_id,
    } = req.body;

    // Find protesto
    const protesto = await Protesto.findByPk(id);

    // Check if protesto exists
    if (!protesto) {
      return res.status(404).json({
        success: false,
        message: "Protesto não encontrado",
      });
    }

    // Check if contrato exists (if provided)
    if (contrato_id) {
      const contrato = await Contrato.findByPk(contrato_id);
      if (!contrato) {
        return res.status(400).json({
          success: false,
          message: "Contrato não encontrado",
        });
      }
    }

    // Update protesto
    await protesto.update({
      valor_protestado: valor_protestado
        ? parseFloat(valor_protestado)
        : protesto.valor_protestado,
      numero_parcela,
      data_registro,
      protocolo,
      status,
      situacao,
      data_baixa_cartorio,
      contrato_id,
    });

    // Update associated avalistas if provided
    if (req.body.avalistas && Array.isArray(req.body.avalistas)) {
      // Delete existing avalistas
      await Avalista.destroy({
        where: { protesto_id: id },
      });

      // Create new avalistas
      const avalistas = req.body.avalistas.map((avalista) => ({
        ...avalista,
        protesto_id: id,
      }));

      await Avalista.bulkCreate(avalistas);
    }

    // Reload protesto with associations
    const protestoAtualizado = await Protesto.findByPk(id, {
      include: [
        {
          model: Contrato,
          as: "contrato",
          include: [
            {
              model: Cliente,
              as: "cliente",
            },
          ],
        },
        {
          model: Avalista,
          as: "avalistas",
        },
      ],
    });

    // Return success response
    res.json({
      success: true,
      message: "Protesto atualizado com sucesso",
      data: protestoAtualizado,
    });
  } catch (error) {
    console.error("Error updating protesto:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar protesto",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Delete a protesto
 * @param {Request} req
 * @param {Response} res
 */
const deleteProtesto = async (req, res) => {
  try {
    const { id } = req.params;

    // Find protesto
    const protesto = await Protesto.findByPk(id);

    // Check if protesto exists
    if (!protesto) {
      return res.status(404).json({
        success: false,
        message: "Protesto não encontrado",
      });
    }

    // Delete associated avalistas
    await Avalista.destroy({
      where: { protesto_id: id },
    });

    // Delete protesto
    await protesto.destroy();

    // Return success response
    res.json({
      success: true,
      message: "Protesto removido com sucesso",
    });
  } catch (error) {
    console.error("Error deleting protesto:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover protesto",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Export protestos to CSV
 */
const exportProtestos = async (req, res) => {
  try {
    // Build where clause with same filters as getProtestos
    const where = {};

    // Search filter
    if (req.query.search) {
      where[Op.or] = [
        {
          "$contrato.numero_contrato_sisbr$": {
            [Op.like]: `%${req.query.search}%`,
          },
        },
        { "$contrato.cliente.nome$": { [Op.like]: `%${req.query.search}%` } },
        { protocolo: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    // Status filter
    if (req.query.statusFilter) {
      const statusArray = Array.isArray(req.query.statusFilter)
        ? req.query.statusFilter
        : req.query.statusFilter.split(",");
      where.status = { [Op.in]: statusArray };
    }

    // City filter
    if (req.query.cidade) {
      where["$contrato.cidade$"] = req.query.cidade;
    }

    // Valor min/max
    if (req.query.valorMin) {
      where.valor_protestado = {
        ...where.valor_protestado,
        [Op.gte]: parseFloat(req.query.valorMin),
      };
    }
    if (req.query.valorMax) {
      where.valor_protestado = {
        ...where.valor_protestado,
        [Op.lte]: parseFloat(req.query.valorMax),
      };
    }

    // Data range
    if (req.query.dataInicio) {
      where.data_registro = {
        ...where.data_registro,
        [Op.gte]: req.query.dataInicio,
      };
    }
    if (req.query.dataFim) {
      where.data_registro = {
        ...where.data_registro,
        [Op.lte]: req.query.dataFim,
      };
    }

    // Fetch all matching records (no pagination for export)
    const protestos = await Protesto.findAll({
      where,
      include: [
        {
          model: Contrato,
          as: "contrato",
          include: [
            {
              model: Cliente,
              as: "cliente",
            },
          ],
        },
        {
          model: Avalista,
          as: "avalistas",
        },
      ],
      order: [["data_registro", "DESC"]],
    });

    // Format data for CSV
    const csvData = protestos.map((p) => ({
      id: p.id,
      cliente: p.contrato?.cliente?.nome || "N/A",
      cpf_cnpj: p.contrato?.cliente?.cpf_cnpj || "N/A",
      contrato: p.contrato?.numero_contrato_sisbr || "N/A",
      especie: p.contrato?.especie || "N/A",
      cidade: p.contrato?.cidade || "N/A",
      valor_protestado: p.valor_protestado || 0,
      data_registro: p.data_registro || "",
      protocolo: p.protocolo || "N/A",
      status: p.status || "N/A",
      avalistas: p.avalistas?.map((a) => a.nome).join("; ") || "",
      situacao: p.situacao || "",
      data_baixa_cartorio: p.data_baixa_cartorio || "",
    }));

    // Convert to CSV
    const parser = new Parser({
      fields: [
        { label: "ID", value: "id" },
        { label: "Cliente", value: "cliente" },
        { label: "CPF/CNPJ", value: "cpf_cnpj" },
        { label: "Contrato", value: "contrato" },
        { label: "Espécie", value: "especie" },
        { label: "Cidade", value: "cidade" },
        { label: "Valor Protestado", value: "valor_protestado" },
        { label: "Data Registro", value: "data_registro" },
        { label: "Protocolo", value: "protocolo" },
        { label: "Status", value: "status" },
        { label: "Avalistas", value: "avalistas" },
        { label: "Situação", value: "situacao" },
        { label: "Data Baixa Cartório", value: "data_baixa_cartorio" },
      ],
    });

    const csv = parser.parse(csvData);

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=protestos_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    res.send("\uFEFF" + csv); // Add BOM for Excel UTF-8 support
  } catch (error) {
    console.error("Error exporting protestos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao exportar protestos",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

module.exports = {
  getProtestos,
  getProtesto,
  createProtesto,
  updateProtesto,
  deleteProtesto,
  exportProtestos,
};
