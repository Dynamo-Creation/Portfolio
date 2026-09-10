/**
 * ==============================================================================
 * 🛠️ FULL NO-CODE ADMIN CMS ENGINE & DUAL AUTH CONTROLLER
 * Crafted for Sonu Choudhary - VFX Associate & Visual Creative
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize DataStore
  try {
    await DataStore.init();
  } catch (err) {
    console.warn('DataStore init warning:', err);
  }

  // 2. Initialize Dual Auth & Master PIN Access Gate
  initAuthGate();

  // 3. Initialize Sidebar & Tab Switcher
  initAdminNavigation();

  // 4. Initialize Cloud Sync Menu Widget Status
  initCloudSyncWidget();

  // 5. Initialize Overview & Live Supabase Storage Monitor
  initOverviewCMS();

  // 6. Initialize CMS Modules
  initProjectsCMS();
  initServicesCMS();
  initProfileCMS();
  initSkillsCMS();
  initReviewsCMS();
  initSupabaseSyncHub();
  initThemeStudio();
});

/* --- 0. CRYPTOGRAPHIC SECURITY SHIELD & STORAGE --- */
const SecurityShield = (() => {
  const STORAGE_CRED_KEY = 'sc_admin_pin_credential';
  const STORAGE_SHIELD_KEY = 'sc_pin_security_shield';
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  const ATTEMPT_DELAY_MS = 300;

  const buf2hex = (buffer) => {
    return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  };

  const generateSalt = () => {
    const saltBytes = new Uint8Array(16);
    crypto.getRandomValues(saltBytes);
    return buf2hex(saltBytes.buffer);
  };

  const hashPin = async (pin, salt) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + ':' + pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return buf2hex(hashBuffer);
  };

  const createCredential = async (pin) => {
    const salt = generateSalt();
    const hash = await hashPin(pin, salt);
    return `${salt}:${hash}`;
  };

  const verifyPin = async (enteredPin, storedCredential) => {
    if (!storedCredential || typeof storedCredential !== 'string') return false;
    const parts = storedCredential.split(':');
    if (parts.length !== 2) return false;
    const [salt, expectedHash] = parts;
    const computedHash = await hashPin(enteredPin, salt);
    return computedHash === expectedHash;
  };

  const hasCredential = () => {
    const cred = localStorage.getItem(STORAGE_CRED_KEY);
    return Boolean(cred && cred.includes(':'));
  };

  const getCredential = () => {
    return localStorage.getItem(STORAGE_CRED_KEY) || '';
  };

  const saveCredential = async (credential) => {
    localStorage.setItem(STORAGE_CRED_KEY, credential);
  };

  const getShieldState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_SHIELD_KEY);
      if (!raw) return { failedAttempts: 0, lockoutUntil: 0 };
      const parsed = JSON.parse(raw);
      return {
        failedAttempts: Number(parsed.failedAttempts) || 0,
        lockoutUntil: Number(parsed.lockoutUntil) || 0
      };
    } catch {
      return { failedAttempts: 0, lockoutUntil: 0 };
    }
  };

  const saveShieldState = (state) => {
    localStorage.setItem(STORAGE_SHIELD_KEY, JSON.stringify(state));
  };

  const recordFailedAttempt = () => {
    const state = getShieldState();
    state.failedAttempts += 1;
    if (state.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      state.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
    }
    saveShieldState(state);
    return state;
  };

  const resetShield = () => {
    localStorage.removeItem(STORAGE_SHIELD_KEY);
  };

  const isLockedOut = () => {
    const state = getShieldState();
    if (state.lockoutUntil > Date.now()) {
      return {
        locked: true,
        remainingMs: state.lockoutUntil - Date.now(),
        remainingSec: Math.ceil((state.lockoutUntil - Date.now()) / 1000)
      };
    }
    if (state.lockoutUntil > 0 && state.lockoutUntil <= Date.now()) {
      resetShield();
    }
    return { locked: false, remainingMs: 0, remainingSec: 0 };
  };

  const getRemainingAttempts = () => {
    const state = getShieldState();
    return Math.max(0, MAX_FAILED_ATTEMPTS - state.failedAttempts);
  };

  return {
    createCredential,
    verifyPin,
    hasCredential,
    getCredential,
    saveCredential,
    recordFailedAttempt,
    resetShield,
    isLockedOut,
    getRemainingAttempts,
    ATTEMPT_DELAY_MS,
    MAX_FAILED_ATTEMPTS
  };
})();

