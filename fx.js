/* FX — живые эффекты для сайта KONO
   Прогресс-бар, блик за курсором, 3D-наклон, параллакс при скролле.
   Подключается на всех страницах. Ничего не скрывает (не ломает скриншоты). */
(function(){
  if(window.FX_DONE) return; window.FX_DONE = true;

  /* 1. Прогресс-бар скролла (реагирует на колесо мыши/полосу прокрутки) */
  function scrollbar(){
    if(document.getElementById("scrollbar")) return;
    const sb = document.createElement("div");
    sb.id = "scrollbar";
    document.body.appendChild(sb);
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      sb.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    addEventListener("scroll", on, { passive: true });
    on();
  }

  /* 1b. Тень у шапки после прокрутки */
  function navShadow(){
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const on = () => nav.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", on, { passive: true });
    on();
  }

  /* 2. Блик, следующий за курсором, на карточках */
  function glow(){
    const cards = document.querySelectorAll(
      ".fcard,.atom,.feat,.city,.social-card,.loc-btn,.meme-card,.loc-card,.mitem,.rcard,.why-card,.tcard"
    );
    cards.forEach(c => {
      if (c.classList.contains("glow")) return;
      c.classList.add("glow");
      c.addEventListener("mousemove", e => {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px");
        c.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* 3. Лёгкий 3D-наклон постера за курсором (сохраняем базовый rotate) */
  function tilt(){
    document.querySelectorAll("[data-tilt]").forEach(el => {
      const base = parseFloat(el.dataset.tiltRotate || "0");
      let raf = null;
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          el.style.transition = "transform .12s ease-out";
          el.style.transform =
            "perspective(700px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" +
            (x * 6).toFixed(2) + "deg) rotate(" + base + "deg)";
        });
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform .3s";
        el.style.transform = "rotate(" + base + "deg)";
      });
    });
  }

  /* 4. Параллакс декора при скролле (движется медленнее контента) */
  function parallax(){
    const els = document.querySelectorAll("[data-parallax]");
    if (!els.length) return;
    let ticking = false;
    function update(){
      ticking = false;
      const vh = innerHeight;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const speed = parseFloat(el.dataset.parallax || "0.2");
        const mid = (r.top + r.height / 2) - vh / 2;
        el.style.transform = "translate3d(0," + (mid * speed).toFixed(1) + "px,0)";
      });
    }
    addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  scrollbar(); navShadow(); glow(); tilt(); parallax();
})();
