const db = require("../database/db");

function getUsuarios() {
  return db
    .prepare(
      `
    SELECT * FROM usuarios WHERE activo = 1
  `
    )
    .all();
}

function addUsuario(datos) {
  const { nombre, apellido, cedula, telefono, direccion, rol } = datos;

  if (!nombre || !apellido || !cedula || !rol) {
    throw new Error("Campos obligatorios faltantes");
  }

  const insert = db.prepare(`
    INSERT INTO usuarios
    (nombre, apellido, cedula, telefono, direccion, rol)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    nombre.trim(),
    apellido.trim(),
    cedula.trim(),
    telefono?.trim() || null,
    direccion?.trim() || null,
    rol
  );

  return result.changes > 0;
}

function updateUsuario(datos) {
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
}

function deleteUsuario(id) {
  const del = db.prepare(`
    UPDATE usuarios
    SET activo = 0
    WHERE id = ?
  `);

  const result = del.run(id);
  return result.changes > 0;
}

module.exports = {
  getUsuarios,
  addUsuario,
  updateUsuario,
  deleteUsuario,
};
