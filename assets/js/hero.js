(function() {
      const heroImg = document.getElementById('hero-img');
      if (!heroImg) return;

      // Flotacion sutil permanente
      gsap.to(heroImg, { y: -14, duration: 3.2, yoyo: true, repeat: -1, ease: "sine.inOut" });

      // Tilt con el mouse (proyeccion desde arriba: se aprecia la cara superior)
      const rx = gsap.quickTo(heroImg, "rotationX", { duration: 0.8, ease: "power3.out" });
      const ry = gsap.quickTo(heroImg, "rotationY", { duration: 0.8, ease: "power3.out" });
      gsap.set(heroImg, { transformPerspective: 1200 });

      window.addEventListener('mousemove', (e) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        ry(nx * 10);
        rx(6 - ny * 8);
      });

      // Tilt suave en las fotos de las tarjetas de seccion
      document.querySelectorAll('.tilt-card').forEach((card) => {
        const cx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power2.out" });
        const cy = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power2.out" });
        gsap.set(card, { transformPerspective: 900 });
        card.parentElement.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          cy(((e.clientX - r.left) / r.width - 0.5) * 12);
          cx(-((e.clientY - r.top) / r.height - 0.5) * 12);
        });
        card.parentElement.addEventListener('mouseleave', () => { cx(0); cy(0); });
      });
    })();
