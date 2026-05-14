import { getTodosProductos } from "./services/productService.js";

document.addEventListener("DOMContentLoaded", () => {
    cargarSugerencias();
});

function cargarSugerencias() {
    const contenedor = document.getElementById('recomendacion');
    const todosLosProductos = getTodosProductos();
    const carritoActual = JSON.parse(localStorage.getItem('aurea_cart')) || [];

    // Filtrar productos que no están en carrito
    const sugeridos = todosLosProductos.filter(p =>
        !carritoActual.some(item => item.id === p.id)
    ).slice(0, 6);

    contenedor.innerHTML = ""; // Limpiar

    sugeridos.forEach(producto => {
        // Imagen principal
        const imgPrincipal = producto.imagen
            ? `<img class="rec-img-principal" src="${producto.imagen}" alt="${producto.nombre}">`
            : `<div class="rec-img-placeholder"><i class="bi bi-image"></i></div>`;

        // Imagen secundaria — solo si existe
        const imgSecundaria = producto.imagenSecundaria
            ? `<img class="rec-img-secundaria" src="${producto.imagenSecundaria}" alt="${producto.nombre} - vista 2">`
            : '';

        const item = document.createElement('div');
        item.className = 'elementos';
        item.innerHTML = `
            <div class="card h-100 shadow-sm border-0 rec-card">
                <div class="rec-img-wrap">
                    ${imgPrincipal}
                    ${imgSecundaria}
                </div>
                <div class="card-body p-3">
                    <h6 class="fw-bold mb-1">${producto.nombre}</h6>
                    <p class="text-primary fw-bold mb-3">$${Number(producto.precioFinal ?? producto.precio).toLocaleString("es-CO")}</p>
                    <button class="btn btn-outline-dark btn-sm w-100 btn-agregar" data-id="${producto.id}">
                        Agregar <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(item);
    });

    configurarNavegacion();

    // Eventos de botones agregar
    contenedor.querySelectorAll('.btn-agregar').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.closest('button').dataset.id;
            agregarDesdeSugerencia(id);
        };
    });
}

function configurarNavegacion() {
    const btnSiguiente = document.getElementById('btnSiguiente');
    const btnAtras = document.getElementById('btnAtras');
    const contenedor = document.getElementById('recomendacion');
    let intervalo;

    if (btnSiguiente && btnAtras && contenedor) {

        const iniciarScroll = (velocidad) => {
            clearInterval(intervalo);
            intervalo = setInterval(() => {
                contenedor.scrollLeft += velocidad;
            }, 10); // Suavidad del movimiento
        };

        const detenerScroll = () => clearInterval(intervalo);

        //  Mouse para Siguiente
        btnSiguiente.addEventListener('mouseenter', () => iniciarScroll(8));
        btnSiguiente.addEventListener('mouseleave', detenerScroll);

        //  Mouse para Atrás
        btnAtras.addEventListener('mouseenter', () => iniciarScroll(-8));
        btnAtras.addEventListener('mouseleave', detenerScroll);

        // Mantener el click por si acaso
        btnSiguiente.onclick = () => contenedor.scrollBy({ left: 300, behavior: 'smooth' });
        btnAtras.onclick = () => contenedor.scrollBy({ left: -300, behavior: 'smooth' });
    }
}



// function agregarDesdeSugerencia(id) {
//     const todos = getTodosProductos();
//     const producto = todos.find(p => p.id == id);
//     let carrito = JSON.parse(localStorage.getItem('aurea_cart')) || [];

//     // Evitar duplicados con doble click
//     if (!carrito.some(item => item.id == id)) {
//         carrito.push({ ...producto, cantidad: 1 });
//         localStorage.setItem('aurea_cart', JSON.stringify(carrito));
//     }

//     // Recargar para refrescar vista
//      window.location.reload();
// }

function agregarDesdeSugerencia(id) {
    const todos = getTodosProductos();
    const producto = todos.find(p => p.id == id);
    let carrito = JSON.parse(localStorage.getItem('aurea_cart')) || [];

    if (!carrito.some(item => item.id == id)) {
        carrito.push({ ...producto, cantidad: 1 });
        localStorage.setItem('aurea_cart', JSON.stringify(carrito));

        // 1. Actualiza el Badge del Navbar
        window.dispatchEvent(new Event('cart-updated'));

        // Actualiza la lista del carrito sin recargar y limpiamos para que no se dupliquen

        const contenedor = document.getElementById('contenedorCardss');
        if (contenedor) {
            contenedor.innerHTML = ""; // Limpiamos la lista vieja
            cargarProductos();       //  el nuevo item
        }

        // Actualizala lista de sugerencias
        cargarSugerencias();
    }
}