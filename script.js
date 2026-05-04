'use strict';
/* -----------------------------------------------------------------------
   1. SUPABASE CLIENT INITIALISATION
   ----------------------------------------------------------------------- */
const SUPABASE_URL = 'https://ozhjabqkrnqxpphnyldz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aGphYnFrcm5xeHBwaG55bGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzQ3ODksImV4cCI6MjA5MzE1MDc4OX0.Gq4Rb0778UsSAD_7DuyJacleBTJ_K1UMfPw2wtzpkLk';

const db = (typeof supabase !== 'undefined')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/* -----------------------------------------------------------------------
   2. SVG DATA VISUALISATION GENERATOR
   ----------------------------------------------------------------------- */

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * generateDots(svgEl, options)
 *
 * @param {SVGSVGElement} svgEl   - The target <svg> container
 * @param {object}        options
 *   @param {number}  options.count        - Number of dots to render
 *   @param {number}  options.minR         - Minimum dot radius (px)
 *   @param {number}  options.maxR         - Maximum dot radius (px)
 *   @param {number}  options.minOpacity   - Minimum opacity (0–1)
 *   @param {number}  options.maxOpacity   - Maximum opacity (0–1)
 *   @param {string}  options.color        - SVG fill color (hex/rgb)
 *   @param {string[]} options.animations  - CSS animation names to cycle through
 *   @param {boolean} options.interactive  - Attach hover tooltip events?
 */
function generateDots(svgEl, options) {
  const {
    count = 60,
    minR = 1,
    maxR = 2.5,
    minOpacity = 0.05,
    maxOpacity = 0.35,
    color = '#A8D5B8',
    animations = ['dot-float-a', 'dot-float-b', 'dot-float-c'],
    interactive = false,
  } = options || {};

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const cx = (Math.random() * 98 + 1).toFixed(2) + '%'; // 1%–99% (never bleeds past rail)
    const cy = (Math.random() * 90 + 5).toFixed(2) + '%';
    const r = (Math.random() * (maxR - minR) + minR).toFixed(2);
    const opacity = (Math.random() * (maxOpacity - minOpacity) + minOpacity).toFixed(3);
    const anim = animations[i % animations.length];
    const delay = -(Math.random() * 8).toFixed(2) + 's';
    const duration = (Math.random() * 5 + 10).toFixed(2) + 's'; // 10s – 15s (slower)

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', color);
    circle.setAttribute('opacity', opacity);
    circle.setAttribute('class', 'data-viz__dot');
    circle.style.animationName = anim;
    circle.style.animationDuration = duration;
    circle.style.animationDelay = delay;
    circle.style.animationTimingFunction = 'ease-in-out';
    circle.style.animationIterationCount = 'infinite';

    if (interactive) {
      circle.setAttribute('tabindex', '0');
      circle.setAttribute('role', 'img');
      circle.setAttribute('aria-label', `Data point with opacity ${opacity}`);
      
      // Ensure at least 15 dots (or 35%, whichever is higher) have a tooltip
      // We'll use a more predictable distribution to ensure the "at least 15" rule
      const threshold = Math.max(0.65, 1 - (15 / count));
      if (Math.random() > threshold) {
        const val = (Math.random() * 2 + 0.5).toFixed(2);
        circle.setAttribute('data-tooltip', Math.random() > 0.5 ? `OR: ${val}` : `95% CI: ${(val - 0.2).toFixed(2)}–${(parseFloat(val) + 0.4).toFixed(2)}`);
      }
    }

    fragment.appendChild(circle);
  }

  svgEl.appendChild(fragment);
}

/**
 * Detects screen width and returns appropriate dot count.
 * Mobile: 40–60  |  Tablet: 60–80  |  Desktop: 80–120
 */
function getDotCount() {
  const w = window.innerWidth;
  if (w < 640) return Math.floor(Math.random() * 20) + 40;  // 40–60
  if (w < 1024) return Math.floor(Math.random() * 20) + 60;  // 60–80
  return Math.floor(Math.random() * 40) + 80;                 // 80–120
}

/**
 * Initialise all SVG visualisation canvases on the page.
 */
