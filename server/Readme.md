# Trabajo Práctico: Despliegue Continuo y Observabilidad (Punto Tecno E-commerce)

## Integrantes del Grupo (Equipo N° 4)
* Pertot Mabel

---

## 🔗 Enlaces Públicos del Proyecto
* **Backend (API en Render):** `https://puntotecno.onrender.com`
* **Endpoint de Prueba de Sentry:** `https://puntotecno.onrender.com/debug-sentry`
* **Frontend (Vercel):** `https://punto-tecno-git-main-mabelgem77.vercel.app/index.html`
* **Repositorio en GitHub:** `https://github.com/mabelpertot/PuntoTecno`

---

## 🛠️ Credenciales de Prueba 
## Usuario Admin 
* **Correo de prueba:** `prueba@admin.com`
* **Contraseña de prueba:** `123456`
## Usuario raso 
* **Correo de prueba:** `jorgemolina@gmail.com`
* **Contraseña de prueba:** `123456`

---

## ☁️ Arquitectura de Despliegue y Herramientas Utilizadas
Para este trabajo práctico se diseñó una arquitectura desacoplada utilizando exclusivamente servicios en la nube con planes gratuitos (*Free Tier*):
1. **Frontend (Vercel):** Hospedaje del cliente web con despliegue continuo automatizado desde GitHub.
2. **Backend / API REST (Render):** Servidor Node.js con Express y Sequelize vinculado directamente al repositorio para automatizar el CD ante cada `git push`.
3. **Base de Datos Relacional (Clever Cloud):** Base de datos MySQL alojada de forma remota y conectada de manera segura al backend mediante variables de entorno (`process.env`).
4. **Observabilidad y Monitoreo (Sentry):** Integración del SDK oficial para la captura de errores en tiempo real, provisto de un middleware de manejo de excepciones que retorna un código de seguimiento único (`res.sentry`).

---

🎥 **Enlace al Video de Exposición (Google Drive):** 


"Esta arquitectura está totalmente distribuida y desacoplada en la nube: el cliente web corre en Vercel, el servidor backend de Node.js se despliega de forma continua en Render mediante CI/CD, los datos residen en una base de datos MySQL en Clever Cloud, y toda la salud y el monitoreo de errores en producción los controlamos en tiempo real con Sentry."