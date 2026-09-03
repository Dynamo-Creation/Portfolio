/**
 * ==============================================================================
 * 🌟 CLIENT PORTFOLIO CONTROLLER & INTERACTIVITY ENGINE
 * Crafted for Sonu Choudhary 3D Portfolio
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Radial Splash Preloader immediately
  initPreloader();

  // 2. Initialize Unified Data Store
  try {
    await DataStore.init();
  } catch (err) {
    console.warn('DataStore initialization warning:', err);
  }

  // 3. Initialize App Components
  initThemeEngine();
  initHeaderAndNav();
  renderProfile();
  initHeroDomainShowcase();
  initHeroTypingEffect();
  initProjectsFilter();
  renderServices();
  renderSkills();
  renderExperience();
  renderReviews();
  initWhatsAppBot();
  initLightbox();

  // Listen to DataStore updates from Cloud / LocalStorage
  DataStore.subscribe((data, source) => {
    console.log(`🔄 Portfolio UI updated via ${source}`);
    renderProfile();
    renderFilteredProjects();
    renderServices();
    renderSkills();
    renderExperience();
    renderReviews();
  });
});

/* --- 1. 0-100% RADIAL SPLASH PRELOADER --- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const percentText = document.getElementById('loaderPercent');
  const barCircle = document.getElementById('loaderCircle');
  const statusText = document.getElementById('loaderStatus');

  if (!preloader) return;

  const totalLength = 380;
  let progress = 0;

  const statusMessages = [
    'Initializing 3D Canvas...',
    'Loading Cinema 4D Assets...',
    'Syncing Cloud Database...',
    'Calibrating Holographic Shaders...',
    'Ready to Launch...'
  ];

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 4;
    if (progress > 100) progress = 100;

    if (percentText) percentText.textContent = `${progress}%`;
    if (barCircle) {
      const offset = totalLength - (totalLength * progress) / 100;
      barCircle.style.strokeDashoffset = offset;
    }

    if (statusText) {
      const msgIndex = Math.min(Math.floor((progress / 100) * statusMessages.length), statusMessages.length - 1);
      statusText.textContent = statusMessages[msgIndex];
    }

    if (progress === 100) {
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('loaded');
        // Trigger entrance animations
        document.body.classList.add('page-ready');
      }, 400);
    }
  }, 35);
}

/* --- 2. THEME ENGINE --- */
function initThemeEngine() {
  const settings = DataStore.getSettings();
  const savedTheme = localStorage.getItem('portfolio_active_theme') || settings.currentTheme || 'cyber-dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  const themesList = ['cyber-dark', 'neon-cyber', 'midnight-gold', 'luxury-light', 'synthwave'];

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      let current = document.documentElement.getAttribute('data-theme') || 'cyber-dark';
      let nextIndex = (themesList.indexOf(current) + 1) % themesList.length;
      let nextTheme = themesList[nextIndex];
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('portfolio_active_theme', nextTheme);

      // Trigger 3D canvas color update
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: nextTheme } }));
    });
  });
}

/* --- 3. HEADER & NAVIGATION --- */
function initHeaderAndNav() {
  const header = document.querySelector('.site-header');
  const hamburger = document.querySelector('.hamburger-btn');
  const drawer = document.querySelector('.mobile-drawer');
  const navLinks = document.querySelectorAll('.nav-link, .drawer-link, .dock-item');

  // Sticky header blur effect on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
    highlightActiveNavLink();
  });

  // Mobile Drawer Toggle
  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      drawer.classList.toggle('open');
      document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
    });

    drawer.querySelectorAll('.drawer-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link highlighters
  function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 200;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }
}

