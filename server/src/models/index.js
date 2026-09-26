const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Producto = require('./producto');
const Venta = require('./venta');
const Usuario = require('./usuario');

const Venta_Productos = sequelize.define('Venta_Productos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'venta_productos',
    timestamps: false
});

// Relaciones
Venta.belongsToMany(Producto, { through: Venta_Productos, foreignKey: 'ventaId' });
Producto.belongsToMany(Venta, { through: Venta_Productos, foreignKey: 'productoId' });
Usuario.hasMany(Venta, { foreignKey: 'usuario_id' });
Venta.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = {
    sequelize,
    Producto,
    Venta,
    Usuario,
    Venta_Productos
};