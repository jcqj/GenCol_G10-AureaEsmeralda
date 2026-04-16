
const form = document.getElementById("contact-form");
const estado = document.getElementById("estado");

const nombre = document.getElementById("nombre");
const email = document.getElementById("email");
const telefono = document.getElementById("telefono");
const mensaje = document.getElementById("mensaje");

function setError(campo, texto) {
    document.getElementById(`error-${campo}`).textContent = texto; 
} //crea un id dinamico con los datos del id y lo pone en el small con el id que le asigne 

function limpiarErrores() {// en la funcion del set error quita el error del small y ademas lo setea en vacio y el estado contect limpia para no agregar errores viejos
    setError("nombre", "");
    setError("email", "");
    setError("telefono", "");
    setError("mensaje", "");
    estado.textContent = "";
}

function validarFormulario() {
    let valido = true;// predefine de incio que el formulario esta bien

    const nombreValor = nombre.value.trim();// trim quita espacias al final e inicio y evitar errores por validar espacios
    const emailValor = email.value.trim();
    const telefonoValor = telefono.value.trim();
    const mensajeValor = mensaje.value.trim();

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/.test(nombreValor)) { // permite esoso caracteres y espacios /s
        setError("nombre", "Ingresa un nombre válido (solo letras y espacios).");
        valido = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValor)) {
        setError("email", "Ingresa un correo válido.");
        valido = false;
    }

    const telefonoLimpio = telefonoValor.replace(/[^\d]/g, "");
    if (telefonoLimpio.length !== 10) {
        setError("telefono", "El teléfono debe tener solamente 10 digitos .");
        valido = false;
    }

    if (mensajeValor.length < 20) {
        setError("mensaje", "El mensaje debe tener al menos 20 caracteres.");
        valido = false;
    }

    return valido;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarErrores();

    if (!validarFormulario()) return;

    estado.textContent = "Enviando...";

    try {
        const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { Accept: "application/json" }
        });

        if (response.ok) {
            estado.textContent = "Mensaje enviado correctamente ✅";
            form.reset();
        } else {
            estado.textContent = "No se pudo enviar el mensaje.";
        }
    } catch {
        estado.textContent = "Error de conexión. Intenta de nuevo.";
    }
});