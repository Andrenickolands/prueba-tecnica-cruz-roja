const { Router } = require('express');
const inscripcionesController = require('./inscripciones.controller');
const validate = require('../../middlewares/validate');
const { crearInscripcionSchema } = require('./inscripciones.schema');

/*
* POST /api/jornadas/:id/inscripciones (anidada bajo jornadas) Inscribir a una persona en una jornada
* DELETE /api/inscripciones/:id (raíz propia) Cancelar una inscripción y liberar el cupo
*/

// Router que se monta bajo /api/jornadas/:id/... 
const rutasAnidadasEnJornada = Router({ mergeParams: true });
rutasAnidadasEnJornada.post(
  '/inscripciones',
  validate(crearInscripcionSchema, 'body'),
  inscripcionesController.inscribir,
);
rutasAnidadasEnJornada.get(
  '/inscripciones',
  inscripcionesController.listarPorJornada,
);

// Router que se monta directo en /api/inscripciones/...
const rutasRaiz = Router();
rutasRaiz.delete('/:id', inscripcionesController.cancelar);

module.exports = {
  rutasAnidadasEnJornada,
  rutasRaiz,
};