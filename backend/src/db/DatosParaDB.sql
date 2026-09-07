-- ============================================================
-- Script de datos de prueba.
-- Nota: se puede correr varias veces sin duplicar datos,
-- porque cada INSERT verifica primero si el registro ya existe.
--
-- cd backend
-- chcp 65001
-- psql -U postgres -h localhost -d cruz_roja_jornadas -f src/db/DatosParaDB.sql
-- ============================================================

-- ------------------------------------------------------------
-- Jornadas
-- ------------------------------------------------------------
INSERT INTO jornadas (id, nombre, sede, fecha, cupo_total, cupo_ocupado, activa)
SELECT gen_random_uuid(), 'Jornada de donacion de sangre', 'Sede Chapinero', '2026-09-20', 10, 0, TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM jornadas WHERE nombre = 'Jornada de donacion de sangre' AND sede = 'Sede Chapinero'
);

INSERT INTO jornadas (id, nombre, sede, fecha, cupo_total, cupo_ocupado, activa)
SELECT gen_random_uuid(), 'Brigada de salud comunitaria', 'Sede Chapinero', '2026-10-05', 5, 0, TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM jornadas WHERE nombre = 'Brigada de salud comunitaria' AND sede = 'Sede Chapinero'
);

INSERT INTO jornadas (id, nombre, sede, fecha, cupo_total, cupo_ocupado, activa)
SELECT gen_random_uuid(), 'Capacitacion primeros auxilios', 'Sede Kennedy', '2026-09-28', 8, 0, TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM jornadas WHERE nombre = 'Capacitacion primeros auxilios' AND sede = 'Sede Kennedy'
);

INSERT INTO jornadas (id, nombre, sede, fecha, cupo_total, cupo_ocupado, activa)
SELECT gen_random_uuid(), 'Jornada de vacunacion', 'Sede Kennedy', '2026-11-15', 20, 0, TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM jornadas WHERE nombre = 'Jornada de vacunacion' AND sede = 'Sede Kennedy'
);

INSERT INTO jornadas (id, nombre, sede, fecha, cupo_total, cupo_ocupado, activa)
SELECT gen_random_uuid(), 'Feria de bienestar', 'Sede Suba', '2026-08-01', 6, 0, FALSE
WHERE NOT EXISTS (
    SELECT 1 FROM jornadas WHERE nombre = 'Feria de bienestar' AND sede = 'Sede Suba'
);

INSERT INTO jornadas (id, nombre, sede, fecha, cupo_total, cupo_ocupado, activa)
SELECT gen_random_uuid(), 'Jornada sin inscritos', 'Sede Suba', '2026-12-01', 4, 0, TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM jornadas WHERE nombre = 'Jornada sin inscritos' AND sede = 'Sede Suba'
);

-- ------------------------------------------------------------
-- Inscripciones
-- ------------------------------------------------------------
INSERT INTO inscripciones (jornada_id, nombre_completo, tipo_documento, numero_documento, correo, estado)
SELECT j.id, 'Ana Torres', 'CC', '1000000001', 'ana@correo.com', 'CONFIRMADA'
FROM jornadas j
WHERE j.nombre = 'Jornada de donacion de sangre'
  AND NOT EXISTS (
      SELECT 1 FROM inscripciones i WHERE i.jornada_id = j.id AND i.numero_documento = '1000000001'
  );

INSERT INTO inscripciones (jornada_id, nombre_completo, tipo_documento, numero_documento, correo, estado)
SELECT j.id, 'Carlos Ruiz', 'CC', '1000000002', 'carlos@correo.com', 'CONFIRMADA'
FROM jornadas j
WHERE j.nombre = 'Jornada de donacion de sangre'
  AND NOT EXISTS (
      SELECT 1 FROM inscripciones i WHERE i.jornada_id = j.id AND i.numero_documento = '1000000002'
  );

INSERT INTO inscripciones (jornada_id, nombre_completo, tipo_documento, numero_documento, correo, estado)
SELECT j.id, 'Laura Gomez', 'TI', '1000000003', 'laura@correo.com', 'CANCELADA'
FROM jornadas j
WHERE j.nombre = 'Jornada de donacion de sangre'
  AND NOT EXISTS (
      SELECT 1 FROM inscripciones i WHERE i.jornada_id = j.id AND i.numero_documento = '1000000003'
  );

INSERT INTO inscripciones (jornada_id, nombre_completo, tipo_documento, numero_documento, correo, estado)
SELECT j.id, 'Pedro Sanchez', 'CC', '1000000004', 'pedro@correo.com', 'CONFIRMADA'
FROM jornadas j
WHERE j.nombre = 'Brigada de salud comunitaria'
  AND NOT EXISTS (
      SELECT 1 FROM inscripciones i WHERE i.jornada_id = j.id AND i.numero_documento = '1000000004'
  );

INSERT INTO inscripciones (jornada_id, nombre_completo, tipo_documento, numero_documento, correo, estado)
SELECT j.id, 'Maria Diaz', 'CE', '1000000005', 'maria@correo.com', 'CONFIRMADA'
FROM jornadas j
WHERE j.nombre = 'Capacitacion primeros auxilios'
  AND NOT EXISTS (
      SELECT 1 FROM inscripciones i WHERE i.jornada_id = j.id AND i.numero_documento = '1000000005'
  );

INSERT INTO inscripciones (jornada_id, nombre_completo, tipo_documento, numero_documento, correo, estado)
SELECT j.id, 'Jorge Lopez', 'CC', '1000000006', 'jorge@correo.com', 'CONFIRMADA'
FROM jornadas j
WHERE j.nombre = 'Capacitacion primeros auxilios'
  AND NOT EXISTS (
      SELECT 1 FROM inscripciones i WHERE i.jornada_id = j.id AND i.numero_documento = '1000000006'
  );

INSERT INTO inscripciones (jornada_id, nombre_completo, tipo_documento, numero_documento, correo, estado)
SELECT j.id, 'Sofia Ramirez', 'CC', '1000000007', 'sofia@correo.com', 'CONFIRMADA'
FROM jornadas j
WHERE j.nombre = 'Jornada de vacunacion'
  AND NOT EXISTS (
      SELECT 1 FROM inscripciones i WHERE i.jornada_id = j.id AND i.numero_documento = '1000000007'
  );

-- ------------------------------------------------------------
-- Sincroniza cupo_ocupado con el conteo real de inscripciones CONFIRMADAS
-- ------------------------------------------------------------
UPDATE jornadas j
SET cupo_ocupado = COALESCE(sub.total, 0)
FROM jornadas j2
LEFT JOIN (
    SELECT jornada_id, COUNT(*) AS total
    FROM inscripciones
    WHERE estado = 'CONFIRMADA'
    GROUP BY jornada_id
) sub ON sub.jornada_id = j2.id
WHERE j.id = j2.id;