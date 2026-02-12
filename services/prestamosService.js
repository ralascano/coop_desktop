const db = require("../database/db");

// ==============================
// Crear préstamo
// ==============================
function crearPrestamo(datos) {
  const { socio_id, monto_prestado, interes_porcentaje, fecha_inicio } = datos;

  if (!socio_id || !monto_prestado || !interes_porcentaje || !fecha_inicio) {
    throw new Error("Campos obligatorios faltantes");
  }

  const montoTotal =
    parseFloat(monto_prestado) +
    (parseFloat(monto_prestado) * parseFloat(interes_porcentaje)) / 100;

  const transaction = db.transaction(() => {
    // 1️⃣ Insertar préstamo
    const insertPrestamo = db.prepare(`
      INSERT INTO prestamos
      (socio_id, monto_prestado, interes_porcentaje, monto_total, saldo_pendiente, fecha_inicio)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const prestamoResult = insertPrestamo.run(
      socio_id,
      parseFloat(monto_prestado),
      parseFloat(interes_porcentaje),
      montoTotal,
      montoTotal,
      fecha_inicio
    );

    const prestamoId = prestamoResult.lastInsertRowid;

    // 2️⃣ Crear movimiento asociado
    const insertMovimiento = db.prepare(`
      INSERT INTO movimientos
      (socio_id, tipo, monto, descripcion, fecha, prestamo_id)
      VALUES (?, 'PRESTAMO', ?, ?, ?, ?)
    `);

    insertMovimiento.run(
      socio_id,
      parseFloat(monto_prestado),
      `Préstamo generado`,
      fecha_inicio,
      prestamoId
    );

    return prestamoId;
  });

  return transaction();
}

// ==============================
// Obtener préstamos por socio
// ==============================
function getPrestamosBySocio(socio_id) {
  return db
    .prepare(
      `
    SELECT *
    FROM prestamos
    WHERE socio_id = ?
    ORDER BY fecha_inicio DESC
  `
    )
    .all(socio_id);
}

// ==============================
// Registrar abono a préstamo
// ==============================
function abonarPrestamo(datos) {
  const { prestamo_id, monto, fecha } = datos;

  if (!prestamo_id || !monto || !fecha) {
    throw new Error("Campos obligatorios faltantes");
  }

  const transaction = db.transaction(() => {
    // Obtener préstamo
    const prestamo = db
      .prepare(
        `
      SELECT * FROM prestamos WHERE id = ?
    `
      )
      .get(prestamo_id);

    if (!prestamo) {
      throw new Error("Préstamo no encontrado");
    }

    const nuevoSaldo = prestamo.saldo_pendiente - parseFloat(monto);

    // Actualizar saldo
    db.prepare(
      `
      UPDATE prestamos
      SET saldo_pendiente = ?, 
          estado = CASE WHEN ? <= 0 THEN 'PAGADO' ELSE 'ACTIVO' END
      WHERE id = ?
    `
    ).run(nuevoSaldo, nuevoSaldo, prestamo_id);

    // Crear movimiento
    db.prepare(
      `
      INSERT INTO movimientos
      (socio_id, tipo, monto, descripcion, fecha, prestamo_id)
      VALUES (?, 'ABONO_PRESTAMO', ?, ?, ?, ?)
    `
    ).run(
      prestamo.socio_id,
      parseFloat(monto),
      `Abono a préstamo`,
      fecha,
      prestamo_id
    );

    return true;
  });

  return transaction();
}

module.exports = {
  crearPrestamo,
  getPrestamosBySocio,
  abonarPrestamo,
};
