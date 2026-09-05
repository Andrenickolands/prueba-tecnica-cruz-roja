const inscripcionesRepository = require('./inscripciones.repository');
const NotFoundError = require('../../errors/NotFoundError');
const ConflictError = require('../../errors/ConflictError');

/**
 * Service de Inscripciones.
 *
 * REGLAS DE NEGOCIO EN ESTE ARCHIVO:
 * 1. Reglas del cupo
 *    Traduce los errores planos del repository a errores HTTP (AppError).
 * 2. Al cancelar, si el repository no encontró la inscripción, se avisa
 *    con NotFoundError.
 */

// Códigos -> mensaje y clase de error HTTP correspondiente.
const ERRORES_INSCRIPCION = {
  JORNADA_NO_ENCONTRADA: { ClaseError: NotFoundError, codigoHttp: 404 },
  JORNADA_INACTIVA: { ClaseError: ConflictError, codigoHttp: 409 },
  JORNADA_FECHA_CUMPLIDA: { ClaseError: ConflictError, codigoHttp: 409 },
  CUPO_AGOTADO: { ClaseError: ConflictError, codigoHttp: 409 },
  INSCRIPCION_DUPLICADA: { ClaseError: ConflictError, codigoHttp: 409 },
  INSCRIPCION_YA_CANCELADA: { ClaseError: ConflictError, codigoHttp: 409 },
};

/**
 * Convierte un error plano del repository
 */
function traducirErrorDeNegocio(error) {
  const definicion = ERRORES_INSCRIPCION[error.codigoNegocio];

  if (!definicion) {
    // Si no es un error de negocio conocido, se deja pasar como error inesperado, 500
    return error;
  }

  if (definicion.ClaseError === NotFoundError) {
    return new NotFoundError(error.message);
  }

  return new ConflictError(error.message, error.codigoNegocio);
}

async function crearInscripcion(datos) {
  try {
    return await inscripcionesRepository.inscribirPersona(datos);
  } catch (error) {
    // Se relanza como AppError para que el errorHandler responda con el código HTTP correcto (404 o 409), no como un 500 
    throw traducirErrorDeNegocio(error);
  }
}

async function eliminarInscripcion(inscripcionId) {
  try {
    const resultado = await inscripcionesRepository.cancelarInscripcion(inscripcionId);

    if (!resultado) {
      // El repository devuelve null cuando no encontró la inscripción.
      throw new NotFoundError('La inscripción solicitada no existe');
    }

    return resultado;
  } catch (error) {
    throw traducirErrorDeNegocio(error);
  }
}

async function obtenerInscripcionesPorJornada(jornadaId) {
  return inscripcionesRepository.listarInscripcionesPorJornada(jornadaId);
}

module.exports = {
  crearInscripcion,
  eliminarInscripcion,
  obtenerInscripcionesPorJornada,
};