const path = require("path");
const { app } = require("electron");
const Database = require("better-sqlite3");

const dbPath = path.join(app.getPath("userData"), "cooperativa.db");
const db = new Database(dbPath);

// Activar claves foráneas
db.pragma("foreign_keys = ON");

// =====================
// CREAR TABLAS
// =====================

// USUARIOS
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
    observaciones TEXT,
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`
).run();

// PRESTAMOS
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS prestamos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    socio_id INTEGER NOT NULL,
    monto_prestado REAL NOT NULL,
    interes_porcentaje REAL NOT NULL,
    monto_total REAL NOT NULL,
    saldo_pendiente REAL NOT NULL,
    fecha_inicio DATE NOT NULL,
    estado TEXT CHECK(estado IN ('ACTIVO','PAGADO')) DEFAULT 'ACTIVO',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (socio_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )
`
).run();

// MOVIMIENTOS
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    socio_id INTEGER NOT NULL,
    tipo TEXT CHECK(tipo IN (
      'DEPOSITO',
      'RETIRO',
      'PRESTAMO',
      'ABONO_PRESTAMO',
      'INTERES'
    )) NOT NULL,
    monto REAL NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    prestamo_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (socio_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON DELETE SET NULL
  )
`
).run();

// INDICES
db.prepare(
  `
  CREATE INDEX IF NOT EXISTS idx_movimientos_socio 
  ON movimientos(socio_id);
`
).run();

db.prepare(
  `
  CREATE INDEX IF NOT EXISTS idx_prestamos_socio 
  ON prestamos(socio_id);
`
).run();

module.exports = db;
