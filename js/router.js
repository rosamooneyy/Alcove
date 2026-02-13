window.Alcove = window.Alcove || {};

(function() {
  const routes = [];
  let currentCleanup = null;
  let contentEl = null;

  // Routes that don't require authentication
  const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

  // Check if route requires auth
  function isPublicRoute(path) {
    return publicRoutes.some(route => path === route || path.startsWith(route + '/'));
  }

  function register(pattern, renderFn) {
    routes.push({ pattern, renderFn });
  }

  function parseHash(hash) {
    const raw = hash.replace(/^#\/?/, '/');
    const [pathPart, queryPart] = raw.split('?');
    const path = pathPart || '/';

    const query = {};
    if (queryPart) {
      queryPart.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        query[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }

    return { path, query };
  }

  function matchRoute(path) {
    for (const route of routes) {
      const params = matchPattern(route.pattern, path);
      if (params !== null) {
        return { route, params };
      }
    }
    return null;
  }

  function matchPattern(pattern, path) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }

  function navigate(path) {
    window.location.hash = '#' + path;
  }

  async function handleRoute() {
    if (!contentEl) {
      contentEl = document.getElementById('app-content');
    }
    if (!contentEl) return;

    // Run cleanup from previous page
    if (currentCleanup && typeof currentCleanup === 'function') {
      currentCleanup();
      currentCleanup = null;
    }

    const { path, query } = parseHash(window.location.hash || '#/');

    // Auth guard - check if user needs to be logged in
    const isConfigured = Alcove.isSupabaseConfigured && Alcove.isSupabaseConfigured();
    const isAuthenticated = Alcove.auth && Alcove.auth.isAuthenticated();

    // If Supabase is configured and user is not authenticated and route is protected
    if (isConfigured && !isAuthenticated && !isPublicRoute(path)) {
      navigate('/login');
      return;
    }

    // If user is authenticated and trying to access login page, redirect to home
    if (isAuthenticated && (path === '/login' || path === '/forgot-password')) {
      navigate('/');
      return;
    }

    const match = matchRoute(path);

    if (match) {
      try {
        const result = await match.route.renderFn(match.params, query);
        if (typeof result === 'string') {
          contentEl.innerHTML = result;
        } else if (result && result.html) {
          contentEl.innerHTML = result.html;
          if (result.init) result.init();
          if (result.cleanup) currentCleanup = result.cleanup;
        }
      } catch (err) {
        console.error('Alcove: Route render error', err);
        contentEl.innerHTML = `
          <div class="error-state">
            <h2>Something went wrong</h2>
            <p>We couldn't load this page. Please try again.</p>
          </div>
        `;
      }
    } else {
      contentEl.innerHTML = `
        <div class="error-state">
          <h2>Page not found</h2>
          <p>The page you're looking for doesn't exist.</p>
          <a href="#/" class="btn btn-primary">Go Home</a>
        </div>
      `;
    }

    // Scroll to top on navigation
    contentEl.scrollTop = 0;
    window.scrollTo(0, 0);

    // Hide sidebar and mobile toggle on auth pages
    const nav = document.getElementById('main-nav');
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    if (isPublicRoute(path)) {
      if (nav) nav.style.display = 'none';
      if (mobileToggle) mobileToggle.style.display = 'none';
      contentEl.style.marginLeft = '0';
    } else {
      if (nav) nav.style.display = '';
      if (mobileToggle) mobileToggle.style.display = '';
      contentEl.style.marginLeft = '';
    }

    // Update active nav link
    updateActiveNav(path);
  }

  function updateActiveNav(path) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkPath = href.replace('#', '');
      const isActive = path === linkPath || (linkPath !== '/' && path.startsWith(linkPath));
      link.classList.toggle('active', isActive);
    });
  }

  function init() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  Alcove.router = { register, navigate, init, handleRoute };
})();
