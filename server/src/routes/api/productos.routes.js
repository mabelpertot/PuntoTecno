const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const validateProducto = require('../../middlewares/producto.validation');
const productoController = require('../../controllers/producto.controller');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../../public/images'));
    },
    filename: (req, file, cb) => {
        const nombreUnico = Date.now() + '-' + file.originalname;
        cb(null, nombreUnico);
    }
});

const upload = multer({ storage });

router.get('/', productoController.listarTodos);
router.get('/:id', productoController.obtenerPorId);

router.post(
    '/',
    upload.single('imagen'),
    validateProducto,
    productoController.crearProducto
);

router.put(
    '/:id',
    upload.single('imagen'),
    productoController.actualizarProducto
);

module.exports = router;