const BACKEND_URL = process.env.BACKEND_URL;

/**
 * Route Handler para PUT /api/jornadas/:id
 * Proxy hacia Express: actualiza los datos editables de la jornada.
 */
export async function PUT(request, { params }) {
  const { id } = await params;
  const cuerpoPeticion = await request.json();

  const respuestaBackend = await fetch(`${BACKEND_URL}/api/jornadas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpoPeticion),
  });

  const datos = await respuestaBackend.json();
  return Response.json(datos, { status: respuestaBackend.status });
}

/**
 * Route Handler para DELETE /api/jornadas/:id
 * Proxy hacia Express: desactiva la jornada (borrado lógico).
 */
export async function DELETE(request, { params }) {
  const { id } = await params;

  const respuestaBackend = await fetch(`${BACKEND_URL}/api/jornadas/${id}`, {
    method: 'DELETE',
  });

  if (respuestaBackend.status === 204) {
    return new Response(null, { status: 204 });
  }

  const datos = await respuestaBackend.json();
  return Response.json(datos, { status: respuestaBackend.status });
}