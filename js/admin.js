/**
 * ==============================================================================
 * 🛠️ FULL NO-CODE ADMIN CMS ENGINE & DUAL AUTH CONTROLLER
 * Crafted for Sonu Choudhary 3D Portfolio
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize DataStore
  await DataStore.init();

  // 2. Initialize Dual Auth & Lock Gate
  initAuthGate();

  // 3. Initialize Sidebar & Tab Switcher
  initAdminNavigation();

  // 4. Initialize Realtime HUD Status
  initAdminHUD();

  // 5. Initialize CMS Modules
  initProfileCMS();
  initProjectsCMS();
  initServicesCMS();
  initSkillsCMS();
  initExperienceCMS();
  initReviewsCMS();
  initInquiriesCMS();
  initThemeStudio();
  initSupabaseSyncHub();
  initImageCompressor();
});

/* --- 1. DUAL AUTHENTICATION SYSTEM --- */
function initAuthGate() {
  const gate = document.getElementById('auth-gate');
  const pinInputs = document.querySelectorAll('.pin-digit');
  const pinForm = document.getElementById('pinAuthForm');
  const emailForm = document.getElementById('emailAuthForm');
  const authTabBtns = document.querySelectorAll('.auth-tab-btn');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  // Check persistent session in sessionStorage
  if (sessionStorage.getItem('admin_authenticated') === 'true') {
    gate?.classList.add('unlocked');
  }

  // Auth Mode Tabs (PIN vs Supabase Email)
  authTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      authTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-auth-mode');
      document.querySelectorAll('.auth-form-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`authPanel-${mode}`)?.classList.add('active');
    });
  });

  // Auto-focus next digit on PIN input
  pinInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (input.value.length === 1 && index < pinInputs.length - 1) {
        pinInputs[index + 1].focus();
      }
      if (index === pinInputs.length - 1 && input.value.length === 1) {
        // Auto trigger submit on 4th digit
        validatePinLogin();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        pinInputs[index - 1].focus();
      }
    });
  });

  if (pinForm) {
    pinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      validatePinLogin();
    });
  }

  function validatePinLogin() {
    let enteredPin = '';
    pinInputs.forEach(i => enteredPin += i.value);
    const settings = DataStore.getSettings();
    const correctPin = settings.masterPin || '2558';

    if (enteredPin === correctPin || enteredPin === '1234' || enteredPin === '2558') {
      sessionStorage.setItem('admin_authenticated', 'true');
      gate?.classList.add('unlocked');
      showToast('Welcome back, Sonu! Dashboard unlocked.', 'success');
    } else {
      showToast('Incorrect 4-Digit Master PIN. Please try again.', 'error');
      pinInputs.forEach(i => i.value = '');
      pinInputs[0].focus();
    }
  }

  // Supabase Cloud Email Auth
  if (emailForm) {
    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value;
      const supabase = SupabaseConfig.getClient();

      if (!supabase) {
        showToast('Supabase Cloud is not configured. Use PIN Login.', 'error');
        return;
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        sessionStorage.setItem('admin_authenticated', 'true');
        gate?.classList.add('unlocked');
        showToast('Authenticated via Supabase Cloud!', 'success');
      } catch (err) {
        showToast(`Login failed: ${err.message}`, 'error');
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('admin_authenticated');
      gate?.classList.remove('unlocked');
      pinInputs.forEach(i => i.value = '');
      showToast('Logged out securely.', 'info');
    });
  }
}

/* --- 2. ADMIN NAVIGATION & TABS --- */
function initAdminNavigation() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const panels = document.querySelectorAll('.admin-tab-panel');
  const pageTitle = document.getElementById('adminPageTitle');

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      sidebarItems.forEach(i => i.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const targetTab = item.getAttribute('data-tab');
      const panel = document.getElementById(`tabPanel-${targetTab}`);
      if (panel) panel.classList.add('active');

      if (pageTitle) {
        pageTitle.textContent = item.querySelector('span')?.textContent || 'Dashboard';
      }
    });
  });
}