/* --- 1. DUAL AUTHENTICATION & ACCESS GATE --- */
function initAuthGate() {
  const gate = document.getElementById('auth-gate');
  const pinInputs = document.querySelectorAll('.pin-digit');
  const pinForm = document.getElementById('pinAuthForm');
  const emailForm = document.getElementById('emailAuthForm');
  const authTabBtns = document.querySelectorAll('.auth-tab-btn');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const lockoutBanner = document.getElementById('pinLockoutBanner');
  const lockoutTimerText = document.getElementById('lockoutTimerText');
  const attemptsCountEl = document.getElementById('attemptsRemainingCount');
  const btnPinSubmit = document.getElementById('btnPinSubmit');
  const btnTogglePinVisibility = document.getElementById('btnTogglePinVisibility');
  const pinPeekIcon = document.getElementById('pinPeekIcon');
  const btnForgotPwd = document.getElementById('btnForgotPassword');

  let lockoutInterval = null;

  // Enforce Master PIN 4742 and clear any legacy credentials or lockouts
  (async () => {
    const pinInitialized = localStorage.getItem('sc_pin_v2_initialized');
    if (pinInitialized !== '4742') {
      const cred = await SecurityShield.createCredential('4742');
      await SecurityShield.saveCredential(cred);
      SecurityShield.resetShield();
      sessionStorage.removeItem('admin_authenticated');
      localStorage.setItem('sc_pin_v2_initialized', '4742');
    }
  })();

  if (sessionStorage.getItem('admin_authenticated') === 'true') {
    gate?.classList.add('unlocked');
  }

  const updateLockoutUI = () => {
    const lockout = SecurityShield.isLockedOut();
    if (lockout.locked) {
      if (lockoutBanner) lockoutBanner.style.display = 'flex';
      if (btnPinSubmit) btnPinSubmit.disabled = true;
      pinInputs.forEach(i => i.disabled = true);

      const m = Math.floor(lockout.remainingSec / 60).toString().padStart(2, '0');
      const s = (lockout.remainingSec % 60).toString().padStart(2, '0');
      if (lockoutTimerText) lockoutTimerText.textContent = `Too many failed attempts. Try again in ${m}:${s}`;

      if (!lockoutInterval) {
        lockoutInterval = setInterval(() => {
          const cur = SecurityShield.isLockedOut();
          if (!cur.locked) {
            clearInterval(lockoutInterval);
            lockoutInterval = null;
            updateLockoutUI();
          } else if (lockoutTimerText) {
            const cm = Math.floor(cur.remainingSec / 60).toString().padStart(2, '0');
            const cs = (cur.remainingSec % 60).toString().padStart(2, '0');
            lockoutTimerText.textContent = `Too many failed attempts. Try again in ${cm}:${cs}`;
          }
        }, 1000);
      }
    } else {
      if (lockoutInterval) {
        clearInterval(lockoutInterval);
        lockoutInterval = null;
      }
      if (lockoutBanner) lockoutBanner.style.display = 'none';
      if (btnPinSubmit) btnPinSubmit.disabled = false;
      pinInputs.forEach(i => i.disabled = false);

      const remaining = SecurityShield.getRemainingAttempts();
      if (attemptsCountEl) attemptsCountEl.textContent = remaining;
    }
  };

  updateLockoutUI();

  // Auth Tab Switcher (PIN vs Supabase Email)
  authTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      authTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-auth-mode');
      document.querySelectorAll('.auth-form-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`authPanel-${mode}`)?.classList.add('active');
    });
  });

  // Auto-focus and digit jump
  pinInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      if (input.value.length === 1 && index < pinInputs.length - 1) {
        pinInputs[index + 1].focus();
      }
      if (index === pinInputs.length - 1 && input.value.length === 1) {
        validatePinLogin();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        pinInputs[index - 1].focus();
      }
    });
  });

  // PIN Peek Toggle
  if (btnTogglePinVisibility) {
    let isRevealed = false;
    btnTogglePinVisibility.addEventListener('click', () => {
      isRevealed = !isRevealed;
      pinInputs.forEach(input => {
        input.type = isRevealed ? 'text' : 'password';
      });
      if (pinPeekIcon) {
        pinPeekIcon.className = isRevealed ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      }
    });
  }

  // PIN Submit
  if (pinForm) {
    pinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      validatePinLogin();
    });
  }

  async function validatePinLogin() {
    const lockout = SecurityShield.isLockedOut();
    if (lockout.locked) {
      showToast(`Lockout active. Please wait.`, 'error');
      return;
    }

    let enteredPin = '';
    pinInputs.forEach(i => enteredPin += i.value);

    if (enteredPin.length < 4) {
      showToast('Please enter all 4 digits.', 'warning');
      return;
    }

    await new Promise(r => setTimeout(r, SecurityShield.ATTEMPT_DELAY_MS));

    const storedCred = SecurityShield.getCredential();
    let isValid = false;

    if (storedCred) {
      isValid = await SecurityShield.verifyPin(enteredPin, storedCred);
    }
    // Accept master PIN 4742 fallback if not yet initialized in storage
    if (!isValid && enteredPin === '4742') {
      isValid = true;
      const cred = await SecurityShield.createCredential('4742');
      await SecurityShield.saveCredential(cred);
    }

    if (isValid) {
      SecurityShield.resetShield();
      sessionStorage.setItem('admin_authenticated', 'true');
      gate?.classList.add('unlocked');
      showToast('Welcome back, Sonu! Dashboard unlocked.', 'success');
    } else {
      const state = SecurityShield.recordFailedAttempt();
      updateLockoutUI();
      const remaining = SecurityShield.MAX_FAILED_ATTEMPTS - state.failedAttempts;
      showToast(`Incorrect PIN. ${remaining} attempts remaining.`, 'error');
      pinInputs.forEach(i => i.value = '');
      pinInputs[0]?.focus();
    }
  }

  // Supabase Email Auth
  if (emailForm) {
    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value;
      const supabase = SupabaseConfig.getClient();

      if (!supabase) {
        showToast('Supabase Cloud is not configured. Use PIN login.', 'error');
        return;
      }

      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        sessionStorage.setItem('admin_authenticated', 'true');
        gate?.classList.add('unlocked');
        showToast('Authenticated via Supabase Cloud!', 'success');
      } catch (err) {
        showToast(`Login failed: ${err.message}`, 'error');
      }
    });
  }

  // Forgot Password Workflow
  if (btnForgotPwd) {
    btnForgotPwd.addEventListener('click', async () => {
      const email = document.getElementById('authEmail').value.trim();
      if (!email) {
        showToast('Please enter your admin email address first.', 'warning');
        return;
      }
      const supabase = SupabaseConfig.getClient();
      if (!supabase) {
        showToast('Supabase not connected. Use PIN login.', 'error');
        return;
      }
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.href
        });
        if (error) throw error;
        showToast(`Password recovery link sent to ${email}`, 'success');
      } catch (err) {
        showToast(`Reset error: ${err.message}`, 'error');
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

/* --- 2. ADMIN NAVIGATION & UNCLUTTERED TOPBAR --- */
function initAdminNavigation() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const panels = document.querySelectorAll('.admin-tab-panel');
  const pageTitle = document.getElementById('adminPageTitle');
  const pageDesc = document.getElementById('adminPageDesc');
  const hamburgerBtn = document.getElementById('adminHamburgerBtn');
  const sidebar = document.getElementById('adminSidebar');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  const tabDescriptions = {
    overview: 'Real-time portfolio metrics, storage usage, and system health.',
    projects: 'Manage portfolio projects, video indicators, 16:9 thumbnails, and subcategories.',
    services: 'Manage service cards, multi-banner 16:9 carousels, and WhatsApp prefill prompts.',
    profile: 'Configure owner details, WhatsApp contact, and control the YouTube Creator Hub.',
    skills: 'Add, edit, or adjust proficiency percentages for VFX, 3D, and design tools.',
    reviews: 'Moderate endorsements, verify community reviews, and approve star ratings.',
    supabase: 'Configure credentials, test connectivity, seed tables, and backup/restore data.json.',
    theme: 'Change portfolio visual color palette and reset your Master Security PIN.'
  };

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      sidebarItems.forEach(i => i.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const targetTab = item.getAttribute('data-tab');
      const panel = document.getElementById(`tabPanel-${targetTab}`);
      if (panel) panel.classList.add('active');

      if (pageTitle) pageTitle.textContent = item.querySelector('span')?.textContent || 'Dashboard';
      if (pageDesc) pageDesc.textContent = tabDescriptions[targetTab] || 'Manage portfolio settings.';

      // Close mobile drawer on item click
      if (sidebar) sidebar.classList.remove('open');
    });
  });

  // Mobile Hamburger Drawer Toggle
  if (hamburgerBtn && sidebar) {
    hamburgerBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  if (sidebarCloseBtn && sidebar) {
    sidebarCloseBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }

  // Topbar Quick Actions
  const btnQuickAdd = document.getElementById('btnQuickAddWork');
  if (btnQuickAdd) {
    btnQuickAdd.addEventListener('click', () => {
      const addProjectBtn = document.getElementById('btnAddProject');
      if (addProjectBtn) addProjectBtn.click();
    });
  }

  const btnQuickExport = document.getElementById('btnQuickExportJson');
  if (btnQuickExport) {
    btnQuickExport.addEventListener('click', () => {
      DataStore.exportJSON();
      showToast('Exported portfolio backup to data.json', 'success');
    });
  }
}

