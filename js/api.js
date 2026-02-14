window.Alcove = window.Alcove || {};

(function() {
  // Open Library API - completely free, no API key needed
  const SEARCH_URL = 'https://openlibrary.org/search.json';
  const WORKS_URL = 'https://openlibrary.org';
  const COVERS_URL = 'https://covers.openlibrary.org/b';

  async function fetchJSON(url) {
    console.log('[Alcove API] Fetching:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  }

  function getCoverUrl(coverId, isbn, size = 'M') {
    // size: S (small), M (medium), L (large)
    if (coverId) {
      return `${COVERS_URL}/id/${coverId}-${size}.jpg`;
    }
    if (isbn) {
      return `${COVERS_URL}/isbn/${isbn}-${size}.jpg`;
    }
    return null;
  }

  function normalizeBook(raw) {
    if (!raw) return null;

    // Handle search result format
    const id = raw.key || raw.edition_key?.[0] || raw.cover_edition_key || `ol-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const coverId = raw.cover_i || raw.cover_id;
    const isbn = raw.isbn?.[0];

    return {
      id: id.replace('/works/', '').replace('/books/', ''),
      title: raw.title || 'Unknown Title',
      subtitle: raw.subtitle || '',
      authors: raw.author_name || raw.authors?.map(a => a.name) || ['Unknown Author'],
      description: raw.description?.value || raw.description || '',
      categories: raw.subject?.slice(0, 5) || [],
      thumbnail: getCoverUrl(coverId, isbn, 'M'),
      thumbnailLarge: getCoverUrl(coverId, isbn, 'L'),
      pageCount: raw.number_of_pages_median || raw.number_of_pages || null,
      publishedDate: raw.first_publish_year?.toString() || raw.publish_date?.[0] || '',
      publisher: raw.publisher?.[0] || '',
      isbn: isbn || '',
      averageRating: raw.ratings_average || null,
      ratingsCount: raw.ratings_count || 0,
      previewLink: raw.key ? `https://openlibrary.org${raw.key}` : '',
      language: raw.language?.[0] || 'eng',
      editions: raw.edition_count || 0,
    };
  }

  async function searchBooks(query, startIndex = 0, maxResults = 20, options = {}) {
    if (!query.trim()) return { books: [], totalItems: 0 };

    const { sortByNewest = true, minYear = null, sortByPopularity = false, requireCover = false } = options;
    const page = Math.floor(startIndex / maxResults) + 1;

    // Build query with year filter if specified (using Open Library query syntax)
    let finalQuery = query;
    if (minYear) {
      // Add year range filter to query
      finalQuery = `${query} first_publish_year:[${minYear} TO *]`;
    }

    const params = new URLSearchParams({
      q: finalQuery,
      page: page,
      limit: maxResults * (minYear ? 3 : 1), // Fetch more when filtering to ensure enough results
      fields: 'key,title,subtitle,author_name,cover_i,first_publish_year,publisher,isbn,subject,edition_count,number_of_pages_median,ratings_average,ratings_count,cover_edition_key',
    });

    try {
      const data = await fetchJSON(`${SEARCH_URL}?${params}`);
      console.log('[Alcove API] Search results:', data.numFound, 'books found');

      let books = (data.docs || []).map(normalizeBook).filter(Boolean);

      // Additional client-side year filter (backup in case API filter isn't perfect)
      if (minYear) {
        books = books.filter(b => {
          const year = parseInt(b.publishedDate);
          return !isNaN(year) && year >= minYear;
        });
      }

      // Filter to only books with covers if requested (for better visual display)
      if (requireCover) {
        books = books.filter(b => b.thumbnail);
      }

      // Sort by popularity (ratings count) then by year
      if (sortByPopularity) {
        books.sort((a, b) => {
          // Primary: popularity (ratings count)
          const popA = a.ratingsCount || 0;
          const popB = b.ratingsCount || 0;
          if (popB !== popA) return popB - popA;
          // Secondary: newest first
          const yearA = parseInt(a.publishedDate) || 0;
          const yearB = parseInt(b.publishedDate) || 0;
          return yearB - yearA;
        });
      } else if (sortByNewest) {
        // Sort by newest published first
        books.sort((a, b) => {
          const yearA = parseInt(a.publishedDate) || 0;
          const yearB = parseInt(b.publishedDate) || 0;
          return yearB - yearA;
        });
      }

      // Limit to requested amount
      books = books.slice(0, maxResults);

      return {
        books,
        totalItems: data.numFound || 0,
      };
    } catch (err) {
      console.error('[Alcove API] Search failed:', err);
      throw err;
    }
  }

  async function getBook(workId) {
    try {
      // Fetch work details
      const workUrl = `${WORKS_URL}/works/${workId}.json`;
      const work = await fetchJSON(workUrl);

      // Try to get edition details for more info
      let edition = null;
      if (work.covers?.[0]) {
        // We have cover info from work
      }

      // Get author names
      let authorNames = ['Unknown Author'];
      if (work.authors?.length > 0) {
        const authorPromises = work.authors.slice(0, 3).map(async (a) => {
          try {
            const authorKey = a.author?.key || a.key;
            if (authorKey) {
              const author = await fetchJSON(`${WORKS_URL}${authorKey}.json`);
              return author.name;
            }
          } catch (e) {
            return null;
          }
        });
        const names = await Promise.all(authorPromises);
        authorNames = names.filter(Boolean);
        if (authorNames.length === 0) authorNames = ['Unknown Author'];
      }

      const coverId = work.covers?.[0];

      return {
        id: workId,
        title: work.title || 'Unknown Title',
        subtitle: work.subtitle || '',
        authors: authorNames,
        description: work.description?.value || work.description || '',
        categories: work.subjects?.slice(0, 8) || [],
        thumbnail: getCoverUrl(coverId, null, 'M'),
        thumbnailLarge: getCoverUrl(coverId, null, 'L'),
        pageCount: null,
        publishedDate: work.first_publish_date || '',
        publisher: '',
        isbn: '',
        averageRating: null,
        ratingsCount: 0,
        previewLink: `https://openlibrary.org/works/${workId}`,
        language: 'eng',
      };
    } catch (err) {
      console.error('[Alcove API] Get book failed:', err);
      throw err;
    }
  }

  async function browseByGenre(genre, startIndex = 0, maxResults = 20, options = {}) {
    // Default to showing recent popular books when browsing genres
    const currentYear = new Date().getFullYear();
    const defaultOptions = {
      sortByNewest: false,
      sortByPopularity: true,
      minYear: currentYear - 20,
      requireCover: true,
      ...options
    };
    return searchBooks(`subject:"${genre}"`, startIndex, maxResults, defaultOptions);
  }

  async function getRecommendations(genres, limit = 12) {
    // Only get books from past 20 years for recommendations
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 20;
    const options = {
      sortByNewest: false,
      sortByPopularity: true, // Prioritize popular books
      minYear: minYear,
      requireCover: true // Only show books with covers for better UI
    };

    // Use trending/popular search terms for better results
    const trendingQueries = [
      'bestseller',
      'award winner',
      'popular',
    ];

    if (!genres || genres.length === 0) {
      // Mix of trending fiction
      const trending = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
      return searchBooks(`subject:fiction ${trending}`, 0, limit, options);
    }

    // Pick a random genre from user's favorites
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const trending = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];

    return searchBooks(`subject:"${genre}" ${trending}`, 0, limit, options);
  }

  async function searchByAuthor(author, startIndex = 0, maxResults = 20) {
    return searchBooks(`author:${author}`, startIndex, maxResults, { sortByNewest: true });
  }

  // BookTok trending titles (curated list of popular BookTok books)
  const BOOKTOK_TRENDING = [
    { title: 'It Ends with Us', author: 'Colleen Hoover' },
    { title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid' },
    { title: 'A Court of Thorns and Roses', author: 'Sarah J. Maas' },
    { title: 'Fourth Wing', author: 'Rebecca Yarros' },
    { title: 'The Song of Achilles', author: 'Madeline Miller' },
    { title: 'The Love Hypothesis', author: 'Ali Hazelwood' },
    { title: 'Verity', author: 'Colleen Hoover' },
    { title: 'Beach Read', author: 'Emily Henry' },
    { title: 'People We Meet on Vacation', author: 'Emily Henry' },
    { title: 'Book Lovers', author: 'Emily Henry' },
    { title: 'Ugly Love', author: 'Colleen Hoover' },
    { title: 'They Both Die at the End', author: 'Adam Silvera' },
    { title: 'The Invisible Life of Addie LaRue', author: 'V.E. Schwab' },
    { title: 'Red White and Royal Blue', author: 'Casey McQuiston' },
    { title: 'Twisted Love', author: 'Ana Huang' },
    { title: 'The Cruel Prince', author: 'Holly Black' },
    { title: 'Six of Crows', author: 'Leigh Bardugo' },
    { title: 'House of Salt and Sorrows', author: 'Erin A. Craig' },
    { title: 'November 9', author: 'Colleen Hoover' },
    { title: 'Circe', author: 'Madeline Miller' },
    { title: 'The Atlas Six', author: 'Olivie Blake' },
    { title: 'Happy Place', author: 'Emily Henry' },
    { title: 'Iron Flame', author: 'Rebecca Yarros' },
    { title: 'Haunting Adeline', author: 'H.D. Carlton' },
    { title: 'Powerless', author: 'Lauren Roberts' },
    { title: 'Community', author: 'Tawney Meeks' },
    { title: 'Daisy Jones and The Six', author: 'Taylor Jenkins Reid' },
    { title: 'The Midnight Library', author: 'Matt Haig' },
    { title: 'Reminders of Him', author: 'Colleen Hoover' },
    { title: 'Things We Never Got Over', author: 'Lucy Score' },
  ];

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function getBookTokTrending(limit = 8) {
    // Check sessionStorage cache first
    const cacheKey = 'alcove_booktok_cache';
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.books && parsed.books.length > 0) {
          return { books: parsed.books };
        }
      }
    } catch (e) { /* ignore cache errors */ }

    // Pick random titles
    const picks = shuffle(BOOKTOK_TRENDING).slice(0, limit + 4); // fetch extra in case some fail

    // Fetch in parallel (batches of 4 to avoid overwhelming API)
    const books = [];
    for (let i = 0; i < picks.length && books.length < limit; i += 4) {
      const batch = picks.slice(i, i + 4);
      const results = await Promise.all(
        batch.map(async (pick) => {
          try {
            const result = await searchBooks(
              `${pick.title} ${pick.author}`,
              0, 1,
              { sortByNewest: false, requireCover: true }
            );
            return result.books[0] || null;
          } catch (e) {
            return null;
          }
        })
      );
      for (const book of results) {
        if (book && book.thumbnail && books.length < limit) {
          books.push(book);
        }
      }
    }

    // Cache results for this session
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ books }));
    } catch (e) { /* ignore */ }

    return { books };
  }

  Alcove.api = {
    searchBooks,
    getBook,
    browseByGenre,
    getRecommendations,
    getBookTokTrending,
    searchByAuthor,
    normalizeBook,
    getCoverUrl,
  };
})();
