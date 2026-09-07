'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import styles from './jornadas.module.css';

/**
 * Filtros del listado de jornadas.
 */
export default function JornadasFiltros() {
  const router = useRouter();
  const parametrosActuales = useSearchParams();

  const filtroActivo = parametrosActuales.get('filtro') || 'todas';

  function aplicarFiltro(nuevoFiltro) {
    const parametros = new URLSearchParams();

    if (nuevoFiltro !== 'todas') {
      parametros.set('filtro', nuevoFiltro);
    }

    const queryString = parametros.toString();
    router.push(`/jornadas${queryString ? `?${queryString}` : ''}`);
  }

  const opciones = [
    { valor: 'todas', etiqueta: 'Todas' },
    { valor: 'activas', etiqueta: 'Activas' },
    { valor: 'con-cupo', etiqueta: 'Con cupo disponible' },
    { valor: 'sin-cupo', etiqueta: 'Sin cupo' },
    { valor: 'desactivadas', etiqueta: 'Desactivadas' },
  ];

  return (
    <div className={styles.filtros}>
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          onClick={() => aplicarFiltro(opcion.valor)}
          className={filtroActivo === opcion.valor ? styles.filtroActivo : styles.filtroBoton}
          aria-pressed={filtroActivo === opcion.valor}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );
}