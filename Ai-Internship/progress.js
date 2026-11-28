/* ================================================================
   AI Internship — Progress Tracker + Copy Button
   Handles: localStorage progress, mark-complete, copy prompts
   ================================================================ */

(function () {
  const STORAGE_KEY = 'ai-internship-progress';
  const TOTAL = 18;
  const ALL_IDS = [
    'ch01-l01','ch01-l02','ch01-l03','ch01-l04','ch01-l05','ch01-l06',
    'ch02-l01','ch02-l02','ch02-l03',
    'ch03-l01',
    'ch04-l01',
    'ch05-l01','ch05-l02',
    'ch06-l01','ch06-l02','ch06-l03',
    'ch07-l01','ch07-l02'
  ];

  /* ── Storage helpers ───────────────────────────── */
  function getCompleted() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e) { return []; }
  }

  function saveCompleted(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function toggleLesson(id) {
    const list = getCompleted();
    const i = list.indexOf(id);
    if (i === -1) list.push(id); else list.splice(i, 1);
    saveCompleted(list);
    return list.includes(id);
  }

  /* ── Copy Buttons ──────────────────────────────── */
  function initCopyButtons() {
    document.querySelectorAll('.good-card').forEach(card => {
      // Support both lesson pages (.card-head / .card-body)
      // and the single-page guide (.compare-card-header / .compare-card-body)
      const head = card.querySelector('.card-head') || card.querySelector('.compare-card-header');
      if (!head || head.querySelector('.copy-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.setAttribute('aria-label', 'Copy prompt');
      btn.innerHTML = iconCopy() + ' Copy';

      btn.addEventListener('click', () => {
        const bodyEl = card.querySelector('.card-body') || card.querySelector('.compare-card-body') || card;
        const text = bodyEl.textContent.trim();
        const succeed = () => {
          btn.innerHTML = iconCheck() + ' Copied!';
          btn.classList.add('copied');
          setTimeout(() => { btn.innerHTML = iconCopy() + ' Copy'; btn.classList.remove('copied'); }, 2000);
        };
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(succeed).catch(fallback);
        } else { fallback(); }

        function fallback() {
          const ta = Object.assign(document.createElement('textarea'), { value: text, style: 'position:fixed;opacity:0' });
          document.body.appendChild(ta); ta.focus(); ta.select();
          try { document.execCommand('copy'); succeed(); } catch(e) {}
          document.body.removeChild(ta);
        }
      });

      head.appendChild(btn);
    });
  }

  /* ── Mark-Complete Button (lesson pages) ───────── */
  function initMarkComplete(lessonId) {
    const completed = getCompleted();
    const done = completed.includes(lessonId);

    const wrap = document.createElement('div');
    wrap.className = 'mark-complete-wrap';

    const btn = document.createElement('button');
    btn.id = 'mark-complete-btn';
    btn.className = 'mark-complete-btn' + (done ? ' is-complete' : '');
    btn.innerHTML = done ? iconCheck() + ' Lesson Complete' : 'Mark as Complete';

    btn.addEventListener('click', () => {
      const nowDone = toggleLesson(lessonId);
      btn.className = 'mark-complete-btn' + (nowDone ? ' is-complete' : '');
      btn.innerHTML = nowDone ? iconCheck() + ' Lesson Complete' : 'Mark as Complete';
    });

    wrap.appendChild(btn);

    // Insert above .lesson-nav
    const nav = document.querySelector('.lesson-nav');
    if (nav) nav.parentNode.insertBefore(wrap, nav);
  }

  /* ── Index Progress Bar ────────────────────────── */
  function initIndexProgress() {
    const completed = getCompleted();
    const count = completed.filter(id => ALL_IDS.includes(id)).length;
    const pct   = TOTAL > 0 ? Math.round((count / TOTAL) * 100) : 0;

    const fill   = document.getElementById('progress-fill');
    const label  = document.getElementById('progress-label');
    const pctEl  = document.getElementById('progress-pct');

    // Animate after a tiny delay so the CSS transition fires
    if (fill)  requestAnimationFrame(() => setTimeout(() => fill.style.width = pct + '%', 80));
    if (label) label.textContent = count + ' of ' + TOTAL + ' lessons complete';
    if (pctEl) pctEl.textContent = pct + '%';

    // Per-lesson checkmarks
    ALL_IDS.forEach(id => {
      const el = document.getElementById('lesson-' + id);
      if (!el) return;
      el.classList.toggle('lesson-done', completed.includes(id));
    });

    // Reset button
    const resetBtn = document.getElementById('reset-progress');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all progress? This cannot be undone.')) {
          localStorage.removeItem(STORAGE_KEY);
          location.reload();
        }
      });
    }
  }

  /* ── SVG helpers ───────────────────────────────── */
  function iconCopy() {
    return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  }

  function iconCheck() {
    return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  }

  /* ── Boot ──────────────────────────────────────── */
  function init() {
    const lessonId = document.body.dataset.lessonId;
    initCopyButtons();
    if (lessonId)                                   initMarkComplete(lessonId);
    else if (document.getElementById('progress-fill')) initIndexProgress();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
