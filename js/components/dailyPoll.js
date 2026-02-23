window.Alcove = window.Alcove || {};

(function() {
  // Collection of reading-related polls
  const POLLS = [
    {
      id: 'reading-spot',
      question: 'Where would you rather read?',
      options: ['At the beach', 'In bed', 'By a cozy fire', 'In a coffee shop']
    },
    {
      id: 'book-format',
      question: 'What is your preferred book format?',
      options: ['Physical book', 'E-reader', 'Audiobook', 'No preference']
    },
    {
      id: 'reading-time',
      question: 'When do you prefer to read?',
      options: ['Early morning', 'Afternoon', 'Before bed', 'Whenever I can']
    },
    {
      id: 'genre-mood',
      question: 'What genre matches your current mood?',
      options: ['Romance', 'Mystery/Thriller', 'Fantasy', 'Non-fiction']
    },
    {
      id: 'reading-snack',
      question: 'What\'s your ideal reading snack?',
      options: ['Tea or coffee', 'Chocolate', 'No snacks needed', 'A full meal']
    },
    {
      id: 'book-length',
      question: 'What book length do you prefer?',
      options: ['Short (under 200 pages)', 'Medium (200-400 pages)', 'Long (400+ pages)', 'The longer the better']
    },
    {
      id: 'reading-pace',
      question: 'How do you typically read a book?',
      options: ['Binge it in one sitting', 'A chapter a day', 'Multiple books at once', 'Whenever inspiration strikes']
    },
    {
      id: 'book-discovery',
      question: 'How do you usually discover new books?',
      options: ['Recommendations from friends', 'Online reviews', 'Browsing bookstores', 'Social media']
    },
    {
      id: 'rereading',
      question: 'Do you re-read books?',
      options: ['All the time', 'Only favorites', 'Rarely', 'Never - too many new books!']
    },
    {
      id: 'annotation',
      question: 'Do you annotate your books?',
      options: ['Yes, heavily', 'Just highlights', 'Never - books are sacred', 'Only in e-books']
    },
    {
      id: 'series-standalone',
      question: 'Series or standalone books?',
      options: ['Love a good series', 'Prefer standalones', 'Depends on my mood', 'No preference']
    },
    {
      id: 'reading-weather',
      question: 'Best weather for reading?',
      options: ['Rainy day', 'Sunny day', 'Snowy day', 'Any weather works']
    },
    {
      id: 'book-buying',
      question: 'How do you get most of your books?',
      options: ['Buy new', 'Library', 'Second-hand', 'Digital/subscription']
    },
    {
      id: 'dnf-books',
      question: 'Do you finish every book you start?',
      options: ['Always finish', 'Give it 100 pages', 'DNF freely', 'Depends on the book']
    },
    {
      id: 'reading-goal',
      question: 'Do you set reading goals?',
      options: ['Yes, yearly goals', 'Monthly goals', 'No goals, just vibes', 'Tried but gave up']
    },
    {
      id: 'book-covers',
      question: 'How much do covers influence you?',
      options: ['A lot - I judge books by covers', 'Somewhat', 'Not at all', 'Only for display purposes']
    },
    {
      id: 'reading-music',
      question: 'Music while reading?',
      options: ['Complete silence', 'Instrumental only', 'Any music is fine', 'Background noise/ambiance']
    },
    {
      id: 'bookmarks',
      question: 'What do you use as a bookmark?',
      options: ['Proper bookmarks', 'Random items', 'Dog-ear pages', 'I remember the page']
    },
    {
      id: 'tbr-pile',
      question: 'How big is your TBR pile?',
      options: ['Under 10 books', '10-50 books', '50-100 books', 'Lost count']
    },
    {
      id: 'reading-slump',
      question: 'How do you get out of a reading slump?',
      options: ['Re-read a favorite', 'Try a new genre', 'Take a break', 'Push through anyway']
    },
    {
      id: 'book-adaptations',
      question: 'Book or movie/TV adaptation first?',
      options: ['Always book first', 'Adaptation first', 'Doesn\'t matter', 'Avoid adaptations']
    }
  ];

  // Get today's poll based on the date
  function getTodaysPoll() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const pollIndex = dayOfYear % POLLS.length;
    return POLLS[pollIndex];
  }

  // Get the date key for today (used for storage)
  function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  }

  // Get a user-specific localStorage key for poll votes
  function getPollStorageKey() {
    const userId = Alcove.auth?.getCurrentUser()?.id;
    return userId ? `pollVotes_${userId}` : 'pollVotes';
  }

  // Get user's vote from localStorage (fast, for initial render)
  function getLocalVote() {
    const votes = Alcove.store.get(getPollStorageKey()) || {};
    return votes[getTodayKey()];
  }

  // Save user's vote to localStorage
  function saveLocalVote(optionIndex) {
    const key = getPollStorageKey();
    const votes = Alcove.store.get(key) || {};
    votes[getTodayKey()] = {
      pollId: getTodaysPoll().id,
      optionIndex: optionIndex,
      votedAt: new Date().toISOString()
    };
    Alcove.store.set(key, votes);
  }

  // Calculate percentages from real vote counts
  function calculatePercentages(poll, counts, total) {
    if (!total || total === 0) return poll.options.map(() => 0);

    return poll.options.map((_, index) => {
      const count = counts[index] || 0;
      return Math.round((count / total) * 100);
    });
  }

  // Render the poll component (initial synchronous render)
  function render() {
    const poll = getTodaysPoll();
    const localVote = getLocalVote();
    const hasVotedLocally = localVote && localVote.pollId === poll.id;

    if (hasVotedLocally) {
      // Show results placeholder - will be updated with real data in init()
      return renderResultsPlaceholder(poll, localVote.optionIndex);
    }

    return renderVotingUI(poll);
  }

  // Render the voting buttons
  function renderVotingUI(poll) {
    return `
      <div class="daily-poll card">
        <div class="daily-poll-header">
          <div class="daily-poll-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M18 20V10"/>
              <path d="M12 20V4"/>
              <path d="M6 20v-6"/>
            </svg>
          </div>
          <div class="daily-poll-title">
            <h3>Daily Poll</h3>
            <span class="daily-poll-date">${formatDate(new Date())}</span>
          </div>
        </div>
        <p class="daily-poll-question">${poll.question}</p>
        <div class="daily-poll-options" id="poll-options">
          ${poll.options.map((option, index) => `
            <button class="daily-poll-option" data-index="${index}">
              <span class="daily-poll-option-text">${option}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Render a placeholder while loading real results
  function renderResultsPlaceholder(poll, userVoteIndex) {
    return `
      <div class="daily-poll card">
        <div class="daily-poll-header">
          <div class="daily-poll-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M18 20V10"/>
              <path d="M12 20V4"/>
              <path d="M6 20v-6"/>
            </svg>
          </div>
          <div class="daily-poll-title">
            <h3>Daily Poll</h3>
            <span class="daily-poll-date">${formatDate(new Date())}</span>
          </div>
        </div>
        <p class="daily-poll-question">${poll.question}</p>
        <div class="daily-poll-results" id="poll-results">
          ${poll.options.map((option, index) => `
            <div class="daily-poll-result ${index === userVoteIndex ? 'user-vote' : ''}">
              <div class="daily-poll-result-bar" style="width: 0%;"></div>
              <span class="daily-poll-result-text">${option}</span>
              <span class="daily-poll-result-percent"></span>
              ${index === userVoteIndex ? '<span class="daily-poll-your-vote">Your vote</span>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Render results with real data
  function renderResults(poll, userVoteIndex, counts, total) {
    const percentages = calculatePercentages(poll, counts, total);

    return `
      <div class="daily-poll card">
        <div class="daily-poll-header">
          <div class="daily-poll-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M18 20V10"/>
              <path d="M12 20V4"/>
              <path d="M6 20v-6"/>
            </svg>
          </div>
          <div class="daily-poll-title">
            <h3>Daily Poll</h3>
            <span class="daily-poll-date">${formatDate(new Date())}</span>
          </div>
        </div>
        <p class="daily-poll-question">${poll.question}</p>
        <div class="daily-poll-results">
          ${poll.options.map((option, index) => `
            <div class="daily-poll-result ${index === userVoteIndex ? 'user-vote' : ''}">
              <div class="daily-poll-result-bar" style="width: ${percentages[index]}%;"></div>
              <span class="daily-poll-result-text">${option}</span>
              <span class="daily-poll-result-percent">${percentages[index]}%</span>
              ${index === userVoteIndex ? '<span class="daily-poll-your-vote">Your vote</span>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Update results in the DOM with real data
  function updateResultsUI(poll, userVoteIndex, counts, total) {
    const pollContainer = document.querySelector('.daily-poll');
    if (!pollContainer) return;

    pollContainer.outerHTML = renderResults(poll, userVoteIndex, counts, total);

    // Animate the bars
    requestAnimationFrame(() => {
      document.querySelectorAll('.daily-poll-result-bar').forEach(bar => {
        bar.style.transition = 'width 0.5s ease-out';
      });
    });
  }

  // Format date nicely
  function formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }

  // Initialize poll interactions
  async function init() {
    const poll = getTodaysPoll();
    const dateKey = getTodayKey();

    // Check cloud for user's vote (in case localStorage was cleared after logout)
    let userVoteIndex = null;
    const localVote = getLocalVote();
    const hasVotedLocally = localVote && localVote.pollId === poll.id;

    if (hasVotedLocally) {
      userVoteIndex = localVote.optionIndex;
    }

    // Try to load from cloud
    if (Alcove.isSupabaseConfigured && Alcove.isSupabaseConfigured() && Alcove.db) {
      try {
        // Check cloud for user's vote
        if (Alcove.auth?.isAuthenticated()) {
          const cloudVote = await Alcove.db.getUserPollVote(poll.id, dateKey);
          if (cloudVote !== null) {
            userVoteIndex = cloudVote;
            // Sync cloud vote back to localStorage
            if (!hasVotedLocally) {
              saveLocalVote(cloudVote);
            }
          }
        }

        // Load aggregate results if user has voted
        if (userVoteIndex !== null) {
          const results = await Alcove.db.getPollResults(poll.id, dateKey);
          const counts = results ? results.counts : { [userVoteIndex]: 1 };
          const total = results ? results.total : 1;
          updateResultsUI(poll, userVoteIndex, counts, total);
          return; // Already showing results, no need to bind vote handlers
        }
      } catch (err) {
        console.error('Failed to load poll data from cloud:', err);
      }
    }

    // If user already voted but no cloud data, show with local-only counts
    if (userVoteIndex !== null) {
      updateResultsUI(poll, userVoteIndex, { [userVoteIndex]: 1 }, 1);
      return;
    }

    // Bind voting handlers
    const pollOptions = document.getElementById('poll-options');
    if (!pollOptions) return;

    pollOptions.addEventListener('click', async (e) => {
      const button = e.target.closest('.daily-poll-option');
      if (!button) return;

      const index = parseInt(button.dataset.index, 10);

      // Save locally
      saveLocalVote(index);

      // Save to cloud
      if (Alcove.isSupabaseConfigured && Alcove.isSupabaseConfigured() && Alcove.db && Alcove.auth?.isAuthenticated()) {
        try {
          await Alcove.db.savePollVote(poll.id, dateKey, index);

          // Load real aggregate results
          const results = await Alcove.db.getPollResults(poll.id, dateKey);
          const counts = results ? results.counts : { [index]: 1 };
          const total = results ? results.total : 1;
          updateResultsUI(poll, index, counts, total);
        } catch (err) {
          console.error('Failed to save poll vote to cloud:', err);
          // Fallback: show with just this user's vote
          updateResultsUI(poll, index, { [index]: 1 }, 1);
        }
      } else {
        // No cloud - show with just this user's vote
        updateResultsUI(poll, index, { [index]: 1 }, 1);
      }

      Alcove.toast.show('Thanks for voting!', 'success');
    });
  }

  Alcove.dailyPoll = { render, init };
})();
