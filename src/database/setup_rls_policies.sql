-- ============================================
-- SCRIPT: Configuración de RLS Policies
-- Propósito: Habilitar políticas de seguridad a nivel de fila
-- ============================================

-- IMPORTANTE: Este script configura políticas PERMISIVAS para testing
-- En producción real, deberías restringir según el usuario autenticado

-- ============================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
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
-- 2. ELIMINAR POLÍTICAS EXISTENTES (si existen)
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

-- ============================================
-- 3. CREAR POLÍTICAS PERMISIVAS PARA LECTURA
-- ============================================

-- PERSONA: Lectura pública
CREATE POLICY "Allow public read access on persona" 
ON persona FOR SELECT 
USING (true);

-- TRABAJADOR: Lectura pública
CREATE POLICY "Allow public read access on trabajador" 
ON trabajador FOR SELECT 
USING (true);

-- PERFIL: Lectura pública
CREATE POLICY "Allow public read access on perfil" 
ON perfil FOR SELECT 
USING (true);

-- SERVICIO: Lectura pública (solo servicios activos)
CREATE POLICY "Allow public read access on servicio" 
ON servicio FOR SELECT 
USING (estado = 'A');

-- CATEGORIA_SERVICIO: Lectura pública
CREATE POLICY "Allow public read access on categoria_servicio" 
ON categoria_servicio FOR SELECT 
USING (true);

-- SERVICIO_CATEGORIA_SERVICIO: Lectura pública
CREATE POLICY "Allow public read access on servicio_categoria_servicio" 
ON servicio_categoria_servicio FOR SELECT 
USING (true);

-- TRABAJADOR_SERVICIO: Lectura pública
CREATE POLICY "Allow public read access on trabajador_servicio" 
ON trabajador_servicio FOR SELECT 
USING (true);

-- SOLICITUD_SERVICIO: Lectura pública
CREATE POLICY "Allow public read access on solicitud_servicio" 
ON solicitud_servicio FOR SELECT 
USING (true);

-- PORTAFOLIO: Lectura pública
CREATE POLICY "Allow public read access on portafolio" 
ON portafolio FOR SELECT 
USING (true);

-- CERTIFICACION: Lectura pública
CREATE POLICY "Allow public read access on certificacion" 
ON certificacion FOR SELECT 
USING (true);

-- ============================================
-- 4. POLÍTICAS DE ESCRITURA (solo para usuarios autenticados)
-- ============================================

-- PERFIL: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own perfil" 
ON perfil FOR UPDATE 
USING (auth.uid()::text = (SELECT email FROM persona WHERE id_persona = perfil.trabajador_id_trabajador));

-- SERVICIO: Los trabajadores pueden crear sus propios servicios
CREATE POLICY "Workers can insert own servicio" 
ON servicio FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- PORTAFOLIO: Los trabajadores pueden gestionar su portafolio
CREATE POLICY "Workers can manage own portafolio" 
ON portafolio FOR ALL 
USING (auth.uid() IS NOT NULL);

-- CERTIFICACION: Los trabajadores pueden gestionar sus certificaciones
CREATE POLICY "Workers can manage own certificacion" 
ON certificacion FOR ALL 
USING (auth.uid() IS NOT NULL);

-- ============================================
-- 5. VERIFICACIÓN
-- ============================================

-- Verificar que RLS esté habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'persona', 'trabajador', 'perfil', 'servicio', 
    'categoria_servicio', 'servicio_categoria_servicio',
    'trabajador_servicio', 'solicitud_servicio',
    'portafolio', 'certificacion'
)
ORDER BY tablename;

-- Verificar políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

-- 1. Estas políticas son PERMISIVAS para facilitar el testing
-- 2. En producción, deberías:
--    - Restringir lectura según el tipo de usuario
--    - Validar que solo los dueños puedan modificar sus datos
--    - Implementar políticas específicas por rol (Cliente/Trabajador)
-- 3. Para políticas más restrictivas, usa:
--    USING (auth.uid()::text = email) -- para verificar el usuario actual
-- 4. Ejecuta este script en Supabase SQL Editor
