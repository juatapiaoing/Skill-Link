-- Drop tables if they exist to ensure clean creation
DROP TABLE IF EXISTS calificacion CASCADE;
DROP TABLE IF EXISTS membresia CASCADE;
DROP TABLE IF EXISTS plan CASCADE;

-- 1. Create PLAN table
CREATE TABLE plan (
    id_plan SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    max_publicaciones INT NOT NULL, -- -1 for unlimited
    duracion_publicacion_dias INT NOT NULL,
    descripcion TEXT
);

-- 2. Create MEMBRESIA table
CREATE TABLE membresia (
    id_membresia SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_plan INT NOT NULL REFERENCES plan(id_plan),
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVA', -- ACTIVA, VENCIDA, CANCELADA
    CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES persona(id_persona)
);

-- 3. Create CALIFICACION table
CREATE TABLE calificacion (
    id_calificacion SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL REFERENCES solicitud_servicio(id_solicitud),
    calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Alter SERVICIO table
ALTER TABLE servicio 
ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS fecha_expiracion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'ACTIVO'; -- ACTIVO, EXPIRADO, ELIMINADO

-- 5. Alter TRABAJADOR table
ALTER TABLE trabajador
ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT FALSE;

-- 6. Insert Plans
INSERT INTO plan (nombre, precio, max_publicaciones, duracion_publicacion_dias, descripcion) VALUES
('Free', 0, 1, 1, 'Una publicación que desaparece después de un día.'),
('Plata', 9990, 1, 7, 'Una publicación que dura una semana.'),
('Oro', 19990, 1, 14, 'Una publicación que dura dos semanas.'),
('Platino', 29990, 2, 30, 'Dos publicaciones que duran un mes.'),
('Black', 49990, -1, 30, 'Publicaciones ilimitadas que duran un mes.');

-- 7. Add index for performance
CREATE INDEX IF NOT EXISTS idx_membresia_usuario ON membresia(id_usuario);
CREATE INDEX IF NOT EXISTS idx_servicio_estado ON servicio(estado);
CREATE INDEX IF NOT EXISTS idx_calificacion_solicitud ON calificacion(id_solicitud);
