window.Alcove = window.Alcove || {};

(function() {
  const STORAGE_KEY = 'alcove_data';
  const SCHEMA_VERSION = 1;

  const defaultData = {
    _version: SCHEMA_VERSION,
    user: {
      name: 'Reader',
      createdAt: null,
      favoriteGenres: [],
      topBooks: [], // User's top 3 favorite books (array of bookIds)
    },
    shelves: {
      'read':              { label: 'Read',              builtIn: true, bookIds: [] },
      'to-read':           { label: 'To Read',           builtIn: true, bookIds: [] },
      'currently-reading': { label: 'Currently Reading', builtIn: true, bookIds: [] },
    },
    ratings: {},
    reviews: {},
    progress: {},  // Track reading progress: { bookId: { currentPage, totalPages, percentage, startedAt, completedAt } }
    quotes: [],
    bookCache: {},
    activity: [],
    // Trope system
    bookTropes: {},        // { bookId: { tropes: ['trope-id', ...], customTropes: ['custom-name', ...], taggedAt: date } }
    customTropes: [],      // User-created tropes not in predefined list
    tropeCollections: [],  // Saved trope combinations: { id, name, tropes: [], createdAt }
    settings: {
      theme: 'paper',
      showGreeting: true,
    }
  };

  let data = null;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        data = JSON.parse(raw);
        if (!data._version || data._version < SCHEMA_VERSION) {
          data = migrate(data);
        }
      } else {
        data = JSON.parse(JSON.stringify(defaultData));
      }
    } catch (e) {
      console.error('Alcove: Failed to load data, resetting.', e);
      data = JSON.parse(JSON.stringify(defaultData));
    }
  }

  function migrate(oldData) {
    // Migrate 'pages' theme to 'paper'
    if (oldData.settings && oldData.settings.theme === 'pages') {
      oldData.settings.theme = 'paper';
    }

    oldData._version = SCHEMA_VERSION;
    return oldData;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Alcove: Failed to save data.', e);
    }
  }

  function get(path) {
    const keys = path.split('.');
    let obj = data;
    for (const k of keys) {
      if (obj == null) return undefined;
      obj = obj[k];
    }
    return obj;
  }

  function set(path, value) {
    const keys = path.split('.');
    let obj = data;
    for (let i = 0; i < keys.length - 1; i++) {
      if (obj[keys[i]] == null) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    save();
  }

  // -- Book Cache --

  function cacheBook(book) {
    if (!book || !book.id) return;
    data.bookCache[book.id] = {
      id: book.id,
      title: book.title,
      authors: book.authors,
      thumbnail: book.thumbnail,
      categories: book.categories,
      cachedAt: new Date().toISOString(),
    };
    save();
  }

  function getCachedBook(bookId) {
    return data.bookCache[bookId] || null;
  }

  // -- Shelves --

  function addToShelf(shelfKey, bookId, bookMeta) {
    if (!data.shelves[shelfKey]) return false;
    if (data.shelves[shelfKey].bookIds.includes(bookId)) return false;
    data.shelves[shelfKey].bookIds.push(bookId);
    if (bookMeta) cacheBook(bookMeta);
    logActivity('shelved', { bookId, shelf: shelfKey });
    save();

    // Sync to cloud if authenticated
    if (Alcove.db?.useCloud()) {
      Alcove.db.addBookToShelf(shelfKey, bookMeta || { id: bookId });
    }

    return true;
  }

  function removeFromShelf(shelfKey, bookId) {
    if (!data.shelves[shelfKey]) return false;
    const idx = data.shelves[shelfKey].bookIds.indexOf(bookId);
    if (idx === -1) return false;
    data.shelves[shelfKey].bookIds.splice(idx, 1);
    save();

    // Sync to cloud if authenticated
    if (Alcove.db?.useCloud()) {
      Alcove.db.removeBookFromShelf(shelfKey, bookId);
    }

    return true;
  }

  function createShelf(label) {
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (data.shelves[key]) return null;
    data.shelves[key] = { label, builtIn: false, bookIds: [] };
    save();

    // Sync to cloud if authenticated
    if (Alcove.db?.useCloud()) {
      Alcove.db.createShelf(key, label);
    }

    return key;
  }

  function deleteShelf(shelfKey) {
    if (!data.shelves[shelfKey] || data.shelves[shelfKey].builtIn) return false;
    delete data.shelves[shelfKey];
    save();

    // Sync to cloud if authenticated
    if (Alcove.db?.useCloud()) {
      Alcove.db.deleteShelf(shelfKey);
    }

    return true;
  }

  function getShelfBooks(shelfKey) {
    if (!data.shelves[shelfKey]) return [];
    return data.shelves[shelfKey].bookIds.map(id => getCachedBook(id)).filter(Boolean);
  }

  function findBookShelves(bookId) {
    const result = [];
    for (const [key, shelf] of Object.entries(data.shelves)) {
      if (shelf.bookIds.includes(bookId)) {
        result.push(key);
      }
    }
    return result;
  }

  function getAllShelves() {
    return data.shelves;
  }

  // Helper: Auto-add book to "Read" shelf (called when rating or reviewing)
  function autoAddToReadShelf(bookId, bookMeta) {
    if (!data.shelves['read'].bookIds.includes(bookId)) {
      data.shelves['read'].bookIds.push(bookId);
      if (bookMeta) cacheBook(bookMeta);
      // Remove from "to-read" and "currently-reading" if present
      removeFromShelfSilent('to-read', bookId);
      removeFromShelfSilent('currently-reading', bookId);
    }
  }

  // Silent removal (no save, used internally)
  function removeFromShelfSilent(shelfKey, bookId) {
    if (!data.shelves[shelfKey]) return;
    const idx = data.shelves[shelfKey].bookIds.indexOf(bookId);
    if (idx !== -1) {
      data.shelves[shelfKey].bookIds.splice(idx, 1);
    }
  }

  // -- Ratings --

  function setRating(bookId, rating, bookMeta) {
    data.ratings[bookId] = { rating, ratedAt: new Date().toISOString() };
    if (bookMeta) cacheBook(bookMeta);

    // Auto-add to "Read" shelf when rating (user has read the book)
    autoAddToReadShelf(bookId, bookMeta);

    logActivity('rated', { bookId, rating });
    save();

    // Sync to cloud if authenticated
    if (Alcove.db?.useCloud()) {
      Alcove.db.setRating(bookId, rating, bookMeta);
      Alcove.db.addBookToShelf('read', bookMeta || { id: bookId });
    }
  }

  function getRating(bookId) {
    return data.ratings[bookId] ? data.ratings[bookId].rating : null;
  }

  function getAllRatings() {
    return data.ratings;
  }

  // -- Quotes --

  function addQuote(quoteObj) {
    const quote = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      bookId: quoteObj.bookId,
      bookTitle: quoteObj.bookTitle || '',
      bookAuthor: quoteObj.bookAuthor || '',
      text: quoteObj.text,
      page: quoteObj.page || '',
      note: quoteObj.note || '',
      createdAt: new Date().toISOString(),
    };
    data.quotes.push(quote);
    logActivity('quoted', { bookId: quote.bookId, quoteId: quote.id });
    save();

    // Sync to cloud if authenticated
    if (Alcove.db?.useCloud()) {
      const book = getCachedBook(quoteObj.bookId);
      Alcove.db.addQuote(quote, book);
    }

    return quote;
  }

  function editQuote(quoteId, updates) {
    const idx = data.quotes.findIndex(q => q.id === quoteId);
    if (idx === -1) return null;
    Object.assign(data.quotes[idx], updates);
    save();
    return data.quotes[idx];
  }

  function deleteQuote(quoteId) {
    const idx = data.quotes.findIndex(q => q.id === quoteId);
    if (idx === -1) return false;
    const quote = data.quotes[idx];
    data.quotes.splice(idx, 1);
    save();

    // Sync to cloud if authenticated
    if (Alcove.db?.useCloud() && quote.cloudId) {
      Alcove.db.deleteQuote(quote.cloudId);
    }

    return true;
  }

  function getQuotesForBook(bookId) {
    return data.quotes.filter(q => q.bookId === bookId);
  }

  function getAllQuotes() {
    return [...data.quotes].reverse();
  }

  // -- Reviews --

  function setReview(bookId, reviewText, bookMeta) {
    if (!data.reviews) data.reviews = {};
    const now = new Date().toISOString();
    const existing = data.reviews[bookId];

    data.reviews[bookId] = {
      text: reviewText,
      bookTitle: bookMeta?.title || existing?.bookTitle || '',
      bookAuthor: (bookMeta?.authors || [])[0] || existing?.bookAuthor || '',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    if (bookMeta) cacheBook(bookMeta);

    // Auto-add to "Read" shelf when reviewing (user has read the book)
    autoAddToReadShelf(bookId, bookMeta);

    logActivity('reviewed', { bookId });
    save();

    // Sync to cloud if authenticated
    if (Alcove.db?.useCloud()) {
      Alcove.db.setReview(bookId, reviewText, bookMeta);
      Alcove.db.addBookToShelf('read', bookMeta || { id: bookId });
    }
  }

  function getReview(bookId) {
    if (!data.reviews) return null;
    return data.reviews[bookId] || null;
  }

  function deleteReview(bookId) {
    if (!data.reviews || !data.reviews[bookId]) return false;
    delete data.reviews[bookId];
    save();
    return true;
  }

  function getAllReviews() {
    if (!data.reviews) return [];
    return Object.entries(data.reviews).map(([bookId, review]) => ({
      bookId,
      ...review,
    })).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  // -- Reading Progress --

  function setProgress(bookId, progressData, bookMeta) {
    if (!data.progress) data.progress = {};
    const now = new Date().toISOString();
    const existing = data.progress[bookId];

    // Calculate percentage from page if totalPages provided
    let percentage = progressData.percentage;
    if (progressData.currentPage && progressData.totalPages) {
      percentage = Math.min(100, Math.round((progressData.currentPage / progressData.totalPages) * 100));
    }

    data.progress[bookId] = {
      currentPage: progressData.currentPage || existing?.currentPage || 0,
      totalPages: progressData.totalPages || existing?.totalPages || bookMeta?.pageCount || 0,
      percentage: percentage || existing?.percentage || 0,
      startedAt: existing?.startedAt || now,
      completedAt: percentage >= 100 ? (existing?.completedAt || now) : null,
      updatedAt: now,
    };

    if (bookMeta) cacheBook(bookMeta);

    // If 100%, mark as complete and move to read shelf
    if (percentage >= 100) {
      autoAddToReadShelf(bookId, bookMeta);
      logActivity('finished', { bookId });
    } else {
      // Ensure book is on currently-reading shelf
      if (!data.shelves['currently-reading'].bookIds.includes(bookId)) {
        data.shelves['currently-reading'].bookIds.push(bookId);
        removeFromShelfSilent('to-read', bookId);
        logActivity('started', { bookId });
      }
      logActivity('progress', { bookId, percentage });
    }

    save();

    // Sync to cloud if authenticated
    if (Alcove.db?.useCloud()) {
      Alcove.db.setProgress(bookId, data.progress[bookId], bookMeta);
      if (percentage >= 100) {
        Alcove.db.addBookToShelf('read', bookMeta || { id: bookId });
      } else {
        Alcove.db.addBookToShelf('currently-reading', bookMeta || { id: bookId });
      }
    }
  }

  function getProgress(bookId) {
    if (!data.progress) return null;
    return data.progress[bookId] || null;
  }

  function getAllProgress() {
    if (!data.progress) return {};
    return data.progress;
  }

  function getReadingSpeed() {
    // Calculate average days to complete a book based on progress data
    if (!data.progress) return null;

    const completedBooks = Object.entries(data.progress)
      .filter(([_, p]) => p.completedAt && p.startedAt)
      .map(([bookId, p]) => {
        const started = new Date(p.startedAt);
        const completed = new Date(p.completedAt);
        const daysToComplete = Math.max(1, Math.ceil((completed - started) / (1000 * 60 * 60 * 24)));
        const pagesPerDay = p.totalPages ? Math.round(p.totalPages / daysToComplete) : 0;
        return { bookId, daysToComplete, pagesPerDay, totalPages: p.totalPages || 0 };
      });

    if (completedBooks.length === 0) return null;

    const avgDays = Math.round(completedBooks.reduce((s, b) => s + b.daysToComplete, 0) / completedBooks.length);
    const avgPagesPerDay = Math.round(completedBooks.reduce((s, b) => s + b.pagesPerDay, 0) / completedBooks.length);
    const totalPagesRead = completedBooks.reduce((s, b) => s + b.totalPages, 0);

    return {
      booksCompleted: completedBooks.length,
      avgDaysPerBook: avgDays,
      avgPagesPerDay: avgPagesPerDay,
      totalPagesRead: totalPagesRead,
      fastestBook: completedBooks.reduce((min, b) => b.daysToComplete < min.daysToComplete ? b : min, completedBooks[0]),
      slowestBook: completedBooks.reduce((max, b) => b.daysToComplete > max.daysToComplete ? b : max, completedBooks[0]),
    };
  }

  // -- Book Tropes --

  function setBookTropes(bookId, tropes, customTropes = [], bookMeta = null) {
    if (!data.bookTropes) data.bookTropes = {};
    data.bookTropes[bookId] = {
      tropes: tropes || [],
      customTropes: customTropes || [],
      taggedAt: new Date().toISOString(),
    };
    if (bookMeta) cacheBook(bookMeta);
    logActivity('tagged', { bookId, tropeCount: tropes.length + customTropes.length });
    save();

    // Sync to cloud if authenticated
    if (Alcove.db?.useCloud()) {
      Alcove.db.setBookTropes(bookId, tropes, customTropes, bookMeta);
      // Also sync to community tropes (adds or upvotes)
      Alcove.db.syncTropesToCommunity(bookId, tropes, customTropes);
    }
  }

  function getBookTropes(bookId) {
    if (!data.bookTropes) return { tropes: [], customTropes: [] };
    return data.bookTropes[bookId] || { tropes: [], customTropes: [] };
  }

  function getAllBookTropes() {
    if (!data.bookTropes) return {};
    return data.bookTropes;
  }

  function addCustomTrope(tropeLabel) {
    if (!data.customTropes) data.customTropes = [];
    const id = tropeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!data.customTropes.find(t => t.id === id)) {
      data.customTropes.push({
        id,
        label: tropeLabel,
        createdAt: new Date().toISOString(),
      });
      save();
    }
    return id;
  }

  function getCustomTropes() {
    if (!data.customTropes) return [];
    return data.customTropes;
  }

  function getBooksWithTrope(tropeId) {
    if (!data.bookTropes) return [];
    const books = [];
    for (const [bookId, tags] of Object.entries(data.bookTropes)) {
      if (tags.tropes.includes(tropeId) || tags.customTropes.includes(tropeId)) {
        const cached = getCachedBook(bookId);
        if (cached) books.push(cached);
      }
    }
    return books;
  }

  function getBooksWithTropes(tropeIds) {
    // Returns books that have ALL specified tropes
    if (!data.bookTropes || tropeIds.length === 0) return [];
    const books = [];
    for (const [bookId, tags] of Object.entries(data.bookTropes)) {
      const allTags = [...tags.tropes, ...tags.customTropes];
      const hasAll = tropeIds.every(t => allTags.includes(t));
      if (hasAll) {
        const cached = getCachedBook(bookId);
        if (cached) {
          books.push({
            ...cached,
            matchCount: tropeIds.filter(t => allTags.includes(t)).length,
            totalTropes: allTags.length,
          });
        }
      }
    }
    return books.sort((a, b) => b.matchCount - a.matchCount);
  }

  function getBooksWithAnyTropes(tropeIds) {
    // Returns books that have ANY of the specified tropes, ranked by match count
    if (!data.bookTropes || tropeIds.length === 0) return [];
    const books = [];
    for (const [bookId, tags] of Object.entries(data.bookTropes)) {
      const allTags = [...tags.tropes, ...tags.customTropes];
      const matchCount = tropeIds.filter(t => allTags.includes(t)).length;
      if (matchCount > 0) {
        const cached = getCachedBook(bookId);
        if (cached) {
          books.push({
            ...cached,
            matchCount,
            totalTropes: allTags.length,
          });
        }
      }
    }
    return books.sort((a, b) => b.matchCount - a.matchCount);
  }

  function getTropeStats() {
    if (!data.bookTropes) return { tropeCounts: {}, totalTaggedBooks: 0, trendingTropes: [] };

    const tropeCounts = {};
    let totalTaggedBooks = 0;

    for (const tags of Object.values(data.bookTropes)) {
      if (tags.tropes.length > 0 || tags.customTropes.length > 0) {
        totalTaggedBooks++;
      }
      for (const t of tags.tropes) {
        tropeCounts[t] = (tropeCounts[t] || 0) + 1;
      }
      for (const t of tags.customTropes) {
        tropeCounts[t] = (tropeCounts[t] || 0) + 1;
      }
    }

    // Get trending tropes (most used)
    const trendingTropes = Object.entries(tropeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([id, count]) => ({ id, count }));

    return { tropeCounts, totalTaggedBooks, trendingTropes };
  }

  function getPopularTropeCombos() {
    if (!data.bookTropes) return [];

    // Find common trope pairs
    const comboCounts = {};
    for (const tags of Object.values(data.bookTropes)) {
      const allTags = [...tags.tropes, ...tags.customTropes];
      if (allTags.length < 2) continue;

      // Generate pairs
      for (let i = 0; i < allTags.length; i++) {
        for (let j = i + 1; j < allTags.length; j++) {
          const pair = [allTags[i], allTags[j]].sort().join('|');
          comboCounts[pair] = (comboCounts[pair] || 0) + 1;
        }
      }
    }

    return Object.entries(comboCounts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([pair, count]) => ({
        tropes: pair.split('|'),
        count
      }));
  }

  // -- Trope Collections --

  function saveTropeCollection(name, tropes) {
    if (!data.tropeCollections) data.tropeCollections = [];
    const id = 'tc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const collection = {
      id,
      name,
      tropes,
      createdAt: new Date().toISOString(),
    };
    data.tropeCollections.push(collection);
    save();
    return collection;
  }

  function getTropeCollections() {
    if (!data.tropeCollections) return [];
    return data.tropeCollections;
  }

  function deleteTropeCollection(collectionId) {
    if (!data.tropeCollections) return false;
    const idx = data.tropeCollections.findIndex(c => c.id === collectionId);
    if (idx === -1) return false;
    data.tropeCollections.splice(idx, 1);
    save();
    return true;
  }

  // -- Top Books --

  function setTopBooks(bookIds) {
    // Limit to 3 books max
    data.user.topBooks = bookIds.slice(0, 3);
    save();
  }

  function getTopBooks() {
    return data.user.topBooks || [];
  }

  function addTopBook(bookId, bookMeta) {
    if (!data.user.topBooks) data.user.topBooks = [];
    if (data.user.topBooks.includes(bookId)) return false;
    if (data.user.topBooks.length >= 3) return false;
    data.user.topBooks.push(bookId);
    if (bookMeta) cacheBook(bookMeta);
    save();
    return true;
  }

  function removeTopBook(bookId) {
    if (!data.user.topBooks) return false;
    const idx = data.user.topBooks.indexOf(bookId);
    if (idx === -1) return false;
    data.user.topBooks.splice(idx, 1);
    save();
    return true;
  }

  function getTopBooksWithDetails() {
    const topBookIds = data.user.topBooks || [];
    return topBookIds.map(id => getCachedBook(id)).filter(Boolean);
  }

  // -- Activity --

  function logActivity(type, details) {
    data.activity.unshift({
      type,
      ...details,
      at: new Date().toISOString(),
    });
    if (data.activity.length > 50) {
      data.activity = data.activity.slice(0, 50);
    }
  }

  function getActivity() {
    return data.activity;
  }

  // -- Reading Streak & Badges --

  // Get a date key in YYYY-MM-DD format
  function getDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Check if a date is "today" in local time
  function isToday(dateStr) {
    return getDateKey(new Date()) === getDateKey(new Date(dateStr));
  }

  // Check if a date is "yesterday" in local time
  function isYesterday(dateStr) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return getDateKey(yesterday) === getDateKey(new Date(dateStr));
  }

  // Get all unique reading days from activity
  function getReadingDays() {
    const readingActivities = ['progress', 'quoted', 'rated', 'reviewed', 'finished', 'started', 'shelved'];
    const days = new Set();

    for (const activity of data.activity) {
      if (readingActivities.includes(activity.type)) {
        days.add(getDateKey(activity.at));
      }
    }

    // Also check progress updates (they have timestamps)
    if (data.progress) {
      for (const p of Object.values(data.progress)) {
        if (p.updatedAt) days.add(getDateKey(p.updatedAt));
        if (p.startedAt) days.add(getDateKey(p.startedAt));
        if (p.completedAt) days.add(getDateKey(p.completedAt));
      }
    }

    // Check quotes
    for (const quote of data.quotes) {
      if (quote.createdAt) days.add(getDateKey(quote.createdAt));
    }

    // Check ratings
    for (const rating of Object.values(data.ratings)) {
      if (rating.ratedAt) days.add(getDateKey(rating.ratedAt));
    }

    // Check reviews
    if (data.reviews) {
      for (const review of Object.values(data.reviews)) {
        if (review.createdAt) days.add(getDateKey(review.createdAt));
        if (review.updatedAt) days.add(getDateKey(review.updatedAt));
      }
    }

    return Array.from(days).sort();
  }

  // Calculate current reading streak
  function getReadingStreak() {
    const readingDays = getReadingDays();
    if (readingDays.length === 0) return { current: 0, best: 0, readToday: false };

    const today = getDateKey(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getDateKey(yesterday);

    // Check if read today
    const readToday = readingDays.includes(today);

    // Calculate current streak (consecutive days ending today or yesterday)
    let currentStreak = 0;
    let checkDate = new Date();

    // Start from today if read today, otherwise start from yesterday
    if (!readToday) {
      if (!readingDays.includes(yesterdayKey)) {
        // No reading today or yesterday, streak is 0
        currentStreak = 0;
      } else {
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    if (readToday || readingDays.includes(yesterdayKey)) {
      while (true) {
        const dateKey = getDateKey(checkDate);
        if (readingDays.includes(dateKey)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate best streak ever
    let bestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    for (const dayStr of readingDays) {
      const day = new Date(dayStr);
      if (prevDate) {
        const diffDays = Math.round((day - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = day;
    }
    bestStreak = Math.max(bestStreak, tempStreak, currentStreak);

    return {
      current: currentStreak,
      best: bestStreak,
      readToday,
      totalReadingDays: readingDays.length,
    };
  }

  // Badge definitions - using SVG icon names instead of emojis
  const STREAK_BADGES = [
    { id: 'streak-7', name: 'Week Warrior', description: '7 day streak', days: 7, icon: 'flame', tier: 'bronze' },
    { id: 'streak-14', name: 'Fortnight', description: '14 day streak', days: 14, icon: 'flame', tier: 'bronze' },
    { id: 'streak-21', name: 'Three Weeks', description: '21 day streak', days: 21, icon: 'flame', tier: 'silver' },
    { id: 'streak-30', name: 'Monthly', description: '30 day streak', days: 30, icon: 'award', tier: 'silver' },
    { id: 'streak-60', name: 'Two Months', description: '60 day streak', days: 60, icon: 'award', tier: 'gold' },
    { id: 'streak-90', name: 'Quarter Year', description: '90 day streak', days: 90, icon: 'trophy', tier: 'gold' },
    { id: 'streak-180', name: 'Half Year', description: '180 day streak', days: 180, icon: 'trophy', tier: 'platinum' },
    { id: 'streak-365', name: 'Full Year', description: '365 day streak', days: 365, icon: 'crown', tier: 'platinum' },
  ];

  const MILESTONE_BADGES = [
    { id: 'books-1', name: 'First Book', description: '1 book read', books: 1, icon: 'book', tier: 'bronze' },
    { id: 'books-5', name: 'Getting Started', description: '5 books read', books: 5, icon: 'book', tier: 'bronze' },
    { id: 'books-10', name: 'Double Digits', description: '10 books read', books: 10, icon: 'books', tier: 'silver' },
    { id: 'books-25', name: 'Bookworm', description: '25 books read', books: 25, icon: 'books', tier: 'silver' },
    { id: 'books-50', name: 'Bibliophile', description: '50 books read', books: 50, icon: 'library', tier: 'gold' },
    { id: 'books-100', name: 'Century', description: '100 books read', books: 100, icon: 'library', tier: 'platinum' },
    { id: 'quotes-10', name: 'Collector', description: '10 quotes saved', quotes: 10, icon: 'quote', tier: 'bronze' },
    { id: 'quotes-50', name: 'Curator', description: '50 quotes saved', quotes: 50, icon: 'quote', tier: 'silver' },
  ];

  // Get all earned badges
  function getEarnedBadges() {
    const streak = getReadingStreak();
    const stats = getStats();
    const earned = [];

    // Check streak badges (based on best streak ever)
    for (const badge of STREAK_BADGES) {
      if (streak.best >= badge.days) {
        earned.push({
          ...badge,
          earnedAt: null, // We don't track when exactly, just that they earned it
          type: 'streak',
        });
      }
    }

    // Check milestone badges
    for (const badge of MILESTONE_BADGES) {
      if (badge.books && stats.booksRead >= badge.books) {
        earned.push({ ...badge, type: 'milestone' });
      }
      if (badge.quotes && stats.totalQuotes >= badge.quotes) {
        earned.push({ ...badge, type: 'milestone' });
      }
    }

    return earned;
  }

  // Get next badge to earn (motivation)
  function getNextBadges() {
    const streak = getReadingStreak();
    const stats = getStats();
    const next = [];

    // Next streak badge
    for (const badge of STREAK_BADGES) {
      if (streak.best < badge.days) {
        next.push({
          ...badge,
          type: 'streak',
          progress: streak.current,
          target: badge.days,
        });
        break; // Only show one
      }
    }

    // Next book milestone
    for (const badge of MILESTONE_BADGES) {
      if (badge.books && stats.booksRead < badge.books) {
        next.push({
          ...badge,
          type: 'milestone',
          progress: stats.booksRead,
          target: badge.books,
        });
        break;
      }
    }

    // Next quote milestone
    for (const badge of MILESTONE_BADGES) {
      if (badge.quotes && stats.totalQuotes < badge.quotes) {
        next.push({
          ...badge,
          type: 'milestone',
          progress: stats.totalQuotes,
          target: badge.quotes,
        });
        break;
      }
    }

    return next;
  }

  // Get all badge definitions for display
  function getAllBadges() {
    return {
      streakBadges: STREAK_BADGES,
      milestoneBadges: MILESTONE_BADGES,
    };
  }

  // -- Stats --

  function getStats() {
    const ratings = Object.values(data.ratings);
    const totalRated = ratings.length;
    const avgRating = totalRated > 0
      ? ratings.reduce((s, r) => s + r.rating, 0) / totalRated
      : 0;

    let totalBooksOnShelves = 0;
    const uniqueBookIds = new Set();
    for (const shelf of Object.values(data.shelves)) {
      shelf.bookIds.forEach(id => uniqueBookIds.add(id));
    }
    totalBooksOnShelves = uniqueBookIds.size;

    return {
      totalBooks: totalBooksOnShelves,
      booksRead: data.shelves['read'] ? data.shelves['read'].bookIds.length : 0,
      totalRated,
      avgRating: Math.round(avgRating * 100) / 100,
      totalQuotes: data.quotes.length,
      totalReviews: data.reviews ? Object.keys(data.reviews).length : 0,
      totalShelves: Object.keys(data.shelves).length,
    };
  }

  // -- Data Management --

  function exportData() {
    return JSON.stringify(data, null, 2);
  }

  function importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (!imported._version) throw new Error('Invalid data format');
      data = imported;
      save();
      return true;
    } catch (e) {
      console.error('Alcove: Import failed.', e);
      return false;
    }
  }

  function clearAllData() {
    data = JSON.parse(JSON.stringify(defaultData));
    save();
  }

  function isFirstVisit() {
    return data.user.createdAt === null;
  }

  // Initialize
  load();

  Alcove.store = {
    get, set, save, load,
    cacheBook, getCachedBook,
    addToShelf, removeFromShelf, createShelf, deleteShelf,
    getShelfBooks, findBookShelves, getAllShelves,
    setRating, getRating, getAllRatings,
    setReview, getReview, deleteReview, getAllReviews,
    setProgress, getProgress, getAllProgress, getReadingSpeed,
    addQuote, editQuote, deleteQuote, getQuotesForBook, getAllQuotes,
    // Top Books
    setTopBooks, getTopBooks, addTopBook, removeTopBook, getTopBooksWithDetails,
    // Tropes
    setBookTropes, getBookTropes, getAllBookTropes,
    addCustomTrope, getCustomTropes,
    getBooksWithTrope, getBooksWithTropes, getBooksWithAnyTropes,
    getTropeStats, getPopularTropeCombos,
    saveTropeCollection, getTropeCollections, deleteTropeCollection,
    logActivity, getActivity,
    getStats,
    // Streaks & Badges
    getReadingStreak, getEarnedBadges, getNextBadges, getAllBadges, getReadingDays,
    exportData, importData, clearAllData,
    isFirstVisit,
  };
})();
