let cartCount = 0;

    function addToCart() {
        cartCount++;
        

        const toastEl = document.getElementById('cart-toast');
        const toast = new bootstrap.Toast(toastEl);
    toast.show();
    }





    // ! --------------------------------------------

    
// ! CARGAR IMAGEN

function cargarProductos() {
    // ! 1. Obtener datos del localStorage
    const datos = localStorage.getItem('productos_admin'); //? Traermos infor de KEY 'productos_admin'
    //?    Devuelve un STRING o null si no hay nada

    // ! 2. Verificar si hay datos
    if (!datos) {
        console.log('No hay productos guardados'); //? Sí es vacio, devuelve que no hay prod
        return;
    }

    // ! 3. Convertir el STRING a un array de objetos
    const productosGuardados = JSON.parse(datos);
    //     Operación inversa a JSON.stringify

    // 4. Por cada producto, crear una card
    productosGuardados.forEach(producto => {
        crearCard(producto);
    });
}
    const datos = localStorage.getItem('productos_admin');

const productosGuardados = JSON.parse(datos);

console.log(productosGuardados);


// ===== CREAR CARD DE UN PRODUCTO =====
function crearCard(producto) {
    // 1. Seleccionar el contenedor donde van las cards
    const contenedor = document.getElementById('contenedorCards');

    // 2. Crear el elemento card
    const card = document.createElement('div');
    card.classList.add('col'); // columna de Bootstrap
    card.setAttribute('data-id', producto.id);

    // 3. Badge de disponibilidad
    const badgeColor = {
        'Disponible'    : 'success',
        'No disponible' : 'danger',
        'Agotado'       : 'warning'
    };
    const color = badgeColor[producto.disponibilidad] || 'secondary';

    // 4. Imagen: si no hay, poner una por defecto
    const imagenHTML = producto.imagen
        ? `<img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">`
        : `<div class="card-img-top bg-secondary d-flex align-items-center 
                       justify-content-center" style="height:180px;">
               <i class="bi bi-image text-white fs-1"></i>
           </div>`;

    /*
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3 product-item"
        data-category="Joyeria">
            <div class="product-card">
            <div class="card-img-wrap">
                <span class="card-badge best">Best Seller</span>
                <img
                src="https://placehold.co/200x140/1a1a24/c8ff00?text=anillo"
                alt="Anillo de Oro"/>
            </div>
            <div class="card-body">
                <span class="product-category">Anillos</span>
                <h5 class="product-name">Anillo dew Oro con incrustacion de esmeraldas</h5>
                <p class="product-desc">anillo de oro de 24k con incrustacioon de esmeraldas, conpruebas de espectometria</p>
                <div class="rating">★★★★★ <span>(128)</span></div>
                <div class="price-row">
                <span class="price-current">$3.200.000</span>
                <span class="price-old">$4.820.000</span>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn-cart" onclick="addToCart()">
                <i class="bi bi-bag-plus me-1"></i>Agregar
              </button>
              <button class="btn-wishlist"><i class="bi bi-heart"></i></button>
            </div>
          </div>
        </div>
    */






    // 5. Formatear fecha
    const fechaFormateada = new Date(producto.fecha + 'T00:00:00')
        .toLocaleDateString('es-ES', {
            day  : '2-digit',
            month: 'short',
            year : 'numeric'
        });

    // 6. Rellenar la card con HTML
    card.innerHTML = `
        <div class="card h-100 shadow-sm">

            <!-- Imagen -->
            ${imagenHTML}

            <!-- Cuerpo -->
            <div class="card-body">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text text-muted small">${producto.descripcion || 'Sin descripción'}</p>
            </div>

            <!-- Detalles -->
            <ul class="list-group list-group-flush">
                <li class="list-group-item">
                    <i class="bi bi-tag"></i> ${producto.categoria}
                </li>
                <li class="list-group-item">
                    <i class="bi bi-currency-dollar"></i> $${producto.precio}
                </li>
                <li class="list-group-item">
                    <span class="badge bg-${color}">${producto.disponibilidad}</span>
                </li>
                <li class="list-group-item text-muted small">
                    <i class="bi bi-calendar"></i> ${fechaFormateada}
                </li>
            </ul>

            <!-- Botones -->
            <div class="card-footer d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary w-50 btn-editar-card"
                        data-id="${producto.id}">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-sm btn-outline-danger w-50 btn-borrar-card"
                        data-id="${producto.id}">
                    <i class="bi bi-trash"></i> Borrar
                </button>
            </div>

        </div>
    `;

    // 7. Agregar la card al contenedor
    contenedor.appendChild(card);

    // 8. Asignar evento borrar a la card
    card.querySelector('.btn-borrar-card').addEventListener('click', function () {
        const id = parseInt(this.getAttribute('data-id'));
        borrarCard(id, card);
    });
}


// ===== BORRAR CARD Y DEL LOCALSTORAGE =====
function borrarCard(id, card) {
    if (confirm('¿Seguro que deseas borrar este producto?')) {

        // 1. Obtener productos actuales
        let productosGuardados = JSON.parse(localStorage.getItem('productos')) || [];

        // 2. Filtrar (quitar el borrado)
        productosGuardados = productosGuardados.filter(p => p.id !== id);

        // 3. Guardar el array actualizado
        localStorage.setItem('productos', JSON.stringify(productosGuardados));

        // 4. Quitar la card del HTML
        card.remove();
    }
}


// ===== LLAMAR AL CARGAR LA PÁGINA =====
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});