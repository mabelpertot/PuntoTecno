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
                "http://localhost:3000/api/auth/login",
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

            localStorage.setItem(
                "usuarioId",
                data.usuario.id
            );

            localStorage.setItem(
                "cliente",
                data.usuario.nombre
            );

            localStorage.setItem(
                "usuarioLogueado",
                "true"
            );

            await Swal.fire({
                icon: "success",
                title: "Bienvenido",
                text: data.usuario.nombre,
                timer: 1500,
                showConfirmButton: false
            });

            window.location.href =
                "./productos.html";

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Error de acceso",
                text: error.message
            });

        }

    });

});