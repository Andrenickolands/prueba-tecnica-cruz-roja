const { z } = require('zod');

// Reglas para inscribir a una persona: todos los campos son obligatorios.
const crearInscripcionSchema = z.object({
  nombreCompleto: z.string().min(3, 'El nombre completo debe tener al menos 3 caracteres').max(200),
  tipoDocumento: z.string().min(2, 'El tipo de documento es obligatorio').max(20),
  numeroDocumento: z.string().min(4, 'El número de documento no es válido').max(30),
  correo: z.string().email('El correo no tiene un formato válido'),
});

module.exports = {
  crearInscripcionSchema,
};