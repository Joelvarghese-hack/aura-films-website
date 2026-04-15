/* Color Palette Studio © 2026 Joel Varghese. All rights reserved.
   Unauthorized copying or distribution is prohibited. */

// app.js — Main application logic (stub for Step 1 scaffold)
// Full implementation follows in Step 3+.

document.addEventListener('DOMContentLoaded', () => {
  // Tab navigation
  const navTabs = document.querySelectorAll('.nav-tab');
  const panels = document.querySelectorAll('.panel');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => { p.classList.remove('active'); p.hidden = true; });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = document.getElementById('panel-' + tab.dataset.tab);
      if (target) { target.classList.add('active'); target.hidden = false; }
    });
  });
});