/* --- 4. RENDER PROFILE DATA --- */
function renderProfile() {
  const profile = DataStore.getProfile();
  if (!profile || !profile.name) return;

  // Name & Titles
  const nameEls = document.querySelectorAll('.user-name-target');
  nameEls.forEach(el => el.textContent = profile.name);

  const titleEls = document.querySelectorAll('.user-title-target');
  titleEls.forEach(el => el.textContent = profile.title);

  const bioEls = document.querySelectorAll('.user-bio-target');
  bioEls.forEach(el => el.textContent = profile.bio);

  const taglineEls = document.querySelectorAll('.user-tagline-target');
  taglineEls.forEach(el => el.textContent = profile.tagline);

  // Contacts
  const phoneEls = document.querySelectorAll('.user-phone-target');
  phoneEls.forEach(el => {
    el.textContent = profile.contact?.whatsapp || profile.contact?.phone1 || '+91 8584866240';
    if (el.tagName === 'A') {
      el.href = `tel:${profile.contact?.phone1 || '+918620028817'}`;
    }
  });

  const emailEls = document.querySelectorAll('.user-email-target');
  emailEls.forEach(el => {
    el.textContent = profile.contact?.email || 'Sonu25580@gmail.com';
    if (el.tagName === 'A') {
      el.href = `mailto:${profile.contact?.email || 'Sonu25580@gmail.com'}`;
    }
  });

  const locationEls = document.querySelectorAll('.user-location-target');
  locationEls.forEach(el => el.textContent = profile.contact?.location || 'Kolkata & Remote Worldwide');

  // WhatsApp Link Buttons
  const whatsappBtns = document.querySelectorAll('.user-whatsapp-link');
  const waNum = (profile.contact?.whatsapp || '918584866240').replace(/[^0-9]/g, '');
  whatsappBtns.forEach(btn => {
    btn.href = `https://wa.me/${waNum}?text=${encodeURIComponent("Hi Sonu, I'm reaching out from your 3D Portfolio website!")}`;
  });

  // Resume Download Button
  const resumeBtn = document.getElementById('heroResumeBtn');
  if (resumeBtn && profile.resumeUrl) {
    resumeBtn.href = profile.resumeUrl;
  }
}

/* --- 5. BESPOKE HERO DOMAIN SHOWCASE --- */
function initHeroDomainShowcase() {
  const modeBtns = document.querySelectorAll('.mode-btn');
  const panels = document.querySelectorAll('.showcase-panel');

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetMode = btn.getAttribute('data-mode');
      const targetPanel = document.getElementById(`panel-${targetMode}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* --- 6. HERO TYPING EFFECT --- */
function initHeroTypingEffect() {
  const target = document.getElementById('heroRolesTyped');
  if (!target) return;

  const profile = DataStore.getProfile();
  const roles = profile.roles || [
    '3D Motion & VFX Artist',
    'UI/UX & Product Designer',
    'Graphics & Brand Identity Artist',
    'Full-Stack Web Developer',
    'Cinematic Video Editor'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function typeLoop() {
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      target.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 40;
    } else {
      target.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 90;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 1800; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400;
    }

    setTimeout(typeLoop, typingSpeed);
  }

  typeLoop();
}

/* --- 7. DYNAMIC CATEGORY & SUBCATEGORY FILTER ENGINE --- */
let activeCategory = 'all';
let activeSubcategory = 'all';
let searchQuery = '';

function initProjectsFilter() {
  const categoryBtns = document.querySelectorAll('.cat-btn');
  const searchInput = document.getElementById('projectSearchInput');

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-cat');
      activeSubcategory = 'all';
      renderSubcategoryPills();
      renderFilteredProjects();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderFilteredProjects();
    });
  }

  renderSubcategoryPills();
  renderFilteredProjects();
}

function renderSubcategoryPills() {
  const container = document.getElementById('subcategoryPills');
  if (!container) return;

  const projects = DataStore.getProjects();
  let relevantProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  const subcats = new Set();
  relevantProjects.forEach(p => {
    if (p.subcategory) subcats.add(p.subcategory);
  });

  if (subcats.size <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `<span class="subcat-pill ${activeSubcategory === 'all' ? 'active' : ''}" data-subcat="all">All Subcategories</span>`;
  subcats.forEach(sub => {
    html += `<span class="subcat-pill ${activeSubcategory === sub ? 'active' : ''}" data-subcat="${sub}">${sub}</span>`;
  });

  container.innerHTML = html;

  container.querySelectorAll('.subcat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.subcat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeSubcategory = pill.getAttribute('data-subcat');
      renderFilteredProjects();
    });
  });
}

function renderFilteredProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const projects = DataStore.getProjects();
  const filtered = projects.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSubcat = activeSubcategory === 'all' || p.subcategory === activeSubcategory;
    const matchesSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery) ||
      (p.description && p.description.toLowerCase().includes(searchQuery)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery)));
    return matchesCat && matchesSubcat && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.4;"></i>
        <h3>No projects found</h3>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Try selecting a different category or search term.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const hasMultipleImages = p.images && p.images.length > 1;
    const hasVideo = Boolean(p.videoUrl);

    return `
      <div class="project-card" data-id="${p.id}" onclick="openProjectLightbox('${p.id}')">
        <div class="project-thumb-container">
          <img src="${p.thumbnail}" alt="${p.title}" class="project-thumb-img" loading="lazy" />
          ${p.featured ? `<span class="project-featured-badge"><i class="fa-solid fa-star"></i> Featured</span>` : ''}
          <div class="project-media-badges">
            ${hasMultipleImages ? `<span class="media-badge"><i class="fa-regular fa-images"></i> ${p.images.length}</span>` : ''}
            ${hasVideo ? `<span class="media-badge"><i class="fa-solid fa-play"></i> Video</span>` : ''}
          </div>
          <div class="project-overlay-action">
            <span class="btn-quick-view"><i class="fa-solid fa-expand"></i> View Showcase</span>
          </div>
        </div>
        <div class="project-info">
          <div class="project-meta-row">
            <span class="project-category-tag">${p.subcategory || p.category}</span>
            <span class="project-year">${p.year || ''}</span>
          </div>
          <h3 class="project-title">${p.title}</h3>
          <p class="project-summary">${p.description || ''}</p>
          <div class="project-tags-row">
            ${(p.tags || []).slice(0, 4).map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* --- 8. MULTI-MEDIA LIGHTBOX --- */
let currentLightboxProject = null;

function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const closeBtn = document.getElementById('lightboxCloseBtn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', closeProjectLightbox);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeProjectLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectLightbox();
  });
}

