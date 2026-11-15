/* Home page: polaroid stack, film strip, photo + project dialogs. */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const placeholder = (tall) => el("div", "placeholder-photo" + (tall ? " placeholder-photo--tall" : ""), "Photo coming soon");

  /* ---------- Polaroid stack ---------- */
  function initStack(photos) {
    const stack = document.getElementById("stack");
    const toggle = document.getElementById("stack-toggle");
    const rots = [-2.5, 2, -0.5, 1.5, -1.5, 2.5];
    // Only the top three cards show; the rest wait, invisible, under the third.
    const offs = [[0, 0], [14, 8], [-12, 14]];
    // The headshot always leads the stack; it's not a travel photo, so it never
    // appears in the film strip or on photographs.html.
    const headshot = { src: "assets/site/headshot.png", noCaption: true };
    const items = [headshot, ...(photos.length ? photos.slice(0, STACK_PHOTOS) : [null, null])];
    const n = items.length;
    const realCount = items.filter(Boolean).length;

    const cards = items.map((p) => {
      const fig = el("figure", "polaroid");
      fig.setAttribute("aria-hidden", "true");
      if (p) {
        const img = el("img");
        img.src = p.src;
        img.alt = "";
        fig.append(img);
      } else {
        fig.append(placeholder(false));
      }
      if (!(p && p.noCaption)) {
        const cap = el("figcaption");
        cap.append(el("span", "caption-place", p ? p.location : "On the road"), el("span", "caption-date", p ? p.date : "—"));
        fig.append(cap);
      }
      stack.insertBefore(fig, toggle);
      return fig;
    });

    let tick = 0;
    let paused = reduceMotion;

    function layout(flingIndex) {
      cards.forEach((card, i) => {
        const k = (((i - tick) % n) + n) % n;
        const out = i === flingIndex;
        const [x, y] = out ? [200, -30] : offs[Math.min(k, offs.length - 1)];
        const rot = out ? rots[i % rots.length] + 14 : rots[i % rots.length];
        card.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
        card.style.opacity = !out && k >= offs.length ? "0" : "";
        card.style.zIndex = String(n - k);
      });
    }
    layout(-1);

    // Only rotate once there's at least one travel photo to cycle to.
    if (realCount < 2) return;

    function renderToggle() {
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", paused ? "Play polaroid slideshow" : "Pause polaroid slideshow");
      toggle.firstElementChild.textContent = paused ? "▸ PAUSED · CLICK TO PLAY" : "|| CLICK TO PAUSE";
    }
    toggle.hidden = false;
    renderToggle();
    toggle.addEventListener("click", () => {
      paused = !paused;
      renderToggle();
    });

    setInterval(() => {
      if (paused || document.hidden) return;
      const top = ((tick % n) + n) % n; // card currently on top
      layout(top);
      setTimeout(() => {
        tick += 1;
        layout(-1);
      }, 450);
    }, 2600);
  }

  /* ---------- Film strip ---------- */
  function initStrip(photos, dialog, total) {
    const strip = document.getElementById("strip");
    const frames = document.getElementById("strip-frames");
    const hint = document.getElementById("strip-hint");
    const empty = photos.length === 0;
    const items = empty ? Array.from({ length: 6 }, () => null) : photos;
    let suppressClick = false;

    items.forEach((p, i) => {
      const fig = el("figure", "frame");
      const btn = el("button");
      btn.type = "button";
      if (p) {
        btn.setAttribute("aria-label", `Photograph ${p.num}: ${p.alt}. Open details`);
        const img = el("img");
        img.src = p.src;
        img.alt = "";
        img.loading = "lazy";
        img.draggable = false;
        btn.append(img);
        btn.addEventListener("click", () => {
          if (suppressClick) {
            suppressClick = false;
            return;
          }
          dialog.open(photos, i);
        });
      } else {
        btn.disabled = true;
        btn.setAttribute("aria-label", "Photo coming soon");
        btn.append(placeholder(true));
      }
      const cap = el("figcaption");
      cap.append(el("span", null, `▸ ${p ? p.num : String(i + 1).padStart(2, "0")}`), el("span", null, p ? p.location : "Coming soon"));
      fig.append(btn, cap);
      frames.append(fig);
    });

    if (empty) {
      hint.textContent = "▸ photographs coming soon";
    } else {
      const of = total > photos.length ? ` of ${total}` : "";
      hint.textContent = `▸ ${photos.length}${of} · drag the strip, click a photo for details →`;
    }

    // Mouse drag-to-scroll (touch already scrolls natively).
    let drag = null;
    strip.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: strip.scrollLeft, moved: 0, id: e.pointerId };
    });
    strip.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (drag.moved <= 6 && Math.abs(dx) > 6) {
        strip.classList.add("is-dragging");
        try { strip.setPointerCapture(drag.id); } catch (err) { /* ignore */ }
      }
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      strip.scrollLeft = drag.left - dx;
    });
    const end = () => {
      if (!drag) return;
      suppressClick = drag.moved > 6;
      drag = null;
      strip.classList.remove("is-dragging");
    };
    strip.addEventListener("pointerup", end);
    strip.addEventListener("pointercancel", end);
    // A drag that ends outside any frame shouldn't swallow the next real click.
    strip.addEventListener("click", () => setTimeout(() => (suppressClick = false)), true);
  }

  /* ---------- Experience: expand / collapse each entry ---------- */
  function initExperience() {
    document.querySelectorAll(".job").forEach((job, i) => {
      const list = job.querySelector(".job__list");
      const role = job.querySelector(".job__role");
      if (!list || !role) return;
      const company = job.querySelector("h3").textContent.trim();
      list.id = list.id || `job-list-${i + 1}`;

      const btn = el("button", "job__toggle");
      btn.type = "button";
      btn.setAttribute("aria-controls", list.id);
      const icon = el("span", "job__toggle-icon");
      icon.setAttribute("aria-hidden", "true");
      const label = el("span");
      btn.append(icon, label);
      role.after(btn);

      const set = (open) => {
        list.hidden = !open;
        job.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
        btn.setAttribute("aria-label", `${open ? "Hide" : "Show"} ${company} details`);
        label.textContent = open ? "Hide details" : "Show details";
      };
      // Most recent role starts open; earlier roles start collapsed.
      set(i === 0);
      btn.addEventListener("click", () => set(list.hidden));
    });
  }

  /* ---------- Project dialogs (one per project, each with a screenshot carousel) ---------- */
  function initProjectDialog(dialog) {
    const slides = Array.from(dialog.querySelectorAll("[data-slide]"));
    const dotsWrap = dialog.querySelector("[data-dots]");
    const prev = dialog.querySelector("[data-slide-prev]");
    const next = dialog.querySelector("[data-slide-next]");
    const n = slides.length;
    let si = 0;

    const dots = slides.map((s, i) => {
      const b = el("button");
      b.type = "button";
      b.setAttribute("aria-label", `Show screenshot ${i + 1}`);
      b.append(el("span"));
      b.addEventListener("click", () => go(i));
      dotsWrap.append(b);
      return b;
    });
    // A single screenshot needs no arrows or dots.
    if (n < 2) {
      prev.hidden = true;
      next.hidden = true;
      dotsWrap.hidden = true;
    }

    function go(i) {
      si = (i + n) % n;
      slides.forEach((s, j) => {
        s.hidden = j !== si;
        const num = s.querySelector("[data-slide-num]");
        if (num) num.textContent = `▸ ${j + 1} / ${n}`;
      });
      dots.forEach((d, j) => d.setAttribute("aria-current", String(j === si)));
    }
    go(0);

    prev.addEventListener("click", () => go(si - 1));
    next.addEventListener("click", () => go(si + 1));
    dialog.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => dialog.close()));
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("keydown", (e) => {
      if (n < 2) return;
      if (e.key === "ArrowLeft") go(si - 1);
      if (e.key === "ArrowRight") go(si + 1);
    });

    return () => {
      go(0);
      dialog.showModal();
    };
  }

  function initProjects() {
    document.querySelectorAll("[data-opens]").forEach((btn) => {
      const dialog = document.getElementById(btn.dataset.opens);
      if (!dialog) return;
      const open = initProjectDialog(dialog);
      btn.addEventListener("click", open);
    });

    // Projects carousel: a scroll-snap track with arrows and dots.
    const track = document.getElementById("project-track");
    const cards = Array.from(track.children);
    const section = track.closest("section");
    const prev = section.querySelector("[data-track-prev]");
    const next = section.querySelector("[data-track-next]");
    const dotsWrap = section.querySelector("[data-track-dots]");

    const current = () => {
      const left = track.scrollLeft;
      let best = 0;
      cards.forEach((c, i) => {
        if (Math.abs(c.offsetLeft - track.offsetLeft - left) < Math.abs(cards[best].offsetLeft - track.offsetLeft - left)) best = i;
      });
      return best;
    };
    const go = (i) => {
      const idx = Math.max(0, Math.min(cards.length - 1, i));
      track.scrollTo({ left: cards[idx].offsetLeft - track.offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    };

    const dots = cards.map((c, i) => {
      const b = el("button");
      b.type = "button";
      b.setAttribute("aria-label", `Show project ${i + 1}`);
      b.append(el("span"));
      b.addEventListener("click", () => go(i));
      dotsWrap.append(b);
      return b;
    });

    function update() {
      const ci = current();
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      dots.forEach((d, j) => d.setAttribute("aria-current", String(j === ci)));
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = atEnd;
    }
    prev.addEventListener("click", () => go(current() - 1));
    next.addEventListener("click", () => go(current() + 1));
    track.addEventListener("keydown", (e) => {
      if (e.target !== track) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); go(current() - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(current() + 1); }
    });
    let raf = 0;
    track.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    });
    window.addEventListener("resize", update);
    update();
  }

  // Fisher–Yates shuffle into a new array, so each page load shows a fresh mix.
  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const STACK_PHOTOS = 5; // travel photos that rotate behind the headshot
  const STRIP_COUNT = 12;

  initExperience();
  initProjects();
  const photoDialog = Photos.createPhotoDialog(document.getElementById("photo-dialog"));
  Photos.loadPhotos().then((photos) => {
    const mixed = shuffle(photos);
    initStack(mixed.slice(0, STACK_PHOTOS));
    // Frame numbers follow the strip's order, so the strip and its dialog read 01, 02, 03, ...
    // The strip skips the polaroid photos when there are enough to go around.
    const rest = mixed.length >= STRIP_COUNT + STACK_PHOTOS ? mixed.slice(STACK_PHOTOS) : mixed;
    const strip = rest.slice(0, STRIP_COUNT).map((p, i) => ({ ...p, num: String(i + 1).padStart(2, "0") }));
    initStrip(strip, photoDialog, photos.length);
  });
})();
