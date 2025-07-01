import { loadSection, markActiveLink, getAllSections } from './sections.js';

export function setupNavigation() {
  const sidebarLinks = document.querySelectorAll(".sidebar a[data-section]");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const notionbridgeBtn = document.getElementById("nav-notionbridge");

  sidebarLinks.forEach(link => {
    link.addEventListener("click", async e => {
      e.preventDefault();
      const section = link.getAttribute("data-section");
      await loadSection(section);
      markActiveLink(link);
      updateNavigationButtons();
    });
  });

  if (notionbridgeBtn) {
    notionbridgeBtn.addEventListener("click", async e => {
      e.preventDefault();
      const section = notionbridgeBtn.getAttribute("data-section") || "intro";
      await loadSection(section);
      markActiveLink(notionbridgeBtn);
      updateNavigationButtons();
    });
  }

  function getCurrentSectionIndex() {
    const current = window.location.hash.substring(1);
    const sections = getAllSections();
    return sections.indexOf(current);
  }

  function updateNavigationButtons() {
    const sections = getAllSections();
    const index = getCurrentSectionIndex();

    if (prevBtn) {
      prevBtn.style.display = index > 0 ? "inline-block" : "none";
      prevBtn.onclick = () => {
        const previous = sections[index - 1];
        const link = document.querySelector(`.sidebar a[data-section="${previous}"]`);
        link?.click();
      };
    }

    if (nextBtn) {
      nextBtn.style.display = index < sections.length - 1 ? "inline-block" : "none";
      nextBtn.onclick = () => {
        const next = sections[index + 1];
        const link = document.querySelector(`.sidebar a[data-section="${next}"]`);
        link?.click();
      };
    }
  }

  window.addEventListener("popstate", () => {
    const current = window.location.hash.substring(1);
    const link = document.querySelector(`.sidebar a[data-section="${current}"]`);
    if (link) {
      loadSection(current).then(() => {
        markActiveLink(link);
        updateNavigationButtons();
      });
    } else if (current === "intro" && notionbridgeBtn) {
      loadSection("intro").then(() => {
        markActiveLink(notionbridgeBtn);
        updateNavigationButtons();
      });
    }
  });

  updateNavigationButtons();
}
