const db = require('../models');

const ventaController = {
    crearVenta: async (req, res) => {
        const { usuario_id, total, productos } = req.body;
        const t = await db.sequelize.transaction();

        try {
            const venta = await db.Venta.create({
                usuario_id: parseInt(usuario_id),
                total: parseFloat(total)
            }, { transaction: t });

            for (let p of productos) {
                const productoId = parseInt(p.id);
                const cantidadComprada = parseInt(p.cantidad);
                const precioUnitario = parseFloat(p.precio);

                const productoDb = await db.Producto.findByPk(productoId, { transaction: t });
                if (!productoDb || productoDb.stock < cantidadComprada) {
                    throw new Error(`Stock insuficiente para el producto ID: ${productoId}`);
                }

                await db.Producto.decrement('stock', {
                    by: cantidadComprada,
                    where: { id: productoId },
                    transaction: t
                });

                await venta.addProducto(productoId, {
                    through: {
                        cantidad: cantidadComprada,
                        precio: precioUnitario
                    },
                    transaction: t
                });
            }

            await t.commit();

            return res.status(201).json({
                mensaje: 'Venta registrada correctamente',
                ventaId: venta.id
            });

        } catch (error) {
            await t.rollback();
            console.error('❌ Error crítico al crear la venta:', error);
            return res.status(500).json({ error: error.message });
        }
    },

    listarTodas: async (req, res) => {
        try {
            const ventas = await db.Venta.findAll({
                include: [
                    { 
                        model: db.Producto, 
                        as: 'Productos',
                        attributes: ['id', 'nombre', 'categoria', 'precio', 'stock', 'imagen', 'activo']
                    },
                    { 
                        model: db.Usuario, 
                        as: 'usuario' 
                    }
                ],
                order: [['id', 'DESC']]
            });

            const respuestaFormateada = ventas.map(v => {
                const ventaJson = v.toJSON();
                return {
                    id: ventaJson.id,
                    total: ventaJson.total,
                    createdAt: ventaJson.createdAt || ventaJson.fecha,
                    cliente: ventaJson.usuario ? ventaJson.usuario.nombre : (ventaJson.cliente || 'Consumidor Final'),
                    //cliente: ventaJson.cliente || 'Consumidor Final',
                    productos: ventaJson.Productos ? ventaJson.Productos.map(p => {
                        const pivot = p.Venta_Productos || p.venta_productos || {};
                        return {
                            nombre: p.nombre,
                            cantidad: pivot.cantidad !== undefined ? pivot.cantidad : 1
                        };
                    }) : []
                };
            });

            return res.json(respuestaFormateada);
        } catch (error) {
            console.error('Error al listar ventas generales:', error);
            return res.status(500).json({ error: error.message });
        }
    },

    listarPorUsuario: async (req, res) => {
        try {
            const { id } = req.params;

            const ventas = await db.Venta.findAll({
                where: { usuario_id: id },
                include: [{
                    model: db.Producto,
                    as: 'Productos',
                    attributes: ['id', 'nombre', 'categoria', 'precio', 'stock', 'imagen', 'activo']
                }],
                order: [['id', 'DESC']]
            });

            const respuestaFormateada = ventas.map(v => {
                const ventaJson = v.toJSON();
                
                if (ventaJson.Productos) {
                    ventaJson.Productos = ventaJson.Productos.map(p => {
                        const pivot = p.Venta_Productos || p.venta_productos || {};
                        p.Venta_Productos = {
                            cantidad: pivot.cantidad !== undefined ? pivot.cantidad : 1
                        };
                        return p;
                    });
                }
                
                ventaJson.fecha = ventaJson.fecha || ventaJson.createdAt;
                return ventaJson;
            });

            return res.json(respuestaFormateada);

        } catch (error) {
            console.error('Error al listar ventas por usuario:', error);
            return res.status(500).json({ error: error.message });
        }
    }
};

module.exports = ventaController;