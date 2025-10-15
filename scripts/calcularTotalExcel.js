// scripts/calcularTotalExcel.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const csvFile = path.join(
  __dirname,
  "..",
  "PLANILHA GERAL DE PROTESTOS.csv"
);

const tratarValorNulo = (valor) => {
  if (valor === null || valor === undefined) {
    return null;
  }

  const texto = String(valor).trim();
  if (!texto) {
    return null;
  }

  const normalizado = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  if (
    normalizado === "NAO LANCADO" ||
    normalizado === "SEM" ||
    normalizado === "NAO INFORMADO"
  ) {
    return null;
  }

  return texto;
};

const parseValor = (valor) => {
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

  let sanitized = raw.replace(/R\$/gi, "").replace(/\s/g, "");
  if (sanitized.includes(",") && sanitized.includes(".")) {
    sanitized = sanitized.replace(/\./g, "").replace(/,/g, ".");
  } else if (sanitized.includes(",")) {
    sanitized = sanitized.replace(/,/g, ".");
  }

  const normalized = sanitized.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(normalized);

  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatCurrency = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const normalizeKey = (valor, fallback) => {
  if (!valor) {
    return fallback;
  }

  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
};

const formatStatusLabel = (valor) => {
  const normalized = normalizeKey(valor, "SEM_STATUS");

  switch (normalized) {
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
    default:
      return (valor || "Sem status").trim() || "Sem status";
  }
};

const resultados = {
  totalLinhas: 0,
  totalCentavos: 0,
  registrosComValor: 0,
  registrosSemValor: 0,
  maiorCentavos: 0,
  menorCentavos: Number.POSITIVE_INFINITY,
  amostras: [],
  status: new Map(),
  detalhes: [],
};

console.log("=== CALCULANDO TOTAL DA PLANILHA CSV ===\n");

if (!fs.existsSync(csvFile)) {
  console.error("ERRO: Arquivo PLANILHA GERAL DE PROTESTOS.csv não encontrado.");
  process.exit(1);
}

fs.createReadStream(csvFile, { encoding: "utf8" })
  .pipe(
    csv({
      separator: ";",
      mapHeaders: ({ header }) => header.replace(/^\uFEFF/, "").trim(),
    })
  )
  .on("data", (row) => {
    resultados.totalLinhas += 1;
    const linhaAtual = resultados.totalLinhas;
    if (resultados.amostras.length < 10) {
      resultados.amostras.push(row);
    }

    const valor = parseValor(row.VALOR_PROTESTADO);
    const statusOriginal = (row.STATUS || "").trim();
    let valorCentavos = 0;

    if (valor > 0) {
      valorCentavos = Math.round(valor * 100);
      resultados.totalCentavos += valorCentavos;
      resultados.registrosComValor += 1;

      if (valorCentavos > resultados.maiorCentavos) {
        resultados.maiorCentavos = valorCentavos;
      }
      if (valorCentavos < resultados.menorCentavos) {
        resultados.menorCentavos = valorCentavos;
      }

      const devedor =
        row.DEVEDOR || row["DEVEDOR"] || row["﻿DEVEDOR"] || "Sem nome";

      resultados.detalhes.push({
        linha: linhaAtual,
        valor,
        valorCentavos,
        devedor,
        contrato: tratarValorNulo(row.NUMERO_CONTRATO_SISBR),
        protocolo: tratarValorNulo(row.PROTOCOLO),
        status: formatStatusLabel(statusOriginal),
      });
    } else {
      resultados.registrosSemValor += 1;
    }

    const statusKey = normalizeKey(statusOriginal, "SEM_STATUS");

    if (!resultados.status.has(statusKey)) {
      resultados.status.set(statusKey, {
        label: formatStatusLabel(statusOriginal),
        quantidade: 0,
        valorCentavos: 0,
      });
    }

    const statusData = resultados.status.get(statusKey);
    statusData.quantidade += 1;
    statusData.valorCentavos += valorCentavos;
  })
  .on("end", () => {
    console.log(`Total de linhas no CSV: ${resultados.totalLinhas}\n`);

    console.log("RESULTADO DA PLANILHA:\n");
    console.log(`   Total de linhas: ${resultados.totalLinhas}`);
    console.log(`   Com valor: ${resultados.registrosComValor}`);
    console.log(`   Sem valor: ${resultados.registrosSemValor}`);
    const totalValor = resultados.totalCentavos / 100;
    console.log(`\n   VALOR TOTAL: R$ ${formatCurrency(totalValor)}\n`);

    console.log("PRIMEIROS 10 REGISTROS:\n");
    resultados.amostras.forEach((row, index) => {
      const valor = parseValor(row.VALOR_PROTESTADO);
      const devedor = row.DEVEDOR || row["DEVEDOR"] || "";
      console.log(
        `   ${index + 1}. R$ ${formatCurrency(valor)} - ${devedor || "Sem nome"}`
      );
    });

    console.log("\nESTATISTICAS:\n");
    if (resultados.registrosComValor > 0) {
      const valorMedio =
        resultados.totalCentavos / resultados.registrosComValor / 100;
      const maiorValor = resultados.maiorCentavos / 100;
      const menorValor =
        resultados.menorCentavos === Number.POSITIVE_INFINITY
          ? 0
          : resultados.menorCentavos / 100;

      console.log(`   Valor médio: R$ ${formatCurrency(valorMedio)}`);
      console.log(`   Maior valor: R$ ${formatCurrency(maiorValor)}`);
      console.log(`   Menor valor: R$ ${formatCurrency(menorValor)}`);
    } else {
      console.log("   Nenhum registro com valor positivo encontrado.");
    }

    console.log("\nPOR STATUS:\n");
    Array.from(resultados.status.values())
      .sort((a, b) => b.valorCentavos - a.valorCentavos)
      .forEach((item) => {
        console.log(
          `   ${item.label || "Sem status"}: ${item.quantidade} registros - R$ ${formatCurrency(
            item.valorCentavos / 100
          )}`
        );
      });

    console.log("\nTOP 10 MAIORES PROTESTOS:\n");
    resultados.detalhes
      .sort((a, b) => b.valorCentavos - a.valorCentavos)
      .slice(0, 10)
      .forEach((item, index) => {
        console.log(
          `   ${index + 1}. R$ ${formatCurrency(
            item.valorCentavos / 100
          )} - ${item.devedor} (Contrato: ${
            item.contrato || "Sem contrato"
          } | Protocolo: ${item.protocolo || "Sem protocolo"})`
        );
      });

    console.log("\n=====================================\n");
  })
  .on("error", (error) => {
    console.error("ERRO ao ler CSV:", error.message);
    process.exit(1);
  });
