-- ============================================
-- SCRIPT TEMPORAL: Políticas RLS Permisivas para Testing
-- USAR SOLO PARA DESARROLLO/TESTING
-- ============================================

-- IMPORTANTE: Este script permite acceso público a TODAS las tablas
-- Solo úsalo temporalmente para verificar que la aplicación funcione
-- Luego reemplaza con production_rls_policies.sql

-- ============================================
-- 1. LIMPIAR TODAS LAS POLÍTICAS
-- ============================================

DROP POLICY IF EXISTS "Allow public read access on persona" ON persona;
DROP POLICY IF EXISTS "Allow public read access on trabajador" ON trabajador;
DROP POLICY IF EXISTS "Allow public read access on perfil" ON perfil;
DROP POLICY IF EXISTS "Allow public read access on servicio" ON servicio;
DROP POLICY IF EXISTS "Allow public read access on categoria_servicio" ON categoria_servicio;
DROP POLICY IF EXISTS "Allow public read access on servicio_categoria_servicio" ON servicio_categoria_servicio;
DROP POLICY IF EXISTS "Allow public read access on trabajador_servicio" ON trabajador_servicio;
DROP POLICY IF EXISTS "Allow public read access on solicitud_servicio" ON solicitud_servicio;
DROP POLICY IF EXISTS "Allow public read access on portafolio" ON portafolio;
DROP POLICY IF EXISTS "Allow public read access on certificacion" ON certificacion;
DROP POLICY IF EXISTS "Users can update own perfil" ON perfil;
DROP POLICY IF EXISTS "Workers can insert own servicio" ON servicio;
DROP POLICY IF EXISTS "Workers can manage own portafolio" ON portafolio;
DROP POLICY IF EXISTS "Workers can manage own certificacion" ON certificacion;
DROP POLICY IF EXISTS "Public read categoria_servicio" ON categoria_servicio;
DROP POLICY IF EXISTS "Public read active servicio" ON servicio;
DROP POLICY IF EXISTS "Public read servicio_categoria" ON servicio_categoria_servicio;
DROP POLICY IF EXISTS "Public read trabajador_servicio" ON trabajador_servicio;
DROP POLICY IF EXISTS "Public read trabajador" ON trabajador;
DROP POLICY IF EXISTS "Public read perfil" ON perfil;
DROP POLICY IF EXISTS "Public read persona" ON persona;
DROP POLICY IF EXISTS "Public read portafolio" ON portafolio;
DROP POLICY IF EXISTS "Public read certificacion" ON certificacion;
DROP POLICY IF EXISTS "Users can update own persona" ON persona;
DROP POLICY IF EXISTS "Users can insert own persona" ON persona;
DROP POLICY IF EXISTS "Workers can update own perfil" ON perfil;
DROP POLICY IF EXISTS "Workers can insert own perfil" ON perfil;
DROP POLICY IF EXISTS "Workers can insert servicio" ON servicio;
DROP POLICY IF EXISTS "Workers can update own servicio" ON servicio;
DROP POLICY IF EXISTS "Workers can delete own servicio" ON servicio;
DROP POLICY IF EXISTS "Workers can insert own trabajador_servicio" ON trabajador_servicio;
DROP POLICY IF EXISTS "Workers can delete own trabajador_servicio" ON trabajador_servicio;
DROP POLICY IF EXISTS "Workers can manage servicio_categoria" ON servicio_categoria_servicio;
DROP POLICY IF EXISTS "Workers can manage own portafolio" ON portafolio;
DROP POLICY IF EXISTS "Workers can manage own certificacion" ON certificacion;
DROP POLICY IF EXISTS "Users can read own solicitudes" ON solicitud_servicio;
DROP POLICY IF EXISTS "Clients can insert solicitudes" ON solicitud_servicio;
DROP POLICY IF EXISTS "Workers can update solicitudes status" ON solicitud_servicio;

-- Eliminar políticas del script temporal si existen
DROP POLICY IF EXISTS "Allow all read persona" ON persona;
DROP POLICY IF EXISTS "Allow all read trabajador" ON trabajador;
DROP POLICY IF EXISTS "Allow all read perfil" ON perfil;
DROP POLICY IF EXISTS "Allow all read servicio" ON servicio;
DROP POLICY IF EXISTS "Allow all read categoria_servicio" ON categoria_servicio;
DROP POLICY IF EXISTS "Allow all read servicio_categoria" ON servicio_categoria_servicio;
DROP POLICY IF EXISTS "Allow all read trabajador_servicio" ON trabajador_servicio;
DROP POLICY IF EXISTS "Allow all read solicitud_servicio" ON solicitud_servicio;
DROP POLICY IF EXISTS "Allow all read portafolio" ON portafolio;
DROP POLICY IF EXISTS "Allow all read certificacion" ON certificacion;
DROP POLICY IF EXISTS "Allow authenticated write persona" ON persona;
DROP POLICY IF EXISTS "Allow authenticated write trabajador" ON trabajador;
DROP POLICY IF EXISTS "Allow authenticated write perfil" ON perfil;
DROP POLICY IF EXISTS "Allow authenticated write servicio" ON servicio;
DROP POLICY IF EXISTS "Allow authenticated write servicio_categoria" ON servicio_categoria_servicio;
DROP POLICY IF EXISTS "Allow authenticated write trabajador_servicio" ON trabajador_servicio;
DROP POLICY IF EXISTS "Allow authenticated write solicitud_servicio" ON solicitud_servicio;
DROP POLICY IF EXISTS "Allow authenticated write portafolio" ON portafolio;
DROP POLICY IF EXISTS "Allow authenticated write certificacion" ON certificacion;

-- ============================================
-- 2. HABILITAR RLS
-- ============================================

ALTER TABLE persona ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajador ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE categoria_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicio_categoria_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajador_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitud_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE portafolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificacion ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREAR POLÍTICAS PERMISIVAS (ACCESO TOTAL)
-- ============================================

-- TODAS las tablas: Lectura pública SIN restricciones
CREATE POLICY "Allow all read persona" ON persona FOR SELECT USING (true);
CREATE POLICY "Allow all read trabajador" ON trabajador FOR SELECT USING (true);
CREATE POLICY "Allow all read perfil" ON perfil FOR SELECT USING (true);
CREATE POLICY "Allow all read servicio" ON servicio FOR SELECT USING (true);
CREATE POLICY "Allow all read categoria_servicio" ON categoria_servicio FOR SELECT USING (true);
CREATE POLICY "Allow all read servicio_categoria" ON servicio_categoria_servicio FOR SELECT USING (true);
CREATE POLICY "Allow all read trabajador_servicio" ON trabajador_servicio FOR SELECT USING (true);
CREATE POLICY "Allow all read solicitud_servicio" ON solicitud_servicio FOR SELECT USING (true);
CREATE POLICY "Allow all read portafolio" ON portafolio FOR SELECT USING (true);
CREATE POLICY "Allow all read certificacion" ON certificacion FOR SELECT USING (true);

-- TODAS las tablas: Escritura para usuarios autenticados
CREATE POLICY "Allow authenticated write persona" ON persona FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated write trabajador" ON trabajador FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated write perfil" ON perfil FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated write servicio" ON servicio FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated write servicio_categoria" ON servicio_categoria_servicio FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated write trabajador_servicio" ON trabajador_servicio FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated write solicitud_servicio" ON solicitud_servicio FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated write portafolio" ON portafolio FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated write certificacion" ON certificacion FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
