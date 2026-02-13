window.Alcove = window.Alcove || {};

(function() {
  function render(book, options = {}) {
    const { showRating = true, showShelf = true, compact = false } = options;
    if (!book) return '';

    const rating = Alcove.store.getRating(book.id);
    const shelves = Alcove.store.findBookShelves(book.id);
    const authors = (book.authors || ['Unknown']).join(', ');
    const thumbnail = book.thumbnail || '';

    return `
      <a href="#/book/${book.id}" class="book-card ${compact ? 'book-card-compact' : ''}" data-book-id="${book.id}">
        <div class="book-card-cover">
          ${thumbnail
            ? `<img src="${thumbnail}" alt="${Alcove.sanitize(book.title)}" loading="lazy" onerror="this.parentElement.innerHTML=Alcove.bookCard.placeholder('${Alcove.sanitize(book.title).replace(/'/g, "\\'")}')">`
            : placeholder(book.title)}
        </div>
        <div class="book-card-info">
          <h4 class="book-card-title">${Alcove.sanitize(book.title)}</h4>
          <p class="book-card-author">${Alcove.sanitize(authors)}</p>
          ${showRating && rating ? `
            <div class="book-card-rating">
              ${renderMiniStars(rating)}
              <span class="book-card-rating-value">${formatRating(rating)}</span>
            </div>
          ` : ''}
          ${showShelf && shelves.length > 0 ? `
            <div class="book-card-shelves">
              ${shelves.slice(0, 2).map(s => {
                const shelf = Alcove.store.getAllShelves()[s];
                return shelf ? `<span class="book-card-shelf-tag">${Alcove.sanitize(shelf.label)}</span>` : '';
              }).join('')}
            </div>
          ` : ''}
        </div>
      </a>
    `;
  }

  function placeholder(title) {
    const colors = ['#8B6F4E', '#7A2E3B', '#7A8B6F', '#6B635A', '#C9A84C'];
    const color = colors[Math.abs(hashCode(title)) % colors.length];
    const displayTitle = title.length > 40 ? title.slice(0, 40) + '...' : title;

    return `
      <div class="book-card-placeholder" style="background-color: ${color}">
        <svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg" class="book-card-placeholder-svg">
          <rect x="10" y="10" width="60" height="100" rx="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
          <text x="40" y="55" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="8" font-family="var(--font-heading)">
            ${splitTitle(displayTitle).map((line, i) => `<tspan x="40" dy="${i === 0 ? 0 : 11}">${Alcove.sanitize(line)}</tspan>`).join('')}
          </text>
        </svg>
      </div>
    `;
  }

  function splitTitle(title) {
    const words = title.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length > 12) {
        if (current) lines.push(current.trim());
        current = word;
      } else {
        current = (current + ' ' + word).trim();
      }
      if (lines.length >= 3) break;
    }
    if (current && lines.length < 4) lines.push(current.trim());
    return lines;
  }

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  function renderMiniStars(rating) {
    const pct = (rating / 5) * 100;
    return `
      <div class="mini-stars" aria-label="${rating} out of 5 stars">
        <div class="mini-stars-bg">★★★★★</div>
        <div class="mini-stars-fill" style="width: ${pct}%">★★★★★</div>
      </div>
    `;
  }

  function formatRating(rating) {
    if (!rating) return '';
    const str = rating.toFixed(2);
    return str.replace(/\.?0+$/, '') || '0';
  }

  function renderGrid(books, options = {}) {
    if (!books || books.length === 0) {
      return `
        <div class="empty-state">
          ${Alcove.mascot ? Alcove.mascot.render(100, 'searching') : ''}
          <h3>No books found</h3>
          <p>Try a different search or browse by genre.</p>
        </div>
      `;
    }
    return `
      <div class="book-grid">
        ${books.map(b => render(b, options)).join('')}
      </div>
    `;
  }

  function renderSkeletons(count = 8) {
    return `
      <div class="book-grid">
        ${Array(count).fill('').map(() => `
          <div class="book-card book-card-skeleton">
            <div class="book-card-cover skeleton-pulse"></div>
            <div class="book-card-info">
              <div class="skeleton-line skeleton-pulse" style="width: 80%"></div>
              <div class="skeleton-line skeleton-pulse" style="width: 60%"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  Alcove.bookCard = { render, renderGrid, renderSkeletons, placeholder, formatRating, renderMiniStars };
})();
