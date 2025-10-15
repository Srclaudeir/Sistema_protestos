// scripts/calcularTotalProtestos.js
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");

const config = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Tokocla123$$",
  database: "protestos_db",
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const normalizeKey = (valor, fallback = "SEM_STATUS") => {
  if (!valor && valor !== 0) {
    return fallback;
  }

  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
};

const formatStatusLabel = (valor) => {
  const key = normalizeKey(valor);

  switch (key) {
    case "PROTESTADO":
      return "PROTESTADO";
    case "AGUARDADANDO PROTESTO":
    case "AGUARDANDO PROTESTO":
    case "ESPERANDO PROTESTO":
    case "ESPERANDO_PROTESTO":
      return "AGUARDANDO PROTESTO";
    case "PAGO":
      return "PAGO";
    case "DESISTENCIA":
      return "DESISTÊNCIA";
    case "RETIRADO":
      return "RETIRADO";
    case "DEVOLVIDO":
      return "DEVOLVIDO";
    case "CANCELADO":
      return "CANCELADO";
    case "SEM_STATUS":
      return "Sem status";
    default:
      return (valor || "Sem status").toString().trim() || "Sem status";
  }
};

const parseCsvValor = (valor) => {
  if (valor === null || valor === undefined) {
    return 0;
  }

  if (typeof valor === "number" && !Number.isNaN(valor)) {
    return valor;
  }

  const raw = String(valor).trim();
  if (!raw) {
    return 0;
  }

  const normalised = raw.replace(/\./g, "").replace(/,/g, ".");
  const parsed = parseFloat(normalised);
  return Number.isNaN(parsed) ? 0 : parsed;
};

async function calcularTotal() {
  let connection;

  try {
    console.log("=== CALCULANDO TOTAL DE PROTESTOS ===\n");

    connection = await mysql.createConnection(config);

    // Total de protestos
    const [countResult] = await connection.query(
      "SELECT COUNT(*) AS total FROM protestos"
    );
    const totalProtestos = Number(countResult[0].total || 0);
    console.log(`Total de protestos no banco: ${totalProtestos}\n`);

    // Soma total dos valores
    const [sumResult] = await connection.query(
      "SELECT SUM(valor_protestado) AS total_valor FROM protestos"
    );
    const totalValor = Number(sumResult[0].total_valor || 0);

    console.log("VALOR TOTAL DOS PROTESTOS:\n");
    console.log(`   R$ ${formatCurrency(totalValor)}\n`);

    // Estatísticas por status
    console.log("POR STATUS:\n");
    const [statusResult] = await connection.query(`
      SELECT 
        COALESCE(status, 'SEM_STATUS') AS status,
        COUNT(*) AS quantidade,
        SUM(valor_protestado) AS valor_total
      FROM protestos
      GROUP BY status
      ORDER BY valor_total DESC
    `);

    statusResult.forEach((row) => {
      const status = formatStatusLabel(row.status);
      const quantidade = Number(row.quantidade || 0);
      const valor = Number(row.valor_total || 0);
      console.log(
        `   ${status}: ${quantidade} protestos - R$ ${formatCurrency(valor)}`
      );
    });

    console.log("\nESTATISTICAS GERAIS:\n");

    const valorMedio =
      totalProtestos === 0 ? 0 : totalValor / totalProtestos;
    console.log(
      `   Valor medio por protesto: R$ ${formatCurrency(valorMedio)}`
    );

    const [maxResult] = await connection.query(
      "SELECT MAX(valor_protestado) AS max_valor, MIN(valor_protestado) AS min_valor FROM protestos"
    );
    const maxValor = Number(maxResult[0].max_valor || 0);
    const minValor = Number(maxResult[0].min_valor || 0);

    console.log(
      `   Maior valor: R$ ${formatCurrency(maxValor)}`
    );
    console.log(
      `   Menor valor: R$ ${formatCurrency(minValor)}`
    );

    console.log("\nTOP 10 MAIORES PROTESTOS:\n");
    const [top10] = await connection.query(`
      SELECT 
        p.valor_protestado,
        p.status,
        c.nome AS cliente,
        ct.numero_contrato_sisbr
      FROM protestos p
      JOIN contratos ct ON p.contrato_id = ct.id
      JOIN clientes c ON ct.cliente_id = c.id
      ORDER BY p.valor_protestado DESC
      LIMIT 10
    `);

    top10.forEach((row, index) => {
      console.log(
        `   ${index + 1}. R$ ${formatCurrency(
          row.valor_protestado
        )} - ${row.cliente} (Contrato: ${row.numero_contrato_sisbr} | Status: ${formatStatusLabel(
          row.status
        )})`
      );
    });

    console.log("\n=====================================");
    console.log("VERIFICACAO COM CSV ORIGINAL:\n");

    const csvPath = path.join(__dirname, "..", "protesto2.csv");
    if (!fs.existsSync(csvPath)) {
      console.log(
        "   Arquivo protesto2.csv nao encontrado. Etapa de comparacao pulada."
      );
      console.log("=====================================\n");
      return;
    }

    const valores = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on("data", (row) => {
          if (row.VALOR_PROTESTADO !== undefined) {
            const numero = parseCsvValor(row.VALOR_PROTESTADO);
            if (numero > 0) {
              valores.push(numero);
            }
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const totalCSV = valores.reduce((sum, val) => sum + val, 0);
    console.log(`   Total no CSV: R$ ${formatCurrency(totalCSV)}`);
    console.log(`   Total no Banco: R$ ${formatCurrency(totalValor)}`);

    const diferenca = Math.abs(totalCSV - totalValor);
    const percentualDiferenca =
      totalCSV === 0 ? 0 : (diferenca / totalCSV) * 100;

    console.log(
      `   Diferenca: R$ ${formatCurrency(diferenca)} (${percentualDiferenca.toFixed(
        2
      )}%)`
    );

    if (percentualDiferenca < 0.1) {
      console.log("\n   VALORES CONFEREM! Importacao esta correta.\n");
    } else {
      console.log(
        "\n   ALERTA: Ha diferenca relevante. Revise os dados importados.\n"
      );
    }

    console.log("=====================================\n");
  } catch (error) {
    console.error("\nERRO:", error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

calcularTotal();
