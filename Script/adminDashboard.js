const STORAGE_KEY = 'productos_admin';

function obtenerProductos() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function actualizarDashboard() {
    const productos = obtenerProductos();

    const total = productos.length;
    const stockBajo = productos.filter(p => p.cantidad > 0 && p.cantidad <= 5).length;
    const agotados = productos.filter(p => p.cantidad === 0).length;

    const elTotal = document.getElementById('totalProductos');
    const elStockBajo = document.getElementById('stockBajo');
    const elAgotados = document.getElementById('agotados');

    if (elTotal) elTotal.textContent = total;
    if (elStockBajo) elStockBajo.textContent = stockBajo;
    if (elAgotados) elAgotados.textContent = agotados;
}

document.addEventListener('DOMContentLoaded', actualizarDashboard);