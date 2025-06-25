/**
 * Handles dark mode toggling and theme-related UI changes
 */

export function setupDarkMode() {
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const logoImg = document.getElementById("logo-img");

  const isDark = localStorage.getItem("dark-mode") === "true";
  document.body.classList.toggle("dark", isDark);
  setThemeIcon(isDark);
  updateLogo(isDark);

  darkModeToggle?.addEventListener("click", () => {
    const currentDark = document.body.classList.toggle("dark");
    localStorage.setItem("dark-mode", currentDark);
    setThemeIcon(currentDark);
    updateLogo(currentDark);
  });

  function setThemeIcon(isDark) {
    const modeIcon = document.getElementById("mode-icon");
    if (modeIcon) {
      modeIcon.src = isDark ? "docs/assets/dark-mode-toggle.svg" : "docs/assets/light-mode-toggle.svg";
      modeIcon.alt = isDark ? "Dark Mode" : "Light Mode";
    }
  }

  function updateLogo(isDark) {
    if (logoImg) {
      logoImg.src = isDark ? "docs/assets/logo-dark.svg" : "docs/assets/logo-light.svg";
    }
  }
}
