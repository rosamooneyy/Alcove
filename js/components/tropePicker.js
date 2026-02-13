window.Alcove = window.Alcove || {};

(function() {
  /**
   * Trope Picker Component
   * Renders a categorized trope selector with search and custom trope support
   */
  function render(containerId, selectedTropes = [], customTropes = [], onChange) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('TropePicker: Container not found:', containerId);
      return;
    }

    let selected = [...(selectedTropes || [])];
    let custom = [...(customTropes || [])];
    let searchQuery = '';
    let expandedCategories = new Set(['romance', 'fantasy']);
    let showCustomInput = false;

    function renderPicker() {
      const allCustom = Alcove.store ? Alcove.store.getCustomTropes() : [];
      const tropesData = Alcove.TROPES || {};

      container.innerHTML = `
        <div class="trope-picker">
          <div class="trope-picker-search">
            <input type="text" class="input" id="${containerId}-search" placeholder="Search tropes..." value="${searchQuery}">
            <button type="button" class="btn btn-secondary btn-sm" id="${containerId}-add-custom" title="Add custom trope">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>

          ${showCustomInput ? `
            <div class="trope-custom-input-section">
              <div class="trope-custom-input-row">
                <input type="text" class="input input-sm" id="${containerId}-custom-name" placeholder="Enter custom trope name..." maxlength="50">
                <button type="button" class="btn btn-primary btn-sm" id="${containerId}-save-custom">Add</button>
                <button type="button" class="btn btn-ghost btn-sm" id="${containerId}-cancel-custom">Cancel</button>
              </div>
            </div>
          ` : ''}

          <div class="trope-picker-selected" id="${containerId}-selected">
            ${renderSelectedTropes()}
          </div>

          <div class="trope-picker-categories" id="${containerId}-categories">
            ${renderCategories(tropesData)}
          </div>

          ${allCustom.length > 0 ? `
            <div class="trope-picker-custom-section">
              <div class="trope-category-header" data-category="custom">
                <span class="trope-category-toggle">${expandedCategories.has('custom') ? '−' : '+'}</span>
                <span class="trope-category-label">Custom Tropes</span>
                <span class="trope-category-count">${allCustom.length}</span>
              </div>
              ${expandedCategories.has('custom') ? `
                <div class="trope-category-chips">
                  ${allCustom.map(t => renderTropeChip(t.id, t.label, '#888', custom.includes(t.id), true)).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      `;

      bindEvents();
    }

    function renderSelectedTropes() {
      const allSelected = [...selected, ...custom];
      if (allSelected.length === 0) {
        return '<span class="trope-picker-hint">Click on tropes below to select them...</span>';
      }

      return `<div class="trope-selected-chips">${allSelected.map(tropeId => {
        let label = tropeId;
        let color = '#888';

        if (Alcove.getTropeById) {
          const trope = Alcove.getTropeById(tropeId);
          if (trope) {
            label = trope.label;
            color = trope.categoryColor;
          } else if (Alcove.store) {
            const customTrope = Alcove.store.getCustomTropes().find(t => t.id === tropeId);
            if (customTrope) label = customTrope.label;
          }
        }

        return `<span class="trope-chip-selected" style="--chip-color: ${color}">
          ${label}
          <button type="button" class="trope-chip-remove-btn" data-trope="${tropeId}">&times;</button>
        </span>`;
      }).join('')}</div>`;
    }

    function renderCategories(tropesData) {
      if (!tropesData || Object.keys(tropesData).length === 0) {
        return '<p class="trope-picker-hint">No tropes available</p>';
      }

      return Object.entries(tropesData).map(([catId, category]) => {
        const filteredTropes = searchQuery
          ? category.tropes.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()))
          : category.tropes;

        if (searchQuery && filteredTropes.length === 0) return '';

        const isExpanded = expandedCategories.has(catId) || searchQuery.length > 0;

        return `
          <div class="trope-category" data-category="${catId}">
            <div class="trope-category-header" data-category="${catId}">
              <span class="trope-category-toggle">${isExpanded ? '−' : '+'}</span>
              <span class="trope-category-label" style="color: ${category.color}">${category.label}</span>
              <span class="trope-category-count">${filteredTropes.length}</span>
            </div>
            ${isExpanded ? `
              <div class="trope-category-chips">
                ${filteredTropes.map(t => renderTropeChip(t.id, t.label, category.color, selected.includes(t.id), false)).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    function renderTropeChip(id, label, color, isSelected, isCustom = false) {
      return `
        <button type="button" class="trope-chip-btn ${isSelected ? 'selected' : ''} ${isCustom ? 'custom' : ''}"
                data-trope="${id}" data-custom="${isCustom}" style="--chip-color: ${color}">
          ${label}
          ${isSelected ? '<span class="trope-check">✓</span>' : ''}
        </button>
      `;
    }

    function bindEvents() {
      // Search input
      const searchInput = document.getElementById(`${containerId}-search`);
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          renderPicker();
          // Re-focus after render
          setTimeout(() => {
            const newInput = document.getElementById(`${containerId}-search`);
            if (newInput) {
              newInput.focus();
              newInput.setSelectionRange(searchQuery.length, searchQuery.length);
            }
          }, 0);
        });
      }

      // Add custom trope button
      const addCustomBtn = document.getElementById(`${containerId}-add-custom`);
      if (addCustomBtn) {
        addCustomBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          showCustomInput = true;
          renderPicker();
          setTimeout(() => {
            const customInput = document.getElementById(`${containerId}-custom-name`);
            if (customInput) customInput.focus();
          }, 0);
        });
      }

      // Save custom trope
      const saveCustomBtn = document.getElementById(`${containerId}-save-custom`);
      if (saveCustomBtn) {
        saveCustomBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const input = document.getElementById(`${containerId}-custom-name`);
          const val = input ? input.value.trim() : '';
          if (!val) {
            if (Alcove.toast) Alcove.toast.show('Please enter a trope name', 'warning');
            return;
          }
          if (Alcove.store) {
            const tropeId = Alcove.store.addCustomTrope(val);
            if (!custom.includes(tropeId)) {
              custom.push(tropeId);
              if (onChange) onChange(selected, custom);
            }
            if (Alcove.toast) Alcove.toast.show(`Added "${val}"`, 'success');
          }
          showCustomInput = false;
          renderPicker();
        });
      }

      // Cancel custom trope
      const cancelCustomBtn = document.getElementById(`${containerId}-cancel-custom`);
      if (cancelCustomBtn) {
        cancelCustomBtn.addEventListener('click', (e) => {
          e.preventDefault();
          showCustomInput = false;
          renderPicker();
        });
      }

      // Category toggle
      container.querySelectorAll('.trope-category-header').forEach(header => {
        header.addEventListener('click', (e) => {
          e.preventDefault();
          const catId = header.dataset.category;
          if (expandedCategories.has(catId)) {
            expandedCategories.delete(catId);
          } else {
            expandedCategories.add(catId);
          }
          renderPicker();
        });
      });

      // Trope chip clicks
      container.querySelectorAll('.trope-chip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const tropeId = btn.dataset.trope;
          const isCustom = btn.dataset.custom === 'true';

          if (btn.classList.contains('selected')) {
            // Deselect
            if (isCustom) {
              custom = custom.filter(t => t !== tropeId);
            } else {
              selected = selected.filter(t => t !== tropeId);
            }
          } else {
            // Select
            if (isCustom) {
              if (!custom.includes(tropeId)) custom.push(tropeId);
            } else {
              if (!selected.includes(tropeId)) selected.push(tropeId);
            }
          }

          if (onChange) onChange(selected, custom);
          renderPicker();
        });
      });

      // Remove from selected display
      container.querySelectorAll('.trope-chip-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const tropeId = btn.dataset.trope;
          selected = selected.filter(t => t !== tropeId);
          custom = custom.filter(t => t !== tropeId);
          if (onChange) onChange(selected, custom);
          renderPicker();
        });
      });
    }

    renderPicker();
  }

  /**
   * Compact trope display for book cards and lists
   */
  function renderTropeChips(tropes, customTropes = [], maxDisplay = 5) {
    const allTropes = [...(tropes || []), ...(customTropes || [])];
    if (allTropes.length === 0) return '';

    const displayed = allTropes.slice(0, maxDisplay);
    const remaining = allTropes.length - maxDisplay;

    return displayed.map(tropeId => {
      let label = tropeId;
      let color = '#888';

      if (Alcove.getTropeById) {
        const trope = Alcove.getTropeById(tropeId);
        if (trope) {
          label = trope.label;
          color = trope.categoryColor;
        } else if (Alcove.store) {
          const customTrope = Alcove.store.getCustomTropes().find(t => t.id === tropeId);
          if (customTrope) label = customTrope.label;
        }
      }

      return `<span class="trope-badge" style="--badge-color: ${color}">${label}</span>`;
    }).join('') + (remaining > 0 ? `<span class="trope-badge more">+${remaining}</span>` : '');
  }

  /**
   * Get trope info with color for display
   */
  function getTropeDisplay(tropeId) {
    if (Alcove.getTropeById) {
      const trope = Alcove.getTropeById(tropeId);
      if (trope) return trope;
    }

    if (Alcove.store) {
      const customTrope = Alcove.store.getCustomTropes().find(t => t.id === tropeId);
      if (customTrope) {
        return {
          id: customTrope.id,
          label: customTrope.label,
          categoryId: 'custom',
          categoryLabel: 'Custom',
          categoryColor: '#888',
        };
      }
    }

    return { id: tropeId, label: tropeId, categoryId: 'unknown', categoryLabel: 'Unknown', categoryColor: '#888' };
  }

  Alcove.tropePicker = { render, renderTropeChips, getTropeDisplay };
})();