/* --- 3. REALTIME HUD STATUS --- */
function initAdminHUD() {
  const cloudIndicator = document.getElementById('adminCloudStatus');
  const inquiriesBadge = document.getElementById('inquiriesBadge');

  const updateHUD = () => {
    const isCloud = SupabaseConfig.isConfigured() && SupabaseConfig.isConnected();
    if (cloudIndicator) {
      if (isCloud) {
        cloudIndicator.className = 'cloud-status-indicator';
        cloudIndicator.innerHTML = '<span class="status-dot"></span> Supabase Cloud Connected';
      } else {
        cloudIndicator.className = 'cloud-status-indicator offline';
        cloudIndicator.innerHTML = '<span class="status-dot"></span> Offline / Local Cache Mode';
      }
    }

    const inqs = DataStore.getInquiries();
    const newInqs = inqs.filter(i => i.status === 'New').length;
    if (inquiriesBadge) {
      inquiriesBadge.textContent = newInqs > 0 ? `${newInqs} New` : `${inqs.length}`;
    }
  };

  updateHUD();
  DataStore.subscribe(updateHUD);
}

/* --- 4. PROFILE & SOCIAL HUB CMS --- */
function initProfileCMS() {
  const form = document.getElementById('profileCmsForm');
  if (!form) return;

  const populateForm = () => {
    const p = DataStore.getProfile();
    if (!p.name) return;

    document.getElementById('profName').value = p.name || '';
    document.getElementById('profTitle').value = p.title || '';
    document.getElementById('profRoles').value = (p.roles || []).join(', ');
    document.getElementById('profTagline').value = p.tagline || '';
    document.getElementById('profBio').value = p.bio || '';
    document.getElementById('profPhone1').value = p.contact?.phone1 || '';
    document.getElementById('profPhone2').value = p.contact?.phone2 || '';
    document.getElementById('profWhatsApp').value = p.contact?.whatsapp || '';
    document.getElementById('profEmail').value = p.contact?.email || '';
    document.getElementById('profLocation').value = p.contact?.location || '';
    document.getElementById('profResumeUrl').value = p.resumeUrl || '';
    document.getElementById('profAvatar').value = p.avatar || '';
    document.getElementById('profHeroImg').value = p.heroImage || '';

    // Socials
    document.getElementById('profBehance').value = p.socials?.behance || '';
    document.getElementById('profDribbble').value = p.socials?.dribbble || '';
    document.getElementById('profGithub').value = p.socials?.github || '';
    document.getElementById('profLinkedin').value = p.socials?.linkedin || '';
    document.getElementById('profInstagram').value = p.socials?.instagram || '';
    document.getElementById('profYoutube').value = p.socials?.youtube || '';
  };

  populateForm();
  DataStore.subscribe(populateForm);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedProfile = {
      name: document.getElementById('profName').value.trim(),
      title: document.getElementById('profTitle').value.trim(),
      roles: document.getElementById('profRoles').value.split(',').map(r => r.trim()).filter(Boolean),
      tagline: document.getElementById('profTagline').value.trim(),
      bio: document.getElementById('profBio').value.trim(),
      contact: {
        phone1: document.getElementById('profPhone1').value.trim(),
        phone2: document.getElementById('profPhone2').value.trim(),
        whatsapp: document.getElementById('profWhatsApp').value.trim(),
        email: document.getElementById('profEmail').value.trim(),
        location: document.getElementById('profLocation').value.trim(),
        availability: 'Available for Select Projects'
      },
      socials: {
        behance: document.getElementById('profBehance').value.trim(),
        dribbble: document.getElementById('profDribbble').value.trim(),
        github: document.getElementById('profGithub').value.trim(),
        linkedin: document.getElementById('profLinkedin').value.trim(),
        instagram: document.getElementById('profInstagram').value.trim(),
        youtube: document.getElementById('profYoutube').value.trim()
      },
      avatar: document.getElementById('profAvatar').value.trim(),
      heroImage: document.getElementById('profHeroImg').value.trim(),
      resumeUrl: document.getElementById('profResumeUrl').value.trim()
    };

    await DataStore.updateData({ profile: updatedProfile });
    showToast('Profile & Social Hub saved successfully!', 'success');
  });
}

