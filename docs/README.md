# 🚀 Solución de Problemas en Producción - SkillLink

## 📋 Resumen del Problema

La aplicación muestra **"No se encontró información del perfil"** en producción (Vercel) pero funciona correctamente en local.

## 🎯 Solución Completa

Sigue estas guías en orden:

### 1️⃣ [Configuración de Vercel](./VERCEL_SETUP.md)
**Tiempo estimado: 5 minutos**

Configura las variables de entorno en Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 2️⃣ [Configuración de Supabase](./SUPABASE_SETUP.md)
**Tiempo estimado: 10 minutos**

Configura:
- RLS Policies (permisos de lectura/escritura)
- CORS (dominios permitidos)
- Verificación de datos

---

## 📁 Archivos Importantes

### Guías de Configuración
- [`VERCEL_SETUP.md`](./VERCEL_SETUP.md) - Configuración de variables de entorno
- [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) - Configuración de RLS y CORS

### Scripts SQL
- [`../database/setup_rls_policies.sql`](../database/setup_rls_policies.sql) - Configurar políticas de seguridad
- [`../database/verify_production_data.sql`](../database/verify_production_data.sql) - Verificar datos en producción

---

## ✅ Checklist Rápido

### En Vercel:
- [ ] Variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` configuradas
- [ ] Marcadas para Production, Preview, Development
- [ ] Redeploy realizado después de agregar variables
- [ ] Deployment exitoso (estado "Ready")

### En Supabase:
- [ ] RLS policies configuradas (ejecutar `setup_rls_policies.sql`)
- [ ] CORS configurado con dominio de Vercel
- [ ] Datos de prueba existen en todas las tablas
- [ ] Consultas públicas funcionan

### En la Aplicación:
- [ ] Consola muestra "🔧 Supabase Configuration"
- [ ] No hay errores 401, 403, o 406
- [ ] Perfiles se cargan correctamente

---

## 🐛 Problemas Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Missing Supabase environment variables" | Variables no configuradas en Vercel | Ver [VERCEL_SETUP.md](./VERCEL_SETUP.md) |
| "No se encontró información del perfil" | RLS policies no configuradas | Ver [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) |
| Error 401 | Credenciales incorrectas | Verificar valores en Vercel |
| Error 403 | RLS bloqueando acceso | Ejecutar `setup_rls_policies.sql` |
| Error 406 | Ya resuelto en código | Hacer pull del último código |

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir todas las guías aún tienes problemas:

1. Revisa los **Runtime Logs** en Vercel
2. Revisa los **API Logs** en Supabase
3. Abre la **Consola del Navegador** (F12) y busca errores específicos
4. Comparte los errores para ayuda adicional

---

## 🎓 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
