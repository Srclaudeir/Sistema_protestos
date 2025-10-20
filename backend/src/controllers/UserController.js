// src/controllers/UserController.js
const { User } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

/**
 * Get all users (Admin only)
 * @param {Request} req
 * @param {Response} res
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password", "reset_token"] },
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuários",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Update user role (Admin only)
 * @param {Request} req
 * @param {Response} res
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ["admin", "supervisor", "operador", "consultor"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role inválido. Use: admin, supervisor, operador ou consultor",
      });
    }

    // Find user
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Prevent admin from changing their own role
    if (user.id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Você não pode alterar seu próprio perfil de acesso",
      });
    }

    // Update role
    await user.update({ role });

    res.json({
      success: true,
      message: "Perfil do usuário atualizado com sucesso",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nome: user.nome,
        role: user.role,
        ativo: user.ativo,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar perfil do usuário",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Toggle user status (activate/deactivate) (Admin only)
 * @param {Request} req
 * @param {Response} res
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Você não pode desativar sua própria conta",
      });
    }

    // Check if trying to deactivate the last active admin
    if (user.role === "admin" && user.ativo) {
      const activeAdminCount = await User.count({
        where: {
          role: "admin",
          ativo: true,
        },
      });

      if (activeAdminCount <= 1) {
        return res.status(403).json({
          success: false,
          message:
            "Não é possível desativar o último administrador ativo do sistema",
        });
      }
    }

    // Toggle status
    await user.update({ ativo: !user.ativo });

    res.json({
      success: true,
      message: `Usuário ${user.ativo ? "ativado" : "desativado"} com sucesso`,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nome: user.nome,
        role: user.role,
        ativo: user.ativo,
      },
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao alterar status do usuário",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Create user by admin (Admin only)
 * @param {Request} req
 * @param {Response} res
 */
const createUserByAdmin = async (req, res) => {
  try {
    const { username, email, password, nome, role } = req.body;

    // Validate required fields
    if (!username || !email || !password || !nome) {
      return res.status(400).json({
        success: false,
        message:
          "Campos obrigatórios ausentes: username, email, password e nome são necessários",
      });
    }

    // Validate role
    const validRoles = ["admin", "supervisor", "operador", "consultor"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role inválido. Use: admin, supervisor, operador ou consultor",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Usuário ou email já cadastrado",
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      nome,
      role: role || "operador",
      ativo: true,
    });

    res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nome: user.nome,
        role: user.role,
        ativo: user.ativo,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar usuário",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  createUserByAdmin,
};
