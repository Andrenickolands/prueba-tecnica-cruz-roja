'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './detalle.module.css';

/**
 * Formulario para editar una jornada existente.
 */
export default function EditarJornadaForm({ jornada, onCerrar }) {
  const router = useRouter();

  // La fecha que llega del backend es un ISO completo (con hora);
  // el input type="date" necesita solo "YYYY-MM-DD".
  const fechaInicial = jornada.fecha.split('T')[0];

  const [formulario, setFormulario] = useState({
    nombre: jornada.nombre,
    sede: jornada.sede,
    fecha: fechaInicial,
    cupoTotal: jornada.cupo_total,
  });
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState(null);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setFormulario((valorAnterior) => ({ ...valorAnterior, [name]: value }));
  }

  function tieneError(nombreCampo) {
    return errores?.some((error) => error.campo === nombreCampo);
  }

  function validarEnCliente() {
    const erroresCliente = [];

    if (formulario.nombre.trim().length < 3) {
      erroresCliente.push({ campo: 'nombre', mensaje: 'El nombre debe tener al menos 3 caracteres' });
    }
    if (formulario.sede.trim().length < 2) {
      erroresCliente.push({ campo: 'sede', mensaje: 'La sede es obligatoria' });
    }
    if (!formulario.fecha) {
      erroresCliente.push({ campo: 'fecha', mensaje: 'La fecha es obligatoria' });
    }
    // Regla de negocio del backend: no se puede reducir el cupo por debajo
    // de lo ya ocupado. Se valida también aquí para feedback inmediato.
    if (Number(formulario.cupoTotal) < jornada.cupo_ocupado) {
      erroresCliente.push({
        campo: 'cupoTotal',
        mensaje: `No puede ser menor a ${jornada.cupo_ocupado} (cupo ya ocupado)`,
      });
    }

    return erroresCliente;
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();

    const erroresCliente = validarEnCliente();
    if (erroresCliente.length > 0) {
      setErrores(erroresCliente);
      return;
    }

    setEnviando(true);
    setErrores(null);

    try {
      const respuesta = await fetch(`/api/jornadas/${jornada.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formulario,
          cupoTotal: Number(formulario.cupoTotal),
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setErrores(datos.detalles || [{ mensaje: datos.mensaje }]);
        return;
      }

      onCerrar();
      router.refresh();
    } catch (error) {
      setErrores([{ mensaje: 'No se pudo conectar con el servidor. Intenta de nuevo.' }]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio} className={styles.formulario} noValidate>
      <div className={styles.campo}>
        <label htmlFor="editar-nombre">Nombre</label>
        <input
          id="editar-nombre"
          name="nombre"
          value={formulario.nombre}
          onChange={manejarCambio}
          minLength={3}
          maxLength={150}
          required
          className={tieneError('nombre') ? styles.inputConError : ''}
          aria-invalid={tieneError('nombre')}
        />
      </div>

      <div className={styles.campo}>
        <label htmlFor="editar-sede">Sede</label>
        <input
          id="editar-sede"
          name="sede"
          value={formulario.sede}
          onChange={manejarCambio}
          minLength={2}
          maxLength={100}
          required
          className={tieneError('sede') ? styles.inputConError : ''}
          aria-invalid={tieneError('sede')}
        />
      </div>

      <div className={styles.campo}>
        <label htmlFor="editar-fecha">Fecha</label>
        <input
          id="editar-fecha"
          name="fecha"
          type="date"
          value={formulario.fecha}
          onChange={manejarCambio}
          required
          className={tieneError('fecha') ? styles.inputConError : ''}
          aria-invalid={tieneError('fecha')}
        />
      </div>

      <div className={styles.campo}>
        <label htmlFor="editar-cupoTotal">Cupo total</label>
        <input
          id="editar-cupoTotal"
          name="cupoTotal"
          type="number"
          min={jornada.cupo_ocupado}
          value={formulario.cupoTotal}
          onChange={manejarCambio}
          required
          className={tieneError('cupoTotal') ? styles.inputConError : ''}
          aria-invalid={tieneError('cupoTotal')}
        />
      </div>

      {errores && (
        <ul className={styles.listaErrores} role="alert">
          {errores.map((error, indice) => (
            <li key={indice}>{error.campo ? `${error.campo}: ` : ''}{error.mensaje}</li>
          ))}
        </ul>
      )}

      <div className={styles.accionesEdicion}>
        <button
          type="submit"
          disabled={enviando}
          className={`${styles.botonAccionJornada} ${styles.botonGuardarEdicion}`}
        >
          {enviando ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={onCerrar}
          disabled={enviando}
          className={`${styles.botonAccionJornada} ${styles.botonCancelarEdicion}`}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}