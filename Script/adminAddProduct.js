// ! ====== ABRIR MODAL AL CLICK EN "AÑADIR" ======
document.getElementById('btnAnadir').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
});

// ! ====== PREVIEW DE IMAGEN ======
document.getElementById('imagenProducto').addEventListener('change', function () {
    const archivo = this.files[0];
    const preview = document.getElementById('previewImagen');
    const img = document.getElementById('imgPreview');

    if (archivo) {
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            preview.classList.remove('d-none');
        };
        reader.readAsDataURL(archivo);
    } else {
        preview.classList.add('d-none');
        img.src = '';
    }
});

// ! ====== ARRAY Y STORAGE ======
let productos = []; // ? Array donde guardamos los productos

const STORAGE_KEY = 'productos_admin';  //

function guardarProductosEnStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
}

function mostrarListaComponenteJSON() {
    console.log('Productos en Storage:', productos);
}

function cargarProductosDesdeStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;

    try {
        const productosGuardados = JSON.parse(data);
        if (!Array.isArray(productosGuardados)) return;

        productos = productosGuardados;

        if (productos.length > 0) {
            document.getElementById('filaVacia').style.display = 'none';
        }

        productos.forEach((producto) => agregarFilaTabla(producto));
        actualizarContador();

    } catch (error) {
        console.error('Error leyendo localStorage:', error);
        localStorage.removeItem(STORAGE_KEY);
        productos = [];
    }
}

// ! ─── Traemos elemento con class=formProducto y espera a que usuario de click en 'submit'
document.getElementById('formProducto').addEventListener('submit', function (e) {
    e.preventDefault(); // ? Evitar que recargue la página

    // ! ──── Obtener valores del formulario ────
    const nombre = document.getElementById('nombreProducto').value.trim();
    const categoria = document.getElementById('categoriaProducto').value;
    const descripcion = document.getElementById('descripcionProducto').value.trim();
    const precio = document.getElementById('precioProducto').value;
    const cantidad = document.getElementById('cantidadProducto').value;
    const disponibilidad = document.getElementById('disponibilidadProducto').value;
    const fecha = document.getElementById('fechaProducto').value;
    const imgSrc = document.getElementById('imgPreview').src;
    const hayImagen = !document.getElementById('previewImagen').classList.contains('d-none');

    // ! ──── Validación básica [Añadimos los campos que queremos Obligatorios] ────
    // if (!nombre || !categoria || !precio || !fecha) {
    if (!nombre ) {
        this.classList.add('was-validated');
        return;
    }

    // ── Crear objeto producto ──
    const producto = {
        id: Date.now(), // ID único basado en tiempo
        nombre,
        categoria,
        descripcion,
        precio: parseFloat(precio).toFixed(2),
        cantidad: parseInt(cantidad) || 0,
        disponibilidad,
        fecha,
        imagen: hayImagen ? imgSrc : null
    };

    // ── Agregar al array ──
    productos.push(producto);

    // ── Guardar en localStorage ──
    guardarProductosEnStorage();

    //muestra en consola
    mostrarListaComponenteJSON();

    // ── Agregar fila a la tabla ──
    agregarFilaTabla(producto);

    // ── Cerrar modal y limpiar formulario ──
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalProducto'));
    modal.hide();
    limpiarFormulario();
});


