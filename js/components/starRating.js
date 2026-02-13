window.Alcove = window.Alcove || {};

(function() {
  let idCounter = 0;

  function create(bookId, options = {}) {
    const { readonly = false, size = 'medium', initialValue = 0, onChange } = options;
    const uniqueId = 'sr-' + (++idCounter);
    const currentRating = initialValue || Alcove.store.getRating(bookId) || 0;

    const starWidth = size === 'small' ? 78 : size === 'large' ? 182 : 130;
    const starHeight = size === 'small' ? 14 : size === 'large' ? 34 : 24;
    const unitW = starWidth / 5;

    // Build the star polygon points for each of the 5 stars
    function starPoints(offsetX, w) {
      const cx = offsetX + w / 2;
      const h = w;
      const pts = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 72 - 90) * Math.PI / 180;
        pts.push(`${cx + (w/2) * Math.cos(angle)},${h/2 + (w/2) * Math.sin(angle)}`);
        const inner = (i * 72 + 36 - 90) * Math.PI / 180;
        pts.push(`${cx + (w/5) * Math.cos(inner)},${h/2 + (w/5) * Math.sin(inner)}`);
      }
      return pts.join(' ');
    }

    const starsClipId = `clip-${uniqueId}`;
    let clipPolygons = '';
    for (let i = 0; i < 5; i++) {
      clipPolygons += `<polygon points="${starPoints(i * unitW, unitW)}"/>`;
    }

    const html = `
      <div class="star-rating star-rating--${size} ${readonly ? 'star-rating--readonly' : ''}" data-book-id="${bookId}" id="${uniqueId}">
        ${!readonly ? `<input type="range" min="0" max="5" step="0.25" value="${currentRating}"
          class="star-rating__input" aria-label="Rate this book from 0 to 5 stars" id="${uniqueId}-range">` : ''}
        <div class="star-rating__display" id="${uniqueId}-display" aria-hidden="true">
          <svg class="star-rating__stars" viewBox="0 0 ${starWidth} ${starHeight}" width="${starWidth}" height="${starHeight}">
            <defs>
              <clipPath id="${starsClipId}">
                ${clipPolygons}
              </clipPath>
            </defs>
            <rect width="${starWidth}" height="${starHeight}" fill="var(--color-fog)" clip-path="url(#${starsClipId})"/>
            <rect class="star-rating__fill" id="${uniqueId}-fill" width="${(currentRating / 5) * starWidth}" height="${starHeight}" fill="var(--color-gold)" clip-path="url(#${starsClipId})"/>
          </svg>
          <span class="star-rating__value" id="${uniqueId}-label">${currentRating > 0 ? formatRating(currentRating) : (readonly ? '' : 'Rate')}</span>
        </div>
      </div>
    `;

    function init() {
      const el = document.getElementById(uniqueId);
      if (!el || readonly) return;

      const display = document.getElementById(`${uniqueId}-display`);
      const fill = document.getElementById(`${uniqueId}-fill`);
      const label = document.getElementById(`${uniqueId}-label`);
      const range = document.getElementById(`${uniqueId}-range`);

      let committed = currentRating;

      function updateVisual(rating) {
        fill.setAttribute('width', String((rating / 5) * starWidth));
        label.textContent = rating > 0 ? formatRating(rating) : 'Rate';
      }

      display.addEventListener('mousemove', (e) => {
        const rect = display.querySelector('svg').getBoundingClientRect();
        const x = Math.max(0, e.clientX - rect.left);
        const raw = (x / rect.width) * 5;
        const snapped = Math.round(raw * 4) / 4;
        const clamped = Math.max(0, Math.min(5, snapped));
        updateVisual(clamped);
      });

      display.addEventListener('mouseleave', () => {
        updateVisual(committed);
      });

      display.addEventListener('click', (e) => {
        const rect = display.querySelector('svg').getBoundingClientRect();
        const x = Math.max(0, e.clientX - rect.left);
        const raw = (x / rect.width) * 5;
        const snapped = Math.round(raw * 4) / 4;
        const clamped = Math.max(0.25, Math.min(5, snapped));

        committed = clamped;
        range.value = clamped;
        updateVisual(clamped);

        if (onChange) {
          onChange(clamped);
        }
      });

      range.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        committed = val;
        updateVisual(val);
        if (onChange) onChange(val);
      });
    }

    return { html, init };
  }

  function formatRating(rating) {
    if (!rating && rating !== 0) return '';
    const str = rating.toFixed(2);
    return str.replace(/\.?0+$/, '') || '0';
  }

  Alcove.starRating = { create, formatRating };
})();
