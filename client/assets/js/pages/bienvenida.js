document.addEventListener("DOMContentLoaded", () => {

    const botonesAdmin =
        document.querySelectorAll(".btn-admin");

    botonesAdmin.forEach(btn => {

        btn.addEventListener("click", () => {
            
            window.location.href = "./pages/admin/login.html";
        });

    });

});

document.addEventListener("DOMContentLoaded", () => {

    const botonesAdmin = document.querySelectorAll(".btn-admin");

    botonesAdmin.forEach(btn => {
        btn.addEventListener("click", () => {
            window.location.href = "./pages/admin/login.html";
        });
    });

    const formBienvenida = document.getElementById("bienvenida-form");

    if (formBienvenida) {
        formBienvenida.addEventListener("submit", (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre-cliente").value.trim();

            if (!nombre) {
                Swal.fire({
                    icon: "warning",
                    title: "Nombre obligatorio",
                    text: "Ingresá tu nombre para continuar."
                });
                return;
            }

            const nombreInput = document.getElementById("nombre-cliente");
            const errorNombre = document.getElementById("error-nombre");

            const nombre = nombreInput.value.trim();

            if (!nombre) {

                nombreInput.classList.add("is-invalid");
                errorNombre.classList.remove("d-none");

                return;
            }

            nombreInput.classList.remove("is-invalid");
            errorNombre.classList.add("d-none");

            localStorage.setItem("cliente", nombre);
            localStorage.setItem("usuarioLogueado", "true");

            localStorage.removeItem("usuarioId");
            localStorage.removeItem("rol");

            window.location.href = "./pages/productos.html";
        });
    }

});

