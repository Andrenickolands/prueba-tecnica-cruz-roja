const inscripcionesService = require('./inscripciones.service');

/**
 * Controller de Inscripciones.
 * Lee el request, llama al service, y responde con el código HTTP correcto.
 */

async function inscribir(req, res) {
  // jornadaId viene de la URL (POST /api/jornadas/:id/inscripciones),
  // el resto de los datos vienen en el body ya validado por Zod.
  const datos = {
    jornadaId: req.params.id,
    ...req.body,
  };

  const inscripcion = await inscripcionesService.crearInscripcion(datos);
  res.status(201).json(inscripcion);
}

async function cancelar(req, res) {
  await inscripcionesService.eliminarInscripcion(req.params.id);
  res.status(204).send();
}

async function listarPorJornada(req, res) {
  const inscripciones = await inscripcionesService.obtenerInscripcionesPorJornada(req.params.id);
  res.status(200).json(inscripciones);
}

module.exports = {
  inscribir,
  cancelar,
  listarPorJornada,
};