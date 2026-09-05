/**
 * Middleware centralizado de manejo de errores.
 * Debe registrarse SIEMPRE al final de todos los middlewares y rutas en app.js.
 *
 * Responsabilidad única: traducir cualquier error lanzado en la aplicación
 * a una respuesta HTTP consistente, sin filtrar detalles internos al cliente
 * (trazas de pila, mensajes de PostgreSQL, rutas de archivos, etc).
 */
function errorHandler(error, req, res, next) {
  // Errores esperados por la aplicación (AppError y sus subclases)
  if (error.esErrorControlado) {
    const respuesta = { mensaje: error.message };

    if (error.detalles) {
      respuesta.detalles = error.detalles;
    }

    if (error.codigoNegocio) {
      respuesta.codigoNegocio = error.codigoNegocio;
    }

    return res.status(error.codigoHttp).json(respuesta);
  }

  // Cualquier otro error es inesperado (bug, fallo de conexión a BD, etc).
  // Se registra en el servidor para diagnóstico, pero al cliente solo
  // se le informa un mensaje genérico — nunca la traza interna.
  console.error('Error inesperado:', error);

  return res.status(500).json({
    mensaje: 'Ocurrió un error interno. Intente nuevamente más tarde.',
  });
}

module.exports = errorHandler;