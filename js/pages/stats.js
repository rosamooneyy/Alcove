window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  async function render() {
    const stats = Alcove.store.getStats();
    const readingSpeed = Alcove.store.getReadingSpeed();
    const allRatings = Alcove.store.getAllRatings();
    const allProgress = Alcove.store.getAllProgress();
    const currentlyReading = Alcove.store.getShelfBooks('currently-reading');

    // Calculate rating distribution
    const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    Object.values(allRatings).forEach(r => {
      const rounded = Math.round(r.rating);
      if (ratingDist[rounded] !== undefined) ratingDist[rounded]++;
    });
    const maxRatingCount = Math.max(...Object.values(ratingDist), 1);

    // Calculate books completed per month (last 12 months)
    const monthlyStats = getMonthlyCompletions(allProgress);

    const html = `
      <div class="stats-page animate-in">
        <div class="page-header">
          <h1 class="page-title">Reading Statistics</h1>
          <p class="page-subtitle">Your reading journey at a glance</p>
        </div>

        <!-- Main Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card-lg">
            <div class="stat-icon" style="background: var(--stat-icon-books);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
              </svg>
            </div>
            <div class="stat-card-content">
              <div class="stat-value-lg">${stats.booksRead}</div>
              <div class="stat-label-lg">Books Read</div>
            </div>
          </div>

          <div class="stat-card-lg">
            <div class="stat-icon" style="background: var(--stat-icon-rating);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div class="stat-card-content">
              <div class="stat-value-lg">${stats.avgRating > 0 ? stats.avgRating.toFixed(2) : '—'}</div>
              <div class="stat-label-lg">Average Rating</div>
            </div>
          </div>

          <div class="stat-card-lg">
            <div class="stat-icon" style="background: var(--stat-icon-quotes);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
              </svg>
            </div>
            <div class="stat-card-content">
              <div class="stat-value-lg">${stats.totalQuotes}</div>
              <div class="stat-label-lg">Quotes Saved</div>
            </div>
          </div>

          <div class="stat-card-lg">
            <div class="stat-icon" style="background: var(--stat-icon-reviews);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div class="stat-card-content">
              <div class="stat-value-lg">${stats.totalReviews}</div>
              <div class="stat-label-lg">Reviews Written</div>
            </div>
          </div>
        </div>

        <!-- Reading Speed Section -->
        ${readingSpeed ? `
          <div class="stats-section card">
            <h3>Reading Speed</h3>
            <p class="stats-section-subtitle">Based on your completed books with tracked progress</p>
            <div class="reading-speed-grid">
              <div class="speed-stat">
                <div class="speed-value">${readingSpeed.avgDaysPerBook}</div>
                <div class="speed-label">Avg days per book</div>
              </div>
              <div class="speed-stat">
                <div class="speed-value">${readingSpeed.avgPagesPerDay}</div>
                <div class="speed-label">Avg pages per day</div>
              </div>
              <div class="speed-stat">
                <div class="speed-value">${readingSpeed.totalPagesRead.toLocaleString()}</div>
                <div class="speed-label">Total pages read</div>
              </div>
              <div class="speed-stat">
                <div class="speed-value">${readingSpeed.booksCompleted}</div>
                <div class="speed-label">Books with progress data</div>
              </div>
            </div>
            ${readingSpeed.fastestBook && readingSpeed.booksCompleted > 1 ? `
              <div class="speed-records">
                <div class="speed-record">
                  <span class="speed-record-label">Fastest read:</span>
                  <span class="speed-record-value">${readingSpeed.fastestBook.daysToComplete} days</span>
                </div>
                <div class="speed-record">
                  <span class="speed-record-label">Longest read:</span>
                  <span class="speed-record-value">${readingSpeed.slowestBook.daysToComplete} days</span>
                </div>
              </div>
            ` : ''}
          </div>
        ` : `
          <div class="stats-section card">
            <h3>Reading Speed</h3>
            <div class="stats-empty">
              <p>Start tracking your reading progress to see your reading speed statistics!</p>
              <p style="font-size: 0.85rem; color: var(--color-stone);">Update your progress on book detail pages to get started.</p>
            </div>
          </div>
        `}

        <!-- Rating Distribution -->
        <div class="stats-section card">
          <h3>Rating Distribution</h3>
          <p class="stats-section-subtitle">${stats.totalRated} books rated</p>
          <div class="rating-distribution">
            ${[5, 4, 3, 2, 1].map(stars => `
              <div class="rating-dist-row">
                <div class="rating-dist-stars">${stars} <span style="color: var(--color-gold);">&#9733;</span></div>
                <div class="rating-dist-bar">
                  <div class="rating-dist-fill" style="width: ${(ratingDist[stars] / maxRatingCount) * 100}%;"></div>
                </div>
                <div class="rating-dist-count">${ratingDist[stars]}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Monthly Reading -->
        <div class="stats-section card">
          <h3>Books Completed by Month</h3>
          <p class="stats-section-subtitle">Last 12 months</p>
          <div class="monthly-chart">
            ${monthlyStats.map(m => `
              <div class="monthly-bar-container">
                <div class="monthly-bar" style="height: ${m.count > 0 ? Math.max(20, (m.count / Math.max(...monthlyStats.map(x => x.count), 1)) * 100) : 0}%;">
                  ${m.count > 0 ? `<span class="monthly-count">${m.count}</span>` : ''}
                </div>
                <div class="monthly-label">${m.label}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Currently Reading Progress -->
        ${currentlyReading.length > 0 ? `
          <div class="stats-section card">
            <h3>Currently Reading</h3>
            <p class="stats-section-subtitle">${currentlyReading.length} book${currentlyReading.length > 1 ? 's' : ''} in progress</p>
            <div class="current-reading-stats">
              ${currentlyReading.map(book => {
                const progress = Alcove.store.getProgress(book.id);
                const pct = progress?.percentage || 0;
                return `
                  <div class="current-book-stat">
                    <a href="#/book/${book.id}" class="current-book-title">${Alcove.sanitize(book.title)}</a>
                    <div class="current-book-bar">
                      <div class="current-book-fill" style="width: ${pct}%;"></div>
                    </div>
                    <span class="current-book-pct">${pct}%</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Library Overview -->
        <div class="stats-section card">
          <h3>Library Overview</h3>
          <div class="library-stats">
            <div class="library-stat-row">
              <span class="library-stat-label">Total books in library</span>
              <span class="library-stat-value">${stats.totalBooks}</span>
            </div>
            <div class="library-stat-row">
              <span class="library-stat-label">Custom shelves created</span>
              <span class="library-stat-value">${stats.totalShelves - 3}</span>
            </div>
            <div class="library-stat-row">
              <span class="library-stat-label">Books currently reading</span>
              <span class="library-stat-value">${currentlyReading.length}</span>
            </div>
            <div class="library-stat-row">
              <span class="library-stat-label">Books on To Read list</span>
              <span class="library-stat-value">${Alcove.store.getShelfBooks('to-read').length}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    return { html };
  }

  function getMonthlyCompletions(allProgress) {
    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();

      let count = 0;
      Object.values(allProgress).forEach(p => {
        if (p.completedAt) {
          const completed = new Date(p.completedAt);
          if (completed.getFullYear() === year && completed.getMonth() === month) {
            count++;
          }
        }
      });

      months.push({ label, count, year, month });
    }

    return months;
  }

  Alcove.pages.stats = render;
})();
