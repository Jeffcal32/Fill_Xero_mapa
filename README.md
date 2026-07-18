# Fill Xero · Landing inmersiva de rutas

Landing de producto para **relieves topográficos 3D de rutas deportivas** (mapa personalizado,
porta medallas y sistema modular). Página estática con una escena 3D interactiva dirigida por
scroll y un formulario de pedido que registra en Google Sheets y cierra por WhatsApp.

## Tecnologías

- **HTML + CSS** con [Tailwind CSS](https://tailwindcss.com/) **compilado a un CSS estático**
  (sin CDN de runtime) — sin framework de JS.
- **[Three.js](https://threejs.org/) r128** — escena 3D del ensamblaje (base → relieve → ruta).
- **[GSAP](https://gsap.com/) + ScrollTrigger** — animación pineada dirigida por scroll.
- **Google Apps Script** — backend del formulario (Sheet + Drive + email). Ver `BACKEND-SETUP.md`.

## Compilar el CSS (Tailwind)

El CSS de Tailwind ya viene compilado en `assets/css/tailwind.css`. Solo hace falta
recompilar si cambias clases en el HTML/JS o la config:

```bash
npm install          # una sola vez
npm run build:css    # genera assets/css/tailwind.css (minificado)
# o, mientras editas:
npm run watch:css
```

La configuración (colores de marca, tipografías, tamaños) está en `tailwind.config.js`.

## Estructura

```
index.html                  Marcado de la página (sin CSS ni JS embebido)
assets/
  css/
    styles.css              Todos los estilos
  js/
    tailwind-config.js      Configuración de Tailwind (colores, tipografías)
    background-shader.js     Fondo animado (rejilla hexagonal WebGL)
    hero.js                  Interacción del producto del hero
    assembly.js              Escena 3D pineada (base → relieve → ruta)
    order-form.js            Modal de pedido → backend → WhatsApp
    ui.js                    Nav activo (scrollspy), reveal de tarjetas, scroll suave
  img/                       Imágenes y logos
  models/                    Modelos 3D usados: base_web.glb, relieve.glb, ruta.glb
BACKEND-SETUP.md            Guía para desplegar el backend (Google Apps Script)
DESIGN.md                   Sistema de diseño / notas de estilo
```

> Los `.stl` crudos de Blender y `models_embedded.js` (bundle base64) están en `.gitignore`:
> no se publican porque el sitio no los necesita (carga los `.glb` por red).

## Correr en local

El sitio carga los modelos `.glb` por red, así que **no funciona abriendo el archivo con
doble clic** (`file://` bloquea esas peticiones). Usa un servidor estático:

```bash
# Python
python -m http.server 8097
# o Node
npx serve .
```

Luego abre `http://localhost:8097/`.

## Backend del formulario

El formulario envía a un Web App de Google Apps Script (la URL está en `assets/js/order-form.js`,
variable `ENDPOINT`). Cada envío agrega una fila a tu Google Sheet, guarda el `.gpx` en Drive y
te manda un correo. Pasos de despliegue en **`BACKEND-SETUP.md`**.

## Notas de seguridad

- **Sin secretos en el repo.** El correo de avisos vive solo en el Apps Script (servidor),
  no en el cliente. La URL del Apps Script es un *endpoint público por diseño* (así se envía
  el formulario): no es una clave, pero cualquiera puede hacerle POST. Mitigaciones incluidas:
  un **honeypot** anti-bots en el formulario. Para mayor protección, se puede añadir una
  verificación server-side en el Apps Script (rechazar si el honeypot viene lleno o exigir un
  token). Ver "Pendientes".
- **Librerías con SRI.** Three.js, GLTFLoader y GSAP se cargan con `integrity` (Subresource
  Integrity): si un CDN fuese alterado, el navegador rechaza el script.

## Pendientes / mejoras para producción

- **Verificación anti-spam server-side** en el Apps Script (complemento del honeypot).
- **Cabeceras de seguridad** (CSP, X-Content-Type-Options, etc.) según el host (Netlify/Vercel
  permiten un archivo de headers).
