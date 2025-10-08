// src/controllers/AuthController.js
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - nome
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username
 *               email:
 *                 type: string
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password (min 6 characters)
 *               nome:
 *                 type: string
 *                 description: User's full name
 *               role:
 *                 type: string
 *                 enum: [admin, operador, supervisor]
 *                 description: User's role (defaults to operador)
 *             example:
 *               username: johndoe
 *               email: john@example.com
 *               password: mypassword123
 *               nome: John Doe
 *               role: operador
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: UsuÃ¡rio criado com sucesso
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: johndoe
 *                         email:
 *                           type: string
 *                           example: john@example.com
 *                         nome:
 *                           type: string
 *                           example: John Doe
 *                         role:
 *                           type: string
 *                           example: operador
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
 *                   example: 'Campos obrigatorios ausentes: username, email, password e nome sao necessarios'
 *       500:
 *         description: Server error
 */
const register = async (req, res) => {
  try {
    const { username, email, password, nome, role } = req.body;

    // Validate required fields
    if (!username || !email || !password || !nome) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatorios ausentes: username, email, password e nome sao necessarios'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'UsuÃ¡rio ou email jÃ¡ cadastrado'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      nome,
      role: role || 'operador'
    });

    // Generate JWT token (excluding password from response)
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: 'UsuÃ¡rio criado com sucesso',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nome: user.nome,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuÃ¡rio',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               password:
 *                 type: string
 *                 description: User's password
 *             example:
 *               username: johndoe
 *               password: mypassword123
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login realizado com sucesso
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: johndoe
 *                         email:
 *                           type: string
 *                           example: john@example.com
 *                         nome:
 *                           type: string
 *                           example: John Doe
 *                         role:
 *                           type: string
 *                           example: operador
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials
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
 *                   example: Credenciais invÃ¡lidas
 *       401:
 *         description: Account deactivated
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
 *                   example: Conta desativada
 *       500:
 *         description: Server error
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username e password são obrigatórios'
      });
    }

    // Find user by username
    const user = await User.findOne({
      where: { username }
    });

    // Check if user exists and password is correct
    if (!user || !await user.comparePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Check if user is active
    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return success response
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nome: user.nome,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                     nome:
 *                       type: string
 *                       example: John Doe
 *                     role:
 *                       type: string
 *                       example: operador
 *       401:
 *         description: Unauthorized
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
 *                   example: Acesso negado. Token nÃ£o fornecido.
 *       500:
 *         description: Server error
 */
const getProfile = async (req, res) => {
  try {
    // The user is already attached to the request by the auth middleware
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil do usuÃ¡rio',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 description: User's email address
 *             example:
 *               nome: John Smith
 *               email: johnsmith@example.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Perfil atualizado com sucesso
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johnsmith@example.com
 *                     nome:
 *                       type: string
 *                       example: John Smith
 *                     role:
 *                       type: string
 *                       example: operador
 *       401:
 *         description: Unauthorized
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
 *                   example: Acesso negado. Token nÃ£o fornecido.
 *       404:
 *         description: User not found
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
 *                   example: UsuÃ¡rio nÃ£o encontrado
 *       500:
 *         description: Server error
 */
const updateProfile = async (req, res) => {
  try {
    const { nome, email } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'UsuÃ¡rio nÃ£o encontrado'
      });
    }

    // Update user
    await user.update({
      nome: nome || user.nome,
      email: email || user.email
    });

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nome: user.nome,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil do usuÃ¡rio',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: User's current password
 *               newPassword:
 *                 type: string
 *                 description: User's new password (min 6 characters)
 *             example:
 *               currentPassword: mypassword123
 *               newPassword: mynewpassword456
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: Senha alterada com sucesso
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
 *                   example: Senha atual incorreta
 *       401:
 *         description: Unauthorized
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
 *                   example: Acesso negado. Token nÃ£o fornecido.
 *       404:
 *         description: User not found
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
 *                   example: UsuÃ¡rio nÃ£o encontrado
 *       500:
 *         description: Server error
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha sÃ£o obrigatÃ³rias'
      });
    }

    // Find user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'UsuÃ¡rio nÃ£o encontrado'
      });
    }

    // Check if current password is correct
    if (!await user.comparePassword(currentPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Update password
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};


