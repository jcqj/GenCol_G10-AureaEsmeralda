function changeQty(btn, delta) {
    const container = btn.closest(".quantity-control");
    const input = container.querySelector(".quantity-input");

    // Calculamos nuevo valor
    let newValue = parseInt(input.value) + delta;

    // Solo actualizamos si es 1 o más
    if (newValue >= 1) {
        input.value = newValue;
        updateTotalItems();
        cargarResumen();
        saveCartToStorage();
    }
}

function saveCartToStorage() {
    const cartData = [];
    const products = document.querySelectorAll(".product-card");

    products.forEach((card, index) => {
        const qty = card.querySelector(".quantity-input").value;
        const name = card.querySelector("h6").innerText;

        // Guardamos un objeto por cada producto
        cartData.push({ id: index, name: name, quantity: qty });
    });
}

//localstorage guardar
function cargaDeCarrito() {
    const savedCart = localStorage.getItem("aurea_cart");
    if (savedCart) {
        const cartData = JSON.parse(savedCart);
        const products = document.querySelectorAll(".product-card");

        if (cartData[index]) {
            card.querySelector(".quantity-input").value = cartData[index].quantity;
        }
    }
    localStorage.setItem("aurea_cart", JSON.stringify(cartData));
}

//parte superior
function updateTotalItems() {
    const allInputs = document.querySelectorAll(".quantity-input");
    const badge = document.getElementById("cart-count");

    let total = 0;
    allInputs.forEach((input) => {
        total += parseInt(input.value);
    });

    // Cambiamos el texto del span (badge)
    badge.innerText = `${total} ${total === 1 ? "Producto" : "Productos"}`;
}

// Lógica para los botones de eliminar (Basura)
document.addEventListener("click", function (e) {
    // Si el clic fue en un botón de eliminar o en el icono de basura
    if (e.target.closest(".remove-btn")) {
        const card = e.target.closest(".product-card");

        // Efecto visual simple de desvanecimiento
        card.style.opacity = "0";
        card.style.transform = "scale(0.9)";
        card.style.transition = "all 0.3s ease";

        setTimeout(() => {
            card.remove(); // Eliminamos el elemento del HTML
            updateTotalItems(); // Recalculamos el total del badge
            cargarResumen();
            saveCartToStorage();
        }, 300);
    }
});

// Ejecutar una vez al cargar para asegurar que el badge coincida con los inputs iniciales
document.addEventListener("DOMContentLoaded", () => {
    updateTotalItems();
    cargarResumen();
});

function cargarResumen() {
    const productos = document.querySelectorAll(".product-card");

    let subtotal = 0;
    let descuento = 0; // por ahrra lo dejo
    let envio = 5000;

    productos.forEach((producto) => {
        const precioTexto = producto
            .querySelector(".fs-5")
            .innerText
            .replace("$", "")
            .replace(/\./g, "")
            .replace(",", "");

        const precio = parseFloat(precioTexto);
        const cantidad = parseInt(producto.querySelector(".quantity-input").value);

        subtotal += precio * cantidad;
    
    const badgeDescuento = producto.querySelector(".discount-badge");
    if (badgeDescuento) {

        const porcentajeTexto = badgeDescuento.innerText
            .replace("% DESC", "")
            .trim();

        const porcentaje = parseFloat(porcentajeTexto);

        // Calcular descuento 
        const descuentoProducto =
            (precio * cantidad) * (porcentaje / 100);

        descuento += descuentoProducto;
    }
});


// si esta vacio
if (productos.length === 0) {
    envio = 0;
    descuento = 0;
}


if (descuento > subtotal) {
    descuento = subtotal;
}

const total = subtotal - descuento + envio;

// formato para dos decimales, el descuento de 20% daba solo decimal 2 y se veia raro
const formatoMoneda = {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2
    };


    document.getElementById("subtotal").innerText = subtotal.toLocaleString("es-CO", formatoMoneda);
    document.getElementById("descuento").innerText = descuento.toLocaleString("es-CO", formatoMoneda);
    document.getElementById("envio").innerText = envio.toLocaleString("es-CO", formatoMoneda);
    document.getElementById("total").innerText = total.toLocaleString("es-CO", formatoMoneda);
}



