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

let currentBreakpoint = '';

/**
 * Initialise all SVG visualisation canvases on the page.
 */
function initDataViz() {
  const w = window.innerWidth;
  let newBreakpoint = 'desktop';
  if (w < 640) newBreakpoint = 'mobile';
  else if (w < 1024) newBreakpoint = 'tablet';

  // Only recreate if we crossed a breakpoint to avoid "broken" animations on minor resize
  if (newBreakpoint === currentBreakpoint) return;
  currentBreakpoint = newBreakpoint;

  const heroViz = document.getElementById('hero-viz');
  const dividerViz = document.getElementById('divider-viz');
  
  if (heroViz) heroViz.innerHTML = '';
  if (dividerViz) dividerViz.innerHTML = '';

  const dotCount = getDotCount();

  const dividerColors = ['#937377', '#4C7C73', '#A06754', '#9CB6E0', '#ff0000'];

  if (heroViz) {
    generateDots(heroViz, {
      count: Math.round(dotCount * 1.5), 
      minR: 1.0,
      maxR: 2.2, 
      minOpacity: 0.25, // Matched with divider for vibrant colors
      maxOpacity: 0.65, // Matched with divider for vibrant colors
      colors: dividerColors, 
      animations: ['dot-float-a', 'dot-float-b', 'dot-float-c'],
      interactive: false,
    });
  }

  if (dividerViz) {
    const isMobile = window.innerWidth < 768;
    
    generateDots(dividerViz, {
      count: dotCount,
      minR: isMobile ? 1.2 : 2.0,
      maxR: isMobile ? 2.8 : 4.2, // Smaller dots on mobile
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

let popoffTimeout = null; // Track the loop to prevent duplicates on resize

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
 * Supports multiple concurrent tooltips (max 3).
 */
function runRandomPopoffs(svgEl) {
  // Clear any existing timeout loop first
  if (popoffTimeout) {
    clearTimeout(popoffTimeout);
    popoffTimeout = null;
  }

  const dotCooldowns = new Map();
  const DOT_COOLDOWN_MS = 20000;
  let activePopoffCount = 0;
  const MAX_CONCURRENT = 3;

  function triggerPopoff() {
    if (activePopoffCount >= MAX_CONCURRENT) {
      popoffTimeout = setTimeout(triggerPopoff, 1000);
      return;
    }

    const dots = Array.from(svgEl.querySelectorAll('.data-viz__dot[data-tooltip]'));
    if (dots.length === 0) return;

    const now = Date.now();
    const availableDots = dots.filter(dot => {
      const lastShown = dotCooldowns.get(dot) || 0;
      // Also ensure the dot isn't currently active
      return (now - lastShown) >= DOT_COOLDOWN_MS && !dot.classList.contains('data-viz__dot--active');
    });

    if (availableDots.length > 0) {
      const dot = availableDots[Math.floor(Math.random() * availableDots.length)];
      const duration = 6000; // Increased duration for a less "hasty" feel

      // 1. Create Dynamic Tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'data-viz__tooltip';
      tooltip.setAttribute('aria-hidden', 'true');
      tooltip.textContent = dot.getAttribute('data-tooltip');
      
      const dotColor = dot.getAttribute('fill');
      tooltip.style.setProperty('--tooltip-bg', dotColor);
      
      svgEl.parentElement.appendChild(tooltip);
      
      // 2. Mark dot as active
      activePopoffCount++;
      dot.classList.add('data-viz__dot--active');
      dotCooldowns.set(dot, now);

      // 3. Position Tooltip
      const rect = dot.getBoundingClientRect();
      const containerRect = svgEl.parentElement.getBoundingClientRect();
      const tooltipX = rect.left - containerRect.left + rect.width / 2;
      const tooltipY = rect.top - containerRect.top - 12;
      
      tooltip.style.left = tooltipX + 'px';
      tooltip.style.top = tooltipY + 'px';
      
      // Trigger show
      requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
      });

      // 4. Lifecycle: Fade Out and Remove
      setTimeout(() => {
        tooltip.style.opacity = '0';
        dot.classList.remove('data-viz__dot--active');
        
        setTimeout(() => {
          tooltip.remove();
          activePopoffCount--;
        }, 1300); // Wait for 1.2s transition + buffer
      }, duration);

      // Schedule next trigger slower for a more relaxed feel
      popoffTimeout = setTimeout(triggerPopoff, Math.random() * 3000 + 3000); 
    } else {
      popoffTimeout = setTimeout(triggerPopoff, 1500);
    }
  }

  // Initial delay
  popoffTimeout = setTimeout(triggerPopoff, 2000);
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
    initDataViz();
  }, 250); // Faster response
});
