// Supabase Client Initialization
// IMPORTANT: Replace these with your actual Supabase project credentials
// Find them at: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

const SUPABASE_URL = 'https://eortpfteluhkblteneuq.supabase.co';  // Replace with your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcnRwZnRlbHVoa2JsdGVuZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDYzMTgsImV4cCI6MjA4NTM4MjMxOH0.ebPmeJWo2rEt8iYCAuLOJZtG2H33WLJNXPFSntKkI3o';  // Replace with your anon/public key

window.Alcove = window.Alcove || {};

// Detect auth errors in the URL hash (e.g. expired reset links)
// Must happen before createClient() clears the hash
(function() {
  const hash = window.location.hash;
  if (hash.includes('error=')) {
    const params = new URLSearchParams(hash.replace(/^#\/?/, ''));
    const errorDesc = params.get('error_description');
    if (errorDesc) {
      sessionStorage.setItem('alcove_auth_error', errorDesc.replace(/\+/g, ' '));
    }
  }
})();

// Detect password recovery BEFORE createClient() processes and clears URL tokens
// Check both: hash tokens (implicit flow) and query param flag (PKCE flow)
if (window.location.hash.includes('type=recovery') ||
    window.location.search.includes('recovery=1')) {
  sessionStorage.setItem('alcove_password_recovery', '1');
}

// Clean up the ?recovery=1 flag from the URL so it doesn't persist
if (window.location.search.includes('recovery=1')) {
  const url = new URL(window.location.href);
  url.searchParams.delete('recovery');
  window.history.replaceState({}, '', url.toString());
}

// Initialize Supabase client
Alcove.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if Supabase is configured
Alcove.isSupabaseConfigured = function() {
  return SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' &&
         SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY';
};