// ! CARGAR IMAGEN

function cargarProductos() {
    // # 1. Obtener datos del localStorage
    const datos = localStorage.getItem("productos_admin"); //? Traermos infor de KEY 'productos_admin'
    // #    Devuelve un STRING o null si no hay nada

    // # 2. Verificar si hay datos
    if (!datos) {
        console.log("No hay productos guardados"); //# Sí es vacio, devuelve que no hay producto
        return;
    }

    // # 3. Convertir el STRING a un array de objetos
    const productosGuardados = JSON.parse(datos);
    // #    Operación inversa a JSON.stringify

    // # 4. Por cada producto, crear una card
    productosGuardados.forEach((producto) => {
        crearCard(producto);
    });
}

// ! CREAR CARD DE UN PRODUCTO
function crearCard(producto) {
    // # 1. Seleccionar el contenedor donde van las cards
    const contenedor = document.getElementById("contenedorCardss");

    // # 2. Crear el elemento CARD.
    const card = document.createElement("div");
    // card.classList.add('col'); // columna de Bootstrap
    card.className = "product-card p-3 shadow-sm card";
    card.setAttribute("data-id", producto.id);

    // # 3. Badge de disponibilidad
    const badgeColor = {
        Disponible: "success",
        "No disponible": "danger",
        Agotado: "warning",
    };
    const color = badgeColor[producto.disponibilidad] || "secondary";

    // # 4. Seleccionamos IMAGEN en caso de NO HABER, MUESTRA ESPACIO.
    const imagenHTML = producto.imagen
        ? `<img src="${producto.imagen}" alt="${producto.nombre}">`
        : `<div class="card-img-top bg-secondary d-flex align-items-center 
                    justify-content-center" style="height:180px;">
                <i class="bi bi-image text-white fs-1"></i>
            </div>`;

    // # 5. Formatear fecha
    const fechaFormateada = new Date(
        producto.fecha + "T00:00:00",
    ).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    // # 6. Rellenar la card con HTML

    card.innerHTML = `
        <div class="product-card p-3 shadow-sm card">
                        <div class="row align-items-center g-3">
                            <div class="col-4 col-md-2 text-center">
                                ${imagenHTML}
                            </div>
                            <div class="col-8 col-md-4">
                                <!-- ========== CATEGORIA PRODUCTO ========== -->
                                <span class="product-category"><i class="bi bi-tag"></i>${producto.categoria}</span>
                                <!-- ========== NOMBRE PRODUCTO ========== -->
                                <h5 class="product-name">${producto.nombre}</h5>
                                <!-- ========== DESCRIPCION PRODUCTO ========== -->
                                <p class="product-desc">${producto.descripcion || "Sin descripción"}</p>
                                <h6 class="mb-1 fw-bold">Smart Watch S7</h6>
                                <p class="text-muted small mb-0">Plata | 44mm</p>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="quantity-control">
                                    <button class="btn btn-sm btn-light border-0" onclick="changeQty(this, -1)">
                                        <i class="bi bi-dash"></i>
                                    </button>
                                    <input type="number" class="quantity-input" value="1" min="1" readonly>
                                    <button class="btn change-qty btn-sm btn-light border-0" onclick="changeQty(this, 1)">
                                        <i class="bi bi-plus"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-4 col-md-2 text-end text-md-start">
                                <span class="price-current">$${producto.precio}</span>
                                <span class="fw-bold fs-5">$29.99</span>
                            </div>
                            <div class="col-2 col-md-1 text-end">
                                <button class="remove-btn"><i class="bi bi-trash3-fill"></i></button>
                            </div>
                        </div>
                    </div>
    `;

    // 7. Agregar la card al contenedor
    // ! APPEND para añadir al ginal
    // contenedor.appendChild(card);
    // ! PREPREND para añadir al inicio
    contenedor.append(card);

    // 8. Asignar evento borrar a la card
    card.querySelector(".btn-borrar-card").addEventListener("click", function () {
        const id = parseInt(this.getAttribute("data-id"));
        borrarCard(id, card);
    });
}

// ===== LLAMAR AL CARGAR LA PÁGINA =====
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});
