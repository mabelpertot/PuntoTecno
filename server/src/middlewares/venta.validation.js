const { body, validationResult } = require('express-validator');

const validarVenta = [
    body('usuario_id')
        .isInt({ min: 1 })
        .withMessage('El usuario es obligatorio y debe ser válido'),

    body('total')
        .isNumeric()
        .withMessage('El total debe ser numérico'),

    body('productos')
        .isArray({ min: 1 })
        .withMessage('La venta debe incluir al menos un producto'),

    body('productos.*.id')
        .isInt({ min: 1 })
        .withMessage('Cada producto debe tener un id válido'),

    body('productos.*.cantidad')
        .isInt({ min: 1 })
        .withMessage('Cada producto debe tener una cantidad válida'),

    body('productos.*.precio')
        .isNumeric()
        .withMessage('Cada producto debe tener un precio válido'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        next();
    }
];

module.exports = validarVenta;