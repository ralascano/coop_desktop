export function initUsuarios() {
  const btnGuardar = document.getElementById("btnGuardar");
  const btnCancelar = document.getElementById("btnCancelar");

  btnGuardar.addEventListener("click", guardar);
  btnCancelar.addEventListener("click", limpiarFormulario);

  refrescarLista();
}

async function refrescarLista() {
  const usuarios = await window.api.consultarUsuarios();
  const tbody = document.getElementById("tablaUsuarios");

  tbody.innerHTML = usuarios
    .map(
      (u) => `
      <tr>
        <td>${u.id}</td>
        <td>${u.nombre}</td>
        <td>${u.apellido}</td>
        <td>${u.cedula}</td>
        <td>${u.rol}</td>
        <td>
          <button data-id="${u.id}" class="editar">Editar</button>
          <button data-id="${u.id}" class="eliminar">Eliminar</button>
        </td>
      </tr>
    `
    )
    .join("");

  attachRowEvents(usuarios);
}

function attachRowEvents(usuarios) {
  document.querySelectorAll(".editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const usuario = usuarios.find((u) => u.id == id);
      cargarFormulario(usuario);
    });
  });

  document.querySelectorAll(".eliminar").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (confirm("¿Eliminar usuario?")) {
        await window.api.eliminarUsuario(Number(id));
        refrescarLista();
      }
    });
  });
}

async function guardar() {
  const id = document.getElementById("usuarioId").value;
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const cedula = document.getElementById("cedula").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const direccion = document.getElementById("direccion").value.trim();
  const rol = document.getElementById("rol").value;

  if (!nombre || !apellido || !cedula || !rol) {
    alert("Campos obligatorios");
    return;
  }

  if (id) {
    await window.api.actualizarUsuario({
      id: Number(id),
      nombre,
      apellido,
      telefono,
      direccion,
      rol,
    });
  } else {
    await window.api.guardarUsuario({
      nombre,
      apellido,
      cedula,
      telefono,
      direccion,
      rol,
    });
  }

  limpiarFormulario();
  refrescarLista();
}

function cargarFormulario(usuario) {
  document.getElementById("usuarioId").value = usuario.id;
  document.getElementById("nombre").value = usuario.nombre;
  document.getElementById("apellido").value = usuario.apellido;
  document.getElementById("cedula").value = usuario.cedula;
  document.getElementById("telefono").value = usuario.telefono || "";
  document.getElementById("direccion").value = usuario.direccion || "";
  document.getElementById("rol").value = usuario.rol;
}

function limpiarFormulario() {
  document.getElementById("usuarioId").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("apellido").value = "";
  document.getElementById("cedula").value = "";
  document.getElementById("telefono").value = "";
  document.getElementById("direccion").value = "";
  document.getElementById("rol").value = "";
}
