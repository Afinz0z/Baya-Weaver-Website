    // ============================================================
    // COUNTDOWN TIMER
    // ============================================================
    const launchDate = new Date('2026-10-01T00:00:00');
    function updateCountdown() {
      const now = new Date();
      const diff = launchDate - now;
      if (diff <= 0) {
        ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'].forEach(id => document.getElementById(id).textContent = '00');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
      document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
      document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
      document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ============================================================
    // NAVBAR SCROLL
    // ============================================================
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // ============================================================
    // DARK / LIGHT THEME TOGGLE
    // ============================================================
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      themeToggle.textContent = theme === 'dark' ? '☽' : '☀';
      localStorage.setItem('bw-theme', theme);
    }
    const savedTheme = localStorage.getItem('bw-theme') || 'dark';
    applyTheme(savedTheme);
    themeToggle.addEventListener('click', () => {
      applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
    if (!localStorage.getItem('bw-theme') && window.matchMedia('(prefers-color-scheme: light)').matches) {
      applyTheme('light');
    }

    // ============================================================
    // MOBILE MENU
    // ============================================================
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    function openMobile() {
      mobileMenu.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMobile() {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      mobileMenu.classList.contains('open') ? closeMobile() : openMobile();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });

    // Close when tapping the overlay backdrop (outside menu links)
    mobileMenu.addEventListener('click', e => {
      if (e.target === mobileMenu) closeMobile();
    });

    // ============================================================
    // FLOATING PARTICLES
    // ============================================================
    (function createParticles() {
      const container = document.getElementById('particles');
      const count = window.innerWidth < 768 ? 10 : 20;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 4 + 2;
        p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;animation-duration:${Math.random() * 15 + 10}s;animation-delay:${Math.random() * 10}s;opacity:${Math.random() * 0.6 + 0.2};`;
        container.appendChild(p);
      }
    })();

    // ============================================================
    // INTERSECTION OBSERVER — FADE UP
    // ============================================================
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

    // ============================================================
    // 3D CARD TILT
    // ============================================================
    document.querySelectorAll('.feature-card, .villa-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -5;
        const rotY = ((x - cx) / cx) * 5;
        card.style.transform = `translateY(-6px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // ============================================================
    // NEWSLETTER FORM
    // ============================================================
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterSuccess = document.getElementById('newsletterSuccess');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = newsletterForm.querySelector('button');
        btn.textContent = 'Sending…';
        btn.disabled = true;
        try {
          const response = await fetch(newsletterForm.action, {
            method: 'POST', body: new FormData(newsletterForm), headers: { 'Accept': 'application/json' }
          });
          if (response.ok) {
            newsletterForm.style.display = 'none';
            newsletterSuccess.style.display = 'block';
          } else { btn.textContent = 'Try again →'; btn.disabled = false; }
        } catch {
          newsletterForm.style.display = 'none';
          newsletterSuccess.style.display = 'block';
        }
      });
    }

    // ============================================================
    // CONTACT FORM
    // ============================================================
    const contactForm = document.getElementById('contactForm');
    const contactSuccess = document.getElementById('contactSuccess');
    if (contactForm) {
      contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = contactForm.querySelector('.form-submit');
        btn.textContent = 'Sending…';
        btn.disabled = true;
        try {
          const response = await fetch(contactForm.action, {
            method: 'POST', body: new FormData(contactForm), headers: { 'Accept': 'application/json' }
          });
          if (response.ok) {
            contactForm.querySelectorAll('input:not([type=hidden]), textarea, select').forEach(el => el.value = '');
            contactSuccess.style.display = 'block';
            btn.textContent = 'Sent ✓';
          } else { btn.textContent = 'Try again →'; btn.disabled = false; }
        } catch {
          btn.textContent = 'Network Error. Try again →'; btn.disabled = false;
        }
      });
    }

    // ============================================================
    // SMOOTH ANCHOR SCROLLING
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = navbar.offsetHeight + 24;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });

    // ============================================================
    // YOUTUBE CLICK-TO-PLAY WITH FALLBACKS
    // ============================================================
    (function () {
      const videoId = 'F8X-mcABL8U';
      const thumb = document.getElementById('youtubeThumb');
      const player = document.getElementById('youtubePlayer');
      if (!thumb || !player) return;

      // Embed URLs to try, in order of preference
      const embedUrls = [
        `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
        `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`,
        `https://www.youtube.com/embed/${videoId}?autoplay=1`
      ];
      const directUrl = `https://www.youtube.com/watch?v=${videoId}`;

      function tryEmbed(urlIndex) {
        if (urlIndex >= embedUrls.length) {
          // All embeds failed — open directly on YouTube
          window.open(directUrl, '_blank', 'noopener,noreferrer');
          // Restore the thumbnail so user can try again
          thumb.style.display = '';
          return;
        }

        // Hide thumbnail, create iframe
        thumb.style.display = 'none';

        const iframe = document.createElement('iframe');
        iframe.src = embedUrls[urlIndex];
        iframe.title = 'Baya Weaver Resort — Vythiri, Wayanad, Keralam';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;
        iframe.style.cssText = 'width:100%;aspect-ratio:16/9;border:none;display:block;';

        // Detect load failure via timeout + message listener
        let loaded = false;
        const timeout = setTimeout(() => {
          if (!loaded) {
            iframe.remove();
            tryEmbed(urlIndex + 1);
          }
        }, 5000);

        iframe.addEventListener('load', () => {
          loaded = true;
          clearTimeout(timeout);
        });

        iframe.addEventListener('error', () => {
          clearTimeout(timeout);
          iframe.remove();
          tryEmbed(urlIndex + 1);
        });

        player.appendChild(iframe);
      }

      function handleClick() {
        tryEmbed(0);
      }

      thumb.addEventListener('click', handleClick);
      thumb.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      });
    })();
