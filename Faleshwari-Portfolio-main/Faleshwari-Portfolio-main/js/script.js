/* ==========================================================
   FALESHWARI SONI — MAIN SCRIPT
   ========================================================== */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const body = document.body;

/* ---------- 1. Opening screen (counter 0 → 100, then reveal) ---------- */
(function intro() {
  const preloader = document.querySelector(".preloader");
  const counter = document.getElementById("count");
  if (!preloader || !counter) return;

  function finish() {
    body.classList.add("is-loaded");
    body.classList.remove("is-locked");
    setTimeout(() => preloader.remove(), 1400);
  }

  if (prefersReducedMotion) { finish(); return; }

  body.classList.add("is-locked");           // stop scrolling while loading
  const duration = 1800;                      // milliseconds
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    counter.textContent = Math.round(progress * 100);
    if (progress < 1) requestAnimationFrame(tick);
    else setTimeout(finish, 250);
  }
  requestAnimationFrame(tick);
})();

/* ---------- 2. Mobile menu ---------- */
(function menu() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    body.classList.toggle("is-locked", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  nav.querySelectorAll(".nav__links a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
})();

/* ---------- 3. Hide nav when scrolling down, show when scrolling up ---------- */
(function navHide() {
  const nav = document.getElementById("nav");
  let lastY = window.scrollY;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (nav.classList.contains("is-open")) return;
    nav.classList.toggle("is-hidden", y > lastY && y > 120);
    lastY = y;
  }, { passive: true });
})();

/* ---------- 4. Hero glow follows the mouse (desktop only) ---------- */
(function parallax() {
  if (prefersReducedMotion || !window.matchMedia("(hover: hover)").matches) return;
  const orbs = document.querySelectorAll(".orb");
  window.addEventListener("mousemove", e => {
    const x = (e.clientX / window.innerWidth - 0.5);
    const y = (e.clientY / window.innerHeight - 0.5);
    orbs.forEach((orb, i) => {
      const depth = i === 0 ? 60 : -40;
      orb.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  });
})();   

/* ---------- 5. Reveal sections as you scroll down ---------- */
(function scrollReveal() {
    const items = document.querySelectorAll(".fade, [data-split]");
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    items.forEach(el => el.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  items.forEach(el => observer.observe(el));
})();

/* ---------- 6. Footer: current year ---------- */
(function year() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

/* ---------- 7. Word-by-word headings (any element with data-split) ---------- */
(function splitWords() {
  let count = 0;
  function split(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {                       // plain text
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span");
          w.className = "w";
          const inner = document.createElement("span");
          inner.style.setProperty("--i", count++);
          inner.textContent = part;
          w.appendChild(inner);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        split(child);                                   // keep styled words (like the lime one)
      }
    });
  }
  document.querySelectorAll("[data-split]").forEach(el => {
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    count = 0;
    split(el);
  });
})();

/* ---------- 8. Scroll progress line ---------- */
(function progress() {
  const bar = document.createElement("div");
  bar.className = "progress";
  bar.setAttribute("aria-hidden", "true");
  body.appendChild(bar);

  let ticking = false;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

/* ---------- 9. Follower ring (only for desktop mouse, never on phones) ---------- */
(function cursorRing() {
  if (prefersReducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const ring = document.createElement("div");
  ring.className = "cursor";
  ring.setAttribute("aria-hidden", "true");
  ring.innerHTML = '<span class="cursor__ring"><span class="cursor__label"></span></span>';
  body.appendChild(ring);
  const label = ring.querySelector(".cursor__label");

  let x = window.innerWidth / 2, y = window.innerHeight / 2, rx = x, ry = y;

  window.addEventListener("mousemove", e => {
    x = e.clientX; y = e.clientY;
    ring.classList.add("is-visible");
  });
  document.addEventListener("mouseleave", () => ring.classList.remove("is-visible"));

  document.addEventListener("mouseover", e => {
    const card = e.target.closest(".work");
    ring.classList.toggle("is-view", !!card);
    ring.classList.toggle("is-link", !!e.target.closest("a, button, .work"));
    label.textContent = card ? "View" : "";
  });

  (function loop() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  })();
})();