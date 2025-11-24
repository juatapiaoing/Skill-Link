# Guía Paso a Paso: Configuración de Supabase

## 📋 Objetivo
Configurar RLS policies, CORS y verificar datos en Supabase para que la aplicación funcione correctamente en producción.

---

## 🔐 Paso 1: Configurar RLS Policies

### 1.1 Abrir SQL Editor

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Selecciona tu proyecto SkillLink
3. En el menú lateral, ve a **SQL Editor**
4. Haz clic en **"New query"**

### 1.2 Ejecutar Script de RLS

1. Abre el archivo `src/database/setup_rls_policies.sql` de tu proyecto
2. Copia TODO el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **"Run"** (o presiona Ctrl+Enter)
5. Espera a que termine (verás un mensaje de éxito)

### 1.3 Verificar Políticas

Al final del script, verás dos consultas de verificación que mostrarán:
- Tablas con RLS habilitado
- Políticas creadas para cada tabla

Deberías ver políticas como:
- `Allow public read access on persona`
- `Allow public read access on trabajador`
- `Allow public read access on perfil`
- etc.

> ⚠️ **IMPORTANTE**: Estas políticas son permisivas para testing. En producción real, deberías restringir según el usuario autenticado.

---

## 🌐 Paso 2: Configurar CORS

### 2.1 Acceder a Configuración de API

1. En Supabase, ve a **Settings** → **API**
2. Scroll hacia abajo hasta **"CORS Configuration"**

### 2.2 Agregar Dominios

Agrega los siguientes dominios (uno por línea):

```
https://skill-link.vercel.app
https://*.vercel.app
http://localhost:5173
```

> 💡 **Nota**: Reemplaza `skill-link.vercel.app` con tu dominio real de Vercel.

### 2.3 Guardar Cambios

Haz clic en **"Save"** para aplicar los cambios.

---

## 📊 Paso 3: Verificar Datos en Producción

### 3.1 Ejecutar Script de Verificación

1. En el **SQL Editor** de Supabase, crea una nueva query
2. Abre el archivo `src/database/verify_production_data.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Haz clic en **"Run"**

### 3.2 Revisar Resultados

El script mostrará:
- Cantidad de registros en cada tabla
- Datos de ejemplo de cada tabla
- Problemas detectados (datos faltantes)

**Verifica que tengas:**
- ✅ Al menos 1 categoría de servicio
- ✅ Al menos 1 persona
- ✅ Al menos 1 trabajador
- ✅ Al menos 1 perfil
- ✅ Al menos 1 servicio activo

### 3.3 Si Faltan Datos

Si alguna tabla está vacía, necesitas ejecutar los scripts de seed:

#### Opción A: Desde SQL Editor

1. Abre `src/database/schema.sql`
2. Copia y ejecuta en SQL Editor (si aún no lo has hecho)
3. Abre `src/database/seed_data.sql` (si existe)
4. Copia y ejecuta en SQL Editor

#### Opción B: Desde Table Editor

1. Ve a **Table Editor** en Supabase
2. Selecciona la tabla vacía
3. Haz clic en **"Insert"** → **"Insert row"**
4. Agrega datos de prueba manualmente

---

## 🔍 Paso 4: Verificar Permisos de Lectura

### 4.1 Probar Consulta Pública

En el SQL Editor, ejecuta:

```sql
-- Probar lectura pública de perfil
SELECT 
    pf.id_perfil,
    pf.trabajador_id_trabajador,
    pf.descripcion
FROM perfil pf
LIMIT 5;
```

Si ves resultados, las políticas RLS están funcionando correctamente.

### 4.2 Probar desde la Aplicación

1. Abre tu aplicación en Vercel
2. Abre la Consola del Navegador (F12)
3. Ve a la pestaña **Network**
4. Navega a una página que cargue perfiles
5. Busca las peticiones a Supabase
6. Verifica que:
   - ✅ Status: 200 OK
   - ✅ Response contiene datos
   - ❌ NO hay errores 401, 403, o 406

---

## 🐛 Solución de Problemas

### Error 401 (Unauthorized)

- Verifica que las variables de entorno en Vercel sean correctas
- Asegúrate de que la `ANON_KEY` sea la correcta

### Error 403 (Forbidden)

- Las políticas RLS están bloqueando el acceso
- Ejecuta nuevamente el script `setup_rls_policies.sql`

### Error 406 (Not Acceptable)

- Ya lo arreglamos en el código (queries separadas)
- Si persiste, verifica que el código esté actualizado en GitHub

### "No se encontró información del perfil"

1. Verifica que existan perfiles en la tabla `perfil`
2. Ejecuta el script de verificación de datos
3. Revisa las políticas RLS
4. Verifica las variables de entorno en Vercel

---

## 📝 Checklist Final

- [ ] RLS policies configuradas en todas las tablas
- [ ] CORS configurado con dominio de Vercel
- [ ] Datos de prueba existen en todas las tablas críticas
- [ ] Consultas públicas funcionan en SQL Editor
- [ ] Aplicación en Vercel carga datos correctamente
- [ ] No hay errores 401, 403, o 406 en Network tab

---

## 🎯 Próximo Paso

Si completaste todos los pasos y aún tienes problemas:

1. Revisa los logs de Vercel (Deployments → Selecciona deployment → Runtime Logs)
2. Revisa los logs de Supabase (Logs → API)
3. Comparte los errores específicos para ayuda adicional

---

## 📚 Recursos Adicionales

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CORS Configuration](https://supabase.com/docs/guides/api/cors)
- [Debugging Supabase Queries](https://supabase.com/docs/guides/database/debugging)
