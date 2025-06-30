
export function setupSidebar() {
  const sidebar = document.querySelector("nav.sidebar");
  const toggle = document.getElementById("sidebar-toggle");
  const overlay = document.getElementById("sidebar-overlay");

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  function updateVisibility() {
    if (window.innerWidth <= 1024) {
      toggle.style.display = "inline-block";
    } else {
      toggle.style.display = "none";
      closeSidebar();
    }
  }

  toggle?.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });

  overlay?.addEventListener("click", closeSidebar);

  sidebar.querySelectorAll("a[data-section]").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 1024) closeSidebar();
    });
  });

  window.addEventListener("resize", updateVisibility);
  updateVisibility();
}
