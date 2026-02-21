window.Alcove = window.Alcove || {};

(function() {
  // Logo colors (matching brand dots)
  const LOGO_COLORS = {
    salmon: '#F5A07A',
    blue: '#7AB8F5',
    purple: '#6B3A5C'
  };

  function render(size = 80, rotation = 0) {
    const { salmon, blue, purple } = LOGO_COLORS;
    const deg = typeof rotation === 'number' ? rotation : 0;
    const rotateStyle = deg ? ` transform: rotate(${deg}deg);` : '';

    return `
      <svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Alcove logo"
           width="${size}" height="${size}" class="alcove-logo-icon" style="${rotateStyle}">
        <circle cx="5" cy="5" r="4" fill="${salmon}"/>
        <circle cx="17" cy="5" r="4" fill="${blue}"/>
        <circle cx="5" cy="17" r="4" fill="${purple}"/>
      </svg>
    `;
  }

  function renderSmall(size = 32, rotation = 0) {
    return render(size, rotation);
  }

  Alcove.mascot = { render, renderSmall };
})();
