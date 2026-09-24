let carrito = JSON.parse(localStorage.getItem('carritoActual')) || [];
const usuarioId = localStorage.getItem('usuarioId');

document.addEventListener('DOMContentLoaded', () => {
    renderizarResumen();

    const btnConfirmar = document.getElementById('btn-confirmar');
    if (btnConfirmar) btnConfirmar.onclick = finalizarCompra;

    const btnVaciar = document.getElementById('btn-vaciar');
    if (btnVaciar) btnVaciar.onclick = vaciarCarritoCompleto;
});

function renderizarResumen() {
    const contenedor = document.getElementById('lista-productos');
    const totalTxt = document.getElementById('total-resumen');
    const cantTxt = document.getElementById('cant-items');

    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center p-5 bg-body-tertiary rounded-4">
                <i class="bi bi-cart-x display-1 text-secondary"></i>
                <p class="mt-3">Tu carrito está actualmente vacío.</p>
            </div>`;
        if (totalTxt) totalTxt.innerText = "$0";
        if (cantTxt) cantTxt.innerText = "0";
        return;
    }

    let totalAcumulado = 0;
    let totalCant = 0;

    contenedor.innerHTML = carrito.map(p => {
        const subtotal = p.precio * p.cantidad;
        totalAcumulado += subtotal;
        totalCant += p.cantidad;

        return `
            <div class="card card-carrito shadow-sm p-3 mb-3 border-0 rounded-4">
                <div class="row align-items-center">
                    <div class="col-3 col-md-2">
                        <img src="${p.imagen}" class="item-carrito-img img-fluid rounded" alt="${p.nombre}">
                    </div>
                    <div class="col-9 col-md-5">
                        <h5 class="mb-0 fw-bold">${p.nombre}</h5>
                        <small class="text-secondary">Precio unitario: $${parseFloat(p.precio).toLocaleString('es-AR')}</small>
                    </div>
                    <div class="col-12 col-md-5 d-flex align-items-center justify-content-md-end gap-2 mt-3 mt-md-0">
                        <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="actualizarCantidad(${p.id}, -1)">
                            <i class="bi bi-dash"></i>
                        </button>
                        <span class="fw-bold px-2">${p.cantidad}</span>
                        <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="actualizarCantidad(${p.id}, 1)">
                            <i class="bi bi-plus"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-3 rounded-pill" onclick="eliminarProducto(${p.id})">
                            <i class="bi bi-trash"></i> Borrar
                        </button>
                    </div>
                </div>
            </div>`;
    }).join('');

    if (totalTxt) totalTxt.innerText = `$${totalAcumulado.toLocaleString('es-AR')}`;
    if (cantTxt) cantTxt.innerText = totalCant; 
}

window.actualizarCantidad = (id, cambio) => {
    localStorage.setItem('compraConfirmada', 'false');
    const producto = carrito.find(p => p.id === id);
    
    if (producto) {
        producto.cantidad += cambio;

        if (producto.cantidad <= 0) {
            carrito = carrito.filter(p => p.id !== id);
        } else {
            Swal.fire({
                title: 'Carrito actualizado',
                text: `${producto.nombre}: ${producto.cantidad} un.`,
                icon: 'success',
                timer: 1000,
                showConfirmButton: false,
                toast: true,
                position: 'bottom-end'
            });
        }
    }
    guardarYRefrescar();
};

window.eliminarProducto = (id) => {
    const producto = carrito.find(p => p.id === id);
    if (!producto) return;

    carrito = carrito.filter(p => p.id !== id);

    Swal.fire({
        title: 'Producto eliminado',
        text: `${producto.nombre} se quitó del carrito`,
        icon: 'info',
        timer: 1500,
        showConfirmButton: false, 
        toast: true,
        position: 'bottom-end'
    });
 
    guardarYRefrescar();
};

function vaciarCarritoCompleto() {

    Swal.fire({
        title: "¿Vaciar carrito?",
        text: "Se eliminarán todos los productos agregados.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, vaciar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc3545",
        reverseButtons: true
    }).then((result) => {

        if (result.isConfirmed) {
            localStorage.removeItem("carritoActual");
            carrito = [];

            Swal.fire({
                icon: "success",
                title: "Carrito vacío",
                text: "Redirigiendo a la tienda...",
                timer: 3000,
                showConfirmButton: false,
                timerProgressBar: true
            }).then(() => {
                window.location.href = "./productos.html";
            });
        }
    });
}

async function finalizarCompra() {
    if (carrito.length === 0) return;

    const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

    const result = await Swal.fire({
        title: '¿Confirmar Pedido?',
        text: `El total de tu compra es $${total.toLocaleString('es-AR')}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, finalizar',
        cancelButtonText: 'No, volver',
        confirmButtonColor: '#06b6d4',
        cancelButtonColor: '#64748b',
        reverseButtons: true
    });

    if (result.isConfirmed) {
        Swal.fire({
            title: 'Procesando tu pedido...',
            text: 'Estamos registrando la venta en nuestro sistema.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const datosVenta = {
                usuario_id: localStorage.getItem('usuarioId'),
                //cliente: localStorage.getItem('cliente') || "Consumidor Final",
                //usuario: localStorage.getItem('cliente') || "Consumidor Final",
                total: total,
                productos: carrito.map(p => ({
                    id: p.id,
                    cantidad: p.cantidad,
                    precio: p.precio
                }))
            };

            const respuesta = await fetch('http://localhost:3000/api/ventas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosVenta)
            });

            const resultadoAPI = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(resultadoAPI.error || 'Error al procesar la venta.');
            }

            localStorage.setItem('compraConfirmada', 'true');
            localStorage.setItem('ultimaVentaId', resultadoAPI.ventaId); 

            localStorage.setItem('carritoTicket', JSON.stringify(carrito));
            localStorage.setItem('clienteTicket', localStorage.getItem('cliente') || "Consumidor Final");

            localStorage.removeItem('carritoActual');
            carrito = [];

            window.location.href = './ticket.html';

        } catch (error) {
            console.error('Error al procesar la venta:', error);
            Swal.fire({
                title: 'Error al finalizar la compra',
                text: error.message || 'No se pudo conectar con el servidor.',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        }
    }
}

function guardarYRefrescar() {
    localStorage.setItem('carritoActual', JSON.stringify(carrito));
    renderizarResumen();

    if (carrito.length === 0) {
        const esOscuro = document.documentElement.getAttribute('data-bs-theme') === 'dark';

        Swal.fire({
            title: 'Carrito vacío',
            text: 'No quedan elementos. ¿A dónde deseas ir?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Ir a Inicio',
            cancelButtonText: 'Volver a Tienda',
            background: esOscuro ? '#333' : '#fff',
            color: esOscuro ? '#fff' : '#000'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "../index.html";
            } else {
                window.location.href = "./productos.html";
            }
        });
    }
}