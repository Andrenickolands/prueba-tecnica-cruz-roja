import { notFound } from "next/navigation";
import { obtenerJornadaPorId, obtenerInscripcionesPorJornada } from "@/lib/api";
import InscripcionForm from "./InscripcionForm";
import CancelarInscripcionBoton from "./CancelarInscripcionBoton";
import EliminarJornadaBoton from "./EliminarJornadaBoton";
import LogoCruz from "@/components/LogoCruz";
import EstadoVacio from "@/components/EstadoVacio";
import styles from "./detalle.module.css";

export default async function DetalleJornada({ params }) {
  const { id } = await params;

  const jornada = await obtenerJornadaPorId(id);

  if (!jornada) {
    notFound();
  }

  const inscripciones = await obtenerInscripcionesPorJornada(id);
  const inscripcionesConfirmadas = inscripciones.filter(
    (i) => i.estado === "CONFIRMADA",
  );

  const cupoDisponible = jornada.cupo_total - jornada.cupo_ocupado;
  const sinCupo = cupoDisponible <= 0;
  const jornadaVencida =
    new Date(jornada.fecha) < new Date().setHours(0, 0, 0, 0);
  const puedeInscribirse = jornada.activa && !jornadaVencida && !sinCupo;

  return (
    <>
      <header className={styles.encabezado}>
        <a href="/jornadas" className={styles.logoWrapper}>
          <LogoCruz tamano={44} />
        </a>
        <div className={styles.encabezadoContenido}>
          <a href="/jornadas" className={styles.volver}>
            ← Volver al listado
          </a>
        </div>
      </header>

      <main className={styles.contenedor} id="contenido-principal">
        <section className={styles.resumenJornada}>
          <h1>{jornada.nombre}</h1>
          <p className={styles.meta}>{jornada.sede}</p>
          <p className={styles.meta}>
            {new Date(jornada.fecha).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className={styles.meta}>
            Cupo: {jornada.cupo_ocupado} / {jornada.cupo_total}
          </p>

          {!jornada.activa && (
            <p className={styles.avisoInactiva}>Esta jornada está inactiva.</p>
          )}
          {jornada.activa && jornadaVencida && (
            <p className={styles.avisoInactiva}>
              La fecha de esta jornada ya pasó.
            </p>
          )}

          {jornada.activa && <EliminarJornadaBoton jornadaId={id} />}
        </section>

        <section className={styles.seccionInscripcion}>
          <h2>Inscribirse</h2>

          {puedeInscribirse ? (
            <InscripcionForm jornadaId={id} />
          ) : (
            <div className={styles.sinCupoAviso}>
              <p>
                {sinCupo
                  ? "Esta jornada no tiene cupo disponible en este momento."
                  : "Esta jornada no admite nuevas inscripciones."}
              </p>
            </div>
          )}
        </section>

        <section>
          <h2>Personas inscritas ({inscripcionesConfirmadas.length})</h2>

          {inscripcionesConfirmadas.length === 0 ? (
            <EstadoVacio
              titulo="Todavía no hay inscripciones"
              descripcion="Cuando alguien se inscriba, aparecerá aquí."
            />
          ) : (
            <ul className={styles.listaInscritos}>
              {inscripcionesConfirmadas.map((inscripcion) => (
                <li key={inscripcion.id} className={styles.itemInscrito}>
                  <div>
                    <p className={styles.nombreInscrito}>
                      {inscripcion.nombre_completo}
                    </p>
                    <p className={styles.meta}>
                      {inscripcion.tipo_documento}{" "}
                      {inscripcion.numero_documento}
                    </p>
                  </div>
                  <CancelarInscripcionBoton inscripcionId={inscripcion.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