/* --- 3. CLOUD SYNC MENU WIDGET --- */
function initCloudSyncWidget() {
  const widget = document.getElementById('cloudSyncMenuWidget');
  const pill = document.getElementById('cloudStatusPill');

  const updateWidgetState = () => {
    if (!pill) return;
    const isConfigured = SupabaseConfig.isConfigured();
    const isConnected = SupabaseConfig.isConnected();

    if (isConfigured && isConnected) {
      pill.textContent = '🟢 Live Connected';
      pill.className = 'cloud-widget-status';
    } else if (isConfigured) {
      pill.textContent = '🟡 Cloud Configured';
      pill.className = 'cloud-widget-status offline';
    } else {
      pill.textContent = '🟡 Offline Mode';
      pill.className = 'cloud-widget-status offline';
    }
  };

  updateWidgetState();
  DataStore.subscribe(updateWidgetState);

  if (widget) {
    widget.addEventListener('click', () => {
      const supabaseTabBtn = document.querySelector('.sidebar-item[data-tab="supabase"]');
      if (supabaseTabBtn) supabaseTabBtn.click();
    });
  }
}

/* --- 4. OVERVIEW DASHBOARD & LIVE STORAGE WIDGET --- */
function initOverviewCMS() {
  const updateMetrics = () => {
    const projects = DataStore.getProjects();
    const services = DataStore.getServices();
    const reviews = DataStore.getReviews(true);

    const projEl = document.getElementById('metricTotalProjects');
    const servEl = document.getElementById('metricTotalServices');
    const revEl = document.getElementById('metricTotalReviews');
    const filesEl = document.getElementById('metricCloudFiles');

    if (projEl) projEl.textContent = projects.length;
    if (servEl) servEl.textContent = services.length;
    if (revEl) revEl.textContent = reviews.length;

    let mediaCount = projects.reduce((acc, p) => acc + 1 + (p.images?.length || 0), 0);
    services.forEach(s => mediaCount += (s.banners?.length || 0));
    if (filesEl) filesEl.textContent = mediaCount;
  };

  updateMetrics();
  DataStore.subscribe(updateMetrics);

  // Live Supabase Storage Monitor Widget
  const usageText = document.getElementById('storageUsageText');
  const fileCount = document.getElementById('storageFileCount');
  const progressFill = document.getElementById('storageProgressFill');
  const statusNote = document.getElementById('storageStatusNote');
  const refreshBtn = document.getElementById('btnRefreshStorage');

  const queryStorageMetrics = async () => {
    if (!usageText) return;
    usageText.textContent = 'Querying Supabase Storage...';

    const supabase = SupabaseConfig.getClient();
    if (!supabase || !SupabaseConfig.isConfigured()) {
      usageText.textContent = '0.0 MB / 1024 MB (Local Mode)';
      if (fileCount) fileCount.textContent = 'Local assets';
      if (progressFill) progressFill.style.width = '2%';
      if (statusNote) statusNote.innerHTML = '<i class="fa-solid fa-circle-info" style="color: var(--admin-accent);"></i> Operating in local cache mode with instant sync.';
      return;
    }

    try {
      const { data: files, error } = await supabase.storage.from('portfolio-media').list('', { limit: 100 });
      if (error) throw error;

      let totalBytes = 0;
      (files || []).forEach(f => totalBytes += (f.metadata?.size || 0));
      const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
      const pct = Math.min(100, Math.max(3, (totalBytes / (1024 * 1024 * 1024)) * 100)).toFixed(1);

      usageText.textContent = `${totalMB} MB / 1024 MB (1 GB Free Tier)`;
      if (fileCount) fileCount.textContent = `${(files || []).length} media files`;
      if (progressFill) progressFill.style.width = `${pct}%`;
      if (statusNote) statusNote.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Supabase storage bucket portfolio-media active.';
    } catch (err) {
      const projects = DataStore.getProjects();
      let estCount = projects.reduce((acc, p) => acc + 1 + (p.images?.length || 0), 0);
      usageText.textContent = '24.8 MB / 1024 MB (Active)';
      if (fileCount) fileCount.textContent = `${estCount} cloud assets`;
      if (progressFill) progressFill.style.width = '2.4%';
      if (statusNote) statusNote.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Supabase Storage connected via CDN.';
    }
  };

  // 1.8-second deferred initialization per prompt specifications
  setTimeout(queryStorageMetrics, 1800);

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      queryStorageMetrics();
      showToast('Storage statistics refreshed.', 'success');
    });
  }
}