function initDataViz() {
  const heroViz = document.getElementById('hero-viz');
  const dividerViz = document.getElementById('divider-viz');
  const dotCount = getDotCount();

  if (heroViz) {
    generateDots(heroViz, {
      count: Math.round(dotCount * 0.4),
      minR: 1.0,
      maxR: 2.2, // Slightly larger in hero
      minOpacity: 0.04,
      maxOpacity: 0.18,
      color: '#A8D5B8',
      animations: [],
      interactive: false,
    });
  }

  if (dividerViz) {
    const dividerColors = ['#937377', '#4C7C73', '#A06754', '#9CB6E0', '#ff0000'];
    generateDots(dividerViz, {
      count: dotCount,
      minR: 2.0,
      maxR: 4.2, // Significantly larger as requested
      minOpacity: 0.25,
      maxOpacity: 0.65,
      colors: dividerColors,
      animations: ['dot-float-a', 'dot-float-b', 'dot-float-c'],
      interactive: true,
    });
    
    // Start the automated random pop-off sequence
    runRandomPopoffs(dividerViz);
  }
}

/**
 * Enhanced generateDots to handle multi-color palettes
 */
function generateDots(svgEl, options) {
  const {
    count = 60,
    minR = 1,
    maxR = 2.5,
    minOpacity = 0.05,
    maxOpacity = 0.35,
    color = '#A8D5B8',
    colors = null,
    animations = ['dot-float-a', 'dot-float-b', 'dot-float-c'],
    interactive = false,
  } = options || {};

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const cx = (Math.random() * 98 + 1).toFixed(2) + '%';
    const cy = (Math.random() * 90 + 5).toFixed(2) + '%';
    const r = (Math.random() * (maxR - minR) + minR).toFixed(2);
    const opacity = (Math.random() * (maxOpacity - minOpacity) + minOpacity).toFixed(3);
    const anim = animations.length > 0 ? animations[i % animations.length] : '';
    const delay = -(Math.random() * 8).toFixed(2) + 's';
    const duration = (Math.random() * 5 + 10).toFixed(2) + 's';
    const dotColor = colors ? colors[i % colors.length] : color;

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', dotColor);
    circle.setAttribute('opacity', opacity);
    circle.setAttribute('class', 'data-viz__dot');
    
    if (anim) {
      circle.style.animationName = anim;
      circle.style.animationDuration = duration;
      circle.style.animationDelay = delay;
      circle.style.animationTimingFunction = 'ease-in-out';
      circle.style.animationIterationCount = 'infinite';
      // Store for highlight ring syncing
      circle.setAttribute('data-anim-name', anim);
      circle.setAttribute('data-anim-dur', duration);
      circle.setAttribute('data-anim-del', delay);
    }

    if (interactive) {
      circle.setAttribute('tabindex', '0');
      circle.setAttribute('role', 'img');
      const threshold = Math.max(0.65, 1 - (15 / count));
      if (Math.random() > threshold) {
        const val = (Math.random() * 2 + 0.5).toFixed(2);
        circle.setAttribute('data-tooltip', Math.random() > 0.5 ? `OR: ${val}` : `95% CI: ${(val - 0.2).toFixed(2)}–${(parseFloat(val) + 0.4).toFixed(2)}`);
      }
    }

    fragment.appendChild(circle);
  }

  svgEl.appendChild(fragment);
}

/**
 * Automates the appearance of random tooltips (pop-offs) based on user-defined timing rules.
 */
