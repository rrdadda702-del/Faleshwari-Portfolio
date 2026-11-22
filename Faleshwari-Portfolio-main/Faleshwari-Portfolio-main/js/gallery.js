/* ==========================================================
   GALLERY — builds the project grid, filters and preview window.
   You do NOT need to edit this file. Edit js/projects.js instead.
   ========================================================== */
(function gallery() {
  const grid = document.getElementById("gallery");
  const filterBox = document.getElementById("filters");
  const box = document.getElementById("lightbox");
  if (!grid || !filterBox || !box || typeof PROJECTS === "undefined") return;

  const body = document.body;
  const lbMedia = document.getElementById("lbMedia");
  const lbCat = document.getElementById("lbCat");
  const lbTitle = document.getElementById("lbTitle");
  const lbDesc = document.getElementById("lbDesc");
  const lbCount = document.getElementById("lbCount");
  const closeBtn = box.querySelector(".lightbox__close");

  /* Small helper: make an element with a class and text */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  /* Placeholder artwork (shown when there is no image) */
  function makePlaceholder(project, index) {
    const ph = el("div", "ph ph--" + (index % 4));
    ph.appendChild(el("span", "ph__tag", "Sample — " + project.category));
    ph.appendChild(el("span", "ph__title", project.title.replace(/^Sample /, "")));
    return ph;
  }

  /* Image if we have one, otherwise placeholder */
  function makeMedia(project, index) {
    if (!project.image) return makePlaceholder(project, index);
    const img = document.createElement("img");
    img.src = project.image;
    img.alt = project.title + " — " + project.category;
    img.loading = "lazy";
    img.addEventListener("error", () => img.replaceWith(makePlaceholder(project, index)));
    return img;
  }

  /* ---------- Build the cards ---------- */
  const items = PROJECTS.map((p, i) => {
    const card = el("button", "work fade work--" + (p.size || "square"));
    card.type = "button";
    card.dataset.category = p.category;
    card.setAttribute("aria-label", "Open " + p.title);

    const media = el("div", "work__media");
    media.appendChild(makeMedia(p, i));
    card.appendChild(media);

    // Title bar for real images (sample placeholders already show their own text)
    if (p.image) {
      const cap = el("div", "work__cap");
      cap.appendChild(el("span", "work__title", p.title));
      cap.appendChild(el("span", "work__cat", p.category));
      card.appendChild(cap);
    }

    card.addEventListener("click", () => openBox(i));
    grid.appendChild(card);
    return card;
  });

  /* Show the "sample" note only if some projects have no image */
  const note = document.getElementById("sampleNote");
  if (note && PROJECTS.some(p => !p.image)) note.hidden = false;

  /* ---------- Filters ---------- */
  let visible = PROJECTS.map((_, i) => i);   // indexes currently shown
  const categories = ["All", ...new Set(PROJECTS.map(p => p.category))];

  categories.forEach((cat, n) => {
    const chip = el("button", "chip", cat);
    chip.type = "button";
    chip.setAttribute("aria-pressed", n === 0 ? "true" : "false");
    chip.addEventListener("click", () => {
      filterBox.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", "true");
      applyFilter(cat);
    });
    filterBox.appendChild(chip);
  });

  function applyFilter(cat) {
    visible = [];
    items.forEach((card, i) => {
      const show = cat === "All" || PROJECTS[i].category === cat;
      card.hidden = !show;
      if (show) visible.push(i);
    });
    // replay the reveal animation on the cards that are now shown
    visible.forEach((idx, n) => {
      const card = items[idx];
      card.classList.remove("in-view");
      card.style.setProperty("--d", (n * 0.06).toFixed(2));
    });
    void grid.offsetWidth;                    // let the browser notice the change
    visible.forEach(idx => items[idx].classList.add("in-view"));
  }

  /* ---------- Preview window (lightbox) ---------- */
  let position = 0;
  let lastFocus = null;

  function show(pos) {
    position = (pos + visible.length) % visible.length;
    const index = visible[position];
    const p = PROJECTS[index];

    lbMedia.replaceChildren();
    const frame = el("div", p.image ? "lb-img" : "lb-ph lb-ph--" + (p.size || "square"));
    frame.appendChild(makeMedia(p, index));
    lbMedia.appendChild(frame);

    lbCat.textContent = p.category;
    lbTitle.textContent = p.title;
    lbDesc.textContent = p.description || "";
    lbDesc.hidden = !p.description;
    lbCount.textContent =
      String(position + 1).padStart(2, "0") + " / " + String(visible.length).padStart(2, "0");
  }

  function openBox(index) {
    lastFocus = document.activeElement;
    show(Math.max(visible.indexOf(index), 0));
    box.classList.add("is-open");
    box.setAttribute("aria-hidden", "false");
    body.classList.add("is-locked");
    closeBtn.focus();
  }

  function closeBox() {
    if (!box.classList.contains("is-open")) return;
    box.classList.remove("is-open");
    box.setAttribute("aria-hidden", "true");
    body.classList.remove("is-locked");
    if (lastFocus) lastFocus.focus();
  }

  box.querySelectorAll("[data-close]").forEach(n => n.addEventListener("click", closeBox));
  document.getElementById("lbPrev").addEventListener("click", () => show(position - 1));
  document.getElementById("lbNext").addEventListener("click", () => show(position + 1));

  document.addEventListener("keydown", e => {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") closeBox();
    if (e.key === "ArrowLeft") show(position - 1);
    if (e.key === "ArrowRight") show(position + 1);
    if (e.key === "Tab") {                    // keep keyboard focus inside the window
      const focusable = [...box.querySelectorAll("button")].filter(b => b.offsetParent !== null);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Swipe left / right on phones */
  let startX = 0;
  box.addEventListener("touchstart", e => { startX = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 60) show(position + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();