'use client';

/**
 * Modal de confirmación reutilizable.
 * Componente: no maneja su propio estado de
 * apertura/cierre, eso lo controla el componente padre
 */
export default function ConfirmModal({ titulo, mensaje, onConfirmar, onCancelar, cargando }) {
  return (
    <div className="modal-fondo" role="presentation" onClick={onCancelar}>
      <div
        className="modal-contenido"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h3 id="modal-titulo">{titulo}</h3>
        <p>{mensaje}</p>
        <div className="modal-acciones">
          <button type="button" className="modal-boton-secundario" onClick={onCancelar} disabled={cargando}>
            No, mantener
          </button>
          <button type="button" className="modal-boton-primario" onClick={onConfirmar} disabled={cargando}>
            {cargando ? 'Procesando...' : 'Sí, confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}