const express = require('express');
const router = express.Router();

const authController = require('../../controllers/auth.controller');
const {
    validarRegistro,
    validarLogin
} = require('../../middlewares/auth.validation');

router.post('/registro', validarRegistro, authController.registrar);
router.post('/login', validarLogin, authController.login);
router.post('/crear-admin', authController.crearAdmin);

module.exports = router;