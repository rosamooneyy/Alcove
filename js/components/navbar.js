window.Alcove = window.Alcove || {};

(function() {
  function render() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    // Check authentication status
    const isConfigured = Alcove.isSupabaseConfigured && Alcove.isSupabaseConfigured();
    const isAuthenticated = isConfigured && Alcove.auth && Alcove.auth.isAuthenticated();
    const currentUser = isAuthenticated ? Alcove.auth.getCurrentUser() : null;

    // Get user name from auth metadata or local store
    const userName = currentUser?.user_metadata?.name ||
                     Alcove.store.get('user.name') ||
                     currentUser?.email?.split('@')[0] ||
                     'Reader';

    nav.innerHTML = `
      <a href="#/" class="nav-brand">
        <div class="nav-brand-logo">
          <svg viewBox="0 0 12 32" width="12" height="32" class="nav-brand-dots">
            <circle cx="6" cy="6" r="4" fill="#F5A07A"/>
            <circle cx="6" cy="16" r="4" fill="#7AB8F5"/>
            <circle cx="6" cy="26" r="4" fill="#6B3A5C"/>
          </svg>
        </div>
        <span class="nav-brand-name">Alcove</span>
      </a>

      <div class="nav-search">
        <div class="nav-search-input" id="nav-search-container"></div>
      </div>

      <div class="nav-links">
        <div class="nav-section-label">Discover</div>
        <a href="#/" class="nav-link nav-link-salmon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Home
        </a>
        <a href="#/search" class="nav-link nav-link-salmon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          Browse Books
        </a>
        <a href="#/discover-tropes" class="nav-link nav-link-salmon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Discover Tropes
        </a>
        <a href="#/tropes" class="nav-link nav-link-sub nav-link-salmon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"/>
            <line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/>
            <line x1="20" y1="12" x2="20" y2="3"/>
            <line x1="1" y1="14" x2="7" y2="14"/>
            <line x1="9" y1="8" x2="15" y2="8"/>
            <line x1="17" y1="16" x2="23" y2="16"/>
          </svg>
          Search by Tropes
        </a>

        <div class="nav-section-label">Library</div>
        <a href="#/shelves" class="nav-link nav-link-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
          My Shelves
        </a>
        <a href="#/shelf/currently-reading" class="nav-link nav-link-sub nav-link-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
          </svg>
          Currently Reading
        </a>
        <a href="#/shelf/to-read" class="nav-link nav-link-sub nav-link-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          To Read
        </a>
        <a href="#/shelf/read" class="nav-link nav-link-sub nav-link-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Read
        </a>

        <div class="nav-section-label">Personal</div>
        <a href="#/profile" class="nav-link nav-link-purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Profile
        </a>
        <a href="#/stats" class="nav-link nav-link-purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Statistics
        </a>
        <a href="#/quotes" class="nav-link nav-link-purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
          </svg>
          Quotes
        </a>
        <a href="#/friends" class="nav-link nav-link-purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          Friends
        </a>
        <a href="#/settings" class="nav-link nav-link-purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
          Settings
        </a>
      </div>

      <div class="nav-footer">
        ${isAuthenticated ? `
          <div class="nav-user">
            <div class="nav-user-avatar">${userName.charAt(0).toUpperCase()}</div>
            <div class="nav-user-info">
              <span class="nav-user-name">${Alcove.sanitize(userName)}</span>
              <button class="nav-logout-btn" id="nav-logout-btn">Sign Out</button>
            </div>
          </div>
        ` : isConfigured ? `
          <a href="#/login" class="btn btn-primary btn-block nav-login-btn">Sign In</a>
        ` : `
          <div class="nav-user">
            <div class="nav-user-avatar">${userName.charAt(0).toUpperCase()}</div>
            <span class="nav-user-name">${Alcove.sanitize(userName)}</span>
          </div>
        `}
      </div>
    `;

    // Render nav search bar
    if (Alcove.searchBar) {
      Alcove.searchBar.renderCompact('nav-search-container');
    }

    // Set active link
    const hash = window.location.hash || '#/';
    const path = hash.replace(/^#\/?/, '/').split('?')[0];
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = (link.getAttribute('href') || '').replace('#', '');
      const isActive = path === href || (href !== '/' && path.startsWith(href));
      link.classList.toggle('active', isActive);
    });

    // Logout button handler
    const logoutBtn = document.getElementById('nav-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await Alcove.auth.signOut();
          if (Alcove.toast) Alcove.toast.show('Signed out successfully', 'success');
        } catch (error) {
          if (Alcove.toast) Alcove.toast.show('Failed to sign out', 'error');
        }
      });
    }
  }

  Alcove.navbar = { render };
})();