// ===== FUNCIÓN: AGREGAR FILA A LA TABLA =====
function agregarFilaTabla(producto) {

    // Ocultar fila "No hay productos"
    document.getElementById('filaVacia').style.display = 'none';

    const tbody = document.getElementById('cuerpoTabla');

    // Formatear fecha
    const fechaFormateada = new Date(producto.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    // Badge de disponibilidad
    const badgeColor = {
        'Disponible': 'success',
        'No disponible': 'danger',
        'Agotado': 'warning'
    };
    const color = badgeColor[producto.disponibilidad] || 'secondary';

    // Crear fila
    const fila = document.createElement('tr');
    fila.setAttribute('data-id', producto.id);
    fila.innerHTML = `
        <td>
            <input type="checkbox" class="form-check-input check-producto">
        </td>
        <td>
            <strong>${producto.nombre}</strong>
            <br>
            <small>
                <a href="#" class="text-primary btn-editar" data-id="${producto.id}">Editar</a> | 
                <a href="#" class="text-danger btn-borrar" data-id="${producto.id}">Borrar</a>
            </small>
        </td>
        <td>${producto.descripcion || '<span class="text-muted">—</span>'}</td>
        <td>${producto.categoria}</td>
        <td>$${producto.precio}</td>
        <td>
            ${producto.imagen
            ? `<img src="${producto.imagen}" alt="foto" style="width:50px; height:50px; object-fit:cover; border-radius:6px;">`
            : '<span class="text-muted">—</span>'}
        </td>
        <td class="text-center">
            <span class="badge bg-${color}">${producto.disponibilidad}</span>
        </td>
        <td class="text-center">${producto.cantidad ?? '-'}</td>
        <td>${fechaFormateada}</td>
    `;

    tbody.appendChild(fila);

    // Actualizar contador
    actualizarContador();

    // Asignar evento borrar
    fila.querySelector('.btn-borrar').addEventListener('click', function (e) {
        e.preventDefault();
        const id = parseInt(this.getAttribute('data-id'));
        borrarProducto(id, fila);
    });
}


// ===== FUNCIÓN: BORRAR PRODUCTO =====
function borrarProducto(id, fila) {
    if (confirm('¿Seguro que deseas borrar este producto?')) {
        // Quitar del array
        productos = productos.filter(p => p.id !== id);
        // Actualizar localStorage
        guardarProductosEnStorage();
        // Mostrar en consola
        mostrarListaComponenteJSON();
        // Quitar fila de la tabla
        fila.remove();
        // Si no hay productos, mostrar fila vacía

        if (productos.length === 0) {
            document.getElementById('filaVacia').style.display = '';
        }
        actualizarContador();
    }
}


// ===== FUNCIÓN: ACTUALIZAR CONTADOR =====
function actualizarContador() {
    document.getElementById('infoPaginacion').textContent =
        `Mostrando ${productos.length} producto${productos.length !== 1 ? 's' : ''}`;
}


// ===== FUNCIÓN: LIMPIAR FORMULARIO =====
function limpiarFormulario() {
    document.getElementById('formProducto').reset();
    document.getElementById('formProducto').classList.remove('was-validated');
    document.getElementById('previewImagen').classList.add('d-none');
    document.getElementById('imgPreview').src = '';
}



document.addEventListener('DOMContentLoaded', () => {
    cargarProductosDesdeStorage();
});







// ! NEW *********************************************************

// // Nuevo js refactorizado
// //constantes y estados
// const STORAGE_KEY = 'productos_admin';
// let productos = [];

// //sanitiza strings antes de inyectar al dom evitar ataques XXS
// //al usar inner el nav interpreta cualquier texto como html real y alli pueden insertar codigo malicioso
// //
// const sanitizar = (str) => {
//     const div = document.createElement('div');
//     div.textContent = str ?? ''; //lo trata como texto plano, y despues inner devuelve el texto sin los caracteres peligrosos

//     return div.innerHTML;
// };


// // SEGURIDAD — Validar estructura de un producto desde storage
// // Evita que datos corruptos o manipulados desde DevTools rompan la app

// function esProductoValido(p) {
//     return (
//         p &&
//         typeof p.id === 'number' &&
//         typeof p.nombre === 'string' && p.nombre.trim() !== '' &&
//         typeof p.precio === 'string' &&
//         typeof p.fecha === 'string' &&
//         typeof p.categoria === 'string'
//     );
// }



// // STORAGE
// const guardarProductosEnStorage = () => 
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(productos)); // aqui guarda en el local storage lo del array

