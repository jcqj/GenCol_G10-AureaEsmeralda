import { productosBase } from "../../data/productosBase.js";

const STORAGE_KEY_PRODUCTOS = 'productos_admin';
const STORAGE_KEY_CARRITO   = 'aurea_cart';

/**
 * Normaliza cualquier producto (base o admin) para garantizar
 * que todos tienen los mismos campos. Así la card siempre
 * funciona igual sin importar el origen del producto.
 */
function normalizar(producto) {
    const precio         = Number(producto.precio) || 0;
    const descuento      = Number(producto.descuento) || 0;
    const precioOriginal = Number(producto.precioOriginal) || precio;
    const precioFinal    = descuento > 0
        ? precio * (1 - descuento / 100)
        : (Number(producto.precioFinal) || precio);

    return {
        // ── campos originales ──
        ...producto,
        precio,

        // ── precio/descuento (por si no los traía) ──
        precioOriginal,
        descuento,
        precioFinal,

        // ── badge best seller (false si no estaba definido) ──
        bestSeller: producto.bestSeller ?? false,

        // ── imagen secundaria (null si no tenía) ──
        imagenSecundaria: producto.imagenSecundaria ?? null,

        // ── disponibilidad por defecto ──
        disponibilidad: producto.disponibilidad ?? 'Disponible',

        // ── fecha por defecto ──
        fecha: producto.fecha ?? new Date().toISOString().split('T')[0],
    };
}

export function getProductos() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PRODUCTOS)) || [];
}

export function getProductosCarrito() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CARRITO)) || [];
}

export function getTodosProductos() {
    const admin = getProductos();
    return [...productosBase, ...admin].map(normalizar);
}