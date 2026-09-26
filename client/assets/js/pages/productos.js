const API_URL = "https://puntotecno.onrender.com";

let productosData = [];
let carrito = JSON.parse(localStorage.getItem('carritoActual')) || [];
let paginaActual = 1;
let categoriaActual = "Todos";
const productosPorPagina = 8;

document.addEventListener('DOMContentLoaded', () => {
    const nombreUsuario = localStorage.getItem("cliente");

    if (!nombreUsuario) {
        window.location.href = './login-cliente.html';
        return;
    }
    
    const spanUsuario = document.getElementById("usuario-logueado");
    const btnLogout = document.getElementById("btn-logout");
    const linkMisCompras = document.getElementById("link-mis-compras");

    if (spanUsuario) { 
        spanUsuario.textContent = `Hola, ${nombreUsuario}`;
        spanUsuario.classList.remove("d-none");
    }

    if (btnLogout) btnLogout.classList.remove("d-none");
    if (linkMisCompras) linkMisCompras.classList.remove("d-none");

    const btnAnt = document.getElementById('btn-anterior');
    const btnSig = document.getElementById('btn-siguiente');

    if (btnAnt) {
        btnAnt.addEventListener('click', () => {
            if (paginaActual > 1) {
                paginaActual--;
                renderizarTienda(categoriaActual);
            }
        });
    }

    if (btnSig) {
        btnSig.addEventListener('click', () => {
            paginaActual++;
            renderizarTienda(categoriaActual);
        });
    }
            
    cargarProductosDesdeAPI();
    
    const btnCarrito = document.getElementById('btn-ver-carrito');
    if (btnCarrito) btnCarrito.onclick = verCarrito;
    
    actualizarContador();
});

async function cargarProductosDesdeAPI() {
    const contenedor = document.getElementById('lista-productos');
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="col-12 text-center p-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">Cargando catálogo...</p>
            </div>`;
    }

    try {
        const respuesta = await fetch(`${API_URL}/api/productos`);
        if (!respuesta.ok) throw new Error(`Estado ${respuesta.status}`);

        const respuestaJson = await respuesta.json();

        let arrayProductos = [];
        if (Array.isArray(respuestaJson)) {
            arrayProductos = respuestaJson;
        } else if (Array.isArray(respuestaJson.data)) {
            arrayProductos = respuestaJson.data;
        } else if (Array.isArray(respuestaJson.productos)) {
            arrayProductos = respuestaJson.productos;
        } else if (Array.isArray(respuestaJson.rows)) {
            arrayProductos = respuestaJson.rows;
        }

        productosData = arrayProductos.map(p => {
            let nombreImagen = p.imagen || p.Imagen || p.image || 'favicon.png';
            if (!nombreImagen || nombreImagen === 'null' || nombreImagen === 'undefined' || String(nombreImagen).trim() === '') {
                nombreImagen = 'favicon.png';
            }

            let rutaImagenFinal = nombreImagen;
            if (!nombreImagen.startsWith('http')) {
                const nombreLimpio = nombreImagen.replace(/^\/?(assets\/img\/|public\/|images\/)?/, '');
                rutaImagenFinal = `${API_URL}/assets/img/${nombreLimpio}`;
            }

            return {
                id: p.id,
                nombre: p.nombre || "Producto sin nombre",
                precio: p.precio || 0,
                categoria: p.categoria || "General",
                stock: p.stock !== undefined ? p.stock : 10,
                activo: p.activo !== undefined ? p.activo : true,
                imagen: rutaImagenFinal
            };
        });

        renderizarTienda(categoriaActual);

    } catch (error) {
        console.error('Error al cargar productos:', error);
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="col-12 text-center p-5">
                    <p class="alert alert-danger d-inline-block px-5">Error al cargar productos. Por favor recargá la página.</p>
                </div>`;
        }
    }
}

function actualizarBotones(totalProductos) {
    const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
    const btnAnt = document.getElementById('btn-anterior');
    const btnSig = document.getElementById('btn-siguiente');
    
    if (btnAnt) btnAnt.disabled = (paginaActual === 1);
    if (btnSig) btnSig.disabled = (paginaActual >= totalPaginas || totalPaginas === 0);
    
    const infoPag = document.getElementById('info-pagina');
    if (infoPag) {
        infoPag.innerText = `Página ${paginaActual} de ${Math.max(1, totalPaginas)}`;
    }
}

