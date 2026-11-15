/* Photographs page: grid of tilted prints + details dialog. */
(function () {
  const grid = document.getElementById("grid");
  const count = document.getElementById("count");
  const lede = document.getElementById("gallery-lede");
  const rots = [-2, 1.5, -1, 2.5, -1.5, 1, -2.5, 2, -0.5];
  const dialog = Photos.createPhotoDialog(document.getElementById("photo-dialog"));

  if (window.matchMedia("(hover: none)").matches) {
    lede.textContent = lede.textContent.replace("Click any print", "Tap any print");
  }

  function print(p, i, photos) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "print";
    btn.style.transform = `rotate(${rots[i % rots.length]}deg)`;

    let media;
    if (p) {
      media = document.createElement("img");
      media.src = p.src;
      media.alt = "";
      media.loading = "lazy";
      btn.setAttribute("aria-label", `${p.alt}, ${p.location}, ${p.date}. Open details`);
      btn.addEventListener("click", () => dialog.open(photos, i));
    } else {
      media = document.createElement("div");
      media.className = "placeholder-photo";
      media.textContent = "Photo coming soon";
      btn.disabled = true;
      btn.setAttribute("aria-label", "Photo coming soon");
    }

    const cap = document.createElement("span");
    cap.className = "print__cap";
    const place = document.createElement("span");
    place.className = "caption-place";
    place.textContent = p ? p.location : "On the road";
    const date = document.createElement("span");
    date.className = "caption-date";
    date.textContent = p ? p.date : "—";
    cap.append(place, date);

    btn.append(media, cap);
    return btn;
  }

  Photos.loadPhotos().then((photos) => {
    count.textContent = `▸ ${photos.length} PHOTOGRAPH${photos.length === 1 ? "" : "S"}`;
    const items = photos.length ? photos : Array.from({ length: 6 }, () => null);
    items.forEach((p, i) => grid.append(print(p, i, photos)));
  });
})();
