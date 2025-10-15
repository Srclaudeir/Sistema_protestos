// src/routes/especie.routes.js
const express = require("express");
const router = express.Router();
const especieController = require("../controllers/EspecieController");
const auth = require("../middleware/auth");
const { body } = require("express-validator");

// Middleware de autenticação para todas as rotas
router.use(auth.authenticate);

// Validações
const especieValidation = [
  body("nome")
    .notEmpty()
    .withMessage("Nome é obrigatório")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve ter entre 2 e 100 caracteres"),
  body("descricao")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Descrição deve ter no máximo 500 caracteres"),
  body("ativo")
    .optional()
    .isBoolean()
    .withMessage("Ativo deve ser um valor booleano"),
];

// Rotas
router.get("/", especieController.getAll);
router.get("/:id", especieController.getById);
router.post("/", especieValidation, especieController.create);
router.put("/:id", especieValidation, especieController.update);
router.delete("/:id", especieController.delete);

module.exports = router;
