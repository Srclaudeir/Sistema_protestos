// scripts/checkAdminUser.js
const { sequelize, Usuario } = require('../backend/src/models');

async function checkAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
    // Verificar se o usuário administrador existe
    const adminUser = await Usuario.findOne({
      where: {
        username: 'admin'
      }
    });
    
    if (adminUser) {
      console.log('\nUsuário administrador encontrado:');
      console.log(`ID: ${adminUser.id}`);
      console.log(`Username: ${adminUser.username}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Nome: ${adminUser.nome}`);
      console.log(`Role: ${adminUser.role}`);
      console.log(`Ativo: ${adminUser.ativo}`);
    } else {
      console.log('\nUsuário administrador não encontrado.');
      
      // Criar usuário administrador
      console.log('Criando usuário administrador...');
      const newUser = await Usuario.create({
        username: 'admin',
        email: 'admin@protestos.com',
        password: 'admin123',
        nome: 'Administrador do Sistema',
        role: 'admin',
        ativo: true
      });
      
      console.log('Usuário administrador criado com sucesso:');
      console.log(`ID: ${newUser.id}`);
      console.log(`Username: ${newUser.username}`);
      console.log(`Email: ${newUser.email}`);
      console.log(`Nome: ${newUser.nome}`);
      console.log(`Role: ${newUser.role}`);
      console.log(`Ativo: ${newUser.ativo}`);
    }
  } catch (error) {
    console.error('Erro ao verificar/criar usuário administrador:', error);
  } finally {
    await sequelize.close();
    console.log('\nConexão com o banco de dados encerrada.');
  }
}

checkAdminUser();