window.openProjectLightbox = (projectId) => {
  const projects = DataStore.getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  currentLightboxProject = project;
  const modal = document.getElementById('lightboxModal');
  const stage = document.getElementById('lightboxStage');
  const thumbsBar = document.getElementById('lightboxThumbsBar');
  const title = document.getElementById('lightboxTitle');
  const desc = document.getElementById('lightboxDesc');
  const client = document.getElementById('lightboxClient');
  const tagsContainer = document.getElementById('lightboxTags');
  const waBtn = document.getElementById('lightboxWhatsAppBtn');

  title.textContent = project.title;
  desc.textContent = project.description || 'Comprehensive creative execution delivering measurable impact and visual excellence.';
  client.textContent = project.client ? `Client: ${project.client}` : `Category: ${project.subcategory || project.category}`;

  tagsContainer.innerHTML = (project.tags || []).map(t => `<span class="tech-tag">${t}</span>`).join('');

  // Setup WhatsApp order button
  const waNum = (DataStore.getProfile().contact?.whatsapp || '918584866240').replace(/[^0-9]/g, '');
  const waMsg = `Hi Sonu, I saw your project "${project.title}" on your 3D portfolio and would love to discuss a similar project!`;
  waBtn.href = `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`;

  // Assemble all media items (images + video)
  const mediaItems = [];
  if (project.videoUrl) {
    mediaItems.push({ type: 'video', src: project.videoUrl, thumb: project.thumbnail });
  }
  if (project.images && project.images.length > 0) {
    project.images.forEach(img => mediaItems.push({ type: 'image', src: img, thumb: img }));
  } else if (project.thumbnail) {
    mediaItems.push({ type: 'image', src: project.thumbnail, thumb: project.thumbnail });
  }

  // Render initial active media
  const setMediaIndex = (index) => {
    const item = mediaItems[index];
    if (item.type === 'video') {
      stage.innerHTML = `<iframe class="lightbox-video-frame" src="${item.src}?autoplay=1" allowfullscreen allow="autoplay"></iframe>`;
    } else {
      stage.innerHTML = `<img src="${item.src}" alt="${project.title}" class="lightbox-active-img" />`;
    }

    thumbsBar.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === index);
    });
  };

  // Render Thumbnails bar
  if (mediaItems.length > 1) {
    thumbsBar.style.display = 'flex';
    thumbsBar.innerHTML = mediaItems.map((item, idx) => `
      <img src="${item.thumb}" class="lightbox-thumb ${idx === 0 ? 'active' : ''}" onclick="window.switchLightboxMedia(${idx})" />
    `).join('');
  } else {
    thumbsBar.style.display = 'none';
  }

  window.switchLightboxMedia = setMediaIndex;
  setMediaIndex(0);

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeProjectLightbox = () => {
  const modal = document.getElementById('lightboxModal');
  const stage = document.getElementById('lightboxStage');
  if (modal) {
    modal.classList.remove('active');
    if (stage) stage.innerHTML = ''; // Stop video playback
    document.body.style.overflow = '';
  }
};

