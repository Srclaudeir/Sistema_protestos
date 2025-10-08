// src/controllers/AvalistaController.js
const { Avalista, Protesto } = require('../models');
const { Op } = require('sequelize');
const { 
  parsePaginationParams, 
  buildPaginationResponse, 
  parseSortParams, 
  parseFilterParams 
} = require('../utils/pagination');

/**
 * Get all avalistas with pagination and filtering
 * @param {Request} req 
 * @param {Response} res 
 */
const getAvalistas = async (req, res) => {
  try {
    // Parse pagination parameters
    const pagination = parsePaginationParams(req.query);
    
    // Define allowed sort fields
    const allowedSortFields = ['id', 'nome', 'cpf_cnpj', 'created_at'];
    
    // Parse sort parameters
    const sort = parseSortParams(req.query, allowedSortFields) || [['nome', 'ASC']];
    
    // Define allowed filter fields
    const allowedFilterFields = ['protesto_id', 'nome', 'cpf_cnpj'];
    
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
      where,
      include: [
        {
          model: Protesto,
          as: 'protesto'
        }
      ]
    };
    
    // Execute query
    const { count, rows } = await Avalista.findAndCountAll(options);
    
    // Build and return response
    const response = buildPaginationResponse(count, rows, pagination);
    res.json(response);
  } catch (error) {
    console.error('Error fetching avalistas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar avalistas',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Get a single avalista by ID
 * @param {Request} req 
 * @param {Response} res 
 */
const getAvalista = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find avalista with associated protesto
    const avalista = await Avalista.findByPk(id, {
      include: [
        {
          model: Protesto,
          as: 'protesto'
        }
      ]
    });
    
    // Check if avalista exists
    if (!avalista) {
      return res.status(404).json({
        success: false,
        message: 'Avalista não encontrado'
      });
    }
    
    // Return success response
    res.json({
      success: true,
      data: avalista
    });
  } catch (error) {
    console.error('Error fetching avalista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar avalista',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Create a new avalista
 * @param {Request} req 
 * @param {Response} res 
 */
const createAvalista = async (req, res) => {
  try {
    // Validate required fields
    const { nome } = req.body;
    
    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório'
      });
    }
    
    // Check if protesto exists (if provided)
    if (req.body.protesto_id) {
      const protesto = await Protesto.findByPk(req.body.protesto_id);
      if (!protesto) {
        return res.status(400).json({
          success: false,
          message: 'Protesto não encontrado'
        });
      }
    }
    
    // Create new avalista
    const avalista = await Avalista.create({
      nome,
      cpf_cnpj: req.body.cpf_cnpj || null,
      protesto_id: req.body.protesto_id || null
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Avalista criado com sucesso',
      data: avalista
    });
  } catch (error) {
    console.error('Error creating avalista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar avalista',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Update an existing avalista
 * @param {Request} req 
 * @param {Response} res 
 */
const updateAvalista = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf_cnpj, protesto_id } = req.body;
    
    // Find avalista
    const avalista = await Avalista.findByPk(id);
    
    // Check if avalista exists
    if (!avalista) {
      return res.status(404).json({
        success: false,
        message: 'Avalista não encontrado'
      });
    }
    
    // Check if protesto exists (if provided)
    if (protesto_id) {
      const protesto = await Protesto.findByPk(protesto_id);
      if (!protesto) {
        return res.status(400).json({
          success: false,
          message: 'Protesto não encontrado'
        });
      }
    }
    
    // Update avalista
    await avalista.update({
      nome: nome || avalista.nome,
      cpf_cnpj: cpf_cnpj || avalista.cpf_cnpj,
      protesto_id: protesto_id || avalista.protesto_id
    });
    
    // Return success response
    res.json({
      success: true,
      message: 'Avalista atualizado com sucesso',
      data: avalista
    });
  } catch (error) {
    console.error('Error updating avalista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar avalista',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Delete an avalista
 * @param {Request} req 
 * @param {Response} res 
 */
const deleteAvalista = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find avalista
    const avalista = await Avalista.findByPk(id);
    
    // Check if avalista exists
    if (!avalista) {
      return res.status(404).json({
        success: false,
        message: 'Avalista não encontrado'
      });
    }
    
    // Delete avalista
    await avalista.destroy();
    
    // Return success response
    res.json({
      success: true,
      message: 'Avalista removido com sucesso'
    });
  } catch (error) {
    console.error('Error deleting avalista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover avalista',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getAvalistas,
  getAvalista,
  createAvalista,
  updateAvalista,
  deleteAvalista
};