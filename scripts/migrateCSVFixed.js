// scripts/migrateCSVFixed.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Cliente, Contrato, Protesto, Avalista } = require('../backend/src/models');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

// Database connection
const { sequelize } = require('../backend/src/config/database');

// Map status values from CSV to database values
const statusMap = {
  'PROTESTADO': 'PROTESTADO',
  'PAGO': 'PAGO',
  'ACORDO': 'ACORDO',
  'RENEGOCIADO': 'RENEGOCIADO',
  'DESISTENCIA': 'DESISTENCIA',
  'ANUENCIA': 'ANUENCIA',
  'LIQUIDADO': 'LIQUIDADO',
  'CANCELADO': 'CANCELADO',
  'JUDICIAL': 'JUDICIAL'
};

// Parse Brazilian date format (DD/MM/YYYY) to JavaScript Date
const parseBrazilianDate = (dateStr) => {
  if (!dateStr || dateStr === '' || dateStr === 'NULL') return null;
  
  // Handle different date formats
  const cleanDate = dateStr.trim();
  
  // Check if it's already in ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(cleanDate)) {
    return new Date(cleanDate);
  }
  
  // Handle Brazilian format (DD/MM/YYYY)
  const parts = cleanDate.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const year = parseInt(parts[2], 10);
    
    // Validate date components
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= 2100) {
      return new Date(year, month, day);
    }
  }
  
  return null;
};

// Parse Brazilian currency format to float
const parseCurrency = (currencyStr) => {
  if (!currencyStr || currencyStr === '' || currencyStr === 'NULL') return null;
  
  // Remove currency symbols and formatting
  const cleanValue = currencyStr
    .replace('R$', '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
    
  const value = parseFloat(cleanValue);
  return isNaN(value) ? null : value;
};

// Clean CPF/CNPJ by removing formatting
const cleanCpfCnpj = (cpfCnpj) => {
  if (!cpfCnpj || cpfCnpj === '' || cpfCnpj === 'NULL') return null;
  return cpfCnpj.replace(/[^\d]/g, '');
};

// Clean and format city names
const cleanCity = (city) => {
  if (!city || city === '' || city === 'NULL') return null;
  return city.trim();
};

// Process protesto2.csv file
const processCSVFile = async () => {
  const results = [];
  
  console.log('Starting CSV processing...');
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.resolve(__dirname, '../protesto2.csv'))
      .pipe(csv({
        separator: ';'
      }))
      .on('data', (data) => {
        // Skip empty rows
        if (!data['DEVEDOR'] && !data['AVALISTA']) {
          return;
        }
        results.push(data);
      })
      .on('end', () => {
        console.log(`Processed ${results.length} rows from CSV`);
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Main migration function
const migrateData = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Process CSV data
    const csvData = await processCSVFile();
    
    console.log('Starting data migration...');
    
    // Track statistics
    let clienteCount = 0;
    let contratoCount = 0;
    let protestoCount = 0;
    let avalistaCount = 0;
    
    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      
      if (i % 100 === 0) {
        console.log(`Processing row ${i}/${csvData.length}...`);
      }
      
      try {
        // 1. Create Cliente (DEVEDOR) - Allow duplicates by removing CPF/CNPJ check
        let cliente = null;
        if (row['DEVEDOR']) {
          const cpfCnpj = cleanCpfCnpj(row['CPFCNPJ']);
          const cidade = cleanCity(row['CIDADE']);
          
          // Always create a new cliente, even if one with the same CPF/CNPJ exists
          cliente = await Cliente.create({
            nome: row['DEVEDOR'].trim(),
            cpf_cnpj: cpfCnpj,
            tipo_conta: row['TIPO DE CONTA'] === 'PJ' ? 'PJ' : 'PF',
            cidade: cidade
          });
          clienteCount++;
        }
        
        // 2. Create Contrato
        let contrato = null;
        if (cliente && row['CONTRATO SISBR']) {
          contrato = await Contrato.create({
            numero_contrato_sisbr: row['CONTRATO SISBR'].trim(),
            numero_contrato_legado: row['NUMERO CONTRATO LEGADO'] ? row['NUMERO CONTRATO LEGADO'].trim() : null,
            especie: row['ESPECIE'] ? row['ESPECIE'].trim() : null,
            ponto_atendimento: row['PONTO ATENDIMENTO'] ? row['PONTO ATENDIMENTO'].trim() : null,
            cliente_id: cliente.id
          });
          contratoCount++;
        }
        
        // 3. Create Protesto
        let protesto = null;
        if (contrato && row['VALOR PROTESTADO']) {
          const valorProtestado = parseCurrency(row['VALOR PROTESTADO']);
          
          if (valorProtestado !== null && valorProtestado > 0) {
            protesto = await Protesto.create({
              valor_protestado: valorProtestado,
              numero_parcela: row['NUMERO DA PARCELA'] ? row['NUMERO DA PARCELA'].trim() : null,
              data_registro: parseBrazilianDate(row['DATA REGISTRO']),
              protocolo: row['PROTOCOLO'] ? row['PROTOCOLO'].trim() : null,
              status: row['STATUS'] && statusMap[row['STATUS'].toUpperCase()] ? 
                      statusMap[row['STATUS'].toUpperCase()] : 'PROTESTADO',
              situacao: row['SITUACAO'] ? row['SITUACAO'].trim() : null,
              data_baixa_cartorio: parseBrazilianDate(row['DATA DA BAIXA CARTORIO']),
              contrato_id: contrato.id
            });
            protestoCount++;
          }
        }
        
        // 4. Create Avalista
        if (protesto && row['AVALISTA']) {
          const cpfCnpj = cleanCpfCnpj(row['CPFCNPJ']);
          
          const avalista = await Avalista.create({
            nome: row['AVALISTA'].trim(),
            cpf_cnpj: cpfCnpj,
            protesto_id: protesto.id
          });
          avalistaCount++;
        }
        
      } catch (rowError) {
        console.error(`Error processing row ${i + 1}:`, rowError.message);
        // Continue processing other rows
      }
    }
    
    console.log('Migration completed!');
    console.log(`Statistics:
      - Clientes created: ${clienteCount}
      - Contratos created: ${contratoCount}
      - Protestos created: ${protestoCount}
      - Avalistas created: ${avalistaCount}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

// Run migration if script is called directly
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };