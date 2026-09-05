CREATE TABLE IF NOT EXISTS inscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jornada_id UUID NOT NULL REFERENCES jornadas(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(200) NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL,
    numero_documento VARCHAR(30) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA'
        CHECK (estado IN ('CONFIRMADA', 'CANCELADA')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Una misma persona (tipo + número de documento) no puede tener dos
-- inscripciones CONFIRMADAS en la misma jornada. Índice único parcial:
-- solo aplica sobre estado = CONFIRMADA, así puede reinscribirse si canceló antes.
CREATE UNIQUE INDEX IF NOT EXISTS uq_inscripcion_persona_jornada_confirmada
    ON inscripciones (jornada_id, tipo_documento, numero_documento)
    WHERE estado = 'CONFIRMADA';

-- Acelera el JOIN y filtro más frecuente: inscripciones de una jornada específica.
CREATE INDEX IF NOT EXISTS idx_inscripciones_jornada_id ON inscripciones (jornada_id);

-- Acelera el conteo de confirmadas y el orden por fecha para el endpoint de métricas.
CREATE INDEX IF NOT EXISTS idx_inscripciones_estado_created_at ON inscripciones (estado, created_at);