window.Alcove = window.Alcove || {};

(function() {
  function renderCompact(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="search-compact">
        <svg class="search-compact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" class="search-compact-input" placeholder="Search books..." aria-label="Search books" id="nav-search-input">
      </div>
    `;

    const input = document.getElementById('nav-search-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        Alcove.router.navigate('/search?q=' + encodeURIComponent(input.value.trim()));
        input.blur();
      }
    });
  }

  function renderFull(containerId, initialQuery = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="search-full">
        <div class="search-full-wrapper">
          <svg class="search-full-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" class="search-full-input input input-lg" placeholder="Search by title, author, or ISBN..." aria-label="Search books" id="search-main-input" value="${Alcove.sanitize(initialQuery)}">
          ${initialQuery ? '<button class="search-clear-btn" id="search-clear-btn" aria-label="Clear search">&times;</button>' : ''}
        </div>
      </div>
    `;

    const input = document.getElementById('search-main-input');
    const debouncedSearch = Alcove.debounce((q) => {
      if (q) {
        Alcove.router.navigate('/search?q=' + encodeURIComponent(q));
      }
    }, 600);

    input.addEventListener('input', () => {
      debouncedSearch(input.value.trim());
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        Alcove.router.navigate('/search?q=' + encodeURIComponent(input.value.trim()));
      }
    });

    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        input.focus();
        Alcove.router.navigate('/search');
      });
    }

    if (initialQuery) {
      input.focus();
    }
  }

  Alcove.searchBar = { renderCompact, renderFull };
})();
