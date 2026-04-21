const productos = [];

const formularioProducto = document.getElementById("admin-product-form");
const listaProductos = document.getElementById("lista-productos");
const estadoProducto = document.getElementById("estado-producto");
const imagenProducto = document.getElementById("imagenProducto");
const previewImagenProducto = document.getElementById("previewImagenProducto");

async function leerImagenComoDataUrl(archivo) {
    if (!archivo) return null;//retorna null y cierra el programa

    return new Promise((resolve, reject) => {
        const lector = new FileReader();//file readir api del navegador para recibir
        lector.onload = () => resolve(lector.result);// resuelve la promesa cuando se carga
        lector.onerror = () => reject(new Error("No se pudo leer la imagen."));// rechaza si no se carga igual resulve la promesa
        lector.readAsDataURL(archivo);//lee el archivo
    });
}

async function capturarDatosProducto() {
    const nombre = document.getElementById("nombreProducto").value.trim();
    const categoria = document.getElementById("categoriaProducto").value.trim();
    const precioTexto = document.getElementById("precioProducto").value.trim().replace(",", ".");
    const stockTexto = document.getElementById("stockProducto").value.trim();
    const precio = Number(precioTexto);
    const stock = Number(stockTexto);
    const descripcion = document.getElementById("descripcionProducto").value.trim();
    const archivoImagen = imagenProducto && imagenProducto.files ? imagenProducto.files[0] : null;

    if (!nombre || !categoria) {
        throw new Error("Nombre y categoría son obligatorios.");
    }

    if (Number.isNaN(precio) || precio < 0) {
        throw new Error("El precio debe ser un número mayor o igual a 0.");
    }

    if (Number.isNaN(stock) || stock < 0) {
        throw new Error("El stock debe ser un número mayor o igual a 0.");
    }
    if (archivoImagen && !archivoImagen.type.startsWith("image/")) {
        throw new Error("El archivo seleccionado no es una imagen válida.");
    }

    const imagenDataUrl = await leerImagenComoDataUrl(archivoImagen);

    return {
        id: productos.length + 1,
        nombre,
        categoria,
        precio,
        stock,
        descripcion,
        imagen: archivoImagen
            ? {
                nombreArchivo: archivoImagen.name,
                tipo: archivoImagen.type,
                dataUrl: imagenDataUrl
            }
            : null
    };
}

function mostrarProductosEnVista() {
    if (!listaProductos) return;
    listaProductos.innerHTML = "";

    if (productos.length === 0) {
        const itemVacio = document.createElement("li");
        itemVacio.className = "list-group-item text-muted";
        itemVacio.textContent = `No hay productos agregados ${productos.length}`;
        listaProductos.appendChild(itemVacio);
        return;
    }

    productos.forEach((producto) => {
        const item = document.createElement("li");
        item.className = "list-group-item";

        const contenedor = document.createElement("div");
        contenedor.className = "d-flex align-items-center gap-3";
        if (producto.imagen && producto.imagen.dataUrl) {
            const miniatura = document.createElement("img");
            miniatura.src = producto.imagen.dataUrl;
            miniatura.alt = `Imagen de ${producto.nombre}`;
            miniatura.width = 56;
            miniatura.height = 56;
            miniatura.style.objectFit = "cover";
            miniatura.style.borderRadius = "8px";
            contenedor.appendChild(miniatura);
        }

        const texto = document.createElement("span");
        texto.textContent = `${producto.nombre} | ${producto.categoria} | $${producto.precio} | Stock: ${producto.stock}`;
        contenedor.appendChild(texto);

        item.appendChild(contenedor);
        listaProductos.appendChild(item);
    });
}
async function agregarProducto(evento) {
    evento.preventDefault();

    try {
        const producto = await capturarDatosProducto();
        productos.push(producto);
        mostrarProductosEnVista();

        console.log("Lista de productos en JSON:");
        console.log(JSON.stringify(productos, null, 2));

        if (estadoProducto) {
            estadoProducto.textContent = "Producto agregado correctamente.";
            estadoProducto.className = "mt-3 mb-0 text-success";
        }

        formularioProducto.reset();
        if (previewImagenProducto) {
            previewImagenProducto.src = "";
            previewImagenProducto.classList.add("d-none");
        }
    } catch (error) {
        console.error(error);
        if (estadoProducto) {
            estadoProducto.textContent = error.message;
            estadoProducto.className = "mt-3 mb-0 text-danger";
        }
    }
}

if (formularioProducto) {
    mostrarProductosEnVista();
    formularioProducto.addEventListener("submit", agregarProducto);
}
if (imagenProducto && previewImagenProducto) {
    imagenProducto.addEventListener("change", async () => {
        const archivoImagen = imagenProducto.files ? imagenProducto.files[0] : null;
        if (!archivoImagen) {
            previewImagenProducto.src = "";
            previewImagenProducto.classList.add("d-none");
            return;
        }

        if (!archivoImagen.type.startsWith("image/")) {
            previewImagenProducto.src = "";
            previewImagenProducto.classList.add("d-none");
            if (estadoProducto) {
                estadoProducto.textContent = "Selecciona un archivo de imagen válido.";
                estadoProducto.className = "mt-3 mb-0 text-danger";
            }
            return;
        }
        try {
            const imagenDataUrl = await leerImagenComoDataUrl(archivoImagen);
            previewImagenProducto.src = imagenDataUrl;
            previewImagenProducto.classList.remove("d-none");
            if (estadoProducto) {
                estadoProducto.textContent = "";
            }
        } catch (error) {
            console.error(error);
            previewImagenProducto.src = "";
            previewImagenProducto.classList.add("d-none");
            if (estadoProducto) {
                estadoProducto.textContent = "No se pudo cargar la imagen seleccionada.";
                estadoProducto.className = "mt-3 mb-0 text-danger";
            }
        }
    });
}
