/**
 * ==============================================================================
 * 🌟 CLIENT PORTFOLIO CONTROLLER & INTERACTIVITY ENGINE
 * Crafted for Sonu Choudhary - VFX Associate & Visual Creative
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
  initHeroTypingEffect();
  initHeroCarousel();
  initProjectsFilter();
  renderServices();
  renderSkills();
  renderExperience();
  renderReviews();
  initWhatsAppModal();
  initContactForm();
  initClickToCopy();
  initLightbox();

  // Listen to DataStore updates from Cloud / LocalStorage
  DataStore.subscribe((data, source) => {
    console.log(`🔄 Portfolio UI updated via ${source}`);
    renderProfile();
    initHeroCarousel();
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
  const loaderAvatar = document.getElementById('loaderAvatar');
  const loaderName = document.getElementById('loaderName');
  const loaderRole = document.getElementById('loaderRole');

  if (!preloader) return;

  const profile = DataStore ? DataStore.getProfile() : null;
  if (profile) {
    if (loaderAvatar && profile.name) {
      const initials = profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      loaderAvatar.textContent = initials || 'SC';
    }
    if (loaderName && profile.name) loaderName.textContent = profile.name.toUpperCase();
    if (loaderRole && profile.title) loaderRole.textContent = profile.title;
  }

  const totalLength = 377; // 2 * PI * 60
  let progress = 0;

  const statusMessages = [
    'Initializing Creative Canvas...',
    'Loading Cinema 4D & VFX Assets...',
    'Syncing Supabase Cloud...',
    'Calibrating 3D Shaders...',
    'Ready to Launch...'
  ];

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 5;
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
        document.body.classList.add('page-ready');
      }, 400);
    }
  }, 30);
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

      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: nextTheme } }));
      showToast(`Theme switched to ${nextTheme}`, 'info');
    });
  });
}

/* --- 3. HEADER & NAVIGATION --- */
function initHeaderAndNav() {
  const header = document.querySelector('.site-header');
  const hamburger = document.querySelector('.hamburger-btn');
  const drawer = document.querySelector('.mobile-drawer');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const navLinks = document.querySelectorAll('.nav-link, .drawer-link, .dock-item');

  // Sticky header blur on scroll
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
      hamburger.classList.toggle('active');
      document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
    });

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', () => {
        drawer.classList.remove('open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    drawer.querySelectorAll('.drawer-link').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        hamburger.classList.remove('active');
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

/* --- 4. RENDER PROFILE DATA & YOUTUBE HUB --- */
function renderProfile() {
  const profile = DataStore.getProfile();
  if (!profile || !profile.name) return;

  // Name & Titles
  document.querySelectorAll('.user-name-target').forEach(el => el.textContent = profile.name);
  document.querySelectorAll('.user-title-target').forEach(el => el.textContent = profile.title);
  document.querySelectorAll('.user-bio-target').forEach(el => el.innerHTML = profile.bio.replace(/\n/g, '<br/>'));
  document.querySelectorAll('.user-tagline-target').forEach(el => el.textContent = profile.tagline);

  // Contacts
  const phone = profile.contact?.phone || profile.contact?.phone1 || '+91 8620028817';
  const wa = profile.contact?.whatsapp || '8584866240';
  const email = profile.contact?.email || 'Sonu25580@gmail.com';
  const loc = profile.contact?.location || 'Based in: Kolkata, West Bengal, India';

  document.querySelectorAll('.user-phone-target').forEach(el => {
    el.textContent = phone;
    if (el.tagName === 'A') el.href = `tel:${phone.replace(/\s+/g, '')}`;
  });

  document.querySelectorAll('.user-email-target').forEach(el => {
    el.textContent = email;
    if (el.tagName === 'A') el.href = `mailto:${email}`;
  });

  document.querySelectorAll('.user-location-target').forEach(el => el.textContent = loc);

  // WhatsApp Links
  const cleanWa = wa.replace(/[^0-9]/g, '');
  document.querySelectorAll('.user-whatsapp-link').forEach(btn => {
    btn.href = `https://wa.me/${cleanWa}?text=${encodeURIComponent("Hi Sonu, I'm reaching out from your portfolio website!")}`;
  });

  // Resume Download Button
  const resumeBtn = document.getElementById('heroResumeBtn');
  if (resumeBtn && profile.resumeUrl) {
    resumeBtn.href = profile.resumeUrl;
  }

  // YOUTUBE CREATOR HUB ON/OFF SYNC
  const socialHubSec = document.getElementById('social-hub');
  const desktopHubLink = document.getElementById('navLinkYouTubeHub');
  const drawerHubLink = document.getElementById('drawerLinkYouTubeHub');
  const isHubEnabled = profile.youtubeHub?.enabled !== false;

  if (socialHubSec) {
    socialHubSec.style.display = isHubEnabled ? 'block' : 'none';
  }
  if (desktopHubLink) {
    desktopHubLink.style.display = isHubEnabled ? 'inline-flex' : 'none';
  }
  if (drawerHubLink) {
    drawerHubLink.style.display = isHubEnabled ? 'block' : 'none';
  }

  // Populate YouTube Hub Details
  if (isHubEnabled && profile.youtubeHub) {
    const hub = profile.youtubeHub;
    const nameEl = document.getElementById('hubChannelName');
    const handleEl = document.getElementById('hubChannelHandle');
    const badgeEl = document.getElementById('hubSubscriberBadge');
    const subBtn = document.getElementById('hubSubscribeBtn');
    const iframeEl = document.getElementById('hubVideoIframe');
    const titleEl = document.getElementById('hubVideoTitle');
    const avatarEl = document.getElementById('hubAvatar');

    if (nameEl && hub.channelName) nameEl.textContent = hub.channelName;
    if (handleEl && hub.channelHandle) handleEl.textContent = hub.channelHandle;
    if (badgeEl && hub.subscribersBadge) badgeEl.innerHTML = `<i class="fa-solid fa-users"></i> ${hub.subscribersBadge}`;
    if (subBtn && hub.channelUrl) subBtn.href = hub.channelUrl;
    if (titleEl && hub.featuredVideoTitle) titleEl.textContent = `Featured Showcase: ${hub.featuredVideoTitle}`;
    if (avatarEl && profile.avatar) avatarEl.src = profile.avatar;

    if (iframeEl && hub.featuredVideoUrl && window.YouTubeHelper) {
      const embedUrl = window.YouTubeHelper.getEmbedUrl(hub.featuredVideoUrl, false);
      if (embedUrl && iframeEl.src !== embedUrl) {
        iframeEl.src = embedUrl;
      }
    }
  }

  // Social Links Bar
  if (profile.socials) {
    const instaLink = document.getElementById('socialCardInstagram');
    if (instaLink && profile.socials.instagram) instaLink.href = profile.socials.instagram;

    const waLink = document.getElementById('socialCardWhatsApp');
    if (waLink) waLink.href = `https://wa.me/${cleanWa}`;

    const behanceLink = document.getElementById('socialCardBehance');
    if (behanceLink && profile.socials.behance) behanceLink.href = profile.socials.behance;

    const linkedinLink = document.getElementById('socialCardLinkedIn');
    if (linkedinLink && profile.socials.linkedin) linkedinLink.href = profile.socials.linkedin;
  }
}

/* --- 5. HERO TYPING EFFECT --- */
function initHeroTypingEffect() {
  const target = document.getElementById('heroRolesTyped');
  if (!target) return;

  const profile = DataStore.getProfile();
  const roles = profile.roles || [
    'VFX Associate',
    'Graphics Designer',
    '3D Web Creator',
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
      typingSpeed = 2000;
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

/* --- 6. 16:9 HERO FEATURED WORKS AUTO-SLIDER --- */
let heroCurrentSlide = 0;
let heroSliderTimer = null;

function initHeroCarousel() {
  const track = document.getElementById('heroSlidesTrack');
  const dotsContainer = document.getElementById('heroCarouselDots');
  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');
  const carouselBox = document.querySelector('.carousel-aspect-box');

  if (!track || !dotsContainer) return;

  const projects = DataStore.getProjects();
  const featuredProjects = projects.filter(p => p.featured).length > 0
    ? projects.filter(p => p.featured)
    : projects.slice(0, 5);

  if (featuredProjects.length === 0) return;

  // Render Slides
  track.innerHTML = featuredProjects.map(p => `
    <div class="hero-slide" data-id="${p.id}" onclick="openProjectLightbox('${p.id}')">
      <img src="${p.thumbnail}" alt="${p.title}" class="hero-slide-img" loading="eager" />
      <div class="hero-slide-overlay">
        <span class="hero-slide-cat">
          <i class="fa-solid fa-sparkles"></i> ${p.subcategory || p.category}
          ${p.videoUrl ? ' • ▶ Video' : ''}
        </span>
        <h3 class="hero-slide-title">${p.title}</h3>
        <div class="hero-slide-hint">
          <i class="fa-solid fa-expand"></i> Click to Open Project Lightbox
        </div>
      </div>
    </div>
  `).join('');

  // Render Dots
  dotsContainer.innerHTML = featuredProjects.map((_, i) => `
    <div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
  `).join('');

  const updateSlidePosition = () => {
    track.style.transform = `translateX(-${heroCurrentSlide * 100}%)`;
    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === heroCurrentSlide);
    });
  };

  const nextSlide = () => {
    heroCurrentSlide = (heroCurrentSlide + 1) % featuredProjects.length;
    updateSlidePosition();
  };

  const prevSlide = () => {
    heroCurrentSlide = (heroCurrentSlide - 1 + featuredProjects.length) % featuredProjects.length;
    updateSlidePosition();
  };

  const startAutoSlide = () => {
    clearInterval(heroSliderTimer);
    heroSliderTimer = setInterval(nextSlide, 4500);
  };

  const stopAutoSlide = () => {
    clearInterval(heroSliderTimer);
  };

  if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); nextSlide(); startAutoSlide(); };
  if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); prevSlide(); startAutoSlide(); };

  dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
    dot.onclick = (e) => {
      e.stopPropagation();
      heroCurrentSlide = parseInt(dot.getAttribute('data-index'));
      updateSlidePosition();
      startAutoSlide();
    };
  });

  // Touch Swipe & Mouse Drag Support
  if (carouselBox) {
    let startX = 0;
    let endX = 0;
    let isDragging = false;

    carouselBox.addEventListener('mouseenter', stopAutoSlide);
    carouselBox.addEventListener('mouseleave', startAutoSlide);

    carouselBox.addEventListener('touchstart', (e) => {
      stopAutoSlide();
      startX = e.touches[0].clientX;
    }, { passive: true });

    carouselBox.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      handleSwipe();
      startAutoSlide();
    }, { passive: true });

    carouselBox.addEventListener('mousedown', (e) => {
      stopAutoSlide();
      isDragging = true;
      startX = e.clientX;
    });

    carouselBox.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      endX = e.clientX;
      handleSwipe();
      startAutoSlide();
    });

    function handleSwipe() {
      const diff = endX - startX;
      if (Math.abs(diff) > 45) {
        if (diff < 0) nextSlide();
        else prevSlide();
      }
    }
  }

  startAutoSlide();
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
    const rating = p.rating || 5.0;

    return `
      <div class="project-card" data-id="${p.id}" onclick="openProjectLightbox('${p.id}')">
        <div class="project-card-thumb-wrap">
          <img src="${p.thumbnail}" alt="${p.title}" class="project-thumb-img" loading="lazy" />
          
          ${hasVideo ? `
            <span class="badge-video-indicator">
              <i class="fa-solid fa-play"></i> Video
            </span>
          ` : ''}

          ${p.featured ? `<span class="project-featured-badge"><i class="fa-solid fa-star"></i> Featured</span>` : ''}

          <div class="project-media-badges">
            ${hasMultipleImages ? `<span class="media-badge"><i class="fa-regular fa-images"></i> ${p.images.length}</span>` : ''}
            <span class="media-badge" style="color: #fbbf24;"><i class="fa-solid fa-star"></i> ${rating}</span>
          </div>

          <!-- Play / View Hover Overlay -->
          <div class="btn-play-video-hover">
            <div class="play-video-circle">
              <i class="fa-solid ${hasVideo ? 'fa-play' : 'fa-expand'}"></i>
            </div>
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

/* --- 8. SERVICES SHOWCASE WITH 16:9 MEDIA SLIDERS --- */
function renderServices() {
  const container = document.getElementById('servicesGrid');
  if (!container) return;

  const services = DataStore.getServices();

  container.innerHTML = services.map((s, sIdx) => {
    const banners = s.banners && s.banners.length > 0
      ? s.banners
      : [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
        ];

    return `
      <div class="service-card" data-service-id="${s.id}">
        <div class="service-header">
          <div class="service-icon-box">
            <i class="fa-solid ${s.icon || 'fa-cube'}"></i>
          </div>
          <span class="service-time-badge"><i class="fa-regular fa-clock"></i> ${s.deliveryTime || '3-7 Days'}</span>
        </div>

        <h3 class="service-title">${s.title}</h3>
        <p class="service-desc">${s.description || ''}</p>

        <!-- Integrated 16:9 Auto-Sliding Showcase Banner Box -->
        <div class="service-banner-box" id="serviceBannerBox-${sIdx}">
          <div class="service-slider-track" id="serviceTrack-${sIdx}">
            ${banners.map(b => `<img src="${b}" alt="${s.title} Showcase" class="service-slide-img" loading="lazy" />`).join('')}
          </div>
          <div class="service-slider-dots" id="serviceDots-${sIdx}">
            ${banners.map((_, bi) => `<span class="service-dot ${bi === 0 ? 'active' : ''}"></span>`).join('')}
          </div>
        </div>

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
            <span class="price-val">${s.startingPrice || 'Quote'}</span>
          </div>
          <button class="btn-service-whatsapp" onclick="prefillAndOpenWhatsApp('${s.title.replace(/'/g, "\\'")}')">
            <i class="fa-brands fa-whatsapp"></i> Inquire Service
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Initialize 16:9 Auto-Sliders for each service
  services.forEach((s, sIdx) => {
    const banners = s.banners || [];
    if (banners.length <= 1) return;

    let current = 0;
    const track = document.getElementById(`serviceTrack-${sIdx}`);
    const dots = document.getElementById(`serviceDots-${sIdx}`);
    if (!track) return;

    const advance = () => {
      current = (current + 1) % banners.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      if (dots) {
        dots.querySelectorAll('.service-dot').forEach((d, i) => d.classList.toggle('active', i === current));
      }
    };

    setInterval(advance, 4000 + (sIdx * 600));
  });
}