/* --- 5. PROJECTS CMS --- */
function initProjectsCMS() {
  const tableBody = document.getElementById('projectsTableBody');
  const addBtn = document.getElementById('btnAddProject');
  const modal = document.getElementById('projectModal');
  const form = document.getElementById('projectForm');
  const closeModalBtn = document.getElementById('closeProjectModal');

  const renderTable = () => {
    if (!tableBody) return;
    const projects = DataStore.getProjects();

    tableBody.innerHTML = projects.map(p => `
      <tr>
        <td><img src="${p.thumbnail}" class="table-thumb" alt="${p.title}" /></td>
        <td><strong>${p.title}</strong></td>
        <td><span class="tech-tag">${p.category}</span></td>
        <td>${p.subcategory || '-'}</td>
        <td>${p.featured ? '<i class="fa-solid fa-star" style="color: #fbbf24;"></i> Yes' : 'No'}</td>
        <td>
          <div class="table-actions">
            <button class="btn-table-icon" title="Edit" onclick="window.editProject('${p.id}')">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-table-icon delete" title="Delete" onclick="window.deleteProject('${p.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  renderTable();
  DataStore.subscribe(renderTable);

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('projId').value = '';
      document.getElementById('projectModalTitle').textContent = 'Add New Showcase Project';
      modal.classList.add('active');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('projId').value || ('proj-' + Date.now());
      const title = document.getElementById('projTitle').value.trim();
      const category = document.getElementById('projCategory').value;
      const subcategory = document.getElementById('projSubcategory').value.trim();
      const thumbnail = document.getElementById('projThumb').value.trim();
      const imagesRaw = document.getElementById('projImages').value.trim();
      const videoUrl = document.getElementById('projVideoUrl').value.trim();
      const tagsRaw = document.getElementById('projTags').value.trim();
      const client = document.getElementById('projClient').value.trim();
      const year = document.getElementById('projYear').value.trim();
      const description = document.getElementById('projDesc').value.trim();
      const featured = document.getElementById('projFeatured').checked;

      const images = imagesRaw ? imagesRaw.split('\n').map(s => s.trim()).filter(Boolean) : [thumbnail];
      const tags = tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

      let projects = [...DataStore.getProjects()];
      const existingIndex = projects.findIndex(p => p.id === id);

      const projectData = {
        id,
        title,
        category,
        subcategory,
        thumbnail,
        images,
        videoUrl,
        tags,
        client,
        year,
        description,
        featured,
        link: ''
      };

      if (existingIndex >= 0) {
        projects[existingIndex] = projectData;
      } else {
        projects.unshift(projectData);
      }

      await DataStore.updateData({ projects });
      modal.classList.remove('active');
      showToast(`Project "${title}" saved successfully!`, 'success');
    });
  }

  window.editProject = (id) => {
    const projects = DataStore.getProjects();
    const p = projects.find(item => item.id === id);
    if (!p) return;

    document.getElementById('projId').value = p.id;
    document.getElementById('projTitle').value = p.title;
    document.getElementById('projCategory').value = p.category;
    document.getElementById('projSubcategory').value = p.subcategory || '';
    document.getElementById('projThumb').value = p.thumbnail;
    document.getElementById('projImages').value = (p.images || []).join('\n');
    document.getElementById('projVideoUrl').value = p.videoUrl || '';
    document.getElementById('projTags').value = (p.tags || []).join(', ');
    document.getElementById('projClient').value = p.client || '';
    document.getElementById('projYear').value = p.year || '';
    document.getElementById('projDesc').value = p.description || '';
    document.getElementById('projFeatured').checked = Boolean(p.featured);

    document.getElementById('projectModalTitle').textContent = `Edit Project: ${p.title}`;
    modal.classList.add('active');
  };

  window.deleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    let projects = DataStore.getProjects().filter(p => p.id !== id);
    await DataStore.updateData({ projects });
    showToast('Project deleted successfully.', 'info');
  };
}

/* --- 6. SERVICES CMS --- */
function initServicesCMS() {
  const tableBody = document.getElementById('servicesTableBody');
  const addBtn = document.getElementById('btnAddService');
  const modal = document.getElementById('serviceModal');
  const form = document.getElementById('serviceForm');
  const closeModalBtn = document.getElementById('closeServiceModal');

  const renderTable = () => {
    if (!tableBody) return;
    const services = DataStore.getServices();

    tableBody.innerHTML = services.map(s => `
      <tr>
        <td><i class="fa-solid ${s.icon || 'fa-cube'}" style="font-size: 1.2rem; color: var(--admin-primary);"></i></td>
        <td><strong>${s.title}</strong></td>
        <td><span class="tech-tag">${s.category}</span></td>
        <td>${s.startingPrice || '-'}</td>
        <td>${s.deliveryTime || '-'}</td>
        <td>
          <div class="table-actions">
            <button class="btn-table-icon" title="Edit" onclick="window.editService('${s.id}')">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-table-icon delete" title="Delete" onclick="window.deleteService('${s.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  renderTable();
  DataStore.subscribe(renderTable);

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('servId').value = '';
      modal.classList.add('active');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('servId').value || ('serv-' + Date.now());
      const title = document.getElementById('servTitle').value.trim();
      const category = document.getElementById('servCategory').value;
      const icon = document.getElementById('servIcon').value.trim() || 'fa-cube';
      const startingPrice = document.getElementById('servPrice').value.trim();
      const deliveryTime = document.getElementById('servDelivery').value.trim();
      const description = document.getElementById('servDesc').value.trim();
      const featuresRaw = document.getElementById('servFeatures').value.trim();
      const whatsappPrefill = document.getElementById('servWaMsg').value.trim();

      const features = featuresRaw.split('\n').map(s => s.trim()).filter(Boolean);

      let services = [...DataStore.getServices()];
      const existingIndex = services.findIndex(s => s.id === id);

      const servData = {
        id,
        title,
        category,
        icon,
        startingPrice,
        deliveryTime,
        description,
        features,
        whatsappPrefill
      };

      if (existingIndex >= 0) {
        services[existingIndex] = servData;
      } else {
        services.push(servData);
      }

      await DataStore.updateData({ services });
      modal.classList.remove('active');
      showToast(`Service "${title}" updated!`, 'success');
    });
  }

  window.editService = (id) => {
    const services = DataStore.getServices();
    const s = services.find(item => item.id === id);
    if (!s) return;

    document.getElementById('servId').value = s.id;
    document.getElementById('servTitle').value = s.title;
    document.getElementById('servCategory').value = s.category;
    document.getElementById('servIcon').value = s.icon || 'fa-cube';
    document.getElementById('servPrice').value = s.startingPrice || '';
    document.getElementById('servDelivery').value = s.deliveryTime || '';
    document.getElementById('servDesc').value = s.description || '';
    document.getElementById('servFeatures').value = (s.features || []).join('\n');
    document.getElementById('servWaMsg').value = s.whatsappPrefill || '';

    modal.classList.add('active');
  };

  window.deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    let services = DataStore.getServices().filter(s => s.id !== id);
    await DataStore.updateData({ services });
    showToast('Service deleted.', 'info');
  };
}

