-- ============================================
-- SCRIPT: Verificación de Datos en Producción
-- Propósito: Verificar que existan datos en todas las tablas críticas
-- ============================================

-- ============================================
-- 1. VERIFICAR CATEGORÍAS
-- ============================================
SELECT 
    'CATEGORIA_SERVICIO' as tabla,
    COUNT(*) as total_registros
FROM categoria_servicio;

-- Listar categorías
SELECT * FROM categoria_servicio ORDER BY id_categ_serv;

-- ============================================
-- 2. VERIFICAR PERSONAS
-- ============================================
SELECT 
    'PERSONA' as tabla,
    COUNT(*) as total_registros
FROM persona;

-- Listar personas (sin datos sensibles)
SELECT 
    id_persona,
    p_nombre,
    ap_paterno,
    email,
    tipo
FROM persona 
ORDER BY id_persona 
LIMIT 10;

-- ============================================
-- 3. VERIFICAR TRABAJADORES
-- ============================================
SELECT 
    'TRABAJADOR' as tabla,
    COUNT(*) as total_registros
FROM trabajador;

-- Listar trabajadores
SELECT 
    t.id_trabajador,
    t.id_persona,
    p.p_nombre,
    p.ap_paterno,
    t.verificado,
    t.calificacion_promedio
FROM trabajador t
JOIN persona p ON t.id_persona = p.id_persona
ORDER BY t.id_trabajador
LIMIT 10;

-- ============================================
-- 4. VERIFICAR PERFILES
-- ============================================
SELECT 
    'PERFIL' as tabla,
    COUNT(*) as total_registros
FROM perfil;

-- Listar perfiles
SELECT 
    pf.id_perfil,
    pf.trabajador_id_trabajador,
    p.p_nombre,
    p.ap_paterno,
    pf.descripcion
FROM perfil pf
JOIN trabajador t ON pf.trabajador_id_trabajador = t.id_trabajador
JOIN persona p ON t.id_persona = p.id_persona
ORDER BY pf.id_perfil
LIMIT 10;

-- ============================================
-- 5. VERIFICAR SERVICIOS
-- ============================================
SELECT 
    'SERVICIO' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN estado = 'A' THEN 1 END) as servicios_activos
FROM servicio;

-- Listar servicios activos
SELECT 
    s.id_servicio,
    s.nombre_servicio,
    s.precio,
    s.estado
FROM servicio s
WHERE s.estado = 'A'
ORDER BY s.id_servicio
LIMIT 10;

-- ============================================
-- 6. VERIFICAR RELACIONES TRABAJADOR-SERVICIO
-- ============================================
SELECT 
    'TRABAJADOR_SERVICIO' as tabla,
    COUNT(*) as total_registros
FROM trabajador_servicio;

-- Listar relaciones
SELECT 
    ts.trabajador_id_persona,
    ts.servicio_id_servicio,
    s.nombre_servicio,
    p.p_nombre,
    p.ap_paterno
FROM trabajador_servicio ts
JOIN servicio s ON ts.servicio_id_servicio = s.id_servicio
JOIN persona p ON ts.trabajador_id_persona = p.id_persona
ORDER BY ts.trabajador_id_persona
LIMIT 10;

-- ============================================
-- 7. VERIFICAR CATEGORÍAS DE SERVICIO
-- ============================================
SELECT 
    'SERVICIO_CATEGORIA_SERVICIO' as tabla,
    COUNT(*) as total_registros
FROM servicio_categoria_servicio;

-- Listar servicios con categorías
SELECT 
    scs.servicio_id_servicio,
    s.nombre_servicio,
    cs.nombre_categ_serv
FROM servicio_categoria_servicio scs
JOIN servicio s ON scs.servicio_id_servicio = s.id_servicio
JOIN categoria_servicio cs ON scs.categ_serv_id = cs.id_categ_serv
ORDER BY scs.servicio_id_servicio
LIMIT 10;

-- ============================================
-- 8. RESUMEN GENERAL
-- ============================================
SELECT 
    'RESUMEN' as seccion,
    (SELECT COUNT(*) FROM categoria_servicio) as categorias,
    (SELECT COUNT(*) FROM persona) as personas,
    (SELECT COUNT(*) FROM trabajador) as trabajadores,
    (SELECT COUNT(*) FROM perfil) as perfiles,
    (SELECT COUNT(*) FROM servicio WHERE estado = 'A') as servicios_activos,
    (SELECT COUNT(*) FROM trabajador_servicio) as relaciones_trabajador_servicio;

-- ============================================
-- 9. VERIFICAR DATOS FALTANTES
-- ============================================

-- Trabajadores sin perfil
SELECT 
    'Trabajadores sin perfil' as problema,
    COUNT(*) as cantidad
FROM trabajador t
LEFT JOIN perfil pf ON t.id_trabajador = pf.trabajador_id_trabajador
WHERE pf.id_perfil IS NULL;

-- Servicios sin categoría
SELECT 
    'Servicios sin categoría' as problema,
    COUNT(*) as cantidad
FROM servicio s
LEFT JOIN servicio_categoria_servicio scs ON s.id_servicio = scs.servicio_id_servicio
WHERE scs.servicio_id_servicio IS NULL;

-- Servicios sin trabajador asignado
SELECT 
    'Servicios sin trabajador' as problema,
    COUNT(*) as cantidad
FROM servicio s
LEFT JOIN trabajador_servicio ts ON s.id_servicio = ts.servicio_id_servicio
WHERE ts.servicio_id_servicio IS NULL;

-- ============================================
-- NOTAS
-- ============================================
-- 1. Ejecuta este script en Supabase SQL Editor
-- 2. Revisa cada sección para identificar datos faltantes
-- 3. Si alguna tabla está vacía, ejecuta los scripts de seed
