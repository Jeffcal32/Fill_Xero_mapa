(function() {
      const section = document.getElementById('section-assembly');
      const container = document.getElementById('assembly-3d');
      if (!section || !container) return;

      function showFallback() { section.classList.add('no-3d'); }

      // Sin THREE: paneles estaticos con imagen. (El 3D SI corre en movil.)
      if (!window.THREE) { showFallback(); return; }
      if (window.gsap) gsap.registerPlugin(ScrollTrigger);

      const isPhone = () => window.innerWidth < 768;
      // iOS cambia la altura al ocultar la barra de direcciones: sin esto el pin da saltos
      if (window.ScrollTrigger) ScrollTrigger.config({ ignoreMobileResize: true });

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
      } catch (e) { showFallback(); return; }

      function size() {
        return { w: container.clientWidth || window.innerWidth, h: container.clientHeight || window.innerHeight };
      }
      let dim = size();
      renderer.setSize(dim.w, dim.h);
      // En movil el DPR es 2-3: capar a 1 ahorra muchisimo relleno de pixeles
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isPhone() ? 1 : 1.5));
      renderer.outputEncoding = THREE.sRGBEncoding;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, dim.w / dim.h, 0.1, 3000);

      // Encuadre adaptativo: en vertical el campo horizontal se estrecha muchisimo y el
      // modelo (~150 u de ancho) no cabe con la distancia de escritorio -> alejamos la
      // camara lo justo para que quepa. En pantallas anchas se mantiene el encuadre de
      // siempre gracias al minimo de 353 (= la distancia original 0,150,320).
      const FIT_W = 190;
      function placeCamera() {
        camera.aspect = dim.w / dim.h;
        const vFov = camera.fov * Math.PI / 180;
        const halfVisibleW = Math.tan(vFov / 2) * camera.aspect;   // por unidad de distancia
        const dist = Math.max((FIT_W / 2) / halfVisibleW, 353);
        camera.position.set(0, dist * 0.425, dist * 0.906);        // mismo angulo elevado
        // en vertical miramos mas abajo para dejar el modelo arriba y el texto libre abajo
        camera.lookAt(0, isPhone() ? -34 : 10, 0);
        camera.updateProjectionMatrix();
      }
      placeCamera();

      scene.add(new THREE.AmbientLight(0xffffff, 0.75));
      const sun = new THREE.DirectionalLight(0xffffff, 0.9);
      sun.position.set(150, 300, 200);
      scene.add(sun);
      const lime = new THREE.PointLight(0xD4FF45, 0.5, 800);
      lime.position.set(-80, 60, 180);
      scene.add(lime);

      // root: posicion horizontal + tilt de mouse. terreno: subgrupo sobre la base.
      const root = new THREE.Group();
      root.scale.setScalar(1.28);
      scene.add(root);
      const RELIEF_SEAT = 3;
      const terrainGroup = new THREE.Group();
      terrainGroup.position.y = RELIEF_SEAT;
      root.add(terrainGroup);

      const loader = new THREE.GLTFLoader();
      const parts = {};
      const mats = { base: [], relieve: [], ruta: [] };
      let loaded = 0;

      const COLORS = {
        // base mas clara que el fondo (#0A0A0A) para que lea solida y no "transparente"
        base:    { color: 0x2b2d34, roughness: 0.55, metalness: 0.2 },
        relieve: { color: 0x687244, roughness: 0.92, metalness: 0.0 },
        ruta:    { color: 0xd9451f, roughness: 0.5, metalness: 0.0 }
      };

      function add(name, file, parent) {
        function onLoad(g) {
          const obj = g.scene;
          const spec = COLORS[name];
          obj.traverse((n) => {
            if (n.isMesh) {
              if (!n.geometry.attributes.normal) n.geometry.computeVertexNormals();
              const m = new THREE.MeshStandardMaterial({
                color: new THREE.Color(spec.color).convertSRGBToLinear(),
                roughness: spec.roughness,
                metalness: spec.metalness
              });
              n.material = m;
              mats[name].push(m);
            }
          });
          parts[name] = obj;
          parent.add(obj);
          loaded++;
          if (loaded === 3) initScrolly();
        }
        function fail() { showFallback(); }

        // Modelos incrustados (funciona con file://); si no, se piden por red
        if (window.FX_MODELS && window.FX_MODELS[name]) {
          const bin = atob(window.FX_MODELS[name]);
          const buf = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
          loader.parse(buf.buffer, '', onLoad, fail);
        } else {
          loader.load('assets/models/' + file, onLoad, undefined, fail);
        }
      }
      add('base', 'base_web.glb', root);
      add('relieve', 'relieve.glb', terrainGroup);
      add('ruta', 'ruta.glb', terrainGroup);

      // En vertical no hay sitio para texto al lado: el modelo se queda centrado y el
      // relevo entre pasos lo lleva el cruce de textos. En desktop si se desplaza.
      let LEFT_X = -110, RIGHT_X = 110;
      function layout() {
        if (isPhone()) { LEFT_X = 0; RIGHT_X = 0; }
        else { LEFT_X = -110; RIGHT_X = 110; }
      }
      layout();

      const navItems = document.querySelectorAll('.selector-item');
      function setNav(id) {
        navItems.forEach((i) => i.classList.toggle('active', i.getAttribute('data-target') === id));
      }

      function initScrolly() {
        // Estado inicial: base y relieve arriba; ruta invisible (fade suave luego)
        gsap.set(parts.base.position, { y: 220 });
        gsap.set(parts.relieve.position, { y: 300 });
        gsap.set(parts.ruta.position, { y: 34 });
        mats.ruta.forEach((m) => { m.transparent = true; m.opacity = 0; m.depthWrite = true; });
        root.position.x = LEFT_X;
        gsap.set('.astep', { autoAlpha: 0 });
        window.__fxLayout = layout;   // lo usa el resize para recalcular al girar el movil

        const hold = { v: 0 };

        // Visibilidad de los textos: NO se anima dentro de los timelines con scrub
        // (eso fue la causa del bug "se ven los dos textos"). Cada timeline con scrub
        // tiene su propio suavizado/retraso; al scrollear muy rapido o revertir de
        // golpe, los dos suavizados (entrada y pin) se desincronizan un instante y
        // ambos textos quedan a medio aparecer/desaparecer AL MISMO TIEMPO.
        // Fix: la opacidad se calcula siempre a partir del progreso REAL del scroll
        // (self.progress, inmediato, sin retraso) y se aplica con gsap.set (instantaneo),
        // asi es matematicamente imposible que ambos textos queden visibles a la vez.
        const clamp01 = (v) => Math.max(0, Math.min(1, v));
        const MASTER_DUR = 7.7;   // duracion total interna del timeline del pin (ver mas abajo)

        function setRelieveOpacity(v) { gsap.set('.astep-relieve', { autoAlpha: v }); }
        function setRutaOpacity(v) { gsap.set('.astep-ruta', { autoAlpha: v }); }

        // FASE 1 — ENTRADA (sin pin): mientras la seccion sube a la pantalla, la base
        // cae y aparece el texto del Paso 1. Asi, apenas la seccion llena la pantalla,
        // YA hay contenido y no queda esa zona vacia que parecia "fin de pagina".
        gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '#section-assembly',
            start: 'top bottom',   // desde que asoma por abajo
            end: 'top top',        // hasta quedar alineada arriba (justo antes del pin)
            scrub: 1,
            onUpdate: (self) => {
              // el texto empieza a aparecer solo en la segunda mitad de la entrada
              setRelieveOpacity(clamp01((self.progress - 0.45) / 0.55));
            }
          }
        })
          .to(parts.base.position, { y: 0, ease: 'power2.out' }, 0);

        // FASE 2 — PIN (armado): la seccion se bloquea y la rueda arma el resto:
        // el relieve se ensambla, transicion, y la ruta corona con fade suave.
        const master = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '#section-assembly',
            start: 'top top',
            end: '+=2000',
            pin: '.assembly-pin',
            pinSpacing: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: () => { layout(); },
            onUpdate: (self) => {
              setNav(self.progress < 0.45 ? 'section-relief' : 'section-route');
              // Opacidad de los dos textos calculada directo del progreso real
              // (self.progress), NO del timeline con scrub -> sin retraso, sin cruce.
              const t = self.progress * MASTER_DUR;
              setRelieveOpacity(1 - clamp01((t - 2.5) / 0.5));   // 1 hasta 2.5, fade-out 2.5->3.0
              setRutaOpacity(clamp01((t - 3.5) / 0.6));          // 0 hasta 3.5, fade-in 3.5->4.1
            },
            onLeave: () => setNav('section-route'),
            onLeaveBack: () => setNav('section-hero')
          }
        });

        master
          // el terreno se ensambla sobre la base (que ya cayo en la fase de entrada)
          .to(parts.relieve.position, { y: 0, duration: 1.3, ease: 'power2.out' }, 0.0)
          // (hueco 1.3 -> 2.5 = lectura del paso 1, todo quieto)
          // TRANSICION: el modelo se desliza a la derecha (el cruce de textos lo maneja el onUpdate de arriba)
          .fromTo(root.position, { x: () => LEFT_X }, { x: () => RIGHT_X, duration: 1.3, ease: 'power2.inOut' }, 2.6)
          // ESTADO RUTA: la ruta aparece con FADE-IN suave + asentamiento (sin brinco)
          .to(mats.ruta, { opacity: 1, duration: 1.9, ease: 'power1.inOut' }, 4.0)
          .fromTo(parts.ruta.position, { y: 34 }, { y: 0, duration: 1.9, ease: 'power2.out' }, 4.0)
          // (hold final = lectura del paso 2 con todo armado)
          .to(hold, { v: 1, duration: 1.8 }, 5.9);
      }

      // Interaccion: tilt suave con el mouse (sin giro automatico)
      let mx = 0, my = 0;
      window.addEventListener('mousemove', (e) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      });

      // Re-encuadre al girar el movil / cambiar de tamaño. En iOS el evento tambien salta
      // al ocultarse la barra: reajustamos render y camara, y refrescamos el pin.
      let rzT = null;
      function onResize() {
        clearTimeout(rzT);
        rzT = setTimeout(() => {
          dim = size();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, isPhone() ? 1 : 1.5));
          renderer.setSize(dim.w, dim.h);
          layout();
          placeCamera();
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        }, 150);
      }
      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', onResize);

      // Giro continuo sobre su propio eje + tilt del mouse encima (en tactil solo gira).
      let spin = 0;
      const SPIN_SPEED = 0.005;   // rad/frame (~17°/s ≈ una vuelta cada ~21s); subir para girar mas rapido
      function animate() {
        requestAnimationFrame(animate);
        spin += SPIN_SPEED;
        root.rotation.y += ((spin + mx * 0.30) - root.rotation.y) * 0.06;
        root.rotation.x += ((0.04 + my * 0.10) - root.rotation.x) * 0.06;
        renderer.render(scene, camera);
      }
      animate();
      window._fxAssembly = { renderer, scene, camera, root, parts, mats };
    })();
