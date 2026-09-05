const metricasRepository = require('./metricas.repository');

/**
 * Service de Métricas.
 *
 * REGLA DE NEGOCIO EN ESTE ARCHIVO:
 * El porcentaje de ocupación global se calcula aquí porque
 * hay que manejar el caso de cupo_total_global = 0 sin que se rompa
 */

async function calcularMetricas() {
  const datos = await metricasRepository.obtenerMetricas();

  const cupoTotalGlobal = Number(datos.cupo_total_global);
  const cupoOcupadoGlobal = Number(datos.cupo_ocupado_global);

  // Si no hay cupo total (no hay jornadas, o todas tienen cupo 0), el porcentaje se reporta como 0 en vez de dividir entre cero.
  const porcentajeOcupacion = cupoTotalGlobal === 0
    ? 0
    : Number(((cupoOcupadoGlobal / cupoTotalGlobal) * 100).toFixed(2));

  return {
    jornadasActivas: Number(datos.jornadas_activas),
    inscripcionesConfirmadas: Number(datos.inscripciones_confirmadas),
    porcentajeOcupacionGlobal: porcentajeOcupacion,
    ultimaInscripcionRegistrada: datos.ultima_inscripcion,
  };
}

module.exports = {
  calcularMetricas,
};