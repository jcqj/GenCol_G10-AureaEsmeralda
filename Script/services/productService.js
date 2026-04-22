const STORAGE_KEY = 'productos_admin';

export function getProductos() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
