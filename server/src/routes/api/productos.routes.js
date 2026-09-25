const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const validateProducto = require('../../middlewares/producto.validation');
const productoController = require('../../controllers/producto.controller');

// Configuración de destino a server/public/images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Apunta correctamente a server/public/images
        cb(null, path.join(__dirname, '../../public/images'));
    },
    filename: (req, file, cb) => {
        const nombreUnico = Date.now() + '-' + file.originalname;
        cb(null, nombreUnico);
    }
});

const upload = multer({ storage });

// Middleware para capturar imágenes subidas sin bloquear peticiones JSON/Texto
const manejarSubida = (req, res, next) => {
    upload.single('imagen')(req, res, (err) => {
        if (err) {
            console.error("Error en Multer:", err);
        }
        next();
    });
};

router.get('/', productoController.listarTodos);
router.get('/:id', productoController.obtenerPorId);

router.post(
    '/',
    manejarSubida,
    validateProducto,
    productoController.crearProducto
);

router.put(
    '/:id',
    manejarSubida,
    productoController.actualizarProducto
);

module.exports = router;