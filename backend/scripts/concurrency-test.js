/**
 * Script de prueba de concurrencia.
 * Uso: node scripts/concurrency-test.js <jornadaId> <cantidadSolicitudes>
 */

const JORNADA_ID = process.argv[2];
const CANTIDAD_SOLICITUDES = Number(process.argv[3]) || 10;
const URL_BASE = 'http://localhost:4000';

if (!JORNADA_ID) {
  console.error('Debes pasar el id de la jornada como primer argumento.');
  console.error('Ejemplo: node scripts/concurrency-test.js <jornadaId> 10');
  process.exit(1);
}

// Genera un número de documento distinto para cada solicitud
function crearSolicitudDeInscripcion(indice) {
  return fetch(`${URL_BASE}/api/jornadas/${JORNADA_ID}/inscripciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombreCompleto: `Persona de Prueba ${indice}`,
      tipoDocumento: 'CC',
      numeroDocumento: `TEST-${indice}-${Date.now()}`,
      correo: `prueba${indice}@test.com`,
    }),
  }).then(async (respuesta) => ({
    status: respuesta.status,
    cuerpo: await respuesta.json(),
  }));
}

async function consultarCupoOcupado() {
  const respuesta = await fetch(`${URL_BASE}/api/jornadas/${JORNADA_ID}`);
  const jornada = await respuesta.json();
  return jornada.cupo_ocupado;
}

async function ejecutarPrueba() {
  console.log(`Lanzando ${CANTIDAD_SOLICITUDES} solicitudes en paralelo contra la jornada ${JORNADA_ID}...`);

  const solicitudes = Array.from(
    { length: CANTIDAD_SOLICITUDES },
    (_, indice) => crearSolicitudDeInscripcion(indice + 1),
  );

  // Promise.all dispara todas las solicitudes al mismo tiempo (en paralelo),
  const resultados = await Promise.all(solicitudes);

  const confirmadas = resultados.filter((r) => r.status === 201);
  const rechazadas = resultados.filter((r) => r.status !== 201);

  const cupoOcupadoFinal = await consultarCupoOcupado();

  console.log('\n--- Resultado de la prueba de concurrencia ---');
  console.log(`Solicitudes enviadas:   ${CANTIDAD_SOLICITUDES}`);
  console.log(`Confirmadas (201):      ${confirmadas.length}`);
  console.log(`Rechazadas (409/otro):  ${rechazadas.length}`);
  console.log(`Cupo ocupado en BD:     ${cupoOcupadoFinal}`);

  if (rechazadas.length > 0) {
    console.log('\nMotivos de rechazo:');
    const conteoMotivos = {};
    for (const rechazo of rechazadas) {
      const motivo = rechazo.cuerpo.codigoNegocio || `HTTP ${rechazo.status}`;
      conteoMotivos[motivo] = (conteoMotivos[motivo] || 0) + 1;
    }
    for (const [motivo, cantidad] of Object.entries(conteoMotivos)) {
      console.log(`  ${motivo}: ${cantidad}`);
    }
  }
}

ejecutarPrueba();