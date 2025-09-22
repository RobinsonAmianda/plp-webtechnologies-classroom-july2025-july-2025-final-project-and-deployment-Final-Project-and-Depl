/* ---------- Helper: Query shortcut ---------- */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/* ---------- Year injection (small DOM helper) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // Fill footer year(s)
  const y = new Date().getFullYear();
  ['year','year2','year3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = y;
  });
});

/* ---------- Mobile nav toggle ---------- */
function initMobileNav(toggleId, navId) {
  const toggle = document.getElementById(toggleId);
  const nav = document.getElementById(navId);
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    // toggle display via CSS class - simple approach
    nav.style.display = expanded ? 'none' : 'block';
  });

  // Close nav when a link is clicked (mobile)
  $$(navId ? '#' + navId + ' a' : 'nav a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        nav.style.display = 'none';
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// initialize mobile navs for each page header
initMobileNav('mobile-nav-toggle', 'primary-nav');
initMobileNav('mobile-nav-toggle-2', 'primary-nav-2');
initMobileNav('mobile-nav-toggle-3', 'primary-nav-3');

/* ---------- Slider Implementation ----------
   Demonstrates:
   - Local scope via closure
   - Functions with parameters and return values
   - Animation triggers via class changes
*/
(function initSlider() {
  const sliderRoot = $('#slider');
  if (!sliderRoot) return;

  const slides = $$('.slide', sliderRoot);
  const indicatorsRoot = $('#indicators');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');

  let current = 0;           // index of current slide (local variable)
  let autoplayInterval = 4000;
  let timer = null;

  // Create indicators dynamically
  slides.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', `Go to slide ${i+1}`);
    btn.dataset.index = String(i);
    if (i === 0) btn.classList.add('active');
    indicatorsRoot.appendChild(btn);
  });

  const indicators = $$('.indicators button');

  // Internal helper: show slide by index
  // params: idx (number) -> returns boolean success
  function showSlide(idx) {
    if (idx < 0 || idx >= slides.length) return false;
    // remove active on all slides
    slides.forEach(s => s.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));

    slides[idx].classList.add('active');
    indicators[idx].classList.add('active');
    current = idx;
    return true;
  }

  // Next & Prev
  function next() { showSlide((current + 1) % slides.length); }
  function prev() { showSlide((current - 1 + slides.length) % slides.length); }

  // Autoplay control
  function startAutoplay() { timer = setInterval(next, autoplayInterval); }
  function stopAutoplay() { if (timer) clearInterval(timer); timer = null; }

  // Event listeners
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });
  indicators.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number(e.currentTarget.dataset.index);
      showSlide(idx);
      resetAutoplay();
    });
  });

  // reset autoplay (useful after manual navigation)
  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Pause autoplay on hover for accessibility
  sliderRoot.addEventListener('mouseenter', stopAutoplay);
  sliderRoot.addEventListener('mouseleave', startAutoplay);

  // kick off
  showSlide(0);
  startAutoplay();

  // Expose for debugging (optional)
  window.__learningSlider = { showSlide, next, prev, startAutoplay, stopAutoplay };
})();

/* ---------- Contact Form Validation ----------
   Demonstrates:
   - Parameterized validation functions
   - Return values indicating result
   - DOM updates based on validation
*/
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  // DOM references
  const nameEl = $('#name');
  const emailEl = $('#email');
  const messageEl = $('#message');
  const successEl = $('#form-success');

  // small validators (parameters -> return boolean)
  function isRequired(val) { return typeof val === 'string' && val.trim().length > 0; }
  function isValidEmail(val) {
    // simple email regex (sufficient for demo)
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return re.test(val);
  }

  // Show & clear helper functions
  function showError(inputEl, msg) {
    const err = inputEl.parentElement.querySelector('.error');
    if (err) err.textContent = msg;
    inputEl.classList.add('input-error');
  }
  function clearError(inputEl) {
    const err = inputEl.parentElement.querySelector('.error');
    if (err) err.textContent = '';
    inputEl.classList.remove('input-error');
  }

  // Validate returns an object { valid: boolean, data: { name, email, message } }
  function validateForm() {
    // read values
    const name = nameEl.value || '';
    const email = emailEl.value || '';
    const message = messageEl.value || '';

    let valid = true;

    // name validation
    if (!isRequired(name)) {
      showError(nameEl, 'Please enter your full name.');
      valid = false;
    } else {
      clearError(nameEl);
    }

    // email validation
    if (!isRequired(email)) {
      showError(emailEl, 'Please enter your email.');
      valid = false;
    } else if (!isValidEmail(email)) {
      showError(emailEl, 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError(emailEl);
    }

    // message validation
    if (!isRequired(message) || message.trim().length < 10) {
      showError(messageEl, 'Message must be at least 10 characters.');
      valid = false;
    } else {
      clearError(messageEl);
    }

    return { valid, data: { name: name.trim(), email: email.trim(), message: message.trim() } };
  }

  // Submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    successEl.textContent = '';
    const result = validateForm();

    if (!result.valid) {
      // focus first invalid field for accessibility
      const firstError = form.querySelector('.input-error');
      if (firstError) firstError.focus();
      return;
    }

    // Simulate sending data (would be fetch() in real app)
    successEl.textContent = 'Sending...';
    setTimeout(() => {
      successEl.textContent = `Thanks ${result.data.name.split(' ')[0]}! Your message has been received.`;
      form.reset();
      // remove any lingering error styles
      [nameEl, emailEl, messageEl].forEach(clearError);
    }, 900);
  });
})();

/* ---------- Smooth scroll for same-page links (progressive enhancement) ---------- */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  if (!a.hash || a.origin !== location.origin) return; // only same-page anchors
  const target = document.querySelector(a.hash);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
    history.pushState(null, '', a.hash);
  }
});
