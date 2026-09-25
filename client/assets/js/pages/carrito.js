const API_URL = "https://puntotecno.onrender.com";

let carrito = JSON.parse(localStorage.getItem('carritoActual')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogueado = localStorage.getItem("usuarioLogueado");
    if (!usuarioLogueado) {
        window.location.href = './login-cliente.html';
        return;
    }

    renderizarCarrito();

    const btnConfirmar = document.getElementById('btn-confirmar');
    const btnVaciar = document.getElementById('btn-vaciar');

    if (btnConfirmar) btnConfirmar.onclick = confirmarPedido;
    if (btnVaciar) btnVaciar.onclick = vaciarCarrito;
});

function renderizarCarrito() {
    const contenedor = document.getElementById('lista-productos');
    const cantItemsSpan = document.getElementById('cant-items');
    const totalResumenSpan = document.getElementById('total-resumen');

    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="bi bi-cart-x display-1 d-block mb-3"></i>
                <h4 class="fw-bold">Tu carrito está vacío</h4>
                <p>Agregá productos desde el catálogo para continuar.</p>
            </div>`;
        if (cantItemsSpan) cantItemsSpan.innerText = "0";
        if (totalResumenSpan) totalResumenSpan.innerText = "$0";
        return;
    }

    let totalCalculado = 0;
    let itemsTotales = 0;

    contenedor.innerHTML = carrito.map((p, index) => {
        const subtotal = p.precio * p.cantidad;
        totalCalculado += subtotal;
        itemsTotales += p.cantidad;

        return `
            <div class="card border-0 shadow-sm rounded-3 p-3">
                <div class="row align-items-center g-3">
                    <div class="col-3 col-md-2 text-center">
                        <img src="${p.imagen}" alt="${p.nombre}" class="img-fluid rounded-2" style="max-height: 70px; object-fit: contain;" onerror="this.src='../assets/img/favicon.png'">
                    </div>
                    <div class="col-9 col-md-4">
                        <h6 class="fw-bold mb-1 text-truncate">${p.nombre}</h6>
                        <span class="badge bg-secondary-subtle text-secondary-emphasis rounded-pill small">${p.categoria}</span>
                    </div>
                    <div class="col-6 col-md-3 d-flex align-items-center justify-content-center gap-2">
                        <button class="btn btn-outline-secondary btn-sm rounded-circle px-2" onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span class="fw-bold px-2">${p.cantidad}</span>
                        <button class="btn btn-outline-secondary btn-sm rounded-circle px-2" onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                    <div class="col-6 col-md-3 text-end">
                        <span class="fw-bold text-primary h6 mb-0 d-block">$${subtotal.toLocaleString('es-AR')}</span>
                        <button class="btn btn-link text-danger p-0 small text-decoration-none" onclick="eliminarItem(${index})">
                            <i class="bi bi-trash me-1"></i>Quitar
                        </button>
                    </div>
                </div>
            </div>`;
    }).join('');

    if (cantItemsSpan) cantItemsSpan.innerText = itemsTotales;
    if (totalResumenSpan) totalResumenSpan.innerText = `$${totalCalculado.toLocaleString('es-AR')}`;
}

window.cambiarCantidad = function(index, cambio) {
    if (!carrito[index]) return;

    const producto = carrito[index];
    const nuevaCantidad = producto.cantidad + cambio;

    if (nuevaCantidad <= 0) {
        eliminarItem(index);
        return;
    }

    if (nuevaCantidad > Number(producto.stock)) {
        Swal.fire({
            icon: 'warning',
            title: 'Límite de stock',
            text: `Solo disponemos de ${producto.stock} unidades.`,
            confirmButtonColor: '#06b6d4'
        });
        return;
    }

    producto.cantidad = nuevaCantidad;
    producto.quantity = nuevaCantidad;
    guardarYActualizar();
};

window.eliminarItem = function(index) {
    carrito.splice(index, 1);
    guardarYActualizar();
};

window.vaciarCarrito = function() {
    if (carrito.length === 0) return;

    Swal.fire({
        title: '¿Vaciar carrito?',
        text: 'Se eliminarán todos los productos seleccionados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545'
    }).then((res) => {
        if (res.isConfirmed) {
            carrito = [];
            guardarYActualizar();
        }
    });
};

function guardarYActualizar() {
    localStorage.setItem('carritoActual', JSON.stringify(carrito));
    renderizarCarrito();
}

async function confirmarPedido() {
    if (carrito.length === 0) return;

    const usuarioId = localStorage.getItem("usuarioId");
    const cliente = localStorage.getItem("cliente") || "Consumidor Final";

    if (!usuarioId) {
        Swal.fire({
            icon: 'error',
            title: 'Sesión expirada',
            text: 'Iniciá sesión nuevamente para registrar la compra.'
        }).then(() => window.location.href = './login-cliente.html');
        return;
    }

    const totalCalculado = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

    const datosVenta = {
        usuarioId: Number(usuarioId),
        cliente,
        total: totalCalculado,
        productos: carrito.map(p => ({
            id: p.id,
            cantidad: p.cantidad,
            precio: p.precio
        }))
    };

    try {
        Swal.fire({
            title: 'Procesando compra...',
            text: 'Registrando la venta en Clever Cloud',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const respuesta = await fetch(`${API_URL}/api/ventas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosVenta)
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(data.error || "No se pudo concretar la venta.");
        }

        // Guardar respaldo para generar comprobante
        localStorage.setItem('carritoTicket', JSON.stringify(carrito));
        localStorage.setItem('clienteTicket', cliente);
        localStorage.setItem('ultimaVentaId', data.venta ? data.venta.id : Date.now());

        // Limpiar carrito actual de la sesión
        localStorage.removeItem('carritoActual');

        await Swal.fire({
            icon: 'success',
            title: '¡Compra exitosa!',
            text: 'Tu pedido ha sido procesado correctamente.',
            timer: 1500,
            showConfirmButton: false
        });

        window.location.href = './ticket.html';

    } catch (err) {
        console.error("Error al confirmar pedido:", err);
        Swal.fire({
            icon: 'error',
            title: 'Error en la transacción',
            text: err.message
        });
    }
}