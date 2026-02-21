// Login/Signup Page
window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  let taglineInterval = null;
  let dnaInterval = null;

  const DNA_PROFILES = [
    { title: 'The Heart Reader', subtitle: 'Feeling every page', accent: '#9b6070',
      bars: [{ label: 'Emotional Intensity', pct: 92 }, { label: 'Fiction Ratio', pct: 88 }, { label: 'Engagement', pct: 70 }] },
    { title: 'The Escapist Explorer', subtitle: 'Lost in worlds unknown', accent: '#7a5c8e',
      bars: [{ label: 'Emotional Intensity', pct: 75 }, { label: 'Genre Diversity', pct: 50 }, { label: 'Fiction Ratio', pct: 90 }] },
    { title: 'The Strategic Thinker', subtitle: 'Knowledge is your superpower', accent: '#5b7a9b',
      bars: [{ label: 'Completion Rate', pct: 90 }, { label: 'Engagement', pct: 60 }, { label: 'Fiction Ratio', pct: 35 }] },
    { title: 'The Genre Nomad', subtitle: 'Every shelf is home', accent: '#5a7a4f',
      bars: [{ label: 'Genre Diversity', pct: 92 }, { label: 'Emotional Intensity', pct: 50 }, { label: 'Fiction Ratio', pct: 65 }] },
    { title: 'The Depth Seeker', subtitle: 'Quality over quantity', accent: '#8b6f5e',
      bars: [{ label: 'Completion Rate', pct: 95 }, { label: 'Engagement', pct: 85 }, { label: 'Fiction Ratio', pct: 75 }] },
    { title: 'The Curator', subtitle: 'Building the perfect library', accent: '#8b7a4a',
      bars: [{ label: 'Engagement', pct: 95 }, { label: 'Genre Diversity', pct: 70 }, { label: 'Completion Rate', pct: 85 }] },
  ];

  async function render() {
    // Clear any leftover intervals from previous render
    if (taglineInterval) { clearInterval(taglineInterval); taglineInterval = null; }
    if (dnaInterval) { clearInterval(dnaInterval); dnaInterval = null; }

    const html = `
      <div class="auth-page animate-in">
        <!-- Left: Feature Showcase -->
        <div class="auth-showcase">
          <div class="auth-showcase-inner">
            <div class="auth-showcase-header">
              <div class="auth-logo">
                <svg viewBox="0 0 22 22" width="48" height="48" class="auth-logo-dots">
                  <circle cx="5" cy="5" r="4" fill="#F5A07A"/>
                  <circle cx="17" cy="5" r="4" fill="#7AB8F5"/>
                  <circle cx="5" cy="17" r="4" fill="#6B3A5C"/>
                </svg>
                <span class="auth-logo-text">Alcove</span>
              </div>
              <div class="auth-tagline-rotator">
                <span class="tagline-active">What your reading habits say about you</span>
                <span>Track your reading life, one page at a time</span>
                <span>Discover your Reader DNA</span>
                <span>Tag tropes. Find your next obsession.</span>
                <span>Your personal reading statistics, visualized</span>
              </div>
            </div>

            <!-- Feature Highlight Cards -->
            <div class="auth-features-grid stagger-children">
              <div class="auth-feature-card">
                <div class="auth-feature-icon" style="background: rgba(196, 145, 155, 0.15); color: #9b6070;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h4 class="auth-feature-title">Reader DNA</h4>
                <p class="auth-feature-desc">Discover your unique reader personality</p>
              </div>
              <div class="auth-feature-card">
                <div class="auth-feature-icon" style="background: rgba(201, 168, 76, 0.15); color: #C9A84C;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28">
                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                  </svg>
                </div>
                <h4 class="auth-feature-title">Reading Stats</h4>
                <p class="auth-feature-desc">Visualize your reading journey</p>
              </div>
              <div class="auth-feature-card">
                <div class="auth-feature-icon" style="background: rgba(122, 46, 59, 0.12); color: #7A2E3B;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28">
                    <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M12 12h.01"/>
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                  </svg>
                </div>
                <h4 class="auth-feature-title">Trope Tagging</h4>
                <p class="auth-feature-desc">Tag tropes and find your next obsession</p>
              </div>
              <div class="auth-feature-card">
                <div class="auth-feature-icon" style="background: rgba(122, 139, 111, 0.15); color: #7A8B6F;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                  </svg>
                </div>
                <h4 class="auth-feature-title">Book Tracking</h4>
                <p class="auth-feature-desc">Organize shelves your way</p>
              </div>
            </div>

            <!-- Mini Reader DNA Preview -->
            <div class="auth-showcase-dna">
              <div class="auth-dna-preview">
                <span class="auth-dna-label">Your Reader Type</span>
                <span class="auth-dna-title">The Heart Reader</span>
                <span class="auth-dna-subtitle">Feeling every page</span>
                <div class="auth-dna-bars">
                  <div class="auth-dna-bar-row">
                    <span class="auth-dna-bar-label">Emotional Intensity</span>
                    <div class="auth-dna-bar"><div class="auth-dna-bar-fill" style="width: 92%; background: #9b6070;"></div></div>
                  </div>
                  <div class="auth-dna-bar-row">
                    <span class="auth-dna-bar-label">Fiction Ratio</span>
                    <div class="auth-dna-bar"><div class="auth-dna-bar-fill" style="width: 88%; background: #9b6070;"></div></div>
                  </div>
                  <div class="auth-dna-bar-row">
                    <span class="auth-dna-bar-label">Engagement</span>
                    <div class="auth-dna-bar"><div class="auth-dna-bar-fill" style="width: 70%; background: #9b6070;"></div></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Logo accent -->
            <div class="auth-showcase-mascot">
              ${Alcove.mascot ? Alcove.mascot.render(80) : ''}
            </div>
          </div>
        </div>

        <!-- Right: Auth Form -->
        <div class="auth-panel">
          <div class="auth-container">
            <!-- Mobile-only logo (hidden on desktop) -->
            <div class="auth-header auth-header-mobile">
              <div class="auth-logo">
                <svg viewBox="0 0 22 22" width="40" height="40" class="auth-logo-dots">
                  <circle cx="5" cy="5" r="4" fill="#F5A07A"/>
                  <circle cx="17" cy="5" r="4" fill="#7AB8F5"/>
                  <circle cx="5" cy="17" r="4" fill="#6B3A5C"/>
                </svg>
                <span class="auth-logo-text">Alcove</span>
              </div>
            </div>

            <h2 class="auth-heading">See what your books say about you</h2>

            <div class="auth-tabs">
              <button class="auth-tab active" data-tab="login">Sign In</button>
              <button class="auth-tab" data-tab="signup">Create Account</button>
            </div>

            <!-- Login Form -->
            <form class="auth-form" id="login-form">
              <div class="form-group">
                <label for="login-email">Email</label>
                <input type="email" id="login-email" required autocomplete="email" placeholder="you@example.com">
              </div>
              <div class="form-group">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" required autocomplete="current-password" placeholder="Your password">
              </div>
              <button type="submit" class="btn btn-primary btn-block" id="login-btn">
                Sign In
              </button>
              <a href="#/forgot-password" class="auth-link">Forgot your password?</a>
            </form>

            <!-- Signup Form -->
            <form class="auth-form hidden" id="signup-form">
              <div class="form-group">
                <label for="signup-name">Name</label>
                <input type="text" id="signup-name" required autocomplete="name" placeholder="Your name">
              </div>
              <div class="form-group">
                <label for="signup-email">Email</label>
                <input type="email" id="signup-email" required autocomplete="email" placeholder="you@example.com">
              </div>
              <div class="form-group">
                <label for="signup-password">Password</label>
                <input type="password" id="signup-password" required autocomplete="new-password" placeholder="At least 6 characters" minlength="6">
              </div>
              <button type="submit" class="btn btn-primary btn-block" id="signup-btn">
                Create Account
              </button>
            </form>

            <div class="auth-footer">
              <div class="auth-social-links">
                <a href="https://instagram.com/alcove.book" target="_blank" rel="noopener noreferrer" class="auth-social-link" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="5"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                <a href="https://linkedin.com/company/alcovebooks" target="_blank" rel="noopener noreferrer" class="auth-social-link" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
                    <rect x="2" y="2" width="20" height="20" rx="3"/>
                    <path d="M7 11v6M7 7v.01M11 11v6m0-3a3 3 0 016 0v3"/>
                  </svg>
                </a>
              </div>
              <p>By continuing, you agree to our <a href="#/terms" class="auth-link">Terms of Service</a></p>
            </div>
          </div>
        </div>
      </div>
    `;

    return {
      html,
      init: () => {
        // Tab switching
        const tabs = document.querySelectorAll('.auth-tab');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        tabs.forEach(tab => {
          tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tab.dataset.tab === 'login') {
              loginForm.classList.remove('hidden');
              signupForm.classList.add('hidden');
            } else {
              loginForm.classList.add('hidden');
              signupForm.classList.remove('hidden');
            }
          });
        });

        // Accessibility check
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Tagline rotation
        const taglines = document.querySelectorAll('.auth-tagline-rotator span');
        if (taglines.length > 1) {
          let current = 0;

          if (!prefersReducedMotion) {
            taglineInterval = setInterval(() => {
              // Self-clear if element is gone (SPA navigation)
              if (!document.querySelector('.auth-tagline-rotator')) {
                clearInterval(taglineInterval);
                taglineInterval = null;
                return;
              }
              const prev = current;
              current = (current + 1) % taglines.length;
              taglines[prev].classList.add('tagline-exit');
              taglines[prev].classList.remove('tagline-active');
              setTimeout(() => {
                taglines[prev].classList.remove('tagline-exit');
                taglines[current].classList.add('tagline-active');
              }, 400);
            }, 3500);
          }
        }

        // DNA card rotation
        const dnaCard = document.querySelector('.auth-dna-preview');
        if (dnaCard && !prefersReducedMotion) {
          let dnaIndex = 0;
          dnaInterval = setInterval(() => {
            if (!document.querySelector('.auth-dna-preview')) {
              clearInterval(dnaInterval);
              dnaInterval = null;
              return;
            }
            dnaIndex = (dnaIndex + 1) % DNA_PROFILES.length;
            const p = DNA_PROFILES[dnaIndex];
            dnaCard.classList.add('dna-fade-out');
            setTimeout(() => {
              dnaCard.querySelector('.auth-dna-title').textContent = p.title;
              dnaCard.querySelector('.auth-dna-subtitle').textContent = p.subtitle;
              dnaCard.style.borderLeftColor = p.accent;
              const fills = dnaCard.querySelectorAll('.auth-dna-bar-fill');
              const labels = dnaCard.querySelectorAll('.auth-dna-bar-label');
              p.bars.forEach((bar, i) => {
                if (fills[i]) { fills[i].style.width = bar.pct + '%'; fills[i].style.background = p.accent; }
                if (labels[i]) labels[i].textContent = bar.label;
              });
              dnaCard.classList.remove('dna-fade-out');
              dnaCard.classList.add('dna-fade-in');
              setTimeout(() => dnaCard.classList.remove('dna-fade-in'), 400);
            }, 350);
          }, 4000);
        }

        // Login form submission
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('login-email').value;
          const password = document.getElementById('login-password').value;
          const btn = document.getElementById('login-btn');

          btn.disabled = true;
          btn.textContent = 'Signing in...';

          try {
            await Alcove.auth.signIn(email, password);
            Alcove.toast.show('Welcome back!', 'success');
            Alcove.router.navigate('/');
          } catch (error) {
            Alcove.toast.show(error.message || 'Failed to sign in', 'error');
            btn.disabled = false;
            btn.textContent = 'Sign In';
          }
        });

        // Signup form submission
        signupForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = document.getElementById('signup-name').value;
          const email = document.getElementById('signup-email').value;
          const password = document.getElementById('signup-password').value;
          const btn = document.getElementById('signup-btn');

          btn.disabled = true;
          btn.textContent = 'Creating account...';

          try {
            await Alcove.auth.signUp(email, password, name);
            signupForm.innerHTML = `
              <div class="auth-confirm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="color: var(--accent-primary, #7AB8F5); margin-bottom: 1rem;">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 4L12 13 2 4"/>
                </svg>
                <h3 style="margin: 0 0 0.5rem;">Check your email</h3>
                <p style="color: var(--text-secondary); line-height: 1.6;">
                  We've sent a confirmation link to <strong>${Alcove.sanitize(email)}</strong>.
                  Click the link in the email to activate your account.
                </p>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.75rem;">
                  Don't see it? Check your spam or junk folder.
                </p>
              </div>
            `;
          } catch (error) {
            Alcove.toast.show(error.message || 'Failed to create account', 'error');
            btn.disabled = false;
            btn.textContent = 'Create Account';
          }
        });
      }
    };
  }

  Alcove.pages.login = render;
})();
