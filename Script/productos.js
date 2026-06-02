import { getTodosProductos } from "./services/productService.js";

// ============================================================
//  MODAL — se crea una sola vez en el DOM
// ============================================================
function crearEstructuraModal() {
    if (document.getElementById("mpOverlay")) return;

    const div = document.createElement("div");
    div.id = "mpOverlay";
    div.style.cssText = `
        position:fixed;inset:0;
        background:rgba(10,20,14,0.82);
        backdrop-filter:blur(6px);
        z-index:10000;
        display:flex;align-items:center;justify-content:center;
        padding:1.5rem;
        opacity:0;pointer-events:none;
        transition:opacity 0.28s ease;
    `;
    div.innerHTML = `
        <div id="mpPanel" style="
            background:#F8F8FF;
            border:2px solid #1a3d2b;
            border-radius:20px;
            width:100%;max-width:1100px;max-height:90vh;
            overflow-y:auto;scrollbar-width:none;
            display:grid;grid-template-columns:1fr 1fr;
            position:relative;
            transform:translateY(24px) scale(0.97);
            transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        ">
            <button id="mpCerrar" style="
                position:absolute;top:1rem;right:1rem;
                width:36px;height:36px;border:none;
                background:rgba(255,255,255,0.9);border-radius:50%;
                cursor:pointer;display:flex;align-items:center;justify-content:center;
                font-size:1.1rem;color:#1a3d2b;z-index:20;
                box-shadow:0 2px 8px rgba(0,0,0,0.15);
                transition:transform 0.2s;
            "><i class="bi bi-x-lg"></i></button>

            <!-- Columna imagen -->
            <div id="mpColImagen" style="
                background:#f0f0f0;border-radius:18px 0 0 18px;
                display:flex;align-items:center;justify-content:center;
                padding:2rem;min-height:500px;position:relative;overflow:hidden;
            ">
                <div id="mpImagenWrap" style="
                    position:relative;width:100%;height:100%;
                    display:flex;align-items:center;justify-content:center;min-height:420px;
                "></div>
            </div>

            <!-- Columna info -->
            <div id="mpColInfo" style="
                padding:2.5rem 2rem 2rem;
                display:flex;flex-direction:column;gap:0.85rem;
            ">
                <span id="mpCategoria" style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.14em;color:#013927;font-weight:700;"></span>
                <h2 id="mpNombre" style="font-family:'Playfair Display',serif;font-size:1.5rem;line-height:1.25;color:#1a3d2b;margin:0;"></h2>
                <div style="color:#facc15;font-size:1.1rem;">★★★★★ <span style="color:#6b6b80;font-size:0.75rem;">(128)</span></div>
                <div id="mpPrecioFila" style="display:flex;align-items:baseline;gap:0.7rem;"></div>
                <p id="mpDescripcion" style="font-size:0.87rem;color:#444;line-height:1.65;border-top:1px solid rgba(26,61,43,0.15);padding-top:0.9rem;flex:1;"></p>
                <div id="mpDisponibilidad"></div>
                <span id="mpFecha" style="font-size:0.75rem;color:#6b6b80;"></span>
                <div style="display:flex;gap:0.7rem;padding-top:1rem;border-top:1px solid rgba(26,61,43,0.15);margin-top:auto;">
                    <button id="mpBtnCarrito" style="
                        flex:1;background:linear-gradient(135deg,#013927,#025c3f);
                        color:#fff;border:none;border-radius:8px;
                        font-weight:700;font-size:0.9rem;padding:0.7rem 1rem;
                        cursor:pointer;
                    ">Agregar al carrito <i class="fa-solid fa-cart-shopping"></i></button>
                    <button id="mpBtnFavorito" style="
                        background:transparent;border:1.5px solid #39885D;
                        border-radius:8px;padding:0.7rem 1rem;
                        cursor:pointer;font-size:1.1rem;line-height:1;color:#6b6b80;
                    "></button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(div);

    document.getElementById("mpCerrar").addEventListener("click", cerrarModal);
    div.addEventListener("click", (e) => { if (e.target === div) cerrarModal(); });
}

function abrirModal(producto) {
    crearEstructuraModal();

    // — Imagen —
    const wrap = document.getElementById("mpImagenWrap");
    wrap.innerHTML = "";

    if (producto.bestSeller) {
        wrap.insertAdjacentHTML("beforeend",
            `<span style="position:absolute;top:1rem;left:1rem;font-size:0.62rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;padding:0.22em 0.7em;border-radius:40px;background:#0F5C4D;color:#fff;z-index:5;">Best Seller</span>`);
    }
    if ((producto.descuento ?? 0) > 0) {
        wrap.insertAdjacentHTML("beforeend",
            `<span style="position:absolute;top:1rem;right:1rem;font-size:0.62rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;padding:0.22em 0.7em;border-radius:40px;background:#0d2118;color:#fff;z-index:5;">-${producto.descuento}%</span>`);
    }

    if (producto.imagen) {
        wrap.insertAdjacentHTML("beforeend",
            `<img id="mpImgPrincipal" src="${producto.imagen}" alt="${producto.nombre}"
              style="max-width:100%;max-height:400px;object-fit:contain;position:relative;z-index:1;
                     transition:opacity 0.35s,transform 0.35s;">`);
    }
    if (producto.imagenSecundaria) {
        wrap.insertAdjacentHTML("beforeend",
            `<img id="mpImgSecundaria" src="${producto.imagenSecundaria}" alt="${producto.nombre} - vista 2"
              style="max-width:100%;max-height:400px;object-fit:contain;
                     position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                     opacity:0;z-index:2;transition:opacity 0.35s,transform 0.35s;">`);

        const col = document.getElementById("mpColImagen");
        col.onmouseenter = () => {
            const p = document.getElementById("mpImgPrincipal");
            const s = document.getElementById("mpImgSecundaria");
            if (p) { p.style.opacity = "0"; p.style.transform = "scale(0.94)"; }
            if (s) { s.style.opacity = "1"; s.style.transform = "translate(-50%,-50%) scale(1.03)"; }
        };
        col.onmouseleave = () => {
            const p = document.getElementById("mpImgPrincipal");
            const s = document.getElementById("mpImgSecundaria");
            if (p) { p.style.opacity = "1"; p.style.transform = "scale(1)"; }
            if (s) { s.style.opacity = "0"; s.style.transform = "translate(-50%,-50%)"; }
        };
    }

    // — Textos —
    document.getElementById("mpCategoria").innerHTML = `<i class="bi bi-tag"></i> ${producto.categoria}`;
    document.getElementById("mpNombre").textContent  = producto.nombre;

    const precioFinal    = producto.precioFinal ?? producto.precio;
    const precioOriginal = producto.precioOriginal ?? producto.precio;
    const descuento      = producto.descuento ?? 0;

    document.getElementById("mpPrecioFila").innerHTML = descuento > 0
        ? `<span style="font-size:1.65rem;font-weight:800;color:#1a3d2b;">$${Math.round(precioFinal).toLocaleString("es-CO")}</span>
           <span style="font-size:1rem;color:#6b6b80;text-decoration:line-through;">$${Math.round(precioOriginal).toLocaleString("es-CO")}</span>`
        : `<span style="font-size:1.65rem;font-weight:800;color:#1a3d2b;">$${Math.round(precioFinal).toLocaleString("es-CO")}</span>`;

    document.getElementById("mpDescripcion").textContent =
        producto.descripcion || "Sin descripción disponible.";

    const badgeColor = { Disponible: "success", "No disponible": "danger", Agotado: "warning" };
    document.getElementById("mpDisponibilidad").innerHTML =
        `<span class="badge bg-${badgeColor[producto.disponibilidad] || 'secondary'}">${producto.disponibilidad}</span>`;

    if (producto.fecha) {
        const f = new Date(producto.fecha + "T00:00:00")
            .toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
        document.getElementById("mpFecha").innerHTML = `<i class="bi bi-calendar"></i> ${f}`;
    } else {
        document.getElementById("mpFecha").textContent = "";
    }

    // — Botón carrito —
    const btnC = document.getElementById("mpBtnCarrito");
    const nuevoC = btnC.cloneNode(true);
    btnC.replaceWith(nuevoC);
    nuevoC.addEventListener("click", () => addToCart(producto.id));

    // — Botón favorito —
    const btnF = document.getElementById("mpBtnFavorito");
    const nuevoF = btnF.cloneNode(true);
    btnF.replaceWith(nuevoF);
    nuevoF.innerHTML = esFavorito(producto.id)
        ? `<i class="bi bi-heart-fill text-danger"></i>`
        : `<i class="bi bi-heart"></i>`;
    nuevoF.addEventListener("click", () => {
        toggleFavorito(producto.id, nuevoF);
        // Sincronizar corazón en la card
        const btnCard = document.querySelector(`.btn-favorito[data-id="${producto.id}"]`);
        if (btnCard) btnCard.innerHTML = nuevoF.innerHTML;
    });

    // — Mostrar —
    const overlay = document.getElementById("mpOverlay");
    const panel   = document.getElementById("mpPanel");
    overlay.style.opacity       = "1";
    overlay.style.pointerEvents = "all";
    panel.style.transform       = "translateY(0) scale(1)";
    document.body.style.overflow = "hidden";
}

