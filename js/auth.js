// Authentication Module for Alcove
window.Alcove = window.Alcove || {};

(function() {
  // Current user state
  let currentUser = null;
  let authListeners = [];

  // Sign up with email and password
  async function signUp(email, password, name) {
    if (!Alcove.isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please add your credentials to js/supabase.js');
    }

    const { data, error } = await Alcove.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || 'Reader' }
      }
    });

    if (error) throw error;
    return data;
  }

  // Sign in with email and password
  async function signIn(email, password) {
    if (!Alcove.isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please add your credentials to js/supabase.js');
    }

    const { data, error } = await Alcove.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  // Sign in with Google
  async function signInWithGoogle() {
    if (!Alcove.isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please add your credentials to js/supabase.js');
    }

    const { data, error } = await Alcove.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
    return data;
  }

  // Sign out
  async function signOut() {
    const { error } = await Alcove.supabase.auth.signOut();
    if (error) throw error;
    currentUser = null;
  }

  // Send password reset email
  async function resetPassword(email) {
    if (!Alcove.isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please add your credentials to js/supabase.js');
    }

    const { error } = await Alcove.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/#/reset-password'
    });

    if (error) throw error;
  }

  // Update password (after reset)
  async function updatePassword(newPassword) {
    const { error } = await Alcove.supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  }

  // Get current user
  function getCurrentUser() {
    return currentUser;
  }

  // Check if user is authenticated
  function isAuthenticated() {
    return currentUser !== null;
  }

  // Get user profile from profiles table
  async function getProfile() {
    if (!currentUser) return null;

    const { data, error } = await Alcove.supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  // Update user profile
  async function updateProfile(updates) {
    if (!currentUser) throw new Error('Not authenticated');

    const { data, error } = await Alcove.supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Register auth state change listener
  function onAuthStateChange(callback) {
    authListeners.push(callback);
    // Return unsubscribe function
    return () => {
      authListeners = authListeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners of auth state change
  function notifyListeners(event, session) {
    authListeners.forEach(callback => {
      try {
        callback(event, session);
      } catch (e) {
        console.error('Auth listener error:', e);
      }
    });
  }

  // Initialize auth state
  async function init() {
    if (!Alcove.isSupabaseConfigured()) {
      console.warn('Supabase not configured - running in local-only mode');
      return;
    }

    // Get initial session
    const { data: { session } } = await Alcove.supabase.auth.getSession();
    if (session) {
      currentUser = session.user;
      notifyListeners('SIGNED_IN', session);
    }

    // Listen for auth changes
    Alcove.supabase.auth.onAuthStateChange((event, session) => {
      currentUser = session?.user || null;
      notifyListeners(event, session);
    });
  }

  // Export auth module
  Alcove.auth = {
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    getCurrentUser,
    isAuthenticated,
    getProfile,
    updateProfile,
    onAuthStateChange,
    init
  };
})();
