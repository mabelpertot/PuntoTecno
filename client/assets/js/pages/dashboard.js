const API_URL = "https://puntotecno.onrender.com";

// Verificación flexible de la sesión de Administrador
const esAdmin = localStorage.getItem("adminLogueado") === "true" || localStorage.getItem("rol") === "admin";
if (!esAdmin) {
    window.location.href = "./login.html";
}

let productos = [];

document.addEventListener("DOMContentLoaded", () => {
    const buscador = document.getElementById("buscar-producto");
    const filtroCategoria = document.getElementById("filtro-categoria");
    const ordenarProductos = document.getElementById("ordenar-productos");

    const refrescarTabla = () => {
        renderizarProductos(
            buscador?.value || "",
            filtroCategoria?.value || "Todos",
            ordenarProductos?.value || ""
        );
    };

    buscador?.addEventListener("input", refrescarTabla);
    filtroCategoria?.addEventListener("change", refrescarTabla);
    ordenarProductos?.addEventListener("change", refrescarTabla);

    inicializarDashboard();
});

async function inicializarDashboard() {
    await obtenerProductosDesdeAPI();
    await renderizarVentas();
    await renderizarEstadisticas();
}

async function obtenerProductosDesdeAPI() {
    try {
        const respuesta = await fetch(`${API_URL}/api/productos?t=${Date.now()}`);
        if (!respuesta.ok) throw new Error("Error al consultar la API");
        
        const resultado = await respuesta.json();
        productos = Array.isArray(resultado) ? resultado : (resultado.rows || resultado.data || []);
        
        renderizarProductos();
    } catch (error) {
        console.error("Error al sincronizar productos:", error);
    }
}

function renderizarProductos(filtro = "", categoria = "Todos", orden = "") {
    const tabla = document.getElementById("tabla-productos");
    if (!tabla) return;

    const productosAMostrar = productos.filter(producto => {
        const coincideTexto = 
            producto.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
            producto.categoria.toLowerCase().includes(filtro.toLowerCase());

        const coincideCategoria = 
            categoria === "Todos" || producto.categoria === categoria;

        return coincideTexto && coincideCategoria;
    });

    if (orden === "precioAsc")  productosAMostrar.sort((a, b) => (parseFloat(a.precio) || 0) - (parseFloat(b.precio) || 0));
    if (orden === "precioDesc") productosAMostrar.sort((a, b) => (parseFloat(b.precio) || 0) - (parseFloat(a.precio) || 0));
    if (orden === "stockAsc")   productosAMostrar.sort((a, b) => (a.stock || 0) - (b.stock || 0));
    if (orden === "stockDesc")  productosAMostrar.sort((a, b) => (b.stock || 0) - (a.stock || 0));

    const cantidadResultados = document.getElementById("cantidad-resultados");
    if (cantidadResultados) {
        cantidadResultados.innerText = `Mostrando ${productosAMostrar.length} productos`;
    }

    tabla.innerHTML = productosAMostrar.map(producto => `
        <tr>
            <td>${producto.id}</td>
            <td>
                <img src="${producto.imagen && producto.imagen.startsWith('http') ? producto.imagen : '../../assets/img/' + (producto.imagen || 'favicon.png')}"
                    alt="${producto.nombre}" 
                    width="60" 
                    class="rounded shadow-sm" 
                    onerror="this.src='../../assets/img/favicon.png'">
            </td>
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>$${parseFloat(producto.precio).toLocaleString('es-AR')}</td>
            <td>${renderBadgeStock(producto.stock)}</td>
            <td>${renderBadgeEstado(producto.activo)}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editarProducto(${producto.id})">Editar</button>
                <button class="btn btn-${producto.activo ? 'danger' : 'success'} btn-sm" onclick="cambiarEstado(${producto.id})">
                    ${producto.activo ? 'Desactivar' : 'Activar'}
                </button>
            </td>
        </tr>
    `).join('');
}

function renderBadgeStock(stock) {
    if (stock === 0) return `<span class="badge bg-danger">Sin stock</span>`;
    if (stock < 5) return `<span class="badge bg-warning text-dark">${stock}</span>`;
    return `<span class="badge bg-success">${stock}</span>`;
}

function renderBadgeEstado(activo) {
    return (activo == true || activo == 1) 
        ? `<span class="badge bg-success">Activo</span>` 
        : `<span class="badge bg-danger">Inactivo</span>`;
}

window.agregarProducto = function() {
    window.location.href = "./producto-form.html";
};

window.editarProducto = function(id) {
    window.location.href = `./producto-form.html?id=${id}`;
};

