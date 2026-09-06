/**
 * Estado vacío reutilizable: ícono + título + descripción opcional,
 * Se usa cuando un listado no tiene elementos que mostrar.
 */
export default function EstadoVacio({ titulo, descripcion }) {
  return (
    <div className="estado-vacio">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
        <rect x="8" y="12" width="40" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M8 22H48" stroke="currentColor" strokeWidth="2" />
        <path d="M18 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M38 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="28" cy="35" r="6" stroke="currentColor" strokeWidth="2" />
        <path d="M28 32V35L30 37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="estado-vacio-titulo">{titulo}</p>
      {descripcion && <p className="estado-vacio-descripcion">{descripcion}</p>}
    </div>
  );
}