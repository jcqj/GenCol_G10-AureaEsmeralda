import { crearCard } from "../Script/productos.js";
import { getTodosProductos } from "./services/productService.js";

function cargarFavoritos() {

    const favoritos = JSON.parse(localStorage.getItem("aurea_favoritos")) || [];

    const productos = getTodosProductos();

    favoritos.forEach(id => {

        const producto = productos.find(p => p.id == id);

        if (producto) {
            crearCard(producto);
        }

    });
}

document.addEventListener("DOMContentLoaded", cargarFavoritos);