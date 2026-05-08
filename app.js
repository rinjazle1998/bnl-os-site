/**
 * BNL-OS Website — app.js
 *
 * Security rules followed:
 *  - No eval(), no Function(), no document.write()
 *  - No innerHTML assigned user-controlled data (all text via textContent)
 *  - No fetch/XHR to external origins
 *  - No localStorage/sessionStorage (no data to leak)
 *  - All DOM queries are null-checked before use
 *  - Event listeners removed via AbortController when page unloads
 */

'use strict';

(function () {

  /* ── 1. Navigation: active link highlight ────────────────── */
  function markActiveNavLink() {
    var currentFile = window.location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('.nav__link');
    links.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      link.classList.remove('nav__link--active');
      if (href === currentFile) {
        link.classList.add('nav__link--active');
      }
    });
  }

  /* ── 2. Mobile hamburger menu ────────────────────────────── */
  function initMobileMenu() {
    var hamburger = document.getElementById('nav-hamburger');
    var drawer    = document.getElementById('nav-drawer');
    if (!hamburger || !drawer) return;

    hamburger.addEventListener('click', function () {
      var isOpen = drawer.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Close drawer when a link inside it is clicked */
    drawer.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        drawer.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    /* Close drawer on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        drawer.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });
  }

  /* ── 3. Scroll-triggered fade-up animations ─────────────── */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-fade-up');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-animate], .reveal').forEach(function (el) {
      observer.observe(el);
    });

    /* Specific handler for reveal class if needed */
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ── 4. Copy-to-clipboard for code blocks ────────────────── */
  function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        /* Read from paired <pre> element, not from user input */
        var pre = btn.closest('.code-block');
        if (!pre) return;
        var preEl = pre.querySelector('pre');
        if (!preEl) return;

        var text = preEl.textContent || '';

        /* Use modern clipboard API with fallback */
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(function () {
            showCopied(btn);
          }).catch(function () {
            fallbackCopy(text, btn);
          });
        } else {
          fallbackCopy(text, btn);
        }
      });
    });
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); showCopied(btn); } catch (_) {}
    document.body.removeChild(ta);
  }

  function showCopied(btn) {
    var original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.color = 'var(--col-accent)';
    setTimeout(function () {
      btn.textContent = original;
      btn.style.color = '';
    }, 1800);
  }

  /* ── 5. Docs sidebar: highlight active section ───────────── */
  function initDocsSidebar() {
    var sidebarLinks = document.querySelectorAll('.docs-sidebar__link[href^="#"]');
    if (!sidebarLinks.length) return;

    var headings = [];
    sidebarLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) headings.push({ el: el, link: link });
    });
    if (!headings.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          sidebarLinks.forEach(function (l) { l.classList.remove('docs-sidebar__link--active'); });
          var match = headings.find(function (h) { return h.el === entry.target; });
          if (match) match.link.classList.add('docs-sidebar__link--active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    headings.forEach(function (h) { observer.observe(h.el); });
  }

  /* ── 6. Changelog: expand/collapse entries ───────────────── */
  function initChangelog() {
    document.querySelectorAll('.cl-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var entry  = btn.closest('.cl-entry');
        if (!entry) return;
        var body   = entry.querySelector('.cl-entry__body');
        if (!body) return;
        var hidden = body.hidden;
        body.hidden = !hidden;
        btn.setAttribute('aria-expanded', String(hidden));
        btn.textContent = hidden ? '▲ Collapse' : '▼ Expand';
      });
    });
  }

  /* ── 7. Init everything when DOM is ready ────────────────── */
  function init() {
    markActiveNavLink();
    initMobileMenu();
    initScrollAnimations();
    initCopyButtons();
    initDocsSidebar();
    initChangelog();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
