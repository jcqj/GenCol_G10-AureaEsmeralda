/* ══════════════════════════════════════════════════════
   AUREA ESMERALDA — Login de usuario
   Funciones: validación, fortaleza de contraseña,
              construcción de objeto JSON, localStorage
══════════════════════════════════════════════════════ */

// ── Selectors ─────────────────────────────────────────
const form = document.getElementById('loginForm');
const inputEmail = document.getElementById('email');
const inputPass = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');

// ── visibilidad contrasena ─────────────────────────
function setupToggle(btnId, inputEl, iconId) {
    document.getElementById(btnId).addEventListener('click', () => {
        const isPass = inputEl.type === 'password';
        inputEl.type = isPass ? 'text' : 'password';
        const icon = document.getElementById(iconId);
        document.getElementById(iconId).className = isPass ? 'bi bi-eye' : 'bi bi-eye-slash';
    });
}
setupToggle('togglePass', inputPass, 'eyeIcon');


// // ! Leemos datos de localStorage
// const datosEnStorage = localStorage.getItem('aureaEsmeraldaUsers');

// if (datosEnStorage) {
//     const usuario = JSON.parse(datosEnStorage);

//     // Acceso a datos simples
//     console.log("Nombre:", usuario.nombreCompleto);
//     console.log(usuario);
//     // // Imprime: Juan Camilo
//     // // Acceso a datos anidados
//     // console.log("Prefijo:", usuario.telefono.prefijo); 
//     // // Imprime: +57

//     // // Ejemplo de uso en una condición
//     // if (usuario.activo) {
//     //     console.log(`El usuario ${usuario.nombreCompleto} está activo.`);
//     // }

// } else {
//     console.log("No se encontraron datos en localStorage.");
// }





// ── Password strength ──────────────────────────────────
const strengthWrap = document.getElementById('strengthWrap');
const strengthFill = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');

const STRENGTH = [
    { label: 'Muy débil', pct: 15, color: '#d4624a' },
    { label: 'Débil', pct: 35, color: '#d4914a' },
    { label: 'Regular', pct: 60, color: '#c9a84c' },
    { label: 'Fuerte', pct: 80, color: '#7ab87a' },
    { label: 'Muy fuerte', pct: 100, color: '#4caf80' },
];

function calcStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 4); // 0–4
}

inputPass.addEventListener('input', () => {
    const val = inputPass.value;
    if (!val) { strengthWrap.style.display = 'none'; return; }
    strengthWrap.style.display = 'block';
    const s = calcStrength(val);
    const { label, pct, color } = STRENGTH[s];
    strengthFill.style.width = pct + '%';
    strengthFill.style.background = color;
    strengthLabel.style.color = color;
    strengthLabel.textContent = label;
});

// ── Helper: show / clear error ─────────────────────────
function showError(inputEl, errId, textId, msg) {
    inputEl.classList.add('is-invalid');
    inputEl.classList.remove('is-valid');
    document.getElementById(errId).classList.add('visible');
    if (textId) document.getElementById(textId).textContent = msg;
}

function clearError(inputEl, errId) {
    inputEl.classList.remove('is-invalid');
    inputEl.classList.add('is-valid');
    document.getElementById(errId).classList.remove('visible');
}

// ── hash que hace lo mismo que un registro ─
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
}


const ADMIN = {
    email: "admin@aurea.com",
    passwordHash: simpleHash("AureaAdmin2026!"),
    rol: "admin",
    nombreCompleto: "Administrador"
};


// - Leer los usuarios registrados
function getUsuarios() {
    try {
        return JSON.parse(localStorage.getItem('aureaEsmeraldaUsers') || '[]');
    } catch (e) {
        console.warn("Datos locales corruptos. Se reiniciaran los datos");
        localStorage.removeItem('aureaEsmeraldaUsers');
        return [];
    }
}

// ── validadores ──────────────────────────────


function validateEmail() {
    const v = inputEmail.value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!v) {
        showError(inputEmail, 'err-email', 'err-email-text', 'El correo es obligatorio.');
        return false;
    }
    if (!re.test(v)) {
        showError(inputEmail, 'err-email', 'err-email-text', 'Formato de correo inválido.');
        return false;
    }


    //Veriicar que el correo se encuentre registrado
    const usuarios = getUsuarios();

    const existe =
        usuarios.some(u => u.email === v.toLowerCase()) ||
        v.toLowerCase() === ADMIN.email;
    if (!existe) {
        showError(inputEmail, 'err-email', 'err-email-text', 'Este correo no esta registrado.')
        return false;
    }
    clearError(inputEmail, 'err-email');
    return true;
}

// let usuarios = [];
// try {
//     usuarios = JSON.parse(localStorage.getItem('aureaEsmeraldaUsers') || '[]');
// }catch (e) {
//     console.warn("Datos locales corruptos. Se reiniciará la base de datos local.");
//     localStorage.removeItem('aureaEsmeraldaUsers');
// }

