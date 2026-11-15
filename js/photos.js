/*
 * Travel photo manifest + filename parser.
 *
 * Photos live in assets/photos/ and are named:
 *   [city/state*]_[country*]_[YYYYMMDD]_[count*].jpg|png   (* = optional)
 * Multi-word parts use hyphens: philadelphia-pa_usa_20220416_2.jpg
 *
 * assets/photos.json lists them (GitHub Pages can't list a directory):
 *   [{ "file": "tokyo_japan_20240310.jpg", "alt": "Lanterns over a narrow street" }]
 */
(function () {
  const PHOTO_DIR = "assets/photos/";
  const MANIFEST = "assets/photos.json";
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const UPPER_WORDS = new Set(["usa", "uk", "uae", "dc", "nyc"]);

  function titleCase(part) {
    const words = part.toLowerCase().split("-").filter(Boolean);
    const cap = (w) => (UPPER_WORDS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1));
    // A trailing 2-letter word is a state/region code: "philadelphia-pa" -> "Philadelphia, PA"
    const last = words[words.length - 1];
    if (words.length > 1 && last.length === 2) {
      return words.slice(0, -1).map(cap).join(" ") + ", " + last.toUpperCase();
    }
    return words.map(cap).join(" ");
  }

  function parsePhotoName(file) {
    const m = /^(.+)\.(jpe?g|png)$/i.exec(file);
    if (!m) return null;
    const parts = m[1].split("_");
    const di = parts.findIndex((p) => /^\d{8}$/.test(p));
    if (di < 0) return null;
    const place = parts.slice(0, di);
    const rest = parts.slice(di + 1);
    if (place.length > 2) return null;
    if (rest.length > 1 || (rest.length === 1 && !/^\d+$/.test(rest[0]))) return null;

    const raw = parts[di];
    const y = +raw.slice(0, 4), mo = +raw.slice(4, 6), d = +raw.slice(6, 8);
    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;

    const location = place.map(titleCase).join(" · ") || "Somewhere";
    return {
      file,
      src: PHOTO_DIR + file,
      location,
      date: `${MONTHS[mo - 1]} ${d}, ${y}`,
      sortKey: raw + (rest[0] || "0").padStart(3, "0"),
      count: rest.length ? +rest[0] : 1,
    };
  }

  async function loadPhotos() {
    let entries = [];
    try {
      const res = await fetch(MANIFEST, { cache: "no-cache" });
      if (res.ok) entries = await res.json();
    } catch (e) {
      console.warn("Could not load photo manifest", e);
    }
    if (!Array.isArray(entries)) return [];
    const photos = [];
    for (const entry of entries) {
      const file = typeof entry === "string" ? entry : entry && entry.file;
      const parsed = file && parsePhotoName(file);
      if (!parsed) {
        console.warn("Skipping photo with a name that doesn't follow the convention:", file);
        continue;
      }
      parsed.alt = (entry && entry.alt) || `Photograph from ${parsed.location}`;
      photos.push(parsed);
    }
    // Newest first, then by count.
    photos.sort((a, b) => (a.sortKey < b.sortKey ? 1 : a.sortKey > b.sortKey ? -1 : 0));
    photos.forEach((p, i) => (p.num = String(i + 1).padStart(2, "0")));
    return photos;
  }

  /* Shared photo-details dialog (used on both pages). */
  function createPhotoDialog(dialog) {
    const img = dialog.querySelector("img");
    const num = dialog.querySelector("[data-num]");
    const place = dialog.querySelector("[data-place]");
    const date = dialog.querySelector("[data-date]");
    let list = [];
    let index = 0;

    function render() {
      const p = list[index];
      img.src = p.src;
      img.alt = p.alt;
      num.textContent = `▸ NO. ${p.num}`;
      place.textContent = p.location;
      date.textContent = p.date;
      dialog.setAttribute("aria-label", `Photograph ${p.num} details`);
    }
    const step = (n) => { index = (index + n + list.length) % list.length; render(); };

    dialog.querySelector("[data-prev]").addEventListener("click", () => step(-1));
    dialog.querySelector("[data-next]").addEventListener("click", () => step(1));
    dialog.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => dialog.close()));
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });

    return {
      open(photos, i) {
        list = photos;
        index = i;
        render();
        dialog.showModal();
      },
    };
  }

  window.Photos = { parsePhotoName, loadPhotos, createPhotoDialog };
})();
