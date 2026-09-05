//409
const AppError = require('./AppError');

/**
 * Se lanza cuando la operación choca con el estado actual de los datos.
 * El campo `codigoNegocio` identifica el motivo específico (cupo agotado,
 * inscripción duplicada, jornada inactiva, etc.) para que el cliente
 * (frontend) pueda mostrar un mensaje preciso sin depender del texto libre.
 */
class ConflictError extends AppError {
  constructor(mensaje, codigoNegocio) {
    super(mensaje, 409);
    this.codigoNegocio = codigoNegocio;
  }
}

module.exports = ConflictError;