const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Producto = require('./Producto');
const Venta = require('./Venta');
const Usuario = require('./Usuario');

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

Usuario.hasMany(Venta, { foreignKey: 'usuario_id', as: 'ventas' });
Venta.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Venta.belongsToMany(Producto, { 
    through: Venta_Productos, 
    foreignKey: 'venta_id', 
    as: 'Productos'
});
Producto.belongsToMany(Venta, { 
    through: Venta_Productos, 
    foreignKey: 'producto_id', 
    as: 'ventas' 
});

module.exports = {
    sequelize,
    Usuario,
    Producto,
    Venta,
    Venta_Productos
};