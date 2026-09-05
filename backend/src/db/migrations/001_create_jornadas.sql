CREATE TABLE IF NOT EXISTS jornadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    sede VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    cupo_total INTEGER NOT NULL CHECK (cupo_total >= 0),
    cupo_ocupado INTEGER NOT NULL DEFAULT 0 CHECK (cupo_ocupado >= 0),
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_cupo_no_excede_total CHECK (cupo_ocupado <= cupo_total)
);

CREATE INDEX IF NOT EXISTS idx_jornadas_fecha ON jornadas (fecha);
CREATE INDEX IF NOT EXISTS idx_jornadas_activa ON jornadas (activa);