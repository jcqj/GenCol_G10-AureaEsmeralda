import { getTodosProductos } from "./services/productService.js";

// ============================================================
//  HELPERS — favoritos (independientes del script clásico)
// ============================================================
function obtenerFavoritos() { return JSON.parse(localStorage.getItem("aurea_favoritos")) || []; }
function guardarFavoritos(lista) { localStorage.setItem("aurea_favoritos", JSON.stringify(lista)); }
function esFavorito(id) { return obtenerFavoritos().includes(Number(id)); }

function toggleFavorito(id, boton) {
    let favs = obtenerFavoritos();
    id = Number(id);
    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
        if (boton) boton.innerHTML = `<i class="bi bi-heart"></i>`;
    } else {
        favs.push(id);
        if (boton) boton.innerHTML = `<i class="bi bi-heart-fill text-danger"></i>`;
    }
    guardarFavoritos(favs);
}

// ============================================================
//  AGREGAR AL CARRITO desde el modal
// ============================================================
function addToCartModal(idProducto) {
    const todos = getTodosProductos();
    const producto = todos.find(p => p.id == idProducto);
    if (!producto) return;

    let carrito = JSON.parse(localStorage.getItem("aurea_cart")) || [];
    const existe = carrito.find(p => p.id == idProducto);

    if (existe) {
        existe.cantidad = (existe.cantidad || 1) + 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precioFinal ?? producto.precio),
            imagen: producto.imagen,
            cantidad: 1,
            categoria: producto.categoria,
            descripcion: producto.descripcion
        });
    }

    localStorage.setItem("aurea_cart", JSON.stringify(carrito));
    window.dispatchEvent(new Event("cart-updated"));

    // Refrescar la vista del carrito si está en la misma página
    const contenedor = document.getElementById("contenedorCardss");
    if (contenedor && typeof cargarProductos === "function") {
        contenedor.innerHTML = "";
        cargarProductos();
    }

    // Refrescar sugerencias
    cargarSugerencias();
}

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
            width:100%;max-width:860px;max-height:90vh;
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
                padding:2rem;min-height:380px;position:relative;overflow:hidden;
            ">
                <div id="mpImagenWrap" style="
                    position:relative;width:100%;height:100%;
                    display:flex;align-items:center;justify-content:center;min-height:260px;
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
              style="max-width:100%;max-height:300px;object-fit:contain;position:relative;z-index:1;
                     transition:opacity 0.35s,transform 0.35s;">`);
    }
    if (producto.imagenSecundaria) {
        wrap.insertAdjacentHTML("beforeend",
            `<img id="mpImgSecundaria" src="${producto.imagenSecundaria}" alt="${producto.nombre} - vista 2"
              style="max-width:100%;max-height:300px;object-fit:contain;
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
    nuevoC.addEventListener("click", () => addToCartModal(producto.id));

    // — Botón favorito —
    const btnF = document.getElementById("mpBtnFavorito");
    const nuevoF = btnF.cloneNode(true);
    btnF.replaceWith(nuevoF);
    nuevoF.innerHTML = esFavorito(producto.id)
        ? `<i class="bi bi-heart-fill text-danger"></i>`
        : `<i class="bi bi-heart"></i>`;
    nuevoF.addEventListener("click", () => {
        toggleFavorito(producto.id, nuevoF);
        // Sincronizar corazón en la card de sugerencias si existe
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

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModal();
});

// ============================================================
//  ABRIR MODAL DESDE LAS CARDS DEL CARRITO
//  Las cards del carrito tienen data-id con el id del producto.
//  Delegamos el click en el contenedor principal.
// ============================================================
function conectarModalCarrito() {
    const contenedor = document.getElementById("contenedorCardss");
    if (!contenedor) return;

    contenedor.addEventListener("click", (e) => {
        // No abrir modal si hicieron clic en botones de cantidad o eliminar
        if (e.target.closest(".remove-btn") ||
            e.target.closest(".quantity-control")) return;

        const card = e.target.closest(".product-card[data-id]");
        if (!card) return;

        const id = Number(card.getAttribute("data-id"));
        const producto = getTodosProductos().find(p => p.id === id);
        if (producto) abrirModal(producto);
    });
}

// ===============================================================================
//  SUGERENCIAS
// ===============================================================================
document.addEventListener("DOMContentLoaded", () => {
    crearEstructuraModal();
    cargarSugerencias();
    conectarModalCarrito();
});

function cargarSugerencias() {
    const contenedor = document.getElementById('recomendacion');
    if (!contenedor) return;

    const todosLosProductos = getTodosProductos();
    const carritoActual = JSON.parse(localStorage.getItem('aurea_cart')) || [];

    const sugeridos = todosLosProductos.filter(p =>
        !carritoActual.some(item => item.id === p.id)
    ).slice(0, 6);

    contenedor.innerHTML = "";

    sugeridos.forEach(producto => {
        const imgPrincipal = producto.imagen
            ? `<img class="rec-img-principal" src="${producto.imagen}" alt="${producto.nombre}">`
            : `<div class="rec-img-placeholder"><i class="bi bi-image"></i></div>`;

        const imgSecundaria = producto.imagenSecundaria
            ? `<img class="rec-img-secundaria" src="${producto.imagenSecundaria}" alt="${producto.nombre} - vista 2">`
            : '';

        const item = document.createElement('div');
        item.className = 'elementos';
        // Añadimos data-id y cursor para que sea clickeable y abra el modal
        item.setAttribute('data-id', producto.id);
        item.style.cursor = 'pointer';
        item.innerHTML = `
            <div class="card h-100 shadow-sm border-0 rec-card">
                <div class="rec-img-wrap">
                    ${imgPrincipal}
                    ${imgSecundaria}
                </div>
                <div class="card-body p-3">
                    <h6 class="fw-bold mb-1">${producto.nombre}</h6>
                    <p class="fw-bold mb-3" style="color: #013927;">$${Number(producto.precioFinal ?? producto.precio).toLocaleString("es-CO")}</p>
                    <button class="btn btn-outline-dark btn-sm w-100 btn-agregar" data-id="${producto.id}">
                        Agregar <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(item);
    });

    configurarNavegacion();

    // Eventos en las cards de sugerencias
    contenedor.addEventListener('click', (e) => {
        // Botón agregar → solo agrega, no abre modal
        const btnAgregar = e.target.closest('.btn-agregar');
        if (btnAgregar) {
            e.stopPropagation();
            agregarDesdeSugerencia(btnAgregar.dataset.id);
            return;
        }

        // Clic en la card → abrir modal
        const card = e.target.closest('.elementos[data-id]');
        if (!card) return;
        const id = Number(card.getAttribute('data-id'));
        const producto = getTodosProductos().find(p => p.id === id);
        if (producto) abrirModal(producto);
    }, { once: true }); // once:true porque cargarSugerencias() recrea el contenido y vuelve a registrar
}

