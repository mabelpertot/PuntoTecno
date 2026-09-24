const { body, validationResult } = require('express-validator');

const validateProducto = [
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es obligatorio'),

    body('categoria')
        .notEmpty()
        .withMessage('La categoría es obligatoria'),

    body('precio')
        .isNumeric()
        .withMessage('El precio debe ser un número'),

    body('stock')
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero mayor o igual a 0'),

    /*body('activo')
        .optional()
        .isBoolean()
        .withMessage('Activo debe ser true o false'),*/

    body('activo')
        .optional()
        .isIn(['0', '1', 0, 1, true, false, 'true', 'false'])
        .withMessage('Activo debe ser 0, 1, true o false'),

    body('imagen')
        .optional()
        .notEmpty()
        .withMessage('La imagen no puede estar vacía'),

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

module.exports = validateProducto;