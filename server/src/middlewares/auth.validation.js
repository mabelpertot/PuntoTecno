const { body, validationResult } = require('express-validator');

const manejarErrores = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    next();
};

const validarRegistro = [
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es obligatorio'),

    body('email')
        .isEmail()
        .withMessage('El email no es válido'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),

    manejarErrores
];

const validarLogin = [
    body('email')
        .isEmail()
        .withMessage('El email no es válido'),

    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria'),

    manejarErrores
];

module.exports = {
    validarRegistro,
    validarLogin
};