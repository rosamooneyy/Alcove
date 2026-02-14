window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  // Reader DNA badge SVG icons
  const DNA_ICONS = {
    compass: `<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2" opacity="0.3"/><circle cx="24" cy="24" r="14" stroke="currentColor" stroke-width="1.5" opacity="0.15"/><polygon points="24,8 28,20 24,16 20,20" fill="currentColor"/><polygon points="24,40 20,28 24,32 28,28" fill="currentColor" opacity="0.5"/><polygon points="8,24 20,20 16,24 20,28" fill="currentColor" opacity="0.3"/><polygon points="40,24 28,28 32,24 28,20" fill="currentColor" opacity="0.3"/><circle cx="24" cy="24" r="3" fill="currentColor"/></svg>`,
    portal: `<svg viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="24" rx="16" ry="20" stroke="currentColor" stroke-width="2" opacity="0.3"/><ellipse cx="24" cy="24" rx="10" ry="14" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><ellipse cx="24" cy="24" rx="4" ry="7" fill="currentColor" opacity="0.3"/><circle cx="20" cy="16" r="1.5" fill="currentColor" opacity="0.7"/><circle cx="28" cy="18" r="1" fill="currentColor" opacity="0.5"/><circle cx="18" cy="28" r="1" fill="currentColor" opacity="0.4"/><circle cx="30" cy="30" r="1.5" fill="currentColor" opacity="0.6"/></svg>`,
    map: `<svg viewBox="0 0 48 48" fill="none"><path d="M8 12L18 8L30 14L40 10V36L30 40L18 34L8 38Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.1"/><line x1="18" y1="8" x2="18" y2="34" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><line x1="30" y1="14" x2="30" y2="40" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><circle cx="22" cy="20" r="3" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.3"/><path d="M22 17V13" stroke="currentColor" stroke-width="1.5"/><circle cx="34" cy="26" r="2" fill="currentColor" opacity="0.5"/></svg>`,
    anchor: `<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="14" r="5" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="14" r="2" fill="currentColor" opacity="0.5"/><line x1="24" y1="19" x2="24" y2="40" stroke="currentColor" stroke-width="2"/><line x1="16" y1="28" x2="32" y2="28" stroke="currentColor" stroke-width="2"/><path d="M10 34C10 28 17 24 24 24C31 24 38 28 38 34" stroke="currentColor" stroke-width="1.5" opacity="0.3"/></svg>`,
    heart: `<svg viewBox="0 0 48 48" fill="none"><path d="M24 40C24 40 8 30 8 18C8 12 12 8 17 8C20 8 22 10 24 13C26 10 28 8 31 8C36 8 40 12 40 18C40 30 24 40 24 40Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.15"/><path d="M16 18C16 15 18 13 20 13" stroke="currentColor" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/></svg>`,
    gem: `<svg viewBox="0 0 48 48" fill="none"><polygon points="24,6 38,18 24,42 10,18" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.1"/><polyline points="10,18 24,24 38,18" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="24" y1="6" x2="24" y2="24" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><line x1="24" y1="24" x2="24" y2="42" stroke="currentColor" stroke-width="1.5" opacity="0.2"/></svg>`,
  };

  function renderReaderDNA(dna) {
    if (!dna) {
      return `
        <div class="profile-section">
          <h2>Reader DNA</h2>
          <div class="reader-dna-locked">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" opacity="0.4">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <p>Add at least 3 books to your shelves to unlock your Reader DNA.</p>
          </div>
        </div>
      `;
    }

    const icon = DNA_ICONS[dna.icon] || DNA_ICONS.compass;
    const g = dna.gradient;
    const m = dna.metrics;

    return `
      <div class="profile-section">
        <h2>Reader DNA</h2>
        <div class="reader-dna-card" style="--dna-g1:${g[0]};--dna-g2:${g[1]};--dna-g3:${g[2]};--dna-accent:${dna.accent}">
          <div class="reader-dna-top">
            <div class="reader-dna-badge">
              <div class="reader-dna-badge-glow"></div>
              <div class="reader-dna-badge-icon">${icon}</div>
            </div>
            <div class="reader-dna-info">
              <span class="reader-dna-label">Your Reader Type</span>
              <h3 class="reader-dna-title">${dna.title}</h3>
              <p class="reader-dna-subtitle">${dna.subtitle}</p>
            </div>
          </div>
          <p class="reader-dna-description">${dna.description}</p>
          <div class="reader-dna-metrics">
            <div class="reader-dna-metric">
              <div class="reader-dna-metric-bar"><div class="reader-dna-metric-fill" style="width:${m.completionRate}%"></div></div>
              <span class="reader-dna-metric-label">Completion</span>
              <span class="reader-dna-metric-value">${m.completionRate}%</span>
            </div>
            <div class="reader-dna-metric">
              <div class="reader-dna-metric-bar"><div class="reader-dna-metric-fill" style="width:${m.genreDiversity}%"></div></div>
              <span class="reader-dna-metric-label">Diversity</span>
              <span class="reader-dna-metric-value">${m.genreDiversity}%</span>
            </div>
            <div class="reader-dna-metric">
              <div class="reader-dna-metric-bar"><div class="reader-dna-metric-fill" style="width:${m.emotionalIntensity}%"></div></div>
              <span class="reader-dna-metric-label">Emotion</span>
              <span class="reader-dna-metric-value">${m.emotionalIntensity}%</span>
            </div>
            <div class="reader-dna-metric">
              <div class="reader-dna-metric-bar"><div class="reader-dna-metric-fill" style="width:${100 - m.nonficRatio}%"></div></div>
              <span class="reader-dna-metric-label">Fiction</span>
              <span class="reader-dna-metric-value">${100 - m.nonficRatio}%</span>
            </div>
            <div class="reader-dna-metric">
              <div class="reader-dna-metric-bar"><div class="reader-dna-metric-fill" style="width:${m.engagementScore}%"></div></div>
              <span class="reader-dna-metric-label">Engagement</span>
              <span class="reader-dna-metric-value">${m.engagementScore}%</span>
            </div>
          </div>
          <div class="reader-dna-footer">Based on ${m.booksAnalyzed} books analyzed</div>
        </div>
      </div>
    `;
  }

  async function render() {
    const user = Alcove.store.get('user');
    const stats = Alcove.store.getStats();
    const genres = user.favoriteGenres || [];
    const topBooks = Alcove.store.getTopBooks();
    const earnedBadges = Alcove.store.getEarnedBadges();
    const nextBadges = Alcove.store.getNextBadges();
    const readerDNA = Alcove.store.getReaderDNA();

    const html = `
      <div class="profile-page animate-in">
        <div class="profile-header">
          <div class="profile-avatar">
            ${user.name.charAt(0).toUpperCase()}
          </div>
          <div class="profile-info">
            <h1 class="profile-name">${Alcove.sanitize(user.name)}</h1>
            <p class="profile-joined">Member since ${Alcove.dateTime.formatDate(user.createdAt)}</p>
          </div>
          <a href="#/settings" class="btn btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            Edit Profile
          </a>
        </div>

        <!-- Reader DNA -->
        ${renderReaderDNA(readerDNA)}

        <div class="profile-section profile-section-centered">
          <div class="profile-section-header">
            <h2>My Top Books</h2>
            <button class="btn btn-secondary btn-sm" id="edit-top-books-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          </div>
          <div class="profile-top-books">
            ${Alcove.topBooksPicker ? Alcove.topBooksPicker.renderDisplay(topBooks) : ''}
          </div>
        </div>

        <!-- Badges Section -->
        ${renderBadgesSection(earnedBadges, nextBadges)}

        <div class="profile-stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.booksRead}</div>
            <div class="stat-label">Books Read</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.totalBooks}</div>
            <div class="stat-label">Total in Library</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.totalRated}</div>
            <div class="stat-label">Books Rated</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}</div>
            <div class="stat-label">Average Rating</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.totalQuotes}</div>
            <div class="stat-label">Quotes Saved</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.totalShelves}</div>
            <div class="stat-label">Shelves</div>
          </div>
        </div>

        <div class="profile-section">
          <h2>Favorite Genres</h2>
          <div class="profile-genres">
            ${Alcove.genrePicker ? Alcove.genrePicker.renderDisplay(genres) : ''}
          </div>
        </div>

        ${renderRecentActivity()}
      </div>
    `;

    return {
      html,
      init: () => {
        // Bind edit top books button
        const editBtn = document.getElementById('edit-top-books-btn');
        if (editBtn) {
          editBtn.addEventListener('click', () => {
            Alcove.topBooksPicker.openPicker(() => {
              // Refresh the profile page after saving
              Alcove.router.navigate('/profile');
            });
          });
        }
      }
    };
  }

  // SVG icons for badges
  const BADGE_ICONS = {
    flame: '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2c.5 0 1.5 2 2.5 4 .5 1 1.5 2 3 2.5 1 .3 2.5.5 3 1.5.3.7 0 2-.5 3-.5 1-1 2.5-1 4s.5 3 0 4-.5 1-1.5 1.5c-1 .5-2 0-3.5-.5s-3-1-4-1-2.5.5-4 1-2.5 1-3.5.5S2 21 1.5 20 2 17 2 15s-.5-3-1-4-.8-2.3-.5-3c.5-1 2-1.2 3-1.5 1.5-.5 2.5-1.5 3-2.5C8.5 2 9.5 0 10 0"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 22V8a2 2 0 012-2v0a2 2 0 012 2v14"/><path d="M8 6h8v4a4 4 0 01-8 0V6z"/></svg>',
    crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
    books: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>',
    library: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M4 4h16v16H4z"/><path d="M9 4v16"/><path d="M14 4v16"/></svg>',
    quote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>',
  };

  function getBadgeIcon(iconName) {
    return BADGE_ICONS[iconName] || BADGE_ICONS.award;
  }

  function renderBadgesSection(earnedBadges, nextBadges) {
    if (earnedBadges.length === 0 && nextBadges.length === 0) {
      return `
        <div class="profile-section">
          <h2>Awards</h2>
          <div class="badges-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
            <p>Start reading to earn your first award</p>
            <p class="badges-empty-hint">Complete reading streaks and milestones to collect awards.</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="profile-section">
        <h2>Awards</h2>
        ${earnedBadges.length > 0 ? `
          <div class="badges-earned">
            <div class="badges-grid">
              ${earnedBadges.map(badge => `
                <div class="badge-item badge-tier-${badge.tier}" title="${badge.description}">
                  <span class="badge-icon">${getBadgeIcon(badge.icon)}</span>
                  <span class="badge-name">${badge.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        ${nextBadges.length > 0 ? `
          <div class="badges-next">
            <h4>Up Next</h4>
            <div class="badges-next-list">
              ${nextBadges.map(badge => {
                const progress = Math.min(100, Math.round((badge.progress / badge.target) * 100));
                return `
                  <div class="badge-next-item">
                    <div class="badge-next-icon badge-tier-${badge.tier}">${getBadgeIcon(badge.icon)}</div>
                    <div class="badge-next-info">
                      <span class="badge-next-name">${badge.name}</span>
                      <div class="badge-next-progress">
                        <div class="badge-next-bar">
                          <div class="badge-next-bar-fill" style="width: ${progress}%;"></div>
                        </div>
                        <span class="badge-next-count">${badge.progress} / ${badge.target}</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderRecentActivity() {
    const activity = Alcove.store.getActivity();
    if (activity.length === 0) return '';

    const items = activity.slice(0, 10).map(a => {
      const book = Alcove.store.getCachedBook(a.bookId);
      const bookTitle = book ? book.title : 'a book';
      const time = Alcove.dateTime.timeAgo(a.at);

      switch (a.type) {
        case 'shelved':
          const shelfData = Alcove.store.getAllShelves()[a.shelf];
          const shelfName = shelfData ? shelfData.label : a.shelf;
          return `<div class="activity-item">
            <span class="activity-icon activity-icon-shelf">&#128218;</span>
            <span>Added <a href="#/book/${a.bookId}">${Alcove.sanitize(bookTitle)}</a> to <strong>${Alcove.sanitize(shelfName)}</strong></span>
            <span class="activity-time">${time}</span>
          </div>`;
        case 'rated':
          return `<div class="activity-item">
            <span class="activity-icon activity-icon-star">&#11088;</span>
            <span>Rated <a href="#/book/${a.bookId}">${Alcove.sanitize(bookTitle)}</a> ${a.rating} stars</span>
            <span class="activity-time">${time}</span>
          </div>`;
        case 'quoted':
          return `<div class="activity-item">
            <span class="activity-icon activity-icon-quote">&#10077;</span>
            <span>Saved a quote from <a href="#/book/${a.bookId}">${Alcove.sanitize(bookTitle)}</a></span>
            <span class="activity-time">${time}</span>
          </div>`;
        default:
          return '';
      }
    }).join('');

    return `
      <div class="profile-section">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          ${items}
        </div>
      </div>
    `;
  }

  Alcove.pages.profile = render;
})();
