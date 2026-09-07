"use client";

import { useState } from "react";
import EditarJornadaForm from "./EditarJornadaForm";
import EliminarJornadaBoton from "./EliminarJornadaBoton";
import styles from "./detalle.module.css";

/**
 * Agrupa las acciones de edición y desactivación de una jornada.
 * Client Component: controla si el formulario de edición está visible.
 */
export default function AccionesJornada({ jornada }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <EditarJornadaForm
        jornada={jornada}
        onCerrar={() => setEditando(false)}
      />
    );
  }

  return (
    <div className={styles.accionesJornada}>
      <button
        onClick={() => setEditando(true)}
        className={`${styles.botonAccionJornada} ${styles.botonEditarJornada}`}
      >
        Editar jornada
      </button>
      <EliminarJornadaBoton jornadaId={jornada.id} />
    </div>
  );
}
