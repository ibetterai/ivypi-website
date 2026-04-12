/* IvyPi — main.js */

/* ── Analytics Configuration ── */
const GA_MEASUREMENT_ID = 'G-PQ0WS1ZJ0C';

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  document.body.classList.remove('body-loading');
  initMobileMenu();
  initBackToTop();
  initSmoothScroll();
  initScrollAnimations();
  initLanguageSelector();
  highlightCurrentPage();
  initCookieConsent();

  renderTemplateComponents();

  // Page-specific inits
  if (document.querySelector('[data-tabs]')) initTabs();
  if (document.querySelector('[data-faq]')) initFAQ();
  if (document.querySelector('[data-carousel]')) initCarousels();
  if (document.querySelector('.shiny-text')) initShinyText();
  if (document.getElementById('contact-form')) initContactForm();
  if (document.getElementById('testimonial-carousel')) initTestimonialCarousel();
  if (document.querySelectorAll('.school-logo').length > 1) initLogoSaturationWave();
});

/* ── Component Loader (dev fallback — skipped when build-injected) ── */
async function loadComponents() {
  const slots = [
    { el: document.getElementById('header-placeholder'), src: '/components/header.html' },
    { el: document.getElementById('footer-placeholder'), src: '/components/footer.html' },
    { el: document.getElementById('contact-placeholder'), src: '/components/contact.html' },
  ].filter(s => s.el && s.el.innerHTML.trim() === '');
  if (!slots.length) return;
  const results = await Promise.all(slots.map(s => fetch(s.src).then(r => r.text())));
  slots.forEach((s, i) => { s.el.innerHTML = results[i]; });
}

/* ── Template Components ── */
function renderTemplateComponents() {
  const templates = {
    'cta-banner': (el) => `
      <div class="max-w-3xl mx-auto text-center">
        <h3 class="text-2xl md:text-3xl font-jost font-light mb-3">${el.dataset.heading}</h3>
        <p class="text-lg opacity-90 mb-8">${el.dataset.text}</p>
        <a href="${el.dataset.link}" class="inline-block bg-white text-brand-navy font-medium px-8 py-3 rounded hover:bg-gray-100 transition">${el.dataset.linkText}</a>
      </div>`,
    'pricing': (el) => `
      <div class="max-w-3xl mx-auto text-center">
        <h3 class="text-2xl md:text-3xl font-jost font-light text-brand-navy mb-2">${el.dataset.heading}</h3>
        <div class="w-16 h-1 bg-brand-blue mx-auto my-5 rounded"></div>
        <p class="text-gray-700 text-lg leading-relaxed">${el.dataset.text}</p>
      </div>`
  };

  document.querySelectorAll('[data-component]').forEach(el => {
    const fn = templates[el.dataset.component];
    if (fn) el.innerHTML = fn(el);
  });
}

/* ── Mobile Menu ── */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const open = document.getElementById('hamburger-icon');
  const close = document.getElementById('close-icon');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const expanded = menu.classList.toggle('hidden');
    open.classList.toggle('hidden');
    close.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', !menu.classList.contains('hidden'));
  });
}

/* ── Back to Top ── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  const langTrigger = document.getElementById('lang-trigger');
  const langDropdown = document.getElementById('lang-dropdown');
  let ticking = false;
  const show = () => {
    if (window.scrollY > 400) {
      btn.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
      btn.classList.add('opacity-100', 'translate-y-0');
      if (langTrigger) langTrigger.classList.replace('bottom-6', 'bottom-20');
      if (langDropdown) langDropdown.classList.replace('bottom-16', 'bottom-30');
    } else {
      btn.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
      btn.classList.remove('opacity-100', 'translate-y-0');
      if (langTrigger) langTrigger.classList.replace('bottom-20', 'bottom-6');
      if (langDropdown) langDropdown.classList.replace('bottom-30', 'bottom-16');
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(show);
      ticking = true;
    }
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Smooth Scroll ── */
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#' || id.length <= 1) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    const offset = 100;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

/* ── Scroll Animations ── */
function initScrollAnimations() {
  const els = document.querySelectorAll('[data-animate], [data-animate-children]');
  if (!els.length) return;
  requestAnimationFrame(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px 0px 0px' });
    els.forEach(el => observer.observe(el));
  });
}

/* ── Language Selector ── */
function initLanguageSelector() {
  const trigger = document.getElementById('lang-trigger');
  const dropdown = document.getElementById('lang-dropdown');
  if (!trigger || !dropdown) return;

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', () => dropdown.classList.add('hidden'));
  dropdown.addEventListener('click', e => e.stopPropagation());
}

/* ── Highlight Current Nav ── */
function highlightCurrentPage() {
  // Strip locale prefix from pathname for matching
  const raw = window.location.pathname;
  const stripped = raw.replace(/^\/(zh-CN|es|ko)(\/|$)/, '/');
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    const isActive = (stripped === '/' && href === '/') ||
      (href !== '/' && stripped.startsWith(href));
    if (isActive) {
      a.classList.remove('text-gray-600');
      a.classList.add('text-[#044d76]');
    }
  });
}

