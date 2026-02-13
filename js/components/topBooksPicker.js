window.Alcove = window.Alcove || {};

(function() {
  function openPicker(onSave) {
    const currentTopBooks = Alcove.store.getTopBooks();
    let selectedBooks = [...currentTopBooks];

    // Get all books from all shelves
    const allShelves = Alcove.store.getAllShelves();
    const allBookIds = new Set();
    for (const shelf of Object.values(allShelves)) {
      shelf.bookIds.forEach(id => allBookIds.add(id));
    }

    const allBooks = Array.from(allBookIds)
      .map(id => Alcove.store.getCachedBook(id))
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title));

    Alcove.modal.open({
      title: 'Choose Your Top 3 Books',
      wide: true,
      content: renderPickerContent(allBooks, selectedBooks),
      actions: [
        { label: 'Cancel', action: 'close', className: 'btn-secondary' },
        { label: 'Save', id: 'save-top-books-btn', className: 'btn-primary' }
      ],
      onInit: () => {
        bindPickerEvents(allBooks, selectedBooks, onSave);
      }
    });
  }

  function renderPickerContent(allBooks, selectedBooks) {
    if (allBooks.length === 0) {
      return `
        <div class="top-books-picker-empty">
          ${Alcove.mascot ? Alcove.mascot.render(80, 'searching') : ''}
          <p>You haven't added any books to your library yet.</p>
          <p>Add some books to your shelves first, then come back to pick your favorites!</p>
        </div>
      `;
    }

    return `
      <div class="top-books-picker">
        <p class="top-books-picker-hint">Select up to 3 books that you want to showcase on your profile. These will be visible to friends.</p>

        <div class="top-books-selected">
          <h4>Selected (${selectedBooks.length}/3)</h4>
          <div class="top-books-selected-list" id="selected-books-list">
            ${renderSelectedBooks(selectedBooks)}
          </div>
        </div>

        <div class="top-books-search">
          <input type="text" id="top-books-search-input" placeholder="Search your library..." class="input">
        </div>

        <div class="top-books-available" id="available-books-list">
          ${renderAvailableBooks(allBooks, selectedBooks)}
        </div>
      </div>
    `;
  }

  function renderSelectedBooks(selectedBooks) {
    if (selectedBooks.length === 0) {
      return '<p class="top-books-none-selected">No books selected yet</p>';
    }

    return selectedBooks.map((bookId, index) => {
      const book = Alcove.store.getCachedBook(bookId);
      if (!book) return '';
      const authors = (book.authors || ['Unknown']).join(', ');
      return `
        <div class="top-book-selected-item" data-book-id="${bookId}">
          <span class="top-book-rank">#${index + 1}</span>
          <div class="top-book-cover-small">
            ${book.thumbnail
              ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}">`
              : `<div class="top-book-cover-placeholder">${book.title.charAt(0)}</div>`}
          </div>
          <div class="top-book-info">
            <span class="top-book-title">${Alcove.sanitize(book.title)}</span>
            <span class="top-book-author">${Alcove.sanitize(authors)}</span>
          </div>
          <button class="top-book-remove" data-remove-id="${bookId}" aria-label="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');
  }

  function renderAvailableBooks(allBooks, selectedBooks) {
    return `
      <div class="top-books-grid">
        ${allBooks.map(book => {
          const isSelected = selectedBooks.includes(book.id);
          const authors = (book.authors || ['Unknown']).join(', ');
          return `
            <div class="top-book-option ${isSelected ? 'selected' : ''}" data-book-id="${book.id}">
              <div class="top-book-option-cover">
                ${book.thumbnail
                  ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}">`
                  : `<div class="top-book-cover-placeholder">${book.title.charAt(0)}</div>`}
                ${isSelected ? '<div class="top-book-option-check">&#10003;</div>' : ''}
              </div>
              <div class="top-book-option-info">
                <span class="top-book-option-title">${Alcove.sanitize(book.title)}</span>
                <span class="top-book-option-author">${Alcove.sanitize(authors)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function bindPickerEvents(allBooks, selectedBooks, onSave) {
    const modalRoot = document.getElementById('modal-root');

    // Handle book selection
    modalRoot.addEventListener('click', (e) => {
      const option = e.target.closest('.top-book-option');
      if (option) {
        const bookId = option.dataset.bookId;
        const isSelected = selectedBooks.includes(bookId);

        if (isSelected) {
          // Remove from selection
          selectedBooks = selectedBooks.filter(id => id !== bookId);
        } else if (selectedBooks.length < 3) {
          // Add to selection
          selectedBooks.push(bookId);
        } else {
          Alcove.toast.show('You can only select up to 3 books', 'warning');
          return;
        }

        // Update UI
        updatePickerUI(allBooks, selectedBooks);
      }

      // Handle remove button
      const removeBtn = e.target.closest('.top-book-remove');
      if (removeBtn) {
        const bookId = removeBtn.dataset.removeId;
        selectedBooks = selectedBooks.filter(id => id !== bookId);
        updatePickerUI(allBooks, selectedBooks);
      }
    });

    // Handle search
    const searchInput = document.getElementById('top-books-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', Alcove.debounce(() => {
        const query = searchInput.value.toLowerCase().trim();
        const filtered = query
          ? allBooks.filter(b =>
              b.title.toLowerCase().includes(query) ||
              (b.authors || []).some(a => a.toLowerCase().includes(query))
            )
          : allBooks;

        document.getElementById('available-books-list').innerHTML = renderAvailableBooks(filtered, selectedBooks);
      }, 200));
    }

    // Handle save
    document.getElementById('save-top-books-btn').addEventListener('click', () => {
      Alcove.store.setTopBooks(selectedBooks);
      Alcove.modal.close();
      Alcove.toast.show('Top books updated!', 'success');
      if (onSave) onSave(selectedBooks);
    });
  }

  function updatePickerUI(allBooks, selectedBooks) {
    // Update selected count
    const selectedSection = document.querySelector('.top-books-selected h4');
    if (selectedSection) {
      selectedSection.textContent = `Selected (${selectedBooks.length}/3)`;
    }

    // Update selected list
    document.getElementById('selected-books-list').innerHTML = renderSelectedBooks(selectedBooks);

    // Update available list (preserve search filter)
    const searchInput = document.getElementById('top-books-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filtered = query
      ? allBooks.filter(b =>
          b.title.toLowerCase().includes(query) ||
          (b.authors || []).some(a => a.toLowerCase().includes(query))
        )
      : allBooks;

    document.getElementById('available-books-list').innerHTML = renderAvailableBooks(filtered, selectedBooks);
  }

  // Render top books display for profile
  function renderDisplay(topBookIds) {
    if (!topBookIds || topBookIds.length === 0) {
      return `
        <div class="top-books-display-empty">
          <p>No top books selected yet</p>
        </div>
      `;
    }

    return `
      <div class="top-books-display">
        ${topBookIds.map((bookId, index) => {
          const book = Alcove.store.getCachedBook(bookId);
          if (!book) return '';
          const authors = (book.authors || ['Unknown']).join(', ');
          const rating = Alcove.store.getRating(book.id);

          return `
            <a href="#/book/${book.id}" class="top-book-card">
              <div class="top-book-rank-badge">#${index + 1}</div>
              <div class="top-book-card-cover">
                ${book.thumbnail
                  ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}">`
                  : Alcove.bookCard.placeholder(book.title)}
              </div>
              <div class="top-book-card-info">
                <h4 class="top-book-card-title">${Alcove.sanitize(book.title)}</h4>
                <p class="top-book-card-author">${Alcove.sanitize(authors)}</p>
                ${rating ? `
                  <div class="top-book-card-rating">
                    ${Alcove.bookCard.renderMiniStars(rating)}
                  </div>
                ` : ''}
              </div>
            </a>
          `;
        }).join('')}
      </div>
    `;
  }

  Alcove.topBooksPicker = { openPicker, renderDisplay };
})();
