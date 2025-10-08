// src/controllers/DashboardController.js
const { Cliente, Contrato, Protesto } = require('../models');

/**
 * Return aggregated information for the dashboard (counts, value totals and latest protestos).
 */
const getSummary = async (req, res) => {
  try {
    const [totalClientes, totalContratos, protestosAtivos, totalValor, latestProtestos] = await Promise.all([
      Cliente.count(),
      Contrato.count(),
      Protesto.count({ where: { status: 'PROTESTADO' } }),
      Protesto.sum('valor_protestado'),
      Protesto.findAll({
        limit: 5,
        order: [['data_registro', 'DESC']],
        include: [
          {
            model: Contrato,
            as: 'contrato',
            include: [
              {
                model: Cliente,
                as: 'cliente',
                attributes: ['id', 'nome', 'cpf_cnpj']
              }
            ],
            attributes: ['id', 'numero_contrato_sisbr', 'numero_contrato_legado']
          }
        ],
        attributes: ['id', 'valor_protestado', 'status', 'data_registro', 'protocolo']
      })
    ]);

    res.json({
      success: true,
      data: {
        totalClientes,
        totalContratos,
        protestosAtivos,
        valorTotalProtestos: totalValor ? Number(totalValor) : 0,
        latestProtestos: latestProtestos.map((protesto) => ({
          id: protesto.id,
          valor_protestado: protesto.valor_protestado ? Number(protesto.valor_protestado) : 0,
          status: protesto.status,
          data_registro: protesto.data_registro,
          protocolo: protesto.protocolo,
          contrato: protesto.contrato
            ? {
                id: protesto.contrato.id,
                numero_contrato_sisbr: protesto.contrato.numero_contrato_sisbr,
                numero_contrato_legado: protesto.contrato.numero_contrato_legado
              }
            : null,
          cliente: protesto.contrato && protesto.contrato.cliente
            ? {
                id: protesto.contrato.cliente.id,
                nome: protesto.contrato.cliente.nome,
                cpf_cnpj: protesto.contrato.cliente.cpf_cnpj
              }
            : null
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar estatisticas do dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  getSummary
};
