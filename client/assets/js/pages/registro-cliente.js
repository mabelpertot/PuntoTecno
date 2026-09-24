document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registro-form");

    if (!form) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const nombre =
            document.getElementById("nombre").value.trim();

        const apellido =
            document.getElementById("apellido").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {

            Swal.fire({
                icon: "error",
                title: "Contraseñas diferentes",
                text: "Las contraseñas deben coincidir."
            });

            return;
        }

        try {

            const respuesta = await fetch(
                "http://localhost:3000/api/auth/registro",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nombre: `${nombre} ${apellido}`,
                        email,
                        password
                    })
                }
            );

            const data = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    data.error ||
                    "No fue posible registrar el usuario."
                );
            }

            await Swal.fire({
                icon: "success",
                title: "Registro exitoso",
                text: "Ahora puedes iniciar sesión."
            });

            window.location.href =
                "./login-cliente.html";

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message
            });

        }

    });

});