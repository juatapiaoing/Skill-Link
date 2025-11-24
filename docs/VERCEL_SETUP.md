# Guía Paso a Paso: Configuración de Vercel

## 📋 Objetivo
Configurar correctamente las variables de entorno en Vercel para que la aplicación funcione en producción.

---

## 🔑 Paso 1: Obtener las Credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Selecciona tu proyecto SkillLink
3. En el menú lateral, ve a **Settings** (⚙️) → **API**
4. Copia los siguientes valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon/public key** (una cadena larga que empieza con `eyJ...`)

> 💡 **Tip**: Guarda estos valores en un archivo temporal, los necesitarás en el siguiente paso.

---

## 🚀 Paso 2: Configurar Variables en Vercel

### 2.1 Acceder a la Configuración

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Selecciona tu proyecto **Skill-Link**
3. Haz clic en **Settings** (en la parte superior)
4. En el menú lateral, selecciona **Environment Variables**

### 2.2 Agregar las Variables

Vas a agregar **DOS** variables de entorno:

#### Variable 1: VITE_SUPABASE_URL

1. Haz clic en el botón **"Add New"** o **"Add Variable"**
2. En **Name**, escribe exactamente: `VITE_SUPABASE_URL`
3. En **Value**, pega tu **Project URL** de Supabase
4. En **Environment**, marca las 3 opciones:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Haz clic en **Save**

#### Variable 2: VITE_SUPABASE_ANON_KEY

1. Haz clic nuevamente en **"Add New"** o **"Add Variable"**
2. En **Name**, escribe exactamente: `VITE_SUPABASE_ANON_KEY`
3. En **Value**, pega tu **anon/public key** de Supabase
4. En **Environment**, marca las 3 opciones:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Haz clic en **Save**

### 2.3 Verificar las Variables

Deberías ver algo así:

```
VITE_SUPABASE_URL          https://xxxxx.supabase.co     Production, Preview, Development
VITE_SUPABASE_ANON_KEY     eyJhbGciOiJIUzI1NiIsInR5...   Production, Preview, Development
```

> ⚠️ **IMPORTANTE**: Los nombres deben ser EXACTAMENTE `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Si usas otros nombres (como `REACT_APP_...`), NO funcionará.

---

## 🔄 Paso 3: Hacer Redeploy

Después de agregar las variables, debes hacer un nuevo deployment:

### Opción A: Redeploy desde Vercel

1. Ve a la pestaña **Deployments**
2. Encuentra el último deployment
3. Haz clic en los tres puntos **"..."** a la derecha
4. Selecciona **"Redeploy"**
5. Confirma haciendo clic en **"Redeploy"** nuevamente

### Opción B: Push a GitHub

Simplemente haz un nuevo commit y push a tu repositorio:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

Vercel detectará el cambio y hará un nuevo deployment automáticamente.

---

## ✅ Paso 4: Verificar el Deployment

1. Espera a que el deployment termine (1-2 minutos)
2. Vercel te mostrará un estado **"Ready"** cuando esté listo
3. Haz clic en **"Visit"** para abrir tu aplicación
4. Abre la **Consola del Navegador** (F12)
5. Busca el mensaje: `🔧 Supabase Configuration:`
6. Verifica que diga:
   - ✅ `URL: https://xxxxx.supabase.co...`
   - ✅ `Key Present: true`
   - ✅ `Environment: production`

---

## 🐛 Solución de Problemas

### Si ves "Missing Supabase environment variables"

1. Verifica que los nombres sean exactamente `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
2. Asegúrate de que estén marcadas para **Production**
3. Haz un **Redeploy** después de agregar las variables

### Si ves "No se encontró información del perfil"

1. Verifica que las variables estén correctas
2. Continúa con la **Guía de Supabase** para configurar RLS y CORS

### Si el deployment falla

1. Ve a **Deployments** → Selecciona el deployment fallido
2. Revisa los **Build Logs** para ver el error específico
3. Busca errores relacionados con variables de entorno

---

## 📝 Checklist Final

- [ ] Variables agregadas con nombres exactos
- [ ] Valores copiados correctamente desde Supabase
- [ ] Marcadas para Production, Preview, Development
- [ ] Redeploy realizado
- [ ] Deployment exitoso (estado "Ready")
- [ ] Consola del navegador muestra configuración correcta

---

## 🎯 Próximo Paso

Una vez que las variables estén configuradas y el deployment sea exitoso, continúa con la **Guía de Configuración de Supabase** para configurar RLS policies y CORS.
