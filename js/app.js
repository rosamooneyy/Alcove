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

  Alcove.app = { init, showOnboarding, applyTheme };

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
