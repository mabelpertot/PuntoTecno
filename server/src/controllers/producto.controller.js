const { Producto } = require('../models');

const productoController = {

    listarTodos: async (req, res) => {
        try {
            let { page, limit } = req.query;
            if (page && limit) {
                page = parseInt(page);
                limit = parseInt(limit);
                const offset = (page - 1) * limit;

                const { count, rows } = await Producto.findAndCountAll({
                    limit,
                    offset,
                    order: [['id', 'DESC']]
                });
                return res.json({
                    totalItems: count,
                    productos: rows
                });
            }

            const productos = await Producto.findAll({ order: [['id', 'DESC']] });
            return res.json(productos);
        } catch (error) {
            return res.status(500).json({ error: 'Error al listar productos' });
        }
    },

    crearProducto: async (req, res) => {
        try {
            const { nombre, categoria, precio, stock, imagen, activo } = req.body;

            const imagenFinal = req.file ? req.file.filename : imagen || 'default.jpg';

            if (!nombre || !precio) {
                return res.status(400).json({ mensaje: "Nombre y precio son obligatorios." });
            }

            const nuevoProducto = await Producto.create({
                nombre,
                categoria: categoria || 'Hardware',
                precio: parseFloat(precio),
                stock: parseInt(stock) || 0,
                imagen: imagenFinal,
                activo: activo === undefined ? 1 : activo
            });

            return res.status(201).json({
                mensaje: "¡Producto guardado exitosamente!",
                id: nuevoProducto.id
            });
        } catch (error) {
            console.error("Error en el controlador al crear producto:", error);
            return res.status(500).json({ error: "Error interno del servidor." });
        }
    },

    obtenerPorId: async (req, res) => {
        try {
            const producto = await Producto.findByPk(req.params.id);

            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            return res.json(producto);
        } catch (error) {
            console.error('Error al obtener producto:', error);
            return res.status(500).json({ error: 'Error al obtener producto' });
        }
    },
    
    actualizarProducto: async (req, res) => {
        try {
            const { id } = req.params;
            const producto = await Producto.findByPk(id);

            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado'});
            }

            const imagenFinal = req.file ? req.file.filename : producto.imagen;

            await producto.update({
                nombre: req.body.nombre !== undefined ? req.body.nombre : producto.nombre,
                categoria: req.body.categoria !== undefined ? req.body.categoria : producto.categoria,
                precio: req.body.precio !== undefined ? parseFloat(req.body.precio) : producto.precio,
                stock: req.body.stock !== undefined ? parseInt(req.body.stock) : producto.stock,
               //imagen: req.body.imagen !== undefined ? req.body.imagen : producto.imagen,
                imagen: imagenFinal,
                activo: req.body.activo !== undefined ? req.body.activo : producto.activo
            });

            return res.json({ mensaje: "¡Producto actualizado correctamente!", producto });

        } catch (error) {
            console.error('Error al actualizar producto:', error);
            return res.status(500).json({
                error: 'Error al actualizar producto'
            });
        }
    }

};

module.exports = productoController;