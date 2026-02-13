window.Alcove = window.Alcove || {};

(function() {
  function open(book, existingQuote, onSave) {
    const isEdit = !!existingQuote;

    Alcove.modal.open({
      title: isEdit ? 'Edit Quote' : 'Add Quote',
      content: `
        <div class="quote-editor">
          <div class="quote-editor-book">
            <strong>${Alcove.sanitize(book.title)}</strong>
            <span style="color: var(--color-stone);">by ${Alcove.sanitize((book.authors || []).join(', '))}</span>
          </div>

          <div class="input-group">
            <label class="input-label" for="quote-text">Quote *</label>
            <textarea class="input" id="quote-text" rows="4" placeholder="Enter the quote text...">${isEdit ? Alcove.sanitize(existingQuote.text) : ''}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
            <div class="input-group">
              <label class="input-label" for="quote-page">Page Number</label>
              <input type="text" class="input" id="quote-page" placeholder="e.g., 42" value="${isEdit ? Alcove.sanitize(existingQuote.page || '') : ''}">
            </div>
            <div class="input-group">
              <label class="input-label" for="quote-note">Personal Note</label>
              <input type="text" class="input" id="quote-note" placeholder="Why you love this..." value="${isEdit ? Alcove.sanitize(existingQuote.note || '') : ''}">
            </div>
          </div>

          <div style="display: flex; gap: var(--space-sm); justify-content: flex-end; margin-top: var(--space-md);">
            <button class="btn btn-secondary" id="quote-cancel">Cancel</button>
            <button class="btn btn-primary" id="quote-save">${isEdit ? 'Update Quote' : 'Save Quote'}</button>
          </div>
        </div>
      `,
      onInit() {
        const textEl = document.getElementById('quote-text');
        const pageEl = document.getElementById('quote-page');
        const noteEl = document.getElementById('quote-note');

        textEl.focus();

        document.getElementById('quote-cancel').addEventListener('click', () => {
          Alcove.modal.close();
        });

        document.getElementById('quote-save').addEventListener('click', () => {
          const text = textEl.value.trim();
          if (!text) {
            textEl.style.borderColor = 'var(--color-error)';
            textEl.focus();
            return;
          }

          if (isEdit) {
            Alcove.store.editQuote(existingQuote.id, {
              text,
              page: pageEl.value.trim(),
              note: noteEl.value.trim(),
            });
            Alcove.toast.show('Quote updated', 'success');
          } else {
            Alcove.store.addQuote({
              bookId: book.id,
              bookTitle: book.title,
              bookAuthor: (book.authors || []).join(', '),
              text,
              page: pageEl.value.trim(),
              note: noteEl.value.trim(),
            });
            Alcove.toast.show('Quote saved', 'success');
          }

          Alcove.modal.close();
          if (onSave) onSave();
        });
      }
    });
  }

  Alcove.quoteEditor = { open };
})();
