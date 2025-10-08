// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware to authenticate user with JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Token não fornecido.'
      });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer token"

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // Find user by ID from token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] } // Don't include password in user object
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Usuário não encontrado.'
      });
    }

    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Conta desativada.'
      });
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado.'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.'
    });
  }
};

/**
 * Middleware to check if user has specific role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Autenticação necessária.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado. Função ${req.user.role} não tem permissão para esta operação.`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};