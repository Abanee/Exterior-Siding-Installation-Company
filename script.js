/**
 * ==========================================================================
 * SIDINGPRO ARCHITECTURAL PLATFORM - MASTER UNIFIED JAVASCRIPT ENGINE
 * Manages Theme, Direction (LTR/RTL), Scroll Observers, Mobile Drawer,
 * Universal Form Handling, and Page-Specific Modules for Home 1, Home 2 & About.
 * ==========================================================================
 */

(() => {
  'use strict';

  // --- 1. THEME CONTROLLER (Light / Dark) ---
  const THEME_KEY = 'siding_theme';
  const html = document.documentElement;

  const getInitialTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* ignore storage errors */
    }

    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      const iconEmoji = btn.querySelector('.theme-emoji');
      if (iconEmoji) {
        iconEmoji.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
      const iconSun = btn.querySelector('.icon-sun');
      const iconMoon = btn.querySelector('.icon-moon');
      if (iconSun && iconMoon) {
        iconSun.style.display = theme === 'dark' ? 'block' : 'none';
        iconMoon.style.display = theme === 'dark' ? 'none' : 'block';
      }
    });
  };

  const toggleTheme = () => {
    const current = html.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  };

  // Immediate theme application to prevent FOUC
  applyTheme(getInitialTheme());

  // --- 2. DIRECTION CONTROLLER (LTR / RTL) ---
  const DIR_KEY = 'siding_direction';

  const getInitialDir = () => {
    try {
      return localStorage.getItem(DIR_KEY) || 'ltr';
    } catch (e) {
      return 'ltr';
    }
  };

  const applyDir = (dir) => {
    html.setAttribute('dir', dir);
    try {
      localStorage.setItem(DIR_KEY, dir);
    } catch (e) {
      /* ignore storage errors */
    }

    document.querySelectorAll('.dir-toggle').forEach(btn => {
      btn.setAttribute('aria-label', `Switch to ${dir === 'rtl' ? 'LTR' : 'RTL'}`);
      const text = btn.querySelector('.dir-toggle-text') || btn;
      if (text) {
        text.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
      }
    });
  };

  const toggleDir = () => {
    const current = html.getAttribute('dir') || 'ltr';
    const next = current === 'rtl' ? 'ltr' : 'rtl';
    applyDir(next);

    // Ensure any open drawer is reset cleanly when switching modes
    const drawer = document.querySelector('.mobile-drawer');
    const backdrop = document.querySelector('.drawer-backdrop');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (drawer) drawer.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-open');
    if (mobileBtn) {
      mobileBtn.classList.remove('is-active');
      mobileBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  };

  // Immediate direction application
  applyDir(getInitialDir());

  // --- 3. DOM READY INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    // Sync current state to UI elements
    applyTheme(html.getAttribute('data-theme') || 'light');
    applyDir(html.getAttribute('dir') || 'ltr');

    // Attach click events to Theme & Direction toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    document.querySelectorAll('.dir-toggle').forEach(btn => {
      btn.addEventListener('click', toggleDir);
    });

    // Update current year dynamically
    document.querySelectorAll('.current-year').forEach(el => {
      el.textContent = new Date().getFullYear();
    });

    // --- 4. HEADER SCROLL STATE ---
    const header = document.querySelector('.site-header');

    const updateScrollMetrics = () => {
      const scrollY = window.scrollY;
      if (header) {
        header.classList.toggle('is-scrolled', scrollY > 20);
      }
    };

    window.addEventListener('scroll', updateScrollMetrics, { passive: true });
    updateScrollMetrics();

    // --- 5. ACCESSIBLE MOBILE DRAWER NAVIGATION ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    let drawer = document.querySelector('.mobile-drawer');
    let backdrop = document.querySelector('.drawer-backdrop');

    // Dynamically build mobile drawer if not already in markup
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.className = 'mobile-drawer';
      drawer.id = 'mobileDrawer';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      drawer.setAttribute('aria-label', 'Mobile navigation menu');

      backdrop = document.createElement('div');
      backdrop.className = 'drawer-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');

      // Populate with navigation links
      const currentPath = window.location.pathname;
      const isHome1 = currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '';
      const isHome2 = currentPath.endsWith('home2.html');
      const isAbout = currentPath.endsWith('about.html');
      const isProducts = currentPath.endsWith('products.html');
      const isPricing = currentPath.endsWith('pricing.html');
      const isGallery = currentPath.endsWith('gallery.html');
      const isContact = currentPath.endsWith('contact.html');

      drawer.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-block-end:1.5rem;padding-block-end:1rem;border-block-end:1px solid var(--border-subtle);">
          <div class="site-logo" style="font-size:1.15rem;">
            <img src="images/Logo.png" alt="SidingPro Logo" class="site-logo-img" style="height:30px;width:auto;">
            <span class="site-logo-text">Siding<b>Pro</b></span>
          </div>
          <button type="button" class="drawer-close-btn" aria-label="Close navigation" style="background:var(--bg-subtle);border:1px solid var(--border-subtle);width:32px;height:32px;border-radius:var(--radius-full);font-size:0.9rem;cursor:pointer;color:var(--text-main);display:grid;place-items:center;">✕</button>
        </div>

        <nav class="drawer-nav-list" aria-label="Mobile Navigation">
          <a href="index.html" class="drawer-nav-link ${isHome1 ? 'active' : ''}">
            <span>Home</span>
            <span style="font-size:0.8rem;opacity:0.6;">01</span>
          </a>
          <a href="home2.html" class="drawer-nav-link ${isHome2 ? 'active' : ''}">
            <span>Home 2</span>
            <span style="font-size:0.8rem;opacity:0.6;">02</span>
          </a>
          <a href="about.html" class="drawer-nav-link ${isAbout ? 'active' : ''}">
            <span>About</span>
            <span style="font-size:0.8rem;opacity:0.6;">03</span>
          </a>
          <a href="products.html" class="drawer-nav-link ${isProducts ? 'active' : ''}">
            <span>Products</span>
            <span style="font-size:0.8rem;opacity:0.6;">04</span>
          </a>
          <a href="pricing.html" class="drawer-nav-link ${isPricing ? 'active' : ''}">
            <span>Pricing</span>
            <span style="font-size:0.8rem;opacity:0.6;">05</span>
          </a>
          <a href="gallery.html" class="drawer-nav-link ${isGallery ? 'active' : ''}">
            <span>Gallery</span>
            <span style="font-size:0.8rem;opacity:0.6;">06</span>
          </a>
          <a href="contact.html" class="drawer-nav-link ${isContact ? 'active' : ''}">
            <span>Contact</span>
            <span style="font-size:0.8rem;opacity:0.6;">07</span>
          </a>
        </nav>

        <div style="margin-block-start:auto;padding-block-start:1.5rem;border-block-start:1px solid var(--border-subtle);display:flex;flex-direction:column;gap:0.75rem;">
          <a href="login.html" class="btn btn-login" style="text-align:center;width:100%;">
            <span>Log In</span>
          </a>
          <a href="tel:+15550100" class="btn btn-primary btn-sm" style="width:100%;">
            <span>Call (555) 010-0100</span>
          </a>
        </div>
      `;

      document.body.appendChild(backdrop);
      document.body.appendChild(drawer);

      const drawerCloseBtn = drawer.querySelector('.drawer-close-btn');
      if (drawerCloseBtn) {
        drawerCloseBtn.addEventListener('click', () => closeDrawer());
      }
    }

    const openDrawer = () => {
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      if (mobileBtn) {
        mobileBtn.classList.add('is-active');
        mobileBtn.setAttribute('aria-expanded', 'true');
      }
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      if (mobileBtn) {
        mobileBtn.classList.remove('is-active');
        mobileBtn.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    };

    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        const isOpen = drawer.classList.contains('is-open');
        isOpen ? closeDrawer() : openDrawer();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    // Close drawer on pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });

    // Close drawer when clicking any link inside
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // --- 6. SCROLL REVEAL OBSERVER (.rv) ---
    document.documentElement.classList.add('js-ready');
    const revealElements = document.querySelectorAll('.rv');
    if (revealElements.length > 0) {
      if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const revealObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

        const windowHeight = window.innerHeight;
        revealElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < windowHeight) {
            el.classList.add('is-in');
          } else {
            revealObserver.observe(el);
          }
        });
      } else {
        revealElements.forEach(el => el.classList.add('is-in'));
      }
    }

    // --- 7. ANIMATED NUMBER COUNTERS ([data-n]) ---
    const counterElements = document.querySelectorAll('[data-n]');
    if (counterElements.length > 0 && 'IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          counterObserver.unobserve(entry.target);

          const targetNumber = parseInt(entry.target.getAttribute('data-n'), 10);
          const startTime = performance.now();
          const duration = 1800; // ms

          const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.round(targetNumber * easeProgress);
            entry.target.textContent = currentVal.toLocaleString();

            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };

          requestAnimationFrame(step);
        });
      }, { threshold: 0.25 });

      counterElements.forEach(el => counterObserver.observe(el));
    }

    // --- 8. PARALLAX EFFECT ([data-speed]) ---
    const parallaxItems = document.querySelectorAll('[data-speed]');
    if (parallaxItems.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let ticking = false;
      const updateParallax = () => {
        const windowHeight = window.innerHeight;
        parallaxItems.forEach(el => {
          const rect = el.parentElement.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < windowHeight) {
            const speed = parseFloat(el.getAttribute('data-speed')) || 0.15;
            const yPos = rect.top * -speed;
            el.style.transform = `translateY(${yPos}px)`;
          }
        });
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateParallax);
        }
      }, { passive: true });
      updateParallax();
    }

    // --- 9. HOME 1 MODULE: BEFORE / AFTER COMPARISON SLIDER ---
    const baContainer = document.getElementById('ba');
    if (baContainer) {
      const rangeInput = baContainer.querySelector('input[type="range"]');

      const updateSlider = (val) => {
        baContainer.style.setProperty('--pos', `${val}%`);
      };

      if (rangeInput) {
        rangeInput.addEventListener('input', (e) => {
          updateSlider(e.target.value);
        });

        // Subtle initial hint oscillation
        let hasInteracted = false;
        const cancelOscillation = () => { hasInteracted = true; };
        ['pointerdown', 'touchstart', 'keydown'].forEach(evt => {
          rangeInput.addEventListener(evt, cancelOscillation, { once: true });
        });

        if ('IntersectionObserver' in window) {
          const hintObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
              hintObserver.disconnect();
              let step = 0;
              const animateHint = () => {
                step += 0.04;
                if (step < Math.PI * 1.5 && !hasInteracted) {
                  const waveVal = 50 + 20 * Math.sin(step) * (1 - step / 5);
                  updateSlider(waveVal.toFixed(1));
                  rangeInput.value = waveVal;
                  requestAnimationFrame(animateHint);
                } else if (!hasInteracted) {
                  updateSlider(50);
                  rangeInput.value = 50;
                }
              };
              requestAnimationFrame(animateHint);
            }
          }, { threshold: 0.4 });
          hintObserver.observe(baContainer);
        }
      }
    }

    // --- 10. HOME 2 MODULE: COLOR STUDIO & HOTSPOTS ---
    const swatchBtns = document.querySelectorAll('.swatch-item-btn');
    const overlay = document.getElementById('studioColorOverlay');
    const badge = document.getElementById('studioBadge');

    const swatchData = {
      charcoal: { color: '#2a3135', label: 'Charcoal + Crisp White Trim', blend: 'color', opacity: '0.45' },
      warmgray: { color: '#6e6962', label: 'Warm Gray + Natural Cedar Accents', blend: 'color', opacity: '0.4' },
      deepgreen: { color: '#213a2d', label: 'Deep Architectural Green + Cream', blend: 'color', opacity: '0.48' },
      softsand: { color: '#9e917d', label: 'Soft Sandstone + Dark Bronze Trim', blend: 'color', opacity: '0.38' },
      classicwhite: { color: '#e2e6e3', label: 'Classic Chalk White + Black Accents', blend: 'screen', opacity: '0.3' }
    };

    if (swatchBtns.length > 0 && overlay) {
      swatchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          swatchBtns.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');

          const scheme = btn.dataset.scheme;
          const config = swatchData[scheme];
          if (config) {
            overlay.style.backgroundColor = config.color;
            overlay.style.mixBlendMode = config.blend;
            overlay.style.opacity = config.opacity;
            if (badge) {
              badge.textContent = config.label;
            }
          }
        });
      });
    }

    // Craftsmanship Hotspots
    const hotspots = document.querySelectorAll('.craft-hotspot');
    hotspots.forEach(hotspot => {
      const pin = hotspot.querySelector('.craft-hotspot-pin');
      if (pin) {
        pin.addEventListener('click', (e) => {
          e.stopPropagation();
          const wasOpen = hotspot.classList.contains('is-open');
          hotspots.forEach(h => h.classList.remove('is-open'));
          if (!wasOpen) {
            hotspot.classList.add('is-open');
          }
        });
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.craft-hotspot')) {
        hotspots.forEach(h => h.classList.remove('is-open'));
      }
    });

    // --- 11. UNIVERSAL FORM VALIDATION ENGINE ---
    const setupFormValidation = (formId, successBannerId) => {
      const form = document.getElementById(formId);
      const successBanner = document.getElementById(successBannerId);
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
        requiredFields.forEach(field => {
          const val = field.value.trim();
          const formGroup = field.closest('.form-group') || field.parentElement;

          if (!val) {
            formGroup.classList.add('has-error');
            isValid = false;
          } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            formGroup.classList.add('has-error');
            isValid = false;
          } else {
            formGroup.classList.remove('has-error');
          }

          field.addEventListener('input', () => {
            formGroup.classList.remove('has-error');
          }, { once: true });
        });

        if (isValid) {
          form.reset();
          if (successBanner) {
            successBanner.style.display = 'block';
            successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            setTimeout(() => {
              successBanner.style.display = 'none';
            }, 6000);
          }
        }
      });
    };

    // Initialize all forms on the platform
    setupFormValidation('estimateForm', 'estimateSuccess');
    setupFormValidation('consultForm', 'consultSuccess');
    setupFormValidation('aboutContactForm', 'aboutSuccess');
    setupFormValidation('contactPageForm', 'contactPageSuccess');
    setupFormValidation('pricingEstimateForm', 'pricingEstimateSuccess');

    // --- 12. LOGIN MODAL CONTROLLER ---
    const loginModal = document.getElementById('loginModal');
    const closeBtns = document.querySelectorAll('.modal-close-btn');

    const openLoginModal = () => {
      if (typeof closeDrawer === 'function') closeDrawer();
      if (loginModal) {
        loginModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        const firstInput = loginModal.querySelector('input');
        if (firstInput) firstInput.focus();
      }
    };

    const closeLoginModal = () => {
      if (loginModal) {
        loginModal.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    };

    // Delegated click handler for login modal (only when explicitly requested via data attribute)
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-open-modal="login"]');
      if (target) {
        e.preventDefault();
        openLoginModal();
      }
    });

    closeBtns.forEach(btn => {
      btn.addEventListener('click', closeLoginModal);
    });

    if (loginModal) {
      loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) closeLoginModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && loginModal && loginModal.classList.contains('is-open')) {
        closeLoginModal();
      }
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const successMsg = document.getElementById('loginSuccessMsg');
        if (successMsg) {
          successMsg.style.display = 'block';
          setTimeout(() => {
            closeLoginModal();
            successMsg.style.display = 'none';
            loginForm.reset();
          }, 1500);
        }
      });
    }

    // --- 13. PRODUCTS SHOWROOM INTERACTIVE CONTROLLERS ---
    // A. Material Segmented Navigation
    const prodMatBtns = document.querySelectorAll('.prod-mat-btn');
    if (prodMatBtns.length > 0) {
      prodMatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          prodMatBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const targetId = btn.getAttribute('data-target');
          if (targetId) {
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
              const headerOffset = 140;
              const elPos = targetEl.getBoundingClientRect().top + window.scrollY - headerOffset;
              window.scrollTo({ top: elPos, behavior: 'smooth' });
            }
          }
        });
      });
    }

    // B. Interactive Decision Guide
    const priorityBtns = document.querySelectorAll('.priority-btn');
    const resultBadge = document.getElementById('decisionResultBadge');
    const resultTitle = document.getElementById('decisionResultTitle');
    const resultDesc = document.getElementById('decisionResultDesc');

    const decisionProfiles = {
      maintenance: {
        badge: "Recommended Starting Point",
        title: "Architectural Insulated Vinyl Siding",
        desc: "For homeowners whose primary concern is zero scraping, no painting cycles, and durable impact resistance, modern insulated vinyl offers high thermal barrier ratings with minimal lifetime upkeep."
      },
      natural: {
        badge: "Recommended Starting Point",
        title: "Western Red Cedar Wood Cladding",
        desc: "If authentic organic grain, natural warmth, and timeless architectural prestige are paramount, Western Red Cedar brings aromatic beauty and acoustic damping unmatched by synthetic products."
      },
      durability: {
        badge: "Recommended Starting Point",
        title: "Engineered Fiber Cement Siding",
        desc: "For maximum structural permanence, non-combustible Class A fire safety, and deep architectural shadow reveals that resist rot, woodpeckers, and severe storms, fiber cement is the gold standard."
      },
      budget: {
        badge: "Recommended Starting Point",
        title: "Premium Vinyl or Fiber Cement Accent Hybrid",
        desc: "A strategic combination using durable vinyl on secondary elevations with fiber cement on the primary street-facing facade balances overall project cost while preserving dramatic curb appeal."
      }
    };

    if (priorityBtns.length > 0 && resultTitle && resultDesc) {
      priorityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          priorityBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const priorityKey = btn.getAttribute('data-priority');
          const profile = decisionProfiles[priorityKey];
          if (profile) {
            if (resultBadge) resultBadge.textContent = profile.badge;
            resultTitle.textContent = profile.title;
            resultDesc.textContent = profile.desc;
          }
        });
      });
    }

    // --- 14. GALLERY INTERACTIVE CONTROLLERS (Filter & Real-Time Search) ---
    const filterPills = document.querySelectorAll('.filter-pill');
    const galleryCards = document.querySelectorAll('.gallery-card');
    const searchInput = document.getElementById('gallerySearchInput');
    const searchClear = document.getElementById('gallerySearchClear');
    const galleryGrid = document.getElementById('galleryGrid');
    const viewMoreBtn = document.getElementById('viewMoreGalleryBtn');
    const counterLabel = document.getElementById('galleryCounterLabel');
    const lightbox = document.getElementById('galleryLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxSpecs = document.getElementById('lightboxSpecs');
    const closeLightboxBtn = document.getElementById('closeLightboxBtn');

    let currentCategoryFilter = 'all';
    let currentSearchQuery = '';

    const applyGalleryFilters = () => {
      let visibleCount = 0;

      galleryCards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').toLowerCase();
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const specs = (card.getAttribute('data-specs') || '').toLowerCase();
        const loc = (card.getAttribute('data-loc') || '').toLowerCase();
        const bodyText = (card.querySelector('.gallery-card-body')?.textContent || '').toLowerCase();

        const matchesCategory = (currentCategoryFilter === 'all') || categories.includes(currentCategoryFilter);
        const matchesSearch = !currentSearchQuery || 
          title.includes(currentSearchQuery) || 
          specs.includes(currentSearchQuery) || 
          loc.includes(currentSearchQuery) || 
          categories.includes(currentSearchQuery) ||
          bodyText.includes(currentSearchQuery);

        if (matchesCategory && matchesSearch) {
          card.style.display = '';
          card.classList.remove('is-hidden');
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Handle No Results Message
      let noResultsMsg = document.getElementById('galleryNoResults');
      if (visibleCount === 0) {
        if (!noResultsMsg && galleryGrid) {
          noResultsMsg = document.createElement('div');
          noResultsMsg.id = 'galleryNoResults';
          noResultsMsg.className = 'gallery-no-results';
          noResultsMsg.innerHTML = `
            <h3>No transformations found</h3>
            <p>Try searching for a different material, architectural style, or clear your search.</p>
          `;
          galleryGrid.appendChild(noResultsMsg);
        } else if (noResultsMsg) {
          noResultsMsg.style.display = 'block';
        }
      } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
      }

      if (counterLabel) {
        counterLabel.textContent = `Showing ${visibleCount} of ${galleryCards.length} Projects`;
      }
      if (viewMoreBtn) {
        viewMoreBtn.style.display = (currentCategoryFilter === 'all' && !currentSearchQuery && visibleCount < galleryCards.length) ? 'inline-flex' : 'none';
      }
    };

    // A. Category Filter Buttons
    if (filterPills.length > 0) {
      filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
          filterPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          currentCategoryFilter = pill.getAttribute('data-filter') || 'all';
          applyGalleryFilters();
        });
      });
    }

    // B. Real-Time Search Input
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentSearchQuery = searchInput.value.toLowerCase().trim();
        if (searchClear) {
          searchClear.style.display = currentSearchQuery ? 'block' : 'none';
        }
        applyGalleryFilters();
      });
    }

    if (searchClear && searchInput) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        currentSearchQuery = '';
        searchClear.style.display = 'none';
        searchInput.focus();
        applyGalleryFilters();
      });
    }

    // B. View More Projects Button
    if (viewMoreBtn) {
      viewMoreBtn.addEventListener('click', () => {
        const hiddenCards = document.querySelectorAll('.gallery-card.is-hidden');
        hiddenCards.forEach(card => {
          card.classList.remove('is-hidden');
          card.style.opacity = '0';
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease';
            card.style.opacity = '1';
          }, 50);
        });

        if (counterLabel) {
          counterLabel.textContent = `Showing all ${galleryCards.length} of ${galleryCards.length} Projects`;
        }
        viewMoreBtn.innerHTML = `<span>All 20 Projects Displayed ✓</span>`;
        viewMoreBtn.style.opacity = '0.7';
        viewMoreBtn.style.pointerEvents = 'none';
      });
    }

    // C. Lightbox Modal
    if (lightbox && galleryCards.length > 0) {
      const openLightbox = (card) => {
        const img = card.getAttribute('data-img');
        const title = card.getAttribute('data-title');
        const specs = card.getAttribute('data-specs');
        const loc = card.getAttribute('data-loc');

        if (lightboxImg) lightboxImg.src = img || 'images/hero.jpg';
        if (lightboxTitle) lightboxTitle.textContent = title || 'Exterior Project';
        if (lightboxSpecs) lightboxSpecs.textContent = `${specs || ''} · ${loc || ''}`;

        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      };

      const closeLightbox = () => {
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
      };

      galleryCards.forEach(card => {
        card.addEventListener('click', () => openLightbox(card));
      });

      if (closeLightboxBtn) {
        closeLightboxBtn.addEventListener('click', closeLightbox);
      }

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
          closeLightbox();
        }
      });
    }

    // --- 15. PRICING QUALIFICATION GUIDE CONTROLLER ---
    const quizOptionBtns = document.querySelectorAll('.quiz-option-btn');
    const useProfileBtn = document.getElementById('useQuizProfileBtn');

    if (quizOptionBtns.length > 0) {
      quizOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const group = btn.closest('.quiz-btn-group');
          if (group) {
            group.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const fieldType = group.getAttribute('data-quiz-field');
            const fieldVal = btn.getAttribute('data-value') || btn.textContent.trim();

            if (fieldType) {
              const summaryTarget = document.getElementById(`quizSummary_${fieldType}`);
              if (summaryTarget) summaryTarget.textContent = fieldVal;

              // Pre-populate estimate form fields if available
              const formField = document.getElementById(`pricing_${fieldType}`);
              if (formField) formField.value = fieldVal;
            }
          }
        });
      });
    }

    if (useProfileBtn) {
      useProfileBtn.addEventListener('click', () => {
        const targetForm = document.getElementById('pricingEstimateSection');
        if (targetForm) {
          const offset = 90;
          const pos = targetForm.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: pos, behavior: 'smooth' });
          const firstInput = targetForm.querySelector('input');
          if (firstInput) setTimeout(() => firstInput.focus(), 600);
        }
      });
    }

    // --- 16. PRICING FAQ ACCORDION CONTROLLER ---
    const faqTriggers = document.querySelectorAll('.pricing-faq-trigger');
    if (faqTriggers.length > 0) {
      faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const item = trigger.closest('.pricing-faq-item');
          if (item) {
            const isOpen = item.classList.contains('is-open');
            // Optional: close other accordions
            document.querySelectorAll('.pricing-faq-item').forEach(i => {
              if (i !== item) {
                i.classList.remove('is-open');
                const t = i.querySelector('.pricing-faq-trigger');
                if (t) t.setAttribute('aria-expanded', 'false');
              }
            });
            item.classList.toggle('is-open', !isOpen);
            trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
          }
        });
      });
    }

    // --- 17. STANDALONE AUTH PAGES CONTROLLERS ---
    const standaloneLoginForm = document.getElementById('standaloneLoginForm');
    if (standaloneLoginForm) {
      standaloneLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const banner = document.getElementById('standaloneLoginSuccess');
        if (banner) {
          banner.style.display = 'block';
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1400);
        }
      });
    }

    const standaloneSignupForm = document.getElementById('standaloneSignupForm');
    if (standaloneSignupForm) {
      standaloneSignupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const banner = document.getElementById('standaloneSignupSuccess');
        if (banner) {
          banner.style.display = 'block';
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1400);
        }
      });
    }

    // --- 18. INTERACTIVE CHIP SELECTORS (ESTIMATE FORM) ---
    const chipBtns = document.querySelectorAll('.chip-btn');
    if (chipBtns.length > 0) {
      chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const group = btn.closest('.chip-select-group');
          if (group) {
            group.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetInputId = group.getAttribute('data-input-target');
            if (targetInputId) {
              const targetInput = document.getElementById(targetInputId);
              if (targetInput) {
                targetInput.value = btn.getAttribute('data-value') || btn.textContent.trim();
              }
            }
          }
        });
      });
    }

    // --- 19. FLOATING SIDING MATERIAL SELECTOR INTERACTION ---
    const materialCards = document.querySelectorAll('.material-card');
    const selectedNameEl = document.getElementById('selectedMaterialName');

    if (materialCards.length > 0) {
      materialCards.forEach(card => {
        card.addEventListener('click', () => {
          materialCards.forEach(c => {
            c.classList.remove('is-selected');
            c.setAttribute('aria-checked', 'false');
          });
          card.classList.add('is-selected');
          card.setAttribute('aria-checked', 'true');

          const name = card.getAttribute('data-name');
          if (selectedNameEl && name) {
            selectedNameEl.textContent = name;
          }

          // Optional: Sync with estimate form material chips
          const chipValue = card.getAttribute('data-chip');
          if (chipValue) {
            const formChip = document.querySelector(`.chip-select-group[data-input-target="materialChoice"] .chip-btn[data-value="${chipValue}"]`);
            if (formChip) {
              const group = formChip.closest('.chip-select-group');
              if (group) {
                group.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
                formChip.classList.add('active');
                const targetInput = document.getElementById('materialChoice');
                if (targetInput) targetInput.value = chipValue;
              }
            }
          }
        });
      });
    }

    // --- 20. HOME 2 COLOR & EXTERIOR PALETTE STUDIO CONTROLLER ---
    const studioSwatches = document.querySelectorAll('.swatch-item-btn');
    const studioOverlay = document.getElementById('studioColorOverlay');
    const studioBadge = document.getElementById('studioBadge');

    const schemePalettes = {
      charcoal: { color: '#2a3135', name: 'Charcoal + Crisp White Trim', opacity: 0.45 },
      warmgray: { color: '#706b63', name: 'Warm Gray + Natural Cedar', opacity: 0.42 },
      deepgreen: { color: '#223c2e', name: 'Deep Woodland Green + Cream', opacity: 0.5 },
      softsand: { color: '#9f917b', name: 'Soft Sand + Dark Bronze Trim', opacity: 0.4 },
      classicwhite: { color: '#f5f6f2', name: 'Classic Farmhouse White + Black Accents', opacity: 0.25 }
    };

    if (studioSwatches.length > 0 && (studioOverlay || studioBadge)) {
      studioSwatches.forEach(btn => {
        btn.addEventListener('click', () => {
          studioSwatches.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');

          const schemeKey = btn.getAttribute('data-scheme');
          const data = schemePalettes[schemeKey];

          if (data) {
            if (studioOverlay) {
              studioOverlay.style.backgroundColor = data.color;
              studioOverlay.style.opacity = data.opacity;
            }
            if (studioBadge) {
              studioBadge.textContent = data.name;
            }
          }
        });
      });
    }
  });
})();
