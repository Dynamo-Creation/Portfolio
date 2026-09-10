/**
 * ==============================================================================
 * ⚡ SUPABASE CLIENT CONFIGURATION & CONNECTION MANAGER
 * ==============================================================================
 */

const SupabaseConfig = (() => {
  const STORAGE_KEY_URL = 'portfolio_supabase_url';
  const STORAGE_KEY_ANON = 'portfolio_supabase_anon_key';

  // Default embedded credentials (can be hardcoded here or configured via Admin CMS)
  const DEFAULT_SUPABASE_URL = 'https://ykywmipdjwogzhbwlpdn.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlreXdtaXBkandvZ3poYndscGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyODI1OTcsImV4cCI6MjEwMzg1ODU5N30.eOWQQZrbosCWoBINfNJlFW9xtu3GMn8XP3gIs68dVeg';

  let _url = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL;
  let _anonKey = localStorage.getItem(STORAGE_KEY_ANON) || DEFAULT_SUPABASE_ANON_KEY;
  let _client = null;
  let _isConnected = false;

  const initClient = () => {
    _url = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL;
    _anonKey = localStorage.getItem(STORAGE_KEY_ANON) || DEFAULT_SUPABASE_ANON_KEY;

    if (_url && _anonKey && window.supabase) {
      try {
        _client = window.supabase.createClient(_url, _anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          },
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          }
        });
        return _client;
      } catch (err) {
        console.warn('Supabase initialization failed:', err);
        _client = null;
      }
    }
    return null;
  };

  const getClient = () => {
    if (!_client) {
      initClient();
    }
    return _client;
  };

  const isConfigured = () => {
    return Boolean(_url && _anonKey);
  };

  const getCredentials = () => ({
    url: _url,
    anonKey: _anonKey
  });

  const saveCredentials = async (url, anonKey) => {
    const cleanUrl = (url || '').trim().replace(/\/$/, '');
    const cleanKey = (anonKey || '').trim();

    if (cleanUrl) {
      localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
      _url = cleanUrl;
    } else {
      localStorage.removeItem(STORAGE_KEY_URL);
      _url = '';
    }

    if (cleanKey) {
      localStorage.setItem(STORAGE_KEY_ANON, cleanKey);
      _anonKey = cleanKey;
    } else {
      localStorage.removeItem(STORAGE_KEY_ANON);
      _anonKey = '';
    }

    _client = null;
    initClient();
    return await testConnection();
  };

  const testConnection = async (testUrl, testKey) => {
    const url = testUrl !== undefined ? testUrl.trim() : _url;
    const key = testKey !== undefined ? testKey.trim() : _anonKey;

    if (!url || !key) {
      _isConnected = false;
      return { success: false, message: 'Supabase URL or Anon Key is missing.' };
    }

    if (!window.supabase) {
      _isConnected = false;
      return { success: false, message: 'Supabase JS library not loaded.' };
    }

    try {
      const testClient = window.supabase.createClient(url, key);
      // Try testing portfolio_data table first, then fallback to portfolio_profile
      let { data, error } = await testClient
        .from('portfolio_data')
        .select('key')
        .limit(1);

      if (error && error.code === '42P01') {
        const fallbackRes = await testClient
          .from('portfolio_profile')
          .select('name')
          .limit(1);
        error = fallbackRes.error;
      }

      if (error && error.code !== 'PGRST116' && error.code !== 'PGRST204') {
        _isConnected = false;
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('schema cache') || error.code === 'PGRST205' || error.code === '42P01') {
          return {
            success: false,
            message: "Table 'portfolio_data' not found. Please open Supabase SQL Editor and run 'supabase_schema.sql' to create the tables."
          };
        }
        return { success: false, message: `Database error: ${error.message}` };
      }

      _isConnected = true;
      return { success: true, message: 'Successfully connected to Supabase Cloud Database!' };
    } catch (err) {
      _isConnected = false;
      return { success: false, message: `Connection failed: ${err.message}` };
    }
  };

  const isConnected = () => _isConnected;

  return {
    initClient,
    getClient,
    isConfigured,
    isConnected,
    getCredentials,
    saveCredentials,
    testConnection
  };
})();

// Auto-initialize on load
window.addEventListener('DOMContentLoaded', () => {
  SupabaseConfig.initClient();
});