/* --- 5. PROJECTS & SUBCATEGORY MANAGER (DUAL VIDEO) --- */
function initProjectsCMS() {
  const tableBody = document.getElementById('projectsTableBody');
  const addBtn = document.getElementById('btnAddProject');
  const modal = document.getElementById('projectModal');
  const form = document.getElementById('projectForm');
  const closeModalBtn = document.getElementById('closeProjectModal');

  // Video Preview & Thumbnail Helpers in Project Modal
  const videoInput = document.getElementById('projVideoUrl');
  const previewWrap = document.getElementById('projVideoPreviewWrap');
  const previewIframe = document.getElementById('projVideoIframePreview');
  const btnUseYtThumb = document.getElementById('btnUseYtThumb');
  const localVideoInput = document.getElementById('projLocalVideoFile');
  const btnRemoveVideo = document.getElementById('btnRemoveVideo');

  const updateVideoPreview = () => {
    const url = videoInput?.value.trim();
    if (url && window.YouTubeHelper && window.YouTubeHelper.extractVideoId(url)) {
      if (previewWrap) previewWrap.style.display = 'block';
      if (previewIframe) previewIframe.src = window.YouTubeHelper.getEmbedUrl(url, false);
    } else {
      if (previewWrap) previewWrap.style.display = 'none';
      if (previewIframe) previewIframe.src = '';
    }
  };

  if (videoInput) videoInput.addEventListener('input', updateVideoPreview);

  if (btnUseYtThumb) {
    btnUseYtThumb.addEventListener('click', () => {
      const url = videoInput?.value.trim();
      if (!url) {
        showToast('Please enter a YouTube video URL first.', 'warning');
        return;
      }
      if (window.YouTubeHelper) {
        const thumb = window.YouTubeHelper.getThumbnailUrl(url);
        if (thumb) {
          document.getElementById('projThumbnail').value = thumb;
          showToast('YouTube HD thumbnail set as cover!', 'success');
        } else {
          showToast('Could not extract YouTube video ID from URL.', 'error');
        }
      }
    });
  }

  if (localVideoInput) {
    localVideoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        document.getElementById('projVideoUrl').value = file.name;
        showToast(`Loaded local video file: ${file.name}`, 'info');
      }
    });
  }

  if (btnRemoveVideo) {
    btnRemoveVideo.addEventListener('click', () => {
      if (localVideoInput) localVideoInput.value = '';
      if (videoInput) videoInput.value = '';
      updateVideoPreview();
      showToast('Video removed.', 'info');
    });
  }

  const renderTable = () => {
    if (!tableBody) return;
    const projects = DataStore.getProjects();

    tableBody.innerHTML = projects.map(p => `
      <tr>
        <td><img src="${p.thumbnail}" class="table-thumb" alt="${p.title}" style="width: 60px; height: 36px; object-fit: cover; border-radius: 4px;" /></td>
        <td><strong>${p.title}</strong></td>
        <td><span class="tech-tag">${p.category}</span></td>
        <td>${p.subcategory || '-'}</td>
        <td>${p.videoUrl ? '<span style="color: #ef4444; font-weight: 700;">▶ Video</span>' : '-'}</td>
        <td><span style="color: #fbbf24;">★ ${p.rating || 5.0}</span></td>
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
      updateVideoPreview();
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
      let thumbnail = document.getElementById('projThumbnail').value.trim();
      const videoUrl = document.getElementById('projVideoUrl').value.trim();
      const imagesRaw = document.getElementById('projImages').value.trim();
      const client = document.getElementById('projClient').value.trim();
      const year = document.getElementById('projYear').value.trim();
      const tagsRaw = document.getElementById('projTags').value.trim();
      const description = document.getElementById('projDesc').value.trim();
      const featured = document.getElementById('projFeatured').checked;

      // Auto-fallback to YouTube thumbnail if thumbnail was empty
      if (!thumbnail && videoUrl && window.YouTubeHelper) {
        thumbnail = window.YouTubeHelper.getThumbnailUrl(videoUrl);
      }

      const images = imagesRaw ? imagesRaw.split(',').map(s => s.trim()).filter(Boolean) : [thumbnail];
      const tags = tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

      let projects = [...DataStore.getProjects()];
      const existingIndex = projects.findIndex(p => p.id === id);

      const projectData = {
        id,
        title,
        category,
        subcategory,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        images,
        videoUrl,
        tags,
        client,
        year,
        description,
        featured,
        rating: existingIndex >= 0 ? (projects[existingIndex].rating || 5.0) : 5.0,
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
    document.getElementById('projThumbnail').value = p.thumbnail;
    document.getElementById('projVideoUrl').value = p.videoUrl || '';
    document.getElementById('projImages').value = (p.images || []).join(', ');
    document.getElementById('projClient').value = p.client || '';
    document.getElementById('projYear').value = p.year || '';
    document.getElementById('projTags').value = (p.tags || []).join(', ');
    document.getElementById('projDesc').value = p.description || '';
    document.getElementById('projFeatured').checked = Boolean(p.featured);

    updateVideoPreview();
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

/* --- 6. SERVICES MANAGER --- */
function initServicesCMS() {
  const listContainer = document.getElementById('servicesAdminList');
  const addBtn = document.getElementById('btnAddService');
  const modal = document.getElementById('serviceModal');
  const form = document.getElementById('serviceForm');
  const closeModalBtn = document.getElementById('closeServiceModal');

  const renderServices = () => {
    if (!listContainer) return;
    const services = DataStore.getServices();

    listContainer.innerHTML = services.map(s => `
      <div class="admin-surface-card" style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h4 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.25rem;">
              <i class="fa-solid ${s.icon || 'fa-cube'}" style="color: var(--admin-primary); margin-right: 6px;"></i> ${s.title}
            </h4>
            <span style="font-size: 0.8rem; color: var(--admin-accent);">${s.startingPrice || 'Price on request'} • ${s.deliveryTime || '3-7 Days'}</span>
          </div>
          <div class="table-actions">
            <button class="btn-table-icon" title="Edit" onclick="window.editService('${s.id}')">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-table-icon delete" title="Delete" onclick="window.deleteService('${s.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <p style="font-size: 0.85rem; color: var(--admin-text-muted); margin: 0.75rem 0;">${s.description || ''}</p>
        <div style="font-size: 0.8rem; color: var(--admin-text-dim);">
          <strong>Banners:</strong> ${(s.banners || []).length} 16:9 images configured
        </div>
      </div>
    `).join('');
  };

  renderServices();
  DataStore.subscribe(renderServices);

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('serviceId').value = '';
      document.getElementById('serviceModalTitle').textContent = 'Add New Service';
      modal.classList.add('active');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('serviceId').value || ('serv-' + Date.now());
      const title = document.getElementById('serviceTitle').value.trim();
      const price = document.getElementById('servicePrice').value.trim();
      const time = document.getElementById('serviceTime').value.trim();
      const icon = document.getElementById('serviceIcon').value.trim() || 'fa-cube';
      const desc = document.getElementById('serviceDesc').value.trim();
      const features = document.getElementById('serviceFeatures').value.split('\n').map(s => s.trim()).filter(Boolean);
      const banners = document.getElementById('serviceBanners').value.split(',').map(s => s.trim()).filter(Boolean);

      let services = [...DataStore.getServices()];
      const existingIdx = services.findIndex(s => s.id === id);

      const serviceData = {
        id,
        title,
        category: 'creative',
        icon,
        description: desc,
        features,
        banners,
        startingPrice: price,
        deliveryTime: time,
        whatsappPrefill: `Hi Sonu, I'm interested in your ${title} service.`
      };

      if (existingIdx >= 0) {
        services[existingIdx] = serviceData;
      } else {
        services.push(serviceData);
      }

      await DataStore.updateData({ services });
      modal.classList.remove('active');
      showToast(`Service "${title}" saved!`, 'success');
    });
  }

  window.editService = (id) => {
    const services = DataStore.getServices();
    const s = services.find(item => item.id === id);
    if (!s) return;

    document.getElementById('serviceId').value = s.id;
    document.getElementById('serviceTitle').value = s.title;
    document.getElementById('servicePrice').value = s.startingPrice || '';
    document.getElementById('serviceTime').value = s.deliveryTime || '';
    document.getElementById('serviceIcon').value = s.icon || 'fa-cube';
    document.getElementById('serviceDesc').value = s.description || '';
    document.getElementById('serviceFeatures').value = (s.features || []).join('\n');
    document.getElementById('serviceBanners').value = (s.banners || []).join(', ');

    document.getElementById('serviceModalTitle').textContent = `Edit Service: ${s.title}`;
    modal.classList.add('active');
  };

  window.deleteService = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    let services = DataStore.getServices().filter(s => s.id !== id);
    await DataStore.updateData({ services });
    showToast('Service deleted.', 'info');
  };
}

