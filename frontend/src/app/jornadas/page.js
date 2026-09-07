import { obtenerJornadas } from "@/lib/api";
import JornadaForm from "./JornadaForm";
import JornadasFiltros from "./JornadasFiltros";
import styles from "./jornadas.module.css";
import LogoCruz from "@/components/LogoCruz";

/**
 * Página de listado de jornadas.
 * solo lee datos y los renderiza
 */
export default async function PaginaJornadas({ searchParams }) {
  const parametrosBusqueda = await searchParams;

  const filtros = {
    activa: parametrosBusqueda.activa,
    fecha: parametrosBusqueda.fecha,
  };

  const jornadasSinFiltrarPorCupo = await obtenerJornadas(filtros);

  // Filtros de cupo: "todas", "activas", "con-cupo", "sin-cupo", "desactivadas"
  const filtroSeleccionado = parametrosBusqueda.filtro;
  const jornadas = jornadasSinFiltrarPorCupo.filter((jornada) => {
    if (filtroSeleccionado === "activas") {
      return jornada.activa;
    }
    if (filtroSeleccionado === "desactivadas") {
      return !jornada.activa;
    }
    if (filtroSeleccionado === "con-cupo") {
      return jornada.cupo_ocupado < jornada.cupo_total;
    }
    if (filtroSeleccionado === "sin-cupo") {
      return jornada.cupo_ocupado >= jornada.cupo_total;
    }
    return true; 
  });

  return (
    <>
      <header className={styles.encabezado}>
        <a href="/jornadas" className={styles.logoWrapper}>
          <LogoCruz />
        </a>
        <div className={styles.encabezadoContenido}>
          <h1>Jornadas Cruz Roja</h1>
          <p>
            Sección Cundinamarca y Bogotá — gestión de cupos e inscripciones
          </p>
        </div>
      </header>

      <main className={styles.contenedor} id="contenido-principal">
        <JornadasFiltros />

        <section className={styles.formularioSeccion}>
          <h2>Crear nueva jornada</h2>
          <JornadaForm />
        </section>

        <section>
          <h2>Listado</h2>

          {jornadas.length === 0 ? (
            <p>No hay jornadas para mostrar con los filtros actuales.</p>
          ) : (
            <ul className={styles.listaJornadas}>
              {jornadas.map((jornada) => {
                const cupoDisponible =
                  jornada.cupo_total - jornada.cupo_ocupado;
                const porcentajeOcupado =
                  jornada.cupo_total > 0
                    ? Math.min(
                        (jornada.cupo_ocupado / jornada.cupo_total) * 100,
                        100,
                      )
                    : 0;
                const sinCupo = cupoDisponible <= 0;

                return (
                  <li key={jornada.id} className={styles.tarjetaJornada}>
                    <a
                      href={`/jornadas/${jornada.id}`}
                      className={styles.enlaceJornada}
                    >
                      <h3>{jornada.nombre}</h3>
                      <p className={styles.metaJornada}>{jornada.sede}</p>
                      <p className={styles.metaJornada}>
                        {new Date(jornada.fecha).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>

                      <div className={styles.cupoContenedor}>
                        <div className={styles.cupoTexto}>
                          <span>
                            {jornada.cupo_ocupado} / {jornada.cupo_total} cupos
                          </span>
                          <span
                            className={
                              sinCupo
                                ? styles.etiquetaSinCupo
                                : styles.etiquetaDisponible
                            }
                          >
                            {sinCupo
                              ? "Sin cupo"
                              : `${cupoDisponible} disponibles`}
                          </span>
                        </div>
                        <div
                          className={styles.cupoBarraFondo}
                          role="progressbar"
                          aria-valuenow={Math.round(porcentajeOcupado)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Ocupación de cupo: ${jornada.cupo_ocupado} de ${jornada.cupo_total}`}
                        >
                          <div
                            className={`${styles.cupoBarraRelleno} ${sinCupo ? styles.sinCupo : ""}`}
                            style={{ width: `${porcentajeOcupado}%` }}
                          />
                        </div>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
