const BACKEND_URL = process.env.BACKEND_URL;

export async function DELETE(request, { params }) {
  const { id } = await params;

  const respuestaBackend = await fetch(`${BACKEND_URL}/api/inscripciones/${id}`, {
    method: 'DELETE',
  });

  if (respuestaBackend.status === 204) {
    return new Response(null, { status: 204 });
  }

  const datos = await respuestaBackend.json();
  return Response.json(datos, { status: respuestaBackend.status });
}