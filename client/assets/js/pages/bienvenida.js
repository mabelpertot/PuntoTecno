document.addEventListener("DOMContentLoaded", () => {
    const formBienvenida = document.getElementById("bienvenida-form");

    if (formBienvenida) {
        formBienvenida.addEventListener("submit", (e) => {
            e.preventDefault();

            const nombreInput = document.getElementById("nombre-cliente");
            const errorNombre = document.getElementById("error-nombre");
            const nombre = nombreInput ? nombreInput.value.trim() : "";

            if (!nombre) {
                if (nombreInput) nombreInput.classList.add("is-invalid");
                if (errorNombre) errorNombre.classList.remove("d-none");

                Swal.fire({
                    icon: "warning",
                    title: "Nombre obligatorio",
                    text: "Ingresá tu nombre para continuar."
                });
                return;
            }

            if (nombreInput) nombreInput.classList.remove("is-invalid");
            if (errorNombre) errorNombre.classList.add("d-none");

            localStorage.setItem("cliente", nombre);
            localStorage.setItem("usuarioLogueado", "true");

            localStorage.removeItem("usuarioId");
            localStorage.removeItem("rol");

            window.location.href = "./pages/productos.html";
        });
    }
});
