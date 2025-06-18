document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.querySelector("#content");
  const toc = document.getElementById("toc");
  const darkModeToggle = document.getElementById("dark-mode-toggle");

  // Dark Mode Initialisierung
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark");
    darkModeToggle.textContent = "🌙";
  }

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("dark-mode", isDark);
    darkModeToggle.textContent = isDark ? "🌙" : "🌞";
  });

  // Sidebar Links
  document.querySelectorAll(".sidebar li > a[data-section]").forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");

      const submenu = link.parentElement.querySelector(".submenu");
      if (submenu) {
        submenu.classList.toggle("open");
        return;
      }

      await loadSection(section);
    });
  });

  document.querySelectorAll(".submenu a[data-section]").forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");
      await loadSection(section);
    });
  });

  // Tabs initialisieren (innerhalb geladener Inhalte)
  function initTabs() {
    const tabs = contentArea.querySelectorAll('.tab-button');
    const panels = contentArea.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        panels.forEach(panel => panel.setAttribute('hidden', true));
        const panelId = tab.getAttribute('aria-controls');
        const target = contentArea.querySelector(`#${panelId}`);
        if (target) target.removeAttribute('hidden');
      });
    });
  }

  // Inhalt laden
  async function loadSection(section) {
    try {
      const res = await fetch(`content/${section}.html`);
      if (!res.ok) throw new Error(`Fehler beim Laden von ${section}`);

      const html = await res.text();
      contentArea.innerHTML = html;

      updateTOC();
      initTabs(); // Tabs nach dem Laden aktivieren

      history.pushState(null, "", `#${section}`);
    } catch (err) {
      contentArea.innerHTML = `<p>⚠️ Konnte <strong>${section}</strong> nicht laden.</p>`;
      toc.innerHTML = "";
      console.error(err);
    }
  }

  // Inhaltsverzeichnis aktualisieren
  function updateTOC() {
    toc.innerHTML = "";
    const headers = contentArea.querySelectorAll("h1, h2, h3");
    if (!headers.length) return;

    let currentLevel = 1;
    let ulStack = [toc];
    headers.forEach(header => {
      const level = parseInt(header.tagName.substring(1));
      const text = header.textContent;
      let id = header.id;
      if (!id) {
        id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]/g, "");
        header.id = id;
      }

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = text;
      li.appendChild(a);

      if (level > currentLevel) {
        const newUl = document.createElement("ul");
        ulStack[ulStack.length - 1].lastElementChild.appendChild(newUl);
        ulStack.push(newUl);
      } else if (level < currentLevel) {
        while (ulStack.length > 1 && level < currentLevel) {
          ulStack.pop();
          currentLevel--;
        }
      }
      currentLevel = level;

      ulStack[ulStack.length - 1].appendChild(li);
    });
  }

  // Beim ersten Laden Inhalt je nach URL-Hash laden
  const initial = window.location.hash?.substring(1);
  if (initial) {
    loadSection(initial); // initTabs wird dort automatisch aufgerufen
  }

  // Vor-/Zurück Navigation
  window.addEventListener("popstate", () => {
    const current = window.location.hash?.substring(1);
    if (current) {
      loadSection(current);
    }
  });
});
