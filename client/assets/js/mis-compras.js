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

        const respuesta = await fetch(`http://localhost:3000/api/ventas/usuario/${usuarioId}`);
        const ventas = await respuesta.json();
        console.log("VENTAS RECIBIDAS:", ventas);
        renderizarCompras(ventas);

    } catch (error) {

        console.error(error);

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar las compras."
        });
    }
}

function renderizarCompras(ventas) {
    const tabla = document.getElementById("tabla-compras");

    if (!ventas.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    Todavía no realizaste compras.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML = ventas.map(v => `
    <tr>
        <td>${v.id}</td>
        <td>${new Date(v.fecha).toLocaleDateString()}</td>
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
                <div class="p-3 bg-body-tertiary">

                    <ul class="mb-0">

                        ${v.Productos.map(p => `
                            <li>
                                ${p.nombre}
                                (${p.Venta_Productos.cantidad} u.)
                            </li>
                        `).join("")}

                    </ul>

                </div>
            </div>
        </td>
    </tr>
    `).join("");
}