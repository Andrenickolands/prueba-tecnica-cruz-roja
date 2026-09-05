const pool = require('../../config/db');

/**
 * Repository de Jornadas.
 * Responsabilidad única: ejecutar las queries SQL contra la tabla `jornadas`.
 */

/**
 * Lista jornadas aplicando filtros opcionales por estado (activa) y fecha.
 * @param {{ activa?: boolean, fecha?: string }} filtros
 */
async function listarJornadas(filtros = {}) { // `filtros` opcional;
  const condiciones = []; // Array de fragmentos SQL
  const valores = []; // Array paralelo que guarda los VALORES reales para esas condiciones, previene inyección SQL.

  if (filtros.activa !== undefined) {
    valores.push(filtros.activa);
    condiciones.push(`activa = $${valores.length}`);
  }

  // null o undefined nunca es un filtro válido que se quiera aplicar
  if (filtros.fecha) {
    valores.push(filtros.fecha);
    condiciones.push(`fecha = $${valores.length}`);
  }

  // Si se acumuló al menos una condición, las une todas con " AND ", $1 AND fecha = $2" o string vacio
  const clausulaWhere = condiciones.length > 0
    ? `WHERE ${condiciones.join(' AND ')}`
    : '';

    // Arma el SQL final como un template string, se interpola `clausulaWhere`, Ordena siempre por fecha ascendente
  const consulta = `
    SELECT id, nombre, sede, fecha, cupo_total, cupo_ocupado, activa, created_at
    FROM jornadas
    ${clausulaWhere}
    ORDER BY fecha ASC
  `;

  // Ejecuta la consulta contra PostgreSQL usando el Pool de conexiones.
  // `await` pausa la función hasta que la base de datos responde.
  const resultado = await pool.query(consulta, valores);
  return resultado.rows; //`resultado.rows` (un array de objetos, uno por jornada).
}

/**
 * Busca una jornada por su id. Devuelve null si no existe.
 * @param {string} id
 */
async function buscarJornadaPorId(id) {
  const consulta = `
    SELECT id, nombre, sede, fecha, cupo_total, cupo_ocupado, activa, created_at
    FROM jornadas
    WHERE id = $1
  `;
  const resultado = await pool.query(consulta, [id]);
  return resultado.rows[0] || null;
}

/**
 * Inserta una nueva jornada.
 * @param {{ nombre: string, sede: string, fecha: string, cupoTotal: number }} datosJornada
 */
async function crearJornada({ nombre, sede, fecha, cupoTotal }) {
  const consulta = `
    INSERT INTO jornadas (nombre, sede, fecha, cupo_total)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nombre, sede, fecha, cupo_total, cupo_ocupado, activa, created_at
  `;
  const resultado = await pool.query(consulta, [nombre, sede, fecha, cupoTotal]);
  return resultado.rows[0];
}

/**
 * Actualiza los campos editables de una jornada existente.
 * @param {string} id
 * @param {{ nombre?: string, sede?: string, fecha?: string, cupoTotal?: number, activa?: boolean }} cambios
 */
async function actualizarJornada(id, cambios) {
  const campos = [];
  const valores = [];

  const mapaColumnas = {
    nombre: 'nombre',
    sede: 'sede',
    fecha: 'fecha',
    cupoTotal: 'cupo_total',
    activa: 'activa',
  };

  for (const [clave, columna] of Object.entries(mapaColumnas)) {
    if (cambios[clave] !== undefined) {
      valores.push(cambios[clave]);
      campos.push(`${columna} = $${valores.length}`);
    }
  }

  if (campos.length === 0) {
    return buscarJornadaPorId(id);
  }

  valores.push(id);

  const consulta = `
    UPDATE jornadas
    SET ${campos.join(', ')}
    WHERE id = $${valores.length}
    RETURNING id, nombre, sede, fecha, cupo_total, cupo_ocupado, activa, created_at
  `;

  const resultado = await pool.query(consulta, valores);
  return resultado.rows[0] || null;
}

/**
 * Marca una jornada como inactiva (borrado lógico, no físico).
 * @param {string} id
 */
async function desactivarJornada(id) {
  const consulta = `
    UPDATE jornadas
    SET activa = FALSE
    WHERE id = $1
    RETURNING id, nombre, sede, fecha, cupo_total, cupo_ocupado, activa, created_at
  `;
  const resultado = await pool.query(consulta, [id]);
  return resultado.rows[0] || null;
}

module.exports = {
  listarJornadas,
  buscarJornadaPorId,
  crearJornada,
  actualizarJornada,
  desactivarJornada,
};