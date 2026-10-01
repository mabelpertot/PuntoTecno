const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'punto_tecno_db',
    process.env.MYSQL_USER || 'uaunumtix1ui0urw',
    process.env.MYSQL_PASSWORD || 'pSvLuEEFqtmfdFWwDh5Q',
    {
        host: process.env.MYSQL_HOST || 'bnarc5ii8c8qdculzz3i-mysql.services.clever-cloud.com',
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql',
        logging: false
    }
);

module.exports = sequelize;