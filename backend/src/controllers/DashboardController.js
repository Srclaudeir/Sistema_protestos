// src/controllers/DashboardController.js
const { Cliente, Contrato, Protesto, Avalista } = require("../models");
const { sequelize } = require("../config/database");
const { Op } = require("sequelize");

/**
 * Return aggregated information for the dashboard (counts, value totals and latest protestos).
 */
const getSummary = async (req, res) => {
  try {
    const [
      totalClientes,
      totalContratos,
      protestosAtivos,
      totalValor,
      latestProtestos,
      totalAvalistas,
      protestosPagos,
      maiorProtesto,
      menorProtesto,
    ] = await Promise.all([
      Cliente.count(),
      Contrato.count(),
      Protesto.count({ where: { status: "PROTESTADO" } }),
      Protesto.sum("valor_protestado"),
      Protesto.findAll({
        limit: 5,
        order: [["data_registro", "DESC"]],
        include: [
          {
            model: Contrato,
            as: "contrato",
            include: [
              {
                model: Cliente,
                as: "cliente",
                attributes: ["id", "nome", "cpf_cnpj"],
              },
            ],
            attributes: [
              "id",
              "numero_contrato_sisbr",
              "numero_contrato_legado",
            ],
          },
        ],
        attributes: [
          "id",
          "valor_protestado",
          "status",
          "data_registro",
          "protocolo",
        ],
      }),
      Avalista.count(),
      Protesto.count({ where: { status: "PAGO" } }),
      Protesto.findOne({
        order: [["valor_protestado", "DESC"]],
        attributes: ["valor_protestado"],
      }),
      Protesto.findOne({
        order: [["valor_protestado", "ASC"]],
        attributes: ["valor_protestado"],
      }),
    ]);

    const ticketMedio =
      totalValor && protestosAtivos ? totalValor / protestosAtivos : 0;

    res.json({
      success: true,
      data: {
        totalClientes,
        totalContratos,
        protestosAtivos,
        valorTotalProtestos: totalValor ? Number(totalValor) : 0,
        totalAvalistas,
        protestosPagos,
        ticketMedio: ticketMedio ? Number(ticketMedio) : 0,
        maiorProtesto: maiorProtesto
          ? Number(maiorProtesto.valor_protestado)
          : 0,
        menorProtesto: menorProtesto
          ? Number(menorProtesto.valor_protestado)
          : 0,
        latestProtestos: latestProtestos.map((protesto) => ({
          id: protesto.id,
          valor_protestado: protesto.valor_protestado
            ? Number(protesto.valor_protestado)
            : 0,
          status: protesto.status,
          data_registro: protesto.data_registro,
          protocolo: protesto.protocolo,
          contrato: protesto.contrato
            ? {
                id: protesto.contrato.id,
                numero_contrato_sisbr: protesto.contrato.numero_contrato_sisbr,
                numero_contrato_legado:
                  protesto.contrato.numero_contrato_legado,
              }
            : null,
          cliente:
            protesto.contrato && protesto.contrato.cliente
              ? {
                  id: protesto.contrato.cliente.id,
                  nome: protesto.contrato.cliente.nome,
                  cpf_cnpj: protesto.contrato.cliente.cpf_cnpj,
                }
              : null,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao carregar estatisticas do dashboard",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

/**
 * Return detailed statistics for charts and graphs
 */
const getDetailedStats = async (req, res) => {
  try {
    // Protestos por status
    const protestosPorStatus = await Protesto.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "quantidade"],
        [sequelize.fn("SUM", sequelize.col("valor_protestado")), "valor_total"],
      ],
      group: ["status"],
    });

    // Top 10 cidades
    const protestosPorCidade = await sequelize.query(
      `
      SELECT c.cidade, COUNT(p.id) as quantidade, SUM(p.valor_protestado) as valor_total
      FROM protestos p
      INNER JOIN contratos ct ON p.contrato_id = ct.id
      INNER JOIN contratos c ON ct.id = c.id
      WHERE c.cidade IS NOT NULL AND c.cidade != ''
      GROUP BY c.cidade
      ORDER BY quantidade DESC
      LIMIT 10
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    // Evolução mensal (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const evolucaoMensal = await sequelize.query(
      `
      SELECT 
        DATE_FORMAT(data_registro, '%Y-%m') as mes,
        COUNT(*) as quantidade,
        SUM(valor_protestado) as valor_total
      FROM protestos
      WHERE data_registro >= :dataInicio
      GROUP BY DATE_FORMAT(data_registro, '%Y-%m')
      ORDER BY mes ASC
    `,
      {
        replacements: { dataInicio: seisMesesAtras },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Top 10 maiores protestos
    const maioresProtestos = await Protesto.findAll({
      limit: 10,
      order: [["valor_protestado", "DESC"]],
      include: [
        {
          model: Contrato,
          as: "contrato",
          include: [
            {
              model: Cliente,
              as: "cliente",
              attributes: ["id", "nome"],
            },
          ],
          attributes: ["id", "numero_contrato_sisbr"],
        },
      ],
      attributes: ["id", "valor_protestado", "status", "protocolo"],
    });

    res.json({
      success: true,
      data: {
        protestosPorStatus: protestosPorStatus.map((p) => ({
          status: p.status,
          quantidade: parseInt(p.dataValues.quantidade),
          valor_total: parseFloat(p.dataValues.valor_total || 0),
        })),
        protestosPorCidade: protestosPorCidade.map((p) => ({
          cidade: p.cidade,
          quantidade: parseInt(p.quantidade),
          valor_total: parseFloat(p.valor_total || 0),
        })),
        evolucaoMensal: evolucaoMensal.map((e) => ({
          mes: e.mes,
          quantidade: parseInt(e.quantidade),
          valor_total: parseFloat(e.valor_total || 0),
        })),
        maioresProtestos: maioresProtestos.map((p) => ({
          id: p.id,
          valor_protestado: parseFloat(p.valor_protestado || 0),
          status: p.status,
          protocolo: p.protocolo,
          cliente_nome: p.contrato?.cliente?.nome || "N/A",
          numero_contrato: p.contrato?.numero_contrato_sisbr || "N/A",
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching detailed stats:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao carregar estatísticas detalhadas",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
};

module.exports = {
  getSummary,
  getDetailedStats,
};
