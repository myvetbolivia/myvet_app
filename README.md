# MyVet — Guía de instalación (paso a paso, sin tecnicismos)

Este paquete contiene el código completo de MyVet, listo para conectarse a
una base de datos real (Supabase) y publicarse en internet (Netlify).

Vas a hacer 3 cosas, en este orden:

1. **Preparar Supabase** (tu base de datos) — 10-15 minutos, una sola vez.
2. **Conectar el código a Supabase** — copiar y pegar 2 datos.
3. **Publicar en Netlify** — para que la página esté online.

No hace falta que entiendas de programación para seguir estos pasos.
Es más que nada copiar, pegar y hacer clic.

---

## PARTE 1 — Preparar Supabase

### 1.1 Crear el proyecto

1. Andá a **[supabase.com](https://supabase.com)** y creá una cuenta (o iniciá sesión).
2. Hacé clic en **"New project"**.
3. Ponele un nombre (por ejemplo "MyVet"), elegí una contraseña para la base
   de datos (guardala en un lugar seguro, no la vas a necesitar seguido) y
   esperá 1-2 minutos a que el proyecto se termine de crear.

### 1.2 Crear todas las tablas de un solo paso

1. En el menú de la izquierda, hacé clic en **"SQL Editor"**.
2. Hacé clic en **"New query"**.
3. Abrí el archivo **`supabase/schema.sql`** que viene en este paquete,
   copiá **todo** su contenido, y pegalo en el cuadro de Supabase.
4. Hacé clic en **"Run"** (o apretá Ctrl+Enter / Cmd+Enter).

Con este único paso quedan creadas todas las tablas, las reglas de
seguridad y las funciones que la aplicación necesita. No tenés que crear
ninguna tabla a mano ni usar el "Table Editor".

### 1.3 Crear las carpetas de almacenamiento (para fotos y documentos)

1. En el menú de la izquierda, entrá a **"Storage"**.
2. Hacé clic en **"New bucket"** y creá estas dos, una por una:

   | Nombre exacto             | ¿Público? |
   |----------------------------|-----------|
   | `avatar`                   | ✅ Sí (marcá la opción "Public bucket") |
   | `verification-documents`   | ❌ No (dejalo privado, sin marcar nada) |

   - **`avatar`**: acá se guardan las fotos de perfil de los veterinarios.
     Es pública porque esas fotos las tiene que poder ver cualquiera que
     entre a la página.
   - **`verification-documents`**: acá se guardan los títulos y documentos
     que suben los veterinarios para que vos los revises. Es privada:
     nadie más que vos y el veterinario dueño puede verla.

### 1.4 Crear tu usuario administrador (uno solo)

1. En el menú de la izquierda, entrá a **"Authentication"** → pestaña **"Users"**.
2. Hacé clic en **"Add user"** → **"Create new user"**.
3. Completá con el email y la contraseña que vos quieras usar para entrar
   al panel de administración. Marcá la opción de "Auto confirm user" si
   aparece (así no hace falta que confirmes el correo).
4. Hacé clic en **"Create user"**.
5. Volvé al **"SQL Editor"**, abrí una consulta nueva, y pegá esta línea
   (cambiando el correo por el que usaste arriba):

   ```sql
   update public.profiles set role = 'admin'
   where email = 'tu-correo@ejemplo.com';
   ```

6. Hacé clic en **"Run"**.

Listo — esa cuenta ya puede entrar al panel de administración de MyVet.
**Si más adelante querés agregar más administradores**, no hace falta que
vuelvas a Supabase: desde el mismo panel de MyVet (menú "Administradores")
podés convertir en administrador a cualquier persona que ya se haya
registrado como cliente en la página.

### 1.5 (Opcional pero recomendado) Simplificar el registro

Por defecto, Supabase le pide a cada persona que confirme su correo antes
de poder usar la cuenta. Para que el registro de veterinarios y clientes
sea más simple (sin ese paso extra), podés desactivarlo:

1. Andá a **Authentication → Providers → Email**.
2. Apagá la opción **"Confirm email"**.
3. Guardá los cambios.

Si preferís mantenerlo activado, la aplicación sigue funcionando igual,
solo que la persona deberá revisar su correo antes de completar su
registro.

---

## PARTE 2 — Conectar el código a tu proyecto de Supabase

1. En tu proyecto de Supabase, andá al ícono de engranaje ⚙️
   **("Project Settings")** → **"API"**.
2. Ahí vas a ver dos datos que necesitás copiar:
   - **Project URL**
   - **Project API keys → `anon` `public`** (la clave pública)
3. En este paquete, buscá el archivo **`.env.example`**, hacé una copia y
   renombrala a **`.env`** (sin ".example").
4. Abrí ese archivo `.env` y completá los dos valores:

   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-publica-anon-key
   ```

5. Guardá el archivo.

Con esos dos datos, toda la aplicación (buscador, registro de
veterinarios, panel de administración, etc.) ya queda conectada a tu base
de datos real.

---

## PARTE 3 — Publicar en Netlify

### Opción A: arrastrar y soltar (la más simple)

1. En tu computadora, abrí una terminal dentro de la carpeta del proyecto
   y ejecutá estos dos comandos (una sola vez cada uno):

   ```
   npm install
   npm run build
   ```

   Esto va a crear una carpeta llamada **`dist`** con la versión final de
   la página, ya lista para publicar.

2. Andá a **[app.netlify.com](https://app.netlify.com)**, creá una cuenta
   si no tenés, y en la pantalla principal buscá el cuadro que dice
   **"Deploy manually"** (o "arrastrá tu carpeta acá").
3. Arrastrá la carpeta **`dist`** ahí adentro.

Con eso tu página ya queda publicada, con una dirección tipo
`algo.netlify.app` (después podés conectarle tu propio dominio si querés).

### Opción B: conectado a un repositorio (recomendada a futuro)

Si en algún momento subís este código a GitHub, podés conectar ese
repositorio directamente a Netlify (botón "Import from Git") y Netlify va
a publicar una versión nueva automáticamente cada vez que hagas un
cambio. El archivo `netlify.toml` que ya viene en este paquete deja todo
configurado para que esto funcione sin tocar nada más.

**Importante:** si usás esta opción, tenés que cargar los mismos dos
valores del archivo `.env` (URL y clave pública) en Netlify, en
**Site settings → Environment variables**, con los mismos nombres:
`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

---

## Cómo se organiza el código (por si algún día lo tocás)

```
src/
  pages/          → cada pantalla de la aplicación (Inicio, Resultados, Perfil, etc.)
  pages/admin/    → el panel de administración
  components/     → piezas reutilizables (logo, tarjetas, menú, etc.)
  lib/            → listas fijas (especialidades, provincias, etc.) y utilidades
  context/        → maneja quién inició sesión
  supabaseClient.js → la conexión a tu base de datos
supabase/
  schema.sql      → el script que crea toda la base de datos
```

---

## Notas honestas sobre algunos límites de esta versión

- **"Eliminar" un cliente** (en el panel admin → Usuarios) borra su perfil y
  sus datos dentro de MyVet, pero **no borra su acceso para iniciar
  sesión** — eso requiere una función avanzada de Supabase que
  deliberadamente no usamos, para no exponer claves sensibles en la app.
  Si además querés borrar por completo su acceso, podés hacerlo con un
  paso manual simple: **Authentication → Users**, buscar su email, y
  eliminarlo ahí. Para la mayoría de los casos (usuarios problemáticos),
  con "Eliminar" desde el panel alcanza, ya que sin su perfil no puede
  usar ninguna función de la página.
- **Los documentos de verificación** que sube el veterinario se guardan
  de forma privada. Para revisarlos, usá el botón **"Ver docs."** en cada
  solicitud pendiente del panel admin — se abre en una pestaña nueva.

---

## RESUMEN — lo que tenés que hacer, en orden

**En Supabase:**
1. Crear el proyecto.
2. Pegar y ejecutar `supabase/schema.sql` en el SQL Editor.
3. Crear los buckets `avatar` (público) y `verification-documents` (privado) en Storage, y correr `supabase/storage_policies.sql` y `supabase/gallery.sql` en el SQL Editor.
4. Crear tu usuario en Authentication → Users, y correr la línea SQL para hacerlo `admin`.
5. (Opcional) Desactivar "Confirm email" en Authentication → Providers → Email.
6. Copiar tu **Project URL** y tu **anon public key** desde Project Settings → API.

**En el código:**
7. Copiar `.env.example` como `.env` y pegar ahí esos dos datos.

**En Netlify:**
8. Correr `npm install` y `npm run build`.
9. Arrastrar la carpeta `dist` a Netlify (o conectar tu repositorio con esas mismas dos variables cargadas).

¡Listo! Con esos 9 pasos tenés MyVet funcionando de verdad, con tu propia
base de datos y tu propio panel de administración.
