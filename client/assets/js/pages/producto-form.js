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
                
                // Si la imagen actual es una URL, poblar el campo URL
                const urlInput = document.getElementById("imagen-url");
                if (urlInput && producto.imagen && producto.imagen.startsWith("http")) {
                    urlInput.value = producto.imagen;
                }
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

            const nombre = document.getElementById("nombre")?.value.trim();
            const precio = document.getElementById("precio")?.value;
            const stock = document.getElementById("stock")?.value;
            const categoria = document.getElementById("categoria")?.value;
            const activoInput = document.getElementById("activo");
            const activo = activoInput ? (activoInput.checked ? 1 : 0) : 1;

            const archivoInput = document.getElementById("imagen-file") || document.getElementById("imagen");
            const urlInput = document.getElementById("imagen-url")?.value.trim();
            
            const archivoSeleccionado = archivoInput && archivoInput.files && archivoInput.files[0];

            let url = `${API_URL}/api/productos`;
            let metodo = "POST"; 

            if (productoId && productoId !== "null" && productoId !== "undefined") {
                url = `${API_URL}/api/productos/${productoId}`;
                metodo = "PUT"; 
            }

            try {
                let respuesta;

                // CASO 1: Se adjuntó un archivo físico -> Usar FormData (Multipart)
                if (archivoSeleccionado) {
                    const formData = new FormData();
                    formData.append("nombre", nombre);
                    formData.append("precio", precio);
                    formData.append("stock", stock);
                    formData.append("categoria", categoria);
                    formData.append("activo", activo);
                    formData.append("imagen", archivoSeleccionado);

                    respuesta = await fetch(url, {
                        method: metodo,
                        body: formData
                    });
                } 
                // CASO 2: Se usó una URL externa o texto -> Usar JSON (para que la API reciba 'imagen' como String)
                else {
                    const payload = {
                        nombre,
                        precio,
                        stock,
                        categoria,
                        activo,
                        imagen: urlInput || "favicon.png"
                    };

                    respuesta = await fetch(url, {
                        method: metodo,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                }

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