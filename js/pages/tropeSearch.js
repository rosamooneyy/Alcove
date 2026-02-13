window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  async function render(params) {
    // Get trope from URL if present
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const initialTrope = urlParams.get('trope');

    let selectedTropes = initialTrope ? [initialTrope] : [];
    let selectedGenre = '';
    let matchMode = 'any'; // 'any' or 'all'
    let results = [];

    const html = `
      <div class="trope-search-page animate-in">
        <div class="page-header">
          <h1 class="page-title">Search by Tropes</h1>
          <p class="page-subtitle">Find books that match specific tropes and themes</p>
        </div>

        <div class="trope-search-layout">
          <aside class="trope-search-sidebar card">
            <div class="trope-filter-section">
              <h3>Selected Tropes</h3>
              <div id="selected-tropes-display" class="selected-tropes-list">
                ${renderSelectedTropes(selectedTropes)}
              </div>
              <button class="btn btn-secondary btn-sm" id="add-trope-filter-btn" style="margin-top: var(--space-sm);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Trope
              </button>
            </div>

            <div class="trope-filter-section">
              <h3>Match Mode</h3>
              <div class="match-mode-options">
                <label class="radio-label">
                  <input type="radio" name="matchMode" value="any" ${matchMode === 'any' ? 'checked' : ''}>
                  <span>Match <strong>any</strong> trope</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="matchMode" value="all" ${matchMode === 'all' ? 'checked' : ''}>
                  <span>Match <strong>all</strong> tropes</span>
                </label>
              </div>
            </div>

            <div class="trope-filter-section">
              <h3>Filter by Genre</h3>
              <select class="input" id="genre-filter">
                <option value="">All Genres</option>
                ${Alcove.store.get('user.favoriteGenres')?.map(g =>
                  `<option value="${g}">${g}</option>`
                ).join('') || ''}
                <option value="Fiction">Fiction</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Romance">Romance</option>
                <option value="Mystery">Mystery</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Thriller">Thriller</option>
                <option value="Young Adult">Young Adult</option>
                <option value="Historical Fiction">Historical Fiction</option>
              </select>
            </div>

            <div class="trope-filter-section">
              <button class="btn btn-primary" id="search-tropes-btn" style="width: 100%;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                Search
              </button>
              <button class="btn btn-ghost btn-sm" id="clear-filters-btn" style="width: 100%; margin-top: var(--space-xs);">
                Clear All
              </button>
            </div>

            <div class="trope-filter-section">
              <h3>Saved Collections</h3>
              <div id="saved-collections-list">
                ${renderSavedCollections()}
              </div>
              <button class="btn btn-secondary btn-sm" id="save-collection-btn" style="width: 100%; margin-top: var(--space-sm);" ${selectedTropes.length === 0 ? 'disabled' : ''}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                Save Collection
              </button>
            </div>
          </aside>

          <main class="trope-search-results">
            <div class="results-header">
              <span id="results-count">Select tropes to search</span>
            </div>
            <div id="trope-results-grid" class="trope-results-grid">
              ${renderInitialState()}
            </div>
          </main>
        </div>
      </div>
    `;

    function renderSelectedTropes(tropes) {
      if (tropes.length === 0) {
        return '<p class="trope-filter-hint">No tropes selected</p>';
      }

      return tropes.map(tropeId => {
        const trope = Alcove.tropePicker.getTropeDisplay(tropeId);
        return `
          <span class="trope-badge removable" style="--badge-color: ${trope.categoryColor}">
            ${trope.label}
            <button class="trope-remove-btn" data-trope="${tropeId}">&times;</button>
          </span>
        `;
      }).join('');
    }

    function renderSavedCollections() {
      const collections = Alcove.store.getTropeCollections();
      if (collections.length === 0) {
        return '<p class="trope-filter-hint">No saved collections</p>';
      }

      return collections.map(c => `
        <div class="saved-collection" data-collection="${c.id}">
          <button class="saved-collection-name" data-collection="${c.id}">${Alcove.sanitize(c.name)}</button>
          <span class="saved-collection-count">${c.tropes.length} tropes</span>
          <button class="saved-collection-delete" data-collection="${c.id}" title="Delete">&times;</button>
        </div>
      `).join('');
    }

    function renderInitialState() {
      // Show trending tropes as suggestions
      const stats = Alcove.store.getTropeStats();
      if (stats.trendingTropes.length === 0) {
        return `
          <div class="trope-search-empty">
            <div class="trope-search-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <h3>Search Books by Tropes</h3>
            <p>Select tropes from the sidebar to find matching books from your library.</p>
            <p style="font-size: 0.85rem; margin-top: var(--space-md);">Tag books with tropes on their detail pages to build your searchable library!</p>
          </div>
        `;
      }

      return `
        <div class="trope-suggestions">
          <h3>Popular Tropes in Your Library</h3>
          <div class="trope-suggestion-chips">
            ${stats.trendingTropes.slice(0, 12).map(t => {
              const trope = Alcove.tropePicker.getTropeDisplay(t.id);
              return `
                <button class="trope-suggestion-btn" data-trope="${t.id}" style="--badge-color: ${trope.categoryColor}">
                  ${trope.label}
                  <span class="trope-suggestion-count">${t.count}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    function renderResults(books) {
      if (books.length === 0) {
        return `
          <div class="trope-search-empty">
            <h3>No Books Found</h3>
            <p>No books in your library match the selected tropes.</p>
            <p style="font-size: 0.85rem; margin-top: var(--space-md);">Try selecting fewer tropes or switching to "Match any" mode.</p>
          </div>
        `;
      }

      return books.map(book => {
        const bookTropes = Alcove.store.getBookTropes(book.id);
        const rating = Alcove.store.getRating(book.id);

        return `
          <div class="trope-result-card card">
            <a href="#/book/${book.id}" class="trope-result-cover">
              ${book.thumbnail
                ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}">`
                : '<div class="trope-result-placeholder"></div>'}
            </a>
            <div class="trope-result-info">
              <a href="#/book/${book.id}" class="trope-result-title">${Alcove.sanitize(book.title)}</a>
              <span class="trope-result-author">by ${Alcove.sanitize((book.authors || []).join(', '))}</span>
              ${rating ? `
                <div class="trope-result-rating">
                  ${Alcove.bookCard.renderMiniStars(rating)}
                  <span>${Alcove.bookCard.formatRating(rating)}</span>
                </div>
              ` : ''}
              <div class="trope-result-match">
                <span class="match-badge">${book.matchCount} match${book.matchCount !== 1 ? 'es' : ''}</span>
              </div>
              <div class="trope-result-tropes">
                ${Alcove.tropePicker.renderTropeChips(bookTropes.tropes, bookTropes.customTropes, 4)}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function doSearch() {
      if (selectedTropes.length === 0) {
        const grid = document.getElementById('trope-results-grid');
        const count = document.getElementById('results-count');
        if (grid) grid.innerHTML = renderInitialState();
        if (count) count.textContent = 'Select tropes to search';
        bindSuggestionClicks();
        return;
      }

      // Get results
      results = matchMode === 'all'
        ? Alcove.store.getBooksWithTropes(selectedTropes)
        : Alcove.store.getBooksWithAnyTropes(selectedTropes);

      // Filter by genre if selected
      if (selectedGenre) {
        results = results.filter(book => {
          const categories = book.categories || [];
          return categories.some(c => c.toLowerCase().includes(selectedGenre.toLowerCase()));
        });
      }

      // Update UI
      const grid = document.getElementById('trope-results-grid');
      const count = document.getElementById('results-count');
      if (grid) grid.innerHTML = renderResults(results);
      if (count) count.textContent = `${results.length} book${results.length !== 1 ? 's' : ''} found`;
    }

    function updateSelectedDisplay() {
      const display = document.getElementById('selected-tropes-display');
      if (display) {
        display.innerHTML = renderSelectedTropes(selectedTropes);
        bindRemoveButtons();
      }

      // Enable/disable save button
      const saveBtn = document.getElementById('save-collection-btn');
      if (saveBtn) {
        saveBtn.disabled = selectedTropes.length === 0;
      }
    }

    function bindRemoveButtons() {
      document.querySelectorAll('.trope-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tropeId = btn.dataset.trope;
          selectedTropes = selectedTropes.filter(t => t !== tropeId);
          updateSelectedDisplay();
          doSearch();
        });
      });
    }

    function bindSuggestionClicks() {
      document.querySelectorAll('.trope-suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tropeId = btn.dataset.trope;
          if (!selectedTropes.includes(tropeId)) {
            selectedTropes.push(tropeId);
            updateSelectedDisplay();
            doSearch();
          }
        });
      });
    }

    function bindCollectionClicks() {
      document.querySelectorAll('.saved-collection-name').forEach(btn => {
        btn.addEventListener('click', () => {
          const collectionId = btn.dataset.collection;
          const collections = Alcove.store.getTropeCollections();
          const collection = collections.find(c => c.id === collectionId);
          if (collection) {
            selectedTropes = [...collection.tropes];
            updateSelectedDisplay();
            doSearch();
            Alcove.toast.show(`Loaded "${collection.name}"`, 'info');
          }
        });
      });

      document.querySelectorAll('.saved-collection-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const collectionId = btn.dataset.collection;
          if (confirm('Delete this collection?')) {
            Alcove.store.deleteTropeCollection(collectionId);
            const list = document.getElementById('saved-collections-list');
            if (list) {
              list.innerHTML = renderSavedCollections();
              bindCollectionClicks();
            }
            Alcove.toast.show('Collection deleted', 'info');
          }
        });
      });
    }

    function openTropeSelector() {
      if (!Alcove.modal) return;

      let tempSelected = [...selectedTropes];

      Alcove.modal.open({
        title: 'Select Tropes',
        size: 'large',
        content: `<div id="trope-selector-modal"></div>`,
        actions: [
          { label: 'Cancel', className: 'btn-secondary', action: 'close' },
          { label: 'Apply', className: 'btn-primary', id: 'apply-tropes-btn' },
        ],
        onInit() {
          if (Alcove.tropePicker) {
            Alcove.tropePicker.render('trope-selector-modal', tempSelected, [], (tropes) => {
              tempSelected = tropes;
            });
          }

          document.getElementById('apply-tropes-btn').addEventListener('click', () => {
            selectedTropes = tempSelected;
            Alcove.modal.close();
            updateSelectedDisplay();
            doSearch();
          });
        }
      });
    }

    return {
      html,
      init() {
        // Initial search if trope was in URL
        if (initialTrope) {
          doSearch();
        } else {
          bindSuggestionClicks();
        }

        // Bind remove buttons
        bindRemoveButtons();

        // Bind collection clicks
        bindCollectionClicks();

        // Add trope button
        document.getElementById('add-trope-filter-btn').addEventListener('click', openTropeSelector);

        // Match mode
        document.querySelectorAll('input[name="matchMode"]').forEach(radio => {
          radio.addEventListener('change', (e) => {
            matchMode = e.target.value;
            if (selectedTropes.length > 0) doSearch();
          });
        });

        // Genre filter
        document.getElementById('genre-filter').addEventListener('change', (e) => {
          selectedGenre = e.target.value;
          if (selectedTropes.length > 0) doSearch();
        });

        // Search button
        document.getElementById('search-tropes-btn').addEventListener('click', doSearch);

        // Clear filters
        document.getElementById('clear-filters-btn').addEventListener('click', () => {
          selectedTropes = [];
          selectedGenre = '';
          matchMode = 'any';
          document.getElementById('genre-filter').value = '';
          document.querySelector('input[name="matchMode"][value="any"]').checked = true;
          updateSelectedDisplay();
          const grid = document.getElementById('trope-results-grid');
          const count = document.getElementById('results-count');
          if (grid) grid.innerHTML = renderInitialState();
          if (count) count.textContent = 'Select tropes to search';
          bindSuggestionClicks();
        });

        // Save collection
        document.getElementById('save-collection-btn').addEventListener('click', () => {
          if (selectedTropes.length === 0) return;

          const name = prompt('Enter a name for this collection:');
          if (!name || !name.trim()) return;

          Alcove.store.saveTropeCollection(name.trim(), selectedTropes);
          const list = document.getElementById('saved-collections-list');
          if (list) {
            list.innerHTML = renderSavedCollections();
            bindCollectionClicks();
          }
          Alcove.toast.show(`Saved "${name.trim()}"`, 'success');
        });
      }
    };
  }

  Alcove.pages.tropeSearch = render;
})();