function cerrarModal() {
    const overlay = document.getElementById("mpOverlay");
    const panel   = document.getElementById("mpPanel");
    if (!overlay) return;
    overlay.style.opacity       = "0";
    overlay.style.pointerEvents = "none";
    panel.style.transform       = "translateY(24px) scale(0.97)";
    document.body.style.overflow = "";
}

// Cerrar con Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModal();
});

// ============================================================
//  CARRITO
// ============================================================
function addToCart(idProducto) {
    const productos = getTodosProductos();
    const producto  = productos.find(p => p.id == idProducto);
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
    mostrarToast();
}

function mostrarToast() {
    const toastEl = document.getElementById("cart-toast");
    if (!toastEl) return;
    new bootstrap.Toast(toastEl).show();
}

// ============================================================
//  FAVORITOS
// ============================================================
function obtenerFavoritos() { return JSON.parse(localStorage.getItem("aurea_favoritos")) || []; }
function guardarFavoritos(lista) { localStorage.setItem("aurea_favoritos", JSON.stringify(lista)); }
function esFavorito(id) { return obtenerFavoritos().includes(id); }

function toggleFavorito(idProducto, boton) {
    let favs = obtenerFavoritos();
    if (favs.includes(idProducto)) {
        favs = favs.filter(id => id !== idProducto);
        boton.innerHTML = `<i class="bi bi-heart"></i>`;
    } else {
        favs.push(idProducto);
        boton.innerHTML = `<i class="bi bi-heart-fill text-danger"></i>`;
    }
    guardarFavoritos(favs);
}

