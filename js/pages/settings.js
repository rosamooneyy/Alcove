window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  async function render() {
    const user = Alcove.store.get('user');
    const settings = Alcove.store.get('settings');
    const currentTheme = settings.theme || 'paper';
    const isPublic = await Alcove.auth.getProfilePrivacy();
    const goals = Alcove.store.getGoals();

    const themes = [
      { id: 'paper', name: 'Paper', bg: '#FFFFFF', accent: '#5C5C5C', text: '#1A1A1A' },
      { id: 'light', name: 'Cream', bg: '#FAF6F0', accent: '#8B6F4E', text: '#3E2C1C' },
      { id: 'dark', name: 'Dark', bg: '#1C1915', accent: '#B8976D', text: '#E8E2D9' },
      { id: 'sage', name: 'Sage', bg: '#F0F4ED', accent: '#6B7F5B', text: '#2C3B24' },
      { id: 'sky', name: 'Sky', bg: '#F0F5FA', accent: '#5B7A9B', text: '#1E3A54' },
    ];

    const html = `
      <div class="settings-page animate-in">
        <div class="page-header">
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Customize your Alcove experience</p>
        </div>

        <div class="settings-section card">
          <h3>Profile</h3>
          <div class="input-group">
            <label class="input-label" for="settings-name">Display Name</label>
            <input type="text" class="input" id="settings-name" value="${Alcove.sanitize(user.name)}" maxlength="30">
          </div>
          <button class="btn btn-primary btn-sm" id="save-name-btn">Save Name</button>
        </div>

        <div class="settings-section card">
          <h3>Privacy</h3>
          <p style="color: var(--color-stone); margin-bottom: var(--space-md); font-size: 0.9rem;">
            Control who can see your reading activity.
          </p>
          <div class="privacy-toggle">
            <label class="toggle-switch">
              <input type="checkbox" id="privacy-toggle" ${isPublic ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
            <div class="toggle-label">
              <strong>Public Profile</strong>
              <p style="font-size: 0.85rem; color: var(--color-stone); margin: 4px 0 0 0;" id="privacy-description">
                ${isPublic
                  ? 'Your reading stats and activity are visible to other users.'
                  : 'Only your name is visible. Your reading data is private.'}
              </p>
            </div>
          </div>
        </div>

        <div class="settings-section card">
          <h3>Reading Goals</h3>
          <p style="color: var(--color-stone); margin-bottom: var(--space-md); font-size: 0.9rem;">
            Set daily, monthly, and yearly reading targets to stay motivated.
          </p>

          <div class="goals-settings">
            <div class="goal-setting-item">
              <label class="goal-setting-label">Daily Goal</label>
              <div class="goal-setting-inputs">
                <input
                  type="number"
                  class="input input-sm"
                  id="goal-daily-target"
                  value="${goals.dailyTarget}"
                  min="0"
                  placeholder="0"
                  style="width: 100px;"
                >
                <select class="input input-sm" id="goal-daily-type" style="width: 120px;">
                  <option value="pages" ${goals.dailyType === 'pages' ? 'selected' : ''}>Pages</option>
                  <option value="minutes" ${goals.dailyType === 'minutes' ? 'selected' : ''}>Minutes</option>
                </select>
              </div>
              <p class="goal-setting-hint">Track your daily reading progress</p>
            </div>

            <div class="goal-setting-item">
              <label class="goal-setting-label">Monthly Goal</label>
              <div class="goal-setting-inputs">
                <input
                  type="number"
                  class="input input-sm"
                  id="goal-monthly-books"
                  value="${goals.monthlyBooks}"
                  min="0"
                  placeholder="0"
                  style="width: 100px;"
                >
                <span style="color: var(--color-stone); font-size: 0.9rem;">books per month</span>
              </div>
              <p class="goal-setting-hint">Finish this many books each month</p>
            </div>

            <div class="goal-setting-item">
              <label class="goal-setting-label">Yearly Goal</label>
              <div class="goal-setting-inputs">
                <input
                  type="number"
                  class="input input-sm"
                  id="goal-yearly-books"
                  value="${goals.yearlyBooks}"
                  min="0"
                  placeholder="0"
                  style="width: 100px;"
                >
                <span style="color: var(--color-stone); font-size: 0.9rem;">books per year</span>
              </div>
              <p class="goal-setting-hint">Your reading challenge for ${new Date().getFullYear()}</p>
            </div>
          </div>

          <button class="btn btn-primary btn-sm" id="save-goals-btn" style="margin-top: var(--space-md);">
            Save Goals
          </button>
        </div>

        <div class="settings-section card">
          <h3>Favorite Genres</h3>
          <p style="color: var(--color-stone); margin-bottom: var(--space-md); font-size: 0.9rem;">These are used for recommendations on your home page.</p>
          <div id="settings-genres"></div>
          <button class="btn btn-primary btn-sm" id="save-genres-btn" style="margin-top: var(--space-md);">Save Genres</button>
        </div>

        <div class="settings-section card">
          <h3>Theme</h3>
          <p style="color: var(--color-stone); margin-bottom: var(--space-md); font-size: 0.9rem;">Choose your reading nook's look and feel.</p>
          <div class="theme-picker">
            ${themes.map(t => `
              <button class="theme-option ${currentTheme === t.id ? 'active' : ''}" data-theme="${t.id}" aria-label="${t.name} theme">
                <div class="theme-preview" style="background: ${t.bg};">
                  <div class="theme-preview-owl" style="background: ${t.accent};"></div>
                  <div class="theme-preview-lines">
                    <span style="background: ${t.text}; opacity: 0.3;"></span>
                    <span style="background: ${t.text}; opacity: 0.2;"></span>
                  </div>
                </div>
                <span class="theme-name">${t.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="settings-section card">
          <h3>Import from Goodreads</h3>
          <p style="color: var(--color-stone); margin-bottom: var(--space-md); font-size: 0.9rem;">Import your existing library, ratings, and reviews from Goodreads.</p>
          <button class="btn btn-accent" id="goodreads-import-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Import from Goodreads
          </button>
        </div>

        <div class="settings-section card">
          <h3>Data Management</h3>
          <p style="color: var(--color-stone); margin-bottom: var(--space-md); font-size: 0.9rem;">Your data is stored locally in this browser.</p>
          <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="export-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Data
            </button>
            <button class="btn btn-secondary btn-sm" id="import-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Import Data
            </button>
            <button class="btn btn-danger btn-sm" id="clear-btn">Clear All Data</button>
          </div>
          <input type="file" id="import-file" accept=".json" style="display: none;">
        </div>
      </div>
    `;

    let selectedGenres = [...(user.favoriteGenres || [])];

    return {
      html,
      init() {
        // Genre picker
        if (Alcove.genrePicker) {
          Alcove.genrePicker.render('settings-genres', selectedGenres, (genres) => {
            selectedGenres = genres;
          });
        }

        // Save name
        document.getElementById('save-name-btn').addEventListener('click', () => {
          const name = document.getElementById('settings-name').value.trim() || 'Reader';
          Alcove.store.set('user.name', name);
          if (Alcove.navbar) Alcove.navbar.render();
          Alcove.toast.show('Name updated', 'success');
        });

        // Privacy toggle
        const privacyToggle = document.getElementById('privacy-toggle');
        const privacyDesc = document.getElementById('privacy-description');
        if (privacyToggle && privacyDesc) {
          privacyToggle.addEventListener('change', async () => {
            const isPublic = privacyToggle.checked;
            try {
              await Alcove.auth.setProfilePrivacy(isPublic);
              Alcove.toast.show(
                isPublic ? 'Profile is now public' : 'Profile is now private',
                'success'
              );
              // Update description text
              privacyDesc.textContent = isPublic
                ? 'Your reading stats and activity are visible to other users.'
                : 'Only your name is visible. Your reading data is private.';
            } catch (err) {
              console.error('Privacy update error:', err);
              Alcove.toast.show('Failed to update privacy setting', 'error');
              privacyToggle.checked = !isPublic; // Revert toggle on error
            }
          });
        }

        // Save goals
        document.getElementById('save-goals-btn').addEventListener('click', () => {
          const dailyType = document.getElementById('goal-daily-type').value;
          const dailyTarget = parseInt(document.getElementById('goal-daily-target').value) || 0;
          const monthlyBooks = parseInt(document.getElementById('goal-monthly-books').value) || 0;
          const yearlyBooks = parseInt(document.getElementById('goal-yearly-books').value) || 0;

          Alcove.store.setGoals({
            dailyType,
            dailyTarget,
            monthlyBooks,
            yearlyBooks,
          });

          Alcove.toast.show('Reading goals updated', 'success');
        });

        // Save genres
        document.getElementById('save-genres-btn').addEventListener('click', () => {
          Alcove.store.set('user.favoriteGenres', selectedGenres);
          Alcove.toast.show(`Saved ${selectedGenres.length} genres`, 'success');
        });

        // Theme picker
        document.querySelectorAll('.theme-option').forEach(btn => {
          btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            Alcove.store.set('settings.theme', theme);

            // Use the app's applyTheme function for consistency
            if (Alcove.app && Alcove.app.applyTheme) {
              Alcove.app.applyTheme(theme);
            }

            // Update active state
            document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const themeName = btn.querySelector('.theme-name').textContent;
            Alcove.toast.show(`Switched to ${themeName} theme`, 'info');
          });
        });

        // Export
        document.getElementById('export-btn').addEventListener('click', () => {
          const data = Alcove.store.exportData();
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `alcove-backup-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
          Alcove.toast.show('Data exported', 'success');
        });

        // Import
        const importFile = document.getElementById('import-file');
        document.getElementById('import-btn').addEventListener('click', () => {
          importFile.click();
        });

        importFile.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (Alcove.store.importData(ev.target.result)) {
              Alcove.toast.show('Data imported successfully', 'success');
              if (Alcove.navbar) Alcove.navbar.render();
              Alcove.router.handleRoute();
            } else {
              Alcove.toast.show('Failed to import data. Invalid format.', 'error');
            }
          };
          reader.readAsText(file);
        });

        // Clear
        document.getElementById('clear-btn').addEventListener('click', async () => {
          if (confirm('This will delete all your data including shelves, ratings, and quotes. This cannot be undone. Continue?')) {
            Alcove.store.clearAllData();

            // Also clear cloud data so it doesn't sync back
            if (Alcove.db?.clearAllCloudData) {
              try {
                await Alcove.db.clearAllCloudData();
              } catch (err) {
                console.error('Alcove: Failed to clear cloud data', err);
              }
            }

            Alcove.toast.show('All data cleared', 'info');
            if (Alcove.navbar) Alcove.navbar.render();
            Alcove.router.navigate('/');
          }
        });

        // Goodreads import
        document.getElementById('goodreads-import-btn').addEventListener('click', () => {
          if (Alcove.goodreadsImport) {
            Alcove.goodreadsImport.openImportModal();
          }
        });
      }
    };
  }

  Alcove.pages.settings = render;
})();
