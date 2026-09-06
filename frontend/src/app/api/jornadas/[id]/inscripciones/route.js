const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Route Handler para POST /api/jornadas/:id/inscripciones 
 * Proxy hacia Express: inscribe a una persona en la jornada indicada.
 */
export async function POST(request, { params }) {
  const { id } = await params;
  const cuerpoPeticion = await request.json();

  const respuestaBackend = await fetch(`${BACKEND_URL}/api/jornadas/${id}/inscripciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpoPeticion),
  });

  const datos = await respuestaBackend.json();

  return Response.json(datos, { status: respuestaBackend.status });
}