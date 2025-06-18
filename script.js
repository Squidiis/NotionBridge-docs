document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.querySelector("#content");
  const toc = document.getElementById("toc");
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

      // TOC aktualisieren nach dem Content-Setzen
      updateTOC();

      history.pushState(null, "", `#${section}`);
    } catch (err) {
      contentArea.innerHTML = `<p>⚠️ Konnte <strong>${section}</strong> nicht laden.</p>`;
      toc.innerHTML = ""; // TOC leeren, wenn Fehler
      console.error(err);
    }
  }

  // TOC aus den Überschriften in #content generieren
  function updateTOC() {
    toc.innerHTML = "";
    const headers = contentArea.querySelectorAll("h1, h2, h3");
    if (!headers.length) return;

    let currentLevel = 1;
    let ulStack = [toc]; // Stack der ul-Elemente nach Level

    headers.forEach(header => {
      const level = parseInt(header.tagName.substring(1)); // 1, 2, 3
      const text = header.textContent;
      let id = header.id;
      if (!id) {
        // id aus Text generieren, nur einfache Zeichen und Bindestriche
        id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]/g, "");
        header.id = id;
      }

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = text;
      li.appendChild(a);

      if (level > currentLevel) {
        // Tieferes Level: neues UL erstellen, in letztes LI einhängen
        const newUl = document.createElement("ul");
        ulStack[ulStack.length - 1].lastElementChild.appendChild(newUl);
        ulStack.push(newUl);
      } else if (level < currentLevel) {
        // Höheres Level: ulStack zurückgehen
        while (ulStack.length > 1 && level < currentLevel) {
          ulStack.pop();
          currentLevel--;
        }
      }
      // aktuelles Level anpassen
      currentLevel = level;

      ulStack[ulStack.length - 1].appendChild(li);
    });
  }

  // Wenn Hash vorhanden (z. B. beim Neuladen)
  const initial = window.location.hash?.substring(1);
  if (initial) {
    loadSection(initial);
  } else {
    // Startseite laden, falls gewünscht
    // loadSection("intro");
  }

  // Wenn Nutzer zurück/vor navigiert
  window.addEventListener("popstate", () => {
    const current = window.location.hash?.substring(1);
    if (current) {
      loadSection(current);
    }
  });
});
