import { getProductos } from './services/productService.js';

function actualizarDashboard() {
    const productos = getProductos();

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