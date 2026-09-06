"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./jornadas.module.css";

/**
 * Formulario para crear una nueva jornada.
 */
export default function JornadaForm() {
  const router = useRouter();

  const [formulario, setFormulario] = useState({
    nombre: "",
    sede: "",
    fecha: "",
    cupoTotal: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState(null);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setFormulario((valorAnterior) => ({ ...valorAnterior, [name]: value }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErrores(null);

    try {
      const respuesta = await fetch("/api/jornadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formulario,
          cupoTotal: Number(formulario.cupoTotal),
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        // El backend devuelve `detalles` (array de {campo, mensaje}) cuando
        // es un error de validación, o `mensaje` para otros errores.
        setErrores(datos.detalles || [{ mensaje: datos.mensaje }]);
        return;
      }

      // Limpia el formulario y refresca la página para ver la nueva jornada
      setFormulario({ nombre: "", sede: "", fecha: "", cupoTotal: "" });
      router.refresh();
    } catch (error) {
      setErrores([
        { mensaje: "No se pudo conectar con el servidor. Intenta de nuevo." },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio} className={styles.formulario}>
      <div className={styles.campo}>
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          name="nombre"
          value={formulario.nombre}
          onChange={manejarCambio}
          required
        />
      </div>

      <div className={styles.campo}>
        <label htmlFor="sede">Sede</label>
        <input
          id="sede"
          name="sede"
          value={formulario.sede}
          onChange={manejarCambio}
          required
        />
      </div>

      <div className={styles.campo}>
        <label htmlFor="fecha">Fecha</label>
        <input
          id="fecha"
          name="fecha"
          type="date"
          value={formulario.fecha}
          onChange={manejarCambio}
          required
        />
      </div>

      <div className={styles.campo}>
        <label htmlFor="cupoTotal">Cupo total</label>
        <input
          id="cupoTotal"
          name="cupoTotal"
          type="number"
          min="0"
          value={formulario.cupoTotal}
          onChange={manejarCambio}
          required
        />
      </div>

      {errores && (
        <ul className={styles.listaErrores} role="alert">
          {errores.map((error, indice) => (
            <li key={indice}>
              {error.campo ? `${error.campo}: ` : ""}
              {error.mensaje}
            </li>
          ))}
        </ul>
      )}

      <button type="submit" disabled={enviando}>
        {enviando ? "Creando..." : "Crear jornada"}
      </button>
    </form>
  );
}
