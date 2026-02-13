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