function normalizarTexto(texto) {
    if (!texto) return "";
    return texto
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

window.renderizarTienda = function (categoria = "Todos") {
    const contenedor = document.getElementById('lista-productos');
    if (!contenedor) return;

    if (categoria !== categoriaActual) {
        paginaActual = 1;
        categoriaActual = categoria;
    }

    const catBuscadaNormalizada = normalizarTexto(categoria);

    const productosAMostrar = productosData.filter(p => {
        const estaActivo = (p.activo === true || p.activo === 1 || p.activo === "1" || p.activo === null || p.activo === undefined);
        
        const catProductoNormalizada = normalizarTexto(p.categoria);
        const coincideCategoria = (catBuscadaNormalizada === "todos" || catProductoNormalizada === catBuscadaNormalizada);

        return estaActivo && coincideCategoria;
    });

    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosAMostrar.slice(inicio, fin);

    if (productosAMostrar.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center p-5">
                <p class="alert alert-info d-inline-block px-5">No hay productos disponibles en esta categoría.</p>
            </div>`;
        actualizarBotones(0);
        return;
    }

    contenedor.innerHTML = productosPagina.map(p => `
        <div class="col">
            <div class="card h-100 tarjeta-producto shadow-sm border-0 rounded-4 overflow-hidden">
                <div class="position-relative text-center p-3" style="height: 180px; display: flex; align-items: center; justify-content: center; background:linear-gradient(180deg,#2b3a52,#243248); border-bottom:1px solid rgba(255,255,255,.08);">
                    <img src="${p.imagen}" 
                         alt="${p.nombre}" 
                         class="img-fluid rounded-3" 
                         style="max-height: 100%; object-fit: contain;"
                         onerror="this.src='../assets/img/favicon.png'">
                </div>
                <div class="card-body d-flex flex-column text-center pt-2">
                    <span class="badge bg-secondary-subtle text-secondary-emphasis align-self-center mb-2 px-3 rounded-pill small">${p.categoria}</span>
                    <h5 class="fw-bold mb-1 h6 titulo-producto text-truncate" title="${p.nombre}">${p.nombre}</h5>
                    <p class="text-danger fw-bold h5 my-2">$${parseFloat(p.precio).toLocaleString('es-AR')}</p>
                    <p class="text-muted small mb-3">Stock: ${p.stock} u.</p>
                    <button class="btn btn-primary w-100 rounded-pill mt-auto fw-bold" onclick="agregar(${p.id})">
                        <i class="bi bi-plus-circle me-2"></i>Agregar
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    actualizarBotones(productosAMostrar.length);
};

window.agregar = function (id) {
    const producto = productosData.find(p => p.id == id);
    if (!producto) return;

    const stockDisponible = Number(producto.stock);
    const existe = carrito.find(p => p.id == id);
    const cantidadActual = existe ? Number(existe.cantidad) : 0;

    if (stockDisponible > 0 && cantidadActual >= stockDisponible) {
        Swal.fire({
            icon: 'warning',
            title: 'Stock insuficiente',
            text: `Solo hay ${stockDisponible} unidad/es disponibles de ${producto.nombre}.`,
            confirmButtonColor: '#06b6d4'
        });
        return;
    }

    if (existe) {
        existe.cantidad++;
        existe.quantity = existe.cantidad;
    } else {
        carrito.push({ ...producto, quantity: 1, cantidad: 1 });
    }

    localStorage.setItem('carritoActual', JSON.stringify(carrito));
    actualizarContador();

    Swal.fire({
        title: '¡Añadido al carrito!',
        text: `${producto.nombre} se agregó al carrito`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'bottom-end'
    });
};

function actualizarContador() {
    const btnCarrito = document.getElementById('btn-ver-carrito');
    if (!btnCarrito) return;

    const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    btnCarrito.innerHTML = `<i class="bi bi-cart4 me-2"></i>Ver Carrito <span class="badge bg-white text-success rounded-circle ms-1">${totalItems}</span>`;
}

window.verCarrito = function () {
    if (carrito.length === 0) {
        Swal.fire({
            title: 'Carrito vacío',
            text: 'Debes agregar productos antes de ver el resumen.',
            icon: 'warning',
            confirmButtonColor: '#06b6d4'
        });
        return;
    }
    window.location.href = './carrito.html';
};

window.cerrarSesion = function () {
    Swal.fire({
        title: "¿Cerrar sesión?",
        text: "Se cerrará tu sesión actual.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc3545",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("usuarioId");
            localStorage.removeItem("cliente");
            localStorage.removeItem("usuarioLogueado");
            window.location.href = "../index.html";
        }
    });
};