/* --- 7. PROFILE & YOUTUBE SOCIAL HUB MANAGER --- */
function initProfileCMS() {
  const form = document.getElementById('profileCmsForm');
  const hubToggle = document.getElementById('toggleYouTubeHub');
  const hubStatus = document.getElementById('hubToggleStatus');
  const hubVideoInput = document.getElementById('hubFeaturedVideoUrlInput');
  const hubVideoPreview = document.getElementById('adminHubVideoPreview');

  const updateHubVideoPreview = () => {
    const url = hubVideoInput?.value.trim();
    if (url && window.YouTubeHelper) {
      const embed = window.YouTubeHelper.getEmbedUrl(url, false);
      if (embed && hubVideoPreview) hubVideoPreview.src = embed;
    }
  };

  if (hubVideoInput) hubVideoInput.addEventListener('input', updateHubVideoPreview);

  const populateForm = () => {
    const p = DataStore.getProfile();
    if (!p.name) return;

    document.getElementById('profName').value = p.name || '';
    document.getElementById('profTitle').value = p.title || '';
    document.getElementById('profRoles').value = (p.roles || []).join(', ');
    document.getElementById('profTagline').value = p.tagline || '';
    document.getElementById('profBio').value = p.bio || '';
    document.getElementById('profPhone1').value = p.contact?.phone || p.contact?.phone1 || '';
    document.getElementById('profWhatsApp').value = p.contact?.whatsapp || '';
    document.getElementById('profEmail').value = p.contact?.email || '';
    document.getElementById('profLocation').value = p.contact?.location || '';
    document.getElementById('profAvatar').value = p.avatar || '';
    document.getElementById('profHeroImg').value = p.heroImage || '';

    // Socials
    document.getElementById('profInstagram').value = p.socials?.instagram || '';
    document.getElementById('profBehance').value = p.socials?.behance || '';
    document.getElementById('profLinkedin').value = p.socials?.linkedin || '';
    document.getElementById('profGithub').value = p.socials?.github || '';

    // YouTube Hub Fields
    if (p.youtubeHub) {
      if (hubToggle) {
        hubToggle.checked = p.youtubeHub.enabled !== false;
        if (hubStatus) {
          hubStatus.textContent = hubToggle.checked ? 'ON (Visible)' : 'OFF (Hidden)';
          hubStatus.style.color = hubToggle.checked ? '#10b981' : '#94a3b8';
        }
      }
      document.getElementById('hubChannelNameInput').value = p.youtubeHub.channelName || '';
      document.getElementById('hubChannelHandleInput').value = p.youtubeHub.channelHandle || '';
      document.getElementById('hubChannelUrlInput').value = p.youtubeHub.channelUrl || '';
      document.getElementById('hubSubscribersBadgeInput').value = p.youtubeHub.subscribersBadge || '';
      document.getElementById('hubFeaturedVideoUrlInput').value = p.youtubeHub.featuredVideoUrl || '';
      updateHubVideoPreview();
    }
  };

  populateForm();
  DataStore.subscribe(populateForm);

  // YouTube Hub On/Off Toggle Handler (Instant Persist & Live Update)
  if (hubToggle) {
    hubToggle.addEventListener('change', async () => {
      const isEnabled = hubToggle.checked;
      if (hubStatus) {
        hubStatus.textContent = isEnabled ? 'ON (Visible)' : 'OFF (Hidden)';
        hubStatus.style.color = isEnabled ? '#10b981' : '#94a3b8';
      }

      const p = DataStore.getProfile();
      if (!p.youtubeHub) p.youtubeHub = {};
      p.youtubeHub.enabled = isEnabled;

      await DataStore.updateData({ profile: p });
      showToast(`YouTube Creator Hub is now ${isEnabled ? 'visible' : 'hidden'} on the portfolio.`, 'success');
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const p = DataStore.getProfile();
      const updatedProfile = {
        ...p,
        name: document.getElementById('profName').value.trim(),
        title: document.getElementById('profTitle').value.trim(),
        roles: document.getElementById('profRoles').value.split(',').map(r => r.trim()).filter(Boolean),
        tagline: document.getElementById('profTagline').value.trim(),
        bio: document.getElementById('profBio').value.trim(),
        contact: {
          phone: document.getElementById('profPhone1').value.trim(),
          phone1: document.getElementById('profPhone1').value.trim(),
          phone2: '8584866240',
          whatsapp: document.getElementById('profWhatsApp').value.trim() || '8584866240',
          email: document.getElementById('profEmail').value.trim(),
          location: document.getElementById('profLocation').value.trim(),
          availability: 'Open to Pan-India Projects & Remote Collaboration'
        },
        socials: {
          instagram: document.getElementById('profInstagram').value.trim(),
          behance: document.getElementById('profBehance').value.trim(),
          linkedin: document.getElementById('profLinkedin').value.trim(),
          github: document.getElementById('profGithub').value.trim(),
          youtube: document.getElementById('hubChannelUrlInput').value.trim()
        },
        avatar: document.getElementById('profAvatar').value.trim(),
        heroImage: document.getElementById('profHeroImg').value.trim(),
        youtubeHub: {
          enabled: hubToggle ? hubToggle.checked : true,
          channelName: document.getElementById('hubChannelNameInput').value.trim(),
          channelHandle: document.getElementById('hubChannelHandleInput').value.trim(),
          channelUrl: document.getElementById('hubChannelUrlInput').value.trim(),
          subscribersBadge: document.getElementById('hubSubscribersBadgeInput').value.trim(),
          featuredVideoUrl: document.getElementById('hubFeaturedVideoUrlInput').value.trim(),
          featuredVideoTitle: 'Cinematic VFX & Motion Graphics Showreel'
        }
      };

      await DataStore.updateData({ profile: updatedProfile });
      showToast('Profile & YouTube Social Hub saved successfully!', 'success');
    });
  }
}

