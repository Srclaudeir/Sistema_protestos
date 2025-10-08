// scripts/importMigratedData.js
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Load environment variables
const toIsoDate = (value) => {
  if (!value && value !== 0) return null;
  const text = String(value).trim();
  if (!text) return null;

  const isoMatch = /^\d{4}-\d{2}-\d{2}$/;
  if (isoMatch.test(text)) {
    return text;
  }

  const brazilMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = text.match(brazilMatch);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  return null;
};
// Database configuration for checking existence
const adminSequelize = new Sequelize(
  'mysql', // Connect to mysql database first
  process.env.DB_USER || 'protestos_user',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

// Database configuration for the actual application
const sequelize = new Sequelize(
  process.env.DB_NAME || 'protestos_db',
  process.env.DB_USER || 'protestos_user',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false // Set to console.log for debugging
  }
);

// Define models
const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cpf_cnpj: {
    type: DataTypes.STRING(18),
    unique: true
  },
  tipo_conta: {
    type: DataTypes.ENUM('PF', 'PJ')
  },
  cidade: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'clientes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

const Contrato = sequelize.define('Contrato', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_contrato_sisbr: {
    type: DataTypes.STRING(50)
  },
  numero_contrato_legado: {
    type: DataTypes.STRING(50)
  },
  especie: {
    type: DataTypes.STRING(50)
  },
  ponto_atendimento: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'contratos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

const Protesto = sequelize.define('Protesto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  valor_protestado: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  numero_parcela: {
    type: DataTypes.STRING(20)
  },
  data_registro: {
    type: DataTypes.DATEONLY
  },
  protocolo: {
    type: DataTypes.STRING(50)
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'PROTESTADO'
  },
  situacao: {
    type: DataTypes.TEXT
  },
  data_baixa_cartorio: {
    type: DataTypes.DATEONLY
  }
}, {
  tableName: 'protestos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

const Avalista = sequelize.define('Avalista', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255)
  },
  cpf_cnpj: {
    type: DataTypes.STRING(18)
  }
}, {
  tableName: 'avalistas',
  timestamps: false,
  underscored: true
});

// Define relationships
Cliente.hasMany(Contrato, {
  foreignKey: 'cliente_id',
  as: 'contratos'
});

Contrato.belongsTo(Cliente, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});

Contrato.hasMany(Protesto, {
  foreignKey: 'contrato_id',
  as: 'protestos'
});

Protesto.belongsTo(Contrato, {
  foreignKey: 'contrato_id',
  as: 'contrato'
});

Protesto.hasMany(Avalista, {
  foreignKey: 'protesto_id',
  as: 'avalistas'
});

Avalista.belongsTo(Protesto, {
  foreignKey: 'protesto_id',
  as: 'protesto'
});

// Import data function
const importData = async () => {
  try {
    // Create database if it doesn't exist
    console.log('Checking if database exists...');
    try {
      await adminSequelize.authenticate();
      console.log('Connected to MySQL server.');
      
      // Create database if it doesn't exist
      const dbName = process.env.DB_NAME || 'protestos_db';
      await adminSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      console.log(`Database '${dbName}' ensured to exist.`);
      
      await adminSequelize.close();
    } catch (error) {
      console.error('Error creating database:', error.message);
      // Continue anyway as the main connection might work
    }

    // Test database connection
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');

    // Sync models with database (create tables if they don't exist)
    console.log('Syncing models with database...');
    await sequelize.sync({ alter: true });
    console.log('Models synced successfully.');

    // Read the migrated data
    const dataPath = path.resolve(__dirname, 'protestos_migrados.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const protestosData = JSON.parse(rawData);

    console.log(`Found ${protestosData.length} records to import.`);

    // Track statistics
    let importedClientes = 0;
    let importedContratos = 0;
    let importedProtestos = 0;
    let importedAvalistas = 0;
    
    // Maps to avoid duplicates
    const clientesMap = new Map();
    const contratosMap = new Map();

    // Process each record
    for (let i = 0; i < protestosData.length; i++) {
      const record = protestosData[i];
      
      if (i % 100 === 0) {
        console.log(`Processing record ${i + 1}/${protestosData.length}...`);
      }

      try {
        // 1. Create or find Cliente (devedor or avalista if devedor is empty)
        let cliente = null;
        let clienteNome = record.devedor || record.avalista;
        let clienteTipoConta = record.tipoConta;
        
        if (clienteNome) {
          const clienteKey = `${clienteNome}-${record.cpfCnpj}`;
          
          if (clientesMap.has(clienteKey)) {
            cliente = clientesMap.get(clienteKey);
          } else {
            // Check if cliente already exists in database
            let existingCliente = null;
            if (record.cpfCnpj) {
              existingCliente = await Cliente.findOne({
                where: { cpf_cnpj: record.cpfCnpj }
              });
            }
            
            if (!existingCliente) {
              cliente = await Cliente.create({
                nome: clienteNome,
                cpf_cnpj: record.cpfCnpj,
                tipo_conta: clienteTipoConta,
                cidade: record.cidade
              });
              importedClientes++;
            } else {
              cliente = existingCliente;
            }
            
            clientesMap.set(clienteKey, cliente);
          }
        }

        // 2. Create or find Contrato
        let contrato = null;
        if (cliente && record.contratoSisbr) {
          const contratoKey = `${record.contratoSisbr}-${cliente.id}`;
          
          if (contratosMap.has(contratoKey)) {
            contrato = contratosMap.get(contratoKey);
          } else {
            // Check if contrato already exists in database
            const existingContrato = await Contrato.findOne({
              where: { 
                numero_contrato_sisbr: record.contratoSisbr,
                cliente_id: cliente.id
              }
            });
            
            if (!existingContrato) {
              contrato = await Contrato.create({
                numero_contrato_sisbr: record.contratoSisbr,
                numero_contrato_legado: record.numeroContratoLegado,
                especie: record.especie,
                ponto_atendimento: record.pontoAtendimento,
                cliente_id: cliente.id
              });
              importedContratos++;
            } else {
              contrato = existingContrato;
            }
            
            contratosMap.set(contratoKey, contrato);
          }
        }

        // 3. Create Protesto
        if (contrato && record.valorProtestado) {
          const protesto = await Protesto.create({
            valor_protestado: record.valorProtestado,
            numero_parcela: record.numeroParcela,
            data_registro: record.dataRegistro,
            protocolo: record.protocolo,
            status: record.status,
            situacao: record.situacao,
            data_baixa_cartorio: record.dataBaixaCartorio,
            contrato_id: contrato.id
          });
          importedProtestos++;

          // 4. Create Avalista if exists
          if (record.avalista) {
            await Avalista.create({
              nome: record.avalista,
              cpf_cnpj: record.cpfCnpj,
              protesto_id: protesto.id
            });
            importedAvalistas++;
          }
        }
      } catch (error) {
        console.error(`Error processing record ${i + 1}:`, error.message);
      }
    }

    console.log('Import completed successfully!');
    console.log(`Statistics:
      - Clientes imported: ${importedClientes}
      - Contratos imported: ${importedContratos}
      - Protestos imported: ${importedProtestos}
      - Avalistas imported: ${importedAvalistas}`);

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

// Run import if script is called directly
if (require.main === module) {
  importData();
}

module.exports = { importData };

