// Apply the preference before first paint on every site surface.
let pageTheme;
function determineComputedTheme() {
  let saved;
  try {
    saved = localStorage.getItem("theme");
  } catch {
    /* Storage may be disabled. */
  }
  return pageTheme || (saved === "dark" || saved === "light" ? saved : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
function applyTheme() {
  const theme = determineComputedTheme();
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const icon = document.getElementById("theme-toggle-icon");
  if (icon) icon.textContent = theme === "dark" ? "☀" : "☾";
  const button = document.getElementById("theme-toggle");
  if (button) button.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " mode");
  for (const mode of ["light", "dark"]) document.getElementById("highlight_theme_" + mode)?.setAttribute("media", mode === theme ? "all" : "none");
  document.querySelector("ninja-keys")?.classList.toggle("dark", theme === "dark");
}
// Public API retained for the keyboard-search theme actions.
function setThemeSetting(theme) {
  pageTheme = theme === "dark" || theme === "light" ? theme : undefined;
  try {
    if (pageTheme) localStorage.setItem("theme", pageTheme);
    else localStorage.removeItem("theme");
  } catch {
    /* The current page still follows the selected preference. */
  }
  applyTheme();
}
function initTheme() {
  applyTheme();
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      setThemeSetting(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
  window.addEventListener("storage", (event) => {
    if (event.key === "theme") {
      pageTheme = undefined;
      applyTheme();
    }
  });
}
