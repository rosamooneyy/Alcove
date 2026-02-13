window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  async function render() {
    const user = Alcove.store.get('user');
    const stats = Alcove.store.getStats();
    const currentlyReading = Alcove.store.getShelfBooks('currently-reading');
    const activity = Alcove.store.getActivity();
    const greeting = Alcove.dateTime.getGreeting(user.name);
    const subGreeting = Alcove.dateTime.getSubGreeting();
    const genres = user.favoriteGenres || [];
    const streak = Alcove.store.getReadingStreak();

    const html = `
      <div class="home-page animate-in">
        <!-- Greeting Section -->
        <div class="home-greeting">
          <div class="home-greeting-content">
            <div class="home-greeting-text">
              <h1 class="home-greeting-title">${Alcove.sanitize(greeting)}</h1>
              <p class="home-greeting-sub">${subGreeting}</p>
            </div>
            <div class="home-greeting-mascot">
              ${Alcove.mascot ? Alcove.mascot.render(100, 'waving') : ''}
            </div>
          </div>
        </div>

        <!-- Reading Streak Section -->
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
                <span class="streak-stat-value">${streak.totalReadingDays || 0}</span>
                <span class="streak-stat-label">total days</span>
              </div>
            </div>
            ${!streak.readToday && streak.current > 0 ? `
              <div class="streak-notice streak-notice-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>Read today to keep your streak</span>
              </div>
            ` : streak.readToday ? `
              <div class="streak-notice streak-notice-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>You've read today</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="home-stats">
          <div class="stat-card hover-lift">
            <div class="stat-value">${stats.booksRead}</div>
            <div class="stat-label">Books Read</div>
          </div>
          <div class="stat-card hover-lift">
            <div class="stat-value">${stats.totalQuotes}</div>
            <div class="stat-label">Quotes Saved</div>
          </div>
          <div class="stat-card hover-lift">
            <div class="stat-value">${stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}</div>
            <div class="stat-label">Avg Rating</div>
          </div>
          <div class="stat-card hover-lift">
            <div class="stat-value">${stats.totalShelves}</div>
            <div class="stat-label">Shelves</div>
          </div>
        </div>

        <!-- Daily Poll -->
        <div class="home-section" id="daily-poll-section">
          ${Alcove.dailyPoll ? Alcove.dailyPoll.render() : ''}
        </div>

        <!-- Currently Reading with Progress -->
        ${currentlyReading.length > 0 ? `
          <div class="home-section">
            <div class="section-header">
              <h2 class="section-title">Currently Reading</h2>
              <a href="#/shelf/currently-reading" class="section-link">View all &rarr;</a>
            </div>
            <div class="currently-reading-list">
              ${currentlyReading.map(book => renderProgressCard(book)).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Recent Activity -->
        ${activity.length > 0 ? `
          <div class="home-section">
            <div class="section-header">
              <h2 class="section-title">Recent Activity</h2>
              <a href="#/profile" class="section-link">View all &rarr;</a>
            </div>
            <div class="activity-list">
              ${renderActivity(activity.slice(0, 5))}
            </div>
          </div>
        ` : ''}

        <!-- Genre Recommendations -->
        <div class="home-section" id="home-recommendations">
          <div class="section-header">
            <h2 class="section-title">Recommended for You</h2>
            <a href="#/search" class="section-link">Browse all &rarr;</a>
          </div>
          <div id="home-rec-content">
            ${Alcove.bookCard.renderSkeletons(6)}
          </div>
        </div>

        ${genres.length > 1 ? `
          <div class="home-section" id="home-genre-section">
            <div class="section-header">
              <h2 class="section-title" id="home-genre-title">More to Explore</h2>
              <a href="#/search" class="section-link">Browse &rarr;</a>
            </div>
            <div id="home-genre-content">
              ${Alcove.bookCard.renderSkeletons(6)}
            </div>
          </div>
        ` : ''}

        <!-- Quick Actions -->
        <div class="home-section">
          <h2 class="section-title" style="margin-bottom: var(--space-lg);">Quick Actions</h2>
          <div class="home-actions">
            <a href="#/search" class="home-action-card card hover-lift">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-burgundy)" stroke-width="2" width="32" height="32">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <h4>Browse Books</h4>
              <p>Search millions of titles</p>
            </a>
            <a href="#/shelves" class="home-action-card card hover-lift">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2" width="32" height="32">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
              <h4>My Shelves</h4>
              <p>Manage your library</p>
            </a>
            <a href="#/quotes" class="home-action-card card hover-lift">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-dusty-rose)" stroke-width="2" width="32" height="32">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
              </svg>
              <h4>Quotes</h4>
              <p>Your saved passages</p>
            </a>
          </div>
        </div>
      </div>
    `;

    return {
      html,
      init: () => {
        loadRecommendations(genres);
        if (Alcove.dailyPoll) Alcove.dailyPoll.init();
      },
    };
  }

  async function loadRecommendations(genres) {
    try {
      const result = await Alcove.api.getRecommendations(genres, 12);
      const container = document.getElementById('home-rec-content');
      if (container && result.books.length > 0) {
        container.innerHTML = `
          <div class="scroll-row">
            ${result.books.map(book => Alcove.bookCard.render(book)).join('')}
          </div>
        `;
      } else if (container) {
        container.innerHTML = `<p style="color: var(--color-stone);">No recommendations available right now.</p>`;
      }

      // Load a second genre
      if (genres.length > 1) {
        const secondGenre = genres.filter(g => g !== genres[0])[Math.floor(Math.random() * (genres.length - 1))];
        if (secondGenre) {
          const genreTitle = document.getElementById('home-genre-title');
          const genreContent = document.getElementById('home-genre-content');
          if (genreTitle) genreTitle.textContent = secondGenre;

          const result2 = await Alcove.api.browseByGenre(secondGenre, 0, 12);
          if (genreContent && result2.books.length > 0) {
            genreContent.innerHTML = `
              <div class="scroll-row">
                ${result2.books.map(book => Alcove.bookCard.render(book)).join('')}
              </div>
            `;
          }
        }
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      const container = document.getElementById('home-rec-content');
      if (container) {
        container.innerHTML = `<p style="color: var(--color-stone);">Could not load recommendations. Check your connection.</p>`;
      }
    }
  }

  function renderProgressCard(book) {
    const progress = Alcove.store.getProgress(book.id);
    const percentage = progress?.percentage || 0;
    const currentPage = progress?.currentPage || 0;
    const totalPages = progress?.totalPages || book.pageCount || 0;

    return `
      <div class="progress-card">
        <a href="#/book/${book.id}" class="progress-card-cover">
          ${book.thumbnail
            ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}">`
            : '<div class="progress-card-placeholder"></div>'}
        </a>
        <div class="progress-card-info">
          <a href="#/book/${book.id}" class="progress-card-title">${Alcove.sanitize(book.title)}</a>
          <span class="progress-card-author">by ${Alcove.sanitize((book.authors || []).join(', '))}</span>
          <div class="progress-card-bar">
            <div class="progress-card-bar-fill" style="width: ${percentage}%;"></div>
          </div>
          <span class="progress-card-percent">
            ${percentage}% complete${currentPage > 0 && totalPages > 0 ? ` · Page ${currentPage} of ${totalPages}` : ''}
          </span>
        </div>
      </div>
    `;
  }

  function renderActivity(activities) {
    return activities.map(a => {
      const book = Alcove.store.getCachedBook(a.bookId);
      const bookTitle = book ? book.title : 'a book';
      const time = Alcove.dateTime.timeAgo(a.at);
      let icon, text;

      switch (a.type) {
        case 'shelved':
          const shelf = Alcove.store.getAllShelves()[a.shelf];
          icon = '&#128218;';
          text = `Added <a href="#/book/${a.bookId}"><strong>${Alcove.sanitize(bookTitle)}</strong></a> to ${Alcove.sanitize(shelf ? shelf.label : a.shelf)}`;
          break;
        case 'rated':
          icon = '&#11088;';
          text = `Rated <a href="#/book/${a.bookId}"><strong>${Alcove.sanitize(bookTitle)}</strong></a> ${a.rating} stars`;
          break;
        case 'quoted':
          icon = '&#10077;';
          text = `Saved a quote from <a href="#/book/${a.bookId}"><strong>${Alcove.sanitize(bookTitle)}</strong></a>`;
          break;
        case 'reviewed':
          icon = '&#128221;';
          text = `Reviewed <a href="#/book/${a.bookId}"><strong>${Alcove.sanitize(bookTitle)}</strong></a>`;
          break;
        case 'started':
          icon = '&#128214;';
          text = `Started reading <a href="#/book/${a.bookId}"><strong>${Alcove.sanitize(bookTitle)}</strong></a>`;
          break;
        case 'progress':
          icon = '&#128203;';
          text = `Updated progress on <a href="#/book/${a.bookId}"><strong>${Alcove.sanitize(bookTitle)}</strong></a> to ${a.percentage}%`;
          break;
        case 'finished':
          icon = '&#127942;';
          text = `Finished reading <a href="#/book/${a.bookId}"><strong>${Alcove.sanitize(bookTitle)}</strong></a>`;
          break;
        case 'tagged':
          icon = '&#127991;';
          text = `Tagged <a href="#/book/${a.bookId}"><strong>${Alcove.sanitize(bookTitle)}</strong></a> with ${a.tropeCount} trope${a.tropeCount !== 1 ? 's' : ''}`;
          break;
        default:
          return '';
      }

      return `
        <div class="activity-item">
          <span class="activity-icon">${icon}</span>
          <span class="activity-text">${text}</span>
          <span class="activity-time">${time}</span>
        </div>
      `;
    }).join('');
  }

  Alcove.pages.home = render;
})();
