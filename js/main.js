// ============================================================
// Baya Weaver Resorts
// Every block below guards its own elements, so a missing section
// (the legal pages share this file) never breaks the rest. Without
// JavaScript the page still works: links open YouTube and Google
// Maps, images open full size and forms post normally.
// ============================================================

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;
  const CONTACT_EMAIL = 'bayaweaverresort@gmail.com';
  const REQUEST_TIMEOUT_MS = 15000;

  // ------------------------------------------------------------
  // Theme toggle (initial theme is set by js/theme.js in <head>)
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
  if (navbar && hasIO) {
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
    window.matchMedia('(min-width: 1081px)').addEventListener('change', e => {
      if (e.matches && mobileMenu.classList.contains('open')) setMenu(false, { restoreFocus: false });
    });
  }

  // ------------------------------------------------------------
  // Active section in the nav (aria-current), tracked by observer
  // ------------------------------------------------------------
  const navLinks = $$('.nav-links a[href^="#"], .mobile-menu a[href^="#"]');
  if (navLinks.length && hasIO) {
    const byId = new Map();
    navLinks.forEach(a => {
      const id = a.getAttribute('href').slice(1);
      if (!byId.has(id)) byId.set(id, []);
      byId.get(id).push(a);
    });
    const sections = [...byId.keys()].map(id => document.getElementById(id)).filter(Boolean);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => a.removeAttribute('aria-current'));
        (byId.get(entry.target.id) || []).forEach(a => a.setAttribute('aria-current', 'true'));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  // ------------------------------------------------------------
  // Mobile action bar and back-to-top: shown once the hero has
  // scrolled away, hidden again while the forms are on screen.
  // ------------------------------------------------------------
  const actionBar = $('#actionBar');
  const toTop = $('#toTop');
  const hero = $('.hero');
  if ((actionBar || toTop) && hero && hasIO) {
    let pastHero = false;
    const visibleForms = new Set();
    const update = () => {
      const showBar = pastHero && visibleForms.size === 0;
      if (actionBar) {
        actionBar.classList.toggle('show', showBar);
        actionBar.inert = !showBar;
      }
      if (toTop) {
        toTop.classList.toggle('show', pastHero);
        toTop.inert = !pastHero;
      }
    };
    new IntersectionObserver(([entry]) => {
      pastHero = !entry.isIntersecting;
      update();
    }).observe(hero);
    const formWatch = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleForms.add(entry.target);
        else visibleForms.delete(entry.target);
      });
      update();
    });
    ['#newsletter-section', '#contact', '.site-footer'].forEach(sel => { const el = $(sel); if (el) formWatch.observe(el); });
  }

  // ------------------------------------------------------------
  // Scroll reveal. Blocks already on screen at load are shown at
  // once; only blocks below the fold animate in. threshold 0 so
  // tall blocks can never get stuck hidden.
  // ------------------------------------------------------------
  ['.bento', '.villa-grid', '.mosaic', '.permit-list', '.nearby', '.faq-list'].forEach(sel => {
    $$(sel).forEach(grid => {
      $$(':scope > .reveal', grid).forEach((el, i) => el.style.setProperty('--i', i % 4));
    });
  });

  const reveals = $$('.reveal');
  if (reduceMotion || !hasIO) {
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
  if (counters.length && !reduceMotion && hasIO) {
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
  // Enquiry type: CTAs preselect it; the form adapts to it
  // ------------------------------------------------------------
  const inquirySelect = $('#inquiry-type');
  const messageField = $('#cmessage');
  const visitDateField = $('#visitDateField');
  const visitDate = $('#visit-date');
  const PROMPTS = {
    'site-visit': 'Your preferred dates and how many people will join you.',
    ownership: 'Which villa type interests you, and any questions about ownership.',
    investment: 'What you would like to know about the investment opportunity.',
    booking: 'Your likely travel dates and number of guests.',
    brochure: 'Anything specific you would like the brochure to cover.',
    trade: 'Your company and the kind of work you would like to discuss.',
    media: 'Your publication or channel and what you are working on.',
    other: 'How can we help?'
  };
  const DEFAULT_PROMPT = messageField ? messageField.getAttribute('placeholder') : '';

  function syncEnquiryType() {
    if (!inquirySelect) return;
    const value = inquirySelect.value;
    if (messageField) messageField.setAttribute('placeholder', PROMPTS[value] || DEFAULT_PROMPT);
    if (visitDateField) visitDateField.hidden = value !== 'site-visit';
  }

  if (visitDate) {
    const today = new Date();
    const pad = n => String(n).padStart(2, '0');
    visitDate.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  }
  if (inquirySelect) {
    inquirySelect.addEventListener('change', syncEnquiryType);
    $$('[data-enquiry]').forEach(link => {
      link.addEventListener('click', () => {
        const value = link.getAttribute('data-enquiry');
        if ($(`option[value="${value}"]`, inquirySelect)) {
          inquirySelect.value = value;
          syncEnquiryType();
        }
      });
    });
  }

  // ------------------------------------------------------------
  // Construction filmstrip: buttons, disabled at either end
  // ------------------------------------------------------------
  const strip = $('#siteStrip');
  if (strip) {
    const prev = $('[data-strip="prev"]');
    const next = $('[data-strip="next"]');
    $$('[data-strip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.getAttribute('data-strip') === 'next' ? 1 : -1;
        strip.scrollBy({ left: dir * strip.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
    const items = $$(':scope > li', strip);
    if (hasIO && items.length && prev && next) {
      const edgeIO = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const btn = entry.target === items[0] ? prev : next;
          btn.disabled = entry.intersectionRatio > 0.95;
        });
      }, { root: strip, threshold: [0, 0.95, 1] });
      edgeIO.observe(items[0]);
      edgeIO.observe(items[items.length - 1]);
    }
  }

  // ------------------------------------------------------------
  // Lightbox for the gallery and the construction photos.
  // Links open the full image directly when JS is off.
  // ------------------------------------------------------------
  const lightbox = $('#lightbox');
  const lbLinks = $$('a.g-item[data-group]');
  if (lightbox && typeof lightbox.showModal === 'function' && lbLinks.length) {
    const lbImg = $('#lightboxImg');
    const lbCap = $('#lightboxCap');
    const lbCount = $('#lightboxCount');
    let group = [];
    let index = 0;
    let opener = null;

    const preload = link => { if (link) { const img = new Image(); img.src = link.getAttribute('href'); } };

    function show(i) {
      index = (i + group.length) % group.length;
      const link = group[index];
      const thumb = $('img', link);
      lbImg.src = link.getAttribute('href');
      lbImg.alt = thumb ? thumb.alt : '';
      lbCap.textContent = ($('.g-cap', link) || {}).textContent || '';
      if (lbCount) lbCount.textContent = group.length > 1 ? `Image ${index + 1} of ${group.length}` : '';
      preload(group[(index + 1) % group.length]);
      preload(group[(index - 1 + group.length) % group.length]);
    }

    lbLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        opener = link;
        group = lbLinks.filter(l => l.getAttribute('data-group') === link.getAttribute('data-group'));
        show(group.indexOf(link));
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

    // Swipe left or right on touch screens
    let startX = null;
    lightbox.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') startX = e.clientX; });
    lightbox.addEventListener('pointerup', e => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });

    lightbox.addEventListener('close', () => {
      if (opener) opener.focus();
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
      mapFrame.replaceChildren(iframe);
    });
  }

  // ------------------------------------------------------------
  // Copy and share
  // ------------------------------------------------------------
  const actionStatus = $('#actionStatus');
  const say = (text, kind = 'ok') => {
    if (!actionStatus) return;
    actionStatus.className = `form-status is-${kind}`;
    actionStatus.textContent = text;
  };

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const done = document.execCommand('copy');
    area.remove();
    if (!done) throw new Error('copy failed');
  }

  $$('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await copyText(btn.getAttribute('data-copy'));
        say(btn.getAttribute('data-copied') || 'Copied.');
      } catch (e) {
        say(`Copy didn't work here. The address is ${btn.getAttribute('data-copy')}.`, 'error');
      }
    });
  });

  const shareBtn = $('#shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const data = {
        title: 'Baya Weaver Resorts',
        text: '14 villas on Highland Tea Estate in Old Vythiri, Wayanad. Target opening Q4 2026.',
        url: (document.querySelector('link[rel="canonical"]') || {}).href || location.href
      };
      if (navigator.share) {
        try { await navigator.share(data); } catch (e) { /* visitor cancelled */ }
        return;
      }
      try {
        await copyText(data.url);
        say('Link copied, ready to paste.');
      } catch (e) {
        say(`Copy didn't work here. The link is ${data.url}`, 'error');
      }
    });
  }

  // ------------------------------------------------------------
  // Forms. Success is shown only when the provider confirms it;
  // on any failure (including a 15 s timeout) the visitor keeps
  // what they typed and gets a direct email fallback.
  // ------------------------------------------------------------
  function setStatus(el, kind, html) {
    if (!el) return;
    el.className = `form-status ${kind ? `is-${kind}` : ''}`.trim();
    el.innerHTML = html;
  }

  function markInvalid(form) {
    let firstInvalid = null;
    $$('input, select, textarea', form).forEach(field => {
      if (field.type === 'hidden' || field.name === '_gotcha' || field.closest('[hidden]')) return;
      const bad = !field.checkValidity();
      field.setAttribute('aria-invalid', String(bad));
      if (bad && !firstInvalid) firstInvalid = field;
    });
    return firstInvalid;
  }

  // Keeps an unsent enquiry through an accidental reload. Stored in
  // this tab only (sessionStorage) and cleared once it is sent.
  function keepDraft(form, key) {
    const fields = $$('input:not([type=hidden]):not([name=_gotcha]), select, textarea', form);
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || '{}');
      fields.forEach(f => { if (saved[f.name] && !f.value) f.value = saved[f.name]; });
    } catch (e) { /* storage unavailable */ }
    form.addEventListener('input', () => {
      const data = {};
      fields.forEach(f => { if (f.value) data[f.name] = f.value; });
      try { sessionStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* storage unavailable */ }
    });
    return () => { try { sessionStorage.removeItem(key); } catch (e) { /* storage unavailable */ } };
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

      const controller = 'AbortController' in window ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
          signal: controller ? controller.signal : undefined
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setStatus(statusEl, 'ok', successHtml);
        onSuccess && onSuccess();
        if (statusEl) { statusEl.setAttribute('tabindex', '-1'); statusEl.focus(); }
      } catch (err) {
        setStatus(statusEl, 'error',
          `Sorry, that didn't go through. Your details are still here, so please try again, or email ` +
          `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`);
      } finally {
        if (timer) clearTimeout(timer);
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
  const clearDraft = contactForm ? keepDraft(contactForm, 'bw-enquiry-draft') : () => {};
  syncEnquiryType();
  wireForm(contactForm, $('#contactStatus'), {
    successHtml: "Thank you. We'll respond within 24 hours.",
    onSuccess: () => { contactForm.reset(); clearDraft(); syncEnquiryType(); }
  });
})();
