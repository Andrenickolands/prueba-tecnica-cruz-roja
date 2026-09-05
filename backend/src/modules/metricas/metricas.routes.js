const { Router } = require('express');
const metricasController = require('./metricas.controller');

const router = Router();

router.get('/', metricasController.obtener);

module.exports = router;