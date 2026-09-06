'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';
import styles from './detalle.module.css';

/**
 * Botón para cancelar una inscripción existente.
 * Client Component: maneja el modal de confirmación y la llamada DELETE.
 * Llama a /api/inscripciones/[id]
 */
export default function CancelarInscripcionBoton({ inscripcionId }) {
  const router = useRouter();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [error, setError] = useState(null);

  async function confirmarCancelacion() {
    setCancelando(true);
    setError(null);

    try {
      const respuesta = await fetch(`/api/inscripciones/${inscripcionId}`, {
        method: 'DELETE',
      });

      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => ({}));
        setError(datos.mensaje || 'No se pudo cancelar la inscripción.');
        setModalAbierto(false);
        return;
      }

      // La cancelación libera cupo en el backend; se refresca para que
      // el Server Component vuelva a traer el estado actualizado.
      setModalAbierto(false);
      router.refresh();
    } catch (err) {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
      setModalAbierto(false);
    } finally {
      setCancelando(false);
    }
  }

  return (
    <div className={styles.accionesInscrito}>
      <button
        onClick={() => setModalAbierto(true)}
        className={styles.botonCancelar}
        aria-label="Cancelar esta inscripción"
      >
        Cancelar
      </button>
      {error && <p className={styles.errorInline} role="alert">{error}</p>}

      {modalAbierto && (
        <ConfirmModal
          titulo="Cancelar inscripción"
          mensaje="¿Seguro que deseas cancelar esta inscripción? El cupo quedará disponible nuevamente."
          onConfirmar={confirmarCancelacion}
          onCancelar={() => setModalAbierto(false)}
          cargando={cancelando}
        />
      )}
    </div>
  );
}