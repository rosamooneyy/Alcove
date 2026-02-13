window.Alcove = window.Alcove || {};

(function() {
  const ALL_GENRES = [
    'Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Romance',
    'Mystery', 'Thriller', 'Horror', 'Historical Fiction', 'Literary Fiction',
    'Biography', 'Memoir', 'Self-Help', 'Science', 'Philosophy',
    'Poetry', 'Graphic Novel', 'Young Adult', 'Children\'s', 'Classic',
    'Humor', 'Travel', 'Cooking', 'Art', 'Music',
    'Religion', 'Business', 'Technology', 'True Crime', 'Adventure',
  ];

  function render(containerId, selectedGenres = [], onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="chip-group">
        ${ALL_GENRES.map(genre => `
          <button class="chip genre-chip ${selectedGenres.includes(genre) ? 'selected' : ''}" data-genre="${genre}">
            ${genre}
          </button>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.genre-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
        const selected = getSelected(container);
        if (onChange) onChange(selected);
      });
    });
  }

  function getSelected(container) {
    const selected = [];
    container.querySelectorAll('.genre-chip.selected').forEach(chip => {
      selected.push(chip.dataset.genre);
    });
    return selected;
  }

  function renderDisplay(genres) {
    if (!genres || genres.length === 0) {
      return '<p style="color: var(--color-stone);">No favorite genres selected.</p>';
    }
    return `
      <div class="chip-group">
        ${genres.map(g => `<span class="chip selected" style="cursor: default; background-color: var(--color-sage); border-color: var(--color-sage);">${g}</span>`).join('')}
      </div>
    `;
  }

  Alcove.genrePicker = { render, renderDisplay, ALL_GENRES };
})();