/* --- 9. MULTI-MEDIA LIGHTBOX MODAL --- */
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

  // Review Stars Rating Input in Lightbox
  const starBtns = document.querySelectorAll('#starRatingInput .star-btn');
  const ratingText = document.getElementById('selectedRatingText');
  let selectedRating = 5;

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.getAttribute('data-rating'));
      starBtns.forEach((b, i) => {
        b.classList.toggle('active', i < selectedRating);
      });
      if (ratingText) ratingText.textContent = `${selectedRating}.0 / 5.0`;
    });
  });

  // Review Form Submit Handler
  const reviewForm = document.getElementById('projectReviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentLightboxProject) return;

      const name = document.getElementById('reviewerName').value.trim();
      const comment = document.getElementById('reviewerComment').value.trim();

      if (!name || !comment) {
        showToast('Please fill in your name and comment.', 'warning');
        return;
      }

      const res = await DataStore.submitReview(
        currentLightboxProject.id,
        name,
        selectedRating,
        comment
      );

      if (res.success) {
        showToast('Review submitted successfully! Thank you.', 'success');
        reviewForm.reset();
        // Re-render reviews in modal
        renderLightboxReviews(currentLightboxProject.id);
        renderFilteredProjects(); // Update rating pill in grid
      }
    });
  }
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
  const year = document.getElementById('lightboxYear');
  const ratingEl = document.getElementById('lightboxRating');
  const catBadge = document.getElementById('lightboxCategory');
  const tagsContainer = document.getElementById('lightboxTags');
  const waBtn = document.getElementById('lightboxWhatsAppBtn');

  if (title) title.textContent = project.title;
  if (desc) desc.textContent = project.description || 'Custom crafted creative execution with exceptional attention to detail and cinematic aesthetic.';
  if (client) client.innerHTML = `<i class="fa-regular fa-building"></i> ${project.client || 'Featured Production'}`;
  if (year) year.innerHTML = `<i class="fa-regular fa-calendar"></i> ${project.year || '2025'}`;
  if (ratingEl) ratingEl.innerHTML = `<i class="fa-solid fa-star"></i> ${project.rating || 5.0}`;
  if (catBadge) catBadge.textContent = project.subcategory || project.category;

  if (tagsContainer) {
    tagsContainer.innerHTML = (project.tags || []).map(t => `<span class="tech-tag">${t}</span>`).join('');
  }

  // Setup WhatsApp Inquire Button
  const waNum = (DataStore.getProfile().contact?.whatsapp || '8584866240').replace(/[^0-9]/g, '');
  const waMsg = `Hi Sonu, I saw your project "${project.title}" on your portfolio and would like to discuss a similar project!`;
  if (waBtn) waBtn.href = `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`;

  // Assemble Media Items
  const mediaItems = [];
  if (project.videoUrl) {
    mediaItems.push({ type: 'video', src: project.videoUrl, thumb: project.thumbnail || (window.YouTubeHelper ? window.YouTubeHelper.getThumbnailUrl(project.videoUrl) : '') });
  }
  if (project.images && project.images.length > 0) {
    project.images.forEach(img => mediaItems.push({ type: 'image', src: img, thumb: img }));
  } else if (project.thumbnail) {
    mediaItems.push({ type: 'image', src: project.thumbnail, thumb: project.thumbnail });
  }

  // Set Active Media
  const setMediaIndex = (index) => {
    const item = mediaItems[index];
    if (item.type === 'video') {
      if (item.src.endsWith('.mp4') || item.src.endsWith('.webm')) {
        stage.innerHTML = `<video class="lightbox-video-frame" src="${item.src}" controls autoplay playsinline></video>`;
      } else if (window.YouTubeHelper) {
        const embedUrl = window.YouTubeHelper.getEmbedUrl(item.src, true);
        stage.innerHTML = `<iframe class="lightbox-video-frame" src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
      } else {
        stage.innerHTML = `<iframe class="lightbox-video-frame" src="${item.src}" allowfullscreen></iframe>`;
      }
    } else {
      stage.innerHTML = `<img src="${item.src}" alt="${project.title}" class="lightbox-active-img" />`;
    }

    if (thumbsBar) {
      thumbsBar.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === index);
      });
    }
  };

  // Render Thumbnails
  if (thumbsBar) {
    if (mediaItems.length > 1) {
      thumbsBar.style.display = 'flex';
      thumbsBar.innerHTML = mediaItems.map((item, idx) => `
        <img src="${item.thumb || item.src}" class="lightbox-thumb ${idx === 0 ? 'active' : ''}" onclick="window.switchLightboxMedia(${idx})" />
      `).join('');
    } else {
      thumbsBar.style.display = 'none';
    }
  }

  window.switchLightboxMedia = setMediaIndex;
  setMediaIndex(0);

  // Render Project Reviews
  renderLightboxReviews(project.id);

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeProjectLightbox = () => {
  const modal = document.getElementById('lightboxModal');
  const stage = document.getElementById('lightboxStage');
  if (modal) {
    modal.classList.remove('active');
    if (stage) stage.innerHTML = ''; // Stop video audio instantly
    document.body.style.overflow = '';
  }
};

function renderLightboxReviews(projectId) {
  const listEl = document.getElementById('lightboxReviewsList');
  const avgEl = document.getElementById('lightboxAvgRating');
  if (!listEl) return;

  const reviews = DataStore.getReviews(false).filter(r => r.project_id === projectId || r.project === projectId);
  
  if (reviews.length === 0) {
    listEl.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-dim);">No reviews submitted for this project yet. Be the first to leave one below!</p>`;
    if (avgEl) avgEl.textContent = '★ 5.0 / 5.0 (0 reviews)';
    return;
  }

  const avg = (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1);
  if (avgEl) avgEl.textContent = `★ ${avg} / 5.0 (${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})`;

  listEl.innerHTML = reviews.map(r => `
    <div class="lightbox-review-item">
      <div class="review-item-header">
        <span class="review-author">${r.name}</span>
        <span style="color: #fbbf24; font-size: 0.8rem;">${Array.from({ length: r.rating || 5 }).map(() => '<i class="fa-solid fa-star"></i>').join('')}</span>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin: 0;">${r.text}</p>
    </div>
  `).join('');
}

/* --- 10. SMART WHATSAPP DIRECT DISPATCH MODAL --- */
function initWhatsAppModal() {
  const modal = document.getElementById('whatsappModal');
  const closeBtn = document.getElementById('whatsappModalCloseBtn');
  const openBtns = document.querySelectorAll('.btn-open-whatsapp-modal');
  const form = document.getElementById('whatsappBotForm');

  const openModal = () => {
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  openBtns.forEach(b => b.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.prefillAndOpenWhatsApp = (serviceName) => {
    openModal();
    const svcSelect = document.getElementById('inqService');
    if (svcSelect) {
      for (let opt of svcSelect.options) {
        if (opt.value.toLowerCase().includes(serviceName.toLowerCase())) {
          svcSelect.value = opt.value;
          break;
        }
      }
    }
  };

  if (form) {
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
        showToast('Please fill in your Name, Email, and Project Details.', 'warning');
        return;
      }

      await DataStore.submitInquiry({
        name,
        email,
        phone,
        service,
        budget,
        timeline,
        message
      });

      const formattedMsg =
`🚀 *PROJECT INQUIRY FOR SONU CHOUDHARY*
────────────────────────
👤 *Client Name:* ${name}
📧 *Email:* ${email}
📱 *Phone:* ${phone || 'Not provided'}
🛠️ *Required Service:* ${service}
💰 *Estimated Budget:* ${budget}
⏱️ *Timeline:* ${timeline}

📝 *Project Brief:*
${message}
────────────────────────
_Sent via Sonu Choudhary 3D Portfolio_`;

      const profile = DataStore.getProfile();
      const waNum = (profile.contact?.whatsapp || '8584866240').replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(formattedMsg)}`;

      window.open(waUrl, '_blank');
      showToast('Opening WhatsApp with your brief...', 'success');
      closeModal();
      form.reset();
    });
  }
}

/* --- 11. WORKING CONTACT FORM --- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const btn = document.getElementById('btnSubmitContact');
    const origHtml = btn ? btn.innerHTML : '';
    if (btn) btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending...`;

    await DataStore.submitMessage(name, email, subject, message);

    showToast('Message sent successfully! I will reach out shortly.', 'success');
    form.reset();
    if (btn) btn.innerHTML = origHtml;
  });
}

/* --- 12. CLICK TO CLIPBOARD COPY --- */
function initClickToCopy() {
  document.querySelectorAll('.click-to-copy').forEach(el => {
    el.addEventListener('click', () => {
      const text = el.getAttribute('data-copy');
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Copied to clipboard: ${text}`, 'success');
        }).catch(() => {
          showToast(`Text: ${text}`, 'info');
        });
      }
    });
  });
}

/* --- 13. SKILLS MATRIX --- */
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

/* --- 14. CAREER TIMELINE --- */
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

/* --- 15. CLIENT REVIEWS --- */
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

/* --- 16. TOAST NOTIFICATION HUB --- */
function showToast(message, type = 'info') {
  const hub = document.getElementById('toastHub');
  if (!hub) return;

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1.25rem;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
    color: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(16px);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-bell';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

  hub.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