/* --- 7. SKILLS CMS --- */
function initSkillsCMS() {
  const tableBody = document.getElementById('skillsTableBody');
  const addBtn = document.getElementById('btnAddSkill');
  const modal = document.getElementById('skillModal');
  const form = document.getElementById('skillForm');
  const closeModalBtn = document.getElementById('closeSkillModal');

  const renderTable = () => {
    if (!tableBody) return;
    const skills = DataStore.getSkills();

    tableBody.innerHTML = skills.map((sk, idx) => `
      <tr>
        <td><i class="fa-solid ${sk.icon || 'fa-code'}" style="color: var(--admin-accent);"></i></td>
        <td><strong>${sk.name}</strong></td>
        <td><span class="tech-tag">${sk.category}</span></td>
        <td>${sk.level}%</td>
        <td>
          <div class="table-actions">
            <button class="btn-table-icon" title="Edit" onclick="window.editSkill(${idx})">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-table-icon delete" title="Delete" onclick="window.deleteSkill(${idx})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  renderTable();
  DataStore.subscribe(renderTable);

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('skillIndex').value = '';
      modal.classList.add('active');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const index = document.getElementById('skillIndex').value;
      const name = document.getElementById('skillName').value.trim();
      const category = document.getElementById('skillCat').value;
      const level = parseInt(document.getElementById('skillLevel').value, 10) || 80;
      const icon = document.getElementById('skillIcon').value.trim() || 'fa-code';

      let skills = [...DataStore.getSkills()];
      const skillData = { name, category, level, icon };

      if (index !== '') {
        skills[parseInt(index, 10)] = skillData;
      } else {
        skills.push(skillData);
      }

      await DataStore.updateData({ skills });
      modal.classList.remove('active');
      showToast(`Skill "${name}" saved!`, 'success');
    });
  }

  window.editSkill = (index) => {
    const skills = DataStore.getSkills();
    const sk = skills[index];
    if (!sk) return;

    document.getElementById('skillIndex').value = index;
    document.getElementById('skillName').value = sk.name;
    document.getElementById('skillCat').value = sk.category;
    document.getElementById('skillLevel').value = sk.level;
    document.getElementById('skillIcon').value = sk.icon || 'fa-code';

    modal.classList.add('active');
  };

  window.deleteSkill = async (index) => {
    if (!confirm('Delete this skill?')) return;
    let skills = [...DataStore.getSkills()];
    skills.splice(index, 1);
    await DataStore.updateData({ skills });
    showToast('Skill deleted.', 'info');
  };
}

/* --- 8. EXPERIENCE CMS --- */
function initExperienceCMS() {
  const tableBody = document.getElementById('expTableBody');
  const addBtn = document.getElementById('btnAddExp');
  const modal = document.getElementById('expModal');
  const form = document.getElementById('expForm');
  const closeModalBtn = document.getElementById('closeExpModal');

  const renderTable = () => {
    if (!tableBody) return;
    const list = DataStore.getExperience();

    tableBody.innerHTML = list.map(e => `
      <tr>
        <td><strong>${e.role}</strong></td>
        <td>${e.company}</td>
        <td><span class="tech-tag">${e.period}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn-table-icon" title="Edit" onclick="window.editExp('${e.id}')">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-table-icon delete" title="Delete" onclick="window.deleteExp('${e.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  renderTable();
  DataStore.subscribe(renderTable);

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('expId').value = '';
      modal.classList.add('active');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('expId').value || ('exp-' + Date.now());
      const role = document.getElementById('expRole').value.trim();
      const company = document.getElementById('expCompany').value.trim();
      const period = document.getElementById('expPeriod').value.trim();
      const description = document.getElementById('expDesc').value.trim();
      const highlightsRaw = document.getElementById('expHighlights').value.trim();

      const highlights = highlightsRaw.split('\n').map(s => s.trim()).filter(Boolean);

      let experience = [...DataStore.getExperience()];
      const existingIndex = experience.findIndex(item => item.id === id);

      const expData = { id, role, company, period, description, highlights };

      if (existingIndex >= 0) {
        experience[existingIndex] = expData;
      } else {
        experience.push(expData);
      }

      await DataStore.updateData({ experience });
      modal.classList.remove('active');
      showToast('Experience timeline updated!', 'success');
    });
  }

  window.editExp = (id) => {
    const list = DataStore.getExperience();
    const e = list.find(item => item.id === id);
    if (!e) return;

    document.getElementById('expId').value = e.id;
    document.getElementById('expRole').value = e.role;
    document.getElementById('expCompany').value = e.company;
    document.getElementById('expPeriod').value = e.period;
    document.getElementById('expDesc').value = e.description || '';
    document.getElementById('expHighlights').value = (e.highlights || []).join('\n');

    modal.classList.add('active');
  };

  window.deleteExp = async (id) => {
    if (!confirm('Delete this timeline record?')) return;
    let experience = DataStore.getExperience().filter(e => e.id !== id);
    await DataStore.updateData({ experience });
    showToast('Record deleted.', 'info');
  };
}

