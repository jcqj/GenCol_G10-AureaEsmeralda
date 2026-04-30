
/* ══════════════════════════════════════════════════════
   AUREA ESMERALDA — Registro de usuario
   Funciones: validación, fortaleza de contraseña,
              construcción de objeto JSON, localStorage
══════════════════════════════════════════════════════ */

// ── Selectors ─────────────────────────────────────────
const form = document.getElementById('registerForm');
const inputNombre = document.getElementById('nombre');
const inputTel = document.getElementById('telefono');
const prefijo = document.getElementById('prefijo');
const inputEmail = document.getElementById('email');
const inputPass = document.getElementById('password');
const inputConfirm = document.getElementById('confirm');
const chkTerminos = document.getElementById('terminos');
const submitBtn = document.getElementById('submitBtn');

// ── Toggle password visibility ─────────────────────────
function setupToggle(btnId, inputEl, iconId) {
    document.getElementById(btnId).addEventListener('click', () => {
        const isPass = inputEl.type === 'password';
        inputEl.type = isPass ? 'text' : 'password';
        const icon = document.getElementById(iconId);
        icon.className = isPass ? 'bi bi-eye' : 'bi bi-eye-slash';
    });
}
setupToggle('togglePass', inputPass, 'eyeIcon');
setupToggle('toggleConfirm', inputConfirm, 'eyeIcon2');

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
    const errEl = document.getElementById(errId);
    errEl.classList.add('visible');
    if (textId) document.getElementById(textId).textContent = msg;
}

function clearError(inputEl, errId) {
    inputEl.classList.remove('is-invalid');
    inputEl.classList.add('is-valid');
    document.getElementById(errId).classList.remove('visible');
}

// ── Individual validators ──────────────────────────────
function validateNombre() {
    const v = inputNombre.value.trim();
    if (!v) {
        showError(inputNombre, 'err-nombre', 'err-nombre-text', 'El nombre es obligatorio.');
        return false;
    }
    if (v.length < 3) {
        showError(inputNombre, 'err-nombre', 'err-nombre-text', 'Mínimo 3 caracteres.');
        return false;
    }
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(v)) {
        showError(inputNombre, 'err-nombre', 'err-nombre-text', 'Solo letras, espacios y guiones.');
        return false;
    }
    clearError(inputNombre, 'err-nombre');
    return true;
}

function validateTelefono() {
    const v = inputTel.value.trim().replace(/\s/g, '');
    if (!v) {
        showError(inputTel, 'err-telefono', 'err-telefono-text', 'El número de teléfono es obligatorio.');
        return false;
    }
    if (!/^\d{7,12}$/.test(v)) {
        showError(inputTel, 'err-telefono', 'err-telefono-text', 'Ingresa entre 7 y 12 dígitos.');
        return false;
    }
    clearError(inputTel, 'err-telefono');
    return true;
}

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


    // Verify not already registered
    const usuarios = JSON.parse(localStorage.getItem('aureaEsmeraldaUsers') || '[]');
    if (usuarios.some(u => u.email === v)) {
        showError(inputEmail, 'err-email', 'err-email-text', 'Este correo ya está registrado.');
        return false;
    }
    clearError(inputEmail, 'err-email');
    return true;
}

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
    if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) {
        showError(inputPass, 'err-password', 'err-password-text', 'Debe incluir letras y al menos un número.');
        return false;
    }
    clearError(inputPass, 'err-password');
    return true;
}

function validateConfirm() {
    const v = inputConfirm.value;
    if (!v) {
        showError(inputConfirm, 'err-confirm', 'err-confirm-text', 'Confirma tu contraseña.');
        return false;
    }
    if (v !== inputPass.value) {
        showError(inputConfirm, 'err-confirm', 'err-confirm-text', 'Las contraseñas no coinciden.');
        return false;
    }
    clearError(inputConfirm, 'err-confirm');
    return true;
}

function validateTerminos() {
    const errEl = document.getElementById('err-terminos');
    if (!chkTerminos.checked) {
        errEl.classList.add('visible');
        return false;
    }
    errEl.classList.remove('visible');
    return true;
}

// ── Live validation on blur ────────────────────────────
inputNombre.addEventListener('blur', validateNombre);
inputTel.addEventListener('blur', validateTelefono);
inputEmail.addEventListener('blur', validateEmail);
inputPass.addEventListener('blur', validatePassword);
inputConfirm.addEventListener('blur', validateConfirm);

// re-check confirm when password changes
inputPass.addEventListener('input', () => {
    if (inputConfirm.value) validateConfirm();
});

// ── Simple hash (no crypto dependency needed for demo) ─
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
}

// ── Build user object & save ───────────────────────────
function buildUserObject() {
    return {
        id: crypto.randomUUID(),
        nombreCompleto: inputNombre.value.trim(),
        telefono: {
            prefijo: prefijo.value,
            numero: inputTel.value.trim().replace(/\s/g, ''),
            completo: prefijo.value + inputTel.value.trim().replace(/\s/g, ''),
        },
        email: inputEmail.value.trim().toLowerCase(),
        passwordHash: simpleHash(inputPass.value),   // never store plain text
        fechaRegistro: new Date().toISOString(),
        activo: true,
        rol: "cliente"
    };
}



function saveToLocalStorage(usuario) {
    const key = 'aureaEsmeraldaUsers';
    const lista = JSON.parse(localStorage.getItem(key) || '[]');
    lista.push(usuario);
    localStorage.setItem(key, JSON.stringify(lista));
    // also save last logged-in session reference
    //localStorage.setItem('aureaEsmeraldaSession', JSON.stringify({ id: usuario.id, email: usuario.email }));
    console.table({ ...usuario, passwordHash: '[protected]' });
}

// ── Toast ──────────────────────────────────────────────
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

// ── Form submit ────────────────────────────────────────
form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.disabled = true;

    const ok = [
        validateNombre(),
        validateTelefono(),
        validateEmail(),
        validatePassword(),
        validateConfirm(),
        validateTerminos(),
    ].every(Boolean);

    if (!ok) {
        submitBtn.disabled = false;
        showToast('error', 'Datos incompletos', 'Revisa los campos marcados en rojo.');
        // scroll to first error
        const firstErr = form.querySelector('.is-invalid');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // All valid — build JSON & persist
    const usuario = buildUserObject();
    saveToLocalStorage(usuario);

    showToast('success', '¡Bienvenida a Aurea Esmeralda!', 'Tu cuenta ha sido creada exitosamente.');

    // Reset & redirect simulation
    setTimeout(() => {
        form.reset();
        form.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
        strengthWrap.style.display = 'none';
        submitBtn.disabled = false;
        // window.location.href = '/login.html'; // ← descomenta en producción
    }, 2200);
});
