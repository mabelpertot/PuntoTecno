const API_URL = "https://puntotecno.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    cargarCompras();
});

async function cargarCompras() {
    const usuarioId = localStorage.getItem("usuarioId");

    if (!usuarioId) {
        window.location.href = "../login-cliente.html";
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/api/ventas/usuario/${usuarioId}`);
        const ventas = await respuesta.json();
        renderizarCompras(ventas);
    } catch (error) {
        console.error("Error al cargar ventas:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar las compras."
        });
    }
}

function renderizarCompras(ventas) {
    const tabla = document.getElementById("tabla-compras");
    if (!tabla) return;

    if (!Array.isArray(ventas) || ventas.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-muted">
                    Todavía no realizaste compras.
                </td>
            </tr>`;
        return;
    }

    tabla.innerHTML = ventas.map(v => `
    <tr>
        <td class="fw-bold">#${v.id}</td>
        <td>${new Date(v.fecha || v.createdAt).toLocaleDateString('es-AR')}</td>
        <td>
            <span class="fw-bold text-success">
                $${Number(v.total).toLocaleString('es-AR')}
            </span>
        </td>
        <td>
            <button
                class="btn btn-sm btn-outline-primary"
                data-bs-toggle="collapse"
                data-bs-target="#venta${v.id}">
                Ver Productos
            </button>
        </td>
    </tr>
    <tr>
        <td colspan="4" class="p-0 border-0">
            <div class="collapse" id="venta${v.id}">
                <div class="p-3 bg-body-tertiary rounded-3 my-2">
                    <ul class="mb-0 small">
                        ${v.Productos ? v.Productos.map(p => `
                            <li>
                                <strong>${p.nombre}</strong> -${p.Venta_Productos ? p.Venta_Productos.cantidad : 1} unidad/es
                            </li>
                        `).join("") : '<li>Sin detalle disponible</li>'}
                    </ul>
                </div>
            </div>
        </td>
    </tr>
    `).join("");
}