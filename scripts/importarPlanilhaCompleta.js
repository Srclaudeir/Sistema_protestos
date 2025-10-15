// scripts/importarPlanilhaCompleta.js
// Importa todos os registros do CSV oficial para o banco MySQL

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { Sequelize } = require("sequelize");
const {
  Cliente,
  Contrato,
  Protesto,
  Avalista,
} = require("../backend/src/models");

require("dotenv").config({ path: path.resolve(__dirname, "../backend/.env") });

const config = {
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Tokocla123$$",
  database: process.env.DB_NAME || "protestos_db",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  dialect: "mysql",
  logging: false,
};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
  }
);

Cliente.sequelize = sequelize;
Contrato.sequelize = sequelize;
Protesto.sequelize = sequelize;
Avalista.sequelize = sequelize;

const CSV_OPTIONS = {
  separator: ";",
  mapHeaders: ({ header }) => header.replace(/^\uFEFF/, "").trim(),
};

const normalizarTexto = (valor) => {
  if (!valor && valor !== 0) {
    return "";
  }

  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const tratarValorNulo = (valor) => {
  if (valor === null || valor === undefined) {
    return null;
  }

  const texto = normalizarTexto(valor);
  if (
    !texto ||
    texto.toUpperCase() === "NAO LANCADO" ||
    texto.toUpperCase() === "SEM" ||
    texto.toUpperCase() === "NAO INFORMADO"
  ) {
    return null;
  }

  return String(valor).trim();
};

const parseDate = (valor) => {
  const texto = tratarValorNulo(valor);
  if (!texto) {
    return null;
  }

  const match = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) {
    return null;
  }

  const dia = Number(match[1]);
  const mes = Number(match[2]) - 1;
  const ano = Number(match[3]);

  const data = new Date(ano, mes, dia);
  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return data;
};

const parseValor = (valor) => {
  if (valor === null || valor === undefined) {
    return 0;
  }

  if (typeof valor === "number" && !Number.isNaN(valor)) {
    return valor;
  }

  let texto = String(valor).trim();
  if (!texto) {
    return 0;
  }

  texto = texto.replace(/R\$/gi, "").replace(/\s/g, "");

  if (texto.includes(",") && texto.includes(".")) {
    texto = texto.replace(/\./g, "").replace(/,/g, ".");
  } else if (texto.includes(",")) {
    texto = texto.replace(/,/g, ".");
  }

  const normalizado = texto.replace(/[^0-9.-]/g, "");
  const numero = parseFloat(normalizado);

  return Number.isNaN(numero) ? 0 : numero;
};

const cleanCpfCnpj = (cpfCnpj, tipoConta = "PF") => {
  if (cpfCnpj === null || cpfCnpj === undefined) {
    return null;
  }

  let texto = String(cpfCnpj).trim();
  if (!texto) {
    return null;
  }

  let wasScientific = false;

  if (texto.includes("E+") || texto.includes("e+")) {
    wasScientific = true;
    texto = texto.replace(",", ".");
    const numero = Number(texto);
    if (!Number.isNaN(numero)) {
      texto = numero.toString();
    }
  }

  texto = texto.replace(/[^\d]/g, "");

  const targetLength = tipoConta === "PJ" ? 14 : 11;

  if (wasScientific && texto.length === targetLength && /0{4,}$/.test(texto)) {
    const trimmed = texto.replace(/0+$/, "");
    if (trimmed) {
      texto = trimmed;
    }
  }

  if (texto.length > targetLength) {
    texto = texto.slice(0, targetLength);
  }

  if (texto.length < targetLength) {
    texto = texto.padStart(targetLength, "0");
  }

  return texto.length === targetLength ? texto : null;
};

const carregarCsv = async (arquivo) => {
  const linhas = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(arquivo, { encoding: "utf8" })
      .pipe(csv(CSV_OPTIONS))
      .on("data", (row) => linhas.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  return linhas;
};

const limparTabelas = async () => {
  console.log("-> Limpando tabelas relacionadas...");
  const tabelas = ["avalistas", "protestos", "contratos", "clientes"];

  await sequelize.transaction(async (transaction) => {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { transaction });

    try {
      for (const tabela of tabelas) {
        await sequelize.query(`TRUNCATE TABLE ${tabela}`, { transaction });
      }
    } finally {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { transaction });
    }
  });

  console.log("-> Tabelas limpas com sucesso\n");
};