/* ── Tabs (About Us) ── */
function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach(container => {
    const buttons = container.querySelectorAll('[data-tab-btn]');
    const panels = container.querySelectorAll('[data-tab-panel]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tabBtn;
        buttons.forEach(b => {
          b.classList.toggle('border-brand-navy', b.dataset.tabBtn === target);
          b.classList.toggle('text-brand-navy', b.dataset.tabBtn === target);
          b.classList.toggle('border-transparent', b.dataset.tabBtn !== target);
          b.classList.toggle('text-gray-500', b.dataset.tabBtn !== target);
        });
        panels.forEach(p => {
          p.classList.toggle('hidden', p.dataset.tabPanel !== target);
        });
      });
    });
  });
}

/* ── FAQ Accordion (About Us) ── */
function initFAQ() {
  document.querySelectorAll('[data-faq] [data-faq-q]').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('[data-faq-item]');
      const answer = item.querySelector('[data-faq-a]');
      const icon = q.querySelector('[data-faq-icon]');
      const isOpen = !answer.classList.contains('hidden');

      // Close others
      q.closest('[data-faq]').querySelectorAll('[data-faq-item]').forEach(other => {
        if (other !== item) {
          other.querySelector('[data-faq-a]').classList.add('hidden');
          const otherIcon = other.querySelector('[data-faq-icon]');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      answer.classList.toggle('hidden', isOpen);
      if (icon) icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  });
}

/* ── Carousels (High School page) ── */
function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    if (!track) return;

    const items = track.children;
    let current = 0;
    let autoplayId;

    const scrollTo = (i) => {
      current = ((i % items.length) + items.length) % items.length;
      const item = items[current];
      const left = item.offsetLeft - track.offsetLeft - (track.clientWidth - item.offsetWidth) / 2;
      track.scrollTo({ left, behavior: 'smooth' });
    };

    if (prevBtn) prevBtn.addEventListener('click', () => { scrollTo(current - 1); resetAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { scrollTo(current + 1); resetAutoplay(); });

    const startAutoplay = () => { autoplayId = setInterval(() => scrollTo(current + 1), 4000); };
    const resetAutoplay = () => { clearInterval(autoplayId); startAutoplay(); };
    startAutoplay();

    carousel.addEventListener('mouseenter', () => clearInterval(autoplayId));
    carousel.addEventListener('mouseleave', startAutoplay);
  });
}

/* ── Shiny Text (Home) ── */
function initShinyText() {
  const container = document.querySelector('.shiny-text');
  if (!container) return;
  const targets = container.querySelectorAll('.shiny-target');
  let ticking = false;
  document.addEventListener('mousemove', e => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      targets.forEach(el => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
        el.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      });
      ticking = false;
    });
  }, { passive: true });
}

/* ── Contact Form (Web3Forms) ── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const success = document.getElementById('form-success');
  const error = document.getElementById('form-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
      });
      const data = await res.json();
      if (data.success) {
        success.classList.remove('hidden');
        error.classList.add('hidden');
        form.reset();
        setTimeout(() => success.classList.add('hidden'), 5000);
      } else {
        throw new Error();
      }
    } catch {
      error.classList.remove('hidden');
      success.classList.add('hidden');
    }
  });
}

/* ── Testimonial Carousel (Home) ── */
function initTestimonialCarousel() {
  const carousel = document.getElementById('testimonial-carousel');
  if (!carousel) return;
  const cards = carousel.querySelectorAll('.testimonial-card');
  const counter = document.getElementById('testimonial-counter');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  let current = 0;

  const show = (i) => {
    cards[current].classList.remove('active');
    current = ((i % cards.length) + cards.length) % cards.length;
    cards[current].classList.add('active');
    const sep = carousel.dataset.counterSep || ' / ';
    if (counter) counter.textContent = (current + 1) + sep + cards.length;
  };

  if (prevBtn) prevBtn.addEventListener('click', () => show(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => show(current + 1));
}

/* ── Logo Saturation Wave ── */
function initLogoSaturationWave() {
  const logos = document.querySelectorAll('.school-logo');
  if (logos.length < 2) return;

  const DELAY = 300;    // ms between each logo lighting up
  const HOLD = 800;     // ms a logo stays saturated
  let idx = 0;
  let direction = 1;    // 1 = left-to-right, -1 = right-to-left

  function step() {
    const logo = logos[idx];
    logo.classList.add('logo-saturated');
    setTimeout(() => logo.classList.remove('logo-saturated'), HOLD);

    idx += direction;
    if (idx >= logos.length) { direction = -1; idx = logos.length - 2; }
    else if (idx < 0) { direction = 1; idx = 1; }
  }

  step();
  setInterval(step, DELAY);
}

/* ── Cookie Consent ── */
function initCookieConsent() {
  const banner = document.getElementById('cookie-consent');
  if (!banner) return;

  const consent = localStorage.getItem('ivypi_cookie_consent');
  if (consent === 'accepted') { loadAnalytics(); return; }
  if (consent === 'declined') return;

  // No choice yet — show banner
  banner.classList.remove('hidden');

  document.getElementById('cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem('ivypi_cookie_consent', 'accepted');
    banner.classList.add('hidden');
    loadAnalytics();
  });

  document.getElementById('cookie-decline')?.addEventListener('click', () => {
    localStorage.setItem('ivypi_cookie_consent', 'declined');
    banner.classList.add('hidden');
  });
}

/* ── Google Analytics (GA4) — loaded only after consent ── */
function loadAnalytics() {
  if (!GA_MEASUREMENT_ID) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
}
