window.Alcove = window.Alcove || {};

(function() {
  // Fixed mascot colors (matching logo dots) - theme independent
  const MASCOT_COLORS = {
    black: '#1A1A1A',
    salmon: '#F5A07A',
    blue: '#7AB8F5',
    purple: '#6B3A5C'
  };

  function render(size = 80, mood = 'reading') {
    const moodExtras = getMoodExtras(mood);
    const { black, salmon, blue, purple } = MASCOT_COLORS;

    return `
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Alcove owl mascot"
           width="${size}" height="${size}" class="mascot mascot-${mood}">
        <!-- Open Book -->
        <g class="mascot-book">
          <rect x="18" y="88" width="38" height="26" rx="2" fill="var(--color-cloud)"
                transform="rotate(-4 37 101)" stroke="var(--color-fog)" stroke-width="0.5"/>
          <rect x="64" y="88" width="38" height="26" rx="2" fill="var(--color-cloud)"
                transform="rotate(4 83 101)" stroke="var(--color-fog)" stroke-width="0.5"/>
          <line x1="60" y1="86" x2="60" y2="114" stroke="var(--color-fog)" stroke-width="1.5"/>
          <!-- Page lines left -->
          <line x1="28" y1="95" x2="50" y2="94" stroke="var(--color-fog)" stroke-width="0.5" opacity="0.4"/>
          <line x1="28" y1="99" x2="50" y2="98" stroke="var(--color-fog)" stroke-width="0.5" opacity="0.4"/>
          <line x1="28" y1="103" x2="48" y2="102" stroke="var(--color-fog)" stroke-width="0.5" opacity="0.4"/>
          <!-- Page lines right -->
          <line x1="70" y1="94" x2="92" y2="95" stroke="var(--color-fog)" stroke-width="0.5" opacity="0.4"/>
          <line x1="70" y1="98" x2="92" y2="99" stroke="var(--color-fog)" stroke-width="0.5" opacity="0.4"/>
          <line x1="70" y1="102" x2="90" y2="103" stroke="var(--color-fog)" stroke-width="0.5" opacity="0.4"/>
        </g>

        <!-- Owl Body -->
        <g class="mascot-owl">
          <!-- Body -->
          <ellipse cx="60" cy="58" rx="30" ry="34" fill="${purple}"/>
          <!-- Belly -->
          <ellipse cx="60" cy="65" rx="20" ry="22" fill="${salmon}"/>
          <!-- Belly pattern -->
          <path d="M48,55 Q52,60 48,65 Q52,70 48,75" stroke="${purple}" stroke-width="0.8" fill="none" opacity="0.3"/>
          <path d="M56,53 Q60,58 56,63 Q60,68 56,73 Q60,78 56,82" stroke="${purple}" stroke-width="0.8" fill="none" opacity="0.3"/>
          <path d="M64,53 Q68,58 64,63 Q68,68 64,73 Q68,78 64,82" stroke="${purple}" stroke-width="0.8" fill="none" opacity="0.3"/>
          <path d="M72,55 Q76,60 72,65 Q76,70 72,75" stroke="${purple}" stroke-width="0.8" fill="none" opacity="0.3"/>

          <!-- Ear Tufts -->
          <polygon points="36,22 42,38 30,34" fill="${purple}"/>
          <polygon points="84,22 78,38 90,34" fill="${purple}"/>
          <polygon points="37,24 41,35 32,32" fill="${salmon}" opacity="0.3"/>
          <polygon points="83,24 79,35 88,32" fill="${salmon}" opacity="0.3"/>

          <!-- Eyes -->
          <g class="mascot-eyes">
            ${mood === 'sleeping' ? `
              <!-- Sleeping eyes (closed) -->
              <path d="M39,47 Q46,43 53,47" stroke="${black}" stroke-width="2" fill="none" stroke-linecap="round"/>
              <path d="M67,47 Q74,43 81,47" stroke="${black}" stroke-width="2" fill="none" stroke-linecap="round"/>
            ` : `
              <!-- Open eyes -->
              <circle cx="46" cy="45" r="11" fill="white"/>
              <circle cx="74" cy="45" r="11" fill="white"/>
              <circle cx="47" cy="45" r="6" fill="${black}" class="mascot-pupil"/>
              <circle cx="75" cy="45" r="6" fill="${black}" class="mascot-pupil"/>
              <!-- Eye shine -->
              <circle cx="49" cy="43" r="2" fill="white"/>
              <circle cx="77" cy="43" r="2" fill="white"/>
            `}
          </g>

          <!-- Glasses -->
          <circle cx="46" cy="45" r="13" fill="none" stroke="${blue}" stroke-width="1.5"/>
          <circle cx="74" cy="45" r="13" fill="none" stroke="${blue}" stroke-width="1.5"/>
          <line x1="59" y1="45" x2="61" y2="45" stroke="${blue}" stroke-width="1.5"/>
          <!-- Glasses arms -->
          <line x1="33" y1="44" x2="28" y2="40" stroke="${blue}" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="87" y1="44" x2="92" y2="40" stroke="${blue}" stroke-width="1.2" stroke-linecap="round"/>

          <!-- Beak -->
          <path d="M56,56 L60,62 L64,56 Z" fill="${salmon}"/>

          <!-- Wings -->
          <ellipse cx="30" cy="62" rx="10" ry="18" fill="${purple}" transform="rotate(10 30 62)"/>
          <ellipse cx="90" cy="62" rx="10" ry="18" fill="${purple}" transform="rotate(-10 90 62)"/>

          <!-- Feet -->
          <ellipse cx="48" cy="90" rx="7" ry="3" fill="${blue}"/>
          <ellipse cx="72" cy="90" rx="7" ry="3" fill="${blue}"/>

          ${moodExtras}
        </g>

        ${mood === 'sleeping' ? `
          <!-- ZZZ -->
          <text x="88" y="28" font-family="var(--font-heading)" font-size="10" fill="${purple}" opacity="0.6" class="mascot-zzz">z</text>
          <text x="95" y="20" font-family="var(--font-heading)" font-size="13" fill="${purple}" opacity="0.4" class="mascot-zzz2">z</text>
          <text x="103" y="10" font-family="var(--font-heading)" font-size="16" fill="${purple}" opacity="0.2" class="mascot-zzz3">z</text>
        ` : ''}
      </svg>
    `;
  }

  function getMoodExtras(mood) {
    const { purple, blue } = MASCOT_COLORS;
    switch (mood) {
      case 'waving':
        return `
          <!-- Waving wing raised -->
          <ellipse cx="92" cy="52" rx="10" ry="16" fill="${purple}"
                   transform="rotate(-30 92 52)" class="mascot-wave"/>
        `;
      case 'searching':
        return `
          <!-- Magnifying glass -->
          <circle cx="98" cy="32" r="10" fill="none" stroke="${blue}" stroke-width="2"/>
          <line x1="105" y1="39" x2="112" y2="48" stroke="${blue}" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="98" cy="32" r="7" fill="white" opacity="0.3"/>
        `;
      default:
        return '';
    }
  }

  function renderSmall(size = 32) {
    const { black, salmon, blue, purple } = MASCOT_COLORS;
    return `
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" class="mascot-small">
        <ellipse cx="16" cy="16" rx="12" ry="13" fill="${purple}"/>
        <ellipse cx="16" cy="19" rx="8" ry="9" fill="${salmon}"/>
        <circle cx="12" cy="14" r="4" fill="white"/>
        <circle cx="20" cy="14" r="4" fill="white"/>
        <circle cx="12.5" cy="14" r="2.2" fill="${black}"/>
        <circle cx="20.5" cy="14" r="2.2" fill="${black}"/>
        <circle cx="13.3" cy="13.2" r="0.8" fill="white"/>
        <circle cx="21.3" cy="13.2" r="0.8" fill="white"/>
        <circle cx="12" cy="14" r="5" fill="none" stroke="${blue}" stroke-width="0.8"/>
        <circle cx="20" cy="14" r="5" fill="none" stroke="${blue}" stroke-width="0.8"/>
        <line x1="17" y1="14" x2="15" y2="14" stroke="${blue}" stroke-width="0.8"/>
        <path d="M14.5,19 L16,21.5 L17.5,19 Z" fill="${salmon}"/>
        <polygon points="7,6 10,12 5,10" fill="${purple}"/>
        <polygon points="25,6 22,12 27,10" fill="${purple}"/>
      </svg>
    `;
  }

  Alcove.mascot = { render, renderSmall };
})();
