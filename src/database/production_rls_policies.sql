-- ============================================
-- SCRIPT: Políticas RLS para Producción
-- Propósito: Configurar políticas de seguridad apropiadas para producción
-- Versión: Production-Ready
-- ============================================

-- IMPORTANTE: Este script configura políticas SEGURAS para producción
-- Las políticas restringen el acceso basándose en:
-- 1. Usuario autenticado (auth.uid())
-- 2. Email del usuario (auth.email())
-- 3. Propiedad de los datos (el usuario solo puede modificar sus propios datos)

-- ============================================
-- 1. LIMPIAR POLÍTICAS EXISTENTES
-- ============================================

-- Eliminar políticas antiguas si existen
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

-- ============================================
-- 2. HABILITAR RLS EN TODAS LAS TABLAS
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
-- 3. POLÍTICAS DE LECTURA PÚBLICA
-- ============================================
-- Estas tablas pueden ser leídas por cualquiera (autenticado o no)

-- CATEGORIA_SERVICIO: Lectura pública (necesario para mostrar categorías)
CREATE POLICY "Public read categoria_servicio"
ON categoria_servicio FOR SELECT
USING (true);

-- SERVICIO: Lectura pública solo para servicios activos
CREATE POLICY "Public read active servicio"
ON servicio FOR SELECT
USING (estado = 'A');

-- SERVICIO_CATEGORIA_SERVICIO: Lectura pública
CREATE POLICY "Public read servicio_categoria"
ON servicio_categoria_servicio FOR SELECT
USING (true);

-- TRABAJADOR_SERVICIO: Lectura pública
CREATE POLICY "Public read trabajador_servicio"
ON trabajador_servicio FOR SELECT
USING (true);

-- TRABAJADOR: Lectura pública (para mostrar perfiles públicos)
CREATE POLICY "Public read trabajador"
ON trabajador FOR SELECT
USING (true);

-- PERFIL: Lectura pública (para mostrar perfiles públicos)
CREATE POLICY "Public read perfil"
ON perfil FOR SELECT
USING (true);

-- PERSONA: Lectura pública (para mostrar información básica)
CREATE POLICY "Public read persona"
ON persona FOR SELECT
USING (true);

-- PORTAFOLIO: Lectura pública (para mostrar trabajos)
CREATE POLICY "Public read portafolio"
ON portafolio FOR SELECT
USING (true);

-- CERTIFICACION: Lectura pública (para mostrar certificaciones)
CREATE POLICY "Public read certificacion"
ON certificacion FOR SELECT
USING (true);

-- ============================================
-- 4. POLÍTICAS DE ESCRITURA - PERSONA
-- ============================================

-- Los usuarios pueden actualizar su propia información
CREATE POLICY "Users can update own persona"
ON persona FOR UPDATE
USING (auth.email() = email)
WITH CHECK (auth.email() = email);

-- Los usuarios pueden insertar su propia persona al registrarse
CREATE POLICY "Users can insert own persona"
ON persona FOR INSERT
WITH CHECK (auth.email() = email);

-- ============================================
-- 5. POLÍTICAS DE ESCRITURA - PERFIL
-- ============================================

-- Los trabajadores pueden actualizar su propio perfil
CREATE POLICY "Workers can update own perfil"
ON perfil FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM trabajador t
        JOIN persona p ON t.id_persona = p.id_persona
        WHERE t.id_trabajador = perfil.trabajador_id_trabajador
        AND p.email = auth.email()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM trabajador t
        JOIN persona p ON t.id_persona = p.id_persona
        WHERE t.id_trabajador = perfil.trabajador_id_trabajador
        AND p.email = auth.email()
    )
);

-- Los trabajadores pueden crear su propio perfil
CREATE POLICY "Workers can insert own perfil"
ON perfil FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM trabajador t
        JOIN persona p ON t.id_persona = p.id_persona
        WHERE t.id_trabajador = perfil.trabajador_id_trabajador
        AND p.email = auth.email()
    )
);

-- ============================================
-- 6. POLÍTICAS DE ESCRITURA - SERVICIO
-- ============================================

-- Los trabajadores pueden crear servicios
CREATE POLICY "Workers can insert servicio"
ON servicio FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Los trabajadores pueden actualizar sus propios servicios
CREATE POLICY "Workers can update own servicio"
ON servicio FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM trabajador_servicio ts
        JOIN persona p ON ts.trabajador_id_persona = p.id_persona
        WHERE ts.servicio_id_servicio = servicio.id_servicio
        AND p.email = auth.email()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM trabajador_servicio ts
        JOIN persona p ON ts.trabajador_id_persona = p.id_persona
        WHERE ts.servicio_id_servicio = servicio.id_servicio
        AND p.email = auth.email()
    )
);

-- Los trabajadores pueden eliminar sus propios servicios
CREATE POLICY "Workers can delete own servicio"
ON servicio FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM trabajador_servicio ts
        JOIN persona p ON ts.trabajador_id_persona = p.id_persona
        WHERE ts.servicio_id_servicio = servicio.id_servicio
        AND p.email = auth.email()
    )
);

-- ============================================
-- 7. POLÍTICAS DE ESCRITURA - TRABAJADOR_SERVICIO
-- ============================================

-- Los trabajadores pueden asociar servicios a sí mismos
CREATE POLICY "Workers can insert own trabajador_servicio"
ON trabajador_servicio FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM persona p
        WHERE p.id_persona = trabajador_servicio.trabajador_id_persona
        AND p.email = auth.email()
    )
);

