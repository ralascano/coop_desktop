export function initUsuarios() {
  const btnGuardar = document.getElementById("btnGuardar");
  const btnCancelar = document.getElementById("btnCancelar");

  const modalElement = document.getElementById("modalUsuario");
  const btnAbrir = document.getElementById("btnAbrirModal");
  const modal = new bootstrap.Modal(modalElement);

  // 🔥 Modal de eliminación
  const modalEliminarElement = document.getElementById("modalEliminar");
  const modalEliminar = new bootstrap.Modal(modalEliminarElement);

  let usuarioAEliminar = null; // 🔥 guardamos temporalmente el id a eliminar

  btnAbrir.addEventListener("click", () => {
    modal.show();
  });

  // 🔥 Guardar con cierre automático si todo sale bien
  btnGuardar.addEventListener("click", async () => {
    const ok = await guardar();

    if (ok) {
      modal.hide();
      limpiarFormulario();
      refrescarLista();
    }
  });

  btnCancelar.addEventListener("click", () => {
    limpiarFormulario();
    modal.hide();
  });

  // 🔥 Confirmación de eliminación
  document
    .getElementById("btnConfirmarEliminar")
    .addEventListener("click", async () => {
      if (usuarioAEliminar) {
        await window.api.eliminarUsuario(Number(usuarioAEliminar));
        usuarioAEliminar = null;
        modalEliminar.hide();
        refrescarLista();
      }
    });

  refrescarLista();

  // 🔥 hacemos accesible modalEliminar y setter al resto del módulo
  window._modalEliminar = modalEliminar;
  window._setUsuarioAEliminar = (id) => {
    usuarioAEliminar = id;
  };
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
            <button data-id="${u.id}" class="editar btn btn-sm btn-warning">Editar</button>
            <button data-id="${u.id}" class="eliminar btn btn-sm btn-danger">Eliminar</button>
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

      const modalElement = document.getElementById("modalUsuario");
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    });
  });

  document.querySelectorAll(".eliminar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      // 🔥 guardamos el id en variable global temporal
      window._setUsuarioAEliminar(id);

      // 🔥 mostramos el modal
      window._modalEliminar.show();
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
    return false;
  }

  try {
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

    return true;
  } catch (error) {
    console.error("Error guardando usuario:", error);
    return false;
  }
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
