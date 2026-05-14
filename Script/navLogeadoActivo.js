async function cargarNav() {
    const session = JSON.parse(localStorage.getItem('aureaEsmeraldaSession') || 'null');
    const archivo = session ? '../HTML/navLogin.html' : '../HTML/nav.html';

    try {
        const res  = await fetch(archivo);
        const html = await res.text();

        const parser = new DOMParser();
        const doc    = parser.parseFromString(html, 'text/html');

        const placeholder = document.getElementById('nav-container')
            || document.getElementById('navbar-placeholder');
        if (!placeholder) return;

        placeholder.innerHTML = doc.body.innerHTML;

        iniciarBadgeCarrito();
        if (session) iniciarSidebar(session);

    } catch (err) {
        console.error('navLogeadoActivo: error cargando navbar:', err);
    }
}

function iniciarBadgeCarrito() {
    function actualizarBadge() {
        const badge = document.getElementById('cart-badge');
        if (!badge) return;
        const carrito = JSON.parse(localStorage.getItem('aurea_cart') || '[]');
        const total   = carrito.length;
        badge.innerText     = total;
        badge.style.display = total > 0 ? 'flex' : 'none';
    }
    actualizarBadge();
    window.addEventListener('storage', actualizarBadge);
    setInterval(actualizarBadge, 1000);
}

function iniciarSidebar(session) {
    const nombreCorto = session?.nombre?.split(' ')[0] || 'Usuario';

    const elNavNombre     = document.getElementById('nombreUsuario');
    const elSidebarNombre = document.getElementById('sidebarNombre');
    const elSidebarEmail  = document.getElementById('sidebarEmail');

    if (elNavNombre)     elNavNombre.textContent     = nombreCorto;
    if (elSidebarNombre) elSidebarNombre.textContent = session?.nombre || '—';
    if (elSidebarEmail)  elSidebarEmail.textContent  = session?.email  || '—';

    const sidebar   = document.getElementById('sidebarUsuario');
    const overlay   = document.getElementById('sidebarOverlay');
    const btnAbrir  = document.getElementById('btnSidebar');
    const btnCerrar = document.getElementById('cerrar');

    const abrirSidebar = () => {
        sidebar?.classList.add('active');
        overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    const cerrarSidebar = () => {
        sidebar?.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    };

    btnAbrir?.addEventListener('click', abrirSidebar);
    btnCerrar?.addEventListener('click', cerrarSidebar);
    overlay?.addEventListener('click', cerrarSidebar);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarSidebar(); });

    document.getElementById('cerrarSesionBtn')?.addEventListener('click', () => {
        localStorage.removeItem('aureaEsmeraldaSession');
        window.location.href = '../HTML/login.html';
    });
}

document.addEventListener('DOMContentLoaded', cargarNav);