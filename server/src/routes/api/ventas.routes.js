const express = require('express');
const router = express.Router();
const ventaController = require('../../controllers/venta.controller');
const validarVenta = require('../../middlewares/venta.validation');

router.post('/', validarVenta, ventaController.crearVenta);
router.get('/', ventaController.listarTodas);
router.get('/usuario/:id', ventaController.listarPorUsuario);

module.exports = router;