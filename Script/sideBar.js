async function loadInclude(selector, file) {
  const imps = document.querySelector(selector);
  if (!imps) return;

  const res = await fetch(file);
  imps.innerHTML = await res.text();

  const btnCerrar = document.getElementById("btnCerrarSesionSidebar");

  if (btnCerrar) {
    btnCerrar.addEventListener("click", (e) => {
      e.preventDefault();

      // limpiar sesión (ajusta si usas otra clave)
      localStorage.clear();

      // redirigir al login o inicio
      window.location.href = '../HTML/index.html';
    });
  }
}

loadInclude("#sidebar-container", "sideBar.html");