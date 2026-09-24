const bcrypt = require('bcrypt');
const { Usuario } = require('../models');

const authController = {
    registrar: async (req, res) => {
        try {
            const { nombre, email, password } = req.body;

            if (!nombre || !email || !password) {
                return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
            }

            const usuarioExistente = await Usuario.findOne({ where: { email } });
            if (usuarioExistente) {
                return res.status(400).json({ error: 'El email ya está registrado.' });
            }

            const passwordEncriptada = await bcrypt.hash(password, 10);
            const nuevoUsuario = await Usuario.create({
                nombre,
                email,
                password: passwordEncriptada,
                rol: 'user' 
            });

            return res.status(201).json({
                mensaje: 'Usuario registrado con éxito.',
                usuario: { id: nuevoUsuario.id, nombre: nuevoUsuario.nombre, email: nuevoUsuario.email }
            });

        } catch (error) {
            console.error('Error en el registro de usuario:', error);
            return res.status(500).json({ error: 'Error interno al registrar el usuario.' });
        }
    },

    crearAdmin: async (req, res) => {
        try {
            const { nombre, email, password } = req.body;

            if (!nombre || !email || !password) {
                return res.status(400).json({
                    error: 'Todos los campos son obligatorios.'
                });
            }

            const usuarioExistente = await Usuario.findOne({ where: { email } });

            if (usuarioExistente) {
                return res.status(400).json({
                    error: 'El email ya está registrado.'
                });
            }

            const passwordEncriptada = await bcrypt.hash(password, 10);

            const admin = await Usuario.create({
                nombre,
                email,
                password: passwordEncriptada,
                rol: 'admin'
            });

            return res.status(201).json({
                mensaje: 'Administrador creado correctamente.',
                usuario: {
                    id: admin.id,
                    nombre: admin.nombre,
                    email: admin.email,
                    rol: admin.rol
                }
            });

        } catch (error) {
            console.error('Error al crear administrador:', error);
            return res.status(500).json({
                error: 'Error interno al crear administrador.'
            });
        }
    },

        login: async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y contraseña son obligatorios.'
            });
        }

        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            return res.status(401).json({
                error: 'Credenciales inválidas.'
            });
        }

        let passwordValida = false;

        if (
            usuario.password.startsWith('$2b$') ||
            usuario.password.startsWith('$2a$')
        ) {
            passwordValida = await bcrypt.compare(password, usuario.password);
        } else {
            passwordValida = usuario.password === password;
        }

        if (!passwordValida) {
            return res.status(401).json({
                error: 'Credenciales inválidas.'
            });
        }

        return res.json({
            mensaje: '¡Ingreso exitoso!',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        return res.status(500).json({
            error: 'Error interno al procesar el ingreso.'});
        }
    }
    
};
module.exports = authController