const Sentry = require("@sentry/node");
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

Sentry.init({ dsn: process.env.SENTRY_DSN });

app.use(Sentry.Handlers.requestHandler());

const { sequelize } = require('./models');

app.set('view engine', 'ejs');

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/assets/img', express.static(path.join(__dirname, '..', 'public', 'images')));

const authRoutes = require('./routes/api/auth.routes');
const productosRoutes = require('./routes/api/productos.routes'); 
const ventasRoutes = require('./routes/api/ventas.routes');       

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes); 
app.use('/api/ventas', ventasRoutes);  

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.use(Sentry.Handlers.errorHandler());

app.use(function onError(err, req, res, next) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`
        <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
            <h1 style="color: #ff4757;">¡Uy! Algo salió mal en Punto Tecno 🛒</h1>
            <p>Nuestro equipo técnico ya fue notificado automáticamente.</p>
            <p style="color: #666; font-size: 14px;">Código de referencia para soporte: <strong>${res.sentry}</strong></p>
            <a href="/" style="color: #3498db; text-decoration: none;">Volver al inicio</a>
        </div>
    `);
});

const PORT = process.env.PORT || 3000;
console.log('🔄 Sincronizando base de datos con MySQL...');

sequelize.sync({ alter: false })
    .then(() => {
        console.log('✅ Base de datos reconstruida correctamente en Clever Cloud.');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
        });
    })
    .catch(err => console.error('Error al sincronizar:', err));

process.on('exit', (code) => {
    console.log('⚠️ Node se está cerrando con código:', code);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Promesa rechazada:', error);
});