/* --- 9. RENDER SERVICES --- */
function renderServices() {
  const container = document.getElementById('servicesGrid');
  if (!container) return;

  const services = DataStore.getServices();
  const profile = DataStore.getProfile();
  const waNum = (profile.contact?.whatsapp || '918584866240').replace(/[^0-9]/g, '');

  container.innerHTML = services.map(s => {
    const waText = s.whatsappPrefill || `Hi Sonu, I'm interested in booking your ${s.title} service.`;
    const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}`;

    return `
      <div class="service-card">
        <div class="service-header">
          <div class="service-icon-box">
            <i class="fa-solid ${s.icon || 'fa-cube'}"></i>
          </div>
          <span class="service-time-badge"><i class="fa-regular fa-clock"></i> ${s.deliveryTime || '3-7 Days'}</span>
        </div>
        <h3 class="service-title">${s.title}</h3>
        <p class="service-desc">${s.description || ''}</p>
        <div class="service-features-list">
          ${(s.features || []).map(f => `
            <div class="feature-item">
              <i class="fa-solid fa-circle-check"></i>
              <span>${f}</span>
            </div>
          `).join('')}
        </div>
        <div class="service-footer">
          <div class="service-price-box">
            <span class="price-label">Starting From</span>
            <span class="price-val">${s.startingPrice || 'Contact'}</span>
          </div>
          <a href="${waUrl}" target="_blank" class="btn-service-whatsapp">
            <i class="fa-brands fa-whatsapp"></i> Book Quote
          </a>
        </div>
      </div>
    `;
  }).join('');
}

/* --- 10. RENDER SKILLS MATRIX --- */
function renderSkills() {
  const container = document.getElementById('skillsContainer');
  if (!container) return;

  const skills = DataStore.getSkills();

  container.innerHTML = skills.map(sk => `
    <div class="skill-card">
      <div class="skill-icon-wrap">
        <i class="fa-solid ${sk.icon || 'fa-code'}"></i>
      </div>
      <div class="skill-detail">
        <div class="skill-title-row">
          <span class="skill-name">${sk.name}</span>
          <span class="skill-percent">${sk.level}%</span>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill" style="width: ${sk.level}%;"></div>
        </div>
      </div>
    </div>
  `).join('');
}

/* --- 11. RENDER EXPERIENCE TIMELINE --- */
function renderExperience() {
  const container = document.getElementById('timelineWrapper');
  if (!container) return;

  const expList = DataStore.getExperience();

  container.innerHTML = expList.map(exp => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content-card">
        <span class="timeline-period-badge">${exp.period}</span>
        <h3 class="timeline-role">${exp.role}</h3>
        <h4 class="timeline-company">${exp.company}</h4>
        <p class="timeline-desc">${exp.description || ''}</p>
        <div class="timeline-highlights">
          ${(exp.highlights || []).map(h => `
            <div class="timeline-highlight-item">
              <i class="fa-solid fa-angle-right"></i>
              <span>${h}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

/* --- 12. RENDER CLIENT REVIEWS --- */
function renderReviews() {
  const container = document.getElementById('reviewsGrid');
  if (!container) return;

  const reviews = DataStore.getReviews(false);

  container.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-stars">
        ${Array.from({ length: r.rating || 5 }).map(() => '<i class="fa-solid fa-star"></i>').join('')}
      </div>
      <p class="review-text">"${r.text}"</p>
      <div class="review-client-row">
        <img src="${r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}" class="client-avatar" alt="${r.name}" />
        <div class="client-info">
          <span class="client-name">${r.name}</span>
          <span class="client-role">${r.role} ${r.company ? `• ${r.company}` : ''}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* --- 13. WHATSAPP SMART AUTOMATION & FORM BOT --- */
function initWhatsAppBot() {
  const form = document.getElementById('whatsappBotForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('inqName').value.trim();
    const email = document.getElementById('inqEmail').value.trim();
    const phone = document.getElementById('inqPhone').value.trim();
    const service = document.getElementById('inqService').value;
    const budget = document.getElementById('inqBudget').value;
    const timeline = document.getElementById('inqTimeline').value;
    const message = document.getElementById('inqMessage').value.trim();

    if (!name || !email || !message) {
      alert('Please fill in your Name, Email, and Project Details.');
      return;
    }

    // 1. Submit Inquiry to unified DataStore (Local + Supabase Cloud)
    await DataStore.submitInquiry({
      name,
      email,
      phone,
      service,
      budget,
      timeline,
      message
    });

    // 2. Format Structured WhatsApp Dispatch Message
    const formattedMsg =
`🚀 *NEW PROJECT INQUIRY FOR SONU CHOUDHARY*
────────────────────────
👤 *Client Name:* ${name}
📧 *Email:* ${email}
📱 *Phone:* ${phone || 'Not provided'}
🛠️ *Service:* ${service}
💰 *Estimated Budget:* ${budget}
⏱️ *Timeline:* ${timeline}

📝 *Project Brief:*
${message}
────────────────────────
_Sent via 3D Portfolio Automation System_`;

    const profile = DataStore.getProfile();
    const waNum = (profile.contact?.whatsapp || '918584866240').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(formattedMsg)}`;

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank');

    // Show Confirmation State
    const submitBtn = form.querySelector('.btn-whatsapp-dispatch');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Inquiry Logged & Opening WhatsApp...`;
    submitBtn.style.background = '#10b981';

    setTimeout(() => {
      form.reset();
      submitBtn.innerHTML = originalText;
      submitBtn.style.background = '';
    }, 4000);
  });
}
