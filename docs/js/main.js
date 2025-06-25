// Entry point: initializes all UI behaviors

import { setupDarkMode } from './theme.js';
import { setupNavigation } from './navigation.js';
import { setupSidebar } from './sidebar.js';
import { setupSectionLoader } from './sections.js';
import { setupTOCTracking } from './toc.js';

document.addEventListener('DOMContentLoaded', () => {
  setupDarkMode();
  setupSidebar();
  setupNavigation();
  setupSectionLoader();
  setupTOCTracking();
});
