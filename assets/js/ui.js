document.addEventListener("DOMContentLoaded", (event) => {
        gsap.registerPlugin(ScrollTrigger);

        // Reveal de tarjetas con IntersectionObserver (independiente de rAF/GSAP)
        const supaCards = document.querySelectorAll('.supa-card');
        if ('IntersectionObserver' in window) {
            const cardObs = new IntersectionObserver((entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('in');
                        cardObs.unobserve(e.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
            supaCards.forEach((c) => cardObs.observe(c));
        } else {
            supaCards.forEach((c) => c.classList.add('in'));
        }

        // Sticky Selector Active State Logic
        // OJO: con threshold:0.5 una seccion mas alta que 2 pantallas (p.ej. Coleccion)
        // nunca llega al 50% visible y el nav se queda pegado en la anterior. Solucion
        // estandar de scrollspy: una linea de deteccion delgada justo bajo el header;
        // la seccion se marca activa apenas esa linea cruza su bounding box, sin
        // importar que tan alta sea la seccion.
        const sections = document.querySelectorAll('.scrolly-section');
        const selectorItems = document.querySelectorAll('.selector-item');
        let sectionObserver = null;

        function buildSectionObserver() {
            if (sectionObserver) sectionObserver.disconnect();
            const hh = document.querySelector('header')?.offsetHeight || 66;
            const bandHeight = 80;   // alto de la "linea" de deteccion, en px
            const bottomMargin = Math.max(window.innerHeight - hh - bandHeight, 0);

            sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        selectorItems.forEach(item => {
                            item.classList.toggle('active', item.getAttribute('data-target') === id);
                        });
                    }
                });
            }, { root: null, rootMargin: `-${hh}px 0px -${bottomMargin}px 0px`, threshold: 0 });

            sections.forEach((section) => sectionObserver.observe(section));
        }
        buildSectionObserver();

        let sectObsResizeT = null;
        window.addEventListener('resize', () => {
            clearTimeout(sectObsResizeT);
            sectObsResizeT = setTimeout(buildSectionObserver, 200);
        });

        // ---- Click to scroll del nav ----
        // Dos casos distintos:
        //  a) Secciones normales: centrar su contenido en el area visible BAJO el header
        //     (si el contenido no cabe, alinearlo justo debajo del header para no cortarlo).
        //  b) Relieve/Ruta: no son secciones, son momentos DENTRO de la escena pineada;
        //     hay que caer en el punto exacto del recorrido del pin (sin restar el header,
        //     porque mientras esta pineado el contenido esta fijo al viewport).
        const headerH = () => (document.querySelector('header')?.offsetHeight || 66);
        const absTop = (el) => el.getBoundingClientRect().top + window.pageYOffset;

        // El timeline del ensamblaje dura 9.4 unidades y el pin recorre PIN_LEN px.
        // Relieve armado + su texto = t~2.6 ; Ruta armada + su texto = t~8.0
        const PIN_LEN = 2450, TL_TOTAL = 9.4;
        const pinPoint = (t) => {
            const scene = document.getElementById('section-assembly');
            return scene ? absTop(scene) + (t / TL_TOTAL) * PIN_LEN : null;
        };

        function sectionTarget(el) {
            const hh = headerH();
            const inner = el.firstElementChild || el;
            const r = inner.getBoundingClientRect();
            const contentTop = r.top + window.pageYOffset;
            const avail = window.innerHeight - hh;
            // Si el contenido cabe, lo centramos en el hueco visible; si no, lo pegamos
            // bajo el header con un respiro.
            return (r.height <= avail - 24)
                ? contentTop - hh - (avail - r.height) / 2
                : contentTop - hh - 24;
        }

        selectorItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetId = item.getAttribute('data-target');
                const el = document.getElementById(targetId);
                let y = null;
                if (el) y = sectionTarget(el);
                else if (targetId === 'section-relief') y = pinPoint(2.6);
                else if (targetId === 'section-route') y = pinPoint(8.0);
                if (y != null) window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: 'smooth' });
            });
        });

    });
