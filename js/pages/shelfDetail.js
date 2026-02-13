window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  async function render(params) {
    const shelfKey = params.name;
    const shelves = Alcove.store.getAllShelves();
    const shelf = shelves[shelfKey];

    if (!shelf) {
      return `
        <div class="empty-state">
          <h3>Shelf not found</h3>
          <p>This shelf doesn't exist.</p>
          <a href="#/shelves" class="btn btn-primary">View All Shelves</a>
        </div>
      `;
    }

    const books = Alcove.store.getShelfBooks(shelfKey);
    const sortOptions = ['Date Added', 'Title', 'Author', 'Rating'];

    const html = `
      <div class="shelf-detail-page animate-in">
        <div class="page-header">
          <div>
            <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xs);">
              <a href="#/shelves" class="btn btn-ghost btn-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </a>
              <h1 class="page-title">${Alcove.sanitize(shelf.label)}</h1>
              ${!shelf.builtIn ? '<span class="badge badge-mocha">Custom</span>' : ''}
            </div>
            <p class="page-subtitle">${shelf.bookIds.length} book${shelf.bookIds.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        ${books.length > 0 ? `
          <div class="shelf-detail-controls">
            <div class="shelf-sort">
              <label class="input-label" style="display: inline; margin-right: var(--space-sm);">Sort by:</label>
              <select class="input" id="shelf-sort-select" style="width: auto; display: inline-block;">
                ${sortOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
              </select>
            </div>
            ${!shelf.builtIn ? `
              <button class="btn btn-danger btn-sm" id="delete-shelf-btn">Delete Shelf</button>
            ` : ''}
          </div>

          <div class="shelf-book-list" id="shelf-book-list">
            ${renderBookList(books, shelfKey)}
          </div>
        ` : `
          <div class="empty-state">
            ${Alcove.mascot ? Alcove.mascot.render(100, 'sleeping') : ''}
            <h3>This shelf is empty</h3>
            <p>Browse books and add them to this shelf.</p>
            <a href="#/search" class="btn btn-primary">Browse Books</a>
          </div>
          ${!shelf.builtIn ? `
            <div style="text-align: center; margin-top: var(--space-lg);">
              <button class="btn btn-danger btn-sm" id="delete-shelf-btn">Delete Shelf</button>
            </div>
          ` : ''}
        `}
      </div>
    `;

    return {
      html,
      init() {
        // Sort
        const select = document.getElementById('shelf-sort-select');
        if (select) {
          select.addEventListener('change', () => {
            const sorted = sortBooks(books, select.value);
            const list = document.getElementById('shelf-book-list');
            if (list) {
              list.innerHTML = renderBookList(sorted, shelfKey);
              bindRemoveButtons(shelfKey);
            }
          });
        }

        bindRemoveButtons(shelfKey);

        // Delete shelf
        const deleteBtn = document.getElementById('delete-shelf-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            if (confirm(`Delete the shelf "${shelf.label}"? Books won't be removed from your library.`)) {
              Alcove.store.deleteShelf(shelfKey);
              Alcove.toast.show(`Deleted shelf "${shelf.label}"`, 'info');
              Alcove.router.navigate('/shelves');
            }
          });
        }
      }
    };
  }

  function renderBookList(books, shelfKey) {
    return books.map(book => {
      const rating = Alcove.store.getRating(book.id);
      const authors = (book.authors || ['Unknown']).join(', ');

      return `
        <div class="shelf-book-item" data-book-id="${book.id}">
          <a href="#/book/${book.id}" class="shelf-book-cover">
            ${book.thumbnail
              ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}" loading="lazy">`
              : `<div class="shelf-book-placeholder"></div>`}
          </a>
          <div class="shelf-book-info">
            <a href="#/book/${book.id}" class="shelf-book-title">${Alcove.sanitize(book.title)}</a>
            <p class="shelf-book-author">${Alcove.sanitize(authors)}</p>
            ${rating ? `
              <div class="book-card-rating" style="margin-top: 4px;">
                ${Alcove.bookCard.renderMiniStars(rating)}
                <span class="book-card-rating-value">${Alcove.bookCard.formatRating(rating)}</span>
              </div>
            ` : ''}
          </div>
          <button class="btn btn-ghost btn-sm shelf-remove-btn" data-book-id="${book.id}" title="Remove from shelf">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');
  }

  function bindRemoveButtons(shelfKey) {
    document.querySelectorAll('.shelf-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bookId = btn.dataset.bookId;
        Alcove.store.removeFromShelf(shelfKey, bookId);
        const item = btn.closest('.shelf-book-item');
        if (item) {
          item.style.opacity = '0';
          item.style.transform = 'translateX(20px)';
          item.style.transition = 'all 0.3s ease';
          setTimeout(() => {
            item.remove();
            // Update count
            const subtitle = document.querySelector('.page-subtitle');
            const shelf = Alcove.store.getAllShelves()[shelfKey];
            if (subtitle && shelf) {
              subtitle.textContent = `${shelf.bookIds.length} book${shelf.bookIds.length !== 1 ? 's' : ''}`;
            }
          }, 300);
        }
        Alcove.toast.show('Removed from shelf', 'info');
      });
    });
  }

  function sortBooks(books, sortBy) {
    const sorted = [...books];
    switch (sortBy) {
      case 'Title':
        sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'Author':
        sorted.sort((a, b) => ((a.authors || [])[0] || '').localeCompare((b.authors || [])[0] || ''));
        break;
      case 'Rating':
        sorted.sort((a, b) => (Alcove.store.getRating(b.id) || 0) - (Alcove.store.getRating(a.id) || 0));
        break;
      default: // Date Added — already in order
        break;
    }
    return sorted;
  }

  Alcove.pages.shelfDetail = render;
})();
