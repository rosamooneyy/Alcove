window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  async function render() {
    const quotes = Alcove.store.getAllQuotes();

    // Get unique books that have quotes
    const bookMap = {};
    quotes.forEach(q => {
      if (!bookMap[q.bookId]) {
        bookMap[q.bookId] = { title: q.bookTitle, author: q.bookAuthor };
      }
    });

    const html = `
      <div class="quotes-page animate-in">
        <div class="page-header">
          <h1 class="page-title">Saved Quotes</h1>
          <p class="page-subtitle">${quotes.length} quote${quotes.length !== 1 ? 's' : ''} from ${Object.keys(bookMap).length} book${Object.keys(bookMap).length !== 1 ? 's' : ''}</p>
        </div>

        ${quotes.length > 0 ? `
          <div class="quotes-controls">
            <div class="search-compact" style="max-width: 300px;">
              <svg class="search-compact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input type="text" class="search-compact-input" placeholder="Search quotes..." id="quotes-search" aria-label="Search quotes">
            </div>
            <select class="input" id="quotes-filter" style="width: auto;">
              <option value="">All Books</option>
              ${Object.entries(bookMap).map(([id, b]) =>
                `<option value="${id}">${Alcove.sanitize(b.title)}</option>`
              ).join('')}
            </select>
          </div>

          <div class="quotes-list stagger-children" id="quotes-list">
            ${renderQuotes(quotes)}
          </div>
        ` : `
          <div class="empty-state">
            ${Alcove.mascot ? Alcove.mascot.render(100, 'reading') : ''}
            <h3>No quotes saved yet</h3>
            <p>Find a book and save your favorite passages.</p>
            <a href="#/search" class="btn btn-primary">Browse Books</a>
          </div>
        `}
      </div>
    `;

    return {
      html,
      init() {
        const searchInput = document.getElementById('quotes-search');
        const filterSelect = document.getElementById('quotes-filter');

        if (searchInput) {
          searchInput.addEventListener('input', Alcove.debounce(() => {
            filterQuotes();
          }, 300));
        }

        if (filterSelect) {
          filterSelect.addEventListener('change', filterQuotes);
        }

        bindActions();
      }
    };
  }

  function filterQuotes() {
    const search = (document.getElementById('quotes-search')?.value || '').toLowerCase();
    const bookFilter = document.getElementById('quotes-filter')?.value || '';

    let quotes = Alcove.store.getAllQuotes();

    if (bookFilter) {
      quotes = quotes.filter(q => q.bookId === bookFilter);
    }

    if (search) {
      quotes = quotes.filter(q =>
        q.text.toLowerCase().includes(search) ||
        q.bookTitle.toLowerCase().includes(search) ||
        (q.note || '').toLowerCase().includes(search)
      );
    }

    const list = document.getElementById('quotes-list');
    if (list) {
      list.innerHTML = renderQuotes(quotes);
      bindActions();
    }
  }

  function renderQuotes(quotes) {
    if (quotes.length === 0) {
      return `
        <div class="empty-state" style="padding: var(--space-xl);">
          <p>No quotes match your search.</p>
        </div>
      `;
    }

    return quotes.map(q => `
      <div class="quote-card-full" data-quote-id="${q.id}">
        <div class="quote-card-mark">&ldquo;</div>
        <blockquote class="quote-card-text">${Alcove.sanitize(q.text)}</blockquote>
        <div class="quote-card-source">
          <a href="#/book/${q.bookId}" class="quote-card-book">${Alcove.sanitize(q.bookTitle)}</a>
          <span class="quote-card-author">by ${Alcove.sanitize(q.bookAuthor)}</span>
          ${q.page ? `<span class="quote-card-page">&middot; Page ${Alcove.sanitize(q.page)}</span>` : ''}
        </div>
        ${q.note ? `<div class="quote-card-note"><em>${Alcove.sanitize(q.note)}</em></div>` : ''}
        <div class="quote-card-footer">
          <span class="quote-card-date">${Alcove.dateTime.formatDate(q.createdAt)}</span>
          <div class="quote-card-actions">
            <button class="btn btn-ghost btn-sm quote-edit-btn" data-id="${q.id}" data-book-id="${q.bookId}">Edit</button>
            <button class="btn btn-ghost btn-sm quote-delete-btn" data-id="${q.id}">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function bindActions() {
    document.querySelectorAll('.quote-edit-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const quoteId = btn.dataset.id;
        const bookId = btn.dataset.bookId;
        const allQuotes = Alcove.store.getAllQuotes();
        const quote = allQuotes.find(q => q.id === quoteId);
        if (!quote) return;

        const bookMeta = Alcove.store.getCachedBook(bookId) || {
          id: bookId,
          title: quote.bookTitle,
          authors: [quote.bookAuthor],
        };

        Alcove.quoteEditor.open(bookMeta, quote, () => {
          filterQuotes();
        });
      });
    });

    document.querySelectorAll('.quote-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this quote?')) {
          Alcove.store.deleteQuote(btn.dataset.id);
          Alcove.toast.show('Quote deleted', 'info');
          filterQuotes();
          // Update subtitle
          const quotes = Alcove.store.getAllQuotes();
          const subtitle = document.querySelector('.page-subtitle');
          if (subtitle) {
            const bookSet = new Set(quotes.map(q => q.bookId));
            subtitle.textContent = `${quotes.length} quote${quotes.length !== 1 ? 's' : ''} from ${bookSet.size} book${bookSet.size !== 1 ? 's' : ''}`;
          }
        }
      });
    });
  }

  Alcove.pages.quotes = render;
})();
