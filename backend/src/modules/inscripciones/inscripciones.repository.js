const pool = require('../../config/db');

/**
 * Repository de Inscripciones.
 * La operación crítica (inscribirPersona) usa una transacción con
 * bloqueo de fila (FOR UPDATE) para controlar el cupo bajo concurrencia.
 */

/**
 * Inscribe a una persona en una jornada, validando y actualizando el cupo
 * dentro de una única transacción.
 * @param {{ jornadaId: string, nombreCompleto: string, tipoDocumento: string,
 *           numeroDocumento: string, correo: string }} datos
 */
async function inscribirPersona(datos) {
  const { jornadaId, nombreCompleto, tipoDocumento, numeroDocumento, correo } = datos;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Si otra transacción ya tiene el lock sobre la misma jornada, esta espera.
    const resultadoJornada = await client.query(
      `SELECT id, cupo_total, cupo_ocupado, activa, fecha
       FROM jornadas
       WHERE id = $1
       FOR UPDATE`,
      [jornadaId],
    );

    const jornada = resultadoJornada.rows[0];

    if (!jornada) {
      await client.query('ROLLBACK');
      const error = new Error('La jornada solicitada no existe');
      error.codigoNegocio = 'JORNADA_NO_ENCONTRADA';
      throw error;
    }

    if (!jornada.activa) {
      await client.query('ROLLBACK');
      const error = new Error('No se puede inscribir en una jornada inactiva');
      error.codigoNegocio = 'JORNADA_INACTIVA';
      throw error;
    }

    // Se compara solo la fecha (sin hora) contra el día actual.
    const fechaJornada = new Date(jornada.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaJornada < hoy) {
      await client.query('ROLLBACK');
      const error = new Error('No se puede inscribir en una jornada con fecha ya cumplida');
      error.codigoNegocio = 'JORNADA_FECHA_CUMPLIDA';
      throw error;
    }

    if (jornada.cupo_ocupado >= jornada.cupo_total) {
      await client.query('ROLLBACK');
      const error = new Error('La jornada no tiene cupo disponible');
      error.codigoNegocio = 'CUPO_AGOTADO';
      throw error;
    }

    // Duplicado verificado con `client` (no `pool`), para quedar protegido
    // por el mismo bloqueo de la transacción.
    const resultadoDuplicado = await client.query(
      `SELECT id FROM inscripciones
       WHERE jornada_id = $1 AND tipo_documento = $2 AND numero_documento = $3
         AND estado = 'CONFIRMADA'`,
      [jornadaId, tipoDocumento, numeroDocumento],
    );

    if (resultadoDuplicado.rows.length > 0) {
      await client.query('ROLLBACK');
      const error = new Error('Esta persona ya tiene una inscripción confirmada en esta jornada');
      error.codigoNegocio = 'INSCRIPCION_DUPLICADA';
      throw error;
    }

    // se ocupa el cupo y se crea la inscripción.
    await client.query(
      `UPDATE jornadas SET cupo_ocupado = cupo_ocupado + 1 WHERE id = $1`,
      [jornadaId],
    );

    const resultadoInscripcion = await client.query(
      `INSERT INTO inscripciones
         (jornada_id, nombre_completo, tipo_documento, numero_documento, correo, estado)
       VALUES ($1, $2, $3, $4, $5, 'CONFIRMADA')
       RETURNING id, jornada_id, nombre_completo, tipo_documento, numero_documento, correo, estado, created_at`,
      [jornadaId, nombreCompleto, tipoDocumento, numeroDocumento, correo],
    );

    await client.query('COMMIT');

    return resultadoInscripcion.rows[0];
  } catch (error) {
   
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    // Libera la conexión siempre, con éxito o error, para no agotar el Pool.
    client.release();
  }
}

/**
 * Cancela una inscripción y libera el cupo, en una sola 
 * @param {string} inscripcionId
 */
async function cancelarInscripcion(inscripcionId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const resultadoInscripcion = await client.query(
      `SELECT id, jornada_id, estado FROM inscripciones WHERE id = $1 FOR UPDATE`,
      [inscripcionId],
    );

    const inscripcion = resultadoInscripcion.rows[0];

    if (!inscripcion) {
      await client.query('ROLLBACK');
      return null;
    }

    if (inscripcion.estado === 'CANCELADA') {
      await client.query('ROLLBACK');
      const error = new Error('Esta inscripción ya estaba cancelada');
      error.codigoNegocio = 'INSCRIPCION_YA_CANCELADA';
      throw error;
    }

    await client.query(
      `UPDATE inscripciones SET estado = 'CANCELADA' WHERE id = $1`,
      [inscripcionId],
    );

    // Libera el cupo, para que quede consistente.
    await client.query(
      `UPDATE jornadas SET cupo_ocupado = cupo_ocupado - 1 WHERE id = $1`,
      [inscripcion.jornada_id],
    );

    await client.query('COMMIT');

    return { id: inscripcionId, estado: 'CANCELADA' };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Lista las inscripciones de una jornada, ordenadas por fecha de registro.
 * @param {string} jornadaId
 */
async function listarInscripcionesPorJornada(jornadaId) {
  const consulta = `
    SELECT id, jornada_id, nombre_completo, tipo_documento, numero_documento, correo, estado, created_at
    FROM inscripciones
    WHERE jornada_id = $1
    ORDER BY created_at ASC
  `;
  const resultado = await pool.query(consulta, [jornadaId]);
  return resultado.rows;
}

module.exports = {
  inscribirPersona,
  cancelarInscripcion,
  listarInscripcionesPorJornada,
};