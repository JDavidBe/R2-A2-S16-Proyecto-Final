-- ============================================================
--  Árbol de Saberes — Schema v2
--  Ejecutar en pgAdmin (o herramienta equivalente)
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id         BIGSERIAL PRIMARY KEY,
    nombre     VARCHAR(100) NOT NULL,
    correo     VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    rol        VARCHAR(20)  NOT NULL DEFAULT 'ESTUDIANTE',
    activo     BOOLEAN DEFAULT TRUE,
    creado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recursos (
    id              BIGSERIAL PRIMARY KEY,
    titulo          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    area            VARCHAR(50),
    grado           VARCHAR(20),
    tipo            VARCHAR(20) DEFAULT 'PDF',
    nombre_archivo  VARCHAR(200),
    contenido_pdf   BYTEA,
    tamano_bytes    BIGINT,
    subido_por      BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS descargas (
    id            BIGSERIAL PRIMARY KEY,
    usuario_id    BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    recurso_id    BIGINT NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
    descargado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NUEVA: tabla de valoraciones (1 por usuario por recurso)
CREATE TABLE IF NOT EXISTS valoraciones (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    recurso_id  BIGINT NOT NULL REFERENCES recursos(id) ON DELETE CASCADE,
    puntuacion  SMALLINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario  TEXT,
    creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, recurso_id)
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_recursos_area  ON recursos(area);
CREATE INDEX IF NOT EXISTS idx_recursos_grado ON recursos(grado);
CREATE INDEX IF NOT EXISTS idx_recursos_subido_por ON recursos(subido_por);
CREATE INDEX IF NOT EXISTS idx_descargas_recurso ON descargas(recurso_id);
CREATE INDEX IF NOT EXISTS idx_valoraciones_recurso ON valoraciones(recurso_id);

-- ============================================================
--  Usuarios demo  (password: admin1234)
-- ============================================================
INSERT INTO usuarios (nombre, correo, password, rol) VALUES
  ('Administrador',   'admin@sardinas.edu.co',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'),
  ('Docente Demo',    'docente@sardinas.edu.co',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DOCENTE'),
  ('Estudiante Demo', 'estudiante@sardinas.edu.co',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ESTUDIANTE'),
  ('Director',        'director@sardinas.edu.co',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DIRECTIVO')
ON CONFLICT (correo) DO NOTHING;
