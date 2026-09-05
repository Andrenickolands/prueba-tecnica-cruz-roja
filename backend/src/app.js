const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const jornadasRoutes = require('./modules/jornadas/jornadas.routes');
const { rutasRaiz: inscripcionesRoutes } = require('./modules/inscripciones/inscripciones.routes');
const metricasRoutes = require('./modules/metricas/metricas.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/jornadas', jornadasRoutes);
app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/metricas', metricasRoutes);

app.use(errorHandler);

module.exports = app;