// Database Module for Alcove - Supabase integration
window.Alcove = window.Alcove || {};

(function() {
  // Helper to get current user ID
  function getUserId() {
    const user = Alcove.auth?.getCurrentUser();
    return user?.id;
  }

  // Helper to check if we should use cloud
  function useCloud() {
    return Alcove.isSupabaseConfigured() && Alcove.auth?.isAuthenticated();
  }

  // ==================== BOOKS ====================

  // Ensure book exists in database (upsert)
  async function ensureBook(book) {
    if (!useCloud() || !book?.id) return;

    const bookData = {
      id: book.id,
      title: book.title || 'Unknown Title',
      authors: book.authors || [],
      thumbnail: book.thumbnail || null,
      thumbnail_large: book.thumbnailLarge || book.thumbnail || null,
      categories: book.categories || [],
      page_count: book.pageCount || null,
      published_date: book.publishedDate || null,
      publisher: book.publisher || null,
      isbn: book.isbn || null,
      description: book.description || null,
      average_rating: book.averageRating || null,
      ratings_count: book.ratingsCount || 0,
      updated_at: new Date().toISOString()
    };

    const { error } = await Alcove.supabase
      .from('books')
      .upsert(bookData, { onConflict: 'id' });

    if (error) console.error('Error saving book:', error);
  }

  // Get book by ID
  async function getBook(bookId) {
    if (!useCloud()) return null;

    const { data, error } = await Alcove.supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (error) return null;
    return data;
  }

  // ==================== SHELVES ====================

  // Get all shelves for current user
  async function getShelves() {
    if (!useCloud()) return [];

    const { data, error } = await Alcove.supabase
      .from('shelves')
      .select('*')
      .eq('user_id', getUserId())
      .order('created_at');

    if (error) {
      console.error('Error fetching shelves:', error);
      return [];
    }
    return data || [];
  }

  // Get shelf by key
  async function getShelf(key) {
    if (!useCloud()) return null;

    const { data, error } = await Alcove.supabase
      .from('shelves')
      .select('*')
      .eq('user_id', getUserId())
      .eq('key', key)
      .single();

    if (error) return null;
    return data;
  }

  // Create a new shelf
  async function createShelf(key, label) {
    if (!useCloud()) return null;

    const { data, error } = await Alcove.supabase
      .from('shelves')
      .insert({
        user_id: getUserId(),
        key,
        label,
        is_built_in: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating shelf:', error);
      return null;
    }
    return data;
  }

  // Delete a shelf
  async function deleteShelf(key) {
    if (!useCloud()) return;

    const { error } = await Alcove.supabase
      .from('shelves')
      .delete()
      .eq('user_id', getUserId())
      .eq('key', key)
      .eq('is_built_in', false);

    if (error) console.error('Error deleting shelf:', error);
  }

  // ==================== SHELF BOOKS ====================

  // Get books on a shelf
  async function getShelfBooks(shelfKey) {
    if (!useCloud()) return [];

    const shelf = await getShelf(shelfKey);
    if (!shelf) return [];

    const { data, error } = await Alcove.supabase
      .from('shelf_books')
      .select(`
        *,
        books (*)
      `)
      .eq('shelf_id', shelf.id)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching shelf books:', error);
      return [];
    }

    return (data || []).map(sb => ({
      ...sb.books,
      addedAt: sb.added_at
    }));
  }

  // Add book to shelf
  async function addBookToShelf(shelfKey, book) {
    if (!useCloud()) return;

    // Ensure book exists
    await ensureBook(book);

    const shelf = await getShelf(shelfKey);
    if (!shelf) return;

    const { error } = await Alcove.supabase
      .from('shelf_books')
      .upsert({
        shelf_id: shelf.id,
        user_id: getUserId(),
        book_id: book.id,
        added_at: new Date().toISOString()
      }, { onConflict: 'shelf_id,book_id' });

    if (error) console.error('Error adding book to shelf:', error);
  }

  // Remove book from shelf
  async function removeBookFromShelf(shelfKey, bookId) {
    if (!useCloud()) return;

    const shelf = await getShelf(shelfKey);
    if (!shelf) return;

    const { error } = await Alcove.supabase
      .from('shelf_books')
      .delete()
      .eq('shelf_id', shelf.id)
      .eq('book_id', bookId);

    if (error) console.error('Error removing book from shelf:', error);
  }

  // Check if book is on shelf
  async function isBookOnShelf(shelfKey, bookId) {
    if (!useCloud()) return false;

    const shelf = await getShelf(shelfKey);
    if (!shelf) return false;

    const { data } = await Alcove.supabase
      .from('shelf_books')
      .select('id')
      .eq('shelf_id', shelf.id)
      .eq('book_id', bookId)
      .single();

    return !!data;
  }

  // Get all shelves a book is on
  async function getBookShelves(bookId) {
    if (!useCloud()) return [];

    const { data, error } = await Alcove.supabase
      .from('shelf_books')
      .select(`
        shelves (key, label)
      `)
      .eq('user_id', getUserId())
      .eq('book_id', bookId);

    if (error) return [];
    return (data || []).map(sb => sb.shelves.key);
  }

  // ==================== RATINGS ====================

  // Get rating for a book
  async function getRating(bookId) {
    if (!useCloud()) return null;

    const { data } = await Alcove.supabase
      .from('ratings')
      .select('rating')
      .eq('user_id', getUserId())
      .eq('book_id', bookId)
      .single();

    return data?.rating || null;
  }

  // Set rating for a book
  async function setRating(bookId, rating, book) {
    if (!useCloud()) return;

    if (book) await ensureBook(book);

    const { error } = await Alcove.supabase
      .from('ratings')
      .upsert({
        user_id: getUserId(),
        book_id: bookId,
        rating,
        rated_at: new Date().toISOString()
      }, { onConflict: 'user_id,book_id' });

    if (error) console.error('Error setting rating:', error);
  }

  // Get all ratings
  async function getAllRatings() {
    if (!useCloud()) return {};

    const { data, error } = await Alcove.supabase
      .from('ratings')
      .select('book_id, rating')
      .eq('user_id', getUserId());

    if (error) return {};

    const ratings = {};
    (data || []).forEach(r => {
      ratings[r.book_id] = r.rating;
    });
    return ratings;
  }

  // ==================== REVIEWS ====================

  // Get review for a book
  async function getReview(bookId) {
    if (!useCloud()) return null;

    const { data } = await Alcove.supabase
      .from('reviews')
      .select('text, created_at, updated_at')
      .eq('user_id', getUserId())
      .eq('book_id', bookId)
      .single();

    return data?.text || null;
  }

  // Set review for a book
  async function setReview(bookId, text, book) {
    if (!useCloud()) return;

    if (book) await ensureBook(book);

    if (!text || text.trim() === '') {
      // Delete review if empty
      await Alcove.supabase
        .from('reviews')
        .delete()
        .eq('user_id', getUserId())
        .eq('book_id', bookId);
      return;
    }

    const { error } = await Alcove.supabase
      .from('reviews')
      .upsert({
        user_id: getUserId(),
        book_id: bookId,
        text,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,book_id' });

    if (error) console.error('Error setting review:', error);
  }

  // ==================== READING PROGRESS ====================

  // Get reading progress
  async function getProgress(bookId) {
    if (!useCloud()) return null;

    const { data } = await Alcove.supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', getUserId())
      .eq('book_id', bookId)
      .single();

    return data;
  }

  // Update reading progress
  async function setProgress(bookId, progress, book) {
    if (!useCloud()) return;

    if (book) await ensureBook(book);

    const { error } = await Alcove.supabase
      .from('reading_progress')
      .upsert({
        user_id: getUserId(),
        book_id: bookId,
        current_page: progress.currentPage || 0,
        total_pages: progress.totalPages || null,
        percentage: progress.percentage || 0,
        started_at: progress.startedAt || null,
        completed_at: progress.completedAt || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,book_id' });

    if (error) console.error('Error setting progress:', error);
  }

  // ==================== QUOTES ====================

  // Get all quotes
  async function getQuotes() {
    if (!useCloud()) return [];

    const { data, error } = await Alcove.supabase
      .from('quotes')
      .select(`
        *,
        books (id, title, authors, thumbnail)
      `)
      .eq('user_id', getUserId())
      .order('created_at', { ascending: false });

    if (error) return [];

    return (data || []).map(q => ({
      id: q.id,
      bookId: q.book_id,
      text: q.text,
      page: q.page,
      note: q.note,
      createdAt: q.created_at,
      book: q.books
    }));
  }

  // Add a quote
  async function addQuote(quote, book) {
    if (!useCloud()) return null;

    if (book) await ensureBook(book);

    const { data, error } = await Alcove.supabase
      .from('quotes')
      .insert({
        user_id: getUserId(),
        book_id: quote.bookId,
        text: quote.text,
        page: quote.page || null,
        note: quote.note || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding quote:', error);
      return null;
    }
    return data;
  }

  // Delete a quote
  async function deleteQuote(quoteId) {
    if (!useCloud()) return;

    const { error } = await Alcove.supabase
      .from('quotes')
      .delete()
      .eq('id', quoteId)
      .eq('user_id', getUserId());

    if (error) console.error('Error deleting quote:', error);
  }

  // ==================== ACTIVITY ====================

  // Log activity
  async function logActivity(type, bookId, details = {}) {
    if (!useCloud()) return;

    const { error } = await Alcove.supabase
      .from('activity')
      .insert({
        user_id: getUserId(),
        book_id: bookId || null,
        type,
        details
      });

    if (error) console.error('Error logging activity:', error);
  }

  // Get recent activity
  async function getActivity(limit = 50) {
    if (!useCloud()) return [];

    const { data, error } = await Alcove.supabase
      .from('activity')
      .select(`
        *,
        books (id, title, authors, thumbnail)
      `)
      .eq('user_id', getUserId())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data || [];
  }

  // ==================== BOOK TROPES ====================

  // Get tropes for a book
  async function getBookTropes(bookId) {
    if (!useCloud()) return { tropes: [], customTropes: [] };

    const { data } = await Alcove.supabase
      .from('book_tropes')
      .select('tropes, custom_tropes')
      .eq('user_id', getUserId())
      .eq('book_id', bookId)
      .single();

    return {
      tropes: data?.tropes || [],
      customTropes: data?.custom_tropes || []
    };
  }

  // Set tropes for a book
  async function setBookTropes(bookId, tropes, customTropes, book) {
    if (!useCloud()) return;

    if (book) await ensureBook(book);

    const { error } = await Alcove.supabase
      .from('book_tropes')
      .upsert({
        user_id: getUserId(),
        book_id: bookId,
        tropes: tropes || [],
        custom_tropes: customTropes || [],
        tagged_at: new Date().toISOString()
      }, { onConflict: 'user_id,book_id' });

    if (error) console.error('Error setting tropes:', error);
  }

  // ==================== STATS ====================

  // Get user stats
  async function getStats() {
    if (!useCloud()) return null;

    const userId = getUserId();

    // Get counts in parallel
    const [shelfBooks, ratings, reviews, quotes] = await Promise.all([
      Alcove.supabase.from('shelf_books').select('id', { count: 'exact' }).eq('user_id', userId),
      Alcove.supabase.from('ratings').select('rating').eq('user_id', userId),
      Alcove.supabase.from('reviews').select('id', { count: 'exact' }).eq('user_id', userId),
      Alcove.supabase.from('quotes').select('id', { count: 'exact' }).eq('user_id', userId)
    ]);

    const ratingsData = ratings.data || [];
    const avgRating = ratingsData.length > 0
      ? ratingsData.reduce((sum, r) => sum + parseFloat(r.rating), 0) / ratingsData.length
      : 0;

    return {
      totalBooks: shelfBooks.count || 0,
      totalRatings: ratingsData.length,
      averageRating: avgRating.toFixed(1),
      totalReviews: reviews.count || 0,
      totalQuotes: quotes.count || 0
    };
  }

  // Export db module
  Alcove.db = {
    useCloud,
    ensureBook,
    getBook,
    getShelves,
    getShelf,
    createShelf,
    deleteShelf,
    getShelfBooks,
    addBookToShelf,
    removeBookFromShelf,
    isBookOnShelf,
    getBookShelves,
    getRating,
    setRating,
    getAllRatings,
    getReview,
    setReview,
    getProgress,
    setProgress,
    getQuotes,
    addQuote,
    deleteQuote,
    logActivity,
    getActivity,
    getBookTropes,
    setBookTropes,
    getStats
  };
})();
