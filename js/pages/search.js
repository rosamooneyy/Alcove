window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  let currentQuery = '';
  let currentStartIndex = 0;
  let totalItems = 0;
  let allBooks = [];
  let isLoading = false;

  async function render(params, query) {
    currentQuery = query.q || '';
    currentStartIndex = 0;
    totalItems = 0;
    allBooks = [];

    const genres = Alcove.store.get('user.favoriteGenres') || [];
    const suggestedGenres = ['Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Romance',
      'Thriller', 'Biography', 'History', 'Science', 'Philosophy',
      'Poetry', 'Self-Help', 'Horror', 'Classic', 'Adventure'];

    let html = `
      <div class="search-page animate-in">
        <div class="page-header">
          <h1 class="page-title">Browse Books</h1>
          <p class="page-subtitle">Search millions of books or explore by genre</p>
        </div>

        <div id="search-bar-container"></div>

        ${!currentQuery ? `
          <div class="search-genres" style="margin-top: var(--space-xl);">
            <h3 style="margin-bottom: var(--space-md);">Explore by Genre</h3>
            <div class="chip-group">
              ${suggestedGenres.map(g => `
                <button class="chip genre-browse-chip ${genres.includes(g) ? 'selected' : ''}" data-genre="${g}">${g}</button>
              `).join('')}
            </div>
          </div>

          <!-- Recommended for You -->
          <div class="home-section" id="browse-recommendations" style="margin-top: var(--space-2xl);">
            <div class="section-header">
              <h2 class="section-title">Recommended for You</h2>
            </div>
            <div id="browse-rec-content">
              ${Alcove.bookCard.renderSkeletons(6)}
            </div>
          </div>

          <!-- Trending on BookTok -->
          <div class="home-section" id="browse-booktok" style="margin-top: var(--space-2xl);">
            <div class="section-header">
              <h2 class="section-title">Trending on BookTok</h2>
            </div>
            <div id="browse-booktok-content">
              ${Alcove.bookCard.renderSkeletons(6)}
            </div>
          </div>

          ${genres.length > 1 ? `
            <div class="home-section" id="browse-genre-section" style="margin-top: var(--space-2xl);">
              <div class="section-header">
                <h2 class="section-title" id="browse-genre-title">More to Explore</h2>
              </div>
              <div id="browse-genre-content">
                ${Alcove.bookCard.renderSkeletons(6)}
              </div>
            </div>
          ` : ''}
        ` : ''}

        <div id="search-results" style="margin-top: var(--space-xl);">
          ${currentQuery ? Alcove.bookCard.renderSkeletons(8) : ''}
        </div>

        <div id="search-load-more" style="text-align: center; margin-top: var(--space-xl);"></div>
      </div>
    `;

    return {
      html,
      init: () => initSearch(),
    };
  }

  async function initSearch() {
    Alcove.searchBar.renderFull('search-bar-container', currentQuery);

    // Genre chips
    document.querySelectorAll('.genre-browse-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const genre = chip.dataset.genre;
        Alcove.router.navigate('/search?q=' + encodeURIComponent('subject:' + genre));
      });
    });

    if (currentQuery) {
      await performSearch();
    } else {
      const genres = Alcove.store.get('user.favoriteGenres') || [];
      loadRecommendations(genres);
      loadBookTokTrending();
    }
  }

  async function loadRecommendations(genres) {
    try {
      const result = await Alcove.api.getRecommendations(genres, 12);
      const container = document.getElementById('browse-rec-content');
      if (container && result.books.length > 0) {
        container.innerHTML = `
          <div class="scroll-row">
            ${result.books.map(book => Alcove.bookCard.render(book)).join('')}
          </div>
        `;
      } else if (container) {
        container.innerHTML = `<p style="color: var(--color-stone);">No recommendations available right now.</p>`;
      }

      if (genres.length > 1) {
        const secondGenre = genres.filter(g => g !== genres[0])[Math.floor(Math.random() * (genres.length - 1))];
        if (secondGenre) {
          const genreTitle = document.getElementById('browse-genre-title');
          const genreContent = document.getElementById('browse-genre-content');
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
      const container = document.getElementById('browse-rec-content');
      if (container) {
        container.innerHTML = `<p style="color: var(--color-stone);">Could not load recommendations.</p>`;
      }
    }
  }

  async function loadBookTokTrending() {
    const container = document.getElementById('browse-booktok-content');
    if (!container) return;

    try {
      const result = await Alcove.api.getBookTokTrending(8);
      if (result.books.length > 0) {
        container.innerHTML = `
          <div class="scroll-row">
            ${result.books.map(book => Alcove.bookCard.render(book)).join('')}
          </div>
        `;
      } else {
        container.innerHTML = `<p style="color: var(--color-stone);">Could not load trending books.</p>`;
      }
    } catch (err) {
      console.error('Failed to load BookTok trending:', err);
      container.innerHTML = `<p style="color: var(--color-stone);">Could not load trending books.</p>`;
    }
  }

  async function performSearch() {
    if (isLoading) return;
    isLoading = true;

    const resultsContainer = document.getElementById('search-results');
    const loadMoreContainer = document.getElementById('search-load-more');

    if (currentStartIndex === 0 && resultsContainer) {
      resultsContainer.innerHTML = Alcove.bookCard.renderSkeletons(8);
    }

    try {
      // Determine search options based on query type
      const isGenreBrowse = currentQuery.toLowerCase().startsWith('subject:');
      const currentYear = new Date().getFullYear();

      let searchOptions = {};
      if (isGenreBrowse) {
        // Genre browsing: show recent popular books
        searchOptions = {
          sortByPopularity: true,
          sortByNewest: false,
          minYear: currentYear - 20,
          requireCover: true
        };
      } else {
        // Direct search: prioritize relevance but still prefer recent popular books
        searchOptions = {
          sortByPopularity: true,
          sortByNewest: false,
          requireCover: false // Don't filter out books without covers for direct searches
        };
      }

      const result = await Alcove.api.searchBooks(currentQuery, currentStartIndex, 20, searchOptions);
      totalItems = result.totalItems;
      allBooks = currentStartIndex === 0 ? result.books : [...allBooks, ...result.books];

      if (resultsContainer) {
        if (allBooks.length === 0) {
          resultsContainer.innerHTML = `
            <div class="empty-state">
              ${Alcove.mascot ? Alcove.mascot.render(100, 'searching') : ''}
              <h3>No books found</h3>
              <p>Try a different search term or browse by genre.</p>
            </div>
          `;
        } else {
          resultsContainer.innerHTML = `
            <p class="search-result-count" style="color: var(--color-stone); margin-bottom: var(--space-md);">
              Showing ${allBooks.length} of ${totalItems.toLocaleString()} results for "<strong>${Alcove.sanitize(currentQuery)}</strong>"
            </p>
            ${Alcove.bookCard.renderGrid(allBooks)}
          `;
        }
      }

      if (loadMoreContainer) {
        if (allBooks.length < totalItems && allBooks.length > 0) {
          loadMoreContainer.innerHTML = `<button class="btn btn-secondary" id="load-more-btn">Load More</button>`;
          document.getElementById('load-more-btn').addEventListener('click', async () => {
            currentStartIndex += 20;
            document.getElementById('load-more-btn').innerHTML = '<div class="spinner spinner-sm" style="margin: 0 auto;"></div>';
            await performSearch();
          });
        } else {
          loadMoreContainer.innerHTML = '';
        }
      }
    } catch (err) {
      console.error('Search failed:', err);
      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="empty-state">
            ${Alcove.mascot ? Alcove.mascot.render(100, 'sleeping') : ''}
            <h3>Oops, something went wrong</h3>
            <p>Could not reach the book database. Please try using Live Server in VS Code (right-click index.html → Open with Live Server).</p>
            <button class="btn btn-primary" onclick="location.reload()">Retry</button>
          </div>
        `;
      }
    }

    isLoading = false;
  }

  Alcove.pages.search = render;
})();
