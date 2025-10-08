// src/controllers/ClienteController.js
const { Cliente, Contrato } = require('../models');
const { Op } = require('sequelize');
const { 
  parsePaginationParams, 
  buildPaginationResponse, 
  parseSortParams, 
  parseFilterParams 
} = require('../utils/pagination');

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Client endpoints
 */

/**
 * @swagger
 * /api/v1/clientes:
 *   get:
 *     summary: Get all clientes with pagination and filtering
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort by field (e.g. 'nome:asc', 'created_at:desc')
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or CPF/CNPJ
 *       - in: query
 *         name: cidade
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: tipo_conta
 *         schema:
 *           type: string
 *           enum: [PF, PJ]
 *         description: Filter by account type (PF/PJ)
 *     responses:
 *       200:
 *         description: List of clientes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 pages:
 *                   type: integer
 *                   example: 10
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 hasNextPage:
 *                   type: boolean
 *                   example: true
 *                 hasPrevPage:
 *                   type: boolean
 *                   example: false
 *                 nextPage:
 *                   type: integer
 *                   example: 2
 *                 prevPage:
 *                   type: integer
 *                   example: null
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cliente'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       required:
 *         - nome
 *         - tipo_conta
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *           example: 1
 *         nome:
 *           type: string
 *           description: Client's name
 *           example: João Silva
 *         cpf_cnpj:
 *           type: string
 *           description: CPF or CNPJ number
 *           example: "123.456.789-00"
 *         tipo_conta:
 *           type: string
 *           enum: [PF, PJ]
 *           description: Account type (Pessoa Física or Pessoa Jurídica)
 *           example: PF
 *         cidade:
 *           type: string
 *           description: Client's city
 *           example: Dourados
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2024-01-01T00:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Update timestamp
 *           example: "2024-01-01T00:00:00.000Z"
 */
