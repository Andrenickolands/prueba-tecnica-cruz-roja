const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Route Handler para POST /api/jornadas
 */
export async function POST(request) {
  const cuerpoPeticion = await request.json();

  const respuestaBackend = await fetch(`${BACKEND_URL}/api/jornadas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpoPeticion),
  });

  const datos = await respuestaBackend.json();

  return Response.json(datos, { status: respuestaBackend.status });
}