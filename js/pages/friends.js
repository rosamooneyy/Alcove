window.Alcove = window.Alcove || {};
window.Alcove.pages = window.Alcove.pages || {};

(function() {
  let searchTimeout = null;
  let currentTab = 'friends';

  async function render() {
    const html = `
      <div class="friends-page animate-in">
        <div class="friends-header">
          <h1>Friends</h1>
        </div>

        <div class="friends-tabs">
          <button class="friends-tab active" data-tab="friends">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Friends
          </button>
          <button class="friends-tab" data-tab="requests">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            Requests
            <span class="friends-tab-badge" id="requests-badge" style="display: none;">0</span>
          </button>
          <button class="friends-tab" data-tab="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Find Friends
          </button>
          <button class="friends-tab" data-tab="activity">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            Activity
          </button>
        </div>

        <div class="friends-content">
          <div class="friends-panel" id="panel-friends">
            <div class="friends-loading">Loading friends...</div>
          </div>
          <div class="friends-panel" id="panel-requests" style="display: none;">
            <div class="friends-loading">Loading requests...</div>
          </div>
          <div class="friends-panel" id="panel-search" style="display: none;">
            <div class="friends-search-box">
              <input type="text" id="friend-search-input" placeholder="Search by name..." class="input-field" />
            </div>
            <div id="search-results" class="friends-search-results"></div>
          </div>
          <div class="friends-panel" id="panel-activity" style="display: none;">
            <div class="friends-loading">Loading activity...</div>
          </div>
        </div>
      </div>
    `;

    return {
      html,
      init: initFriendsPage
    };
  }

  async function initFriendsPage() {
    // Bind tab clicks
    document.querySelectorAll('.friends-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Bind search input
    const searchInput = document.getElementById('friend-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => searchUsers(e.target.value), 300);
      });
    }

    // Load initial data
    await loadFriends();
    await loadPendingCount();
  }

  function switchTab(tab) {
    currentTab = tab;

    // Update active tab
    document.querySelectorAll('.friends-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });

    // Show/hide panels
    document.querySelectorAll('.friends-panel').forEach(p => {
      p.style.display = 'none';
    });
    document.getElementById(`panel-${tab}`).style.display = 'block';

    // Load data for tab
    switch (tab) {
      case 'friends':
        loadFriends();
        break;
      case 'requests':
        loadRequests();
        break;
      case 'activity':
        loadActivity();
        break;
      case 'search':
        document.getElementById('friend-search-input')?.focus();
        break;
    }
  }

  async function loadFriends() {
    const panel = document.getElementById('panel-friends');
    if (!panel) return;

    panel.innerHTML = '<div class="friends-loading">Loading friends...</div>';

    const friends = await Alcove.friends.getFriends();

    if (friends.length === 0) {
      panel.innerHTML = `
        <div class="friends-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <h3>No friends yet</h3>
          <p>Search for readers to connect with and share your reading journey.</p>
          <button class="btn btn-primary" onclick="document.querySelector('[data-tab=search]').click()">
            Find Friends
          </button>
        </div>
      `;
      return;
    }

    panel.innerHTML = `
      <div class="friends-list">
        ${friends.map(friend => renderFriendCard(friend)).join('')}
      </div>
    `;

    // Bind remove buttons
    panel.querySelectorAll('.friend-remove-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const friendshipId = btn.dataset.friendshipId;
        if (confirm('Remove this friend?')) {
          await Alcove.friends.removeFriend(friendshipId);
          await loadFriends();
          Alcove.toast.show('Friend removed', 'success');
        }
      });
    });
  }

  function renderFriendCard(friend) {
    const genres = (friend.favorite_genres || []).slice(0, 3);
    const genresHtml = genres.length > 0
      ? `<div class="friend-genres">${genres.map(g => `<span class="friend-genre-tag">${Alcove.sanitize(g)}</span>`).join('')}</div>`
      : '';

    return `
      <div class="friend-card">
        <div class="friend-avatar">${friend.name.charAt(0).toUpperCase()}</div>
        <div class="friend-info">
          <div class="friend-name">${Alcove.sanitize(friend.name)}</div>
          ${genresHtml}
        </div>
        <button class="btn btn-secondary btn-sm friend-remove-btn" data-friendship-id="${friend.friendshipId}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="18" y1="11" x2="23" y2="11"/>
          </svg>
          Remove
        </button>
      </div>
    `;
  }

  async function loadRequests() {
    const panel = document.getElementById('panel-requests');
    if (!panel) return;

    panel.innerHTML = '<div class="friends-loading">Loading requests...</div>';

    const [pending, sent] = await Promise.all([
      Alcove.friends.getPendingRequests(),
      Alcove.friends.getSentRequests()
    ]);

    if (pending.length === 0 && sent.length === 0) {
      panel.innerHTML = `
        <div class="friends-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          <h3>No pending requests</h3>
          <p>Friend requests you receive will appear here.</p>
        </div>
      `;
      return;
    }

    let html = '';

    if (pending.length > 0) {
      html += `
        <div class="requests-section">
          <h3>Received Requests</h3>
          <div class="requests-list">
            ${pending.map(req => `
              <div class="request-card">
                <div class="friend-avatar">${req.name.charAt(0).toUpperCase()}</div>
                <div class="friend-info">
                  <div class="friend-name">${Alcove.sanitize(req.name)}</div>
                  <div class="request-time">${Alcove.dateTime.timeAgo(req.requestedAt)}</div>
                </div>
                <div class="request-actions">
                  <button class="btn btn-primary btn-sm accept-btn" data-friendship-id="${req.friendshipId}">Accept</button>
                  <button class="btn btn-secondary btn-sm reject-btn" data-friendship-id="${req.friendshipId}">Decline</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (sent.length > 0) {
      html += `
        <div class="requests-section">
          <h3>Sent Requests</h3>
          <div class="requests-list">
            ${sent.map(req => `
              <div class="request-card">
                <div class="friend-avatar">${req.name.charAt(0).toUpperCase()}</div>
                <div class="friend-info">
                  <div class="friend-name">${Alcove.sanitize(req.name)}</div>
                  <div class="request-time">Sent ${Alcove.dateTime.timeAgo(req.requestedAt)}</div>
                </div>
                <button class="btn btn-secondary btn-sm cancel-btn" data-friendship-id="${req.friendshipId}">Cancel</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    panel.innerHTML = html;

    // Bind accept buttons
    panel.querySelectorAll('.accept-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const result = await Alcove.friends.acceptFriendRequest(btn.dataset.friendshipId);
        if (result.success) {
          Alcove.toast.show('Friend request accepted!', 'success');
          await loadRequests();
          await loadPendingCount();
        } else {
          Alcove.toast.show(result.error || 'Failed to accept request', 'error');
        }
      });
    });

    // Bind reject buttons
    panel.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const result = await Alcove.friends.rejectFriendRequest(btn.dataset.friendshipId);
        if (result.success) {
          Alcove.toast.show('Request declined', 'success');
          await loadRequests();
          await loadPendingCount();
        }
      });
    });

    // Bind cancel buttons
    panel.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const result = await Alcove.friends.cancelFriendRequest(btn.dataset.friendshipId);
        if (result.success) {
          Alcove.toast.show('Request cancelled', 'success');
          await loadRequests();
        }
      });
    });
  }

  async function loadPendingCount() {
    const count = await Alcove.friends.getPendingRequestCount();
    const badge = document.getElementById('requests-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }

  async function searchUsers(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    if (!query || query.trim().length < 2) {
      resultsContainer.innerHTML = `
        <div class="search-hint">
          <p>Enter at least 2 characters to search for friends.</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = '<div class="friends-loading">Searching...</div>';

    const users = await Alcove.friends.searchUsers(query);

    if (users.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          <p>No users found matching "${Alcove.sanitize(query)}"</p>
        </div>
      `;
      return;
    }

    // Get friendship status for each user
    const usersWithStatus = await Promise.all(
      users.map(async user => ({
        ...user,
        friendship: await Alcove.friends.getFriendshipStatus(user.id)
      }))
    );

    resultsContainer.innerHTML = `
      <div class="search-results-list">
        ${usersWithStatus.map(user => renderSearchResult(user)).join('')}
      </div>
    `;

    // Bind add friend buttons
    resultsContainer.querySelectorAll('.add-friend-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        btn.disabled = true;
        btn.textContent = 'Sending...';

        const result = await Alcove.friends.sendFriendRequest(userId);
        if (result.success) {
          Alcove.toast.show('Friend request sent!', 'success');
          btn.textContent = 'Request Sent';
          btn.classList.remove('btn-primary');
          btn.classList.add('btn-secondary');
        } else {
          Alcove.toast.show(result.error || 'Failed to send request', 'error');
          btn.disabled = false;
          btn.textContent = 'Add Friend';
        }
      });
    });
  }

  function renderSearchResult(user) {
    const genres = (user.favorite_genres || []).slice(0, 3);
    const genresHtml = genres.length > 0
      ? `<div class="friend-genres">${genres.map(g => `<span class="friend-genre-tag">${Alcove.sanitize(g)}</span>`).join('')}</div>`
      : '';

    let actionButton = '';
    if (user.friendship.status === 'accepted') {
      actionButton = '<span class="friend-status">Already friends</span>';
    } else if (user.friendship.status === 'pending') {
      if (user.friendship.isRequester) {
        actionButton = '<span class="friend-status">Request sent</span>';
      } else {
        actionButton = '<span class="friend-status">Wants to be friends</span>';
      }
    } else {
      actionButton = `
        <button class="btn btn-primary btn-sm add-friend-btn" data-user-id="${user.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Add Friend
        </button>
      `;
    }

    return `
      <div class="search-result-card">
        <div class="friend-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div class="friend-info">
          <div class="friend-name">${Alcove.sanitize(user.name)}</div>
          ${genresHtml}
        </div>
        ${actionButton}
      </div>
    `;
  }

  async function loadActivity() {
    const panel = document.getElementById('panel-activity');
    if (!panel) return;

    panel.innerHTML = '<div class="friends-loading">Loading activity...</div>';

    const activity = await Alcove.friends.getFriendActivity(50);

    if (activity.length === 0) {
      panel.innerHTML = `
        <div class="friends-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <h3>No activity yet</h3>
          <p>When your friends add books, rate them, or save quotes, you'll see their activity here.</p>
        </div>
      `;
      return;
    }

    panel.innerHTML = `
      <div class="activity-feed">
        ${activity.map(a => renderActivityItem(a)).join('')}
      </div>
    `;
  }

  function renderActivityItem(activity) {
    const userName = activity.user?.name || 'Someone';
    const bookTitle = activity.book?.title || 'a book';
    const bookId = activity.book?.id;
    const time = Alcove.dateTime.timeAgo(activity.createdAt);

    let icon = '';
    let text = '';

    switch (activity.type) {
      case 'shelved':
        icon = '&#128218;';
        const shelfName = activity.details?.shelfLabel || activity.details?.shelf || 'a shelf';
        text = `<strong>${Alcove.sanitize(userName)}</strong> added ${bookId ? `<a href="#/book/${bookId}">${Alcove.sanitize(bookTitle)}</a>` : Alcove.sanitize(bookTitle)} to <strong>${Alcove.sanitize(shelfName)}</strong>`;
        break;
      case 'rated':
        icon = '&#11088;';
        const rating = activity.details?.rating || '?';
        text = `<strong>${Alcove.sanitize(userName)}</strong> rated ${bookId ? `<a href="#/book/${bookId}">${Alcove.sanitize(bookTitle)}</a>` : Alcove.sanitize(bookTitle)} ${rating} stars`;
        break;
      case 'quoted':
        icon = '&#10077;';
        text = `<strong>${Alcove.sanitize(userName)}</strong> saved a quote from ${bookId ? `<a href="#/book/${bookId}">${Alcove.sanitize(bookTitle)}</a>` : Alcove.sanitize(bookTitle)}`;
        break;
      case 'reviewed':
        icon = '&#128221;';
        text = `<strong>${Alcove.sanitize(userName)}</strong> wrote a review for ${bookId ? `<a href="#/book/${bookId}">${Alcove.sanitize(bookTitle)}</a>` : Alcove.sanitize(bookTitle)}`;
        break;
      case 'finished':
        icon = '&#127942;';
        text = `<strong>${Alcove.sanitize(userName)}</strong> finished reading ${bookId ? `<a href="#/book/${bookId}">${Alcove.sanitize(bookTitle)}</a>` : Alcove.sanitize(bookTitle)}`;
        break;
      default:
        icon = '&#128214;';
        text = `<strong>${Alcove.sanitize(userName)}</strong> did something with ${bookId ? `<a href="#/book/${bookId}">${Alcove.sanitize(bookTitle)}</a>` : Alcove.sanitize(bookTitle)}`;
    }

    return `
      <div class="activity-item">
        <span class="activity-icon">${icon}</span>
        <span class="activity-text">${text}</span>
        <span class="activity-time">${time}</span>
      </div>
    `;
  }

  Alcove.pages.friends = render;
})();
