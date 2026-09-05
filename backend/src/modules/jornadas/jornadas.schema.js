const { z } = require('zod');

// Reglas para crear una jornada: todos los campos son obligatorios.
const crearJornadaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(150),
  sede: z.string().min(2, 'La sede es obligatoria').max(100),
  fecha: z.string().refine(
    (valor) => !isNaN(Date.parse(valor)),
    'La fecha debe tener un formato válido (YYYY-MM-DD)',
  ),
  cupoTotal: z.number().int().nonnegative('El cupo total no puede ser negativo'),
});

// Reglas para actualizar: todos los campos son opcionales
const actualizarJornadaSchema = z.object({
  nombre: z.string().min(3).max(150).optional(),
  sede: z.string().min(2).max(100).optional(),
  fecha: z.string().refine(
    (valor) => !isNaN(Date.parse(valor)),
    'La fecha debe tener un formato válido (YYYY-MM-DD)',
  ).optional(),
  cupoTotal: z.number().int().nonnegative().optional(),
  activa: z.boolean().optional(),
});

// Reglas para los filtros del listado 
const filtrosJornadaSchema = z.object({
  activa: z.enum(['true', 'false']).optional(),
  fecha: z.string().optional(),
});

module.exports = {
  crearJornadaSchema,
  actualizarJornadaSchema,
  filtrosJornadaSchema,
};