const metricasService = require('./metricas.service');

/**
 * Controller de Métricas.
 * Lee el request, llama al service, y responde con el código HTTP correcto.
 */

async function obtener(req, res) {
  const metricas = await metricasService.calcularMetricas();
  res.status(200).json(metricas);
}

module.exports = {
  obtener,
};