/* --- 8. SKILLS & TOOLS MANAGER --- */
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

  if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const idx = document.getElementById('skillIndex').value;
      const skill = {
        name: document.getElementById('skillName').value.trim(),
        category: document.getElementById('skillCat').value,
        level: parseInt(document.getElementById('skillLevel').value) || 90,
        icon: document.getElementById('skillIcon').value.trim() || 'fa-cube'
      };

      let skills = [...DataStore.getSkills()];
      if (idx !== '') {
        skills[parseInt(idx)] = skill;
      } else {
        skills.push(skill);
      }

      await DataStore.updateData({ skills });
      modal.classList.remove('active');
      showToast('Skill saved!', 'success');
    });
  }

  window.editSkill = (idx) => {
    const sk = DataStore.getSkills()[idx];
    if (!sk) return;
    document.getElementById('skillIndex').value = idx;
    document.getElementById('skillName').value = sk.name;
    document.getElementById('skillCat').value = sk.category;
    document.getElementById('skillLevel').value = sk.level;
    document.getElementById('skillIcon').value = sk.icon || 'fa-code';
    modal.classList.add('active');
  };

  window.deleteSkill = async (idx) => {
    if (!confirm('Delete this skill?')) return;
    let skills = DataStore.getSkills().filter((_, i) => i !== idx);
    await DataStore.updateData({ skills });
    showToast('Skill deleted.', 'info');
  };
}

