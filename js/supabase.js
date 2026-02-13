// Supabase Client Initialization
// IMPORTANT: Replace these with your actual Supabase project credentials
// Find them at: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

const SUPABASE_URL = 'https://eortpfteluhkblteneuq.supabase.co';  // Replace with your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcnRwZnRlbHVoa2JsdGVuZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDYzMTgsImV4cCI6MjA4NTM4MjMxOH0.ebPmeJWo2rEt8iYCAuLOJZtG2H33WLJNXPFSntKkI3o';  // Replace with your anon/public key

window.Alcove = window.Alcove || {};

// Initialize Supabase client
Alcove.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if Supabase is configured
Alcove.isSupabaseConfigured = function() {
  return SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' &&
         SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY';
};
