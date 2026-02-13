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
              <svg viewBox="0 0 12 32" width="24" height="64" class="auth-logo-dots">
                <circle cx="6" cy="6" r="4" fill="#F5A07A"/>
                <circle cx="6" cy="16" r="4" fill="#7AB8F5"/>
                <circle cx="6" cy="26" r="4" fill="#6B3A5C"/>
              </svg>
              <span class="auth-logo-text">Alcove</span>
            </div>
            <p class="auth-subtitle">Your personal book sanctuary</p>
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

            <div class="auth-divider">
              <span>or</span>
            </div>

            <button type="button" class="btn btn-google btn-block" id="google-login-btn">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
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

        // Google sign-in
        const googleBtn = document.getElementById('google-login-btn');
        if (googleBtn) {
          googleBtn.addEventListener('click', async () => {
            try {
              await Alcove.auth.signInWithGoogle();
              // Redirect happens automatically
            } catch (error) {
              Alcove.toast.show(error.message || 'Failed to sign in with Google', 'error');
            }
          });
        }

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
            Alcove.toast.show('Account created! Check your email to confirm.', 'success');
            // Switch to login tab
            tabs[0].click();
          } catch (error) {
            Alcove.toast.show(error.message || 'Failed to create account', 'error');
          } finally {
            btn.disabled = false;
            btn.textContent = 'Create Account';
          }
        });
      }
    };
  }

  Alcove.pages.login = render;
})();