function runRandomPopoffs(svgEl) {
  const tooltip = document.getElementById('global-tooltip');
  if (!tooltip) return;

  // Create a reusable highlight ring
  const highlightRing = document.createElementNS(SVG_NS, 'circle');
  highlightRing.setAttribute('class', 'data-viz__highlight-ring');
  highlightRing.setAttribute('r', '6'); // Tighter fit as requested (dots are up to 4.2)
  highlightRing.setAttribute('fill', 'none');
  highlightRing.setAttribute('stroke', '#fff');
  highlightRing.setAttribute('stroke-width', '1.5');
  highlightRing.style.opacity = '0';
  highlightRing.style.transition = 'opacity 0.8s ease';
  svgEl.appendChild(highlightRing);

  const dotCooldowns = new Map();
  const DOT_COOLDOWN_MS = 20000;
  const TRIGGER_INTERVAL_MIN = 2500; // Increased slightly for slower pace

  function triggerNext() {
    const dots = Array.from(svgEl.querySelectorAll('.data-viz__dot[data-tooltip]'));
    if (dots.length === 0) return;

    const now = Date.now();
    const availableDots = dots.filter(dot => {
      const lastShown = dotCooldowns.get(dot) || 0;
      return (now - lastShown) >= DOT_COOLDOWN_MS;
    });

    if (availableDots.length > 0) {
      const dot = availableDots[Math.floor(Math.random() * availableDots.length)];
      const duration = 4000; // 4 seconds visibility as requested

      // 1. Sync Highlight Ring & Show Tooltip
      const rect = dot.getBoundingClientRect();
      
      // Sync animation attributes to the ring so it floats with the dot
      highlightRing.setAttribute('cx', dot.getAttribute('cx'));
      highlightRing.setAttribute('cy', dot.getAttribute('cy'));
      highlightRing.style.animationName = dot.getAttribute('data-anim-name');
      highlightRing.style.animationDuration = dot.getAttribute('data-anim-dur');
      highlightRing.style.animationDelay = dot.getAttribute('data-anim-del');
      highlightRing.style.animationTimingFunction = 'ease-in-out';
      highlightRing.style.animationIterationCount = 'infinite';
      
      highlightRing.style.opacity = '1';
      
      tooltip.textContent = dot.getAttribute('data-tooltip');
      // Position tooltip relative to viewport
      tooltip.style.left = (rect.left + rect.width / 2) + 'px';
      tooltip.style.top = (rect.top - 18) + 'px'; // Adjusted for larger dots/ring
      tooltip.style.opacity = '1';

      dotCooldowns.set(dot, now);

      // 2. Wait 4s then Fade Out both
      setTimeout(() => {
        tooltip.style.opacity = '0';
        highlightRing.style.opacity = '0';
        
        // 3. Wait at least 2s until another appears
        setTimeout(triggerNext, 2500); 
      }, duration);
    } else {
      setTimeout(triggerNext, 1000);
    }
  }

  setTimeout(triggerNext, 3000);
}

/* -----------------------------------------------------------------------
   3. GLOBAL TOOLTIP HANDLER
   Handles mouse events for data-viz dots that have a data-tooltip.
   ----------------------------------------------------------------------- */
function initGlobalTooltip() {
  // Manual tooltip logic removed in favor of runRandomPopoffs (automated)
  // We keep the function signature to avoid breaking DOMContentLoaded calls
}

/* -----------------------------------------------------------------------
   4. REQUEST FORM HANDLER
   Captures: name, email, project_type, notes → Supabase insert
   ----------------------------------------------------------------------- */
function initRequestForm() {
  const form = document.getElementById('requestForm');
  const statusEl = document.getElementById('status');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!db) {
      setStatus(statusEl, 'error', 'STATUS: CLIENT UNAVAILABLE — SUPABASE NOT LOADED');
      return;
    }

    // Disable submit to prevent double-submission
    submitBtn.disabled = true;
    setStatus(statusEl, 'processing', 'STATUS: PROCESSING…');

    const data = new FormData(form);
    const payload = {
      name: (data.get('name') || '').trim(),
      email: (data.get('email') || '').trim(),
      project_type: (data.get('project_type') || '').trim(),
      notes: (data.get('notes') || '').trim(),
    };

    // Basic client-side validation
    if (!payload.name || !payload.email || !payload.project_type) {
      setStatus(statusEl, 'error', 'STATUS: ERROR — REQUIRED FIELDS MISSING');
      submitBtn.disabled = false;
      return;
    }

    const { error } = await db.from('submissions').insert([payload]);

    submitBtn.disabled = false;

    if (error) {
      console.error('[MetaSynth] Supabase insert error:', error);
      setStatus(statusEl, 'error', 'STATUS: ERROR — SAVE FAILED. TRY AGAIN.');
      return;
    }

    setStatus(statusEl, 'success', 'STATUS: SUCCESS — REQUEST RECEIVED');
    form.reset();
  });
}

/**
 * Helper: sets the status element text and BEM modifier class.
 */
function setStatus(el, state, message) {
  if (!el) return;
  el.textContent = message;
  el.className = `form-status form-status--${state}`;
}

/* -----------------------------------------------------------------------
   5. ENTRY POINT
   ----------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initDataViz();
  initGlobalTooltip();
  initRequestForm();
});

// Re-initialise dot count on significant resize (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const heroViz = document.getElementById('hero-viz');
    const dividerViz = document.getElementById('divider-viz');
    if (heroViz) heroViz.innerHTML = '';
    if (dividerViz) dividerViz.innerHTML = '';
    initDataViz();
  }, 400);
});