const getClientes = async (req, res) => {
  try {
    // Parse pagination parameters
    const pagination = parsePaginationParams(req.query);
    
    // Define allowed sort fields
    const allowedSortFields = ['id', 'nome', 'cpf_cnpj', 'tipo_conta', 'cidade', 'created_at', 'updated_at'];
    
    // Parse sort parameters
    const sort = parseSortParams(req.query, allowedSortFields) || [['nome', 'ASC']];
    
    // Define allowed filter fields
    const allowedFilterFields = ['cidade', 'tipo_conta', 'nome', 'cpf_cnpj'];
    
    // Parse filter parameters
    const where = parseFilterParams(req.query, allowedFilterFields);
    
    // Add search filter if present
    if (req.query.search) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${req.query.search}%` } },
        { cpf_cnpj: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    
    // Build query options
    const options = {
      limit: pagination.limit,
      offset: pagination.offset,
      order: sort,
      where
    };
    
    // Execute query
    const { count, rows } = await Cliente.findAndCountAll(options);
    
    // Build and return response
    const response = buildPaginationResponse(count, rows, pagination);
    res.json(response);
  } catch (error) {
    console.error('Error fetching clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar clientes',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @swagger
 * /api/v1/clientes/{id}:
 *   get:
 *     summary: Get a single cliente by ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cliente ID
 *     responses:
 *       200:
 *         description: Cliente retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Cliente não encontrado
 *       500:
 *         description: Server error
 */
const getCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find cliente with associated contratos
    const cliente = await Cliente.findByPk(id, {
      include: [
        {
          model: Contrato,
          as: 'contratos'
        }
      ]
    });
    
    // Check if cliente exists
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    // Return success response
    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    console.error('Error fetching cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @swagger
 * /api/v1/clientes:
 *   post:
 *     summary: Create a new cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - tipo_conta
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Client's name
 *                 example: Maria Silva
 *               cpf_cnpj:
 *                 type: string
 *                 description: CPF or CNPJ number
 *                 example: "123.456.789-00"
 *               tipo_conta:
 *                 type: string
 *                 enum: [PF, PJ]
 *                 description: Account type (Pessoa Física or Pessoa Jurídica)
 *                 example: PF
 *               cidade:
 *                 type: string
 *                 description: Client's city
 *                 example: Dourados
 *     responses:
 *       201:
 *         description: Cliente created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cliente criado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Nome e tipo de conta são obrigatórios
 *       500:
 *         description: Server error
 */
const createCliente = async (req, res) => {
  try {
    // Validate required fields
    const { nome, cpf_cnpj, tipo_conta, cidade } = req.body;
    
    if (!nome || !tipo_conta) {
      return res.status(400).json({
        success: false,
        message: 'Nome e tipo de conta são obrigatórios'
      });
    }
    
    // Check if CPF/CNPJ already exists
    if (cpf_cnpj) {
      const existingCliente = await Cliente.findOne({
        where: { cpf_cnpj }
      });
      
      if (existingCliente) {
        return res.status(400).json({
          success: false,
          message: 'CPF/CNPJ já cadastrado'
        });
      }
    }
    
    // Create new cliente
    const cliente = await Cliente.create({
      nome,
      cpf_cnpj: cpf_cnpj || null,
      tipo_conta,
      cidade: cidade || null
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: cliente
    });
  } catch (error) {
    console.error('Error creating cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @swagger
 * /api/v1/clientes/{id}:
 *   put:
 *     summary: Update an existing cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cliente ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Client's name
 *                 example: Maria Silva
 *               cpf_cnpj:
 *                 type: string
 *                 description: CPF or CNPJ number
 *                 example: "123.456.789-00"
 *               tipo_conta:
 *                 type: string
 *                 enum: [PF, PJ]
 *                 description: Account type (Pessoa Física or Pessoa Jurídica)
 *                 example: PF
 *               cidade:
 *                 type: string
 *                 description: Client's city
 *                 example: Dourados
 *     responses:
 *       200:
 *         description: Cliente updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cliente atualizado com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: CPF/CNPJ já cadastrado
 *       404:
 *         description: Cliente not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Cliente não encontrado
 *       500:
 *         description: Server error
 */
const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf_cnpj, tipo_conta, cidade } = req.body;
    
    // Find cliente
    const cliente = await Cliente.findByPk(id);
    
    // Check if cliente exists
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    // Check if CPF/CNPJ already exists (and it's not this cliente)
    if (cpf_cnpj && cpf_cnpj !== cliente.cpf_cnpj) {
      const existingCliente = await Cliente.findOne({
        where: { 
          cpf_cnpj,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingCliente) {
        return res.status(400).json({
          success: false,
          message: 'CPF/CNPJ já cadastrado'
        });
      }
    }
    
    // Update cliente
    await cliente.update({
      nome: nome || cliente.nome,
      cpf_cnpj: cpf_cnpj || cliente.cpf_cnpj,
      tipo_conta: tipo_conta || cliente.tipo_conta,
      cidade: cidade || cliente.cidade
    });
    
    // Return success response
    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: cliente
    });
  } catch (error) {
    console.error('Error updating cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @swagger
 * /api/v1/clientes/{id}:
 *   delete:
 *     summary: Delete a cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cliente ID
 *     responses:
 *       200:
 *         description: Cliente deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cliente removido com sucesso
 *       400:
 *         description: Cannot delete cliente with associated contracts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Não é possível excluir cliente com contratos associados
 *       404:
 *         description: Cliente not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Cliente não encontrado
 *       500:
 *         description: Server error
 */
const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find cliente
    const cliente = await Cliente.findByPk(id);
    
    // Check if cliente exists
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    // Check if cliente has associated contratos
    const contratosCount = await Contrato.count({
      where: { cliente_id: id }
    });
    
    if (contratosCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir cliente com contratos associados'
      });
    }
    
    // Delete cliente
    await cliente.destroy();
    
    // Return success response
    res.json({
      success: true,
      message: 'Cliente removido com sucesso'
    });
  } catch (error) {
    console.error('Error deleting cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente
};