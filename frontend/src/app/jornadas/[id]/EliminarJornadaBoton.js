"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import styles from "./detalle.module.css";

/**
 * Botón para desactivar una jornada (borrado lógico).
 * Client Component: maneja el modal de confirmación y la llamada DELETE.
 */
export default function EliminarJornadaBoton({ jornadaId }) {
  const router = useRouter();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(null);

  async function confirmarEliminacion() {
    setEliminando(true);
    setError(null);

    try {
      const respuesta = await fetch(`/api/jornadas/${jornadaId}`, {
        method: "DELETE",
      });

      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => ({}));
        setError(datos.mensaje || "No se pudo desactivar la jornada.");
        setModalAbierto(false);
        return;
      }

      // Tras desactivar, no tiene sentido quedarse en el detalle —
      // volvemos al listado, que ya no la mostrará como activa.
      router.push("/jornadas");
      router.refresh();
    } catch (err) {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      setModalAbierto(false);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setModalAbierto(true)}
        className={`${styles.botonAccionJornada} ${styles.botonEliminarJornada}`}
      >
        Desactivar jornada
      </button>
      {error && (
        <p className={styles.errorInline} role="alert">
          {error}
        </p>
      )}

      {modalAbierto && (
        <ConfirmModal
          titulo="Desactivar jornada"
          mensaje="¿Seguro que deseas desactivar esta jornada? Ya no aparecerá disponible para nuevas inscripciones."
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setModalAbierto(false)}
          cargando={eliminando}
        />
      )}
    </>
  );
}