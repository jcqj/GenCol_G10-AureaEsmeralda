import { getTodosProductos } from "./services/productService.js";

// ======= AGREGAR AL CARRITO =======
function addToCart(idProducto) {
    const productos = getTodosProductos();
    const producto = productos.find(p => p.id == idProducto);
    if (!producto) return;

    const carritoActual = JSON.parse(localStorage.getItem('aurea_cart')) || [];
    const existe = carritoActual.find(p => p.id == idProducto);

    if (existe) {
        existe.cantidad = (existe.cantidad || 1) + 1;
    } else {
        carritoActual.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precioFinal ?? producto.precio),
            imagen: producto.imagen,
            cantidad: 1,
            categoria: producto.categoria,
            descripcion: producto.descripcion
        });
    }

    localStorage.setItem('aurea_cart', JSON.stringify(carritoActual));
    mostrarToast();
}

function mostrarToast() {
    const toastEl = document.getElementById("cart-toast");
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// ======= CARGAR TODOS LOS PRODUCTOS =======
function cargarProductos() {
    const productos = getTodosProductos();
    productos.forEach(producto => crearCard(producto));
}


// ======= CREAR CARD DE UN PRODUCTO =======
export function crearCard(producto) {
    const contenedor = document.getElementById('contenedorCards');

    const card = document.createElement('div');
    card.className = 'col-12 col-sm-6 col-lg-4 col-xl-3 product-item';
    card.setAttribute('data-id', producto.id);

    // Badge de disponibilidad
    const badgeColor = {
        'Disponible': 'success',
        'No disponible': 'danger',
        'Agotado': 'warning'
    };
    const color = badgeColor[producto.disponibilidad] || 'secondary';

    // Imagen principal
    const imagenPrincipal = producto.imagen
        ? `<img class="img-principal" src="${producto.imagen}" alt="${producto.nombre}">`
        : `<div class="card-img-top bg-secondary d-flex align-items-center 
                    justify-content-center" style="height:180px;">
                <i class="bi bi-image text-white fs-1"></i>
            </div>`;

    // Imagen secundaria (hover) — solo si existe
    const imagenSecundaria = producto.imagenSecundaria
        ? `<img class="img-secundaria" src="${producto.imagenSecundaria}" alt="${producto.nombre} - vista 2">`
        : '';

    // Formatear fecha
    const fechaFormateada = new Date(producto.fecha + 'T00:00:00')
        .toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric'
        });

    // ── Precios ──
    // precioFinal: precio real a pagar (ya con descuento aplicado)
    // precioOriginal: precio sin descuento (para tachar)
    const precioFinal    = producto.precioFinal ?? producto.precio;
    const precioOriginal = producto.precioOriginal ?? producto.precio;
    const descuento      = producto.descuento ?? 0;

    const precioHTML = descuento > 0
        ? `<span class="price-current">$${Math.round(precioFinal).toLocaleString('es-CO')}</span>
           <span class="price-old">$${Math.round(precioOriginal).toLocaleString('es-CO')}</span>`
        : `<span class="price-current">$${Math.round(precioFinal).toLocaleString('es-CO')}</span>`;

    // ── Badge Best Seller ── solo si el producto lo tiene marcado
    const bestSellerBadge = producto.bestSeller
        ? `<span class="card-badge best">Best Seller</span>`
        : '';

    // ── Badge Descuento ── solo si aplica
    const descuentoBadge = descuento > 0
        ? `<span class="card-badge sale">-${descuento}%</span>`
        : '';

    card.innerHTML = `
        <div class="product-card">
            <div class="card-img-wrap">
                ${bestSellerBadge}
                ${descuentoBadge}
                <div class="img-container">
                    ${imagenPrincipal}
                    ${imagenSecundaria}
                </div>
            </div>
            <div class="card-body">
                <span class="product-category"><i class="bi bi-tag"></i>${producto.categoria}</span>
                <h5 class="product-name">${producto.nombre}</h5>
                <p class="product-desc">${producto.descripcion || 'Sin descripción'}</p>
                <div class="rating">★★★★★ <span>(128)</span></div>
                <div class="price-row">
                    ${precioHTML}
                </div>
                <div>
                    <span class="badge bg-${color}">${producto.disponibilidad}</span>
                </div>
                <div>
                    <span class="list-group-item text-muted small">
                        <i class="bi bi-calendar"></i> ${fechaFormateada}
                    </span>
                </div>
            </div>
            <div class="card-footer d-flex gap-2">
                <button class="btn-cart" data-id="${producto.id}">
                    <i class="bi bi-bag-plus me-1"></i>Agregar
                </button>
                <button class="btn-wishlist btn-sm btn-favorito" data-id="${producto.id}">
                    <i class="bi ${esFavorito(producto.id) ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i>
                </button>
            </div>
        </div>
    `;

    contenedor.prepend(card);
}


// ======= BORRAR CARD Y DEL LOCALSTORAGE =======
function borrarCard(id, card) {
    if (confirm('¿Seguro que deseas borrar este producto?')) {
        let productosGuardados = JSON.parse(localStorage.getItem('productos_admin')) || [];
        productosGuardados = productosGuardados.filter(p => p.id !== id);
        localStorage.setItem('productos_admin', JSON.stringify(productosGuardados));
        card.remove();
    }
}


// ======= FAVORITOS =======
function obtenerFavoritos() {
    return JSON.parse(localStorage.getItem("aurea_favoritos")) || [];
}

function guardarFavoritos(lista) {
    localStorage.setItem("aurea_favoritos", JSON.stringify(lista));
}

function esFavorito(idProducto) {
    return obtenerFavoritos().includes(idProducto);
}

function toggleFavorito(idProducto, boton) {
    let favoritos = obtenerFavoritos();

    if (favoritos.includes(idProducto)) {
        favoritos = favoritos.filter(id => id !== idProducto);
        boton.innerHTML = `<i class="bi bi-heart"></i>`;
    } else {
        favoritos.push(idProducto);
        boton.innerHTML = `<i class="bi bi-heart-fill text-danger"></i>`;
    }

    guardarFavoritos(favoritos);
}


// ======= EVENTOS =======
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});

// Delegación de eventos en el contenedor de cards
document.getElementById("contenedorCards").addEventListener("click", function (e) {

    // Botón favorito
    const botonFav = e.target.closest(".btn-favorito");
    if (botonFav) {
        const id = Number(botonFav.dataset.id);
        toggleFavorito(id, botonFav);
        return;
    }

    // Botón agregar al carrito
    const botonCart = e.target.closest(".btn-cart");
    if (botonCart) {
        const id = Number(botonCart.dataset.id);
        addToCart(id);
    }
});