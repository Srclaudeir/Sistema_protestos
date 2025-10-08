// scripts/clearTables.js
const { sequelize } = require('../backend/src/config/database');

const clearTables = async () => {
  try {
    console.log('Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    // Desabilitar verificação de chave estrangeira para permitir o TRUNCATE
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Verificação de chave estrangeira desabilitada.');

    const tablesToClear = ['protestos', 'avalistas', 'contratos', 'clientes'];

    for (const table of tablesToClear) {
      console.log(`Limpando a tabela ${table}...`);
      await sequelize.query(`TRUNCATE TABLE ${table}`);
      console.log(`Tabela ${table} limpa com sucesso.`);
    }

    // Reabilitar verificação de chave estrangeira
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Verificação de chave estrangeira reabilitada.');

    console.log('Todas as tabelas foram limpas com sucesso!');

  } catch (error) {
    console.error('Ocorreu um erro ao limpar as tabelas:', error);
    // Tenta reabilitar a verificação de chave estrangeira mesmo em caso de erro
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('Verificação de chave estrangeira reabilitada (após erro).');
    } catch (e) {
      console.error('Não foi possível reabilitar a verificação de chave estrangeira:', e);
    }
  } finally {
    await sequelize.close();
    console.log('Conexão com o banco de dados fechada.');
  }
};

clearTables();
