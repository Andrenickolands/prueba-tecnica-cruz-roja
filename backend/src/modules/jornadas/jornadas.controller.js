const jornadasService = require('./jornadas.service');

/**
 * Controller de Jornadas.
 * Responsabilidad única: leer el request (req), llamar al service,
 * y devolver la respuesta (res) con el código HTTP correcto.
 */

async function listar(req, res) {
  const { activa, fecha } = req.query;

  const filtros = {
    // Conversión a booleano delm query
    activa: activa !== undefined ? activa === 'true' : undefined,
    fecha,
  };

  const jornadas = await jornadasService.obtenerJornadas(filtros);
  res.status(200).json(jornadas);
}

async function obtenerPorId(req, res) {
  const jornada = await jornadasService.obtenerJornadaPorId(req.params.id);
  res.status(200).json(jornada);
}

async function crear(req, res) {
  const nuevaJornada = await jornadasService.registrarJornada(req.body);
  res.status(201).json(nuevaJornada);
}

async function actualizar(req, res) {
  const jornadaActualizada = await jornadasService.modificarJornada(req.params.id, req.body);
  res.status(200).json(jornadaActualizada);
}

async function eliminar(req, res) {
  await jornadasService.eliminarJornada(req.params.id);
  res.status(204).send();
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};