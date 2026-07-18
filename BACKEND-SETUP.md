# Fill Xero · Backend de pedidos (Google Apps Script → Google Sheet + Drive + Email)

El formulario ya está 100% cableado. Solo falta que **despliegues tu Web App** (unos 5 min)
y me pases **una URL** para pegarla en el sitio. A partir de ahí, **cada vez que alguien
envíe el formulario se agrega una fila a tu Google Sheet**, el archivo `.gpx` se guarda en
tu Google Drive (con enlace en la hoja) y te llega un correo de aviso.

> Mientras no esté la URL, el formulario sigue funcionando: valida, abre WhatsApp con el
> resumen y muestra el éxito — solo que **no registra la fila** todavía.

---

## Paso 1 — Crea la hoja y abre el editor
1. Entra a **[sheets.new](https://sheets.new)** (crea una Google Sheet en blanco).
   Llámala, por ejemplo, **“Fill Xero · Pedidos de rutas”**.
2. En esa hoja: menú **Extensiones → Apps Script**. Se abre el editor de código.

## Paso 2 — Pega este código
Borra todo lo que haya en `Code.gs` y pega **esto tal cual**:

```javascript
// ==== CONFIG ====
var EMAIL_AVISOS   = 'jeffreycalderon40@gmail.com';   // a dónde llegan los avisos
var NOMBRE_HOJA    = 'Pedidos';
var CARPETA_DRIVE  = 'Fill Xero · rutas recibidas';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var c = data.cliente || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(NOMBRE_HOJA) || ss.insertSheet(NOMBRE_HOJA);

    // Guardar el archivo de ruta en Drive (si vino y no es demasiado grande)
    var archivoCell = '';
    var a = data.archivo;
    if (a && a.dataUrl)      archivoCell = guardarArchivo_(a);
    else if (a && a.tooBig)  archivoCell = '(archivo >4MB — lo envía por WhatsApp: ' + a.name + ')';

    var headers = ['Fecha', 'Nombre', 'WhatsApp', 'Email', 'Producto',
                   'Ruta / Carrera', 'Archivo', 'Enlace actividad', 'Notas', 'Origen'];
    var fila = [
      new Date(), c.nombre || '', c.whatsapp || '', c.email || '', c.producto || '',
      c.ruta || '', archivoCell, c.link || '', c.notas || '', data.origen || ''
    ];

    if (sh.getLastRow() === 0) sh.appendRow(headers);
    sh.appendRow(fila);

    var resumen =
      'NUEVO PEDIDO — Fill Xero\n\n' +
      'Producto: '      + (c.producto || '') + '\n' +
      'Ruta / Carrera: '+ (c.ruta || '')     + '\n' +
      'Nombre: '        + (c.nombre || '')   + '\n' +
      'WhatsApp: '      + (c.whatsapp || '')  + '\n' +
      (c.email ? 'Email: '   + c.email       + '\n' : '') +
      (archivoCell ? 'Archivo: ' + archivoCell + '\n' : '') +
      (c.link  ? 'Enlace: '  + c.link         + '\n' : '') +
      (c.notas ? 'Notas: '   + c.notas        + '\n' : '');
    MailApp.sendEmail(EMAIL_AVISOS, 'Fill Xero · nuevo pedido de ' + (c.nombre || 'cliente'), resumen);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function guardarArchivo_(a) {
  var it = DriveApp.getFoldersByName(CARPETA_DRIVE);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA_DRIVE);
  var partes = a.dataUrl.split(',');                     // data:mime;base64,XXXX
  var mime = partes[0].substring(partes[0].indexOf(':') + 1, partes[0].indexOf(';')) || 'application/octet-stream';
  var blob = Utilities.newBlob(Utilities.base64Decode(partes[1]), mime, a.name || 'ruta.gpx');
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Paso 3 — Despliega como Web App
1. Botón **Implementar → Nueva implementación**.
2. Engranaje ⚙ (junto a "Seleccionar tipo") → **Aplicación web**.
3. **Ejecutar como:** *Yo (tu cuenta)*.
4. **Quién tiene acceso:** **Cualquier persona**.  ← importante, si no, no recibe los envíos.
5. **Implementar** → te pide autorizar permisos (Sheets, Drive, Gmail): acepta todo
   (si aparece "Google no verificó esta app", entra en *Configuración avanzada → Ir a … (no seguro)*
   — es tu propio script, es seguro).
6. Copia la **URL del Web App**. Termina en **`/exec`**, algo como:
   `https://script.google.com/macros/s/AKfy……/exec`

## Paso 4 — Pásame esa URL
Mándame la URL (la que termina en `/exec`) y yo la pego en el sitio. Con eso queda conectado.
Después probamos enviando el formulario: debería aparecer una fila nueva en la pestaña
**Pedidos** y llegarte el correo.

---

## Notas
- **Columnas de la hoja:** Fecha · Nombre · WhatsApp · Email · Producto · Ruta/Carrera ·
  Archivo (enlace de Drive al `.gpx`) · Enlace de la actividad · Notas · Origen.
- **Archivo:** se guarda en Drive solo si pesa **≤ 4 MB** (los `.gpx` normales pesan pocos KB).
  Más grande → se anota el nombre y el cliente lo manda por WhatsApp.
- **Archivo O enlace:** el cliente puede subir el `.gpx` **o** pegar el link de Garmin/Strava.
  Ambos quedan registrados en su columna.
- **CORS:** el envío usa `mode:'no-cors'` (Apps Script no expone cabeceras CORS), por eso el
  sitio no "lee" la respuesta; asume enviado si la petición sale. **Tu Sheet es la fuente de
  verdad.** Si un envío no aparece, revisa que la URL sea correcta y el acceso *Cualquier persona*.
- **Cambiar algo después:** si editas el código en Apps Script, tienes que volver a
  **Implementar → Gestionar implementaciones → editar (lápiz) → Nueva versión** para que
  los cambios tomen efecto (la URL se mantiene).
- **Cuota de correo:** ~100 correos/día gratis (de sobra).
