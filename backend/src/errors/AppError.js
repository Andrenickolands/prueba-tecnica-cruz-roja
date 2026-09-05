class AppError extends Error {
  constructor(mensaje, codigoHttp) {
    super(mensaje);
    this.name = this.constructor.name;
    this.codigoHttp = codigoHttp;
    this.esErrorControlado = true; // distingue errores esperados de bugs inesperados
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;