-- Los trabajadores pueden eliminar sus propias asociaciones
CREATE POLICY "Workers can delete own trabajador_servicio"
ON trabajador_servicio FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM persona p
        WHERE p.id_persona = trabajador_servicio.trabajador_id_persona
        AND p.email = auth.email()
    )
);

-- ============================================
-- 8. POLÍTICAS DE ESCRITURA - SERVICIO_CATEGORIA_SERVICIO
-- ============================================

-- Los trabajadores pueden asociar categorías a sus servicios
CREATE POLICY "Workers can manage servicio_categoria"
ON servicio_categoria_servicio FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM trabajador_servicio ts
        JOIN persona p ON ts.trabajador_id_persona = p.id_persona
        WHERE ts.servicio_id_servicio = servicio_categoria_servicio.servicio_id_servicio
        AND p.email = auth.email()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM trabajador_servicio ts
        JOIN persona p ON ts.trabajador_id_persona = p.id_persona
        WHERE ts.servicio_id_servicio = servicio_categoria_servicio.servicio_id_servicio
        AND p.email = auth.email()
    )
);

-- ============================================
-- 9. POLÍTICAS DE ESCRITURA - PORTAFOLIO
-- ============================================

-- Los trabajadores pueden gestionar su propio portafolio
CREATE POLICY "Workers can manage own portafolio"
ON portafolio FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM trabajador t
        JOIN persona p ON t.id_persona = p.id_persona
        WHERE t.id_trabajador = portafolio.id_trabajador
        AND p.email = auth.email()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM trabajador t
        JOIN persona p ON t.id_persona = p.id_persona
        WHERE t.id_trabajador = portafolio.id_trabajador
        AND p.email = auth.email()
    )
);

-- ============================================
-- 10. POLÍTICAS DE ESCRITURA - CERTIFICACION
-- ============================================

-- Los trabajadores pueden gestionar sus propias certificaciones
CREATE POLICY "Workers can manage own certificacion"
ON certificacion FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM perfil pf
        JOIN trabajador t ON pf.trabajador_id_trabajador = t.id_trabajador
        JOIN persona p ON t.id_persona = p.id_persona
        WHERE pf.id_perfil = certificacion.perfil_id_perfil
        AND p.email = auth.email()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM perfil pf
        JOIN trabajador t ON pf.trabajador_id_trabajador = t.id_trabajador
        JOIN persona p ON t.id_persona = p.id_persona
        WHERE pf.id_perfil = certificacion.perfil_id_perfil
        AND p.email = auth.email()
    )
);

-- ============================================
-- 11. POLÍTICAS DE LECTURA/ESCRITURA - SOLICITUD_SERVICIO
-- ============================================

-- Lectura: Los usuarios pueden ver sus propias solicitudes
CREATE POLICY "Users can read own solicitudes"
ON solicitud_servicio FOR SELECT
USING (
    -- El cliente puede ver sus solicitudes
    EXISTS (
        SELECT 1 FROM persona p
        WHERE p.id_persona = solicitud_servicio.cliente_id_persona
        AND p.email = auth.email()
    )
    OR
    -- El trabajador puede ver solicitudes de sus servicios
    EXISTS (
        SELECT 1 FROM trabajador t
        JOIN persona p ON t.id_persona = p.id_persona
        WHERE t.id_trabajador = solicitud_servicio.id_trabajador
        AND p.email = auth.email()
    )
);

-- Escritura: Los clientes pueden crear solicitudes
CREATE POLICY "Clients can insert solicitudes"
ON solicitud_servicio FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM persona p
        WHERE p.id_persona = solicitud_servicio.cliente_id_persona
        AND p.email = auth.email()
    )
);

-- Actualización: Los trabajadores pueden actualizar el estado de solicitudes
CREATE POLICY "Workers can update solicitudes status"
ON solicitud_servicio FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM trabajador t
        JOIN persona p ON t.id_persona = p.id_persona
        WHERE t.id_trabajador = solicitud_servicio.id_trabajador
        AND p.email = auth.email()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM trabajador t
        JOIN persona p ON t.id_persona = p.id_persona
        WHERE t.id_trabajador = solicitud_servicio.id_trabajador
        AND p.email = auth.email()
    )
);

-- ============================================
-- 12. VERIFICACIÓN
-- ============================================

-- Verificar que RLS esté habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
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
    cmd as command
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- RESUMEN DE POLÍTICAS
-- ============================================

/*
LECTURA PÚBLICA (sin autenticación):
- categoria_servicio (todas)
- servicio (solo activos)
- servicio_categoria_servicio (todas)
- trabajador_servicio (todas)
- trabajador (todos)
- perfil (todos)
- persona (todas)
- portafolio (todos)
- certificacion (todas)

LECTURA RESTRINGIDA (solo usuarios autenticados):
- solicitud_servicio (solo las propias)

ESCRITURA RESTRINGIDA (solo el dueño):
- persona (solo la propia)
- perfil (solo el propio)
- servicio (solo los propios)
- trabajador_servicio (solo los propios)
- servicio_categoria_servicio (solo para servicios propios)
- portafolio (solo el propio)
- certificacion (solo las propias)
- solicitud_servicio (clientes crean, trabajadores actualizan)
*/