window.cerrarSesion = function() {
    localStorage.removeItem("adminLogueado");
    localStorage.removeItem("rol");
    localStorage.removeItem("token");
    window.location.href = "./login.html";
};

window.cambiarEstado = function(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    const nuevoEstado = !(producto.activo == true || producto.activo == 1);

    Swal.fire({
        title: nuevoEstado ? "¿Activar producto?" : "¿Desactivar producto?",
        text: nuevoEstado ? "El producto volverá a verse en la tienda." : "El producto dejará de verse en la tienda.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        reverseButtons: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const respuesta = await fetch(`${API_URL}/api/productos/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ activo: nuevoEstado })
                });

                if (!respuesta.ok) throw new Error("Error en el servidor al cambiar estado");

                Swal.fire({
                    icon: "success",
                    title: nuevoEstado ? "Producto activado" : "Producto desactivado",
                    timer: 1200,
                    showConfirmButton: false
                }).then(() => inicializarDashboard());
            } catch (err) {
                Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar la base de datos." });
            }
        }
    });
};

async function renderizarVentas() {
    const tablaVentas = document.getElementById("tabla-ventas");
    if (!tablaVentas) return;

    try {
        const respuesta = await fetch(`${API_URL}/api/ventas`);
        if (!respuesta.ok) throw new Error("No se pudieron obtener las ventas");
        const ventas = await respuesta.json();

        tablaVentas.innerHTML = ""; 

        if (ventas.length === 0) {
            tablaVentas.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">No hay ventas concluidas registradas.</td></tr>`;
            return;
        }

        tablaVentas.innerHTML = ventas.map(venta => {
            const nombreCliente = venta.cliente || 'Consumidor Final';
            const fechaOperacion = (venta.createdAt || venta.fecha)
                ? new Date(venta.createdAt || venta.fecha).toLocaleDateString('es-AR')
                : 'Fecha no disponible';
            const montoTotal = `$${parseFloat(venta.total || 0).toLocaleString('es-AR')}`;

            return `
                <tr>
                    <td class="fw-bold text-dark-emphasis ps-3">${nombreCliente}</td>
                    <td>${fechaOperacion}</td>
                    <td class="text-success fw-bold pe-3">${montoTotal}</td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        console.error("Error al renderizar ventas:", e);
        tablaVentas.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-3">No se pudo cargar el historial real</td></tr>`;
    }
}

async function renderizarEstadisticas() {
    try {
        const resVentas = await fetch(`${API_URL}/api/ventas`);
        const ventas = resVentas.ok ? await resVentas.json() : [];
        
        const productosActivos = productos.filter(p => p.activo == 1 || p.activo == true).length;
        const totalVendido = ventas.reduce((acc, venta) => acc + parseFloat(venta.total || 0), 0);

        const eProd = document.getElementById("estad-productos");
        const eVent = document.getElementById("estad-ventas");
        const eTotal = document.getElementById("estad-total");

        if (eProd) eProd.innerText = productosActivos;
        if (eVent) eVent.innerText = ventas.length;
        if (eTotal) eTotal.innerText = `$${totalVendido.toLocaleString('es-AR')}`;
    } catch (err) {
        console.log("Error al calcular estadísticas");
    }
}

window.descargarExcelVentas = async function() {
    try {
        const respuesta = await fetch(`${API_URL}/api/ventas`);
        if (!respuesta.ok) throw new Error("Error al obtener los datos");
        const historial = await respuesta.json();

        if (historial.length === 0) {
            Swal.fire({ title: 'No hay datos', text: 'Actualmente no existen ventas registradas.', icon: 'info' });
            return;
        }

        const datosFormateados = historial.map(venta => {
            const nombresProductos = (venta.productos && venta.productos.length > 0)
                ? venta.productos.map(p => `${p.nombre} (x${p.cantidad || 1})`).join(', ')
                : 'Sin detalle';

            return {
                'Cliente / Comprador': venta.cliente || 'Consumidor Final',
                'Fecha de Operación': new Date(venta.createdAt || venta.fecha).toLocaleDateString('es-AR'),
                'Productos Comprados': nombresProductos,
                'Monto Total Liquidado': `$${parseFloat(venta.total || 0).toLocaleString('es-AR')}`
            };
        });

        const hojaDeTrabajo = XLSX.utils.json_to_sheet(datosFormateados);
        const libroDeTrabajo = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Historial de Ventas");
        XLSX.writeFile(libroDeTrabajo, `Reporte_Ventas_PuntoTecno.xlsx`);
    } catch (err) {
        console.error("Error al descargar Excel:", err);
    }
};