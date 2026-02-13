window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  async function render() {
    const stats = Alcove.store.getTropeStats();
    const combos = Alcove.store.getPopularTropeCombos();
    const allTropes = Alcove.getAllTropes();

    const html = `
      <div class="trope-browser-page animate-in">
        <div class="page-header">
          <h1 class="page-title">Discover by Trope</h1>
          <p class="page-subtitle">Explore books through themes and tropes</p>
        </div>

        <!-- Quick Stats -->
        <div class="trope-stats-bar">
          <div class="trope-stat">
            <span class="trope-stat-value">${stats.totalTaggedBooks}</span>
            <span class="trope-stat-label">Books Tagged</span>
          </div>
          <div class="trope-stat">
            <span class="trope-stat-value">${Object.keys(stats.tropeCounts).length}</span>
            <span class="trope-stat-label">Tropes Used</span>
          </div>
          <div class="trope-stat">
            <span class="trope-stat-value">${combos.length}</span>
            <span class="trope-stat-label">Popular Combos</span>
          </div>
        </div>

        <!-- Trending Tropes -->
        <div class="trope-browser-section card">
          <div class="section-header">
            <h2 class="section-title">Trending in Your Library</h2>
            <a href="#/tropes" class="section-link">Search by tropes &rarr;</a>
          </div>
          ${stats.trendingTropes.length > 0 ? `
            <div class="trending-tropes-grid">
              ${stats.trendingTropes.map((t, i) => {
                const trope = Alcove.tropePicker.getTropeDisplay(t.id);
                const size = i < 3 ? 'large' : i < 8 ? 'medium' : 'small';
                return `
                  <a href="#/tropes?trope=${t.id}" class="trending-trope-card ${size}" style="--trope-color: ${trope.categoryColor}">
                    <span class="trending-trope-rank">#${i + 1}</span>
                    <span class="trending-trope-name">${trope.label}</span>
                    <span class="trending-trope-count">${t.count} book${t.count !== 1 ? 's' : ''}</span>
                    <span class="trending-trope-category">${trope.categoryLabel}</span>
                  </a>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="empty-state" style="padding: var(--space-xl);">
              <p>Start tagging books with tropes to see trending themes!</p>
              <a href="#/search" class="btn btn-primary" style="margin-top: var(--space-md);">Browse Books</a>
            </div>
          `}
        </div>

        <!-- Popular Combinations -->
        ${combos.length > 0 ? `
          <div class="trope-browser-section card">
            <h2 class="section-title">Popular Trope Combinations</h2>
            <p class="section-subtitle">These tropes often appear together</p>
            <div class="trope-combos-grid">
              ${combos.map(combo => {
                const trope1 = Alcove.tropePicker.getTropeDisplay(combo.tropes[0]);
                const trope2 = Alcove.tropePicker.getTropeDisplay(combo.tropes[1]);
                return `
                  <a href="#/tropes?trope=${combo.tropes[0]}&trope=${combo.tropes[1]}" class="trope-combo-card">
                    <div class="trope-combo-badges">
                      <span class="trope-badge" style="--badge-color: ${trope1.categoryColor}">${trope1.label}</span>
                      <span class="trope-combo-plus">+</span>
                      <span class="trope-badge" style="--badge-color: ${trope2.categoryColor}">${trope2.label}</span>
                    </div>
                    <span class="trope-combo-count">${combo.count} books</span>
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Trope Cloud -->
        <div class="trope-browser-section card">
          <h2 class="section-title">Trope Cloud</h2>
          <p class="section-subtitle">Size indicates popularity in your library</p>
          <div class="trope-cloud" id="trope-cloud">
            ${renderTropeCloud(stats.tropeCounts, allTropes)}
          </div>
        </div>

        <!-- Browse All Categories -->
        <div class="trope-browser-section">
          <h2 class="section-title">Browse All Tropes</h2>
          <p class="section-subtitle">Explore ${allTropes.length}+ tropes across ${Object.keys(Alcove.TROPES).length} categories</p>
          <div class="trope-categories-grid">
            ${Object.entries(Alcove.TROPES).map(([catId, category]) => {
              const usedCount = category.tropes.filter(t => stats.tropeCounts[t.id] > 0).length;
              return `
                <div class="trope-category-card card" data-category="${catId}">
                  <div class="trope-category-header-bar" style="background: ${category.color}"></div>
                  <h3 class="trope-category-title">${category.label}</h3>
                  <span class="trope-category-meta">${category.tropes.length} tropes · ${usedCount} used</span>
                  <div class="trope-category-preview">
                    ${category.tropes.slice(0, 6).map(t => {
                      const count = stats.tropeCounts[t.id] || 0;
                      return `
                        <a href="#/tropes?trope=${t.id}" class="trope-preview-badge ${count > 0 ? 'used' : ''}" style="--badge-color: ${category.color}">
                          ${t.label}
                          ${count > 0 ? `<span class="preview-count">${count}</span>` : ''}
                        </a>
                      `;
                    }).join('')}
                  </div>
                  <button class="btn btn-ghost btn-sm expand-category-btn" data-category="${catId}">
                    View all ${category.tropes.length} tropes
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Custom Tropes Section -->
        ${Alcove.store.getCustomTropes().length > 0 ? `
          <div class="trope-browser-section card">
            <h2 class="section-title">Your Custom Tropes</h2>
            <div class="custom-tropes-list">
              ${Alcove.store.getCustomTropes().map(t => {
                const count = stats.tropeCounts[t.id] || 0;
                return `
                  <a href="#/tropes?trope=${t.id}" class="trope-badge custom ${count > 0 ? 'used' : ''}" style="--badge-color: #888">
                    ${t.label}
                    ${count > 0 ? `<span class="preview-count">${count}</span>` : ''}
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    function renderTropeCloud(tropeCounts, allTropes) {
      const usedTropes = allTropes.filter(t => tropeCounts[t.id] > 0);

      if (usedTropes.length === 0) {
        return '<p class="trope-cloud-empty">Tag some books to see your trope cloud!</p>';
      }

      const maxCount = Math.max(...usedTropes.map(t => tropeCounts[t.id]));

      // Shuffle for visual interest
      const shuffled = [...usedTropes].sort(() => Math.random() - 0.5);

      return shuffled.map(trope => {
        const count = tropeCounts[trope.id];
        const size = 0.75 + (count / maxCount) * 1.25; // Scale from 0.75 to 2
        const opacity = 0.6 + (count / maxCount) * 0.4; // Scale from 0.6 to 1

        return `
          <a href="#/tropes?trope=${trope.id}"
             class="trope-cloud-word"
             style="font-size: ${size}rem; opacity: ${opacity}; color: ${trope.categoryColor}"
             title="${trope.label}: ${count} book${count !== 1 ? 's' : ''}">
            ${trope.label}
          </a>
        `;
      }).join(' ');
    }

    return {
      html,
      init() {
        // Expand category buttons
        document.querySelectorAll('.expand-category-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const catId = btn.dataset.category;
            showCategoryModal(catId);
          });
        });
      }
    };
  }

  function showCategoryModal(categoryId) {
    if (!Alcove.modal) return;

    const category = Alcove.TROPES[categoryId];
    if (!category) return;

    const stats = Alcove.store.getTropeStats();

    Alcove.modal.open({
      title: category.label,
      size: 'large',
      content: `
        <div class="category-modal-content">
          <p style="color: var(--color-stone); margin-bottom: var(--space-lg);">
            ${category.tropes.length} tropes in this category
          </p>
          <div class="category-tropes-list">
            ${category.tropes.map(t => {
              const count = stats.tropeCounts[t.id] || 0;
              return `
                <a href="#/tropes?trope=${t.id}" class="category-trope-item" onclick="Alcove.modal.close()">
                  <span class="trope-badge" style="--badge-color: ${category.color}">${t.label}</span>
                  <span class="category-trope-count">${count} book${count !== 1 ? 's' : ''}</span>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      `,
      actions: [
        { label: 'Close', className: 'btn-secondary', action: 'close' },
      ]
    });
  }

  Alcove.pages.tropeBrowser = render;
})();
