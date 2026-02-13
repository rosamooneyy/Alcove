window.Alcove = window.Alcove || {};

(function() {
  function render(containerId, bookId, bookMeta) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const shelves = Alcove.store.getAllShelves();
    const bookShelves = Alcove.store.findBookShelves(bookId);

    container.innerHTML = `
      <div class="shelf-picker">
        <button class="btn btn-primary shelf-picker-toggle" id="shelf-picker-btn" style="width: 100%;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
          ${bookShelves.length > 0 ? 'On ' + bookShelves.length + ' shelf' + (bookShelves.length > 1 ? 'es' : '') : 'Add to Shelf'}
        </button>
        <div class="dropdown-menu" id="shelf-picker-menu">
          ${Object.entries(shelves).map(([key, shelf]) => `
            <label class="dropdown-item shelf-picker-item">
              <input type="checkbox" class="shelf-checkbox" data-shelf="${key}" ${bookShelves.includes(key) ? 'checked' : ''}>
              <span class="shelf-checkbox-custom"></span>
              <span>${Alcove.sanitize(shelf.label)}</span>
              <span class="shelf-item-count">${shelf.bookIds.length}</span>
            </label>
          `).join('')}
          <div class="dropdown-divider"></div>
          <button class="dropdown-item shelf-picker-create" id="shelf-create-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Create New Shelf</span>
          </button>
        </div>
      </div>
    `;

    // Toggle dropdown
    const btn = document.getElementById('shelf-picker-btn');
    const menu = document.getElementById('shelf-picker-menu');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        menu.classList.remove('open');
      }
    });

    // Checkbox changes
    container.querySelectorAll('.shelf-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const shelfKey = cb.dataset.shelf;
        if (cb.checked) {
          Alcove.store.addToShelf(shelfKey, bookId, bookMeta);
          Alcove.toast.show(`Added to "${Alcove.store.getAllShelves()[shelfKey].label}"`, 'success');
        } else {
          Alcove.store.removeFromShelf(shelfKey, bookId);
          Alcove.toast.show(`Removed from shelf`, 'info');
        }
        // Update button text
        const updated = Alcove.store.findBookShelves(bookId);
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
          ${updated.length > 0 ? 'On ' + updated.length + ' shelf' + (updated.length > 1 ? 'es' : '') : 'Add to Shelf'}
        `;
      });
    });

    // Create new shelf
    document.getElementById('shelf-create-btn').addEventListener('click', () => {
      const name = prompt('Enter shelf name:');
      if (name && name.trim()) {
        const key = Alcove.store.createShelf(name.trim());
        if (key) {
          Alcove.store.addToShelf(key, bookId, bookMeta);
          Alcove.toast.show(`Created shelf "${name.trim()}" and added book`, 'success');
          render(containerId, bookId, bookMeta); // Re-render
        } else {
          Alcove.toast.show('A shelf with that name already exists', 'warning');
        }
      }
    });
  }

  Alcove.shelfPicker = { render };
})();
