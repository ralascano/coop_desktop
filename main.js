const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(app.getPath("userData"), "cooperativa.db");
const db = new Database(dbPath, { verbose: console.log });

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    cedula TEXT UNIQUE NOT NULL,
    telefono TEXT,
    direccion TEXT,
    rol TEXT CHECK(rol IN ('SOCIO','SOLICITANTE')) NOT NULL,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`
).run();

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

// 1. Escuchar petición para obtener socios
ipcMain.handle("get-usuarios", () => {
  return db.prepare("SELECT * FROM usuarios WHERE activo = 1").all();
});

// 2. Escuchar petición para guardar un socio
ipcMain.handle("add-usuario", (event, datos) => {
  const { nombre, apellido, cedula, telefono, direccion, rol } = datos;

  if (!nombre || !apellido || !cedula || !rol) {
    throw new Error("Campos obligatorios faltantes");
  }

  const insert = db.prepare(`
    INSERT INTO usuarios 
    (nombre, apellido, cedula, telefono, direccion, rol)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const resultado = insert.run(
    nombre.trim(),
    apellido.trim(),
    cedula.trim(),
    telefono?.trim() || null,
    direccion?.trim() || null,
    rol
  );

  return resultado.changes > 0;
});

//update
ipcMain.handle("update-usuario", (event, datos) => {
  const { id, nombre, apellido, telefono, direccion, rol } = datos;

  const update = db.prepare(`
    UPDATE usuarios
    SET nombre = ?, apellido = ?, telefono = ?, direccion = ?, rol = ?
    WHERE id = ?
  `);

  const result = update.run(
    nombre.trim(),
    apellido.trim(),
    telefono?.trim() || null,
    direccion?.trim() || null,
    rol,
    id
  );

  return result.changes > 0;
});

//delete
ipcMain.handle("delete-usuario", (event, id) => {
  const del = db.prepare(`
    UPDATE usuarios
    SET activo = 0
    WHERE id = ?
  `);

  const result = del.run(id);

  return result.changes > 0;
});

app.whenReady().then(() => {
  createWindow();
});
