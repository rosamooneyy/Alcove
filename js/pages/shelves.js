window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  async function render() {
    const shelves = Alcove.store.getAllShelves();

    const shelfCards = Object.entries(shelves).map(([key, shelf]) => {
      const books = Alcove.store.getShelfBooks(key);
      const covers = books.slice(0, 3);

      return `
        <a href="#/shelf/${key}" class="shelf-card card card-clickable hover-lift">
          <div class="shelf-card-covers">
            ${covers.length > 0 ? covers.map((book, i) => `
              <div class="shelf-card-cover" style="transform: rotate(${(i - 1) * 5}deg); z-index: ${3 - i};">
                ${book.thumbnail
                  ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}" loading="lazy">`
                  : `<div class="shelf-card-cover-placeholder"></div>`}
              </div>
            `).join('') : `
              <div class="shelf-card-empty">
                ${Alcove.mascot ? Alcove.mascot.renderSmall(40) : ''}
              </div>
            `}
          </div>
          <div class="shelf-card-info">
            <h3 class="shelf-card-name">${Alcove.sanitize(shelf.label)}</h3>
            <p class="shelf-card-count">${shelf.bookIds.length} book${shelf.bookIds.length !== 1 ? 's' : ''}</p>
          </div>
          ${!shelf.builtIn ? `<span class="badge badge-mocha">Custom</span>` : ''}
        </a>
      `;
    }).join('');

    const html = `
      <div class="shelves-page animate-in">
        <div class="page-header">
          <h1 class="page-title">My Shelves</h1>
          <p class="page-subtitle">Your personal book collection</p>
        </div>

        <div class="shelves-actions" style="margin-bottom: var(--space-xl);">
          <button class="btn btn-primary" id="create-shelf-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create New Shelf
          </button>
        </div>

        <div class="shelves-grid stagger-children">
          ${shelfCards}
        </div>
      </div>
    `;

    return {
      html,
      init() {
        document.getElementById('create-shelf-btn').addEventListener('click', () => {
          const name = prompt('Enter shelf name:');
          if (name && name.trim()) {
            const key = Alcove.store.createShelf(name.trim());
            if (key) {
              Alcove.toast.show(`Created shelf "${name.trim()}"`, 'success');
              Alcove.router.handleRoute(); // Refresh
            } else {
              Alcove.toast.show('A shelf with that name already exists', 'warning');
            }
          }
        });
      }
    };
  }

  Alcove.pages.shelves = render;
})();
