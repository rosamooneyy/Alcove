window.Alcove = window.Alcove || {};

(function() {
  function open(book, onSave) {
    const existingReview = Alcove.store.getReview(book.id);
    const rating = Alcove.store.getRating(book.id);

    Alcove.modal.open({
      title: existingReview ? 'Edit Your Review' : 'Write a Review',
      wide: true,
      content: `
        <div class="review-editor">
          <div class="review-editor-book">
            <div class="review-editor-cover">
              ${book.thumbnail
                ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}">`
                : '<div class="review-cover-placeholder"></div>'}
            </div>
            <div class="review-editor-book-info">
              <strong>${Alcove.sanitize(book.title)}</strong>
              <span>by ${Alcove.sanitize((book.authors || []).join(', '))}</span>
            </div>
          </div>

          <div class="review-editor-rating">
            <label class="input-label">Your Rating</label>
            <div id="review-rating-container"></div>
          </div>

          <div class="input-group">
            <label class="input-label" for="review-text">Your Review</label>
            <textarea class="input" id="review-text" rows="8" placeholder="What did you think of this book? Share your thoughts, feelings, and opinions...">${existingReview ? Alcove.sanitize(existingReview.text) : ''}</textarea>
            <p style="font-size: 0.8rem; color: var(--color-stone); margin-top: var(--space-xs);">
              Tips: What did you like or dislike? Who would you recommend this to? How did it make you feel?
            </p>
          </div>

          <div style="display: flex; gap: var(--space-sm); justify-content: flex-end; margin-top: var(--space-lg);">
            ${existingReview ? `<button class="btn btn-ghost" id="review-delete" style="margin-right: auto;">Delete Review</button>` : ''}
            <button class="btn btn-secondary" id="review-cancel">Cancel</button>
            <button class="btn btn-primary" id="review-save">${existingReview ? 'Update Review' : 'Post Review'}</button>
          </div>
        </div>
      `,
      onInit() {
        const textEl = document.getElementById('review-text');
        let currentRating = rating || 0;

        // Render star rating
        const starRating = Alcove.starRating.create(book.id, {
          size: 'medium',
          initialValue: currentRating,
          onChange: (val) => {
            currentRating = val;
          }
        });
        document.getElementById('review-rating-container').innerHTML = starRating.html;
        starRating.init();

        textEl.focus();

        document.getElementById('review-cancel').addEventListener('click', () => {
          Alcove.modal.close();
        });

        document.getElementById('review-save').addEventListener('click', () => {
          const text = textEl.value.trim();

          if (!text && currentRating === 0) {
            Alcove.toast.show('Please write a review or add a rating', 'warning');
            return;
          }

          // Save rating if set
          if (currentRating > 0) {
            Alcove.store.setRating(book.id, currentRating, book);
          }

          // Save review if text exists
          if (text) {
            Alcove.store.setReview(book.id, text, book);
            Alcove.toast.show(existingReview ? 'Review updated' : 'Review posted', 'success');
          } else if (currentRating > 0) {
            Alcove.toast.show('Rating saved', 'success');
          }

          Alcove.modal.close();
          if (onSave) onSave();
        });

        const deleteBtn = document.getElementById('review-delete');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            if (confirm('Delete your review?')) {
              Alcove.store.deleteReview(book.id);
              Alcove.toast.show('Review deleted', 'info');
              Alcove.modal.close();
              if (onSave) onSave();
            }
          });
        }
      }
    });
  }

  function renderReviewCard(bookId, options = {}) {
    const { showBookInfo = false, onEdit } = options;
    const review = Alcove.store.getReview(bookId);
    if (!review) return '';

    const rating = Alcove.store.getRating(bookId);
    const book = Alcove.store.getCachedBook(bookId);

    return `
      <div class="review-card" data-book-id="${bookId}">
        ${showBookInfo && book ? `
          <div class="review-card-book">
            <a href="#/book/${bookId}" class="review-card-cover">
              ${book.thumbnail
                ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}">`
                : '<div class="review-cover-placeholder-sm"></div>'}
            </a>
            <div class="review-card-book-info">
              <a href="#/book/${bookId}" class="review-card-title">${Alcove.sanitize(review.bookTitle || book.title)}</a>
              <span class="review-card-author">by ${Alcove.sanitize(review.bookAuthor || (book.authors || []).join(', '))}</span>
            </div>
          </div>
        ` : ''}
        ${rating ? `
          <div class="review-card-rating">
            ${Alcove.bookCard.renderMiniStars(rating)}
            <span class="review-card-rating-value">${Alcove.bookCard.formatRating(rating)}</span>
          </div>
        ` : ''}
        <div class="review-card-text">${Alcove.sanitize(review.text)}</div>
        <div class="review-card-footer">
          <span class="review-card-date">
            ${review.updatedAt !== review.createdAt ? 'Updated ' : ''}${Alcove.dateTime.formatDate(review.updatedAt || review.createdAt)}
          </span>
          <button class="btn btn-ghost btn-sm review-edit-btn" data-book-id="${bookId}">Edit</button>
        </div>
      </div>
    `;
  }

  Alcove.reviewEditor = { open, renderReviewCard };
})();
