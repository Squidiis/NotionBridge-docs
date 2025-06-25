/**
 * Loads section content dynamically and manages smooth scrolling
 */

export function loadSection(section) {
  const contentArea = document.getElementById("content");
  const toc = document.getElementById("toc");

  return new Promise(async (resolve) => {
    try {
      let path = section.includes("-")
        ? `content/${section.split("-")[0]}/${section.split("-").slice(1).join("-")}.html`
        : `content/${section}.html`;

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
    } finally {
      resolve();
    }
  });
}

export function getAllSections() {
  return Array.from(document.querySelectorAll(".sidebar a[data-section]"))
    .map(link => link.getAttribute("data-section"));
}

export function markActiveLink(link) {
  document.querySelectorAll(".sidebar a").forEach(l => l.classList.remove("active"));
  link.classList.add("active");
}

let scrollLocked = false;

export function scrollAndHighlight(id) {
  const contentArea = document.getElementById("content");
  const OFFSET = 80;
  const el = document.getElementById(id);
  if (!el) return;

  const containerRect = contentArea.getBoundingClientRect();
  const targetRect = el.getBoundingClientRect();
  const scrollTop = contentArea.scrollTop;
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

function lockScroll() {
  scrollLocked = true;
  document.getElementById("content").style.overflowY = "hidden";
}

function unlockScroll() {
  scrollLocked = false;
  document.getElementById("content").style.overflowY = "auto";
}

function scrollSmoothTo(targetY, duration = 500, callback = null) {
  const container = document.getElementById("content");
  const startY = container.scrollTop;
  const distance = targetY - startY;
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    container.scrollTop = startY + distance * ease;

    if (progress < 1) {
      requestAnimationFrame(animation);
    } else if (callback) {
      callback();
    }
  }

  requestAnimationFrame(animation);
}

function updateTOC() {
  const toc = document.getElementById("toc");
  const contentArea = document.getElementById("content");
  toc.innerHTML = "";
  const headers = contentArea.querySelectorAll("h1, h2, h3");
  if (!headers.length) return;

  let currentLevel = 1;
  let ulStack = [toc];
  headers.forEach(header => {
    const level = parseInt(header.tagName.substring(1));
    const id = header.id || header.textContent.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]/g, "");
    header.id = id;

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = header.textContent;
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

function initTabs() {
  const tabs = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('.tab-panel');

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
      const target = document.getElementById(panelId);
      target?.removeAttribute('hidden');
    });
  });
}

export function setupSectionLoader() {
  const links = document.querySelectorAll('.sidebar a[data-section]');
  links.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      markActiveLink(link);
      await loadSection(section);
    });
  });

  // TOC-Links: smooth scroll + highlight
  document.addEventListener('click', function(e) {
    if (e.target && e.target.closest('#toc a')) {
      const a = e.target.closest('#toc a');
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const id = href.slice(1);
        scrollAndHighlight(id);
        document.querySelectorAll('#toc li').forEach(li => li.classList.remove('active'));
        a.parentElement.classList.add('active');
        history.replaceState(null, "", href);
      }
    }
  });

  const initial = location.hash.slice(1) || 'intro';
  const initialLink = document.querySelector(`.sidebar a[data-section="${initial}"]`);
  if (initialLink) markActiveLink(initialLink);
  loadSection(initial);
}
