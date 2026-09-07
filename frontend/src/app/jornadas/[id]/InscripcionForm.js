"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalle.module.css";

/**
 * Formulario para inscribir a una persona en una jornada.
 * Client Component: maneja estado de inputs y el envío.
 * Llama a /api/jornadas/[id]/inscripciones
 */
export default function InscripcionForm({ jornadaId }) {
  const router = useRouter();

  const [formulario, setFormulario] = useState({
    nombreCompleto: "",
    tipoDocumento: "CC",
    numeroDocumento: "",
    correo: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState(null);
  const [exito, setExito] = useState(false);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setFormulario((valorAnterior) => ({ ...valorAnterior, [name]: value }));
    setExito(false);
  }

  // Determina si un campo específico tiene error, para pintar su borde.
  function tieneError(nombreCampo) {
    return errores?.some((error) => error.campo === nombreCampo);
  }

  // Validación básica en el cliente antes de enviar, para dar feedback
  // inmediato sin esperar la respuesta del servidor.
  function validarEnCliente() {
    const erroresCliente = [];

    if (formulario.nombreCompleto.trim().length < 3) {
      erroresCliente.push({
        campo: "nombreCompleto",
        mensaje: "El nombre debe tener al menos 3 caracteres",
      });
    } else if (/[0-9]/.test(formulario.nombreCompleto)) {
      // El nombre no debe contener dígitos.
      erroresCliente.push({
        campo: "nombreCompleto",
        mensaje: "El nombre no puede contener números",
      });
    }

    if (!/^[0-9]{4,15}$/.test(formulario.numeroDocumento.trim())) {
      // El número de documento solo debe tener dígitos, entre 4 y 15.
      erroresCliente.push({
        campo: "numeroDocumento",
        mensaje:
          "El número de documento debe contener solo números (4 a 15 dígitos)",
      });
    }

    if (!formulario.correo.includes("@")) {
      erroresCliente.push({
        campo: "correo",
        mensaje: "El correo no tiene un formato válido",
      });
    }

    return erroresCliente;
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setExito(false);

    const erroresCliente = validarEnCliente();
    if (erroresCliente.length > 0) {
      setErrores(erroresCliente);
      return;
    }

    setEnviando(true);
    setErrores(null);

    try {
      const respuesta = await fetch(
        `/api/jornadas/${jornadaId}/inscripciones`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formulario),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        // El backend puede responder con `detalles` (validación) o
        // `mensaje` + `codigoNegocio`
        setErrores(datos.detalles || [{ mensaje: datos.mensaje }]);
        return;
      }

      setFormulario({
        nombreCompleto: "",
        tipoDocumento: "CC",
        numeroDocumento: "",
        correo: "",
      });
      setExito(true);
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
        <label htmlFor="nombreCompleto">Nombre completo</label>
        <input
          id="nombreCompleto"
          name="nombreCompleto"
          value={formulario.nombreCompleto}
          onChange={manejarCambio}
          minLength={3}
          maxLength={200}
          required
          placeholder="Ingresa tu nombre"
          className={tieneError("nombreCompleto") ? styles.inputConError : ""}
          aria-invalid={tieneError("nombreCompleto")}
        />
      </div>

      <div className={styles.campo}>
        <label htmlFor="tipoDocumento">Tipo de documento</label>
        <select
          id="tipoDocumento"
          name="tipoDocumento"
          value={formulario.tipoDocumento}
          onChange={manejarCambio}
        >
          <option value="CC">Cédula de ciudadanía</option>
          <option value="TI">Tarjeta de identidad</option>
          <option value="CE">Cédula de extranjería</option>
          <option value="PA">Pasaporte</option>
        </select>
      </div>

      <div className={styles.campo}>
        <label htmlFor="numeroDocumento">Número de documento</label>
        <input
          id="numeroDocumento"
          name="numeroDocumento"
          value={formulario.numeroDocumento}
          onChange={manejarCambio}
          inputMode="numeric"
          pattern="[0-9]{4,15}"
          title="Solo números, entre 4 y 15 dígitos"
          minLength={4}
          maxLength={15}
          required
          placeholder="Ingresa tu documento"
          className={tieneError("numeroDocumento") ? styles.inputConError : ""}
          aria-invalid={tieneError("numeroDocumento")}
        />
      </div>

      <div className={styles.campo}>
        <label htmlFor="correo">Correo electrónico</label>
        <input
          id="correo"
          name="correo"
          type="email"
          value={formulario.correo}
          onChange={manejarCambio}
          required
          placeholder="Ingresa tu correo"
          className={tieneError("correo") ? styles.inputConError : ""}
          aria-invalid={tieneError("correo")}
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

      {exito && (
        <p className={styles.mensajeExito} role="status">
          Inscripción registrada correctamente.
        </p>
      )}

      <button type="submit" disabled={enviando}>
        {enviando ? "Inscribiendo..." : "Inscribirse"}
      </button>
    </form>
  );
}
