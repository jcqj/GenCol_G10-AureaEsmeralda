import { productosBase } from "../../data/productosBase.js";

const STORAGE_KEY = 'productos_admin';

export function getProductos() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

export function getTodosProductos() {
    const admin = getProductos();

    return [...productosBase, ...admin];
}