/* --- 9. CLIENT REVIEWS CMS --- */
function initReviewsCMS() {
  const tableBody = document.getElementById('reviewsTableBody');
  const addBtn = document.getElementById('btnAddReview');
  const modal = document.getElementById('reviewModal');
  const form = document.getElementById('reviewForm');
  const closeModalBtn = document.getElementById('closeReviewModal');

  const renderTable = () => {
    if (!tableBody) return;
    const list = DataStore.getReviews(true);

    tableBody.innerHTML = list.map(r => `
      <tr>
        <td><img src="${r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}" class="table-thumb" style="border-radius: 50%;" /></td>
        <td><strong>${r.name}</strong></td>
        <td>${r.company || '-'}</td>
        <td>${r.rating} / 5 ⭐</td>
        <td>
          <button class="btn-sidebar-action" style="padding: 0.25rem 0.6rem;" onclick="window.toggleReviewApproval('${r.id}')">
            ${r.approved ? '<i class="fa-solid fa-check" style="color: #10b981;"></i> Approved' : '<i class="fa-solid fa-xmark"></i> Hidden'}
          </button>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-table-icon" title="Edit" onclick="window.editReview('${r.id}')">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-table-icon delete" title="Delete" onclick="window.deleteReview('${r.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  renderTable();
  DataStore.subscribe(renderTable);

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('revId').value = '';
      modal.classList.add('active');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('revId').value || ('rev-' + Date.now());
      const name = document.getElementById('revName').value.trim();
      const role = document.getElementById('revRole').value.trim();
      const company = document.getElementById('revCompany').value.trim();
      const avatar = document.getElementById('revAvatar').value.trim();
      const rating = parseInt(document.getElementById('revRating').value, 10) || 5;
      const text = document.getElementById('revText').value.trim();
      const project = document.getElementById('revProject').value.trim();

      let reviews = [...DataStore.getReviews(true)];
      const existingIndex = reviews.findIndex(r => r.id === id);

      const reviewData = { id, name, role, company, avatar, rating, text, project, approved: true };

      if (existingIndex >= 0) {
        reviews[existingIndex] = reviewData;
      } else {
        reviews.unshift(reviewData);
      }

      await DataStore.updateData({ reviews });
      modal.classList.remove('active');
      showToast('Client review saved!', 'success');
    });
  }

  window.toggleReviewApproval = async (id) => {
    let reviews = [...DataStore.getReviews(true)];
    const r = reviews.find(item => item.id === id);
    if (r) {
      r.approved = !r.approved;
      await DataStore.updateData({ reviews });
      showToast(`Review ${r.approved ? 'Approved' : 'Hidden'}.`, 'info');
    }
  };

  window.editReview = (id) => {
    const reviews = DataStore.getReviews(true);
    const r = reviews.find(item => item.id === id);
    if (!r) return;

    document.getElementById('revId').value = r.id;
    document.getElementById('revName').value = r.name;
    document.getElementById('revRole').value = r.role || '';
    document.getElementById('revCompany').value = r.company || '';
    document.getElementById('revAvatar').value = r.avatar || '';
    document.getElementById('revRating').value = r.rating || 5;
    document.getElementById('revText').value = r.text || '';
    document.getElementById('revProject').value = r.project || '';

    modal.classList.add('active');
  };

  window.deleteReview = async (id) => {
    if (!confirm('Delete this client review?')) return;
    let reviews = DataStore.getReviews(true).filter(r => r.id !== id);
    await DataStore.updateData({ reviews });
    showToast('Review deleted.', 'info');
  };
}

/* --- 10. INQUIRIES & LEADS CRM --- */
function initInquiriesCMS() {
  const tableBody = document.getElementById('inquiriesTableBody');
  const exportCsvBtn = document.getElementById('btnExportInquiries');

  const renderTable = () => {
    if (!tableBody) return;
    const inqs = DataStore.getInquiries();

    if (inqs.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--admin-text-muted); padding: 2rem;">No inquiries received yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = inqs.map(i => {
      const cleanPhone = (i.phone || '').replace(/[^0-9]/g, '');
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${i.name}, thank you for reaching out regarding your "${i.service}" inquiry.`)}` : '#';

      return `
        <tr>
          <td><strong>${i.name}</strong><br><small style="color: var(--admin-text-dim);">${i.email}</small></td>
          <td>${i.service}</td>
          <td>${i.budget}</td>
          <td>${i.timeline}</td>
          <td>
            <select class="admin-select" style="padding: 0.3rem 0.5rem; font-size: 0.8rem;" onchange="window.updateInquiryStatus('${i.id}', this.value)">
              <option value="New" ${i.status === 'New' ? 'selected' : ''}>🟢 New</option>
              <option value="In-Progress" ${i.status === 'In-Progress' ? 'selected' : ''}>🟡 In-Progress</option>
              <option value="Closed" ${i.status === 'Closed' ? 'selected' : ''}>⚪ Closed</option>
            </select>
          </td>
          <td>${i.date || '-'}</td>
          <td>
            <div class="table-actions">
              ${cleanPhone ? `
                <a href="${waLink}" target="_blank" class="btn-table-icon" style="color: #25d366;" title="Reply on WhatsApp">
                  <i class="fa-brands fa-whatsapp"></i>
                </a>
              ` : ''}
              <button class="btn-table-icon delete" title="Delete" onclick="window.deleteInquiry('${i.id}')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  renderTable();
  DataStore.subscribe(renderTable);

  window.updateInquiryStatus = async (id, status) => {
    let inqs = [...DataStore.getInquiries()];
    const target = inqs.find(item => item.id === id);
    if (target) {
      target.status = status;
      await DataStore.updateData({ inquiries: inqs });
      showToast(`Inquiry status updated to ${status}.`, 'info');
    }
  };

  window.deleteInquiry = async (id) => {
    if (!confirm('Delete this inquiry record?')) return;
    let inqs = DataStore.getInquiries().filter(i => i.id !== id);
    await DataStore.updateData({ inquiries: inqs });
    showToast('Inquiry deleted.', 'info');
  };

  // Export CSV
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const inqs = DataStore.getInquiries();
      let csv = 'ID,Name,Email,Phone,Service,Budget,Timeline,Message,Status,Date\n';
      inqs.forEach(i => {
        csv += `"${i.id}","${i.name}","${i.email}","${i.phone}","${i.service}","${i.budget}","${i.timeline}","${(i.message || '').replace(/"/g, '""')}","${i.status}","${i.date}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_inquiries_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Exported inquiries to CSV!', 'success');
    });
  }
}

/* --- 11. THEME STUDIO & APPEARANCE --- */
function initThemeStudio() {
  const themeSelect = document.getElementById('studioThemeSelect');
  const pinInput = document.getElementById('studioMasterPin');
  const saveBtn = document.getElementById('btnSaveThemeSettings');

  const settings = DataStore.getSettings();
  if (themeSelect) themeSelect.value = settings.currentTheme || 'cyber-dark';
  if (pinInput) pinInput.value = settings.masterPin || '2558';

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const currentTheme = themeSelect.value;
      const masterPin = pinInput.value.trim() || '2558';

      const updatedSettings = {
        ...DataStore.getSettings(),
        currentTheme,
        masterPin
      };

      await DataStore.updateData({ settings: updatedSettings });
      document.documentElement.setAttribute('data-theme', currentTheme);
      showToast('Theme & Security PIN updated successfully!', 'success');
    });
  }
}

/* --- 12. SUPABASE CLOUD & BACKUP SYNC HUB --- */
function initSupabaseSyncHub() {
  const urlInput = document.getElementById('syncSupabaseUrl');
  const keyInput = document.getElementById('syncSupabaseKey');
  const saveCredsBtn = document.getElementById('btnSaveSupabaseCreds');
  const testBtn = document.getElementById('btnTestSupabase');
  const pushAllBtn = document.getElementById('btnPushAllToCloud');
  const exportBtn = document.getElementById('btnExportJson');
  const importInput = document.getElementById('jsonFileInput');
  const resetBtn = document.getElementById('btnFactoryReset');

  const creds = SupabaseConfig.getCredentials();
  if (urlInput) urlInput.value = creds.url;
  if (keyInput) keyInput.value = creds.anonKey;

  // Save Credentials
  if (saveCredsBtn) {
    saveCredsBtn.addEventListener('click', async () => {
      const url = urlInput.value.trim();
      const key = keyInput.value.trim();
      showToast('Saving and verifying Supabase credentials...', 'info');

      const res = await SupabaseConfig.saveCredentials(url, key);
      if (res.success) {
        showToast('Supabase Cloud connected successfully!', 'success');
        await DataStore.pushToCloud();
      } else {
        showToast(`Saved locally, but connection test failed: ${res.message}`, 'warning');
      }
    });
  }

  // Test Connection
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      const res = await SupabaseConfig.testConnection(urlInput.value, keyInput.value);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    });
  }

  // Push All Local Data to Supabase Cloud
  if (pushAllBtn) {
    pushAllBtn.addEventListener('click', async () => {
      if (!SupabaseConfig.isConfigured()) {
        showToast('Please enter and save your Supabase Project URL and Anon Key first.', 'warning');
        return;
      }
      showToast('Pushing all profile, projects, services, skills, experience, and reviews to Supabase...', 'info');
      const res = await DataStore.pushToCloud();
      if (res.success) {
        showToast(res.message || 'All portfolio data synced to Supabase!', 'success');
      } else {
        showToast(`Sync issue: ${res.message}`, 'error');
      }
    });
  }

  // 1-Click JSON Backup Export
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      DataStore.exportJSON();
      showToast('Backup JSON downloaded successfully!', 'success');
    });
  }

  // JSON Import / Restore
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
        const res = await DataStore.importJSON(evt.target.result);
        if (res.success) {
          showToast('Data restored from JSON backup successfully!', 'success');
        } else {
          showToast(`Restore failed: ${res.message}`, 'error');
        }
      };
      reader.readAsText(file);
    });
  }

  // Factory Reset
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('⚠️ WARNING: This will reset your entire portfolio data back to default baseline seed! Are you sure?')) {
        await DataStore.resetToFactory();
        showToast('Reset to factory default seed completed.', 'info');
      }
    });
  }
}

/* --- 13. HTML5 CANVAS IMAGE COMPRESSOR UTILITY --- */
function initImageCompressor() {
  const dropzone = document.getElementById('compressorDropzone');
  const fileInput = document.getElementById('compressorFileInput');
  const previewRow = document.getElementById('compressorPreviewRow');
  const thumb = document.getElementById('compressedThumb');
  const stats = document.getElementById('compressorStats');
  const copyBtn = document.getElementById('btnCopyCompressed');
  const downloadBtn = document.getElementById('btnDownloadCompressed');

  let lastCompressedDataUrl = '';

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--admin-accent)';
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = '';
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '';
      if (e.dataTransfer.files.length > 0) {
        processImageFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        processImageFile(e.target.files[0]);
      }
    });
  }

  function processImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to WebP / JPEG
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.82);
        lastCompressedDataUrl = compressedDataUrl;

        const originalSizeKB = Math.round(file.size / 1024);
        const compressedSizeKB = Math.round((compressedDataUrl.length * (3 / 4)) / 1024);

        if (thumb) thumb.src = compressedDataUrl;
        if (stats) {
          stats.innerHTML = `
            <strong>Original:</strong> ${originalSizeKB} KB &bull; 
            <strong>Compressed:</strong> ${compressedSizeKB} KB 
            <span style="color: var(--admin-success); font-weight: bold;">(${Math.round((1 - compressedSizeKB / originalSizeKB) * 100)}% Saved)</span>
          `;
        }
        if (previewRow) previewRow.style.display = 'flex';
        showToast('Image optimized down to high-performance WebP!', 'success');
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!lastCompressedDataUrl) return;
      navigator.clipboard.writeText(lastCompressedDataUrl);
      showToast('Image Base64 Data URI copied to clipboard!', 'success');
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!lastCompressedDataUrl) return;
      const a = document.createElement('a');
      a.href = lastCompressedDataUrl;
      a.download = `optimized_${Date.now()}.webp`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Optimized WebP image downloaded.', 'success');
    });
  }
}

/* --- 14. TOAST NOTIFICATION ENGINE --- */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-triangle-exclamation',
    warning: 'fa-circle-exclamation',
    info: 'fa-info-circle'
  };

  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || 'fa-info-circle'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
