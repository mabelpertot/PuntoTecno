const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Venta = sequelize.define('Venta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
   
    usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW 
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW 
    },
    fecha: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.createdAt;
        }
    }
}, {
    tableName: 'ventas',
    timestamps: true 
});

module.exports = Venta;