function configurarNavegacion() {
    const btnSiguiente = document.getElementById('btnSiguiente');
    const btnAtras = document.getElementById('btnAtras');
    const contenedor = document.getElementById('recomendacion');
    let intervalo;

    if (btnSiguiente && btnAtras && contenedor) {
        const iniciarScroll = (velocidad) => {
            clearInterval(intervalo);
            intervalo = setInterval(() => { contenedor.scrollLeft += velocidad; }, 10);
        };
        const detenerScroll = () => clearInterval(intervalo);

        btnSiguiente.addEventListener('mouseenter', () => iniciarScroll(8));
        btnSiguiente.addEventListener('mouseleave', detenerScroll);
        btnAtras.addEventListener('mouseenter', () => iniciarScroll(-8));
        btnAtras.addEventListener('mouseleave', detenerScroll);

        btnSiguiente.onclick = () => contenedor.scrollBy({ left: 300, behavior: 'smooth' });
        btnAtras.onclick = () => contenedor.scrollBy({ left: -300, behavior: 'smooth' });
    }
}

function agregarDesdeSugerencia(id) {
    const todos = getTodosProductos();
    const producto = todos.find(p => p.id == id);
    let carrito = JSON.parse(localStorage.getItem('aurea_cart')) || [];

    if (!carrito.some(item => item.id == id)) {
        carrito.push({ ...producto, cantidad: 1 });
        localStorage.setItem('aurea_cart', JSON.stringify(carrito));

        window.dispatchEvent(new Event('cart-updated'));

        const contenedor = document.getElementById('contenedorCardss');
        if (contenedor && typeof cargarProductos === "function") {
            contenedor.innerHTML = "";
            cargarProductos();
        }

        cargarSugerencias();
    }
}