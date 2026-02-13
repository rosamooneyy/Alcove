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

  // Simulated "community" vote distributions for each poll
  // These create realistic-looking results
  const SIMULATED_DISTRIBUTIONS = {
    'reading-spot': [25, 35, 28, 12],
    'book-format': [45, 30, 15, 10],
    'reading-time': [15, 20, 45, 20],
    'genre-mood': [28, 25, 30, 17],
    'reading-snack': [40, 25, 20, 15],
    'book-length': [15, 45, 25, 15],
    'reading-pace': [20, 35, 25, 20],
    'book-discovery': [30, 25, 25, 20],
    'rereading': [20, 40, 25, 15],
    'annotation': [15, 30, 35, 20],
    'series-standalone': [40, 25, 25, 10],
    'reading-weather': [45, 20, 20, 15],
    'book-buying': [30, 25, 20, 25],
    'dnf-books': [20, 30, 25, 25],
    'reading-goal': [35, 15, 35, 15],
    'book-covers': [30, 40, 15, 15],
    'reading-music': [35, 30, 15, 20],
    'bookmarks': [40, 30, 10, 20],
    'tbr-pile': [10, 25, 30, 35],
    'reading-slump': [30, 25, 25, 20],
    'book-adaptations': [50, 15, 25, 10]
  };

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

  // Get user's vote for today's poll
  function getUserVote() {
    const votes = Alcove.store.get('pollVotes') || {};
    return votes[getTodayKey()];
  }

  // Save user's vote
  function saveVote(optionIndex) {
    const votes = Alcove.store.get('pollVotes') || {};
    votes[getTodayKey()] = {
      pollId: getTodaysPoll().id,
      optionIndex: optionIndex,
      votedAt: new Date().toISOString()
    };
    Alcove.store.set('pollVotes', votes);
  }

  // Calculate display percentages (mix of simulated + user influence)
  function getResultPercentages(poll, userVoteIndex = null) {
    const baseDistribution = SIMULATED_DISTRIBUTIONS[poll.id] || [25, 25, 25, 25];

    // If user voted, slightly adjust the percentages to reflect their vote
    if (userVoteIndex !== null) {
      const adjusted = [...baseDistribution];
      // Add a small bump to the user's choice (simulating their contribution)
      adjusted[userVoteIndex] = Math.min(adjusted[userVoteIndex] + 2, 60);

      // Normalize to 100%
      const total = adjusted.reduce((a, b) => a + b, 0);
      return adjusted.map(v => Math.round((v / total) * 100));
    }

    return baseDistribution;
  }

  // Render the poll component
  function render() {
    const poll = getTodaysPoll();
    const userVote = getUserVote();
    const hasVoted = userVote && userVote.pollId === poll.id;

    if (hasVoted) {
      return renderResults(poll, userVote.optionIndex);
    }

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

  // Render results after voting
  function renderResults(poll, userVoteIndex) {
    const percentages = getResultPercentages(poll, userVoteIndex);
    const totalVotes = 1247 + Math.floor(Math.random() * 500); // Simulated total

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
        <p class="daily-poll-total">${totalVotes.toLocaleString()} readers voted</p>
      </div>
    `;
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
  function init() {
    const pollOptions = document.getElementById('poll-options');
    if (!pollOptions) return;

    pollOptions.addEventListener('click', (e) => {
      const button = e.target.closest('.daily-poll-option');
      if (!button) return;

      const index = parseInt(button.dataset.index, 10);
      saveVote(index);

      // Re-render the poll section
      const pollContainer = document.querySelector('.daily-poll');
      if (pollContainer) {
        const poll = getTodaysPoll();
        pollContainer.outerHTML = renderResults(poll, index);

        // Animate the bars
        requestAnimationFrame(() => {
          document.querySelectorAll('.daily-poll-result-bar').forEach(bar => {
            bar.style.transition = 'width 0.5s ease-out';
          });
        });
      }

      Alcove.toast.show('Thanks for voting!', 'success');
    });
  }

  Alcove.dailyPoll = { render, init };
})();
