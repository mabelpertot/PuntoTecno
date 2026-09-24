const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('punto_tecno_db', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false 
});

module.exports = sequelize;