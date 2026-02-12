const db = require("../database/db");

// ==============================
// Obtener todos los movimientos
// ==============================
function getMovimientos() {
  return db
    .prepare(
      `
    SELECT 
      m.*,
      u.nombre || ' ' || u.apellido AS socio_nombre
    FROM movimientos m
    JOIN usuarios u ON u.id = m.socio_id
    ORDER BY m.fecha ASC
  `
    )
    .all();
}

// ==============================
// Obtener movimientos por socio
// ==============================
function getMovimientosBySocio(socio_id) {
  return db
    .prepare(
      `
    SELECT *
    FROM movimientos
    WHERE socio_id = ?
    ORDER BY fecha ASC
  `
    )
    .all(socio_id);
}

// ==============================
// Crear movimiento
// ==============================
function addMovimiento(datos) {
  const { socio_id, tipo, monto, descripcion, fecha, prestamo_id } = datos;

  if (!socio_id || !tipo || !monto || !fecha) {
    throw new Error("Campos obligatorios faltantes");
  }

  const insert = db.prepare(`
    INSERT INTO movimientos
    (socio_id, tipo, monto, descripcion, fecha, prestamo_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    socio_id,
    tipo,
    parseFloat(monto),
    descripcion || null,
    fecha,
    prestamo_id || null
  );

  return result.changes > 0;
}

// ==============================
// Calcular saldo dinámico
// ==============================
function calcularSaldoSocio(socio_id) {
  const movimientos = db
    .prepare(
      `
    SELECT tipo, monto
    FROM movimientos
    WHERE socio_id = ?
  `
    )
    .all(socio_id);

  let saldo = 0;

  movimientos.forEach((m) => {
    if (["DEPOSITO", "ABONO_PRESTAMO", "INTERES"].includes(m.tipo)) {
      saldo += m.monto;
    } else if (["RETIRO", "PRESTAMO"].includes(m.tipo)) {
      saldo -= m.monto;
    }
  });

  return saldo;
}

module.exports = {
  getMovimientos,
  getMovimientosBySocio,
  addMovimiento,
  calcularSaldoSocio,
};
