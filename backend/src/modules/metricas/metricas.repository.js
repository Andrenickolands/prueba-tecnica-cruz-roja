const pool = require('../../config/db');

/**
 * Repository de Métricas.
 * Una sola consulta agregada que junta datos de jornadas e inscripciones.
 */

async function obtenerMetricas() {
  const consulta = `
    SELECT
      (SELECT COUNT(*) FROM jornadas WHERE activa = TRUE) AS jornadas_activas,
      (SELECT COUNT(*) FROM inscripciones WHERE estado = 'CONFIRMADA') AS inscripciones_confirmadas,
      (SELECT COALESCE(SUM(cupo_total), 0) FROM jornadas) AS cupo_total_global,
      (SELECT COALESCE(SUM(cupo_ocupado), 0) FROM jornadas) AS cupo_ocupado_global,
      (SELECT MAX(created_at) FROM inscripciones WHERE estado = 'CONFIRMADA') AS ultima_inscripcion
  `;

  const resultado = await pool.query(consulta);
  return resultado.rows[0];
}

module.exports = {
  obtenerMetricas,
};