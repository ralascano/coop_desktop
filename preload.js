const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // 📌 READ
  consultarUsuarios: () => ipcRenderer.invoke("get-usuarios"),

  // 📌 CREATE
  guardarUsuario: (usuario) => ipcRenderer.invoke("add-usuario", usuario),

  // 📌 UPDATE
  actualizarUsuario: (usuario) => ipcRenderer.invoke("update-usuario", usuario),

  // 📌 DELETE (soft)
  eliminarUsuario: (id) => ipcRenderer.invoke("delete-usuario", id),
});
