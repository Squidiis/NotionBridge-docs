
import { setupDarkMode } from './theme.js';
import { setupNavigation } from './navigation.js';
import { setupSidebar } from './sidebar.js';
import { setupSectionLoader } from './sections.js';
import { setupTOCTracking } from './toc.js';

document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  setupDarkMode();
  setupSectionLoader();
  setupNavigation();
  setupTOCTracking();
});