// // const usuarios = JSON.parse(localStorage.getItem('aureaEsmeraldaUsers') || '[]');
// // if (usuarios.some(u => u.email === v)) {
// //     showError(inputEmail, 'err-email', 'err-email-text', 'Este correo ya está registrado.');
// //     return false;
// // }
// clearError(inputEmail, 'err-email');
// return true;


function validatePassword() {
    const v = inputPass.value;
    if (!v) {
        showError(inputPass, 'err-password', 'err-password-text', 'La contraseña es obligatoria.');
        return false;
    }
    if (v.length < 8) {
        showError(inputPass, 'err-password', 'err-password-text', 'Mínimo 8 caracteres.');
        return false;
    }
    // if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) {
    //     showError(inputPass, 'err-password', 'err-password-text', 'Debe incluir letras y al menos un número.');
    //     return false;
    // }
    clearError(inputPass, 'err-password');
    return true;
}


// ── Live validation on blur ────────────────────────────

inputEmail.addEventListener('blur', validateEmail);
inputPass.addEventListener('blur', validatePassword);




/// Toast de aviso de que el correo no esta registrado

function showToast(type, title, body) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const icon = type === 'success' ? 'bi-gem' : 'bi-x-circle';
    toast.className = `toast-gem ${type}`;
    toast.innerHTML = `
    <i class="bi ${icon} toast-icon"></i>
    <div>
        <div class="toast-title">${title}</div>
        <div class="toast-body">${body}</div>
    </div>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity .4s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 420);
    }, 4000);
}


// // ── Build user object & save ───────────────────────────
// function buildUserObject() {
//     const generarId = () => {
//         if (window.crypto && crypto.randomUUID) {
//             return crypto.randomUUID();
//         }
//         return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); //en caso de que no funcione el id lo que se hace es como crear el token seguro
//         // pasa a base 36 letra y numeros, y el substrac elimina los dos primeros caractres y cuanta los siguientes 9
//     };

//     return {
//         id: generarId(),
//         email: inputEmail.value.trim().toLowerCase(),
//         passwordHash: simpleHash(inputPass.value),   // never store plain text
//         fechaLogin: new Date().toISOString(),
//         activo: true,
//         rol: "cliente"
//     };
// }



// function saveToLocalStorage(usuario) {
//     const key = 'aureaEsmeraldaLogins';
//     const lista = JSON.parse(localStorage.getItem(key) || '[]');
//     lista.push(usuario);
//     localStorage.setItem(key, JSON.stringify(lista));
//     // also save last logged-in session reference
//     //localStorage.setItem('aureaEsmeraldaSession', JSON.stringify({ id: usuario.id, email: usuario.email }));
//     console.table({ ...usuario, passwordHash: '[protected]' });
// }



// ── Form submit ────────────────────────────────────────
form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.disabled = true;

    const formOk = [validateEmail(), validatePassword()].every(Boolean);

    if (!formOk) {
        submitBtn.disabled = false;
        showToast('error', 'Datos incompletos', 'Revisa los campos marcados en rojo.');
        form.querySelector('.is-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // ── Verificar credenciales ─────────────────────────
    const email = inputEmail.value.trim().toLowerCase();
    const hashPass = simpleHash(inputPass.value);
    const usuarios = getUsuarios();
    if (
        email === ADMIN.email &&
        hashPass === ADMIN.passwordHash
    ) {
        localStorage.setItem('aureaEsmeraldaSession', JSON.stringify({
            email: ADMIN.email,
            nombre: ADMIN.nombreCompleto,
            rol: ADMIN.rol
        }));

        showToast('success', '¡Bienvenido Administrador!', 'Iniciando sesión...');

        setTimeout(() => {
            window.location.href = '../HTML/adminHome.html';
        }, 1800);

        return;
    }

    const usuario = usuarios.find(u => u.email === email && u.passwordHash === hashPass);

    if (!usuario) {
        // Correo existe pero contraseña incorrecta
        showError(inputPass, 'err-password', 'err-password-text', 'Contraseña incorrecta.');
        showToast('error', 'Credenciales inválidas', 'El correo o la contraseña no coinciden.');
        submitBtn.disabled = false;
        return;
    }

    // ── Guardar sesión activa ──────────────────────────
    localStorage.setItem('aureaEsmeraldaSession', JSON.stringify({
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombreCompleto || usuario.email,
        rol: usuario.rol
    }));

    showToast('success', `¡Bienvenido!`, 'Iniciando sesión...');

    // ── Redirect ───────────────────────────────────────
    setTimeout(() => {
        window.location.href = '../HTML/index.html'; // ajusta la ruta a tu página de inicio
    }, 1800);
});