const { Sequelize } = require('sequelize');

// Si existe DATABASE_URL (en Render), la usa. Si no, usa las credenciales explícitas de Clever Cloud.
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
        'bnarc5ii8c8qdculzz3i', 
        'uaunumtixlui0urw',    
        process.env.DB_PASSWORD,   
        {
            host: 'bnarc5ii8c8qdculzz3i-mysql.services.clever-cloud.com', 
            port: 3306,
            dialect: 'mysql',
            logging: false
        }
      );

module.exports = sequelize;