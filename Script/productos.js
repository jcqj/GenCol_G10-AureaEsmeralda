
import { getTodosProductos , getProductos} from "./services/productService.js";
let cartCount = 0;


function addToCart(idProducto) {

    const productos = getTodosProductos();
    const producto = productos.find(p => p.id == idProducto);

    if (!producto) return;

    let carrito = getProductos();

    const existe = carrito.find(item => item.id == idProducto);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    actualizarContadorCarrito();
    mostrarToast();
}
function actualizarContadorCarrito() {

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    const badge = document.getElementById("cart-count");

    if (badge) {
        badge.textContent = total;
    }
}
function mostrarToast() {
    const toastEl = document.getElementById("cart-toast");
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function cargarProductos() {
    const productos = getTodosProductos();

    productos.forEach(producto => {
        crearCard(producto);
    });
}


// ! CREAR CARD DE UN PRODUCTO 
function crearCard(producto) {
    // # 1. Seleccionar el contenedor donde van las cards
    const contenedor = document.getElementById('contenedorCards');

    // # 2. Crear el elemento CARD.
    const card = document.createElement('div');
    // card.classList.add('col'); // columna de Bootstrap
    card.className = 'col-12 col-sm-6 col-lg-4 col-xl-3 product-item'
    card.setAttribute('data-id', producto.id);

    // # 3. Badge de disponibilidad
    const badgeColor = {
        'Disponible': 'success',
        'No disponible': 'danger',
        'Agotado': 'warning'
    };
    const color = badgeColor[producto.disponibilidad] || 'secondary';

    // # 4. Seleccionamos IMAGEN en caso de NO HABER, MUESTRA ESPACIO.
    const imagenHTML = producto.imagen
        ? `<img src="${producto.imagen}" alt="${producto.nombre}">`
        : `<div class="card-img-top bg-secondary d-flex align-items-center 
                    justify-content-center" style="height:180px;">
                <i class="bi bi-image text-white fs-1"></i>
            </div>`;

    // # 5. Formatear fecha
    const fechaFormateada = new Date(producto.fecha + 'T00:00:00')
        .toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

    // # 6. Rellenar la card con HTML
    card.innerHTML = `
        <div class="product-card">
            <div class="card-img-wrap">
                <span class="card-badge best">Best Seller</span>
                <!-- ========== IMAGEN ========== -->
                ${imagenHTML}
            </div>
            <div class="card-body">
                <!-- ========== CATEGORIA PRODUCTO ========== -->
                <span class="product-category"><i class="bi bi-tag"></i>${producto.categoria}</span>
                <!-- ========== NOMBRE PRODUCTO ========== -->
                <h5 class="product-name">${producto.nombre}</h5>
                <!-- ========== DESCRIPCION PRODUCTO ========== -->
                <p class="product-desc">${producto.descripcion || 'Sin descripción'}</p>
                <div class="rating">★★★★★ <span>(128)</span></div>
                <!-- ========== PRECIO PRODUCTO ========== -->
                <div class="price-row">
                    <span class="price-current">$${producto.precio}</span>
                    <span class="price-old">$4.820.000</span>
                </div>
                <div>
                    <span class="badge bg-${color}">${producto.disponibilidad}</span>
                </div>
                <div>
                    <span class="list-group-item text-muted small"><i class="bi bi-calendar"></i> ${fechaFormateada}</span>
                </div>
            </div>
            <div class="card-footer d-flex gap-2">
                    <button class="btn-cart" data-id="${producto.id}">
                        <i class="bi bi-bag-plus me-1"></i>Agregar
                    </button>

                <button class="btn-wishlist btn-sm  btn-borrar-card" data-id="${producto.id}"><i class="bi bi-heart"></i></button>
            </div>
        </div>
    `;

    // 7. Agregar la card al contenedor
    // ! APPEND para añadir al ginal
    // contenedor.appendChild(card);
    // ! PREPREND para añadir al inicio
    contenedor.prepend(card);


    // 8. Asignar evento borrar a la card
    card.querySelector('.btn-borrar-card').addEventListener('click', function () {
        const id = parseInt(this.getAttribute('data-id'));
        borrarCard(id, card);
    });
}


// ===== BORRAR CARD Y DEL LOCALSTORAGE ===== 
// ! DEBERA IR EN ADMIN JUNTO CON LA FUNCIÓN DE BORRAR
function borrarCard(id, card) {
    if (confirm('¿Seguro que deseas borrar este producto?')) {

        // 1. Obtener productos actuales
        let productosGuardados = JSON.parse(localStorage.getItem('productos_admin')) || [];

        // 2. Filtrar (quitar el borrado)
        productosGuardados = productosGuardados.filter(p => p.id !== id);

        // 3. Guardar el array actualizado
        localStorage.setItem('productos_admin', JSON.stringify(productosGuardados));

        // 4. Quitar la card del HTML
        card.remove();
    }
}


// ===== LLAMAR AL CARGAR LA PÁGINA =====
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    actualizarContadorCarrito();
});

document.getElementById("contenedorCards")
.addEventListener("click", function (e) {

    const boton = e.target.closest(".btn-cart");

    if (!boton) return;

    const id = boton.dataset.id;

    addToCart(id);
});