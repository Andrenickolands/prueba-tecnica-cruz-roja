//422
const AppError = require('./AppError');

/** Se lanza cuando los datos de entrada no cumplen el formato esperado. */
class ValidationError extends AppError {
  constructor(mensaje = 'Los datos enviados no son válidos', detalles = null) {
    super(mensaje, 422);
    this.detalles = detalles; // detalle campo por campo, útil para el cliente
  }
}

module.exports = ValidationError;