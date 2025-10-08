// scripts/convertCSVToJSON.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

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
const cleanCpfCnpj = (cpfCnpj) => {
  if (!cpfCnpj || cpfCnpj === '' || cpfCnpj === 'NULL') return null;
  return cpfCnpj.replace(/[^\d]/g, '');
};

// Clean and format city names
const cleanCity = (city) => {
  if (!city || city === '' || city === 'NULL') return null;
  return city.trim();
};

// Function to handle BOM (Byte Order Mark) in CSV column names
const getField = (row, key) => {
  const bomKey = '\uFEFF' + key;
  if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
  if (Object.prototype.hasOwnProperty.call(row, bomKey)) return row[bomKey];
  return null;
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
        if (!getField(data, 'DEVEDOR') && !getField(data, 'AVALISTA')) {
          return;
        }
        
        // Process each row
        const processedRow = {
          devedor: getField(data, 'DEVEDOR') ? getField(data, 'DEVEDOR').trim() : null,
          avalista: getField(data, 'AVALISTA') ? getField(data, 'AVALISTA').trim() : null,
          valorProtestado: parseCurrency(getField(data, 'VALOR PROTESTADO')),
          numeroParcela: getField(data, 'NUMERO DA PARCELA') ? getField(data, 'NUMERO DA PARCELA').trim() : null,
          dataRegistro: parseBrazilianDate(getField(data, 'DATA REGISTRO')),
          pontoAtendimento: getField(data, 'PONTO ATENDIMENTO') ? getField(data, 'PONTO ATENDIMENTO').trim() : null,
          contratoSisbr: getField(data, 'CONTRATO SISBR') ? getField(data, 'CONTRATO SISBR').trim() : null,
          numeroContratoLegado: getField(data, 'NUMERO CONTRATO LEGADO') ? getField(data, 'NUMERO CONTRATO LEGADO').trim() : null,
          especie: getField(data, 'ESPECIE') ? getField(data, 'ESPECIE').trim() : null,
          cidade: cleanCity(getField(data, 'CIDADE')),
          protocolo: getField(data, 'PROTOCOLO') ? getField(data, 'PROTOCOLO').trim() : null,
          status: getField(data, 'STATUS') ? getField(data, 'STATUS').trim() : 'PROTESTADO',
          tipoConta: getField(data, 'TIPO DE CONTA') ? getField(data, 'TIPO DE CONTA').trim() : null,
          cpfCnpj: cleanCpfCnpj(getField(data, 'CPFCNPJ')),
          situacao: getField(data, 'SITUACAO') ? getField(data, 'SITUACAO').trim() : null,
          dataBaixaCartorio: parseBrazilianDate(getField(data, 'DATA DA BAIXA CARTORIO'))
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

// Main conversion function
const convertData = async () => {
  try {
    console.log('Starting CSV to JSON conversion...');
    
    // Process CSV data
    const csvData = await processCSVFile();
    
    // Save to JSON
    await saveToJson(csvData, 'protestos_migrados.json');
    
    console.log('Conversion completed successfully!');
    
  } catch (error) {
    console.error('Conversion failed:', error);
  }
};

// Run conversion if script is called directly
if (require.main === module) {
  convertData();
}

module.exports = { convertData };