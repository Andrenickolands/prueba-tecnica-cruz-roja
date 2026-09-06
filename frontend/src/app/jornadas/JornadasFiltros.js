"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./jornadas.module.css";

/**
 * Filtros del listado de jornadas
 */
export default function JornadasFiltros() {
  const router = useRouter();
  const parametrosActuales = useSearchParams();

  const filtroActivo = parametrosActuales.get("filtro") || "todas";

  function aplicarFiltro(nuevoFiltro) {
    const parametros = new URLSearchParams();

    // El filtro "todas" no necesita query param — URL limpia.
    if (nuevoFiltro !== "todas") {
      parametros.set("filtro", nuevoFiltro);
    }

    const queryString = parametros.toString();
    router.push(`/jornadas${queryString ? `?${queryString}` : ""}`);
  }

  return (
    <div className={styles.filtros}>
      <button
        onClick={() => aplicarFiltro("todas")}
        className={
          filtroActivo === "todas" ? styles.filtroActivo : styles.filtroBoton
        }
        aria-pressed={filtroActivo === "todas"}
      >
        Todas
      </button>
      <button
        onClick={() => aplicarFiltro("con-cupo")}
        className={
          filtroActivo === "con-cupo" ? styles.filtroActivo : styles.filtroBoton
        }
        aria-pressed={filtroActivo === "con-cupo"}
      >
        Con cupo disponible
      </button>
      <button
        onClick={() => aplicarFiltro("sin-cupo")}
        className={
          filtroActivo === "sin-cupo" ? styles.filtroActivo : styles.filtroBoton
        }
        aria-pressed={filtroActivo === "sin-cupo"}
      >
        Sin cupo
      </button>
    </div>
  );
}
