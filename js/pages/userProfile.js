// User Profile Page - View other users' public profiles
window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  // Helper to render streak card
  function renderStreakCard(streak) {
    return `
      <div class="home-streak-section">
        <div class="streak-card">
          <div class="streak-main">
            <div class="streak-icon ${streak.current > 0 ? 'streak-icon-active' : ''}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                <path d="M12 2c.5 0 1.5 2 2.5 4 .5 1 1.5 2 3 2.5 1 .3 2.5.5 3 1.5.3.7 0 2-.5 3-.5 1-1 2.5-1 4s.5 3 0 4-.5 1-1.5 1.5c-1 .5-2 0-3.5-.5s-3-1-4-1-2.5.5-4 1-2.5 1-3.5.5S2 21 1.5 20 2 17 2 15s-.5-3-1-4-.8-2.3-.5-3c.5-1 2-1.2 3-1.5 1.5-.5 2.5-1.5 3-2.5C8.5 2 9.5 0 10 0"/>
              </svg>
            </div>
            <div class="streak-numbers">
              <span class="streak-count">${streak.current}</span>
              <span class="streak-label">day streak</span>
            </div>
          </div>
          <div class="streak-stats">
            <div class="streak-stat">
              <span class="streak-stat-value">${streak.best}</span>
              <span class="streak-stat-label">best</span>
            </div>
            <div class="streak-divider"></div>
            <div class="streak-stat">
              <span class="streak-stat-value">${streak.totalDays || 0}</span>
              <span class="streak-stat-label">total days</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Helper to render currently reading section
  function renderCurrentlyReading(books) {
    if (!books || books.length === 0) return '';

    return `
      <div class="home-section">
        <div class="section-header">
          <h2 class="section-title">Currently Reading</h2>
        </div>
        <div class="currently-reading-list">
          ${books.map(book => `
            <div class="progress-card">
              <div class="progress-card-cover">
                ${book.thumbnail
                  ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}">`
                  : '<div class="progress-card-placeholder"></div>'}
              </div>
              <div class="progress-card-info">
                <div class="progress-card-title">${Alcove.sanitize(book.title)}</div>
                <span class="progress-card-author">by ${Alcove.sanitize((book.authors || []).join(', '))}</span>
                <div class="progress-card-bar">
                  <div class="progress-card-bar-fill" style="width: ${book.percentage || 0}%;"></div>
                </div>
                <span class="progress-card-percent">${book.percentage || 0}% complete</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // DNA profile definitions
  const DNA_PROFILES = {
    'strategic-thinker': {
      title: 'The Strategic Thinker',
      subtitle: 'Knowledge is your superpower',
      description: 'Gravitates toward non-fiction and ideas that sharpen the mind. Books are tools for growth.',
      icon: 'compass',
      accent: '#5b7a9b',
    },
    'escapist-explorer': {
      title: 'The Escapist Explorer',
      subtitle: 'Lost in worlds unknown',
      description: 'Craves immersive worlds and emotional depth. Fantasy, sci-fi, and stories that transport.',
      icon: 'portal',
      accent: '#7a5c8e',
    },
    'genre-nomad': {
      title: 'The Genre Nomad',
      subtitle: 'Every shelf is home',
      description: 'Refuses to be boxed in. Reading list spans every genre, finding gems where others don\'t look.',
      icon: 'map',
      accent: '#5a7a4f',
    },
    'depth-seeker': {
      title: 'The Depth Seeker',
      subtitle: 'Quality over quantity',
      description: 'Reads with intention and finishes what they start. Every book gets full attention.',
      icon: 'anchor',
      accent: '#8b6f5e',
    },
    'heart-reader': {
      title: 'The Heart Reader',
      subtitle: 'Feeling every page',
      description: 'Reads with the heart. Romance, drama, and emotionally rich stories. Connects deeply with characters.',
      icon: 'heart',
      accent: '#9b6070',
    },
    'curator': {
      title: 'The Curator',
      subtitle: 'Building the perfect library',
      description: 'A collector and organizer. Shelves are thoughtfully arranged, tropes tagged, quotes saved.',
      icon: 'gem',
      accent: '#8b7a4a',
    },
  };

  // DNA icon SVGs
  const DNA_ICONS = {
    compass: `<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="24" r="3" fill="currentColor"/><line x1="24" y1="6" x2="24" y2="12" stroke="currentColor" stroke-width="2"/><line x1="24" y1="36" x2="24" y2="42" stroke="currentColor" stroke-width="2"/><line x1="6" y1="24" x2="12" y2="24" stroke="currentColor" stroke-width="2"/><line x1="36" y1="24" x2="42" y2="24" stroke="currentColor" stroke-width="2"/><path d="M24 24L32 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    portal: `<svg viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="24" rx="16" ry="20" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.1"/><ellipse cx="24" cy="24" rx="10" ry="14" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><circle cx="24" cy="24" r="3" fill="currentColor"/><path d="M8 24C8 24 12 18 24 18C36 18 40 24 40 24C40 24 36 30 24 30C12 30 8 24 8 24Z" stroke="currentColor" stroke-width="1.5" opacity="0.3"/></svg>`,
    map: `<svg viewBox="0 0 48 48" fill="none"><path d="M6 10L16 6L32 12L42 8V38L32 42L16 36L6 40V10Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.05"/><line x1="16" y1="6" x2="16" y2="36" stroke="currentColor" stroke-width="2"/><line x1="32" y1="12" x2="32" y2="42" stroke="currentColor" stroke-width="2"/><path d="M10 16C10 16 12 20 16 20C20 20 22 16 22 16" stroke="currentColor" stroke-width="1.5" opacity="0.4"/></svg>`,
    anchor: `<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="14" r="5" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="14" r="2" fill="currentColor" opacity="0.5"/><line x1="24" y1="19" x2="24" y2="40" stroke="currentColor" stroke-width="2"/><line x1="16" y1="28" x2="32" y2="28" stroke="currentColor" stroke-width="2"/><path d="M10 34C10 28 17 24 24 24C31 24 38 28 38 34" stroke="currentColor" stroke-width="1.5" opacity="0.3"/></svg>`,
    heart: `<svg viewBox="0 0 48 48" fill="none"><path d="M24 40C24 40 8 30 8 18C8 12 12 8 17 8C20 8 22 10 24 13C26 10 28 8 31 8C36 8 40 12 40 18C40 30 24 40 24 40Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.15"/><path d="M16 18C16 15 18 13 20 13" stroke="currentColor" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/></svg>`,
    gem: `<svg viewBox="0 0 48 48" fill="none"><polygon points="24,6 38,18 24,42 10,18" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.1"/><polyline points="10,18 24,24 38,18" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="24" y1="6" x2="24" y2="24" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><line x1="24" y1="24" x2="24" y2="42" stroke="currentColor" stroke-width="1.5" opacity="0.2"/></svg>`,
  };

  // Helper to render Reader DNA card for public view
  function renderReaderDNA(dnaTypeId) {
    if (!dnaTypeId) return '';

    const dna = DNA_PROFILES[dnaTypeId];
    if (!dna) return '';

    const iconSvg = DNA_ICONS[dna.icon] || '';

    return `
      <div class="home-section">
        <div class="reader-dna-card" style="--dna-accent:${dna.accent}">
          <div class="reader-dna-top-right">
            ${iconSvg ? `<span class="reader-dna-icon" style="color:${dna.accent}">${iconSvg}</span>` : ''}
          </div>
          <span class="reader-dna-label">READER DNA</span>
          <h3 class="reader-dna-title">${dna.title}</h3>
          <p class="reader-dna-subtitle">${dna.subtitle}</p>
          <div class="reader-dna-accent-bar"></div>
          <p class="reader-dna-description">${dna.description}</p>
        </div>
      </div>
    `;
  }

  // Helper to render stats grid
  function renderStatsGrid(stats) {
    return `
      <div class="profile-section">
        <h2>Reading Stats</h2>
        <div class="profile-stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.booksRead || 0}</div>
            <div class="stat-label">Books Read</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.totalBooks || 0}</div>
            <div class="stat-label">Total in Library</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.booksRated || 0}</div>
            <div class="stat-label">Books Rated</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}</div>
            <div class="stat-label">Average Rating</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.quotesSaved || 0}</div>
            <div class="stat-label">Quotes Saved</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.shelvesCount || 0}</div>
            <div class="stat-label">Shelves</div>
          </div>
        </div>
      </div>
    `;
  }

  // Badge icons (SVGs)
  const BADGE_ICONS = {
    flame: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2c.5 0 1.5 2 2.5 4 .5 1 1.5 2 3 2.5 1 .3 2.5.5 3 1.5.3.7 0 2-.5 3-.5 1-1 2.5-1 4s.5 3 0 4-.5 1-1.5 1.5c-1 .5-2 0-3.5-.5s-3-1-4-1-2.5.5-4 1-2.5 1-3.5.5S2 21 1.5 20 2 17 2 15s-.5-3-1-4-.8-2.3-.5-3c.5-1 2-1.2 3-1.5 1.5-.5 2.5-1.5 3-2.5C8.5 2 9.5 0 10 0"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 22V8a2 2 0 012-2v0a2 2 0 012 2v14"/><path d="M8 6h8v4a4 4 0 01-8 0V6z"/></svg>',
    crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
    books: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>',
    library: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 4h16v16H4z"/><path d="M9 4v16"/><path d="M14 4v16"/></svg>',
    quote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>',
    'early-bird': '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2l2.4 5.2 5.6.8-4 4 .9 5.6L12 15l-4.9 2.6.9-5.6-4-4 5.6-.8z"/></svg>',
  };

  function getBadgeIcon(iconName) {
    return BADGE_ICONS[iconName] || BADGE_ICONS.award;
  }

  // Badge definitions (from store.js)
  const BADGE_DEFINITIONS = {
    'streak-7': { name: 'Week Warrior', description: '7 day streak', icon: 'flame', tier: 'bronze' },
    'streak-14': { name: 'Fortnight', description: '14 day streak', icon: 'flame', tier: 'bronze' },
    'streak-21': { name: 'Three Weeks', description: '21 day streak', icon: 'flame', tier: 'silver' },
    'streak-30': { name: 'Monthly', description: '30 day streak', icon: 'award', tier: 'silver' },
    'streak-60': { name: 'Two Months', description: '60 day streak', icon: 'award', tier: 'gold' },
    'streak-90': { name: 'Quarter Year', description: '90 day streak', icon: 'trophy', tier: 'gold' },
    'streak-180': { name: 'Half Year', description: '180 day streak', icon: 'trophy', tier: 'platinum' },
    'streak-365': { name: 'Full Year', description: '365 day streak', icon: 'crown', tier: 'platinum' },
    'books-1': { name: 'First Book', description: '1 book read', icon: 'book', tier: 'bronze' },
    'books-5': { name: 'Getting Started', description: '5 books read', icon: 'book', tier: 'bronze' },
    'books-10': { name: 'Double Digits', description: '10 books read', icon: 'books', tier: 'silver' },
    'books-25': { name: 'Bookworm', description: '25 books read', icon: 'books', tier: 'silver' },
    'books-50': { name: 'Bibliophile', description: '50 books read', icon: 'library', tier: 'gold' },
    'books-100': { name: 'Century', description: '100 books read', icon: 'library', tier: 'platinum' },
    'quotes-10': { name: 'Collector', description: '10 quotes saved', icon: 'quote', tier: 'bronze' },
    'quotes-50': { name: 'Curator', description: '50 quotes saved', icon: 'quote', tier: 'silver' },
    'early-bird': { name: 'Early Bird', description: 'Founding member — first 100', icon: 'early-bird', tier: 'early-bird' }
  };

  // Helper to render top books for public profile
  function renderPublicTopBooks(books) {
    if (!books || books.length === 0) return '';

    return `
      <div class="top-books-display-stacked">
        ${books.map((book, index) => {
          const authors = (book.authors || ['Unknown']).join(', ');
          return `
            <a href="#/book/${book.id}" class="top-book-row">
              <div class="top-book-rank-badge">#${index + 1}</div>
              <div class="top-book-row-cover">
                ${book.thumbnail
                  ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}">`
                  : '<div class="book-placeholder"></div>'}
              </div>
              <div class="top-book-row-info">
                <h4 class="top-book-row-title">${Alcove.sanitize(book.title)}</h4>
                <p class="top-book-row-author">${Alcove.sanitize(authors)}</p>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    `;
  }

  // Helper to render badges section
  function renderBadgesSection(badgeIds) {
    if (!badgeIds || badgeIds.length === 0) {
      return `
        <div class="profile-section">
          <h2>Awards & Badges</h2>
          <div class="badges-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
            <p>No badges earned yet</p>
          </div>
        </div>
      `;
    }

    // Convert badge IDs to badge objects
    const badges = badgeIds.map(id => ({
      id,
      ...BADGE_DEFINITIONS[id]
    })).filter(badge => badge.name); // Filter out unknown badges

    return `
      <div class="profile-section">
        <h2>Awards & Badges</h2>
        <div class="badges-earned">
          <div class="badges-grid">
            ${badges.map(badge => badge.id === 'early-bird' ? `
              <div class="badge-item badge-early-bird" title="${badge.description}">
                <span class="badge-icon">${getBadgeIcon(badge.icon)}</span>
                <span class="badge-name">${badge.name}</span>
              </div>
            ` : `
              <div class="badge-item badge-tier-${badge.tier}" title="${badge.description}">
                <span class="badge-icon">${getBadgeIcon(badge.icon)}</span>
                <span class="badge-name">${badge.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Helper to render friend action button
  function renderFriendButton(friendshipStatus, userId) {
    if (!friendshipStatus) return '';

    const { status, friendshipId, isRequester } = friendshipStatus;

    if (status === 'accepted') {
      return `
        <button class="btn btn-secondary btn-sm" data-action="unfriend" data-friendship-id="${friendshipId}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Remove Friend
        </button>
      `;
    } else if (status === 'pending') {
      if (isRequester) {
        return `
          <button class="btn btn-secondary btn-sm" data-action="cancel" data-friendship-id="${friendshipId}">
            Request Sent
          </button>
        `;
      } else {
        return `
          <button class="btn btn-primary btn-sm" data-action="accept" data-friendship-id="${friendshipId}">
            Accept Request
          </button>
        `;
      }
    } else {
      return `
        <button class="btn btn-primary btn-sm" data-action="add" data-user-id="${userId}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Add Friend
        </button>
      `;
    }
  }

  // Main render function
  async function render(params) {
    const userId = params.userId;
    const currentUser = Alcove.auth?.getCurrentUser();

    // Check if viewing own profile
    if (currentUser && userId === currentUser.id) {
      Alcove.router.navigate('/');
      return { html: '' };
    }

    // Fetch public profile
    const profile = await Alcove.friends.getPublicProfile(userId);

    // User not found
    if (!profile) {
      return {
        html: `
          <div class="user-profile-page animate-in">
            <div class="profile-error card">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64" style="color: var(--color-stone); margin-bottom: var(--space-lg);">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <h2>User not found</h2>
              <p style="color: var(--color-stone); margin-bottom: var(--space-lg);">This user doesn't exist or has been removed.</p>
              <a href="#/friends" class="btn btn-primary">Back to Friends</a>
            </div>
          </div>
        `,
        init: () => {}
      };
    }

    // Private profile
    if (profile.is_public === false) {
      return {
        html: `
          <div class="user-profile-page animate-in">
            <div class="profile-private card">
              <div class="profile-avatar profile-avatar-large">
                ${profile.name.charAt(0).toUpperCase()}
              </div>
              <h1 class="profile-name">${Alcove.sanitize(profile.name)}</h1>
              <p class="profile-joined">Member since ${Alcove.dateTime.formatDate(profile.created_at)}</p>
              <div class="profile-private-notice">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32" style="color: var(--color-stone); margin-bottom: var(--space-md);">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <h3>This profile is private</h3>
                <p style="color: var(--color-stone);">This user has chosen to keep their reading activity private.</p>
              </div>
              <a href="#/friends" class="btn btn-secondary">Back to Friends</a>
            </div>
          </div>
        `,
        init: () => {}
      };
    }

    // Public profile - fetch additional data
    const friendshipStatus = await Alcove.friends.getFriendshipStatus(userId);

    const topBooks = profile.top_books && profile.top_books.length > 0
      ? await Alcove.friends.getUserTopBooks(userId, profile.top_books)
      : [];

    // Build public profile HTML with compact quick-view layout
    const html = `
      <div class="user-profile-page user-profile-quick-view animate-in">
        <!-- Compact Header -->
        <div class="user-profile-header-compact card">
          <div class="profile-avatar profile-avatar-medium">
            ${profile.name.charAt(0).toUpperCase()}
          </div>
          <div class="user-profile-info-compact">
            <h1 class="profile-name-compact">${Alcove.sanitize(profile.name)}</h1>
            <p class="profile-joined-compact">Member since ${Alcove.dateTime.formatDate(profile.created_at)}</p>
          </div>
          ${renderFriendButton(friendshipStatus, userId)}
        </div>

        <!-- Compact Streak Banner -->
        <div class="user-profile-streak-compact card">
          <div class="streak-stat-compact">
            <span class="streak-stat-value-compact">${profile.public_streak_current || 0}</span>
            <span class="streak-stat-label-compact">Current</span>
          </div>
          <div class="streak-divider-compact"></div>
          <div class="streak-stat-compact">
            <span class="streak-stat-value-compact">${profile.public_streak_best || 0}</span>
            <span class="streak-stat-label-compact">Best</span>
          </div>
          <div class="streak-divider-compact"></div>
          <div class="streak-stat-compact">
            <span class="streak-stat-value-compact">${profile.public_total_reading_days || 0}</span>
            <span class="streak-stat-label-compact">Total Days</span>
          </div>
        </div>

        <!-- Grid Layout for Main Content -->
        <div class="user-profile-grid">
          <!-- Left Column -->
          <div class="user-profile-column-left">

            <!-- Reader DNA (Compact) -->
            ${renderReaderDNA(profile.reader_dna_type)}

            <!-- Stats (Compact) -->
            ${renderStatsGrid({
              booksRead: profile.public_books_read,
              totalBooks: profile.public_total_books,
              booksRated: profile.public_books_rated,
              avgRating: profile.public_avg_rating,
              quotesSaved: profile.public_quotes_saved,
              shelvesCount: profile.public_shelves_count
            })}

            <!-- Favorite Genres (Compact) -->
            ${profile.favorite_genres && profile.favorite_genres.length > 0 ? `
              <div class="profile-section profile-section-compact">
                <h3 class="section-heading-compact">Favorite Genres</h3>
                <div class="profile-genres">
                  ${Alcove.genrePicker ? Alcove.genrePicker.renderDisplay(profile.favorite_genres) : ''}
                </div>
              </div>
            ` : ''}

          </div>

          <!-- Right Column -->
          <div class="user-profile-column-right">

            <!-- Currently Reading (Compact) -->
            ${profile.currently_reading && profile.currently_reading.length > 0 ? `
              <div class="profile-section profile-section-compact">
                <h3 class="section-heading-compact">Currently Reading</h3>
                <div class="currently-reading-compact">
                  ${profile.currently_reading.slice(0, 3).map(book => `
                    <div class="reading-item-compact">
                      ${book.thumbnail
                        ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}" class="reading-cover-compact">`
                        : '<div class="reading-placeholder-compact"></div>'}
                      <div class="reading-info-compact">
                        <div class="reading-title-compact">${Alcove.sanitize(book.title)}</div>
                        <div class="reading-progress-compact">
                          <div class="reading-progress-bar-compact" style="width: ${book.percentage || 0}%"></div>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Top Books (Compact) -->
            ${topBooks.length > 0 ? `
              <div class="profile-section profile-section-compact">
                <h3 class="section-heading-compact">Top Books</h3>
                <div class="top-books-compact">
                  ${topBooks.map((book, index) => `
                    <a href="#/book/${book.id}" class="top-book-compact">
                      <span class="top-book-rank-compact">#${index + 1}</span>
                      ${book.thumbnail
                        ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}" class="top-book-cover-compact">`
                        : '<div class="top-book-placeholder-compact"></div>'}
                      <div class="top-book-info-compact">
                        <div class="top-book-title-compact">${Alcove.sanitize(book.title)}</div>
                        <div class="top-book-author-compact">${Alcove.sanitize((book.authors || []).join(', '))}</div>
                      </div>
                    </a>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Awards & Badges (Compact) -->
            ${renderBadgesSection(profile.earned_badges || [])}

          </div>
        </div>
      </div>
    `;

    return {
      html,
      init() {
        // Handle friend action buttons
        const actionBtn = document.querySelector('[data-action]');
        if (!actionBtn) return;

        actionBtn.addEventListener('click', async () => {
          const action = actionBtn.dataset.action;
          const friendshipId = actionBtn.dataset.friendshipId;
          const targetUserId = actionBtn.dataset.userId;

          actionBtn.disabled = true;
          const originalText = actionBtn.textContent;

          try {
            let result;
            switch (action) {
              case 'add':
                result = await Alcove.friends.sendFriendRequest(targetUserId);
                if (result.success) {
                  Alcove.toast.show('Friend request sent', 'success');
                  Alcove.router.handleRoute(); // Refresh page
                } else {
                  Alcove.toast.show(result.error || 'Failed to send request', 'error');
                }
                break;

              case 'cancel':
                result = await Alcove.friends.cancelFriendRequest(friendshipId);
                if (result.success) {
                  Alcove.toast.show('Request canceled', 'success');
                  Alcove.router.handleRoute();
                } else {
                  Alcove.toast.show(result.error || 'Failed to cancel request', 'error');
                }
                break;

              case 'accept':
                result = await Alcove.friends.acceptFriendRequest(friendshipId);
                if (result.success) {
                  Alcove.toast.show('Friend request accepted', 'success');
                  Alcove.router.handleRoute();
                } else {
                  Alcove.toast.show(result.error || 'Failed to accept request', 'error');
                }
                break;

              case 'unfriend':
                if (confirm('Are you sure you want to remove this friend?')) {
                  result = await Alcove.friends.removeFriend(friendshipId);
                  if (result.success) {
                    Alcove.toast.show('Friend removed', 'success');
                    Alcove.router.handleRoute();
                  } else {
                    Alcove.toast.show(result.error || 'Failed to remove friend', 'error');
                  }
                }
                break;
            }
          } catch (err) {
            console.error('Friend action error:', err);
            Alcove.toast.show('An error occurred', 'error');
          } finally {
            actionBtn.disabled = false;
            actionBtn.textContent = originalText;
          }
        });
      }
    };
  }

  // Register page
  Alcove.pages.userProfile = render;
})();
