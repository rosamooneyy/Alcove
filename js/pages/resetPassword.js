// Reset Password Page — handles the link from the password reset email
window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  async function render() {
    const html = `
      <div class="auth-page auth-page-simple animate-in">
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
            <h2>Set New Password</h2>
            <p class="auth-subtitle">Choose a new password for your account</p>
          </div>

          <form class="auth-form" id="new-password-form">
            <div class="form-group">
              <label for="new-password">New Password</label>
              <input type="password" id="new-password" required autocomplete="new-password" placeholder="At least 6 characters" minlength="6">
            </div>
            <div class="form-group">
              <label for="confirm-password">Confirm Password</label>
              <input type="password" id="confirm-password" required autocomplete="new-password" placeholder="Re-enter your password" minlength="6">
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="update-password-btn">
              Update Password
            </button>
          </form>

          <div id="password-success" class="auth-success hidden">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3>Password updated</h3>
            <p>Your password has been changed successfully. You can now sign in with your new password.</p>
            <a href="#/login" class="btn btn-primary">Sign In</a>
          </div>
        </div>
      </div>
    `;

    return {
      html,
      init: () => {
        const form = document.getElementById('new-password-form');
        const successDiv = document.getElementById('password-success');

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const newPassword = document.getElementById('new-password').value;
          const confirmPassword = document.getElementById('confirm-password').value;
          const btn = document.getElementById('update-password-btn');

          if (newPassword !== confirmPassword) {
            Alcove.toast.show('Passwords do not match', 'error');
            return;
          }

          btn.disabled = true;
          btn.textContent = 'Updating...';

          try {
            await Alcove.auth.updatePassword(newPassword);
            form.classList.add('hidden');
            successDiv.classList.remove('hidden');
          } catch (error) {
            Alcove.toast.show(error.message || 'Failed to update password', 'error');
            btn.disabled = false;
            btn.textContent = 'Update Password';
          }
        });
      }
    };
  }

  Alcove.pages.resetPassword = render;
})();
