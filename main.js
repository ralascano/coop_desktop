const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const movimientosService = require("./services/movimientosService");
const prestamosService = require("./services/prestamosService");

// Inicializa base (solo importarlo ya ejecuta la creación)
require("./database/db");

// Importar servicios
const usuariosService = require("./services/usuariosService");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();
});

// ==========================
// IPC
// ==========================

ipcMain.handle("get-usuarios", () => {
  return usuariosService.getUsuarios();
});

ipcMain.handle("add-usuario", (event, datos) => {
  return usuariosService.addUsuario(datos);
});

ipcMain.handle("update-usuario", (event, datos) => {
  return usuariosService.updateUsuario(datos);
});

ipcMain.handle("delete-usuario", (event, id) => {
  return usuariosService.deleteUsuario(id);
});

ipcMain.handle("get-movimientos", () => {
  return movimientosService.getMovimientos();
});

ipcMain.handle("add-movimiento", (e, datos) => {
  return movimientosService.addMovimiento(datos);
});

ipcMain.handle("crear-prestamo", (e, datos) => {
  return prestamosService.crearPrestamo(datos);
});

ipcMain.handle("abonar-prestamo", (e, datos) => {
  return prestamosService.abonarPrestamo(datos);
});
