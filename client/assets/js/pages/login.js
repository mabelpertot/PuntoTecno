const API_URL = "https://puntotecno.onrender.com"; // Reemplazá por la URL pública exacta de tu Render

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("login-form");

    if (!form) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        try {

            const respuesta = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    data.error ||
                    "Credenciales incorrectas."
                );
            }

            if (data.usuario.rol !== "admin") {

                throw new Error(
                    "Este usuario no tiene permisos de administrador."
                );

            }

            localStorage.setItem(
                "adminLogueado",
                "true"
            );

            localStorage.setItem(
                "adminNombre",
                data.usuario.nombre
            );

            window.location.href =
                "./dashboard.html";

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Acceso denegado",
                text: error.message
            });

        }

    });

});