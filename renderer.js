async function navigate(page) {
  const content = document.getElementById("content");

  const response = await fetch(`pages/${page}/${page}.html`);
  const html = await response.text();
  content.innerHTML = html;

  const moduleUrl = new URL(`./pages/${page}/${page}.js`, window.location.href);
  const mod = await import(moduleUrl);

  // init genérico (si existe)
  const initName = `init${capitalize(page)}`;
  if (typeof mod[initName] === "function") mod[initName]();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 🔥 esto hace que onclick="navigate('usuarios')" funcione
window.navigate = navigate;

// carga por defecto
window.addEventListener("DOMContentLoaded", () => {
  navigate("dashboard");
});
