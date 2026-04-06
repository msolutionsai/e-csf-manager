/* ============================================================
   e-CSF Manager — Production JavaScript
   ============================================================ */

(function () {
  'use strict';

  // ── Theme Management ────────────────────────────────────
  const ThemeManager = {
    init() {
      const saved = localStorage.getItem('ecsf-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = saved || (prefersDark ? 'dark' : 'light');
      this.set(theme, false);

      document.getElementById('themeToggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        this.set(current === 'dark' ? 'light' : 'dark', true);
      });

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('ecsf-theme')) {
          this.set(e.matches ? 'dark' : 'light', false);
        }
      });
    },
    set(theme, save) {
      document.documentElement.setAttribute('data-theme', theme);
      if (save) localStorage.setItem('ecsf-theme', theme);
    }
  };

  // ── Custom Cursor ───────────────────────────────────────
  const Cursor = {
    init() {
      if (window.matchMedia('(pointer: coarse)').matches) return;

      const cursor = document.getElementById('customCursor');
      const dot = document.getElementById('customCursorDot');
      let cx = 0, cy = 0, dx = 0, dy = 0;

      document.addEventListener('mousemove', (e) => {
        cx = e.clientX;
        cy = e.clientY;
        dot.style.left = cx + 'px';
        dot.style.top = cy + 'px';
      });

      const lerp = () => {
        dx += (cx - dx) * 0.15;
        dy += (cy - dy) * 0.15;
        cursor.style.left = dx + 'px';
        cursor.style.top = dy + 'px';
        requestAnimationFrame(lerp);
      };
      lerp();

      const interactives = 'a, button, input, select, textarea, [data-tilt]';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactives)) cursor.classList.add('hovering');
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactives)) cursor.classList.remove('hovering');
      });
    }
  };

  // ── Navbar Scroll ───────────────────────────────────────
  const Navbar = {
    init() {
      const nav = document.getElementById('navbar');
      let ticking = false;

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            nav.classList.toggle('scrolled', window.scrollY > 40);
            ticking = false;
          });
          ticking = true;
        }
      });

      // Mobile menu
      const toggle = document.getElementById('mobileMenuToggle');
      const links = document.getElementById('navLinks');
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
      });

      // Close on link click
      links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          toggle.classList.remove('active');
          links.classList.remove('open');
        });
      });
    }
  };

  // ── Hero 3D Grid ────────────────────────────────────────
  const HeroGrid = {
    init() {
      const canvas = document.getElementById('heroGrid');
      const ctx = canvas.getContext('2d');
      let w, h, mouseX = 0.5, mouseY = 0.5;
      let raf;

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio, 2);
        w = canvas.parentElement.offsetWidth;
        h = canvas.parentElement.offsetHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
      };

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
      });

      const draw = () => {
        ctx.clearRect(0, 0, w, h);

        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const lineColor = isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.06)';

        const spacing = 60;
        const perspectiveX = (mouseX - 0.5) * 30;
        const perspectiveY = (mouseY - 0.5) * 20;
        const vanishX = w * 0.5 + perspectiveX * 4;
        const vanishY = h * 0.35 + perspectiveY * 4;

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;

        // Horizontal lines with perspective
        for (let i = 0; i < 30; i++) {
          const t = i / 30;
          const y = vanishY + (h - vanishY) * Math.pow(t, 1.5);
          ctx.globalAlpha = t * 0.8;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Vertical lines converging to vanish point
        const numVLines = 20;
        for (let i = -numVLines; i <= numVLines; i++) {
          const baseX = vanishX + (i / numVLines) * w * 0.8;
          const bottomX = vanishX + (i / numVLines) * w * 1.5;
          const alpha = 1 - Math.abs(i / numVLines) * 0.7;
          ctx.globalAlpha = alpha * 0.6;
          ctx.beginPath();
          ctx.moveTo(vanishX + (baseX - vanishX) * 0.1, vanishY);
          ctx.lineTo(bottomX, h);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(draw);
      };

      resize();
      draw();
      window.addEventListener('resize', resize);
    }
  };

  // ── Hero Particles ──────────────────────────────────────
  const Particles = {
    init() {
      const container = document.getElementById('heroParticles');
      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 15 : 35;
      let mouseX = 0.5, mouseY = 0.5;

      const particles = [];
      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        const size = 2 + Math.random() * 3;
        p.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: var(--accent-blue);
          opacity: ${0.1 + Math.random() * 0.3};
          pointer-events: none;
        `;
        container.appendChild(p);
        particles.push({
          el: p,
          x: Math.random() * 100,
          y: Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.02,
          vy: (Math.random() - 0.5) * 0.02,
          baseX: Math.random() * 100,
          baseY: Math.random() * 100,
        });
      }

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
      });

      const animate = () => {
        particles.forEach((p) => {
          p.baseX += p.vx;
          p.baseY += p.vy;
          if (p.baseX > 100 || p.baseX < 0) p.vx *= -1;
          if (p.baseY > 100 || p.baseY < 0) p.vy *= -1;

          // Parallax effect
          const px = p.baseX + (mouseX - 0.5) * 8;
          const py = p.baseY + (mouseY - 0.5) * 8;

          p.el.style.left = px + '%';
          p.el.style.top = py + '%';
        });
        requestAnimationFrame(animate);
      };
      animate();
    }
  };

  // ── Scroll Reveal ───────────────────────────────────────
  const RevealManager = {
    init() {
      const elements = document.querySelectorAll('.reveal-up');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay || 0);
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      elements.forEach(el => observer.observe(el));
    }
  };

  // ── Feature Card Tilt ───────────────────────────────────
  const TiltCards = {
    init() {
      if (window.matchMedia('(pointer: coarse)').matches) return;

      document.querySelectorAll('[data-tilt]').forEach(card => {
        const glow = card.querySelector('.feature-glow');

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;

          const tiltX = (y - 0.5) * 8;
          const tiltY = (x - 0.5) * -8;

          card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;

          if (glow) {
            glow.style.left = e.clientX - rect.left + 'px';
            glow.style.top = e.clientY - rect.top + 'px';
          }
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        });
      });
    }
  };

  // ── Simulateur ──────────────────────────────────────────
  const Simulator = {
    init() {
      const slider = document.getElementById('tfpSlider');
      const input = document.getElementById('tfpInput');
      const giac = document.getElementById('giacCheck');
      const sliderWrap = document.querySelector('.sim-slider-wrap');
      const markerGiacTag = document.getElementById('markerGiacTag');
      const resultsPanel = document.getElementById('simResults');
      const plafondEl = document.getElementById('plafondAmount');
      const rembEl = document.getElementById('rembAmount');
      const gaugeFill = document.getElementById('simGaugeFill');
      const ruleEl = document.getElementById('simRule');
      const bonusBanner = document.getElementById('simGiacBonus');
      const bonusText = document.getElementById('simBonusText');

      const format = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      const parse = (s) => parseInt(s.replace(/\s/g, '').replace(/[^\d]/g, '')) || 0;

      const calculate = () => {
        // Use input value if it exceeds slider max (500k), otherwise use slider
        const inputVal = parse(input.value);
        const sliderVal = parseInt(slider.value);
        const tfp = (inputVal > 500000) ? inputVal : sliderVal;
        const hasGiac = giac.checked;

        // Calculate plafond based on GIAC state
        let plafond, rule;
        let plafondSans, plafondAvec; // for bonus calculation

        if (tfp < 20000) {
          plafondSans = tfp * 10;
          plafondAvec = tfp * 15;
          const mult = hasGiac ? 15 : 10;
          plafond = tfp * mult;
          rule = 'TFP < 20 000 DHS \u00b7 Multiplicateur \u00d7' + mult + ' \u00b7 R\u00e8gle OFPPT';
        } else if (tfp < 200000) {
          plafondSans = 200000;
          plafondAvec = 300000;
          plafond = hasGiac ? 300000 : 200000;
          rule = 'Tranche 20k\u2013200k \u00b7 Plafond ' + format(plafond) + ' DHS \u00b7 R\u00e8gle OFPPT';
        } else {
          plafondSans = tfp;
          plafondAvec = tfp;
          plafond = tfp;
          rule = 'TFP \u2265 200 000 DHS \u00b7 Plafond = TFP \u00b7 R\u00e8gle OFPPT';
        }

        const remb = Math.round(plafond * 0.7);
        const bonus = plafondAvec - plafondSans;
        const giacHasEffect = bonus > 0;

        // Update amounts
        plafondEl.textContent = format(plafond);
        rembEl.textContent = format(remb);
        ruleEl.textContent = rule;

        // Gauge (relative to max possible value)
        const maxRef = Math.max(plafond, 500000);
        gaugeFill.style.width = Math.min((plafond / maxRef) * 100, 100) + '%';

        // GIAC visual state
        const giacActive = hasGiac && giacHasEffect;
        resultsPanel.classList.toggle('giac-active', giacActive);

        // Bonus banner
        if (hasGiac && giacHasEffect) {
          bonusText.textContent = '+' + format(bonus) + ' DHS gr\u00e2ce \u00e0 l\'\u00e9tude GIAC';
          bonusBanner.classList.add('visible');
        } else if (hasGiac && !giacHasEffect) {
          bonusText.textContent = '\u00c9tude GIAC sans effet sur cette tranche (TFP \u2265 200k)';
          bonusBanner.classList.add('visible');
        } else {
          bonusBanner.classList.remove('visible');
        }

        // GIAC marker visibility
        if (sliderWrap) sliderWrap.classList.toggle('giac-on', hasGiac);
        if (markerGiacTag) markerGiacTag.style.opacity = hasGiac ? '1' : '0';

        // Sync input
        input.value = format(tfp);
      };

      slider.addEventListener('input', calculate);
      giac.addEventListener('change', calculate);

      input.addEventListener('input', () => {
        const val = parse(input.value);
        if (val >= 1000 && val <= 3000000) {
          // Sync slider only if within slider range
          slider.value = Math.min(val, 500000);
          calculate();
        }
      });

      input.addEventListener('blur', () => {
        const val = parse(input.value);
        const clamped = Math.max(1000, Math.min(3000000, val));
        slider.value = Math.min(clamped, 500000);
        input.value = format(clamped);
        calculate();
      });

      calculate();
    }
  };

  // ── Process Steps ────────────────────────────────────────
  const ProcessSteps = {
    current: 0,
    autoTimer: null,

    init() {
      const dots = document.querySelectorAll('.process-dot');
      const cards = document.querySelectorAll('.process-card');
      const fill = document.getElementById('processTrackFill');
      const grid = document.getElementById('processGrid');

      if (!dots.length || !cards.length || !fill) return;

      // Click handlers on dots and cards
      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => this.goTo(i));
      });
      cards.forEach((card, i) => {
        card.addEventListener('click', () => this.goTo(i));
      });

      // Auto-advance when section is in view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.startAutoPlay();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      if (grid) observer.observe(grid);
    },

    goTo(step) {
      const dots = document.querySelectorAll('.process-dot');
      const cards = document.querySelectorAll('.process-card');
      const fill = document.getElementById('processTrackFill');

      this.current = step;

      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.remove('active', 'completed');
        if (i < step) dot.classList.add('completed');
        if (i === step) dot.classList.add('active');
      });

      // Update cards
      cards.forEach((card, i) => {
        card.classList.remove('active');
        if (i === step) card.classList.add('active');
      });

      // Update progress bar
      const pct = (step / (dots.length - 1)) * 100;
      fill.style.width = pct + '%';

      // Reset auto-play timer
      this.resetAutoPlay();
    },

    startAutoPlay() {
      // Initial animation: reveal cards one by one
      const cards = document.querySelectorAll('.process-card');
      cards.forEach((card, i) => {
        setTimeout(() => {
          this.goTo(i);
        }, i * 1200);
      });

      // Then start cycling
      setTimeout(() => {
        this.autoTimer = setInterval(() => {
          const next = (this.current + 1) % 4;
          this.goTo(next);
        }, 3000);
      }, 4 * 1200 + 2000);
    },

    resetAutoPlay() {
      clearInterval(this.autoTimer);
      this.autoTimer = setInterval(() => {
        const next = (this.current + 1) % 4;
        this.goTo(next);
      }, 4000);
    }
  };

  // ── Metric Counters ─────────────────────────────────────
  const MetricCounters = {
    init() {
      const metrics = document.querySelectorAll('.metric-value');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            const duration = 2000;
            const start = performance.now();

            const animate = (now) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const ease = 1 - Math.pow(1 - progress, 4);
              const current = Math.round(target * ease);
              el.textContent = prefix + current + suffix;

              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });

      metrics.forEach(m => observer.observe(m));
    }
  };

  // ── Custom Selects ───────────────────────────────────────
  const CustomSelects = {
    init() {
      document.querySelectorAll('.form-field select').forEach(sel => {
        const wrapper = sel.closest('.form-field');
        const options = Array.from(sel.options);

        // Build custom dropdown
        const cs = document.createElement('div');
        cs.className = 'custom-select';

        // Trigger button
        const trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger placeholder';
        trigger.innerHTML = '<span>' + (sel.options[sel.selectedIndex]?.text || 'S\u00e9lectionnez...') + '</span>' +
          '<svg viewBox="0 0 14 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 1l6 6 6-6"/></svg>';
        cs.appendChild(trigger);

        // Dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'custom-select-dropdown';
        options.forEach((opt, i) => {
          if (i === 0 && opt.disabled) return; // skip placeholder
          const item = document.createElement('div');
          item.className = 'custom-select-option';
          item.textContent = opt.text;
          item.dataset.value = opt.value || opt.text;
          item.addEventListener('click', (e) => {
            e.stopPropagation();
            // Update native select
            sel.value = opt.value || opt.text;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            // Update UI
            trigger.querySelector('span').textContent = opt.text;
            trigger.classList.remove('placeholder');
            dropdown.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
            item.classList.add('selected');
            cs.classList.remove('open');
            // Validate
            const field = wrapper.querySelector('select');
            if (field) field.dispatchEvent(new Event('input', { bubbles: true }));
          });
          dropdown.appendChild(item);
        });
        cs.appendChild(dropdown);

        // Toggle
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          // Close all others first
          document.querySelectorAll('.custom-select.open').forEach(other => {
            if (other !== cs) other.classList.remove('open');
          });
          cs.classList.toggle('open');
        });

        // Insert after native select (which is hidden via CSS)
        sel.parentNode.insertBefore(cs, sel.nextSibling);
      });

      // Close all dropdowns on outside click
      document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select.open').forEach(cs => {
          cs.classList.remove('open');
        });
      });
    }
  };

  // ── Form Handling ───────────────────────────────────────
  const FormHandler = {
    init() {
      const form = document.getElementById('accessForm');
      const successEl = document.getElementById('formSuccess');
      if (!form) return;

      // Init custom selects first
      CustomSelects.init();

      // Helper: validate a single field
      const validateField = (field) => {
        const wrapper = field.closest('.form-field');
        if (!wrapper || !wrapper.hasAttribute('data-required')) return true;

        let valid = false;
        if (field.type === 'email') {
          valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        } else {
          valid = field.value.trim() !== '';
        }

        wrapper.classList.toggle('has-error', !valid);
        wrapper.classList.toggle('is-valid', valid);
        return valid;
      };

      // Real-time: clear error on input
      form.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', () => {
          const wrapper = field.closest('.form-field');
          if (wrapper && wrapper.classList.contains('has-error')) {
            validateField(field);
          }
        });
        field.addEventListener('change', () => {
          const wrapper = field.closest('.form-field');
          if (wrapper && wrapper.classList.contains('has-error')) {
            validateField(field);
          }
        });
        // Validate on blur only if user has interacted
        field.addEventListener('blur', () => {
          if (field.value) validateField(field);
        });
      });

      // Submit
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate all required fields
        let allValid = true;
        form.querySelectorAll('.form-field[data-required] input, .form-field[data-required] select').forEach(f => {
          if (!validateField(f)) allValid = false;
        });

        if (!allValid) return;

        // Simulate send
        const btn = form.querySelector('.btn-submit');
        btn.classList.add('loading');

        setTimeout(() => {
          form.style.opacity = '0';
          form.style.transform = 'translateY(-20px)';
          form.style.transition = 'all 0.5s ease';

          setTimeout(() => {
            form.style.display = 'none';
            successEl.classList.add('show');
          }, 500);
        }, 1500);
      });
    }
  };

  // ── Smooth Scroll ───────────────────────────────────────
  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (href === '#') return;
          const section = document.querySelector(href);
          if (section) {
            e.preventDefault();
            const navHeight = document.querySelector('.navbar').offsetHeight;
            // Scroll to the section title (h2) instead of the section top
            // This skips the large padding and lands right on the content
            const title = section.querySelector('.section-title, .form-header, .sim-panel-title, .timeline');
            const scrollTarget = title || section;
            const gap = 32; // space between navbar and title
            const top = scrollTarget.getBoundingClientRect().top + window.pageYOffset - navHeight - gap;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        });
      });
    }
  };

  // ── Hero Title Reveal ───────────────────────────────────
  const HeroReveal = {
    init() {
      // Trigger initial reveals after a short delay
      setTimeout(() => {
        document.querySelectorAll('.hero .reveal-up').forEach(el => {
          const delay = parseInt(el.dataset.delay || 0);
          setTimeout(() => el.classList.add('revealed'), delay);
        });
      }, 200);
    }
  };

  // ── FAQ ──────────────────────────────────────────────────
  const FAQ = {
    init() {
      const pills = document.querySelectorAll('.faq-pill');
      const panels = document.querySelectorAll('.faq-panel');
      const scan = document.getElementById('faqScan');
      const toast = document.getElementById('faqToast');
      let activeCat = 0;
      let switching = false;
      let switchTimer = null;

      // Set initial accent
      if (pills[0]) pills[0].style.setProperty('--faq-accent', pills[0].dataset.accent);

      // Easter egg tracking
      const catTimers = {};
      const catOpened = {};

      // ── Category switching ──
      pills.forEach((pill, i) => {
        pill.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (i === activeCat || switching) return;
          switching = true;

          // Safety: force-unlock after 600ms in case something goes wrong
          clearTimeout(switchTimer);
          switchTimer = setTimeout(() => { switching = false; }, 600);

          const oldPanel = document.querySelector('.faq-panel.active');
          const newPanel = document.querySelector('[data-panel="' + i + '"]');
          if (!oldPanel || !newPanel) { switching = false; return; }

          const accent = pill.dataset.accent;

          // Update pills
          pills.forEach(p => {
            p.classList.remove('active');
            p.style.removeProperty('--faq-accent');
          });
          pill.classList.add('active');
          pill.style.setProperty('--faq-accent', accent);

          // Scan effect (desktop only)
          if (scan && window.innerWidth > 768) {
            scan.style.background = 'linear-gradient(90deg, transparent, ' + accent + ', transparent)';
            scan.classList.remove('active');
            void scan.offsetWidth;
            scan.classList.add('active');
          }

          // Exit old panel
          oldPanel.style.transition = 'opacity 180ms ease-in, transform 180ms ease-in';
          oldPanel.style.opacity = '0';
          oldPanel.style.transform = 'translateX(-20px)';

          setTimeout(() => {
            // Reset old panel
            oldPanel.classList.remove('active');
            oldPanel.style.opacity = '';
            oldPanel.style.transform = '';
            oldPanel.style.transition = '';
            // Force-close all items in old panel
            oldPanel.querySelectorAll('.faq-item').forEach(item => {
              item.classList.remove('open', 'closing', 'compressed');
              const tog = item.querySelector('.faq-toggle svg');
              if (tog) tog.style.color = '';
            });

            // Enter new panel
            newPanel.style.setProperty('--faq-accent', accent);
            newPanel.classList.add('active');
            newPanel.style.opacity = '0';
            newPanel.style.transform = 'translateX(20px)';

            // Set accent on all items
            newPanel.querySelectorAll('.faq-item').forEach(item => {
              item.style.setProperty('--faq-accent', accent);
            });

            requestAnimationFrame(() => {
              newPanel.style.transition = 'opacity 220ms ease-out, transform 220ms ease-out';
              newPanel.style.opacity = '1';
              newPanel.style.transform = 'translateX(0)';
            });

            setTimeout(() => {
              newPanel.style.transition = '';
              newPanel.style.opacity = '';
              newPanel.style.transform = '';
              switching = false;
              clearTimeout(switchTimer);
            }, 260);

            activeCat = i;
          }, 200);
        });
      });

      // ── Accordion ──
      document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          const item = btn.closest('.faq-item');
          const panel = item.closest('.faq-panel');
          if (!panel || !panel.classList.contains('active')) return;

          const accent = panel.dataset.accent;
          const answer = item.querySelector('.faq-answer');
          const inner = item.querySelector('.faq-answer-inner');
          if (!answer || !inner) return;

          const isOpen = item.classList.contains('open');

          // Set accent
          panel.style.setProperty('--faq-accent', accent);
          item.style.setProperty('--faq-accent', accent);

          if (isOpen) {
            // ── Close ──
            item.classList.add('closing');
            item.classList.remove('open');

            setTimeout(() => {
              item.classList.remove('closing');
              panel.querySelectorAll('.faq-item').forEach(o => o.classList.remove('compressed'));
            }, 350);

            const toggle = btn.querySelector('.faq-toggle svg');
            if (toggle) toggle.style.color = '';
          } else {
            // ── Open ──
            item.classList.add('open');

            // Compress siblings
            panel.querySelectorAll('.faq-item').forEach(other => {
              if (other !== item && !other.classList.contains('open')) {
                other.classList.add('compressed');
              }
            });

            const toggle = btn.querySelector('.faq-toggle svg');
            if (toggle) toggle.style.color = accent;

            // Easter egg
            const catIdx = panel.dataset.panel;
            if (!catOpened[catIdx]) {
              catOpened[catIdx] = new Set();
              catTimers[catIdx] = Date.now();
            }
            const allItems = panel.querySelectorAll('.faq-item');
            catOpened[catIdx].add(Array.from(allItems).indexOf(item));

            if (catOpened[catIdx].size === allItems.length) {
              const elapsed = Date.now() - catTimers[catIdx];
              if (elapsed < 10000 && toast) {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3500);
              }
              delete catOpened[catIdx];
              delete catTimers[catIdx];
            }
          }
        });
      });

      // Set initial panel accent
      const firstPanel = document.querySelector('.faq-panel.active');
      if (firstPanel) {
        const a = firstPanel.dataset.accent;
        firstPanel.style.setProperty('--faq-accent', a);
        firstPanel.querySelectorAll('.faq-item').forEach(item => {
          item.style.setProperty('--faq-accent', a);
        });
      }

      // Scroll reveal
      this.initReveal();
    },

    initReveal() {
      const section = document.getElementById('faq');
      if (!section) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Title clip-path reveal
            const title = section.querySelector('.faq-title');
            if (title) setTimeout(() => title.classList.add('revealed'), 200);

            // Subtitle
            const sub = section.querySelector('.section-subtitle');
            if (sub) {
              sub.style.opacity = '0';
              sub.style.transform = 'translateY(10px)';
              sub.style.transition = 'opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s';
              requestAnimationFrame(() => requestAnimationFrame(() => {
                sub.style.opacity = '1';
                sub.style.transform = 'translateY(0)';
              }));
            }

            // Pill stagger
            section.querySelectorAll('.faq-pill').forEach((pill, i) => {
              pill.style.opacity = '0';
              pill.style.transform = 'translateX(-20px)';
              pill.style.transition = 'opacity 0.4s ease ' + (300 + i * 80) + 'ms, transform 0.4s ease ' + (300 + i * 80) + 'ms';
              requestAnimationFrame(() => requestAnimationFrame(() => {
                pill.style.opacity = '1';
                pill.style.transform = 'translateX(0)';
              }));
            });

            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      observer.observe(section);
    }
  };

  // ── Init All ────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    Cursor.init();
    Navbar.init();
    HeroGrid.init();
    Particles.init();
    HeroReveal.init();
    RevealManager.init();
    TiltCards.init();
    Simulator.init();
    ProcessSteps.init();
    MetricCounters.init();
    FAQ.init();
    FormHandler.init();
    SmoothScroll.init();
  });

})();
