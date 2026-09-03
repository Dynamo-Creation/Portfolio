/**
 * ==============================================================================
 * 🗄️ UNIFIED REACTIVE DATA STORE (Supabase Cloud <-> LocalStorage <-> data.json)
 * ==============================================================================
 */

const DataStore = (() => {
  const LOCAL_CACHE_KEY = 'portfolio_cached_data_v1';
  let _data = null;
  let _listeners = [];
  let _realtimeSubscription = null;

  // Event dispatching
  const subscribe = (callback) => {
    _listeners.push(callback);
    return () => {
      _listeners = _listeners.filter(cb => cb !== callback);
    };
  };

  const notify = (source = 'local') => {
    _listeners.forEach(cb => {
      try {
        cb(_data, source);
      } catch (e) {
        console.error('DataStore listener error:', e);
      }
    });
  };

  // 1. Initial Load Engine (Fallback cascade: Supabase -> LocalStorage -> data.json)
  const init = async () => {
    // A. Check LocalStorage cache first for instant render
    const cached = localStorage.getItem(LOCAL_CACHE_KEY);
    if (cached) {
      try {
        _data = JSON.parse(cached);
        notify('cache');
      } catch (e) {
        console.warn('Cached data corrupt, re-fetching...');
      }
    }

    // B. If no cache, fetch data.json fallback seed
    if (!_data) {
      await fetchSeedData();
    }

    // C. Try fetching live from Supabase Cloud if configured
    if (SupabaseConfig.isConfigured()) {
      try {
        await syncFromCloud();
        setupRealtimeSubscription();
      } catch (err) {
        console.warn('Cloud sync skipped, operating in offline/cached mode:', err);
      }
    }

    return _data;
  };

  const fetchSeedData = async () => {
    try {
      const response = await fetch('./data.json?v=' + Date.now());
      if (response.ok) {
        const json = await response.json();
        _data = json;
        saveToCache(_data);
        notify('seed');
        return json;
      }
    } catch (e) {
      console.warn('Failed to load local data.json, using baseline fallback:', e);
    }
  };

  const saveToCache = (data) => {
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  };

  // 2. Cloud Sync Engine
  const syncFromCloud = async () => {
    const supabase = SupabaseConfig.getClient();
    if (!supabase) return false;

    try {
      // Parallel fetch from all tables
      const [
        { data: profiles },
        { data: projects },
        { data: services },
        { data: skills },
        { data: experience },
        { data: reviews },
        { data: inquiries },
        { data: settings }
      ] = await Promise.all([
        supabase.from('portfolio_profile').select('*').limit(1),
        supabase.from('portfolio_projects').select('*').order('display_order', { ascending: true }),
        supabase.from('portfolio_services').select('*').order('display_order', { ascending: true }),
        supabase.from('portfolio_skills').select('*').order('display_order', { ascending: true }),
        supabase.from('portfolio_experience').select('*').order('display_order', { ascending: true }),
        supabase.from('portfolio_reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('portfolio_inquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('portfolio_settings').select('*').limit(1)
      ]);

      let cloudData = { ..._data };

      if (profiles && profiles.length > 0) {
        const p = profiles[0];
        cloudData.profile = {
          name: p.name,
          title: p.title,
          roles: p.roles || _data?.profile?.roles || [],
          tagline: p.tagline,
          bio: p.bio,
          contact: p.contact || _data?.profile?.contact || {},
          socials: p.socials || _data?.profile?.socials || {},
          avatar: p.avatar,
          heroImage: p.hero_image,
          resumeUrl: p.resume_url || '#'
        };
      }

      if (projects && projects.length > 0) {
        cloudData.projects = projects.map(p => ({
          id: p.slug_id || p.id,
          title: p.title,
          category: p.category,
          subcategory: p.subcategory || '',
          description: p.description || '',
          thumbnail: p.thumbnail,
          images: p.images || [],
          videoUrl: p.video_url || '',
          tags: p.tags || [],
          client: p.client || '',
          year: p.year || '',
          featured: Boolean(p.featured),
          link: p.link || ''
        }));
      }

      if (services && services.length > 0) {
        cloudData.services = services.map(s => ({
          id: s.slug_id || s.id,
          title: s.title,
          category: s.category,
          icon: s.icon || 'fa-cube',
          description: s.description || '',
          features: s.features || [],
          startingPrice: s.starting_price || '',
          deliveryTime: s.delivery_time || '',
          whatsappPrefill: s.whatsapp_prefill || ''
        }));
      }

      if (skills && skills.length > 0) {
        cloudData.skills = skills.map(sk => ({
          name: sk.name,
          category: sk.category,
          level: sk.level,
          icon: sk.icon || 'fa-code'
        }));
      }

      if (experience && experience.length > 0) {
        cloudData.experience = experience.map(e => ({
          id: e.slug_id || e.id,
          role: e.role,
          company: e.company,
          period: e.period,
          description: e.description || '',
          highlights: e.highlights || []
        }));
      }

      if (reviews && reviews.length > 0) {
        cloudData.reviews = reviews.map(r => ({
          id: r.slug_id || r.id,
          name: r.name,
          role: r.role || '',
          company: r.company || '',
          avatar: r.avatar || '',
          rating: r.rating || 5,
          text: r.text,
          project: r.project || '',
          approved: r.approved !== false
        }));
      }

      if (inquiries) {
        cloudData.inquiries = inquiries.map(i => ({
          id: i.id,
          name: i.name,
          email: i.email,
          phone: i.phone || '',
          service: i.service || '',
          budget: i.budget || '',
          timeline: i.timeline || '',
          message: i.message,
          status: i.status || 'New',
          date: new Date(i.created_at).toLocaleString()
        }));
      }

      if (settings && settings.length > 0) {
        const s = settings[0];
        cloudData.settings = {
          ...cloudData.settings,
          currentTheme: s.current_theme || cloudData.settings?.currentTheme || 'cyber-dark',
          primaryColor: s.primary_color || cloudData.settings?.primaryColor || '#6366f1',
          accentColor: s.accent_color || cloudData.settings?.accentColor || '#06b6d4',
          secondaryColor: s.secondary_color || cloudData.settings?.secondaryColor || '#ec4899',
          masterPin: s.master_pin_hash || cloudData.settings?.masterPin || '2558',
          particleSpeed: Number(s.particle_speed) || 0.8,
          particleCount: Number(s.particle_count) || 80,
          heroMode: s.hero_mode || 'dynamic-showcase'
        };
      }

      _data = cloudData;
      saveToCache(_data);
      notify('cloud-sync');
      return true;
    } catch (err) {
      console.error('Error in syncFromCloud:', err);
      return false;
    }
  };

  // 3. Supabase Realtime Listener
  const setupRealtimeSubscription = () => {
    const supabase = SupabaseConfig.getClient();
    if (!supabase || _realtimeSubscription) return;

    try {
      _realtimeSubscription = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            console.log('⚡ Supabase Realtime broadcast received:', payload);
            syncFromCloud();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription error:', err);
    }
  };

  // 4. Data Accessors & Mutators
  const getData = () => _data || {};
  const getProfile = () => _data?.profile || {};
  const getProjects = () => _data?.projects || [];
  const getServices = () => _data?.services || [];
  const getSkills = () => _data?.skills || [];
  const getExperience = () => _data?.experience || [];
  const getReviews = (all = false) => {
    const list = _data?.reviews || [];
    return all ? list : list.filter(r => r.approved !== false);
  };
  const getInquiries = () => _data?.inquiries || [];
  const getSettings = () => _data?.settings || {};

  // Generic Save and Sync Local + Cloud
  const updateData = async (newData, updateCloud = true) => {
    _data = { ..._data, ...newData };
    saveToCache(_data);
    notify('local-update');

    if (updateCloud && SupabaseConfig.isConfigured()) {
      try {
        await pushToCloud();
      } catch (err) {
        console.warn('Cloud sync error on update:', err);
      }
    }
    return _data;
  };

  // Push whole store or single entities to Supabase Cloud
  const pushToCloud = async () => {
    const supabase = SupabaseConfig.getClient();
    if (!supabase || !_data) return { success: false, message: 'Supabase client not initialized or no data available.' };

    const errors = [];
    let syncedTables = 0;

    try {
      // 1. Profile Upsert / Update
      if (_data.profile) {
        try {
          const profilePayload = {
            name: _data.profile.name,
            title: _data.profile.title,
            roles: _data.profile.roles || [],
            tagline: _data.profile.tagline || '',
            bio: _data.profile.bio || '',
            contact: _data.profile.contact || {},
            socials: _data.profile.socials || {},
            avatar: _data.profile.avatar || '',
            hero_image: _data.profile.heroImage || '',
            resume_url: _data.profile.resumeUrl || '#',
            updated_at: new Date().toISOString()
          };

          const { data: existingProf, error: fetchErr } = await supabase.from('portfolio_profile').select('id').limit(1);
          if (fetchErr) throw fetchErr;

          if (existingProf && existingProf.length > 0) {
            const { error: updErr } = await supabase.from('portfolio_profile').update(profilePayload).eq('id', existingProf[0].id);
            if (updErr) throw updErr;
          } else {
            const { error: insErr } = await supabase.from('portfolio_profile').insert([profilePayload]);
            if (insErr) throw insErr;
          }
          syncedTables++;
        } catch (err) {
          console.error('Supabase profile sync error:', err);
          errors.push(`Profile: ${err.message}`);
        }
      }

      // 2. Settings Upsert / Update
      if (_data.settings) {
        try {
          const settingsPayload = {
            current_theme: _data.settings.currentTheme || 'cyber-dark',
            primary_color: _data.settings.primaryColor || '#6366f1',
            accent_color: _data.settings.accentColor || '#06b6d4',
            secondary_color: _data.settings.secondaryColor || '#ec4899',
            master_pin_hash: _data.settings.masterPin || '2558',
            particle_speed: Number(_data.settings.particleSpeed) || 0.8,
            particle_count: Number(_data.settings.particleCount) || 80,
            hero_mode: _data.settings.heroMode || 'dynamic-showcase',
            updated_at: new Date().toISOString()
          };

          const { data: existingSet, error: fetchSetErr } = await supabase.from('portfolio_settings').select('id').limit(1);
          if (fetchSetErr) throw fetchSetErr;

          if (existingSet && existingSet.length > 0) {
            const { error: updSetErr } = await supabase.from('portfolio_settings').update(settingsPayload).eq('id', existingSet[0].id);
            if (updSetErr) throw updSetErr;
          } else {
            const { error: insSetErr } = await supabase.from('portfolio_settings').insert([settingsPayload]);
            if (insSetErr) throw insSetErr;
          }
          syncedTables++;
        } catch (err) {
          console.error('Supabase settings sync error:', err);
          errors.push(`Settings: ${err.message}`);
        }
      }

      // 3. Projects Upsert
      if (_data.projects && _data.projects.length > 0) {
        try {
          const projPayload = _data.projects.map((p, idx) => ({
            slug_id: p.id,
            title: p.title,
            category: p.category,
            subcategory: p.subcategory || '',
            description: p.description || '',
            thumbnail: p.thumbnail,
            images: p.images || [],
            video_url: p.videoUrl || '',
            tags: p.tags || [],
            client: p.client || '',
            year: p.year || '',
            featured: Boolean(p.featured),
            link: p.link || '',
            display_order: idx,
            updated_at: new Date().toISOString()
          }));
          const { error: projErr } = await supabase.from('portfolio_projects').upsert(projPayload, { onConflict: 'slug_id' });
          if (projErr) throw projErr;
          syncedTables++;
        } catch (err) {
          console.error('Supabase projects sync error:', err);
          errors.push(`Projects: ${err.message}`);
        }
      }

      // 4. Services Upsert
      if (_data.services && _data.services.length > 0) {
        try {
          const servPayload = _data.services.map((s, idx) => ({
            slug_id: s.id,
            title: s.title,
            category: s.category,
            icon: s.icon || 'fa-cube',
            description: s.description || '',
            features: s.features || [],
            starting_price: s.startingPrice || '',
            delivery_time: s.deliveryTime || '',
            whatsapp_prefill: s.whatsappPrefill || '',
            display_order: idx
          }));
          const { error: servErr } = await supabase.from('portfolio_services').upsert(servPayload, { onConflict: 'slug_id' });
          if (servErr) throw servErr;
          syncedTables++;
        } catch (err) {
          console.error('Supabase services sync error:', err);
          errors.push(`Services: ${err.message}`);
        }
      }

      // 5. Skills Upsert
      if (_data.skills && _data.skills.length > 0) {
        try {
          const skillPayload = _data.skills.map((sk, idx) => ({
            name: sk.name,
            category: sk.category,
            level: Number(sk.level) || 85,
            icon: sk.icon || 'fa-code',
            display_order: idx
          }));
          const { error: skillErr } = await supabase.from('portfolio_skills').upsert(skillPayload, { onConflict: 'name' });
          if (skillErr) throw skillErr;
          syncedTables++;
        } catch (err) {
          console.error('Supabase skills sync error:', err);
          errors.push(`Skills: ${err.message}`);
        }
      }

      // 6. Experience Upsert
      if (_data.experience && _data.experience.length > 0) {
        try {
          const expPayload = _data.experience.map((e, idx) => ({
            slug_id: e.id,
            role: e.role,
            company: e.company,
            period: e.period,
            description: e.description || '',
            highlights: e.highlights || [],
            display_order: idx
          }));
          const { error: expErr } = await supabase.from('portfolio_experience').upsert(expPayload, { onConflict: 'slug_id' });
          if (expErr) throw expErr;
          syncedTables++;
        } catch (err) {
          console.error('Supabase experience sync error:', err);
          errors.push(`Experience: ${err.message}`);
        }
      }

      // 7. Reviews Upsert
      if (_data.reviews && _data.reviews.length > 0) {
        try {
          const revPayload = _data.reviews.map(r => ({
            slug_id: r.id,
            name: r.name,
            role: r.role || '',
            company: r.company || '',
            avatar: r.avatar || '',
            rating: Number(r.rating) || 5,
            text: r.text,
            project: r.project || '',
            approved: r.approved !== false
          }));
          const { error: revErr } = await supabase.from('portfolio_reviews').upsert(revPayload, { onConflict: 'slug_id' });
          if (revErr) throw revErr;
          syncedTables++;
        } catch (err) {
          console.error('Supabase reviews sync error:', err);
          errors.push(`Reviews: ${err.message}`);
        }
      }

      if (errors.length > 0) {
        return { success: false, syncedTables, message: `Partial sync completed (${syncedTables} tables). Errors: ${errors.join(', ')}` };
      }

      return { success: true, syncedTables, message: `Successfully pushed all ${syncedTables} modules to Supabase Cloud!` };
    } catch (err) {
      console.error('pushToCloud fatal error:', err);
      return { success: false, message: err.message };
    }
  };

  // Inquiries Submissions (from Client Form)
  const submitInquiry = async (inquiryData) => {
    const newInquiry = {
      id: 'inq-' + Date.now(),
      name: inquiryData.name,
      email: inquiryData.email,
      phone: inquiryData.phone || '',
      service: inquiryData.service || 'General Inquiry',
      budget: inquiryData.budget || 'Flexible',
      timeline: inquiryData.timeline || 'Flexible',
      message: inquiryData.message,
      status: 'New',
      date: new Date().toLocaleString()
    };

    if (!_data.inquiries) _data.inquiries = [];
    _data.inquiries.unshift(newInquiry);
    saveToCache(_data);
    notify('new-inquiry');

    // Cloud upload if available
    const supabase = SupabaseConfig.getClient();
    if (supabase) {
      try {
        await supabase.from('portfolio_inquiries').insert([{
          name: inquiryData.name,
          email: inquiryData.email,
          phone: inquiryData.phone || '',
          service: inquiryData.service || '',
          budget: inquiryData.budget || '',
          timeline: inquiryData.timeline || '',
          message: inquiryData.message,
          status: 'New'
        }]);
      } catch (e) {
        console.warn('Inquiry cloud insert fallback to local cache:', e);
      }
    }

    return newInquiry;
  };

  // Export / Backup as JSON file
  const exportJSON = () => {
    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(_data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import / Restore from JSON
  const importJSON = async (jsonString) => {
    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!parsed.profile || !parsed.projects) {
        throw new Error('Invalid portfolio JSON schema');
      }
      _data = parsed;
      saveToCache(_data);
      notify('import-restore');
      if (SupabaseConfig.isConfigured()) {
        await pushToCloud();
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Reset to Factory seed
  const resetToFactory = async () => {
    localStorage.removeItem(LOCAL_CACHE_KEY);
    await fetchSeedData();
    notify('factory-reset');
  };

  return {
    init,
    subscribe,
    notify,
    getData,
    getProfile,
    getProjects,
    getServices,
    getSkills,
    getExperience,
    getReviews,
    getInquiries,
    getSettings,
    updateData,
    submitInquiry,
    syncFromCloud,
    pushToCloud,
    exportJSON,
    importJSON,
    resetToFactory
  };
})();
