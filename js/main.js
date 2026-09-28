// ============================================================
// Baya Weaver Resorts
// Every block below guards its own elements, so a missing section
// never breaks the rest of the page. Without JavaScript the page
// still works: links open YouTube and Google Maps, forms post.
// ============================================================

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CONTACT_EMAIL = 'bayaweaverresort@gmail.com';

  // ------------------------------------------------------------
  // Theme toggle (initial theme is set inline in <head>)
  // ------------------------------------------------------------
  const themeToggle = $('#themeToggle');
  const root = document.documentElement;

  function labelThemeToggle() {
    if (!themeToggle) return;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${next} theme`);
  }

  if (themeToggle) {
    labelThemeToggle();
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('bw-theme', next); } catch (e) { /* storage unavailable */ }
      labelThemeToggle();
    });
  }

  // ------------------------------------------------------------
  // Navbar background once the page leaves the top
  // ------------------------------------------------------------
  const navbar = $('#navbar');
  if (navbar && 'IntersectionObserver' in window) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => {
      navbar.classList.toggle('scrolled', !entry.isIntersecting);
    }).observe(sentinel);
  } else if (navbar) {
    navbar.classList.add('scrolled');
  }

  // ------------------------------------------------------------
  // Mobile menu
  // ------------------------------------------------------------
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobileMenu');

  function setMenu(open, { restoreFocus = true } = {}) {
    if (!hamburger || !mobileMenu) return;
    mobileMenu.classList.toggle('open', open);
    mobileMenu.inert = !open;
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      const first = $('a', mobileMenu);
      if (first) first.focus();
    } else if (restoreFocus) {
      hamburger.focus();
    }
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
    $$('a', mobileMenu).forEach(a => a.addEventListener('click', () => setMenu(false, { restoreFocus: false })));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) setMenu(false);
    });
    // Close if the viewport grows past the mobile breakpoint
    window.matchMedia('(min-width: 1081px)').addEventListener('change', e => {
      if (e.matches && mobileMenu.classList.contains('open')) setMenu(false, { restoreFocus: false });
    });
  }

  // ------------------------------------------------------------
  // Scroll reveal. Blocks already on screen at load are shown at
  // once; only blocks below the fold animate in. threshold 0 so
  // tall blocks can never get stuck hidden.
  // ------------------------------------------------------------
  // Stagger siblings inside grids so they enter in reading order
  ['.bento', '.villa-grid', '.mosaic', '.permit-list', '.nearby', '.stats'].forEach(sel => {
    $$(sel).forEach(grid => {
      $$(':scope > .reveal', grid).forEach((el, i) => el.style.setProperty('--i', i % 4));
    });
  });

  const reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const fold = window.innerHeight;
    const pending = [];
    reveals.forEach(el => {
      if (el.getBoundingClientRect().top < fold) el.classList.add('in');
      else pending.push(el);
    });
    // Items inside a sideways scroller (the mobile "Nearby" row) sit
    // off-screen horizontally, so they reveal with their container.
    const groups = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (groups.get(entry.target) || [entry.target]).forEach(el => el.classList.add('in'));
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    pending.forEach(el => {
      const parent = el.parentElement;
      const overflowX = parent ? getComputedStyle(parent).overflowX : 'visible';
      if (overflowX === 'auto' || overflowX === 'scroll') {
        if (!groups.has(parent)) { groups.set(parent, []); io.observe(parent); }
        groups.get(parent).push(el);
      } else {
        io.observe(el);
      }
    });
  }

  // ------------------------------------------------------------
  // Count-up on the headline stats. Screen readers always get the
  // final value; only the visible copy animates.
  // ------------------------------------------------------------
  const counters = $$('[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    counters.forEach(el => {
      const target = parseFloat(el.getAttribute('data-count'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const finalText = el.textContent;
      el.textContent = '';
      const sr = document.createElement('span');
      sr.className = 'visually-hidden';
      sr.textContent = finalText;
      const shown = document.createElement('span');
      shown.setAttribute('aria-hidden', 'true');
      shown.textContent = (0).toFixed(decimals);
      el.append(sr, shown);

      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const duration = 1400;
        const start = performance.now();
        const tick = now => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          shown.textContent = (target * eased).toFixed(decimals);
          if (t < 1) requestAnimationFrame(tick);
          else shown.textContent = finalText;
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  // ------------------------------------------------------------
  // CTAs that preselect the enquiry type
  // ------------------------------------------------------------
  const inquirySelect = $('#inquiry-type');
  $$('[data-enquiry]').forEach(link => {
    link.addEventListener('click', () => {
      if (!inquirySelect) return;
      const value = link.getAttribute('data-enquiry');
      if ($(`option[value="${value}"]`, inquirySelect)) inquirySelect.value = value;
    });
  });

  // ------------------------------------------------------------
  // Construction filmstrip buttons
  // ------------------------------------------------------------
  const strip = $('#siteStrip');
  if (strip) {
    $$('[data-strip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.getAttribute('data-strip') === 'next' ? 1 : -1;
        strip.scrollBy({ left: dir * strip.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  }

  // ------------------------------------------------------------
  // Gallery lightbox (links open the full image without JS)
  // ------------------------------------------------------------
  const lightbox = $('#lightbox');
  const galleryLinks = $$('#galleryGrid .g-item');
  if (lightbox && typeof lightbox.showModal === 'function' && galleryLinks.length) {
    const lbImg = $('#lightboxImg');
    const lbCap = $('#lightboxCap');
    let index = 0;

    function show(i) {
      index = (i + galleryLinks.length) % galleryLinks.length;
      const link = galleryLinks[index];
      const thumb = $('img', link);
      lbImg.src = link.getAttribute('href');
      lbImg.alt = thumb ? thumb.alt : '';
      lbCap.textContent = ($('.g-cap', link) || {}).textContent || '';
    }

    galleryLinks.forEach((link, i) => {
      link.addEventListener('click', e => {
        e.preventDefault();
        show(i);
        lightbox.showModal();
      });
    });

    lightbox.addEventListener('click', e => {
      const action = e.target.closest('[data-lb]');
      if (action) {
        const a = action.getAttribute('data-lb');
        if (a === 'close') lightbox.close();
        if (a === 'prev') show(index - 1);
        if (a === 'next') show(index + 1);
      } else if (e.target === lightbox) {
        lightbox.close();
      }
    });

    lightbox.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });

    lightbox.addEventListener('close', () => {
      galleryLinks[index].focus();
      lbImg.removeAttribute('src');
    });
  }

  // ------------------------------------------------------------
  // YouTube: nothing loads from Google until the visitor presses play
  // ------------------------------------------------------------
  const videoLink = $('#youtubeThumb');
  const videoFrame = $('#youtubePlayer');
  if (videoLink && videoFrame) {
    videoLink.addEventListener('click', e => {
      e.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/F8X-mcABL8U?autoplay=1&rel=0';
      iframe.title = 'Baya Weaver Resort, Vythiri, Wayanad, Kerala';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      videoFrame.replaceChildren(iframe);
      iframe.focus();
    });
  }

  // ------------------------------------------------------------
  // Google Map: loads only on request
  // ------------------------------------------------------------
  const loadMap = $('#loadMap');
  const mapFrame = $('#mapFrame');
  if (loadMap && mapFrame) {
    loadMap.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://maps.google.com/maps?q=11.535045,76.038681&z=15&output=embed';
      iframe.title = 'Map of Baya Weaver Resorts, Old Vythiri, Wayanad';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.loading = 'lazy';
      mapFrame.replaceChildren(iframe);
    });
  }

  // ------------------------------------------------------------
  // Forms. Success is shown only when the provider confirms it;
  // on any failure the visitor keeps what they typed and gets a
  // direct email fallback.
  // ------------------------------------------------------------
  function setStatus(el, kind, html) {
    if (!el) return;
    el.className = `form-status ${kind ? `is-${kind}` : ''}`.trim();
    el.innerHTML = html;
  }

  function markInvalid(form) {
    let firstInvalid = null;
    $$('input, select, textarea', form).forEach(field => {
      if (field.type === 'hidden' || field.name === '_gotcha') return;
      const bad = !field.checkValidity();
      field.setAttribute('aria-invalid', String(bad));
      if (bad && !firstInvalid) firstInvalid = field;
    });
    return firstInvalid;
  }

  function wireForm(form, statusEl, { successHtml, onSuccess }) {
    if (!form) return;
    const button = $('button[type="submit"]', form);
    let sending = false;

    $$('input, select, textarea', form).forEach(field => {
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true' && field.checkValidity()) {
          field.setAttribute('aria-invalid', 'false');
        }
      });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (sending) return;

      const firstInvalid = markInvalid(form);
      if (firstInvalid) {
        setStatus(statusEl, 'error', 'Please complete the highlighted fields.');
        firstInvalid.focus();
        return;
      }

      sending = true;
      if (button) button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      setStatus(statusEl, '', 'Sending…');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setStatus(statusEl, 'ok', successHtml);
        onSuccess && onSuccess();
      } catch (err) {
        setStatus(statusEl, 'error',
          `Sorry, that didn't go through. Your details are still here, so please try again, or email ` +
          `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`);
      } finally {
        sending = false;
        if (button) button.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  }

  const newsletterForm = $('#newsletterForm');
  wireForm(newsletterForm, $('#newsletterStatus'), {
    successHtml: "Thank you. You're on the list for Baya Weaver updates.",
    onSuccess: () => newsletterForm.reset()
  });

  const contactForm = $('#contactForm');
  wireForm(contactForm, $('#contactStatus'), {
    successHtml: "Thank you. We'll respond within 24 hours.",
    onSuccess: () => contactForm.reset()
  });
})();
