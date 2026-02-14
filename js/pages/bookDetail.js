window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  let currentBook = null;

  async function render(params) {
    const bookId = params.id;

    return {
      html: `
        <div class="book-detail-page animate-in" id="book-detail">
          <div class="book-detail-loading">
            <div class="spinner spinner-lg"></div>
          </div>
        </div>
      `,
      init: () => loadBook(bookId),
    };
  }

  async function loadBook(bookId) {
    const container = document.getElementById('book-detail');
    if (!container) return;

    try {
      currentBook = await Alcove.api.getBook(bookId);
      if (!currentBook) throw new Error('Book not found');

      // Cache the book
      Alcove.store.cacheBook(currentBook);

      const rating = Alcove.store.getRating(bookId);
      const shelves = Alcove.store.findBookShelves(bookId);
      const quotes = Alcove.store.getQuotesForBook(bookId);
      const review = Alcove.store.getReview(bookId);
      const progress = Alcove.store.getProgress(bookId);
      const bookTropes = Alcove.store.getBookTropes(bookId);
      const isCurrentlyReading = shelves.includes('currently-reading');
      const starRating = Alcove.starRating.create(bookId, {
        size: 'large',
        initialValue: rating || 0,
        onChange: (val) => {
          Alcove.store.setRating(bookId, val, currentBook);
          Alcove.toast.show(`Rated "${currentBook.title}" ${val} stars`, 'success');
        }
      });

      const authors = (currentBook.authors || []).join(', ');
      const categories = currentBook.categories || [];

      container.innerHTML = `
        <div class="book-detail-content animate-in">
          <button class="btn btn-ghost book-detail-back" onclick="history.back()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>

          <div class="book-detail-layout">
            <div class="book-detail-sidebar">
              <div class="book-detail-cover">
                ${currentBook.thumbnail
                  ? `<img src="${currentBook.thumbnail}" alt="${Alcove.sanitize(currentBook.title)}" onerror="this.parentElement.innerHTML=Alcove.bookCard.placeholder('${Alcove.sanitize(currentBook.title).replace(/'/g, "\\'")}')">`
                  : Alcove.bookCard.placeholder(currentBook.title)}
              </div>

              <div class="book-detail-actions">
                <div class="book-detail-shelf-picker" id="shelf-picker-container"></div>
                ${currentBook.previewLink ? `
                  <a href="${currentBook.previewLink}" target="_blank" rel="noopener" class="btn btn-secondary" style="width: 100%;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Preview on Google
                  </a>
                ` : ''}
              </div>
            </div>

            <div class="book-detail-main">
              <h1 class="book-detail-title">${Alcove.sanitize(currentBook.title)}</h1>
              ${currentBook.subtitle ? `<p class="book-detail-subtitle">${Alcove.sanitize(currentBook.subtitle)}</p>` : ''}
              <p class="book-detail-author">by <strong>${Alcove.sanitize(authors)}</strong></p>

              <div class="book-detail-meta">
                ${currentBook.pageCount ? `<span class="book-detail-meta-item">${currentBook.pageCount} pages</span>` : ''}
                ${currentBook.publishedDate ? `<span class="book-detail-meta-item">Published ${currentBook.publishedDate}</span>` : ''}
                ${currentBook.publisher ? `<span class="book-detail-meta-item">${Alcove.sanitize(currentBook.publisher)}</span>` : ''}
                ${currentBook.isbn ? `<span class="book-detail-meta-item">ISBN: ${currentBook.isbn}</span>` : ''}
              </div>

              ${categories.length > 0 ? `
                <div class="book-detail-categories">
                  ${categories.map(c => `<span class="chip" style="cursor: default;">${Alcove.sanitize(c)}</span>`).join('')}
                </div>
              ` : ''}

              <div class="book-detail-rating-section">
                <h3>Your Rating</h3>
                <div id="star-rating-container">${starRating.html}</div>
                ${shelves.length > 0 ? `
                  <div class="book-detail-shelves-info">
                    On your shelves: ${shelves.map(s => {
                      const shelf = Alcove.store.getAllShelves()[s];
                      return shelf ? `<a href="#/shelf/${s}" class="book-detail-shelf-link">${Alcove.sanitize(shelf.label)}</a>` : '';
                    }).join(', ')}
                  </div>
                ` : ''}
              </div>

              <div class="book-detail-progress-section">
                <h3>Reading Progress</h3>
                <div id="progress-container">
                  ${renderProgressSection(progress, currentBook.pageCount, shelves)}
                </div>
              </div>

              <div class="book-detail-review-section">
                <div class="section-header">
                  <h3 class="section-title">Your Review</h3>
                  <button class="btn btn-secondary btn-sm" id="write-review-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                      ${review ? '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}
                    </svg>
                    ${review ? 'Edit Review' : 'Write Review'}
                  </button>
                </div>
                <div id="book-review-container">
                  ${renderReviewSection(review, rating)}
                </div>
              </div>

              <div class="book-detail-tropes-section">
                <div class="section-header">
                  <h3 class="section-title">Book Tropes & Themes</h3>
                  <button class="btn btn-secondary btn-sm" id="edit-tropes-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                      ${bookTropes.tropes.length > 0 || bookTropes.customTropes.length > 0
                        ? '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'
                        : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}
                    </svg>
                    ${bookTropes.tropes.length > 0 || bookTropes.customTropes.length > 0 ? 'Edit Tropes' : 'Add Tropes'}
                  </button>
                </div>
                <div id="book-tropes-display">
                  ${renderTropesDisplay(bookTropes)}
                </div>
                <div id="similar-books-by-tropes"></div>
              </div>

              <div class="book-detail-community-tropes-section">
                <div class="section-header">
                  <h3 class="section-title">Community Tropes</h3>
                </div>
                <p class="community-tropes-hint">Tropes tagged by all readers. Upvote the ones you agree with!</p>
                <div id="community-tropes-container">
                  <div class="community-tropes-loading">
                    <div class="spinner spinner-sm"></div>
                    <span>Loading community tropes...</span>
                  </div>
                </div>
              </div>

              ${currentBook.description ? `
                <div class="book-detail-description">
                  <h3>About This Book</h3>
                  <div class="book-detail-description-text" id="book-description">
                    ${Alcove.sanitizeHTML(currentBook.description)}
                  </div>
                  <button class="btn btn-ghost btn-sm" id="toggle-description" style="display: none;">Read more</button>
                </div>
              ` : ''}

              <div class="book-detail-quotes-section">
                <div class="section-header">
                  <h3 class="section-title">Saved Quotes</h3>
                  <button class="btn btn-secondary btn-sm" id="add-quote-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add Quote
                  </button>
                </div>
                <div id="book-quotes-list">
                  ${renderQuotesList(quotes)}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Init star rating
      starRating.init();

      // Init shelf picker
      if (Alcove.shelfPicker) {
        Alcove.shelfPicker.render('shelf-picker-container', bookId, currentBook);
      }

      // Add quote button
      document.getElementById('add-quote-btn').addEventListener('click', () => {
        if (Alcove.quoteEditor) {
          Alcove.quoteEditor.open(currentBook, null, () => {
            const updatedQuotes = Alcove.store.getQuotesForBook(bookId);
            const list = document.getElementById('book-quotes-list');
            if (list) list.innerHTML = renderQuotesList(updatedQuotes);
          });
        }
      });

      // Toggle description
      const descEl = document.getElementById('book-description');
      const toggleBtn = document.getElementById('toggle-description');
      if (descEl && toggleBtn && descEl.scrollHeight > 200) {
        descEl.style.maxHeight = '200px';
        descEl.style.overflow = 'hidden';
        toggleBtn.style.display = 'inline-flex';
        toggleBtn.addEventListener('click', () => {
          const expanded = descEl.style.maxHeight !== '200px';
          descEl.style.maxHeight = expanded ? '200px' : 'none';
          descEl.style.overflow = expanded ? 'hidden' : 'visible';
          toggleBtn.textContent = expanded ? 'Read more' : 'Show less';
        });
      }

      // Quote edit/delete handlers
      bindQuoteActions(bookId);

      // Review button
      document.getElementById('write-review-btn').addEventListener('click', () => {
        if (Alcove.reviewEditor) {
          Alcove.reviewEditor.open(currentBook, () => {
            const updatedReview = Alcove.store.getReview(bookId);
            const updatedRating = Alcove.store.getRating(bookId);
            const container = document.getElementById('book-review-container');
            if (container) {
              container.innerHTML = renderReviewSection(updatedReview, updatedRating);
            }
            // Update the button text
            const btn = document.getElementById('write-review-btn');
            if (btn) {
              btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                  ${updatedReview ? '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}
                </svg>
                ${updatedReview ? 'Edit Review' : 'Write Review'}
              `;
            }
            // Update star rating display
            starRating.setValue(updatedRating || 0);
          });
        }
      });

      // Progress tracking
      bindProgressHandlers(bookId, currentBook);

      // Tropes editor
      document.getElementById('edit-tropes-btn').addEventListener('click', () => {
        openTropeEditor(bookId, currentBook);
      });

      // Load similar books by tropes
      loadSimilarBooksByTropes(bookId);

      // Load community tropes with upvoting
      loadCommunityTropes(bookId);

    } catch (err) {
      console.error('Failed to load book:', err);
      container.innerHTML = `
        <div class="empty-state">
          ${Alcove.mascot ? Alcove.mascot.render(100, 'sleeping') : ''}
          <h3>Could not load this book</h3>
          <p>Please check your connection and try again.</p>
          <button class="btn btn-primary" onclick="history.back()">Go Back</button>
        </div>
      `;
    }
  }

  function renderQuotesList(quotes) {
    if (!quotes || quotes.length === 0) {
      return `
        <div class="empty-state" style="padding: var(--space-xl);">
          <p style="color: var(--color-stone);">No quotes saved for this book yet.</p>
        </div>
      `;
    }

    return quotes.map(q => `
      <div class="quote-card" data-quote-id="${q.id}">
        <div class="quote-card-mark">&ldquo;</div>
        <blockquote class="quote-card-text">${Alcove.sanitize(q.text)}</blockquote>
        ${q.page ? `<div class="quote-card-page">Page ${Alcove.sanitize(q.page)}</div>` : ''}
        ${q.note ? `<div class="quote-card-note">${Alcove.sanitize(q.note)}</div>` : ''}
        <div class="quote-card-actions">
          <button class="btn btn-ghost btn-sm quote-edit-btn" data-id="${q.id}">Edit</button>
          <button class="btn btn-ghost btn-sm quote-delete-btn" data-id="${q.id}">Delete</button>
        </div>
      </div>
    `).join('');
  }

  function bindQuoteActions(bookId) {
    document.querySelectorAll('.quote-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const quoteId = btn.dataset.id;
        const allQuotes = Alcove.store.getAllQuotes();
        const quote = allQuotes.find(q => q.id === quoteId);
        if (quote && Alcove.quoteEditor) {
          Alcove.quoteEditor.open(currentBook, quote, () => {
            const updated = Alcove.store.getQuotesForBook(bookId);
            const list = document.getElementById('book-quotes-list');
            if (list) {
              list.innerHTML = renderQuotesList(updated);
              bindQuoteActions(bookId);
            }
          });
        }
      });
    });

    document.querySelectorAll('.quote-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const quoteId = btn.dataset.id;
        if (confirm('Delete this quote?')) {
          Alcove.store.deleteQuote(quoteId);
          const updated = Alcove.store.getQuotesForBook(bookId);
          const list = document.getElementById('book-quotes-list');
          if (list) {
            list.innerHTML = renderQuotesList(updated);
            bindQuoteActions(bookId);
          }
          Alcove.toast.show('Quote deleted', 'info');
        }
      });
    });
  }

  function renderReviewSection(review, rating) {
    if (!review) {
      return `
        <div class="empty-state" style="padding: var(--space-lg);">
          <p style="color: var(--color-stone);">You haven't reviewed this book yet. Share your thoughts!</p>
        </div>
      `;
    }

    return `
      <div class="review-card-inline">
        ${rating ? `
          <div class="review-card-rating">
            ${Alcove.bookCard.renderMiniStars(rating)}
            <span class="review-card-rating-value">${Alcove.bookCard.formatRating(rating)}</span>
          </div>
        ` : ''}
        <div class="review-card-text">${Alcove.sanitize(review.text)}</div>
        <div class="review-card-footer">
          <span class="review-card-date">
            ${review.updatedAt !== review.createdAt ? 'Updated ' : 'Reviewed '}${Alcove.dateTime.formatDate(review.updatedAt || review.createdAt)}
          </span>
        </div>
      </div>
    `;
  }

  function renderProgressSection(progress, bookPageCount, shelves = []) {
    const currentPage = progress?.currentPage || 0;
    const totalPages = progress?.totalPages || bookPageCount || 0;
    const percentage = progress?.percentage || 0;
    const isOnReadShelf = shelves.includes('read');
    const isCurrentlyReading = shelves.includes('currently-reading');

    // If book is on "read" shelf, show simple completed state
    if (isOnReadShelf) {
      return `
        <div class="progress-tracker">
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: 100%;"></div>
          </div>
          <div class="progress-complete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Book Completed
          </div>
          ${progress?.startedAt || progress?.completedAt ? `
            <div class="progress-started">
              ${progress.startedAt ? `Started ${Alcove.dateTime.formatDate(progress.startedAt)}` : ''}
              ${progress.completedAt ? `${progress.startedAt ? ' · ' : ''}Finished ${Alcove.dateTime.formatDate(progress.completedAt)}` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }

    // For currently-reading or to-read/no shelf, show full progress tracker
    return `
      <div class="progress-tracker">
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
        </div>
        <div class="progress-info">
          <span class="progress-percentage">${percentage}% complete</span>
          ${currentPage > 0 && totalPages > 0 ? `<span class="progress-pages">Page ${currentPage} of ${totalPages}</span>` : ''}
        </div>
        <div class="progress-inputs">
          <div class="progress-input-group">
            <label>Update by page:</label>
            <div class="progress-input-row">
              <input type="number" class="input input-sm" id="progress-page" placeholder="Current page" min="0" value="${currentPage || ''}" style="width: 100px;">
              <span>of</span>
              <input type="number" class="input input-sm" id="progress-total" placeholder="Total" min="1" value="${totalPages || ''}" style="width: 80px;">
              <button class="btn btn-primary btn-sm" id="update-page-btn">Update</button>
            </div>
          </div>
          <div class="progress-divider">or</div>
          <div class="progress-input-group">
            <label>Update by percentage:</label>
            <div class="progress-input-row">
              <input type="number" class="input input-sm" id="progress-percent" placeholder="%" min="0" max="100" value="${percentage || ''}" style="width: 80px;">
              <span>%</span>
              <button class="btn btn-secondary btn-sm" id="update-percent-btn">Update</button>
            </div>
          </div>
          <div class="progress-divider">or</div>
          <div class="progress-input-group">
            <button class="btn btn-accent" id="mark-complete-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Mark as Complete
            </button>
          </div>
        </div>
        ${progress?.startedAt ? `
          <div class="progress-started">
            Started ${Alcove.dateTime.formatDate(progress.startedAt)}
            ${progress.completedAt ? ` · Finished ${Alcove.dateTime.formatDate(progress.completedAt)}` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  function bindProgressHandlers(bookId, book) {
    const updatePageBtn = document.getElementById('update-page-btn');
    const updatePercentBtn = document.getElementById('update-percent-btn');
    const markCompleteBtn = document.getElementById('mark-complete-btn');

    // Helper to move book to currently-reading if on to-read shelf
    function moveToCurrentlyReadingIfNeeded() {
      const currentShelves = Alcove.store.findBookShelves(bookId);
      if (currentShelves.includes('to-read') && !currentShelves.includes('currently-reading') && !currentShelves.includes('read')) {
        Alcove.store.removeFromShelf('to-read', bookId);
        Alcove.store.addToShelf('currently-reading', bookId, book);
        Alcove.toast.show('Moved to Currently Reading', 'info');
        return true;
      }
      return false;
    }

    // Helper to refresh UI after progress update
    function refreshProgressUI() {
      const updatedShelves = Alcove.store.findBookShelves(bookId);
      const updatedProgress = Alcove.store.getProgress(bookId);
      document.getElementById('progress-container').innerHTML = renderProgressSection(updatedProgress, book.pageCount, updatedShelves);
      bindProgressHandlers(bookId, book);

      // Refresh shelf picker to show updated shelf
      if (Alcove.shelfPicker) {
        Alcove.shelfPicker.render('shelf-picker-container', bookId, book);
      }
    }

    if (updatePageBtn) {
      updatePageBtn.addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('progress-page').value) || 0;
        const totalPages = parseInt(document.getElementById('progress-total').value) || book.pageCount || 0;

        if (currentPage < 0 || (totalPages > 0 && currentPage > totalPages)) {
          Alcove.toast.show('Invalid page number', 'warning');
          return;
        }

        // Move to currently-reading if on to-read shelf and starting to read
        if (currentPage > 0) {
          moveToCurrentlyReadingIfNeeded();
        }

        // If current page equals total pages, treat as complete
        const isComplete = totalPages > 0 && currentPage >= totalPages;
        const progressData = { currentPage, totalPages };
        if (isComplete) {
          progressData.percentage = 100;
        }

        Alcove.store.setProgress(bookId, progressData, book);
        refreshProgressUI();

        const updated = Alcove.store.getProgress(bookId);
        if (updated.percentage >= 100) {
          Alcove.toast.show('Congratulations! You finished the book!', 'success');
        } else {
          Alcove.toast.show(`Progress updated: ${updated.percentage}%`, 'success');
        }
      });
    }

    if (updatePercentBtn) {
      updatePercentBtn.addEventListener('click', () => {
        const percentage = parseInt(document.getElementById('progress-percent').value) || 0;

        if (percentage < 0 || percentage > 100) {
          Alcove.toast.show('Percentage must be between 0 and 100', 'warning');
          return;
        }

        // Move to currently-reading if on to-read shelf and starting to read
        if (percentage > 0) {
          moveToCurrentlyReadingIfNeeded();
        }

        const existing = Alcove.store.getProgress(bookId);
        Alcove.store.setProgress(bookId, {
          percentage,
          totalPages: existing?.totalPages || book.pageCount || 0
        }, book);

        refreshProgressUI();

        const updated = Alcove.store.getProgress(bookId);
        if (updated.percentage >= 100) {
          Alcove.toast.show('Congratulations! You finished the book!', 'success');
        } else {
          Alcove.toast.show(`Progress updated: ${updated.percentage}%`, 'success');
        }
      });
    }

    if (markCompleteBtn) {
      markCompleteBtn.addEventListener('click', () => {
        const existing = Alcove.store.getProgress(bookId);
        const totalPages = existing?.totalPages || book.pageCount || 0;

        Alcove.store.setProgress(bookId, {
          currentPage: totalPages,
          totalPages: totalPages,
          percentage: 100
        }, book);

        refreshProgressUI();
        Alcove.toast.show('Congratulations! You finished the book!', 'success');
      });
    }
  }

  function renderTropesDisplay(bookTropes) {
    const allTropes = [...bookTropes.tropes, ...bookTropes.customTropes];

    if (allTropes.length === 0) {
      return `
        <div class="empty-state" style="padding: var(--space-lg);">
          <p style="color: var(--color-stone);">No tropes tagged yet. Add tropes to help others discover this book!</p>
        </div>
      `;
    }

    // Group tropes by category
    const grouped = {};
    allTropes.forEach(tropeId => {
      const trope = Alcove.tropePicker.getTropeDisplay(tropeId);
      const cat = trope.categoryId || 'custom';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(trope);
    });

    return `
      <div class="tropes-display">
        ${Object.entries(grouped).map(([catId, tropes]) => {
          const catColor = tropes[0]?.categoryColor || '#888';
          const catLabel = tropes[0]?.categoryLabel || 'Custom';
          return `
            <div class="tropes-group">
              <span class="tropes-group-label" style="color: ${catColor}">${catLabel}</span>
              <div class="tropes-group-chips">
                ${tropes.map(t => `
                  <a href="#/tropes?trope=${t.id}" class="trope-badge clickable" style="--badge-color: ${t.categoryColor}" title="Find more books with this trope">
                    ${t.label}
                  </a>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function openTropeEditor(bookId, book) {
    if (!Alcove.modal) return;

    const existingTropes = Alcove.store.getBookTropes(bookId);
    let selectedTropes = [...existingTropes.tropes];
    let customTropes = [...existingTropes.customTropes];

    Alcove.modal.open({
      title: 'Tag Tropes & Themes',
      size: 'large',
      content: `
        <div class="trope-editor-modal">
          <p style="color: var(--color-stone); margin-bottom: var(--space-md); font-size: 0.9rem;">
            Help readers discover this book by tagging the tropes and themes it contains.
          </p>
          <div id="trope-picker-modal"></div>
        </div>
      `,
      actions: [
        { label: 'Cancel', className: 'btn-secondary', action: 'close' },
        { label: 'Save Tropes', className: 'btn-primary', id: 'save-tropes-btn' },
      ],
      onInit() {
        // Render trope picker
        if (Alcove.tropePicker) {
          Alcove.tropePicker.render('trope-picker-modal', selectedTropes, customTropes, (tropes, custom) => {
            selectedTropes = tropes;
            customTropes = custom;
          });
        }

        // Save button
        document.getElementById('save-tropes-btn').addEventListener('click', () => {
          Alcove.store.setBookTropes(bookId, selectedTropes, customTropes, book);
          Alcove.modal.close();

          // Update display
          const updatedTropes = Alcove.store.getBookTropes(bookId);
          const display = document.getElementById('book-tropes-display');
          if (display) {
            display.innerHTML = renderTropesDisplay(updatedTropes);
          }

          // Update button text
          const btn = document.getElementById('edit-tropes-btn');
          if (btn) {
            const hasTropes = updatedTropes.tropes.length > 0 || updatedTropes.customTropes.length > 0;
            btn.innerHTML = `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                ${hasTropes
                  ? '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'
                  : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}
              </svg>
              ${hasTropes ? 'Edit Tropes' : 'Add Tropes'}
            `;
          }

          // Reload similar books and community tropes
          loadSimilarBooksByTropes(bookId);
          loadCommunityTropes(bookId);

          const totalTropes = selectedTropes.length + customTropes.length;
          Alcove.toast.show(`Saved ${totalTropes} trope${totalTropes !== 1 ? 's' : ''}`, 'success');
        });
      }
    });
  }

  function loadSimilarBooksByTropes(bookId) {
    const container = document.getElementById('similar-books-by-tropes');
    if (!container) return;

    const bookTropes = Alcove.store.getBookTropes(bookId);
    const allTropes = [...bookTropes.tropes, ...bookTropes.customTropes];

    if (allTropes.length === 0) {
      container.innerHTML = '';
      return;
    }

    // Find similar books
    const similarBooks = Alcove.store.getBooksWithAnyTropes(allTropes)
      .filter(b => b.id !== bookId)
      .slice(0, 6);

    if (similarBooks.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="similar-books-section">
        <h4>Similar Books (by Tropes)</h4>
        <div class="similar-books-grid">
          ${similarBooks.map(book => `
            <a href="#/book/${book.id}" class="similar-book-card">
              <div class="similar-book-cover">
                ${book.thumbnail
                  ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}">`
                  : '<div class="similar-book-placeholder"></div>'}
              </div>
              <div class="similar-book-info">
                <span class="similar-book-title">${Alcove.sanitize(book.title)}</span>
                <span class="similar-book-match">${book.matchCount} matching trope${book.matchCount !== 1 ? 's' : ''}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  async function loadCommunityTropes(bookId) {
    const container = document.getElementById('community-tropes-container');
    if (!container) return;

    // Only show community tropes when cloud is available
    if (!Alcove.db?.useCloud()) {
      container.innerHTML = '<p class="community-tropes-offline">Sign in to see community tropes and upvote.</p>';
      return;
    }

    try {
      const [communityTropes, userVotes] = await Promise.all([
        Alcove.db.getCommunityTropes(bookId),
        Alcove.db.getUserTropeVotes(bookId)
      ]);

      if (communityTropes.length === 0) {
        container.innerHTML = '<p class="community-tropes-empty">No community tropes yet. Be the first to tag this book!</p>';
        return;
      }

      const votedSet = new Set(userVotes);

      container.innerHTML = `
        <div class="community-tropes-list">
          ${communityTropes.map(ct => {
            const hasVoted = votedSet.has(ct.id);
            const tropeInfo = Alcove.tropePicker ? Alcove.tropePicker.getTropeDisplay(ct.trope_id) : null;
            const color = tropeInfo?.categoryColor || '#888';
            return `
              <div class="community-trope-item" data-id="${ct.id}">
                <button class="community-upvote-btn ${hasVoted ? 'upvoted' : ''}" data-trope-id="${ct.id}" title="${hasVoted ? 'Remove upvote' : 'Upvote this trope'}">
                  <svg viewBox="0 0 24 24" fill="${hasVoted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M12 4l-8 8h5v8h6v-8h5z"/>
                  </svg>
                </button>
                <span class="community-upvote-count">${ct.upvote_count}</span>
                <span class="community-trope-badge" style="--badge-color: ${color}">${Alcove.sanitize(ct.trope_label)}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Bind upvote click handlers
      container.querySelectorAll('.community-upvote-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const tropeId = btn.dataset.tropeId;
          const isUpvoted = btn.classList.contains('upvoted');
          const countEl = btn.parentElement.querySelector('.community-upvote-count');

          // Optimistic UI update
          btn.disabled = true;
          if (isUpvoted) {
            btn.classList.remove('upvoted');
            btn.querySelector('svg').setAttribute('fill', 'none');
            countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
          } else {
            btn.classList.add('upvoted');
            btn.querySelector('svg').setAttribute('fill', 'currentColor');
            countEl.textContent = parseInt(countEl.textContent) + 1;
          }

          // Actual API call
          const success = isUpvoted
            ? await Alcove.db.removeUpvoteCommunityTrope(tropeId)
            : await Alcove.db.upvoteCommunityTrope(tropeId);

          btn.disabled = false;

          if (!success) {
            // Revert on failure
            if (isUpvoted) {
              btn.classList.add('upvoted');
              btn.querySelector('svg').setAttribute('fill', 'currentColor');
              countEl.textContent = parseInt(countEl.textContent) + 1;
            } else {
              btn.classList.remove('upvoted');
              btn.querySelector('svg').setAttribute('fill', 'none');
              countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
            }
            Alcove.toast.show('Failed to update vote', 'error');
          }
        });
      });
    } catch (err) {
      console.error('Failed to load community tropes:', err);
      container.innerHTML = '<p class="community-tropes-empty">Could not load community tropes.</p>';
    }
  }

  Alcove.pages.bookDetail = render;
})();
