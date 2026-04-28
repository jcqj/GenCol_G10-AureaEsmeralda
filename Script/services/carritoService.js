const STORAGE_KEY = 'carrito';

export function getProductos() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
