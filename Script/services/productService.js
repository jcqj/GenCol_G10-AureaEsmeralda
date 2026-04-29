import { productosBase } from "../../data/productosBase.js";

const STORAGE_KEY_PRODUCTOS = 'productos_admin';
const STORAGE_KEY_CARRITO = 'aurea_cart';

export function getProductos() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PRODUCTOS)) || [];
}
export function getProductosCarrito() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CARRITO)) || [];
}

export function getTodosProductos() {
    const admin = getProductos();

    return [...productosBase, ...admin];
}