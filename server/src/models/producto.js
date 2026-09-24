const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    imagen: {
        type: DataTypes.STRING,
        defaultValue: 'favicon.png'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true 
    }
}, {
    tableName: 'productos',
    timestamps: false
});

module.exports = Producto;