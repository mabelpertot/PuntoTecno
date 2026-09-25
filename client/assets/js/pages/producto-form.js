const API_URL = "https://puntotecno.onrender.com";

// Verificación flexible de sesión de Administrador
const esAdmin = localStorage.getItem("adminLogueado") === "true" || 
                localStorage.getItem("rol") === "admin" || 
                localStorage.getItem("token");

if (!esAdmin) {
    window.location.href = "./login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-producto") || document.getElementById("producto-form");
    const urlParams = new URLSearchParams(window.location.search);
    const productoId = urlParams.get("id"); 

    if (productoId && productoId !== "null" && productoId !== "undefined") {
        fetch(`${API_URL}/api/productos/${productoId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`El producto con ID ${productoId} no existe.`);
                }
                return res.json();
            })
            .then(producto => {
                if (document.getElementById("nombre")) document.getElementById("nombre").value = producto.nombre || "";
                if (document.getElementById("precio")) document.getElementById("precio").value = producto.precio || "";
                if (document.getElementById("stock")) document.getElementById("stock").value = producto.stock || "";
                if (document.getElementById("categoria")) document.getElementById("categoria").value = producto.categoria || "";
                if (document.getElementById("activo")) document.getElementById("activo").checked = producto.activo == 1 || producto.activo == true;
            })
            .catch(err => {
                console.error("Error al cargar ficha de producto:", err);
                Swal.fire({
                    icon: "error",
                    title: "Producto no encontrado",
                    text: "El artículo que intentás editar no existe."
                }).then(() => {
                    window.location.href = "./dashboard.html";
                });
            });
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData();

            formData.append("nombre", document.getElementById("nombre").value.trim());
            formData.append("precio", document.getElementById("precio").value);
            formData.append("stock", document.getElementById("stock").value);
            formData.append("categoria", document.getElementById("categoria").value);
            
            const activoInput = document.getElementById("activo");
            formData.append("activo", activoInput ? (activoInput.checked ? 1 : 0) : 1);

            const archivoImagenInput = document.getElementById("imagen");
            if (archivoImagenInput && archivoImagenInput.files && archivoImagenInput.files[0]) {
                formData.append("imagen", archivoImagenInput.files[0]);
            }

            try {
                let url = `${API_URL}/api/productos`;
                let metodo = "POST"; 

                if (productoId && productoId !== "null" && productoId !== "undefined") {
                    url = `${API_URL}/api/productos/${productoId}`;
                    metodo = "PUT"; 
                }

                const respuesta = await fetch(url, {
                    method: metodo,
                    body: formData
                });

                if (!respuesta.ok) {
                    const errorData = await respuesta.json();
                    throw new Error(
                        errorData.errors?.map(e => e.msg).join(" | ") ||
                        errorData.mensaje ||
                        "Error en la operación del servidor"
                    );
                }

                await Swal.fire({
                    icon: "success",
                    title: productoId ? "Producto actualizado" : "Producto guardado con éxito",
                    text: "Los cambios impactaron en la base de datos.",
                    timer: 1500,
                    showConfirmButton: false
                });

                window.location.href = "./dashboard.html";

            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error de guardado",
                    text: error.message
                });
            }
        });
    }
});