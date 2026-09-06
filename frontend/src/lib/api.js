const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Funciones centralizadas para consumir la API de Express.
 */

export async function obtenerJornadas(filtros = {}) {
  const parametros = new URLSearchParams();

  if (filtros.activa !== undefined) {
    parametros.set('activa', filtros.activa);
  }
  if (filtros.fecha) {
    parametros.set('fecha', filtros.fecha);
  }

  const url = `${BACKEND_URL}/api/jornadas?${parametros.toString()}`;

  const respuesta = await fetch(url, {
    cache: 'no-store',
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo obtener el listado de jornadas');
  }

  return respuesta.json();
}

export async function obtenerJornadaPorId(id) {
  const respuesta = await fetch(`${BACKEND_URL}/api/jornadas/${id}`, {
    cache: 'no-store',
  });

  if (respuesta.status === 404) {
    return null;
  }

  if (!respuesta.ok) {
    throw new Error('No se pudo obtener la jornada');
  }

  return respuesta.json();
}

export async function obtenerInscripcionesPorJornada(jornadaId) {
  const respuesta = await fetch(`${BACKEND_URL}/api/jornadas/${jornadaId}/inscripciones`, {
    cache: 'no-store',
  });

  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener las inscripciones');
  }

  return respuesta.json();
}