window.Alcove = window.Alcove || {};

(function() {
  async function init() {
    // Apply saved theme
    applyTheme(Alcove.store.get('settings.theme'));

    // Initialize auth if configured
    if (Alcove.auth && Alcove.isSupabaseConfigured && Alcove.isSupabaseConfigured()) {
      await Alcove.auth.init();

      // Listen for auth state changes
      Alcove.auth.onAuthStateChange((event, session) => {
        // Re-render navbar on auth change
        if (Alcove.navbar) Alcove.navbar.render();

        // Redirect based on auth state
        if (event === 'SIGNED_OUT') {
          Alcove.router.navigate('/login');
        } else if (event === 'SIGNED_IN') {
          const currentPath = window.location.hash.replace('#', '') || '/';
          if (currentPath === '/login' || currentPath === '/forgot-password') {
            Alcove.router.navigate('/');
          }

          // Check if new user needs onboarding
          checkAuthOnboarding();
        }
      });
    }

    // Render navbar
    if (Alcove.navbar) {
      Alcove.navbar.render();
    }

    // Setup mobile nav toggle
    setupMobileNav();

    // Register routes
    registerRoutes();

    // Start router
    Alcove.router.init();

    // Show onboarding if first visit and not using Supabase auth
    // (with Supabase, onboarding happens after first sign in)
    const isConfigured = Alcove.isSupabaseConfigured && Alcove.isSupabaseConfigured();
    if (!isConfigured && Alcove.store.isFirstVisit()) {
      setTimeout(() => showOnboarding(), 300);
    }
  }

  function applyTheme(theme) {
    // Remove all theme classes first
    document.body.classList.remove('paper-theme', 'dark-theme', 'sage-theme', 'sky-theme');

    // Default to 'paper' theme if no theme is set, also handle legacy 'pages' name
    let effectiveTheme = theme || 'paper';
    if (effectiveTheme === 'pages') effectiveTheme = 'paper';

    // Apply the appropriate theme
    if (effectiveTheme === 'paper' || effectiveTheme === 'dark' || effectiveTheme === 'sage' || effectiveTheme === 'sky') {
      document.body.classList.add(`${effectiveTheme}-theme`);
    }
    // 'light' (Cream) theme uses default CSS variables (no class needed)
  }

  function registerRoutes() {
    const r = Alcove.router;
    // Auth routes
    r.register('/login', Alcove.pages.login);
    r.register('/forgot-password', Alcove.pages.forgotPassword);
    // App routes
    r.register('/', Alcove.pages.home);
    r.register('/search', Alcove.pages.search);
    r.register('/book/:id', Alcove.pages.bookDetail);
    r.register('/shelves', Alcove.pages.shelves);
    r.register('/shelf/:name', Alcove.pages.shelfDetail);
    r.register('/quotes', Alcove.pages.quotes);
    r.register('/friends', Alcove.pages.friends);
    r.register('/profile', Alcove.pages.profile);
    r.register('/stats', Alcove.pages.stats);
    r.register('/settings', Alcove.pages.settings);
    r.register('/tropes', Alcove.pages.tropeSearch);
    r.register('/discover-tropes', Alcove.pages.tropeBrowser);
  }

  function setupMobileNav() {
    const toggle = document.getElementById('mobile-nav-toggle');
    const nav = document.getElementById('main-nav');
    const backdrop = document.getElementById('nav-backdrop');

    if (toggle) {
      toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        backdrop.classList.toggle('visible');
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        nav.classList.remove('open');
        backdrop.classList.remove('visible');
      });
    }

    // Close mobile nav on route change
    window.addEventListener('hashchange', () => {
      nav.classList.remove('open');
      backdrop.classList.remove('visible');
    });
  }

  function showOnboarding() {
    if (!Alcove.modal) return;

    let step = 0;
    let userName = '';
    let selectedGenres = [];

    function renderStep() {
      if (step === 0) {
        Alcove.modal.open({
          title: '',
          content: `
            <div class="onboarding">
              <div class="onboarding-mascot">
                ${Alcove.mascot ? Alcove.mascot.render(120, 'waving') : ''}
              </div>
              <h2 class="onboarding-title">Welcome to Alcove</h2>
              <p class="onboarding-text">Your cozy corner for tracking books, saving quotes, and discovering your next great read.</p>
              <button class="btn btn-primary btn-lg onboarding-next" id="onboarding-next">Get Started</button>
            </div>
          `,
          closable: false,
          onInit() {
            document.getElementById('onboarding-next').addEventListener('click', () => {
              step = 1;
              renderStep();
            });
          }
        });
      } else if (step === 1) {
        Alcove.modal.open({
          title: '',
          content: `
            <div class="onboarding">
              <h2 class="onboarding-title">What should we call you?</h2>
              <p class="onboarding-text">We'll use this to greet you when you visit.</p>
              <input type="text" class="input input-lg" id="onboarding-name" placeholder="Enter your name" maxlength="30" autofocus>
              <button class="btn btn-primary btn-lg onboarding-next" id="onboarding-next" style="margin-top: var(--space-md);">Continue</button>
            </div>
          `,
          closable: false,
          onInit() {
            const input = document.getElementById('onboarding-name');
            const btn = document.getElementById('onboarding-next');
            input.focus();
            function proceed() {
              userName = input.value.trim() || 'Reader';
              step = 2;
              renderStep();
            }
            btn.addEventListener('click', proceed);
            input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') proceed();
            });
          }
        });
      } else if (step === 2) {
        Alcove.modal.open({
          title: '',
          content: `
            <div class="onboarding">
              <h2 class="onboarding-title">Pick your favorite genres</h2>
              <p class="onboarding-text">We'll use these to recommend books. Select as many as you like.</p>
              <div id="onboarding-genres"></div>
              <button class="btn btn-primary btn-lg onboarding-next" id="onboarding-next" style="margin-top: var(--space-lg);">Finish Setup</button>
            </div>
          `,
          closable: false,
          onInit() {
            if (Alcove.genrePicker) {
              Alcove.genrePicker.render('onboarding-genres', selectedGenres, (genres) => {
                selectedGenres = genres;
              });
            }
            document.getElementById('onboarding-next').addEventListener('click', () => {
              // Save user data
              Alcove.store.set('user.name', userName);
              Alcove.store.set('user.favoriteGenres', selectedGenres);
              Alcove.store.set('user.createdAt', new Date().toISOString());
              Alcove.modal.close();

              // Refresh the page
              if (Alcove.navbar) Alcove.navbar.render();
              Alcove.router.handleRoute();

              if (Alcove.toast) {
                Alcove.toast.show(`Welcome to Alcove, ${userName}!`, 'success');
              }
            });
          }
        });
      }
    }

    renderStep();
  }

  async function checkAuthOnboarding() {
    try {
      const profile = await Alcove.auth.getProfile();
      if (profile && (!profile.favorite_genres || profile.favorite_genres.length === 0)) {
        // New user - show onboarding after a short delay
        setTimeout(() => showAuthOnboarding(), 500);
      }
    } catch (err) {
      console.error('Alcove: Failed to check onboarding status', err);
    }
  }

  function showAuthOnboarding() {
    if (!Alcove.modal) return;

    const totalSteps = 5;
    let step = 0;
    let userName = '';
    let selectedGenres = [];
    let selectedTopBooks = [];
    let importCompleted = false;

    function renderDots(currentStep) {
      return `<div class="onboarding-progress">
        ${Array.from({ length: totalSteps }, (_, i) => {
          const cls = i === currentStep ? 'active' : i < currentStep ? 'completed' : '';
          return `<div class="onboarding-dot ${cls}"></div>`;
        }).join('')}
      </div>`;
    }

    function renderStep() {
      if (step === 0) {
        // Step 1: Name
        const currentUser = Alcove.auth.getCurrentUser();
        const metaName = currentUser?.user_metadata?.name || '';

        Alcove.modal.open({
          title: '',
          content: `
            <div class="onboarding">
              ${renderDots(0)}
              <div class="onboarding-mascot">
                ${Alcove.mascot ? Alcove.mascot.render(120, 'waving') : ''}
              </div>
              <h2 class="onboarding-title">Welcome to Alcove!</h2>
              <p class="onboarding-text">Let's set up your reading sanctuary. What should we call you?</p>
              <input type="text" class="input input-lg" id="onboarding-name" placeholder="Enter your name" maxlength="30" value="${Alcove.sanitize(metaName)}" autofocus>
              <div class="onboarding-actions">
                <button class="btn btn-primary btn-lg" id="onboarding-next">Continue</button>
              </div>
            </div>
          `,
          closable: false,
          onInit() {
            const input = document.getElementById('onboarding-name');
            const btn = document.getElementById('onboarding-next');
            input.focus();
            if (metaName) input.select();
            function proceed() {
              userName = input.value.trim() || 'Reader';
              step = 1;
              renderStep();
            }
            btn.addEventListener('click', proceed);
            input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') proceed();
            });
          }
        });
      } else if (step === 1) {
        // Step 2: Genres
        Alcove.modal.open({
          title: '',
          content: `
            <div class="onboarding">
              ${renderDots(1)}
              <h2 class="onboarding-title">Pick your favorite genres</h2>
              <p class="onboarding-text">We'll use these to recommend books. Select as many as you like.</p>
              <div id="onboarding-genres"></div>
              <div class="onboarding-actions">
                <button class="btn btn-primary btn-lg" id="onboarding-next">Continue</button>
              </div>
            </div>
          `,
          closable: false,
          onInit() {
            if (Alcove.genrePicker) {
              Alcove.genrePicker.render('onboarding-genres', selectedGenres, (genres) => {
                selectedGenres = genres;
              });
            }
            document.getElementById('onboarding-next').addEventListener('click', () => {
              step = 2;
              renderStep();
            });
          }
        });
      } else if (step === 2) {
        // Step 3: Goodreads Import (optional)
        Alcove.modal.open({
          title: '',
          wide: true,
          content: `
            <div class="onboarding">
              ${renderDots(2)}
              <h2 class="onboarding-title">Import from Goodreads</h2>
              <p class="onboarding-text">Have a Goodreads account? Import your library to get started quickly.</p>

              <div id="onboarding-import-upload">
                <div class="onboarding-dropzone" id="onboarding-dropzone">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p>Drag & drop your <strong>goodreads_library_export.csv</strong> here</p>
                  <p style="font-size: 0.8rem; color: var(--color-stone);">or click to browse</p>
                  <input type="file" id="onboarding-file-input" accept=".csv" style="display: none;">
                </div>
                <p style="font-size: 0.8rem; color: var(--color-stone); margin-top: var(--space-sm);">
                  Export from <a href="https://www.goodreads.com/review/import" target="_blank" style="color: var(--color-burgundy);">goodreads.com/review/import</a>
                </p>
              </div>

              <div id="onboarding-import-progress" class="onboarding-import-progress" style="display: none;">
                <div style="margin-bottom: var(--space-md);">
                  ${Alcove.mascot ? Alcove.mascot.render(60, 'reading') : ''}
                </div>
                <p id="onboarding-import-title" style="font-weight: 600; color: var(--color-espresso);">Importing your books...</p>
                <div class="onboarding-progress-bar">
                  <div class="onboarding-progress-fill" id="onboarding-import-fill"></div>
                </div>
                <p id="onboarding-import-text" style="font-size: 0.85rem; color: var(--color-stone);"></p>
              </div>

              <div id="onboarding-import-done" style="display: none;">
                <div class="onboarding-import-result" id="onboarding-import-result"></div>
              </div>

              <div class="onboarding-actions">
                <button class="onboarding-skip" id="onboarding-skip">Skip this step</button>
                <button class="btn btn-primary btn-lg" id="onboarding-next" style="display: none;">Continue</button>
              </div>
            </div>
          `,
          closable: false,
          onInit() {
            const dropzone = document.getElementById('onboarding-dropzone');
            const fileInput = document.getElementById('onboarding-file-input');
            const skipBtn = document.getElementById('onboarding-skip');
            const nextBtn = document.getElementById('onboarding-next');

            // Skip button
            skipBtn.addEventListener('click', () => {
              step = 3;
              renderStep();
            });

            // Next button (shown after import completes)
            nextBtn.addEventListener('click', () => {
              step = 3;
              renderStep();
            });

            // File drop/click
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
              if (file) handleOnboardingImport(file, skipBtn, nextBtn);
            });
            fileInput.addEventListener('change', (e) => {
              const file = e.target.files[0];
              if (file) handleOnboardingImport(file, skipBtn, nextBtn);
            });
          }
        });
      } else if (step === 3) {
        // Step 4: Top 3 Books (conditional)
        const allShelves = Alcove.store.getAllShelves();
        const allBooks = [];
        const seenIds = new Set();
        for (const shelf of Object.values(allShelves)) {
          for (const bookId of shelf.bookIds) {
            if (!seenIds.has(bookId)) {
              seenIds.add(bookId);
              const book = Alcove.store.getCachedBook(bookId);
              if (book) allBooks.push(book);
            }
          }
        }

        // Skip if no books
        if (allBooks.length === 0) {
          step = 4;
          renderStep();
          return;
        }

        Alcove.modal.open({
          title: '',
          wide: true,
          content: `
            <div class="onboarding">
              ${renderDots(3)}
              <h2 class="onboarding-title">Choose Your Top 3 Books</h2>
              <p class="onboarding-text">Pick up to 3 favorites to display on your profile.</p>
              <div class="onboarding-selected-books" id="onboarding-selected-books"></div>
              <div class="onboarding-book-grid" id="onboarding-book-grid">
                ${allBooks.map(book => `
                  <div class="onboarding-book-item" data-book-id="${book.id}" title="${Alcove.sanitize(book.title)}">
                    ${book.thumbnail
                      ? `<img src="${book.thumbnail}" alt="${Alcove.sanitize(book.title)}">`
                      : `<div class="book-placeholder">${Alcove.sanitize(book.title)}</div>`}
                  </div>
                `).join('')}
              </div>
              <div class="onboarding-actions">
                <button class="onboarding-skip" id="onboarding-skip">Skip</button>
                <button class="btn btn-primary btn-lg" id="onboarding-next">Continue</button>
              </div>
            </div>
          `,
          closable: false,
          onInit() {
            const grid = document.getElementById('onboarding-book-grid');
            const selectedDisplay = document.getElementById('onboarding-selected-books');

            function updateSelectedDisplay() {
              if (selectedTopBooks.length === 0) {
                selectedDisplay.innerHTML = '<span style="color: var(--color-stone); font-size: 0.85rem;">Click books below to select them</span>';
              } else {
                selectedDisplay.innerHTML = selectedTopBooks.map((id, i) => {
                  const book = Alcove.store.getCachedBook(id);
                  return `<span class="onboarding-selected-chip">#${i + 1} ${Alcove.sanitize(book?.title || 'Unknown')}</span>`;
                }).join('');
              }

              // Update grid selection state
              grid.querySelectorAll('.onboarding-book-item').forEach(item => {
                const bookId = item.dataset.bookId;
                const idx = selectedTopBooks.indexOf(bookId);
                item.classList.toggle('selected', idx !== -1);
                const existingRank = item.querySelector('.onboarding-book-rank');
                if (existingRank) existingRank.remove();
                if (idx !== -1) {
                  const rank = document.createElement('div');
                  rank.className = 'onboarding-book-rank';
                  rank.textContent = idx + 1;
                  item.appendChild(rank);
                }
              });
            }

            updateSelectedDisplay();

            grid.addEventListener('click', (e) => {
              const item = e.target.closest('.onboarding-book-item');
              if (!item) return;
              const bookId = item.dataset.bookId;
              const idx = selectedTopBooks.indexOf(bookId);
              if (idx !== -1) {
                selectedTopBooks.splice(idx, 1);
              } else if (selectedTopBooks.length < 3) {
                selectedTopBooks.push(bookId);
              } else {
                if (Alcove.toast) Alcove.toast.show('You can only pick 3 books', 'info');
              }
              updateSelectedDisplay();
            });

            document.getElementById('onboarding-skip').addEventListener('click', () => {
              selectedTopBooks = [];
              step = 4;
              renderStep();
            });

            document.getElementById('onboarding-next').addEventListener('click', () => {
              step = 4;
              renderStep();
            });
          }
        });
      } else if (step === 4) {
        // Step 5: Walkthrough
        Alcove.modal.open({
          title: '',
          wide: true,
          content: `
            <div class="onboarding">
              ${renderDots(4)}
              <h2 class="onboarding-title">You're all set, ${Alcove.sanitize(userName)}!</h2>
              <p class="onboarding-text">Here's a quick look at what you can do in Alcove.</p>
              <div class="onboarding-features">
                <div class="onboarding-feature-item">
                  <div class="onboarding-feature-icon salmon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <div class="onboarding-feature-text">
                    <h4>Home</h4>
                    <p>Your reading dashboard with stats, streaks, and recommendations</p>
                  </div>
                </div>
                <div class="onboarding-feature-item">
                  <div class="onboarding-feature-icon salmon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                  </div>
                  <div class="onboarding-feature-text">
                    <h4>Browse Books</h4>
                    <p>Search millions of titles and discover new reads</p>
                  </div>
                </div>
                <div class="onboarding-feature-item">
                  <div class="onboarding-feature-icon blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                    </svg>
                  </div>
                  <div class="onboarding-feature-text">
                    <h4>My Shelves</h4>
                    <p>Organize books into Read, Currently Reading, To Read, and custom shelves</p>
                  </div>
                </div>
                <div class="onboarding-feature-item">
                  <div class="onboarding-feature-icon purple">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/>
                    </svg>
                  </div>
                  <div class="onboarding-feature-text">
                    <h4>Quotes</h4>
                    <p>Save your favorite passages from any book</p>
                  </div>
                </div>
                <div class="onboarding-feature-item">
                  <div class="onboarding-feature-icon purple">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                    </svg>
                  </div>
                  <div class="onboarding-feature-text">
                    <h4>Friends</h4>
                    <p>Connect with other readers and see what they're reading</p>
                  </div>
                </div>
                <div class="onboarding-feature-item">
                  <div class="onboarding-feature-icon purple">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div class="onboarding-feature-text">
                    <h4>Profile</h4>
                    <p>Your reading identity with top books, stats, and badges</p>
                  </div>
                </div>
              </div>
              <div class="onboarding-actions">
                <button class="btn btn-primary btn-lg" id="onboarding-finish">Start Reading!</button>
              </div>
            </div>
          `,
          closable: false,
          onInit() {
            document.getElementById('onboarding-finish').addEventListener('click', async () => {
              // Save to local store
              Alcove.store.set('user.name', userName);
              Alcove.store.set('user.favoriteGenres', selectedGenres);
              Alcove.store.set('user.createdAt', new Date().toISOString());
              if (selectedTopBooks.length > 0) {
                Alcove.store.setTopBooks(selectedTopBooks);
              }

              // Save to Supabase profile
              try {
                await Alcove.auth.updateProfile({
                  name: userName,
                  favorite_genres: selectedGenres,
                  top_books: selectedTopBooks,
                });
              } catch (err) {
                console.error('Alcove: Failed to save profile', err);
              }

              Alcove.modal.close();

              // Refresh
              if (Alcove.navbar) Alcove.navbar.render();
              Alcove.router.handleRoute();

              if (Alcove.toast) {
                Alcove.toast.show(`Welcome to Alcove, ${userName}!`, 'success');
              }
            });
          }
        });
      }
    }

    async function handleOnboardingImport(file, skipBtn, nextBtn) {
      if (!file.name.endsWith('.csv')) {
        if (Alcove.toast) Alcove.toast.show('Please select a CSV file', 'error');
        return;
      }

      // Show progress
      document.getElementById('onboarding-import-upload').style.display = 'none';
      document.getElementById('onboarding-import-progress').style.display = 'block';
      skipBtn.style.display = 'none';

      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvText = e.target.result;
        try {
          const results = await Alcove.goodreadsImport.importBooks(csvText, (progress) => {
            const pct = (progress.current / progress.total) * 100;
            document.getElementById('onboarding-import-fill').style.width = pct + '%';
            document.getElementById('onboarding-import-text').textContent =
              `${progress.current} of ${progress.total} — "${progress.title}"`;
          });

          // Show results
          document.getElementById('onboarding-import-progress').style.display = 'none';
          document.getElementById('onboarding-import-done').style.display = 'block';
          document.getElementById('onboarding-import-result').innerHTML = `
            <p style="font-weight: 600; color: var(--color-espresso); margin: 0 0 var(--space-xs);">Import complete!</p>
            <p style="margin: 0; color: var(--color-stone);"><strong>${results.imported}</strong> books imported${results.skipped > 0 ? `, ${results.skipped} skipped` : ''}</p>
          `;
          importCompleted = true;
          nextBtn.style.display = '';
        } catch (err) {
          console.error('Import failed:', err);
          if (Alcove.toast) Alcove.toast.show('Import failed: ' + err.message, 'error');
          document.getElementById('onboarding-import-progress').style.display = 'none';
          document.getElementById('onboarding-import-upload').style.display = 'block';
          skipBtn.style.display = '';
        }
      };
      reader.readAsText(file);
    }

    renderStep();
  }

  Alcove.app = { init, showOnboarding, showAuthOnboarding, applyTheme };

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
