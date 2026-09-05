const ValidationError = require('../errors/ValidationError');

/*
 * Validar y traducir errores de Zod"en cada controller 
 */
function validate(schema, origen = 'body') {
  return (req, res, next) => {
    const resultado = schema.safeParse(req[origen]);

    if (!resultado.success) {
      const detalles = resultado.error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensaje: issue.message,
      }));

      throw new ValidationError('Los datos enviados no son válidos', detalles);
    }

    // Reemplaza los datos brutos por los ya validados y transformados por Zod
    req[origen] = resultado.data;
    next();
  };
}

module.exports = validate;