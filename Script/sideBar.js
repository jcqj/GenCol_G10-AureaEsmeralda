async function loadInclude(selector, file) {
  const imps = document.querySelector(selector);
  if (!imps) return;// ! si imps no existe no carga nada
  const res = await fetch(file);
  imps.innerHTML = await res.text();
}

loadInclude("#sidebar-container", "sideBar.html");