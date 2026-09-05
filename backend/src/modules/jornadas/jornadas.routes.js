const { Router } = require('express');
const jornadasController = require('./jornadas.controller');
const validate = require('../../middlewares/validate');
const {
  crearJornadaSchema,
  actualizarJornadaSchema,
} = require('./jornadas.schema');

const router = Router();

router.get('/', jornadasController.listar);
router.get('/:id', jornadasController.obtenerPorId);
router.post('/', validate(crearJornadaSchema, 'body'), jornadasController.crear);
router.put('/:id', validate(actualizarJornadaSchema, 'body'), jornadasController.actualizar);
router.delete('/:id', jornadasController.eliminar);

module.exports = router;