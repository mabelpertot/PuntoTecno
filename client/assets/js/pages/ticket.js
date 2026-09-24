const API_URL = "https://puntotecno.onrender.com"; // URL pública de tu backend en Render

const carrito = JSON.parse(localStorage.getItem('carritoTicket')) || [];
const cliente = localStorage.getItem('clienteTicket') || localStorage.getItem('cliente') || "Consumidor Final";

const btnSalir = document.getElementById('btn-salir');
if (btnSalir) {
    btnSalir.onclick = salir;
}

document.addEventListener('DOMContentLoaded', () => {

    const clienteGuardado = localStorage.getItem('clienteTicket') || localStorage.getItem('cliente');

    if (!clienteGuardado) {
        window.location.href = '../index.html';
        return;
    }  

    mostrarResumenEnPantalla();

    const btnDescargar = document.getElementById('btn-descargar');
    if (btnDescargar) btnDescargar.onclick = generarPDF;
});

function mostrarResumenEnPantalla() {
    const contenedor = document.getElementById('detalle-ticket');
    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-3">
                <i class="bi bi-exclamation-triangle text-warning fs-1"></i>
                <p class="mt-2">No hay productos registrados en esta compra.</p>
            </div>`;
        return;
    }

    const fechaActual = new Date().toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let total = 0;
    
    let html = `
        <div class="border-bottom border-secondary border-opacity-25 pb-3 mb-3">
            <h5 class="fw-bold text-uppercase mb-1">Comprobante No Válido como Factura</h5>
            <p class="mb-0 small"><strong>Cliente:</strong> ${cliente}</p>
            <p class="mb-0 small"><strong>Fecha:</strong> ${fechaActual}</p>
        </div>
        <div class="mb-3">`;

    carrito.forEach(p => {
        const subtotal = p.precio * p.cantidad;
        total += subtotal;
        html += `
            <div class="d-flex justify-content-between mb-2">
                <span class="text-truncate me-2">${p.nombre} (x${p.cantidad})</span>
                <span class="fw-semibold text-nowrap">$${subtotal.toLocaleString('es-AR')}</span>
            </div>`;
    });

    html += `</div>
        <div class="border-top border-dark border-opacity-50 pt-3 d-flex justify-content-between align-items-center">
            <span class="h5 mb-0 fw-bold">TOTAL PAGADO</span>
            <span class="h3 mb-0 fw-bold text-primary">$${total.toLocaleString('es-AR')}</span>
        </div>`;

    contenedor.innerHTML = html;
}

async function generarPDF() {
    if (carrito.length === 0) return;

    try {
        const { PDFDocument, StandardFonts, rgb } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        
        const alturaBase = 250; 
        const espacioPorProducto = 25;
        const alturaCalculada = alturaBase + (carrito.length * espacioPorProducto);
        
        const page = pdfDoc.addPage([420, alturaCalculada]);
        
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        const esOscuro = document.documentElement.getAttribute('data-bs-theme') === 'dark';

        const logoUrl = `${API_URL}/assets/img/favicon.png`;
        const logoBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
        const logoImage = await pdfDoc.embedPng(logoBytes);
        const logoDims = logoImage.scale(0.4);

        let y = alturaCalculada - 50;

        page.drawImage(logoImage, { x: 40, y: y - 5, width: logoDims.width, height: logoDims.height });
        page.drawText("PUNTO TECNO S.A.", { x: 80, y, size: 20, font: fontBold, color: rgb(0.02, 0.45, 0.88) });
        
        y -= 45;
        page.drawText(`CLIENTE: ${cliente.toUpperCase()}`, { x: 40, y, size: 10, font: fontNormal, color: rgb(0.2, 0.2, 0.2) });
        y -= 15;
        page.drawText(`FECHA: ${new Date().toLocaleString('es-AR')}`, { x: 40, y, size: 10, font: fontNormal, color: rgb(0.2, 0.2, 0.2) });
        y -= 20;
        
        page.drawLine({ start: { x: 40, y }, end: { x: 380, y }, thickness: 1, opacity: 0.2 });
        y -= 25;

        carrito.forEach(p => {
            const itemTexto = `${p.cantidad}x  ${p.nombre.substring(0, 32)}`;
            const precioTexto = `$${(p.precio * p.cantidad).toLocaleString('es-AR')}`;
            
            page.drawText(itemTexto, { x: 40, y, size: 10, font: fontNormal });
            page.drawText(precioTexto, { x: 320, y, size: 10, font: fontNormal });
            y -= 22;
        });

        y -= 10;
        page.drawLine({ start: { x: 40, y }, end: { x: 380, y }, thickness: 1.5, opacity: 0.7 });
        y -= 25;

        const totalFinal = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
        page.drawText("TOTAL LIQUIDADO:", { x: 40, y, size: 14, font: fontBold });
        page.drawText(`$${totalFinal.toLocaleString('es-AR')}`, { x: 290, y, size: 14, font: fontBold, color: rgb(0.02, 0.45, 0.88) });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Ticket_PuntoTecno_${Date.now()}.pdf`;
        link.click();

        setTimeout(() => {
            Swal.fire({
                title: '¡PDF descargado!',
                text: 'Tu ticket fue generado y guardado correctamente.',
                icon: 'success',
                background: esOscuro ? '#333' : '#fff',
                color: esOscuro ? '#fff' : '#000',
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }, 800);

    } catch (error) {
        console.error("Error al procesar el documento PDF mediante PDF-Lib:", error);
        Swal.fire('Error de Impresión', 'Ocurrió un inconveniente al empaquetar el comprobante.', 'error');
    }
}

function salir() {
    localStorage.removeItem('carritoActual');
    localStorage.removeItem('carritoTicket');
    localStorage.removeItem('clienteTicket');
    localStorage.removeItem('ultimaVentaId');
    
    Swal.fire({
        title: '¡Muchas gracias por tu compra!',
        text: 'Regresando a la pantalla de bienvenida...',
        icon: 'success',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false
    }).then(() => {
        window.location.href = '../index.html';
    });
}