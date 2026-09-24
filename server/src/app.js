const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

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


const PORT = process.env.PORT || 3000;
console.log('🔄 Sincronizando base de datos con MySQL...');

sequelize.sync({ force: false })
    .then(() => {
        console.log('✅ Base de datos MySQL conectada y sincronizada a la perfección.');

        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
        });

        server.on('error', (error) => {
            console.error('❌ Error en el servidor:', error);
        });
    })
    .catch(err => {
        console.error('❌ Error crítico al conectar la base de datos:', err);
    });

process.on('exit', (code) => {
    console.log('⚠️ Node se está cerrando con código:', code);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Promesa rechazada:', error);
});