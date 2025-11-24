# Guía de Políticas RLS para Producción

## 📋 Resumen

Este documento explica las políticas de seguridad (RLS - Row Level Security) implementadas para producción.

---

## 🔐 Filosofía de Seguridad

Las políticas siguen estos principios:

1. **Lectura Pública**: Los datos del marketplace (servicios, perfiles, categorías) son públicos
2. **Escritura Autenticada**: Solo usuarios autenticados pueden crear/modificar datos
3. **Propiedad**: Los usuarios solo pueden modificar sus propios datos
4. **Privacidad**: Las solicitudes de servicio solo son visibles para cliente y trabajador involucrados

---

## 📊 Resumen de Políticas por Tabla

### Lectura Pública (sin autenticación)

| Tabla | Restricción | Razón |
|-------|-------------|-------|
| `categoria_servicio` | Ninguna | Necesario para mostrar categorías |
| `servicio` | Solo activos (`estado = 'A'`) | Marketplace público |
| `trabajador` | Ninguna | Perfiles públicos |
| `perfil` | Ninguna | Información pública de trabajadores |
| `persona` | Ninguna | Información básica pública |
| `portafolio` | Ninguna | Trabajos públicos |
| `certificacion` | Ninguna | Certificaciones públicas |

### Lectura Restringida (solo autenticados)

| Tabla | Quién puede leer | Condición |
|-------|------------------|-----------|
| `solicitud_servicio` | Cliente o Trabajador | Solo sus propias solicitudes |

### Escritura Restringida (solo el dueño)

| Tabla | Quién puede escribir | Validación |
|-------|---------------------|------------|
| `persona` | El usuario mismo | `auth.email() = email` |
| `perfil` | El trabajador dueño | Email coincide con trabajador |
| `servicio` | El trabajador dueño | Email coincide con trabajador |
| `portafolio` | El trabajador dueño | Email coincide con trabajador |
| `certificacion` | El trabajador dueño | Email coincide con trabajador |

---

## 🔍 Detalles de Autenticación

### Método de Validación

Las políticas usan `auth.email()` de Supabase para identificar al usuario:

```sql
-- Ejemplo: Solo el usuario puede actualizar su propia persona
CREATE POLICY "Users can update own persona"
ON persona FOR UPDATE
USING (auth.email() = email)
WITH CHECK (auth.email() = email);
```

### Validación de Propiedad

Para tablas relacionadas, se valida la propiedad a través de JOINs:

```sql
-- Ejemplo: Solo el trabajador puede actualizar su perfil
CREATE POLICY "Workers can update own perfil"
ON perfil FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM trabajador t
        JOIN persona p ON t.id_persona = p.id_persona
        WHERE t.id_trabajador = perfil.trabajador_id_trabajador
        AND p.email = auth.email()
    )
);
```

---

## 🚀 Instalación

### Paso 1: Ejecutar el Script

1. Ve a Supabase Dashboard → SQL Editor
2. Abre el archivo `src/database/production_rls_policies.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Haz clic en **"Run"**

### Paso 2: Verificar Instalación

Al final del script, verás dos consultas de verificación:

#### Verificar RLS Habilitado
```sql
SELECT schemaname, tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (...)
ORDER BY tablename;
```

Todas las tablas deben mostrar `rls_enabled = true`.

#### Verificar Políticas Creadas
```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Deberías ver múltiples políticas para cada tabla.

---

## 🧪 Pruebas de Seguridad

### Test 1: Lectura Pública (sin autenticación)

```sql
-- Debe funcionar SIN estar autenticado
SELECT * FROM categoria_servicio LIMIT 5;
SELECT * FROM servicio WHERE estado = 'A' LIMIT 5;
SELECT * FROM perfil LIMIT 5;
```

✅ **Esperado**: Devuelve datos sin error

### Test 2: Escritura sin Autenticación

```sql
-- Debe FALLAR sin autenticación
INSERT INTO persona (id_persona, p_nombre, email, ...)
VALUES (999, 'Test', 'test@test.com', ...);
```

❌ **Esperado**: Error de permisos

### Test 3: Lectura de Datos Propios

```sql
-- Autenticado como usuario@example.com
SELECT * FROM solicitud_servicio
WHERE cliente_id_persona = (
    SELECT id_persona FROM persona WHERE email = 'usuario@example.com'
);
```

✅ **Esperado**: Solo devuelve solicitudes del usuario autenticado

### Test 4: Modificación de Datos Ajenos

```sql
-- Autenticado como usuario1@example.com
-- Intentar actualizar perfil de usuario2@example.com
UPDATE perfil SET descripcion = 'Hackeado'
WHERE trabajador_id_trabajador = (
    SELECT id_trabajador FROM trabajador t
    JOIN persona p ON t.id_persona = p.id_persona
    WHERE p.email = 'usuario2@example.com'
);
```

❌ **Esperado**: 0 filas actualizadas (sin error, pero sin efecto)

---

## 🔧 Troubleshooting

### Error: "new row violates row-level security policy"

**Causa**: Intentando insertar/actualizar datos sin los permisos correctos.

**Solución**:
1. Verifica que el usuario esté autenticado
2. Verifica que el email del usuario coincida con los datos
3. Revisa la política específica con:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'nombre_tabla';
   ```

### Error: "permission denied for table"

**Causa**: RLS no está habilitado o no hay políticas.

**Solución**:
1. Ejecuta nuevamente el script `production_rls_policies.sql`
2. Verifica que RLS esté habilitado:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'nombre_tabla';
   ```

### No se muestran datos en la aplicación

**Causa**: Políticas demasiado restrictivas o usuario no autenticado.

**Solución**:
1. Verifica que las tablas públicas tengan políticas de lectura pública
2. Revisa los logs de Supabase (Logs → API)
3. Verifica en la consola del navegador si hay errores de autenticación

---

## 📝 Mantenimiento

### Agregar Nueva Tabla

Si agregas una nueva tabla, sigue este patrón:

```sql
-- 1. Habilitar RLS
ALTER TABLE nueva_tabla ENABLE ROW LEVEL SECURITY;

-- 2. Política de lectura (ajustar según necesidad)
CREATE POLICY "Public read nueva_tabla"
ON nueva_tabla FOR SELECT
USING (true);  -- o condición específica

-- 3. Política de escritura (solo el dueño)
CREATE POLICY "Users can manage own nueva_tabla"
ON nueva_tabla FOR ALL
USING (auth.email() = email_column)
WITH CHECK (auth.email() = email_column);
```

### Modificar Política Existente

```sql
-- 1. Eliminar política antigua
DROP POLICY IF EXISTS "nombre_politica" ON tabla;

-- 2. Crear nueva política
CREATE POLICY "nombre_politica"
ON tabla FOR SELECT
USING (nueva_condicion);
```

---

## 🔒 Mejores Prácticas

1. **Nunca desactives RLS** en producción
2. **Prueba las políticas** antes de desplegar
3. **Usa `auth.email()`** para validar usuarios
4. **Documenta cambios** en políticas
5. **Revisa logs** regularmente para detectar intentos de acceso no autorizado

---

## 📚 Recursos

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
