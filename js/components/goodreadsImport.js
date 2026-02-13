window.Alcove = window.Alcove || {};

(function() {
  function parseCSV(text) {
    const lines = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if (char === '\n' && !inQuotes) {
        lines.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current) lines.push(current);

    const result = [];
    const headers = parseCSVLine(lines[0]);

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((h, idx) => row[h] = values[idx]);
        result.push(row);
      }
    }
    return result;
  }

  function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }

  function mapGoodreadsShelf(exclusiveShelf, bookshelves) {
    const shelfMap = {
      'read': 'read',
      'currently-reading': 'currently-reading',
      'to-read': 'to-read',
    };

    const shelves = [shelfMap[exclusiveShelf] || 'to-read'];

    // Parse additional bookshelves
    if (bookshelves) {
      const additional = bookshelves.split(',').map(s => s.trim()).filter(Boolean);
      additional.forEach(shelf => {
        if (!['read', 'currently-reading', 'to-read'].includes(shelf)) {
          // Create custom shelf if needed
          const key = shelf.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          if (!Alcove.store.getAllShelves()[key]) {
            Alcove.store.createShelf(shelf);
          }
          shelves.push(key);
        }
      });
    }

    return shelves;
  }

  async function searchBookByISBN(isbn) {
    if (!isbn) return null;
    try {
      const result = await Alcove.api.searchBooks(`isbn:${isbn}`, 0, 1);
      return result.books[0] || null;
    } catch (e) {
      return null;
    }
  }

  async function searchBookByTitle(title, author) {
    try {
      const query = author ? `${title} ${author}` : title;
      const result = await Alcove.api.searchBooks(query, 0, 1);
      return result.books[0] || null;
    } catch (e) {
      return null;
    }
  }

  function createBookFromGoodreads(row) {
    const isbn = row['ISBN13']?.replace(/[="]/g, '') || row['ISBN']?.replace(/[="]/g, '') || '';

    return {
      id: `gr-${isbn || Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: row['Title'] || 'Unknown Title',
      subtitle: '',
      authors: [row['Author'] || 'Unknown Author'],
      description: '',
      categories: [],
      thumbnail: null,
      pageCount: parseInt(row['Number of Pages']) || null,
      publishedDate: row['Year Published'] || row['Original Publication Year'] || '',
      publisher: row['Publisher'] || '',
      isbn: isbn,
      averageRating: parseFloat(row['Average Rating']) || null,
      ratingsCount: 0,
      previewLink: '',
      language: 'eng',
    };
  }

  async function importBooks(csvText, onProgress) {
    const rows = parseCSV(csvText);
    const results = {
      total: rows.length,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: rows.length,
          title: row['Title'] || 'Unknown',
        });
      }

      try {
        const isbn = row['ISBN13']?.replace(/[="]/g, '') || row['ISBN']?.replace(/[="]/g, '');
        const title = row['Title'];
        const author = row['Author'];

        // Try to find the book in Open Library for cover and metadata
        let book = null;
        if (isbn) {
          book = await searchBookByISBN(isbn);
        }
        if (!book && title) {
          book = await searchBookByTitle(title, author);
        }

        // If not found, create from Goodreads data
        if (!book) {
          book = createBookFromGoodreads(row);
        }

        // Get shelves
        const shelves = mapGoodreadsShelf(row['Exclusive Shelf'], row['Bookshelves']);

        // Add to shelves
        shelves.forEach(shelfKey => {
          Alcove.store.addToShelf(shelfKey, book.id, book);
        });

        // Import rating (Goodreads uses 1-5, we support 0.25-5)
        const rating = parseInt(row['My Rating']);
        if (rating && rating > 0) {
          Alcove.store.setRating(book.id, rating, book);
        }

        // Import review if exists
        const review = row['My Review'];
        if (review && review.trim()) {
          Alcove.store.setReview(book.id, review.trim(), book);
        }

        results.imported++;

        // Small delay to avoid overwhelming the API
        if (i % 5 === 0) {
          await new Promise(r => setTimeout(r, 200));
        }
      } catch (err) {
        results.errors.push({ title: row['Title'], error: err.message });
        results.skipped++;
      }
    }

    return results;
  }

  function openImportModal() {
    Alcove.modal.open({
      title: 'Import from Goodreads',
      wide: true,
      content: `
        <div class="goodreads-import">
          <div class="import-step" id="import-step-1">
            <h4>Step 1: Export your Goodreads library</h4>
            <ol style="font-size: 0.9rem; color: var(--color-stone); margin: var(--space-md) 0; padding-left: var(--space-lg);">
              <li>Go to <a href="https://www.goodreads.com/review/import" target="_blank" style="color: var(--color-burgundy);">goodreads.com/review/import</a></li>
              <li>Click "Export Library" at the top of the page</li>
              <li>Wait for the export to complete (you'll get an email)</li>
              <li>Download the CSV file</li>
            </ol>

            <h4>Step 2: Upload the CSV file</h4>
            <div class="import-dropzone" id="import-dropzone">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="margin-bottom: var(--space-sm); opacity: 0.5;">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p>Drag & drop your <strong>goodreads_library_export.csv</strong> here</p>
              <p style="font-size: 0.85rem; color: var(--color-stone);">or click to browse</p>
              <input type="file" id="import-file-input" accept=".csv" style="display: none;">
            </div>
          </div>

          <div class="import-step" id="import-step-2" style="display: none;">
            <div class="import-progress">
              <div class="import-progress-mascot">
                ${Alcove.mascot ? Alcove.mascot.render(80, 'reading') : ''}
              </div>
              <h4 id="import-progress-title">Importing your books...</h4>
              <p id="import-progress-text" style="color: var(--color-stone);"></p>
              <div class="import-progress-bar">
                <div class="import-progress-fill" id="import-progress-fill"></div>
              </div>
              <p id="import-progress-count" style="font-size: 0.85rem; color: var(--color-stone);"></p>
            </div>
          </div>

          <div class="import-step" id="import-step-3" style="display: none;">
            <div class="import-complete">
              <div class="import-complete-icon">&#10003;</div>
              <h4>Import Complete!</h4>
              <div id="import-results"></div>
              <button class="btn btn-primary" id="import-done-btn" style="margin-top: var(--space-lg);">Done</button>
            </div>
          </div>
        </div>
      `,
      onInit() {
        const dropzone = document.getElementById('import-dropzone');
        const fileInput = document.getElementById('import-file-input');

        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
          dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        });

        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) handleFile(file);
        });

        document.getElementById('import-done-btn')?.addEventListener('click', () => {
          Alcove.modal.close();
          if (Alcove.navbar) Alcove.navbar.render();
          Alcove.router.handleRoute();
        });
      }
    });
  }

  async function handleFile(file) {
    if (!file.name.endsWith('.csv')) {
      Alcove.toast.show('Please select a CSV file', 'error');
      return;
    }

    // Show progress step
    document.getElementById('import-step-1').style.display = 'none';
    document.getElementById('import-step-2').style.display = 'block';

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target.result;

      try {
        const results = await importBooks(csvText, (progress) => {
          const pct = (progress.current / progress.total) * 100;
          document.getElementById('import-progress-fill').style.width = pct + '%';
          document.getElementById('import-progress-text').textContent = `"${progress.title}"`;
          document.getElementById('import-progress-count').textContent =
            `${progress.current} of ${progress.total} books`;
        });

        // Show results
        document.getElementById('import-step-2').style.display = 'none';
        document.getElementById('import-step-3').style.display = 'block';
        document.getElementById('import-results').innerHTML = `
          <p><strong>${results.imported}</strong> books imported successfully</p>
          ${results.skipped > 0 ? `<p style="color: var(--color-stone);">${results.skipped} books could not be imported</p>` : ''}
        `;

        Alcove.toast.show(`Imported ${results.imported} books from Goodreads!`, 'success');
      } catch (err) {
        console.error('Import failed:', err);
        Alcove.toast.show('Import failed: ' + err.message, 'error');
        document.getElementById('import-step-2').style.display = 'none';
        document.getElementById('import-step-1').style.display = 'block';
      }
    };

    reader.readAsText(file);
  }

  Alcove.goodreadsImport = { openImportModal, importBooks, parseCSV };
})();