// const mostrarListaEnConsola = () =>
//     console.log('Productos en Storage:', productos); //aqui miestra en consola los productos de  array

// function cargarProductosDesdeStorage() {
//     const data = localStorage.getItem(STORAGE_KEY);
//     if (!data) return; // Toma los datos de localStorage, y si no hay nada solo sale de la funcion
    
//     try{
//         const guardados = JSON.parse(data);
//         if (!Array.isArray(guardados)) return; // Si lo que hay en el storage no es un array, sale de la funcion

//         productos = guardados.filter(esProductoValido); //doble verificacion agrega el array de lstorage al array vacio

//         if (productos.length > 0) {
//         ocultarFilaVacia(); // Si hay productos, oculta la fila que dice "No hay productos"
//         }

//         productos.forEach(agregarFilaTabla);
//         actualizarContador();

//     } catch (error) {
//         console.error('Error leyendo localStorage:', error);
//         localStorage.removeItem(STORAGE_KEY); // Si hay un error al leer el storage, lo borra para evitar problemas futuros
//         productos = []; // Y resetea el array a vacío
//     }
// }


// // helpers de UI
// const ocultarFilaVacia = () =>
//     document.getElementById('filaVacia').style.display = 'none'; // oculta

// const mostrarFilaVacia = () =>
//     document.getElementById('filaVacia').style.display = '';

// const actualizarContador = () => {
//     const n = productos.length;
//     document.getElementById('infoPaginacion').textContent =
//         `Mostrando ${n} producto${n !== 1 ? 's' : ''}`; // la s va  manejar mas productos es el plural
// };


// function limpiarFormulario() {
//     const form = document.getElementById('formProducto');
//     form.reset();
//     form.classList.remove('was-validated');
//     document.getElementById('previewImagen').classList.add('d-none');
//     document.getElementById('imgPreview').src = '';
// }


// //manejo del modal
// document.getElementById('btnAnadir').addEventListener('click', () => {
//     new bootstrap.Modal(document.getElementById('modalProducto')).show();
// });

// //borones sin funcion
// document.getElementById('btnLista').addEventListener('click', () => {
//     alert('Funcionalidad de lista próximamente');
// });

// document.getElementById('btnLista').addEventListener('click', () => {
//     alert('Funcionalidad de lista próximamente');
// });



// //checkbox para seleccionar
// document.getElementById('checkTodos').addEventListener('change', function () {
//     document.querySelectorAll('.check-producto')
//         .forEach(cb => cb.checked = this.checked);
// });

// // BUSCADOR
// document.getElementById('buscador').addEventListener('input', function () {
//     const termino = this.value.trim().toLowerCase();
//     const filas = document.querySelectorAll('#cuerpoTabla tr:not(#filaVacia)');

//     filas.forEach(fila => {
//         const texto = fila.textContent.toLowerCase();
//         fila.style.display = texto.includes(termino) ? '' : 'none';
//     });
// });



// //// Preview de la imageen
// document.getElementById('imagenProducto').addEventListener('change', function () {
//     const archivo = this.files[0];
//     const preview = document.getElementById('previewImagen');
//     const img = document.getElementById('imgPreview');

//     if (archivo) {
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             img.src = e.target.result;
//             preview.classList.remove('d-none');
//         };
//         reader.readAsDataURL(archivo);
//     } else {
//         preview.classList.add('d-none');
//         img.src = '';
//     }
// });


// //submit - Guardar producto
// document.getElementById('formProducto').addEventListener('submit', function (e) {
//     e.preventDefault();

// // Leer valores
//     const nombre         = document.getElementById('nombreProducto').value.trim();
//     const categoria      = document.getElementById('categoriaProducto').value;
//     const descripcion    = document.getElementById('descripcionProducto').value.trim();
//     const precio         = document.getElementById('precioProducto').value;
//     const cantidad       = document.getElementById('cantidadProducto').value;
//     const disponibilidad = document.getElementById('disponibilidadProducto').value;
//     const fecha          = document.getElementById('fechaProducto').value;
//     const hayImagen      = !document.getElementById('previewImagen').classList.contains('d-none');
//     const imgSrc         = document.getElementById('imgPreview').src;