// ============================================================
//  CARGAR PRODUCTOS
// ============================================================
function cargarProductos() {
    const contenedor = document.getElementById("contenedorCards");
    contenedor.innerHTML = "";

    const productos    = getTodosProductos();
    const params       = new URLSearchParams(window.location.search);
    const categoriaURL = params.get("categoria");

    const filtrados = categoriaURL
        ? productos.filter(p => p.categoria.toLowerCase() === categoriaURL.toLowerCase())
        : productos;

    filtrados.forEach(p => crearCard(p));
}

function crearCard(producto) {
    const contenedor = document.getElementById("contenedorCards");
    const card = document.createElement("div");
    card.className = "col-12 col-sm-6 col-lg-4 col-xl-3 product-item";
    card.setAttribute("data-id", producto.id);
    card.style.cursor = "pointer";

    const badgeColor = { Disponible: "success", "No disponible": "danger", Agotado: "warning" };
    const color = badgeColor[producto.disponibilidad] || "secondary";

    const imgPrincipal = producto.imagen
        ? `<img class="img-principal" src="${producto.imagen}" alt="${producto.nombre}">`
        : `<div class="bg-secondary d-flex align-items-center justify-content-center" style="height:180px;"><i class="bi bi-image text-white fs-1"></i></div>`;

    const imgSecundaria = producto.imagenSecundaria
        ? `<img class="img-secundaria" src="${producto.imagenSecundaria}" alt="${producto.nombre} - vista 2">`
        : "";

    const fechaFormateada = new Date(producto.fecha + "T00:00:00")
        .toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

    const precioFinal    = producto.precioFinal ?? producto.precio;
    const precioOriginal = producto.precioOriginal ?? producto.precio;
    const descuento      = producto.descuento ?? 0;

    const precioHTML = descuento > 0
        ? `<span class="price-current">$${Math.round(precioFinal).toLocaleString("es-CO")}</span>
           <span class="price-old">$${Math.round(precioOriginal).toLocaleString("es-CO")}</span>`
        : `<span class="price-current">$${Math.round(precioFinal).toLocaleString("es-CO")}</span>`;

    const bestSellerBadge = producto.bestSeller ? `<span class="card-badge best">Best Seller</span>` : "";
    const descuentoBadge  = descuento > 0 ? `<span class="card-badge sale">-${descuento}%</span>` : "";

    card.innerHTML = `
        <div class="product-card">
            <div class="card-img-wrap">
                ${bestSellerBadge}${descuentoBadge}
                <div class="img-container">${imgPrincipal}${imgSecundaria}</div>
            </div>
            <div class="card-body">
                <span class="product-category"><i class="bi bi-tag"></i>${producto.categoria}</span>
                <h5 class="product-name">${producto.nombre}</h5>
                <p class="product-desc">${producto.descripcion || "Sin descripción"}</p>
                <div class="rating">★★★★★ <span>(128)</span></div>
                <div class="price-row">${precioHTML}</div>
                <div><span class="badge bg-${color}">${producto.disponibilidad}</span></div>
                <div><span class="list-group-item text-muted small"><i class="bi bi-calendar"></i> ${fechaFormateada}</span></div>
            </div>
            <div class="card-footer d-flex gap-2">
                <button class="btn-cart" data-id="${producto.id}">
                    Agregar <i class="fa-solid fa-cart-shopping"></i>
                </button>
                <button class="btn-wishlist btn-sm btn-favorito" data-id="${producto.id}">
                    <i class="bi ${esFavorito(producto.id) ? "bi-heart-fill text-danger" : "bi-heart"}"></i>
                </button>
            </div>
        </div>`;

    contenedor.prepend(card);
}

// ============================================================
//  EVENTOS — todo en un solo listener delegado
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    crearEstructuraModal();

    document.getElementById("contenedorCards").addEventListener("click", (e) => {
        // 1. Botón favorito → solo togglear
        const btnFav = e.target.closest(".btn-favorito");
        if (btnFav) {
            e.stopPropagation();
            toggleFavorito(Number(btnFav.dataset.id), btnFav);
            return;
        }

        // 2. Botón carrito → solo agregar
        const btnCart = e.target.closest(".btn-cart");
        if (btnCart) {
            e.stopPropagation();
            addToCart(Number(btnCart.dataset.id));
            return;
        }

        // 3. Cualquier otra zona de la card → abrir modal
        const card = e.target.closest(".product-item");
        if (!card) return;
        const producto = getTodosProductos().find(p => p.id === Number(card.dataset.id));
        if (producto) abrirModal(producto);
    });
});