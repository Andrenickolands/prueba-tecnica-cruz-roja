const jornadasRepository = require('./jornadas.repository');
const NotFoundError = require('../../errors/NotFoundError');
const ConflictError = require('../../errors/ConflictError');

/**
 * Service de Jornadas.
 *
 * REGLAS DE NEGOCIO EN ESTE ARCHIVO:
 * 1. Al buscar una jornada por id, si no existe, se debe avisar con un error
 *    claro (NotFoundError) en vez de devolver vacío sin explicación.
 * 2. No se puede reducir el cupo total de una jornada por debajo del cupo
 *    que ya está ocupado (si hay 8 personas inscritas, no puedo bajar el
 *    cupo total a 5).
 * 3. Al "eliminar" una jornada, en realidad se desactiva (no se borra),
 *    para no perder el historial de inscripciones.
 */

async function obtenerJornadas(filtros) {
  return jornadasRepository.listarJornadas(filtros);
}

async function obtenerJornadaPorId(id) {
  // Repository busca una jornada por su id.
  const jornada = await jornadasRepository.buscarJornadaPorId(id);

  if (!jornada) {
    // Si no encontró nada (jornada es null), avisamos con un error
    throw new NotFoundError('La jornada solicitada no existe');
  }

  // Si sí existe, la devolvemos normal.
  return jornada;
}

async function registrarJornada(datosJornada) {
  // Reenviamos los datos al repository para que la inserte, porque la base de datos se encarga de rechazar cupos negativos con el CHECK
  return jornadasRepository.crearJornada(datosJornada);
}

async function modificarJornada(id, cambios) {
  // Valida la jornada que quieren modificar y si el cambio que piden es válido.
  const jornadaActual = await jornadasRepository.buscarJornadaPorId(id);

  if (!jornadaActual) {
    // Si no existe la jornada avisamos.
    throw new NotFoundError('La jornada solicitada no existe');
  }

  // Regla de negocio principal: no se puede reducir el cupo total por debajo del cupo ocupado.
  if (
    cambios.cupoTotal !== undefined &&
    cambios.cupoTotal < jornadaActual.cupo_ocupado
  ) {
    throw new ConflictError(
      `No se puede reducir el cupo total a ${cambios.cupoTotal} porque ya hay ${jornadaActual.cupo_ocupado} inscripciones confirmadas`,
      'REDUCCION_CUPO_INVALIDA',
    );
  }

  return jornadasRepository.actualizarJornada(id, cambios);
}

async function eliminarJornada(id) { 
  const jornadaDesactivada = await jornadasRepository.desactivarJornada(id);

  if (!jornadaDesactivada) {
    // Si repository no encuentra ninguna fila para desactivar, esa jornada no existe.
    throw new NotFoundError('La jornada solicitada no existe');
  }

  return jornadaDesactivada;
}

module.exports = {
  obtenerJornadas,
  obtenerJornadaPorId,
  registrarJornada,
  modificarJornada,
  eliminarJornada,
};