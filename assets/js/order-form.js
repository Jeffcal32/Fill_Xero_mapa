(function () {
      'use strict';

      // ⚠️ PEGA AQUÍ la URL del Web App de Apps Script (termina en /exec). Mismo patrón
      //    que FillXero-Landing/assets/js/submit.js (ver su BACKEND-SETUP.md).
      var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxv8RSr7iwmY2R_WEMZI3RUtubDgFq-iNUr_SQPJfruoxchm8Gn8bigdUZYji4avYk/exec';
      var PLACEHOLDER = 'PEGA_AQUI_TU_URL_DE_APPS_SCRIPT';
      var WHATSAPP = '573164441971';
      var MAX_EMBED = 4 * 1024 * 1024;   // >4MB no se incrusta (se pide por WhatsApp)

      var modal = document.getElementById('fx-order-modal');
      if (!modal) return;
      var form = document.getElementById('fx-order-form');
      var fileInput = document.getElementById('fx-file');
      var drop = document.getElementById('fx-drop');
      var dropText = document.getElementById('fx-drop-text');
      var errBox = document.getElementById('fx-error');
      var submitBtn = document.getElementById('fx-submit');
      var formWrap = document.getElementById('fx-form-wrap');
      var okWrap = document.getElementById('fx-ok-wrap');
      var okMsg = document.getElementById('fx-ok-msg');
      var lastFocus = null;
      var productoSel = document.getElementById('fx-producto');
      var fileReq = document.getElementById('fx-file-req');
      var fileHint = document.getElementById('fx-file-hint');

      function endpointReady() {
        return ENDPOINT && ENDPOINT !== PLACEHOLDER && /^https:\/\/script\.google\.com\//.test(ENDPOINT);
      }

      // El Medallero no necesita ruta (archivo/enlace); Ruta y Ambos sí.
      function rutaEsObligatoria() {
        var p = productoSel.value;
        return p === 'Ruta' || p === 'Ambos';
      }

      // Refleja en la UI si el archivo/enlace es obligatorio segun el producto elegido.
      function actualizarObligatoriedadRuta() {
        var oblig = rutaEsObligatoria();
        if (fileReq) fileReq.style.visibility = oblig ? 'visible' : 'hidden';
        if (fileHint) {
          fileHint.textContent = oblig
            ? '* Obligatorio para pedidos con Ruta'
            : 'Opcional para Medallero';
        }
      }
      if (productoSel) {
        productoSel.addEventListener('change', actualizarObligatoriedadRuta);
        actualizarObligatoriedadRuta();
      }

      function openModal(producto) {
        lastFocus = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (producto) {
          var sel = document.getElementById('fx-producto');
          for (var i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value === producto) { sel.selectedIndex = i; break; }
          }
        }
        actualizarObligatoriedadRuta();
        var first = document.getElementById('fx-nombre');
        if (first) setTimeout(function () { first.focus(); }, 60);
      }

      function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }

      modal.addEventListener('click', function (e) {
        if (e.target.hasAttribute && e.target.hasAttribute('data-fx-close')) closeModal();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
      });

      // Abrir desde cualquier CTA
      document.querySelectorAll('[data-cta]').forEach(function (btn) {
        btn.addEventListener('click', function () { openModal(btn.getAttribute('data-cta') || ''); });
      });

      // --- Archivo: click, cambio y drag&drop ---
      var chosen = null;
      var VALID = /\.(gpx|kml|tcx)$/i;

      function setFile(f) {
        if (!f) return;
        if (!VALID.test(f.name)) {
          errBox.textContent = 'El archivo debe ser .gpx, .kml o .tcx (lo exportas de Strava, Garmin o Wikiloc).';
          return;
        }
        chosen = f;
        errBox.textContent = '';
        drop.classList.add('has-file');
        dropText.innerHTML = '<strong style="color:#3DDC97">' + f.name + '</strong> · ' + Math.max(1, Math.round(f.size / 1024)) + ' KB';
      }

      fileInput.addEventListener('change', function () { setFile(fileInput.files[0]); });
      ['dragenter', 'dragover'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
      });
      drop.addEventListener('drop', function (e) {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
      });

      function fileToBase64(file) {
        return new Promise(function (res) {
          if (!file) { res(null); return; }
          if (file.size > MAX_EMBED) { res({ tooBig: true, name: file.name, size: file.size }); return; }
          var fr = new FileReader();
          fr.onload = function () { res({ name: file.name, size: file.size, dataUrl: fr.result }); };
          fr.onerror = function () { res({ name: file.name, size: file.size, error: 'read' }); };
          fr.readAsDataURL(file);
        });
      }

      function sendToBackend(payload) {
        if (!endpointReady()) return Promise.resolve('no-endpoint');
        payload.enviado = new Date().toISOString();
        payload.origen = location.href;
        // Apps Script no envía cabeceras CORS -> no-cors + éxito optimista (la Sheet manda)
        return fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) })
          .then(function () { return 'ok'; })
          .catch(function () { return 'error'; });
      }

      function waMessage(d) {
        var L = [];
        L.push('*Nuevo pedido — Fill Xero*');
        L.push('');
        L.push('*Producto:* ' + d.producto);
        L.push('*Ruta/carrera:* ' + d.ruta);
        L.push('*Nombre:* ' + d.nombre);
        L.push('*WhatsApp:* ' + d.whatsapp);
        if (d.email) L.push('*Email:* ' + d.email);
        if (d.archivo) {
          L.push('*Archivo:* ' + d.archivo.name + (d.archivo.tooBig ? ' (pesa >4MB, lo adjunto aquí)' : ' (enviado desde la web)'));
        }
        if (d.link) L.push('*Enlace:* ' + d.link);
        if (d.notas) L.push('*Notas:* ' + d.notas);
        return encodeURIComponent(L.join('\n'));
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        errBox.textContent = '';

        // Honeypot: si un bot llenó el campo trampa, fingimos éxito y NO enviamos.
        var hp = document.getElementById('fx-website');
        if (hp && hp.value) {
          formWrap.hidden = true;
          okWrap.hidden = false;
          return;
        }

        var d = {
          nombre: document.getElementById('fx-nombre').value.trim(),
          whatsapp: document.getElementById('fx-wa').value.trim(),
          email: document.getElementById('fx-email').value.trim(),
          ruta: document.getElementById('fx-ruta').value.trim(),
          producto: document.getElementById('fx-producto').value,
          link: document.getElementById('fx-link').value.trim(),
          notas: document.getElementById('fx-notas').value.trim()
        };

        // Validación: el archivo/enlace solo es obligatorio si el pedido incluye Ruta
        // (Ruta o Ambos). Un pedido de solo Medallero no necesita ninguno de los dos.
        var miss = null;
        if (rutaEsObligatoria() && !chosen && !d.link) miss = { msg: 'Necesitamos tu ruta: sube el archivo o pega el enlace de tu actividad.', el: document.getElementById('fx-link') };
        else if (!d.nombre) miss = { msg: 'Falta tu nombre.', el: document.getElementById('fx-nombre') };
        else if (!d.whatsapp) miss = { msg: 'Falta tu WhatsApp para confirmarte el pedido.', el: document.getElementById('fx-wa') };
        else if (!d.ruta) miss = { msg: 'Dinos el nombre de la ruta o carrera.', el: document.getElementById('fx-ruta') };
        if (miss) {
          errBox.textContent = miss.msg;
          if (miss.el && miss.el.focus) miss.el.focus();
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';

        fileToBase64(chosen).then(function (archivo) {
          d.archivo = archivo;
          return sendToBackend({ type: 'spot-pedido', cliente: d, archivo: archivo });
        }).then(function (res) {
          // Handoff a WhatsApp (el archivo ya quedó en el backend)
          var url = 'https://wa.me/' + WHATSAPP + '?text=' + waMessage(d);
          window.open(url, '_blank', 'noopener');

          formWrap.hidden = true;
          okWrap.hidden = false;
          if (res === 'no-endpoint') {
            okMsg.textContent = d.archivo
              ? 'Te abrimos WhatsApp para confirmar los detalles. (Backend aún sin configurar: adjunta tu archivo en el chat.)'
              : 'Te abrimos WhatsApp para confirmar los detalles.';
          } else if (d.archivo && d.archivo.tooBig) {
            okMsg.textContent = 'Te abrimos WhatsApp. Tu archivo pesa más de 4MB: adjúntalo en el chat, por favor.';
          } else {
            okMsg.textContent = 'Recibimos tu ruta. Te abrimos WhatsApp para confirmar los detalles.';
          }
        }).catch(function () {
          errBox.textContent = 'No pudimos enviar el pedido. Intenta de nuevo o escríbenos por WhatsApp.';
        }).then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar y continuar en WhatsApp';
        });
      });

      window.FXOrder = { open: openModal, close: closeModal };
    })();
