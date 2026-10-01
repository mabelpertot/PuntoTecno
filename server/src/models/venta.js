const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Venta = sequelize.define('Venta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    cliente: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    fecha: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
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
    }

}, {
    tableName: 'ventas',
    timestamps: true
});

module.exports = Venta;