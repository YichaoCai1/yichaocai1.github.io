function determineComputedTheme() {
  let e;
  try {
    e = localStorage.getItem("theme");
  } catch {}
  return pageTheme || ("dark" === e || "light" === e ? e : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
function applyTheme() {
  const e = determineComputedTheme();
  ((document.documentElement.dataset.theme = e), (document.documentElement.style.colorScheme = e));
  const t = document.getElementById("theme-toggle-icon");
  t && (t.textContent = "dark" === e ? "\u2600" : "\u263e");
  const m = document.getElementById("theme-toggle");
  m && m.setAttribute("aria-label", "Switch to " + ("dark" === e ? "light" : "dark") + " mode");
  for (const t of ["light", "dark"]) document.getElementById("highlight_theme_" + t)?.setAttribute("media", t === e ? "all" : "none");
  document.querySelector("ninja-keys")?.classList.toggle("dark", "dark" === e);
}
function setThemeSetting(e) {
  pageTheme = "dark" === e || "light" === e ? e : void 0;
  try {
    pageTheme ? localStorage.setItem("theme", pageTheme) : localStorage.removeItem("theme");
  } catch {}
  applyTheme();
}
function initTheme() {
  (applyTheme(),
    document.addEventListener("DOMContentLoaded", () => {
      (applyTheme(),
        document.getElementById("theme-toggle")?.addEventListener("click", () => {
          setThemeSetting("dark" === document.documentElement.dataset.theme ? "light" : "dark");
        }));
    }),
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme),
    window.addEventListener("storage", (e) => {
      "theme" === e.key && ((pageTheme = void 0), applyTheme());
    }));
}
let pageTheme;
