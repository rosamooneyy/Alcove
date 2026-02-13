// Forgot Password Page
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
            <h2>Reset Password</h2>
            <p class="auth-subtitle">Enter your email and we'll send you a reset link</p>
          </div>

          <form class="auth-form" id="reset-form">
            <div class="form-group">
              <label for="reset-email">Email</label>
              <input type="email" id="reset-email" required autocomplete="email" placeholder="you@example.com">
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="reset-btn">
              Send Reset Link
            </button>
            <a href="#/login" class="auth-link">Back to Sign In</a>
          </form>

          <div id="reset-success" class="auth-success hidden">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3>Check your email</h3>
            <p>We've sent a password reset link to your email address.</p>
            <a href="#/login" class="btn btn-secondary">Back to Sign In</a>
          </div>
        </div>
      </div>
    `;

    return {
      html,
      init: () => {
        const form = document.getElementById('reset-form');
        const successDiv = document.getElementById('reset-success');

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('reset-email').value;
          const btn = document.getElementById('reset-btn');

          btn.disabled = true;
          btn.textContent = 'Sending...';

          try {
            await Alcove.auth.resetPassword(email);
            form.classList.add('hidden');
            successDiv.classList.remove('hidden');
          } catch (error) {
            Alcove.toast.show(error.message || 'Failed to send reset email', 'error');
            btn.disabled = false;
            btn.textContent = 'Send Reset Link';
          }
        });
      }
    };
  }

  Alcove.pages.forgotPassword = render;
})();
