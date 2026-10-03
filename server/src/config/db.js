const { Sequelize } = require('sequelize');

const sequelize = process.env.DATABASE_URL 
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
      })
    : new Sequelize(
        process.env.MYSQL_DATABASE || 'bnarc5ii8c8qdculzz3i', 
        process.env.MYSQL_USER || 'uaunumtixlui0urw',    
        process.env.MYSQL_PASSWORD,   
        {
            host: process.env.MYSQL_HOST || 'bnarc5ii8c8qdculzz3i-mysql.services.clever-cloud.com', 
            port: process.env.MYSQL_PORT || 3306,
            dialect: 'mysql',
            logging: false
        }
      );

module.exports = sequelize;