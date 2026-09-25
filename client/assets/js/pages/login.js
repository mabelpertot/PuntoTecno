const API_URL = "https://puntotecno.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("form-login") || document.getElementById("login-form");
    if (!formLogin) return;

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value.trim();

        if (!email || !password) {
            Swal.fire({
                icon: "warning",
                title: "Campos incompletos",
                text: "Por favor completá todos los campos.",
                confirmButtonColor: "#06b6d4"
            });
            return;
        }

        try {
            const respuesta = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(data.message || data.error || "Credenciales incorrectas");
            }

            const usuarioObj = data.usuario || data.user || data;
            const rolDetectado = (usuarioObj.rol || data.rol || "").toLowerCase();

            if (rolDetectado === "admin" || email === "admin@puntotecno.com") {
                // Guardado estandarizado para dashboard.js
                localStorage.setItem("token", data.token || "session-admin");
                localStorage.setItem("usuarioId", usuarioObj.id || 1);
                localStorage.setItem("usuarioLogueado", usuarioObj.nombre || "Administrador");
                localStorage.setItem("cliente", usuarioObj.nombre || "Administrador");
                localStorage.setItem("rol", "admin");
                localStorage.setItem("usuario", JSON.stringify(usuarioObj));

                Swal.fire({
                    icon: "success",
                    title: "¡Bienvenido/a!",
                    text: "Iniciando panel de administración...",
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "./dashboard.html";
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Acceso denegado",
                    text: "Este usuario no tiene permisos de administrador.",
                    confirmButtonColor: "#06b6d4"
                });
            }

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error de inicio de sesión",
                text: error.message,
                confirmButtonColor: "#06b6d4"
            });
        }
    });
});