-- Add rating fields to TRABAJADOR table
ALTER TABLE trabajador 
ADD COLUMN IF NOT EXISTS calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_calificaciones INT DEFAULT 0;

-- Create index for better performance when sorting by rating
CREATE INDEX IF NOT EXISTS idx_trabajador_calificacion ON trabajador(calificacion_promedio DESC, total_calificaciones DESC);
