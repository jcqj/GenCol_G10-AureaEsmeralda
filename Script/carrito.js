// ===== CAMBIAR CANTIDAD =====
function changeQty(btn, delta) {
    const container = btn.closest(".quantity-control");
    const input = container.querySelector(".quantity-input");
    let newValue = parseInt(input.value) + delta;
    if (newValue >= 1) {
        input.value = newValue;
        updateTotalItems();
        cargarResumen();
        saveCartToStorage();
    }
}

// ===== GUARDAR CARRITO EN LOCALSTORAGE =====
function saveCartToStorage() {
    const carritoActual = JSON.parse(localStorage.getItem('aurea_cart')) || [];
    const cards = document.querySelectorAll('#contenedorCardss .product-card');

    cards.forEach(card => {
        const id = card.getAttribute('data-id');
        const cantidad = parseInt(card.querySelector('.quantity-input').value);
        const item = carritoActual.find(p => String(p.id) === String(id));
        if (item) item.cantidad = cantidad;
    });

    localStorage.setItem('aurea_cart', JSON.stringify(carritoActual));
}

// ===== BADGE SUPERIOR =====
function updateTotalItems() {
    const allInputs = document.querySelectorAll(".quantity-input");
    const badge = document.getElementById("cart-count");
    let total = 0;
    allInputs.forEach(input => { total += parseInt(input.value); });
    badge.innerText = `${total} ${total === 1 ? "Producto" : "Productos"}`;
}

// ===== ELIMINAR CARD =====
document.addEventListener("click", function (e) {
    if (e.target.closest(".remove-btn")) {
        const card = e.target.closest(".product-card");

        // Si es una card dinámica, también borramos del localStorage
        const id = card.getAttribute('data-id');
        if (id) {
            let carritoActual = JSON.parse(localStorage.getItem('aurea_cart')) || [];
            carritoActual = carritoActual.filter(p => String(p.id) !== String(id));
            localStorage.setItem('aurea_cart', JSON.stringify(carritoActual));
        }

        card.style.opacity = "0";
        card.style.transform = "scale(0.9)";
        card.style.transition = "all 0.3s ease";
        setTimeout(() => {
            card.remove();
            updateTotalItems();
            cargarResumen();
        }, 300);
    }
});

// ===== RESUMEN DE COMPRA =====
function cargarResumen() {
    const productos = document.querySelectorAll(".product-card");
    let subtotal = 0;
    let descuento = 0;
    let envio = 5000;

    productos.forEach(producto => {
        // Limpia el precio: quita $, puntos y comas
        const precioTexto = producto.querySelector(".fs-5")?.innerText
            .replace("$", "")
            .replace(/\./g, "")
            .replace(",", "")
            .trim();

        const precio = parseFloat(precioTexto) || 0;
        const cantidad = parseInt(producto.querySelector(".quantity-input")?.value) || 1;
        subtotal += precio * cantidad;

        // Obtener precio viejo del data-attribute
        const precioViejo = parseFloat(producto.getAttribute('data-precio-antiguo') || '0');
        
        // Calcular descuento: precio viejo - precio nuevo
        if (precioViejo > precio) {
            descuento += (precioViejo - precio) * cantidad;
        }
    });

    // si esta vacio 
    if (productos.length === 0) { envio = 0; descuento = 0; }
    if (descuento > subtotal) descuento = subtotal;

    const total = subtotal - descuento + envio;
    const fmt = { style: "currency", currency: "COP", minimumFractionDigits: 2, maximumFractionDigits: 2 };

    document.getElementById("subtotal").innerText = subtotal.toLocaleString("es-CO", fmt);
    document.getElementById("descuento").innerText = descuento.toLocaleString("es-CO", fmt);
    document.getElementById("envio").innerText = envio.toLocaleString("es-CO", fmt);
    document.getElementById("total").innerText = total.toLocaleString("es-CO", fmt);
}

// ===== CARGAR PRODUCTOS DESDE LOCALSTORAGE =====
function cargarProductos() {
    const datos = localStorage.getItem('aurea_cart');
    if (!datos) return;

    const productosEnCarrito = JSON.parse(datos);
    if (!productosEnCarrito || productosEnCarrito.length === 0) return;

    productosEnCarrito.forEach(producto => crearCard(producto));
    updateTotalItems();
    cargarResumen();
}

// ===== CREAR CARD DINÁMICA =====
function crearCard(producto) {
    const contenedor = document.getElementById('contenedorCardss');

    const imgHTML = producto.imagen
        ? `<img src="${producto.imagen}" alt="${producto.nombre}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">`
        : `<div style="width:80px;height:80px;background:#eee;border-radius:8px;display:flex;align-items:center;justify-content:center;">
               <i class="bi bi-image" style="font-size:24px;color:#aaa"></i>
           </div>`;

    // Formateamos el precio para que tenga el mismo formato que los hardcodeados
    const precioFormateado = parseFloat(String(producto.precio).replace(/\./g,'').replace(',','.'))
        .toLocaleString('es-CO');

    const card = document.createElement('div');
    card.className = 'product-card p-3 shadow-sm card';
    card.setAttribute('data-id', producto.id);
    card.setAttribute('data-precio-antiguo', '4820000'); // Precio viejo hardcodeado


    card.innerHTML = `
        <div class="row align-items-center g-3">
            <div class="col-4 col-md-2 text-center">
                ${imgHTML}
            </div>
            <div class="col-8 col-md-4">
                <span class="text-muted small"><i class="bi bi-tag me-1"></i>${producto.categoria || ''}</span>
                <h6 class="mb-1 fw-bold">${producto.nombre}</h6>
                <p class="text-muted small mb-0">${producto.descripcion || 'Sin descripción'}</p>
            </div>
            <div class="col-6 col-md-3">
                <div class="quantity-control">
                    <button class="btn btn-sm btn-light border-0" onclick="changeQty(this, -1)">
                        <i class="bi bi-dash"></i>
                    </button>
                    <input type="number" class="quantity-input" value="${producto.cantidad || 1}" min="1" readonly>
                    <button class="btn btn-sm btn-light border-0" onclick="changeQty(this, 1)">
                        <i class="bi bi-plus"></i>
                    </button>
                </div>
            </div>
            <div class="col-4 col-md-2 text-end text-md-start">
                <span class="fw-bold fs-5">$${precioFormateado}</span>
            </div>
            <div class="col-2 col-md-1 text-end">
                <button class="remove-btn"><i class="bi bi-trash3-fill"></i></button>
            </div>
        </div>
    `;

    contenedor.appendChild(card);
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    updateTotalItems();
    cargarResumen();
});