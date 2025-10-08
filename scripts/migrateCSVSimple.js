// scripts/migrateCSVSimple.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Since we don't have direct access to the database models in this environment,
// we'll create a simplified parser that converts the CSV to JSON

// Parse Brazilian date format (DD/MM/YYYY) to ISO format
const parseBrazilianDate = (dateStr) => {
  if (!dateStr || dateStr === '' || dateStr === 'NULL') return null;
  
  const cleanDate = dateStr.trim();
  
  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(cleanDate)) {
    return cleanDate;
  }
  
  // Brazilian format (DD/MM/YYYY)
  const parts = cleanDate.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
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
const cleanCpfCnpj = (cpfCnpj) => {\n  if (!cpfCnpj || cpfCnpj === '' || cpfCnpj === 'NULL') return null;\n  return cpfCnpj.replace(/[^\\d]/g, '');\n};\n\nconst getField = (row, key) => {\n  const bomKey = \uFEFF;\n  if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];\n  if (Object.prototype.hasOwnProperty.call(row, bomKey)) return row[bomKey];\n  return null;\n};

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
        
        // Process each row
        const processedRow = {
          devedor: data['DEVEDOR'] ? data['DEVEDOR'].trim() : null,
          avalista: data['AVALISTA'] ? data['AVALISTA'].trim() : null,
          valorProtestado: parseCurrency(data['VALOR PROTESTADO']),
          numeroParcela: data['NUMERO DA PARCELA'] ? data['NUMERO DA PARCELA'].trim() : null,
          dataRegistro: parseBrazilianDate(data['DATA REGISTRO']),
          pontoAtendimento: data['PONTO ATENDIMENTO'] ? data['PONTO ATENDIMENTO'].trim() : null,
          contratoSisbr: data['CONTRATO SISBR'] ? data['CONTRATO SISBR'].trim() : null,
          numeroContratoLegado: data['NUMERO CONTRATO LEGADO'] ? data['NUMERO CONTRATO LEGADO'].trim() : null,
          especie: data['ESPECIE'] ? data['ESPECIE'].trim() : null,
          cidade: data['CIDADE'] ? data['CIDADE'].trim() : null,
          protocolo: data['PROTOCOLO'] ? data['PROTOCOLO'].trim() : null,
          status: data['STATUS'] ? data['STATUS'].trim() : 'PROTESTADO',
          tipoConta: data['TIPO DE CONTA'] ? data['TIPO DE CONTA'].trim() : null,
          cpfCnpj: cleanCpfCnpj(data['CPFCNPJ']),
          situacao: data['SITUACAO'] ? data['SITUACAO'].trim() : null,
          dataBaixaCartorio: parseBrazilianDate(data['DATA DA BAIXA CARTORIO'])
        };
        
        results.push(processedRow);
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

// Save processed data to JSON file
const saveToJson = async (data, filename) => {
  const outputPath = path.resolve(__dirname, filename);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Data saved to ${outputPath}`);
};

// Main migration function
const migrateData = async () => {
  try {
    console.log('Starting CSV migration...');
    
    // Process CSV data
    const csvData = await processCSVFile();
    
    // Save to JSON
    await saveToJson(csvData, 'protestos_migrados.json');
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Run migration if script is called directly
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