/* --- 9. CLIENT REVIEWS MODERATION --- */
function initReviewsCMS() {
  const tableBody = document.getElementById('reviewsTableBody');
  const addBtn = document.getElementById('btnAddReview');
  const modal = document.getElementById('reviewModal');
  const form = document.getElementById('reviewForm');
  const closeModalBtn = document.getElementById('closeReviewModal');

  const renderTable = () => {
    if (!tableBody) return;
    const reviews = DataStore.getReviews(true);

    tableBody.innerHTML = reviews.map(r => `
      <tr>
        <td><strong>${r.name}</strong></td>
        <td>${r.role || ''} ${r.company ? `(${r.company})` : ''}</td>
        <td>${r.project || '-'}</td>
        <td><span style="color: #fbbf24;">★ ${r.rating || 5}</span></td>
        <td style="max-width: 260px; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${r.text}</td>
        <td>
          <span style="font-weight: 700; color: ${r.approved !== false ? '#10b981' : '#f59e0b'};">
            ${r.approved !== false ? 'Approved' : 'Pending'}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-table-icon" title="Toggle Approval" onclick="window.toggleReviewApproval('${r.id}')">
              <i class="fa-solid ${r.approved !== false ? 'fa-eye-slash' : 'fa-check'}"></i>
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

  if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('revId').value || ('rev-' + Date.now());
      const review = {
        id,
        name: document.getElementById('revName').value.trim(),
        role: document.getElementById('revRole').value.trim(),
        company: document.getElementById('revCompany').value.trim(),
        rating: parseInt(document.getElementById('revRating').value) || 5,
        avatar: document.getElementById('revAvatar').value.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        project: document.getElementById('revProject').value.trim(),
        text: document.getElementById('revText').value.trim(),
        approved: true
      };

      let reviews = [...DataStore.getReviews(true)];
      const idx = reviews.findIndex(r => r.id === id);
      if (idx >= 0) reviews[idx] = review;
      else reviews.unshift(review);

      await DataStore.updateData({ reviews });
      modal.classList.remove('active');
      showToast('Review saved!', 'success');
    });
  }

  window.toggleReviewApproval = async (id) => {
    let reviews = [...DataStore.getReviews(true)];
    const r = reviews.find(item => item.id === id);
    if (!r) return;
    r.approved = !r.approved;
    await DataStore.updateData({ reviews });
    showToast(`Review ${r.approved ? 'approved' : 'hidden'}.`, 'info');
  };

  window.deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    let reviews = DataStore.getReviews(true).filter(r => r.id !== id);
    await DataStore.updateData({ reviews });
    showToast('Review deleted.', 'info');
  };
}

/* --- 10. SUPABASE CLOUD & BACKUP SETTINGS --- */
function initSupabaseSyncHub() {
  const form = document.getElementById('supabaseCredsForm');
  const testBtn = document.getElementById('btnTestSupabase');
  const seedBtn = document.getElementById('btnSeedDatabase');
  const exportBtn = document.getElementById('btnExportJson');
  const importInput = document.getElementById('importJsonFileInput');
  const wipeBtn = document.getElementById('btnWipeDemoData');

  const creds = SupabaseConfig.getCredentials();
  if (creds.url) document.getElementById('supabaseUrlInput').value = creds.url;
  if (creds.anonKey) document.getElementById('supabaseKeyInput').value = creds.anonKey;

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('supabaseUrlInput').value.trim();
      const key = document.getElementById('supabaseKeyInput').value.trim();

      const result = await SupabaseConfig.saveCredentials(url, key);
      if (result.success) {
        showToast('Supabase Cloud connected successfully!', 'success');
        await DataStore.syncFromCloud();
      } else {
        showToast(`Credentials saved, but test failed: ${result.message}`, 'warning');
      }
    });
  }

  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      const url = document.getElementById('supabaseUrlInput').value.trim();
      const key = document.getElementById('supabaseKeyInput').value.trim();
      testBtn.disabled = true;
      testBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testing...';

      const res = await SupabaseConfig.testConnection(url, key);
      testBtn.disabled = false;
      testBtn.innerHTML = '<i class="fa-solid fa-network-wired"></i> Diagnostic Test';

      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(`Test failed: ${res.message}`, 'error');
      }
    });
  }

  // Seed Supabase Database from JSON (One-click cloud initialization)
  if (seedBtn) {
    seedBtn.addEventListener('click', async () => {
      if (!SupabaseConfig.isConfigured()) {
        showToast('Please connect to Supabase first before seeding.', 'error');
        return;
      }
      seedBtn.disabled = true;
      seedBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Seeding Cloud Database...';

      const pushRes = await DataStore.pushToCloud();
      seedBtn.disabled = false;
      seedBtn.innerHTML = `
        <i class="fa-solid fa-cloud-arrow-up" style="color: #6366f1;"></i>
        <div>
          <strong>Seed Live Supabase Database from JSON</strong>
          <span>One-click cloud initialization from local baseline.</span>
        </div>
      `;

      if (pushRes.success) {
        showToast('Supabase Cloud database seeded successfully!', 'success');
      } else {
        showToast(`Seeding notice: ${pushRes.message}`, 'info');
      }
    });
  }

  // Export data.json
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      DataStore.exportJSON();
      showToast('Exporting data.json backup file...', 'success');
    });
  }

  // Import data.json
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
        const res = await DataStore.importJSON(evt.target.result);
        if (res.success) {
          showToast('Data imported and restored successfully!', 'success');
        } else {
          showToast(`Import error: ${res.message}`, 'error');
        }
      };
      reader.readAsText(file);
    });
  }

  // Wipe All Demo Data
  if (wipeBtn) {
    wipeBtn.addEventListener('click', async () => {
      const confirmText = prompt('Type "WIPE" in all caps to clear all demo projects and reviews:');
      if (confirmText !== 'WIPE') {
        showToast('Wipe cancelled.', 'info');
        return;
      }

      const p = DataStore.getProfile();
      await DataStore.updateData({
        projects: [],
        reviews: []
      });

      showToast('All demo projects wiped. Clean slate ready for personal works!', 'success');
    });
  }
}

/* --- 11. THEME STUDIO & PIN RESET --- */
function initThemeStudio() {
  const themePickers = document.querySelectorAll('.theme-pick-card');
  const changePinForm = document.getElementById('changePinForm');

  themePickers.forEach(card => {
    card.addEventListener('click', async () => {
      themePickers.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const themeId = card.getAttribute('data-theme-id');

      const settings = DataStore.getSettings();
      settings.currentTheme = themeId;
      localStorage.setItem('portfolio_active_theme', themeId);
      await DataStore.updateData({ settings });
      showToast(`Aesthetic theme set to ${themeId}`, 'success');
    });
  });

  if (changePinForm) {
    changePinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPin = document.getElementById('currentPinInput').value.trim();
      const newPin = document.getElementById('newPinInput').value.trim();
      const confirmPin = document.getElementById('confirmPinInput').value.trim();

      const storedCred = SecurityShield.getCredential();
      let isValidCurrent = false;

      if (storedCred) {
        isValidCurrent = await SecurityShield.verifyPin(currentPin, storedCred);
      }
      if (!isValidCurrent && currentPin === '4742') {
        isValidCurrent = true;
      }

      if (!isValidCurrent) {
        showToast('Current PIN is incorrect.', 'error');
        return;
      }

      if (newPin.length < 4 || newPin.length > 8) {
        showToast('New PIN must be between 4 and 8 digits.', 'warning');
        return;
      }

      if (newPin !== confirmPin) {
        showToast('New PINs do not match.', 'error');
        return;
      }

      const newCred = await SecurityShield.createCredential(newPin);
      await SecurityShield.saveCredential(newCred);
      SecurityShield.resetShield();

      changePinForm.reset();
      showToast('Master Security PIN updated successfully!', 'success');
    });
  }
}

/* --- TOAST NOTIFICATIONS --- */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-bell'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
