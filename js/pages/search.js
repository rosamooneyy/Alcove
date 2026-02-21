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

          <!-- Based on your Reader DNA -->
          <div class="home-section" id="browse-dna" style="margin-top: var(--space-2xl);">
            <div class="section-header">
              <h2 class="section-title">Based on Your Reader DNA</h2>
            </div>
            <div id="browse-dna-content">
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
      loadDNARecommendations();
      loadBookTokTrending();
    }
  }

  async function loadRecommendations(genres) {
    const container = document.getElementById('browse-rec-content');
    if (!container) return;

    try {
      // Gather authors from user's read and to-read shelves
      const readBooks = Alcove.store.getShelfBooks('read');
      const toReadBooks = Alcove.store.getShelfBooks('to-read');
      const shelfBooks = [...readBooks, ...toReadBooks];
      const authors = [];
      const seenAuthors = new Set();
      for (const book of shelfBooks) {
        if (book.authors) {
          for (const author of book.authors) {
            const key = author.toLowerCase();
            if (!seenAuthors.has(key)) {
              seenAuthors.add(key);
              authors.push(author);
            }
          }
        }
      }

      // Fetch recommendations from multiple sources in parallel
      const promises = [];

      // Genre-based recommendations (pick up to 2 random genres)
      if (genres.length > 0) {
        const shuffled = [...genres].sort(() => Math.random() - 0.5);
        const genresToFetch = shuffled.slice(0, Math.min(2, shuffled.length));
        for (const genre of genresToFetch) {
          promises.push(Alcove.api.browseByGenre(genre, 0, 8));
        }
      }

      // Author-based recommendations (pick up to 2 random authors from shelves)
      if (authors.length > 0) {
        const shuffledAuthors = [...authors].sort(() => Math.random() - 0.5);
        const authorsToFetch = shuffledAuthors.slice(0, Math.min(2, shuffledAuthors.length));
        for (const author of authorsToFetch) {
          promises.push(Alcove.api.searchByAuthor(author, 0, 8));
        }
      }

      // Fallback: general recommendations if no genres or authors
      if (promises.length === 0) {
        promises.push(Alcove.api.getRecommendations([], 12));
      }

      const results = await Promise.all(promises);

      // Merge and deduplicate books
      const seenIds = new Set();
      // Exclude books already on user's shelves
      for (const book of shelfBooks) {
        seenIds.add(book.id);
      }

      const allRecs = [];
      for (const result of results) {
        for (const book of result.books) {
          if (!seenIds.has(book.id)) {
            seenIds.add(book.id);
            allRecs.push(book);
          }
        }
      }

      // Shuffle and limit
      const shuffledRecs = allRecs.sort(() => Math.random() - 0.5).slice(0, 14);

      if (shuffledRecs.length > 0) {
        container.innerHTML = `
          <div class="scroll-row">
            ${shuffledRecs.map(book => Alcove.bookCard.render(book)).join('')}
          </div>
        `;
      } else {
        container.innerHTML = `<p style="color: var(--color-stone);">No recommendations available right now.</p>`;
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      container.innerHTML = `<p style="color: var(--color-stone);">Could not load recommendations.</p>`;
    }
  }

  // Map DNA types to search queries that match their reading profile
  const DNA_SEARCH_MAP = {
    'heart-reader': ['romance bestseller', 'literary fiction emotional', 'contemporary romance', 'women fiction drama'],
    'escapist-explorer': ['fantasy adventure', 'science fiction epic', 'urban fantasy', 'dystopian fiction'],
    'strategic-thinker': ['nonfiction bestseller', 'business strategy', 'popular science', 'philosophy modern'],
    'genre-nomad': ['award winning fiction', 'literary fiction diverse', 'book club picks', 'critically acclaimed novel'],
    'depth-seeker': ['literary classics', 'philosophical fiction', 'prize winning novel', 'literary masterpiece'],
    'curator': ['bestseller fiction', 'popular novel award', 'book club favorite', 'must read fiction'],
  };

  async function loadDNARecommendations() {
    const container = document.getElementById('browse-dna-content');
    if (!container) return;

    try {
      const dna = Alcove.store.getReaderDNA();
      if (!dna || dna.locked) {
        container.innerHTML = `<p style="color: var(--color-stone);">Add 3 books to unlock DNA-based recommendations.</p>`;
        return;
      }

      const queries = DNA_SEARCH_MAP[dna.id] || DNA_SEARCH_MAP['curator'];
      const query = queries[Math.floor(Math.random() * queries.length)];

      const result = await Alcove.api.searchBooks(query, 0, 12, {
        sortByPopularity: true,
        requireCover: true,
        minYear: new Date().getFullYear() - 20,
      });

      // Filter out books already on shelves
      const readBooks = Alcove.store.getShelfBooks('read');
      const toReadBooks = Alcove.store.getShelfBooks('to-read');
      const currentBooks = Alcove.store.getShelfBooks('currently-reading');
      const shelfIds = new Set([...readBooks, ...toReadBooks, ...currentBooks].map(b => b.id));
      const filtered = result.books.filter(b => !shelfIds.has(b.id));

      if (filtered.length > 0) {
        container.innerHTML = `
          <div class="scroll-row">
            ${filtered.map(book => Alcove.bookCard.render(book)).join('')}
          </div>
        `;
      } else {
        container.innerHTML = `<p style="color: var(--color-stone);">No DNA-based recommendations available right now.</p>`;
      }
    } catch (err) {
      console.error('Failed to load DNA recommendations:', err);
      container.innerHTML = `<p style="color: var(--color-stone);">Could not load recommendations.</p>`;
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
              ${Alcove.mascot ? Alcove.mascot.render(60) : ''}
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
            ${Alcove.mascot ? Alcove.mascot.render(60) : ''}
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
