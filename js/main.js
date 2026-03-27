/* ============================================
   South Jordan Auto Insurance - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile Navigation ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav a');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      this.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Header Scroll Effect ---------- */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  /* ---------- Active Nav Highlighting ---------- */
  function setActiveNav() {
    var path = window.location.pathname.replace(/\/$/, '').split('/').pop() || 'index';
    path = path.replace('.html', '');
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      href = href.replace('./', '').replace('.html', '').replace(/\/$/, '') || 'index';
      link.classList.remove('active');
      if (href === path || (path === 'index' && (href === '' || href === './' || href === '.'))) {
        link.classList.add('active');
      }
    });
  }
  setActiveNav();

  /* ---------- FAQ Accordion ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function () {
        const isActive = item.classList.contains('active');
        // Close all
        faqItems.forEach(function (i) {
          i.classList.remove('active');
          var answer = i.querySelector('.faq-answer');
          if (answer) answer.style.maxHeight = null;
        });
        // Open clicked if it wasn't active
        if (!isActive) {
          item.classList.add('active');
          var answer = item.querySelector('.faq-answer');
          if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  /* ---------- Hero Zip Form Redirect ---------- */
  const heroForm = document.getElementById('heroZipForm');
  if (heroForm) {
    heroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var zip = document.getElementById('heroZip');
      if (zip && zip.value.trim().length === 5) {
        window.location.href = 'auto-insurance-quote#zip=' + encodeURIComponent(zip.value.trim());
      } else if (zip) {
        zip.style.borderColor = '#d63031';
        zip.focus();
        setTimeout(function () { zip.style.borderColor = ''; }, 2000);
      }
    });
  }

  /* ---------- Hash-Based Zip Pre-Fill ---------- */
  if (window.location.hash.indexOf('zip=') > -1) {
    var zipVal = window.location.hash.split('zip=')[1];
    if (zipVal) {
      zipVal = decodeURIComponent(zipVal.split('&')[0]);
      var zipField = document.getElementById('quoteZip') || document.querySelector('input[name="zip"]');
      if (zipField) {
        zipField.value = zipVal;
      }
    }
  }

  /* ---------- Multi-Step Form ---------- */
  const multiStepForm = document.getElementById('quoteForm');
  const formSteps = document.querySelectorAll('.form-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  const progressLines = document.querySelectorAll('.progress-line');
  let currentStep = 0;

  function showStep(step) {
    formSteps.forEach(function (s, i) {
      s.classList.toggle('active', i === step);
    });
    progressSteps.forEach(function (s, i) {
      s.classList.remove('active', 'completed');
      if (i === step) s.classList.add('active');
      if (i < step) s.classList.add('completed');
    });
    progressLines.forEach(function (l, i) {
      l.classList.toggle('active', i < step);
    });
    currentStep = step;
    // Scroll form into view
    var container = document.querySelector('.quote-form-container');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Next step button
  document.querySelectorAll('.btn-next-step').forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Validate current step required fields
      var currentStepEl = formSteps[currentStep];
      var requiredFields = currentStepEl.querySelectorAll('[required]');
      var valid = true;
      requiredFields.forEach(function (field) {
        if (!field.value.trim()) {
          field.style.borderColor = '#d63031';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      // Email validation
      var emailField = currentStepEl.querySelector('input[type="email"]');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.style.borderColor = '#d63031';
        valid = false;
      }
      // Phone validation
      var phoneField = currentStepEl.querySelector('input[type="tel"]');
      if (phoneField && phoneField.value && phoneField.value.replace(/\D/g, '').length < 10) {
        phoneField.style.borderColor = '#d63031';
        valid = false;
      }
      if (valid) {
        showStep(currentStep + 1);
      }
    });
  });

  // Previous step button
  document.querySelectorAll('.btn-prev-step').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showStep(currentStep - 1);
    });
  });

  /* ---------- Form Webhook POST ---------- */
  document.querySelectorAll('form[data-webhook]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var webhook = form.getAttribute('data-webhook');
      var submitBtn = form.querySelector('button[type="submit"]');
      var loader = form.querySelector('.form-loader');
      var statusEl = form.querySelector('.form-status');

      // Check consent
      var consentBox = form.querySelector('input[name="consent"]');
      if (consentBox && !consentBox.checked) {
        if (statusEl) {
          statusEl.className = 'form-status error';
          statusEl.textContent = 'Please agree to the consent checkbox to continue.';
          statusEl.style.display = 'block';
        }
        return;
      }

      // Gather data
      var formData = {};
      var entries = new FormData(form);
      entries.forEach(function (value, key) {
        formData[key] = value;
      });

      // Add metadata
      formData.source = window.location.href;
      formData.submitted_at = new Date().toISOString();
      formData.page_title = document.title;

      // Loading state
      if (submitBtn) submitBtn.disabled = true;
      if (loader) { loader.classList.add('active'); }
      if (statusEl) statusEl.style.display = 'none';

      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Submission failed');
          // Check if redirect needed
          var redirect = form.getAttribute('data-redirect');
          if (redirect) {
            window.location.href = redirect;
          } else {
            if (statusEl) {
              statusEl.className = 'form-status success';
              statusEl.textContent = 'Thank you! Your message has been sent successfully. We\'ll be in touch soon.';
              statusEl.style.display = 'block';
            }
            form.reset();
          }
        })
        .catch(function () {
          // Redirect anyway for quote forms
          var redirect = form.getAttribute('data-redirect');
          if (redirect) {
            window.location.href = redirect;
          } else if (statusEl) {
            statusEl.className = 'form-status success';
            statusEl.textContent = 'Thank you! Your message has been received.';
            statusEl.style.display = 'block';
            form.reset();
          }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
          if (loader) loader.classList.remove('active');
        });
    });
  });

  /* ---------- Smooth Scroll for Anchor Links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- Sticky Mobile CTA Show/Hide ---------- */
  var stickyCta = document.querySelector('.sticky-cta');
  if (stickyCta) {
    var lastScroll = 0;
    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      if (scrollY > 400) {
        stickyCta.style.transform = 'translateY(0)';
      } else {
        stickyCta.style.transform = 'translateY(100%)';
      }
      lastScroll = scrollY;
    });
    // Initial state
    stickyCta.style.transform = 'translateY(100%)';
    stickyCta.style.transition = 'transform 0.3s ease';
  }

  /* ---------- Phone Number Formatting ---------- */
  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener('input', function () {
      var val = this.value.replace(/\D/g, '').substring(0, 10);
      if (val.length >= 6) {
        this.value = '(' + val.substring(0, 3) + ') ' + val.substring(3, 6) + '-' + val.substring(6);
      } else if (val.length >= 3) {
        this.value = '(' + val.substring(0, 3) + ') ' + val.substring(3);
      }
    });
  });

  /* ---------- Form Loading Enhancer ---------- */
  document.querySelectorAll('.form-card form, .hero-form form').forEach(function (form) {
    var inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(function (input) {
      input.addEventListener('focus', function () {
        this.parentElement.classList.add('focused');
      });
      input.addEventListener('blur', function () {
        this.parentElement.classList.remove('focused');
        if (this.value.trim()) {
          this.parentElement.classList.add('filled');
        } else {
          this.parentElement.classList.remove('filled');
        }
      });
    });
  });

});
