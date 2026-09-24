const htmlElement = document.documentElement;

const temaGuardado = localStorage.getItem('tema') || 'light';
htmlElement.setAttribute('data-bs-theme', temaGuardado);


document.addEventListener("DOMContentLoaded", () => {
    const btnTema = document.getElementById('btn-tema');
    const iconoTema = document.getElementById('icono-tema');
    const btnAdmin = document.getElementById('btn-admin');

    sincronizarComponentesVisuales(temaGuardado, btnTema, iconoTema);

    if (btnTema) {
        btnTema.addEventListener('click', () => {
            const temaActual = htmlElement.getAttribute('data-bs-theme');
            const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-bs-theme', nuevoTema);
            localStorage.setItem('tema', nuevoTema);
            
            sincronizarComponentesVisuales(nuevoTema, btnTema, iconoTema);
        });
    }

    if (btnAdmin) {
        btnAdmin.addEventListener('click', () => {
            const oscuro = esOscuro();
            Swal.fire({
                title: 'Módulo en Análisis',
                text: 'Se encuentra en fase de desarrollo.',
                icon: 'info',
                background: oscuro ? '#333' : '#fff',
                color: oscuro ? '#fff' : '#000',
                confirmButtonColor: '#06b6d4',
                confirmButtonText: 'Cerrar',
            });
        });
    }
});

function sincronizarComponentesVisuales(tema, btnTema, iconoTema) {
    if (tema === 'dark') {
        document.body.classList.add('oscuro');
        
        if (iconoTema) {
            iconoTema.classList.remove('bi-sun-fill');
            iconoTema.classList.add('bi-moon-fill');
        }
        
        if (btnTema) {
            btnTema.classList.remove('btn-outline-warning');
            btnTema.classList.add('btn-outline-info');
        }
    } else {
        document.body.classList.remove('oscuro');
        
        if (iconoTema) {
            iconoTema.classList.remove('bi-moon-fill');
            iconoTema.classList.add('bi-sun-fill');
        }
        
        if (btnTema) {
            btnTema.classList.remove('btn-outline-info');
            btnTema.classList.add('btn-outline-warning');
        }
    }
}

function esOscuro() {
    return htmlElement.getAttribute('data-bs-theme') === 'dark';
}