/* Mobile header menu (shared by every page). */
(function () {
  const btn = document.querySelector(".menu-btn");
  const nav = document.getElementById("primary-nav");
  if (!btn || !nav) return;

  function set(open) {
    nav.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      set(false);
      btn.focus();
    }
  });
  window.matchMedia("(min-width: 768px)").addEventListener("change", () => set(false));
})();
