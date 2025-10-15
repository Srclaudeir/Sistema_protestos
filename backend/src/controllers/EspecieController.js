// src/controllers/EspecieController.js
const { Especie } = require("../models");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");

class EspecieController {
  // Listar todas as espécies
  async getAll(req, res) {
    try {
      const { page = 1, limit = 50, search, ativo } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { nome: { [Op.like]: `%${search}%` } },
          { descricao: { [Op.like]: `%${search}%` } },
        ];
      }

      if (ativo !== undefined) {
        whereClause.ativo = ativo === "true";
      }

      const { count, rows } = await Especie.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["nome", "ASC"]],
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Erro ao buscar espécies:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  // Buscar espécie por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const especie = await Especie.findByPk(id);

      if (!especie) {
        return res.status(404).json({
          success: false,
          message: "Espécie não encontrada",
        });
      }

      res.json({
        success: true,
        data: especie,
      });
    } catch (error) {
      console.error("Erro ao buscar espécie:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  // Criar nova espécie
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const { nome, descricao, ativo = true } = req.body;

      // Verificar se já existe uma espécie com o mesmo nome
      const existingEspecie = await Especie.findOne({ where: { nome } });
      if (existingEspecie) {
        return res.status(409).json({
          success: false,
          message: "Já existe uma espécie com este nome",
        });
      }

      const especie = await Especie.create({
        nome,
        descricao,
        ativo,
      });

      res.status(201).json({
        success: true,
        message: "Espécie criada com sucesso",
        data: especie,
      });
    } catch (error) {
      console.error("Erro ao criar espécie:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  // Atualizar espécie
  async update(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const especie = await Especie.findByPk(id);
      if (!especie) {
        return res.status(404).json({
          success: false,
          message: "Espécie não encontrada",
        });
      }

      const { nome, descricao, ativo } = req.body;

      // Verificar se já existe outra espécie com o mesmo nome
      if (nome && nome !== especie.nome) {
        const existingEspecie = await Especie.findOne({
          where: {
            nome,
            id: { [Op.ne]: id },
          },
        });
        if (existingEspecie) {
          return res.status(409).json({
            success: false,
            message: "Já existe uma espécie com este nome",
          });
        }
      }

      await especie.update({
        nome: nome || especie.nome,
        descricao: descricao !== undefined ? descricao : especie.descricao,
        ativo: ativo !== undefined ? ativo : especie.ativo,
      });

      res.json({
        success: true,
        message: "Espécie atualizada com sucesso",
        data: especie,
      });
    } catch (error) {
      console.error("Erro ao atualizar espécie:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  // Deletar espécie
  async delete(req, res) {
    try {
      const { id } = req.params;
      const especie = await Especie.findByPk(id);

      if (!especie) {
        return res.status(404).json({
          success: false,
          message: "Espécie não encontrada",
        });
      }

      // Verificar se a espécie está sendo usada em contratos
      const { Contrato } = require("../models");
      const contratosCount = await Contrato.count({
        where: { especie: especie.nome },
      });

      if (contratosCount > 0) {
        return res.status(409).json({
          success: false,
          message: `Não é possível excluir esta espécie pois ela está sendo usada em ${contratosCount} contrato(s)`,
        });
      }

      await especie.destroy();

      res.json({
        success: true,
        message: "Espécie excluída com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir espécie:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
}

module.exports = new EspecieController();
