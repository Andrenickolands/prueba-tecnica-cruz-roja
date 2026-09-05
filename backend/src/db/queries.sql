-- ============================================================
-- Ejecutar: 
-- chcp 65001 (Solo en windows)
-- psql -U postgres -h localhost -d cruz_roja_jornadas

-- Consulta 1: Inscripciones confirmadas de una jornada,
-- ordenadas por fecha de registro.
-- ============================================================
-- Jornada usada de ejemplo: "Jornada de donación de sangre" (Sede Chapinero)
SELECT
    id,
    nombre_completo,
    tipo_documento,
    numero_documento,
    correo,
    created_at AS fecha_registro
FROM inscripciones
WHERE jornada_id = 'bc41c6b8-0f7b-4fc3-815c-8c3d7cf83b7c'
  AND estado = 'CONFIRMADA'
ORDER BY created_at ASC;


-- ============================================================
-- Consulta 2: Conteo de inscripciones agrupadas por estado
-- y por jornada.
-- ============================================================
SELECT
    j.id AS jornada_id,
    j.nombre AS jornada_nombre,
    i.estado,
    COUNT(i.id) AS total_inscripciones
FROM jornadas j
LEFT JOIN inscripciones i ON i.jornada_id = j.id
GROUP BY j.id, j.nombre, i.estado
ORDER BY j.nombre, i.estado;


-- ============================================================
-- Consulta 3: Ocupación por sede en un rango de fechas.
-- Cupo publicado, ocupado, disponible y % de ocupación.
-- Las jornadas sin inscripciones aparecen igual (con cero),
-- y el porcentaje maneja sin error el caso de cupo total en cero.
-- ============================================================
SELECT
    j.sede,
    COALESCE(SUM(j.cupo_total), 0) AS cupo_publicado,
    COALESCE(SUM(j.cupo_ocupado), 0) AS cupo_ocupado,
    COALESCE(SUM(j.cupo_total - j.cupo_ocupado), 0) AS cupo_disponible,
    CASE
        WHEN COALESCE(SUM(j.cupo_total), 0) = 0 THEN 0
        ELSE ROUND(
            (SUM(j.cupo_ocupado)::NUMERIC / SUM(j.cupo_total)::NUMERIC) * 100,
            2
        )
    END AS porcentaje_ocupacion
FROM jornadas j
WHERE j.fecha BETWEEN '2026-01-01' AND '2026-12-31'
GROUP BY j.sede
ORDER BY j.sede;