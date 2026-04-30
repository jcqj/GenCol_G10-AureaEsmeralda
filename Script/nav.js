// nav badge


function actualizarBadgeCarrito() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    const data = localStorage.getItem('aurea_cart');
    const carrito = JSON.parse(data) || [];
    const total = carrito.length;

    if (total > 0) {
        badge.innerText = total;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}


// Ejecutar siempre al cargar
actualizarBadgeCarrito();

//  si  agrega cosas
window.addEventListener('storage', actualizarBadgeCarrito);
// Un pequeño intervalo por si acaso el código no dispara el evento storage
setInterval(actualizarBadgeCarrito, 1000);