// backend/updatePassword.js
const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');

const updatePassword = async () => {
  const username = process.argv[2];
  const newPassword = process.argv[3];

  if (!username || !newPassword) {
    console.error('Por favor, forneça o nome de usuário e a nova senha como argumentos.');
    console.log('Uso: node backend/updatePassword.js <username> <nova_senha>');
    return;
  }

  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    const user = await User.findOne({ where: { username } });

    if (!user) {
      console.error(`Usuário "${username}" não encontrado no banco de dados.`);
      await sequelize.close();
      return;
    }

    // A senha será hasheada automaticamente pelo hook beforeUpdate no modelo User
    user.password = newPassword;
    await user.save();

    console.log(`Senha do usuário "${username}" alterada com sucesso!`);

  } catch (error) {
    console.error('Ocorreu um erro ao tentar alterar a senha:', error);
  } finally {
    await sequelize.close();
    console.log('Conexão com o banco de dados fechada.');
  }
};

updatePassword();