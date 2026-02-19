// Login/Signup Page
window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  async function render() {
    const html = `
      <div class="auth-page animate-in">
        <div class="auth-container">
          <div class="auth-header">
            <div class="auth-logo">
              <svg viewBox="0 0 22 22" width="48" height="48" class="auth-logo-dots">
                <circle cx="5" cy="5" r="4" fill="#F5A07A"/>
                <circle cx="17" cy="5" r="4" fill="#7AB8F5"/>
                <circle cx="5" cy="17" r="4" fill="#6B3A5C"/>
              </svg>
              <span class="auth-logo-text">Alcove</span>
            </div>
            <p class="auth-subtitle">What your reading habits say about you</p>
          </div>

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
            <p>By continuing, you agree to our Terms of Service</p>
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
            // Show confirmation message in place of the signup form
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
