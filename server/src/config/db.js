const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'punto_tecno_db',
    process.env.MYSQL_USER || 'utxryo00nwgymbbe',
    process.env.MYSQL_PASSWORD || 'R6Tf6Kv7PtZxCsYRt4cu',
    {
        host: process.env.MYSQL_HOST || 'bglu9kf7ahuif8jt9myu-mysql.services.clever-cloud.com',
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql',
        logging: false
    }
);

module.exports = sequelize;