// Shared navigation for the homepage, agenda, and reading pages.
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".academic-header");
  const menu = document.querySelector(".nav-menu-toggle");
  const links = document.querySelector(".academic-nav-links");
  const closeMenu = () => {
    menu?.setAttribute("aria-expanded", "false");
    header?.classList.remove("menu-open");
  };
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    header.classList.toggle("menu-open", open);
  });
  links?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu?.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menu.focus();
    }
  });
  const sectionLinks = [...document.querySelectorAll("[data-home-section]")];
  const sections = sectionLinks.map((link) => document.getElementById(link.dataset.homeSection)).filter(Boolean);
  if (!document.querySelector(".academic-home") || !sections.length) return;
  let pending = false;
  const updateCurrent = () => {
    const offset = (header?.offsetHeight || 60) + 36;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= offset) current = section;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections.at(-1);
    sectionLinks.forEach((link) => {
      if (link.dataset.homeSection === current.id) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    pending = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!pending) {
        pending = true;
        requestAnimationFrame(updateCurrent);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", updateCurrent);
  window.addEventListener("hashchange", updateCurrent);
  updateCurrent();
});