// //validacion
//     if (!nombre || !categoria || precio === '' || parseFloat(precio) < 0 || !fecha) { // por que preco tambien puede ser 0 si es un producto de pruebo
//         this.classList.add('was-validated')// was-validated es clase de bootstrap que muestra mensajes de error
//         return;
//         }


//     // Crear producto
//     const producto = {
//         id : Date.now(),
//         nombre,
//         categoria,
//         descripcion,
//         precio: parseFloat(precio).toFixed(2),
//         cantidad: parseInt(cantidad) || 0,
//         disponibilidad,
//         fecha,
//         imagen: hayImagen ? imgSrc : null
//     };

//     productos.push(producto);
//         guardarProductosEnStorage();
//         mostrarListaEnConsola();
//         agregarFilaTabla(producto);

//         bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
//         limpiarFormulario();

// });



// //renderizar fila en tabla
// const BADGE_COLOR = {
//     'Disponible':    'success',
//     'No disponible': 'danger',
//     'Agotado':       'warning'
// };

// function agregarFilaTabla(producto) {
//     ocultarFilaVacia();

//     const fechaFormateada = new Date(producto.fecha + 'T00:00:00')
//         .toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

//     const color = BADGE_COLOR[producto.disponibilidad] ?? 'secondary';

//     const imagenHTML = producto.imagen
//         ? `<img src="${producto.imagen}" alt="foto" style="width:50px;height:50px;object-fit:cover;border-radius:6px;">`
//         : '<span class="text-muted">—</span>';

//     const fila = document.createElement('tr');
//     fila.setAttribute('data-id', producto.id);
//     fila.innerHTML = `
//         <td>
//             <input type="checkbox" class="form-check-input check-producto">
//         </td>
//         <td>
//             <strong>${producto.nombre}</strong><br>
//             <small>
//                 <a href="#" class="text-primary btn-editar" data-id="${producto.id}">Editar</a> |
//                 <a href="#" class="text-danger btn-borrar" data-id="${producto.id}">Borrar</a>
//             </small>
//         </td>
//         <td>${sanitizar(producto.descripcion) || '<span class="text-muted">—</span>'}</td>
//         <td>${sanitizar(producto.categoria)}</td>
//         <td>$${sanitizar(producto.precio)}</td>
//         <td>${imagenHTML}</td>
//         <td class="text-center">
//             <span class="badge bg-${color}">${sanitizar(producto.disponibilidad)}</span>
//         </td>
//         <td class="text-center">${producto.cantidad ?? '—'}</td>
//         <td>${fechaFormateada}</td>
//     `;

//     document.getElementById('cuerpoTabla').appendChild(fila);
//     actualizarContador();

//     fila.querySelector('.btn-borrar').addEventListener('click', (e) => {
//         e.preventDefault();
//         borrarProducto(producto.id, fila);
//     });
//     // Evento editar — placeholder hasta implementar la funcionalidad
//     fila.querySelector('.btn-editar').addEventListener('click', (e) => {
//         e.preventDefault();
//         alert(`Editar "${producto.nombre}" — próximamente`);
//     });
// }

// //BORAR PRODUCTO
// function borrarProducto(id, fila) {
//     if (!confirm('¿Seguro que deseas borrar este producto?')) return;

//     productos = productos.filter(p => p.id !== id);
//     guardarProductosEnStorage();
//     mostrarListaEnConsola();
//     fila.remove();

//     //quitar marcado de checkbox
//     document.getElementById('checkTodos').checked = false;

//     if (productos.length === 0) mostrarFilaVacia();
//     actualizarContador();
// }

// // iniciacion de la  app
// document.addEventListener('DOMContentLoaded', cargarProductosDesdeStorage);

