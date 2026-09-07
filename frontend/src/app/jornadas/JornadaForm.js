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

  // Determina si un campo específico tiene error, para pintar su borde.
  function tieneError(nombreCampo) {
    return errores?.some((error) => error.campo === nombreCampo);
  }

  // Valida en el cliente antes de enviar, para dar feedback inmediato.
  function validarEnCliente() {
    const erroresCliente = [];

    if (formulario.nombre.trim().length < 3) {
      erroresCliente.push({
        campo: "nombre",
        mensaje: "El nombre debe tener al menos 3 caracteres",
      });
    }
    if (formulario.sede.trim().length < 2) {
      erroresCliente.push({ campo: "sede", mensaje: "La sede es obligatoria" });
    }
    if (!formulario.fecha) {
      erroresCliente.push({
        campo: "fecha",
        mensaje: "La fecha es obligatoria",
      });
    }
    if (formulario.cupoTotal === "" || Number(formulario.cupoTotal) < 0) {
      erroresCliente.push({
        campo: "cupoTotal",
        mensaje: "El cupo total no puede ser negativo",
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
    <form onSubmit={manejarEnvio} className={styles.formulario} noValidate>
      <div className={styles.campo}>
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          name="nombre"
          placeholder="Ingrese el nombre de la jornada"
          value={formulario.nombre}
          onChange={manejarCambio}
          minLength={3}
          maxLength={150}
          required
          className={tieneError("nombre") ? styles.inputConError : ""}
          aria-invalid={tieneError("nombre")}
        />
      </div>

      <div className={styles.campo}>
        <label htmlFor="sede">Sede</label>
        <input
          id="sede"
          name="sede"
          placeholder="Seleccione o ingrese la sede"
          value={formulario.sede}
          onChange={manejarCambio}
          minLength={2}
          maxLength={100}
          required
          className={tieneError("sede") ? styles.inputConError : ""}
          aria-invalid={tieneError("sede")}
        />
      </div>

      <div className={styles.filaDosColumnas}>
        <div className={styles.campo}>
          <label htmlFor="fecha">Fecha</label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            value={formulario.fecha}
            onChange={manejarCambio}
            required
            className={tieneError("fecha") ? styles.inputConError : ""}
            aria-invalid={tieneError("fecha")}
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="cupoTotal">Cupo total</label>
          <input
            id="cupoTotal"
            name="cupoTotal"
            type="number"
            min="0"
            placeholder="Ej. 10"
            value={formulario.cupoTotal}
            onChange={manejarCambio}
            required
            className={tieneError("cupoTotal") ? styles.inputConError : ""}
            aria-invalid={tieneError("cupoTotal")}
          />
        </div>
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
