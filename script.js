document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.querySelector("#content");
  const links = document.querySelectorAll("nav.sidebar a[data-section]");
  const darkModeToggle = document.getElementById("dark-mode-toggle");

  // Dark Mode setzen beim ersten Laden
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark");
    darkModeToggle.textContent = "🌙";
  }

  // Dark Mode Umschalten
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("dark-mode", isDark);
    darkModeToggle.textContent = isDark ? "🌙" : "🌞";
  });

  // Menü klickbar machen (Dropdown ein-/ausklappen und Inhalte laden)
  document.querySelectorAll(".sidebar li > a[data-section]").forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");

      // Wenn es ein Untermenü gibt: nur Dropdown öffnen/schließen
      const submenu = link.parentElement.querySelector(".submenu");
      if (submenu) {
        submenu.classList.toggle("open");
        return;
      }

      await loadSection(section);
    });
  });

  // Unterseiten-Klick
  document.querySelectorAll(".submenu a[data-section]").forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");
      await loadSection(section);
    });
  });

  // Lade und zeige Content
  async function loadSection(section) {
    try {
      const res = await fetch(`content/${section}.html`);
      if (!res.ok) throw new Error(`Fehler beim Laden von ${section}`);

      const html = await res.text();
      contentArea.innerHTML = html;
      history.pushState(null, "", `#${section}`);
    } catch (err) {
      contentArea.innerHTML = `<p>⚠️ Konnte <strong>${section}</strong> nicht laden.</p>`;
      console.error(err);
    }
  }

  // Wenn Hash vorhanden (z. B. beim Neuladen)
  const initial = window.location.hash?.substring(1);
  if (initial) {
    loadSection(initial);
  }

  // Wenn Nutzer zurück/vor navigiert
  window.addEventListener("popstate", () => {
    const current = window.location.hash?.substring(1);
    if (current) {
      loadSection(current);
    }
  });
});
