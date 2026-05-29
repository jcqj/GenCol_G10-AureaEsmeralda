import { getTodosProductos } from "./services/productService.js";

// ======= FAVORITOS - HELPERS =======
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

        // Eliminar la tarjeta con animación
        const tarjeta = boton.closest(".elemento-producto");
        if (tarjeta) {
            tarjeta.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            tarjeta.style.opacity = "0";
            tarjeta.style.transform = "scale(0.9)";
            setTimeout(() => {
                tarjeta.remove();
                verificarVacio();
            }, 300);
        }
    } else {
        favoritos.push(idProducto);
        boton.innerHTML = `<i class="bi bi-heart-fill text-danger"></i>`;
    }

    guardarFavoritos(favoritos);
}

// ======= AGREGAR AL CARRITO =======
function agregarAlCarrito(idProducto) {
    const productos = getTodosProductos();
    const producto = productos.find(p => p.id == idProducto);
    if (!producto) return;

    const carritoActual = JSON.parse(localStorage.getItem("aurea_cart")) || [];
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

    localStorage.setItem("aurea_cart", JSON.stringify(carritoActual));

    window.dispatchEvent(new Event("cart-updated"));

    mostrarNotificacion();
}

function mostrarNotificacion() {
    const elementoToast = document.getElementById("notificacion-carrito");
    if (!elementoToast) return;
    const toast = new bootstrap.Toast(elementoToast);
    toast.show();
}

// ======= CREAR TARJETA =======
function crearTarjeta(producto) {
    const contenedor = document.getElementById("contenedor-tarjetas");
    if (!contenedor) return;

    const tarjeta = document.createElement("div");
    tarjeta.className = "col-12 col-sm-6 col-lg-4 col-xl-3 elemento-producto";
    tarjeta.setAttribute("data-id", producto.id);

    const colorDisponibilidad = {
        Disponible: "success",
        "No disponible": "danger",
        Agotado: "warning",
    };
    const color = colorDisponibilidad[producto.disponibilidad] || "secondary";

    const imagenPrincipal = producto.imagen
        ? `<img class="imagen-principal" src="${producto.imagen}" alt="${producto.nombre}">`
        : `<div class="card-img-top bg-secondary d-flex align-items-center justify-content-center" style="height:180px;">
               <i class="bi bi-image text-white fs-1"></i>
           </div>`;

    const imagenSecundaria = producto.imagenSecundaria
        ? `<img class="imagen-secundaria" src="${producto.imagenSecundaria}" alt="${producto.nombre} - vista 2">`
        : "";

    const precioFinal    = producto.precioFinal ?? producto.precio;
    const precioOriginal = producto.precioOriginal ?? producto.precio;
    const descuento      = producto.descuento ?? 0;

    const precioHTML = descuento > 0
        ? `<span class="precio-actual">$${Math.round(precioFinal).toLocaleString("es-CO")}</span>
           <span class="precio-anterior">$${Math.round(precioOriginal).toLocaleString("es-CO")}</span>`
        : `<span class="precio-actual">$${Math.round(precioFinal).toLocaleString("es-CO")}</span>`;

    const etiquetaMasVendido = producto.bestSeller
        ? `<span class="etiqueta-tarjeta mas-vendido">Best Seller</span>`
        : "";

    const etiquetaDescuento = descuento > 0
        ? `<span class="etiqueta-tarjeta oferta">-${descuento}%</span>`
        : "";

    tarjeta.innerHTML = `
        <div class="tarjeta-producto">
            <div class="contenedor-imagen-tarjeta">
                ${etiquetaMasVendido}
                ${etiquetaDescuento}
                <div class="envoltura-imagen">
                    ${imagenPrincipal}
                    ${imagenSecundaria}
                </div>
            </div>
            <div class="cuerpo-tarjeta">
                <span class="categoria-producto"><i class="bi bi-tag"></i>${producto.categoria}</span>
                <h5 class="nombre-producto">${producto.nombre}</h5>
                <p class="descripcion-producto">${producto.descripcion || "Sin descripción"}</p>
                <div class="calificacion">★★★★★ <span>(128)</span></div>
                <div class="fila-precio">${precioHTML}</div>
                <div>
                    <span class="badge bg-${color}">${producto.disponibilidad}</span>
                </div>
            </div>
            <div class="pie-tarjeta d-flex gap-2">
                <button class="boton-carrito" data-id="${producto.id}">
                    Agregar <i class="fa-solid fa-cart-shopping"></i>
                </button>
                <button class="boton-lista-deseos btn-sm boton-favorito" data-id="${producto.id}">
                    <i class="bi bi-heart-fill text-danger"></i>
                </button>
            </div>
        </div>
    `;

    contenedor.appendChild(tarjeta);
}

// ======= MENSAJE VACÍO =======
function verificarVacio() {
    const contenedor = document.getElementById("contenedor-tarjetas");
    const yaExiste   = document.getElementById("mensaje-favoritos-vacio");

    if (!contenedor) return;

    if (contenedor.children.length === 0 && !yaExiste) {
        const mensaje = document.createElement("div");
        mensaje.id = "mensaje-favoritos-vacio";
        mensaje.className = "col-12 text-center py-5";
        mensaje.innerHTML = `
            <i class="bi bi-heart" style="font-size: 3rem; color: #ccc;"></i>
            <h5 class="mt-3 style="color: #e8c97a;"">Aún no tienes productos favoritos</h5>
            <p class="texto" #e8c97a >Explora nuestra colección y guarda lo que más te guste.</p>
            <a href="./productos.html" class="btn btn-dark mt-2">Ver productos</a>
        `;
        contenedor.appendChild(mensaje);
    }
}

// ======= CARGAR FAVORITOS =======
function cargarFavoritos() {
    const contenedor = document.getElementById("contenedor-tarjetas");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    const ids       = obtenerFavoritos();
    const productos = getTodosProductos();

    const productosFavoritos = productos.filter(p => ids.includes(p.id));

    const elContador = document.getElementById("contador-favoritos");
    if (elContador) {
        elContador.textContent = productosFavoritos.length === 0
            ? ""
            : `${productosFavoritos.length} ${productosFavoritos.length === 1 ? "pieza guardada" : "piezas guardadas"}`;
    }

    if (productosFavoritos.length === 0) {
        verificarVacio();
        return;
    }

    productosFavoritos.forEach(p => crearTarjeta(p));
}

// ======= EVENTOS =======
document.addEventListener("DOMContentLoaded", cargarFavoritos);

document.addEventListener("click", function (e) {
    // Botón quitar de favoritos
    const botonFav = e.target.closest(".boton-favorito");
    if (botonFav) {
        const id = Number(botonFav.dataset.id);
        toggleFavorito(id, botonFav);
        return;
    }

    // Botón agregar al carrito
    const botonCarrito = e.target.closest(".boton-carrito");
    if (botonCarrito) {
        const id = Number(botonCarrito.dataset.id);
        agregarAlCarrito(id);
    }
});