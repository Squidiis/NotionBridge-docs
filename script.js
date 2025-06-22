document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.querySelector("#content");
  const toc = document.getElementById("toc");
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const logoLink = document.getElementById("nav-notionbridge");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");

  const SCROLL_CONTAINER = contentArea;
  const OFFSET = 80;
  let scrollLocked = false;

  logoLink.addEventListener("click", async (e) => {
    const isOnMainPage = location.pathname.endsWith("index.html") || location.pathname === "/" || location.pathname === "";

    if (!isOnMainPage) {
      return;
    }

    e.preventDefault();
    const defaultSection = "intro";
    history.replaceState(null, "", `#${defaultSection}`);
    await loadSection(defaultSection);
    const link = document.querySelector(`.sidebar a[data-section="${defaultSection}"]`);
    if (link) markActiveLink(link);
    updateNavigationButtons();
  });

  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark");
    darkModeToggle.textContent = "🌙";
  }

  function updateLogo(darkMode) {
    const logoImg = document.getElementById("logo-img");
    logoImg.src = darkMode ? "docs/assets/logo-dark.svg" : "docs/assets/logo-light.svg";
  }

  updateLogo(document.body.classList.contains("dark"));

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("dark-mode", isDark);
    darkModeToggle.textContent = isDark ? "🌙" : "🌞";
    updateLogo(isDark);
  });

  document.querySelectorAll(".sidebar a[data-section]").forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");
      await loadSection(section);
      markActiveLink(link);
      scrollSmoothTo(0);
      updateNavigationButtons();
    });
  });

  function markActiveLink(link) {
    document.querySelectorAll(".sidebar a").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
  }

  async function loadSection(section) {
    try {
      let path = "";

      if (!section.includes("-")) {
        path = `content/${section}.html`;
      } else {
        const parts = section.split("-");
        const folder = parts.shift();
        const file = parts.join("-");
        path = `content/${folder}/${file}.html`;
      }

      const res = await fetch(path);
      if (!res.ok) throw new Error(`Failed to load ${path}`);

      const html = await res.text();
      contentArea.innerHTML = html;

      updateTOC();
      initTabs();
      scrollSmoothTo(0);
      history.replaceState(null, "", `#${section}`);
    } catch (err) {
      contentArea.innerHTML = `<p>⚠️ Could not load <strong>${section}</strong>.</p>`;
      toc.innerHTML = "";
      console.error(err);
    }
  }

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

    toc.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        const href = a.getAttribute("href");
        if (href && href.startsWith("#")) {
          const id = href.slice(1);
          scrollAndHighlight(id);
          toc.querySelectorAll("li").forEach(li => li.classList.remove("active"));
          a.parentElement.classList.add("active");
          history.replaceState(null, "", href);
        }
      });
    });
  }

  function scrollAndHighlight(id) {
    const el = document.getElementById(id);
    if (!el) return;

    const containerRect = SCROLL_CONTAINER.getBoundingClientRect();
    const targetRect = el.getBoundingClientRect();
    const scrollTop = SCROLL_CONTAINER.scrollTop;
    const targetScroll = targetRect.top - containerRect.top + scrollTop - OFFSET;

    lockScroll();
    el.classList.add("scroll-highlight");

    scrollSmoothTo(targetScroll, 700, () => {
      setTimeout(() => {
        el.classList.remove("scroll-highlight");
        unlockScroll();
      }, 1000);
    });
  }

  function scrollSmoothTo(targetY, duration = 500, callback = null) {
    const startY = SCROLL_CONTAINER.scrollTop;
    const distance = targetY - startY;
    let startTime = null;

    function animation(currentTime) {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      SCROLL_CONTAINER.scrollTop = startY + distance * ease;

      if (progress < 1) {
        requestAnimationFrame(animation);
      } else if (callback) {
        callback();
      }
    }

    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    requestAnimationFrame(animation);
  }

  function lockScroll() {
    scrollLocked = true;
    SCROLL_CONTAINER.style.overflowY = "hidden";
  }

  function unlockScroll() {
    scrollLocked = false;
    SCROLL_CONTAINER.style.overflowY = "auto";
  }

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

  function onScrollTOC() {
    if (scrollLocked) return;

    const headers = contentArea.querySelectorAll("h1, h2, h3");
    const scrollPos = SCROLL_CONTAINER.scrollTop;
    let currentId = null;

    for (let i = headers.length - 1; i >= 0; i--) {
      const header = headers[i];
      if (header.offsetTop - OFFSET - 10 <= scrollPos) {
        currentId = header.id;
        break;
      }
    }

    toc.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    if (currentId) {
      const activeLink = toc.querySelector(`a[href="#${currentId}"]`);
      if (activeLink) activeLink.parentElement.classList.add("active");
    }
  }

  function getAllSections() {
    return Array.from(document.querySelectorAll(".sidebar a[data-section]"))
      .map(link => link.getAttribute("data-section"));
  }

  function getCurrentSectionIndex() {
    const current = window.location.hash.substring(1);
    const sections = getAllSections();
    return sections.indexOf(current);
  }

  function updateNavigationButtons() {
    const sections = getAllSections();
    const currentIndex = getCurrentSectionIndex();

    if (prevBtn) {
      prevBtn.style.display = currentIndex > 0 ? "inline-block" : "none";
      prevBtn.onclick = () => {
        if (currentIndex > 0) {
          const previous = sections[currentIndex - 1];
          const link = document.querySelector(`.sidebar a[data-section="${previous}"]`);
          if (link) link.click();
        }
      };
    }

    if (nextBtn) {
      nextBtn.style.display = currentIndex < sections.length - 1 ? "inline-block" : "none";
      nextBtn.onclick = () => {
        if (currentIndex < sections.length - 1) {
          const next = sections[currentIndex + 1];
          const link = document.querySelector(`.sidebar a[data-section="${next}"]`);
          if (link) link.click();
        }
      };
    }
  }

  SCROLL_CONTAINER.addEventListener("scroll", onScrollTOC);

  const initial = window.location.hash?.substring(1);
  if (initial) {
    loadSection(initial).then(() => {
      const link = document.querySelector(`.sidebar a[data-section="${initial}"]`);
      if (link) markActiveLink(link);
      updateNavigationButtons();
    });
  } else {
    const firstLink = document.querySelector(".sidebar a[data-section]");
    if (firstLink) {
      markActiveLink(firstLink);
      const first = firstLink.getAttribute("data-section");
      loadSection(first).then(updateNavigationButtons);
    }
  }

  window.addEventListener("popstate", () => {
    const current = window.location.hash?.substring(1);
    if (current) {
      loadSection(current).then(() => {
        const link = document.querySelector(`.sidebar a[data-section="${current}"]`);
        if (link) markActiveLink(link);
        updateNavigationButtons();
      });
    }
  });
});
