// 404
const AppError = require('./AppError');

/** Se lanza cuando un recurso solicitado no existe. */
class NotFoundError extends AppError {
  constructor(mensaje = 'el recurso solicitado no existe') {
    super(mensaje, 404);
  }
}

module.exports = NotFoundError;