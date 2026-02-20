// Terms of Service & Privacy Policy Page
window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  async function render() {
    const lastUpdated = 'February 16, 2026';

    const html = `
      <div class="auth-page auth-page-simple animate-in" style="align-items: flex-start;">
        <div class="terms-page">
          <div class="terms-header">
            <a href="#/login" class="terms-back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </a>
            <div class="auth-logo">
              <svg viewBox="0 0 22 22" width="40" height="40" class="auth-logo-dots">
                <circle cx="5" cy="5" r="4" fill="#F5A07A"/>
                <circle cx="17" cy="5" r="4" fill="#7AB8F5"/>
                <circle cx="5" cy="17" r="4" fill="#6B3A5C"/>
              </svg>
              <span class="auth-logo-text">Alcove</span>
            </div>
          </div>

          <div class="terms-content">
            <h1>Terms of Service & Privacy Policy</h1>
            <p class="terms-updated">Last updated: ${lastUpdated}</p>

            <nav class="terms-nav">
              <a href="#terms-section">Terms of Service</a>
              <a href="#privacy-section">Privacy Policy</a>
              <a href="#data-section">Your Data</a>
              <a href="#contact-section">Contact</a>
            </nav>

            <!-- ==================== TERMS OF SERVICE ==================== -->
            <div id="terms-section">
              <h2>Terms of Service</h2>

              <h3>1. Acceptance of Terms</h3>
              <p>By creating an account or using Alcove, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the service.</p>

              <h3>2. What Alcove Is</h3>
              <p>Alcove is a personal book tracking platform that lets you organize your reading life. You can track books across shelves, rate and review them, discover your Reader DNA personality, tag and explore tropes, participate in daily polls, connect with friends, and import your reading history from GoodReads.</p>

              <h3>3. Your Account</h3>
              <ul>
                <li>You must provide a valid email address and choose a password to create an account.</li>
                <li>You are responsible for keeping your login credentials secure.</li>
                <li>You must be at least 13 years of age to use Alcove.</li>
                <li>One account per person. Do not share your account with others.</li>
              </ul>

              <h3>4. Your Content</h3>
              <p>You retain ownership of all content you create on Alcove, including reviews, quotes, ratings, and custom shelf names. By posting content, you grant Alcove a non-exclusive license to display that content within the service (for example, showing your review on a book's detail page or sharing your activity with friends you've accepted).</p>
              <p>You agree not to post content that is unlawful, abusive, defamatory, or infringes on the rights of others.</p>

              <h3>5. Community Features</h3>
              <p>Alcove includes community features where your contributions are aggregated with other users:</p>
              <ul>
                <li><strong>Trope tagging</strong> &mdash; When you tag a book with tropes, your tags contribute to community-wide trope counts visible to all users. Individual tags are not publicly attributed to you.</li>
                <li><strong>Completion statistics</strong> &mdash; Whether you completed or did not finish a book contributes to anonymous aggregate statistics (e.g., "78% of readers completed this book"). Your individual status is not publicly shown.</li>
                <li><strong>Daily polls</strong> &mdash; Your poll votes contribute to aggregate results. Individual votes are not publicly attributed.</li>
              </ul>

              <h3>6. Friends & Social Features</h3>
              <p>Alcove's friends system is opt-in. When you accept a friend request:</p>
              <ul>
                <li>Your friend can see your name, favorite genres, and Reader DNA type.</li>
                <li>Your reading activity (books shelved, rated, reviewed, finished) may appear in your friends' activity feeds.</li>
                <li>You can remove a friend at any time, which revokes their access to your activity.</li>
              </ul>
              <p>Your shelves, specific ratings, full reviews, quotes, and reading progress are private and not visible to other users.</p>

              <h3>7. Acceptable Use</h3>
              <p>You agree not to:</p>
              <ul>
                <li>Use the service for any unlawful purpose.</li>
                <li>Attempt to access another user's account or data.</li>
                <li>Interfere with or disrupt the service.</li>
                <li>Use automated tools to scrape or extract data from Alcove.</li>
                <li>Impersonate another person or entity.</li>
              </ul>

              <h3>8. Service Availability</h3>
              <p>Alcove is provided "as is" without warranties of any kind. We strive to keep the service available and reliable, but we do not guarantee uninterrupted access. We may modify, suspend, or discontinue features at any time.</p>

              <h3>9. Termination</h3>
              <p>You may stop using Alcove at any time. We reserve the right to suspend or terminate accounts that violate these terms. You can export your data from the Settings page before closing your account.</p>

              <h3>10. Changes to Terms</h3>
              <p>We may update these terms from time to time. If we make significant changes, we will notify users through the service. Continued use of Alcove after changes constitutes acceptance of the updated terms.</p>
            </div>

            <!-- ==================== PRIVACY POLICY ==================== -->
            <div id="privacy-section">
              <h2>Privacy Policy</h2>

              <h3>1. Information We Collect</h3>

              <h4>Account Information</h4>
              <ul>
                <li><strong>Email address</strong> &mdash; Used for authentication, password resets, and account recovery.</li>
                <li><strong>Display name</strong> &mdash; Visible to friends and in search results.</li>
                <li><strong>Password</strong> &mdash; Securely hashed. We never store or have access to your plain-text password.</li>
              </ul>

              <h4>Reading Data</h4>
              <ul>
                <li><strong>Book shelves</strong> &mdash; Which books you've added and how you've categorized them (Currently Reading, Want to Read, Read, Did Not Finish, custom shelves).</li>
                <li><strong>Ratings & reviews</strong> &mdash; Your star ratings and written reviews for books.</li>
                <li><strong>Reading progress</strong> &mdash; Current page, total pages, start and end dates, and completion status.</li>
                <li><strong>Quotes</strong> &mdash; Passages you save from books, along with page numbers and notes.</li>
              </ul>

              <h4>Preferences & Profile</h4>
              <ul>
                <li><strong>Favorite genres</strong> &mdash; Selected during onboarding, visible to friends.</li>
                <li><strong>Top books</strong> &mdash; Up to 3 books you choose to showcase.</li>
                <li><strong>Reader DNA type</strong> &mdash; Automatically calculated from your reading habits.</li>
                <li><strong>Theme preference</strong> &mdash; Your chosen visual theme.</li>
                <li><strong>Daily poll responses</strong> &mdash; Your votes on daily community polls.</li>
              </ul>

              <h4>Activity Data</h4>
              <ul>
                <li>We log reading activities (e.g., shelving a book, completing a book, adding a rating) to power your activity feed and statistics. Your recent activity history is stored locally and synced to your account.</li>
              </ul>

              <h3>2. How We Store Your Data</h3>

              <h4>Local Storage</h4>
              <p>Alcove stores your data locally in your browser's localStorage. This means the app works offline and your data is available immediately without network requests. Local data stays on your device and is not accessible to us or anyone else.</p>

              <h4>Cloud Sync</h4>
              <p>When you create an account, your data is synced to our cloud database powered by <strong>Supabase</strong> (hosted on AWS infrastructure). This enables:</p>
              <ul>
                <li>Access to your data across devices.</li>
                <li>Community features (friends, tropes, polls, completion stats).</li>
                <li>Data persistence if you clear your browser.</li>
              </ul>
              <p>Cloud data is protected by row-level security policies, meaning users can only access their own data unless explicitly shared through features like the friends system.</p>

              <h3>3. Third-Party Services</h3>

              <table class="terms-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Purpose</th>
                    <th>Data Sent</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Supabase</strong></td>
                    <td>Authentication, cloud database, data sync</td>
                    <td>Account info, reading data, activity</td>
                  </tr>
                  <tr>
                    <td><strong>Open Library</strong></td>
                    <td>Book search and metadata</td>
                    <td>Search queries only (title, author, ISBN). No personal data.</td>
                  </tr>
                </tbody>
              </table>

              <p>We do not use any analytics services, advertising networks, or tracking pixels. We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>

              <h3>4. Cookies & Tracking</h3>
              <p>Alcove does not use cookies for tracking or advertising. The only data stored in your browser is:</p>
              <ul>
                <li><strong>localStorage</strong> &mdash; Your reading data and preferences.</li>
                <li><strong>Session tokens</strong> &mdash; Authentication tokens managed by Supabase to keep you signed in.</li>
              </ul>

              <h3>5. Data Shared with Other Users</h3>
              <p>Most of your data is private by default. The following may be visible to others:</p>

              <table class="terms-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Visibility</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Display name</td>
                    <td>Visible in friend search results</td>
                  </tr>
                  <tr>
                    <td>Favorite genres, Reader DNA type</td>
                    <td>Visible to accepted friends</td>
                  </tr>
                  <tr>
                    <td>Reading activity</td>
                    <td>Visible to accepted friends via activity feed</td>
                  </tr>
                  <tr>
                    <td>Trope tags, poll votes, completion status</td>
                    <td>Contribute to anonymous aggregates only</td>
                  </tr>
                  <tr>
                    <td>Shelves, ratings, reviews, quotes, progress</td>
                    <td>Private &mdash; never shared</td>
                  </tr>
                </tbody>
              </table>

              <h3>6. GoodReads Import</h3>
              <p>When you import your GoodReads data:</p>
              <ul>
                <li>Your CSV file is processed entirely in your browser. It is never uploaded to our servers.</li>
                <li>Book metadata is looked up via the Open Library API using ISBNs or title/author searches.</li>
                <li>Your imported ratings, reviews, and shelf assignments are stored in your Alcove account.</li>
                <li>No data is sent back to GoodReads.</li>
              </ul>

              <h3>7. Data Security</h3>
              <ul>
                <li>Passwords are hashed using industry-standard algorithms (bcrypt via Supabase).</li>
                <li>All data transmission uses HTTPS encryption.</li>
                <li>Database access is protected by row-level security policies.</li>
                <li>We do not store payment information (Alcove is free).</li>
              </ul>

              <h3>8. Children's Privacy</h3>
              <p>Alcove is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has created an account, please contact us and we will delete the account.</p>
            </div>

            <!-- ==================== YOUR DATA ==================== -->
            <div id="data-section">
              <h2>Your Data Rights</h2>

              <h3>Export Your Data</h3>
              <p>You can export all of your Alcove data at any time from <strong>Settings &rarr; Export Data</strong>. This downloads a JSON file containing your shelves, ratings, reviews, quotes, reading progress, and activity history.</p>

              <h3>Delete Your Data</h3>
              <p>You can clear all locally stored data from <strong>Settings &rarr; Clear All Data</strong>. To request deletion of your cloud account and all associated data, please contact us at the email below.</p>

              <h3>Data Portability</h3>
              <p>Your exported data is in a standard JSON format that can be re-imported into Alcove or used however you choose. Your data belongs to you.</p>
            </div>

            <!-- ==================== CONTACT ==================== -->
            <div id="contact-section">
              <h2>Contact Us</h2>
              <p>If you have questions about these terms, your privacy, or your data, you can reach us at:</p>
              <ul>
                <li>Instagram: <a href="https://instagram.com/alcove.book" target="_blank" rel="noopener noreferrer">@alcove.book</a></li>
                <li>LinkedIn: <a href="https://linkedin.com/company/alcovebooks" target="_blank" rel="noopener noreferrer">Alcove Books</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    return { html, init: () => {} };
  }

  Alcove.pages.terms = render;
})();