const importar = async () => {
  try {
    console.log("=== IMPORTAÇÃO COMPLETA DA PLANILHA CSV ===\n");
    console.log("Aviso: cada linha do CSV gera um protesto independente.\n");

    await sequelize.authenticate();
    console.log("-> Conectado ao banco\n");

    await limparTabelas();

    const csvPath = path.join(
      __dirname,
      "..",
      "PLANILHA GERAL DE PROTESTOS.csv"
    );

    if (!fs.existsSync(csvPath)) {
      throw new Error(`Arquivo CSV não encontrado: ${csvPath}`);
    }

    console.log(`-> Arquivo encontrado: ${csvPath}\n`);

    const linhas = await carregarCsv(csvPath);
    console.log(`-> Total de linhas carregadas: ${linhas.length}\n`);

    const clientesPorDocumento = new Map();
    const clientesPorNomeCidade = new Map();
    const contratosPorChave = new Map();

    let clientesCriados = 0;
    let contratosCriados = 0;
    let protestosCriados = 0;
    let avalistasCriados = 0;
    let erros = 0;

    for (let index = 0; index < linhas.length; index += 1) {
      const linhaNumero = index + 1;
      const row = linhas[index];

      if (linhaNumero % 100 === 0) {
        console.log(`... Processados: ${linhaNumero} linhas`);
      }

      try {
        const devedorNome = tratarValorNulo(row.DEVEDOR);
        const avalistaNome = tratarValorNulo(row.AVALISTA);
        const tipoConta =
          normalizarTexto(row.TIPO_CONTA).toUpperCase() === "PJ" ? "PJ" : "PF";
        const cpfCnpj = cleanCpfCnpj(row["CPF/CNPJ"], tipoConta);
        const cidade = tratarValorNulo(row.CIDADE);

        if (!devedorNome) {
          throw new Error("Nome do devedor ausente na planilha");
        }

        let cliente = null;
        const nomeKey = `${normalizarTexto(devedorNome).toUpperCase()}|${normalizarTexto(
          cidade
        ).toUpperCase()}`;

        if (cpfCnpj && clientesPorDocumento.has(cpfCnpj)) {
          cliente = clientesPorDocumento.get(cpfCnpj);
        } else if (!cpfCnpj && clientesPorNomeCidade.has(nomeKey)) {
          cliente = clientesPorNomeCidade.get(nomeKey);
        }

        if (!cliente) {
          cliente = await Cliente.create({
            nome: devedorNome,
            cpf_cnpj: cpfCnpj,
            tipo_conta: tipoConta,
            cidade,
          });
          clientesCriados += 1;

          if (cpfCnpj) {
            clientesPorDocumento.set(cpfCnpj, cliente);
          }
          clientesPorNomeCidade.set(nomeKey, cliente);
        }

        const numeroContrato = tratarValorNulo(row.NUMERO_CONTRATO_SISBR);
        const contratoKey = numeroContrato
          ? `${numeroContrato}-${cliente.id}`
          : `SEM-CONTRATO-${cliente.id}-${linhaNumero}`;
        let contrato = contratosPorChave.get(contratoKey);

        const contratoPayload = {
          numero_contrato_sisbr: numeroContrato,
          numero_contrato_legado: tratarValorNulo(row.NUMERO_CONTRATO_LEGADO),
          especie: tratarValorNulo(row.ESPECIE),
          ponto_atendimento: tratarValorNulo(row.PONTO_ATENDIMENTO),
          cidade,
          cliente_id: cliente.id,
        };

        if (contrato) {
          const updates = {};

          if (contrato.cidade !== contratoPayload.cidade) {
            updates.cidade = contratoPayload.cidade;
          }
          if (
            contrato.numero_contrato_legado !==
            contratoPayload.numero_contrato_legado
          ) {
            updates.numero_contrato_legado =
              contratoPayload.numero_contrato_legado;
          }
          if (contrato.especie !== contratoPayload.especie) {
            updates.especie = contratoPayload.especie;
          }
          if (
            contrato.ponto_atendimento !== contratoPayload.ponto_atendimento
          ) {
            updates.ponto_atendimento = contratoPayload.ponto_atendimento;
          }

          if (Object.keys(updates).length > 0) {
            await contrato.update(updates);
            Object.assign(contrato, updates);
          }
        } else {
          contrato = await Contrato.create(contratoPayload);
          contratosPorChave.set(contratoKey, contrato);
          contratosCriados += 1;
        }

        const valorProtesto = parseValor(row.VALOR_PROTESTADO);

        if (valorProtesto <= 0) {
          continue;
        }

        const protesto = await Protesto.create({
          valor_protestado: valorProtesto,
          numero_parcela: tratarValorNulo(row.NUMERO_PARCELA),
          data_registro: parseDate(row.DATA_REGISTRO),
          protocolo: tratarValorNulo(row.PROTOCOLO),
          status: tratarValorNulo(row.STATUS),
          situacao: tratarValorNulo(row.SITUACAO),
          data_baixa_cartorio: tratarValorNulo(row.DATA_BAIXA_CARTORIO),
          contrato_id: contrato.id,
        });
        protestosCriados += 1;

        if (avalistaNome) {
          await Avalista.create({
            nome: avalistaNome,
            cpf_cnpj: null,
            protesto_id: protesto.id,
          });
          avalistasCriados += 1;
        }
      } catch (erro) {
        erros += 1;
        console.log(
          `[!] Erro na linha ${linhaNumero}: ${erro.message || erro}`
        );
      }
    }

    console.log("\n=== IMPORTAÇÃO CONCLUÍDA ===\n");
    console.log(`Clientes criados:  ${clientesCriados}`);
    console.log(`Contratos criados: ${contratosCriados}`);
    console.log(`Protestos criados: ${protestosCriados}`);
    console.log(`Avalistas criados: ${avalistasCriados}`);
    if (erros > 0) {
      console.log(`Registros com erro: ${erros}`);
    }
    console.log("\nExecute: node calcularTotalProtestos.js\n");
  } catch (erro) {
    console.error("\nERRO FATAL:", erro.message || erro);
    throw erro;
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  importar().catch((erro) => {
    console.error("\nImportação interrompida.");
    process.exitCode = 1;
  });
}
