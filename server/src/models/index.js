const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Producto = require('./producto');
const Venta = require('./venta');
const Usuario = require('./usuario');

const Venta_Productos = sequelize.define('Venta_Productos', {
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
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
    tableName: 'venta_productos',
    timestamps: true 
});

// Relación Usuario <-> Venta
Usuario.hasMany(Venta, { foreignKey: 'usuarioId', as: 'ventas' });
Venta.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Relación N:M Venta <-> Producto a través de Venta_Productos
Venta.belongsToMany(Producto, { 
    through: Venta_Productos, 
    foreignKey: 'ventaId', 
    otherKey: 'productoId',
    as: 'Productos'
});

Producto.belongsToMany(Venta, { 
    through: Venta_Productos, 
    foreignKey: 'productoId', 
    otherKey: 'ventaId',
    as: 'ventas' 
});

module.exports = {
    sequelize,
    Usuario,
    Producto,
    Venta,
    Venta_Productos
};