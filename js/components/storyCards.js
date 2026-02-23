// Shareable Instagram Story Cards (1080×1920)
window.Alcove = window.Alcove || {};

(function() {
  const W = 1080;
  const H = 1920;
  const PAD = 80;
  const LOGO_COLORS = { salmon: '#F5A07A', blue: '#7AB8F5', purple: '#6B3A5C' };

  // DNA type icons (matches home.js DNA_ICONS but as raw SVG content for canvas rendering)
  const DNA_ICON_SVGS = {
    compass: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="COLOR" stroke-width="2" opacity="0.3"/><circle cx="24" cy="24" r="14" stroke="COLOR" stroke-width="1.5" opacity="0.15"/><polygon points="24,8 28,20 24,16 20,20" fill="COLOR"/><polygon points="24,40 20,28 24,32 28,28" fill="COLOR" opacity="0.5"/><polygon points="8,24 20,20 16,24 20,28" fill="COLOR" opacity="0.3"/><polygon points="40,24 28,28 32,24 28,20" fill="COLOR" opacity="0.3"/><circle cx="24" cy="24" r="3" fill="COLOR"/></svg>`,
    portal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="24" rx="16" ry="20" stroke="COLOR" stroke-width="2" opacity="0.3"/><ellipse cx="24" cy="24" rx="10" ry="14" stroke="COLOR" stroke-width="1.5" opacity="0.5"/><ellipse cx="24" cy="24" rx="4" ry="7" fill="COLOR" opacity="0.3"/><circle cx="20" cy="16" r="1.5" fill="COLOR" opacity="0.7"/><circle cx="28" cy="18" r="1" fill="COLOR" opacity="0.5"/><circle cx="18" cy="28" r="1" fill="COLOR" opacity="0.4"/><circle cx="30" cy="30" r="1.5" fill="COLOR" opacity="0.6"/></svg>`,
    map: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><path d="M8 12L18 8L30 14L40 10V36L30 40L18 34L8 38Z" stroke="COLOR" stroke-width="2" fill="COLOR" fill-opacity="0.1"/><line x1="18" y1="8" x2="18" y2="34" stroke="COLOR" stroke-width="1.5" opacity="0.3"/><line x1="30" y1="14" x2="30" y2="40" stroke="COLOR" stroke-width="1.5" opacity="0.3"/><circle cx="22" cy="20" r="3" stroke="COLOR" stroke-width="1.5" fill="COLOR" fill-opacity="0.3"/><path d="M22 17V13" stroke="COLOR" stroke-width="1.5"/><circle cx="34" cy="26" r="2" fill="COLOR" opacity="0.5"/></svg>`,
    anchor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="14" r="5" stroke="COLOR" stroke-width="2"/><circle cx="24" cy="14" r="2" fill="COLOR" opacity="0.5"/><line x1="24" y1="19" x2="24" y2="40" stroke="COLOR" stroke-width="2"/><line x1="16" y1="28" x2="32" y2="28" stroke="COLOR" stroke-width="2"/><path d="M10 34C10 28 17 24 24 24C31 24 38 28 38 34" stroke="COLOR" stroke-width="1.5" opacity="0.3"/></svg>`,
    heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><path d="M24 40C24 40 8 30 8 18C8 12 12 8 17 8C20 8 22 10 24 13C26 10 28 8 31 8C36 8 40 12 40 18C40 30 24 40 24 40Z" stroke="COLOR" stroke-width="2" fill="COLOR" fill-opacity="0.15"/><path d="M16 18C16 15 18 13 20 13" stroke="COLOR" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/></svg>`,
    gem: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><polygon points="24,6 38,18 24,42 10,18" stroke="COLOR" stroke-width="2" fill="COLOR" fill-opacity="0.1"/><polyline points="10,18 24,24 38,18" stroke="COLOR" stroke-width="1.5" opacity="0.4"/><line x1="24" y1="6" x2="24" y2="24" stroke="COLOR" stroke-width="1.5" opacity="0.3"/><line x1="24" y1="24" x2="24" y2="42" stroke="COLOR" stroke-width="1.5" opacity="0.2"/></svg>`,
    book: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><path d="M8 10C8 8 10 6 12 6H20C22 6 24 8 24 10V40C24 38 22 36 20 36H12C10 36 8 38 8 40V10Z" stroke="COLOR" stroke-width="2" fill="COLOR" fill-opacity="0.1"/><path d="M40 10C40 8 38 6 36 6H28C26 6 24 8 24 10V40C24 38 26 36 28 36H36C38 36 40 38 40 40V10Z" stroke="COLOR" stroke-width="2" fill="COLOR" fill-opacity="0.1"/></svg>`,
  };

  // Badge icon SVGs for canvas (stroke-based, 24px viewBox)
  const BADGE_ICON_SVGS = {
    flame: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="COLOR"><path d="M12 2c.5 0 1.5 2 2.5 4 .5 1 1.5 2 3 2.5 1 .3 2.5.5 3 1.5.3.7 0 2-.5 3-.5 1-1 2.5-1 4s.5 3 0 4-.5 1-1.5 1.5c-1 .5-2 0-3.5-.5s-3-1-4-1-2.5.5-4 1-2.5 1-3.5.5S2 21 1.5 20 2 17 2 15s-.5-3-1-4-.8-2.3-.5-3c.5-1 2-1.2 3-1.5 1.5-.5 2.5-1.5 3-2.5C8.5 2 9.5 0 10 0"/></svg>`,
    award: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
    trophy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 22V8a2 2 0 012-2v0a2 2 0 012 2v14"/><path d="M8 6h8v4a4 4 0 01-8 0V6z"/></svg>`,
    crown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M3 20h18"/></svg>`,
    book: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
    books: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg>`,
    library: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M9 4v16"/><path d="M14 4v16"/></svg>`,
    quote: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`,
  };

  // Render an SVG string to a canvas-drawable Image
  function svgToImage(svgStr) {
    return new Promise((resolve) => {
      // Strip standalone width/height attrs (not stroke-width etc.) then re-add from viewBox
      let svg = svgStr.replace(/(?<!-)width="[^"]*"\s?/, '').replace(/(?<!-)height="[^"]*"\s?/, '');
      const vbMatch = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
      if (vbMatch) {
        svg = svg.replace('<svg ', `<svg width="${vbMatch[1]}" height="${vbMatch[2]}" `);
      }
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }

  async function drawDNAIcon(ctx, iconName, color, x, y, size) {
    const svgTemplate = DNA_ICON_SVGS[iconName];
    if (!svgTemplate) return;
    const svgStr = svgTemplate.replace(/COLOR/g, color);
    const img = await svgToImage(svgStr);
    if (img) {
      ctx.drawImage(img, x, y, size, size);
    }
  }

  async function drawBadgeIcon(ctx, iconName, color, x, y, size) {
    const svgTemplate = BADGE_ICON_SVGS[iconName] || BADGE_ICON_SVGS.award;
    if (!svgTemplate) return;
    const svgStr = svgTemplate.replace(/COLOR/g, color);
    const img = await svgToImage(svgStr);
    if (img) {
      ctx.drawImage(img, x, y, size, size);
    }
  }

  // -- Drawing Utilities --

  function createCanvas() {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    return c;
  }

  function drawBackground(ctx) {
    ctx.fillStyle = '#FAF6F0';
    ctx.fillRect(0, 0, W, H);
  }

  function drawLogo(ctx, cx, y) {
    const r = 18;
    const gap = 48;
    const startX = cx - gap;

    ctx.fillStyle = LOGO_COLORS.salmon;
    ctx.beginPath();
    ctx.arc(startX, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = LOGO_COLORS.blue;
    ctx.beginPath();
    ctx.arc(startX + gap, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = LOGO_COLORS.purple;
    ctx.beginPath();
    ctx.arc(startX, y + gap, r, 0, Math.PI * 2);
    ctx.fill();

    // "Alcove" text
    ctx.fillStyle = '#3E2C1C';
    ctx.font = '500 42px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Alcove', cx, y + gap + 70);
  }

  function drawFooter(ctx) {
    ctx.fillStyle = '#8B6F4E';
    ctx.font = '300 28px "Raleway", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('alcovebooks.vercel.app', W / 2, H - 60);
  }

  function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line + (line ? ' ' : '') + word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, opts = {}) {
    const align = opts.align || 'center';
    ctx.textAlign = align;
    const lines = wrapText(ctx, text, maxWidth);
    const maxLines = opts.maxLines || lines.length;
    for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
      let lineText = lines[i];
      if (i === maxLines - 1 && lines.length > maxLines) {
        lineText = lineText.replace(/\s+\S*$/, '') + '...';
      }
      ctx.fillText(lineText, x, y + i * lineHeight);
    }
    return Math.min(lines.length, maxLines) * lineHeight;
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawStars(ctx, rating, x, y, size) {
    const starGap = size * 1.3;
    ctx.textAlign = 'left';
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i < Math.round(rating) ? '#C9A84C' : '#D5CEC5';
      drawStar(ctx, x + i * starGap, y, size * 0.55);
    }
  }

  function drawStar(ctx, cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const method = i === 0 ? 'moveTo' : 'lineTo';
      ctx[method](cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    ctx.closePath();
    ctx.fill();
  }

  async function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = url;
    });
  }

  function drawBookPlaceholder(ctx, title, x, y, w, h) {
    const colors = ['#8B6F4E', '#7A2E3B', '#5b7a9b', '#7a5c8e', '#5a7a4f'];
    const colorIndex = (title || '').charCodeAt(0) % colors.length;
    ctx.fillStyle = colors[colorIndex];
    roundedRect(ctx, x, y, w, h, 8);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `bold ${Math.round(h * 0.2)}px "Cormorant Garamond", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((title || '?').charAt(0).toUpperCase(), x + w / 2, y + h / 2);
    ctx.textBaseline = 'alphabetic';
  }

  // -- DNA Card --

  async function generateDNA() {
    const dna = Alcove.store.getReaderDNA();
    if (!dna || dna.locked) return null;

    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');

    drawBackground(ctx);
    drawLogo(ctx, W / 2, 100);

    // DNA icon — top right
    await drawDNAIcon(ctx, dna.icon, dna.accent, W - PAD - 100, 80, 100);

    let y = 280;

    // Label
    ctx.fillStyle = dna.accent;
    ctx.font = '600 28px "Raleway", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R E A D E R   D N A', W / 2, y);
    y += 84;

    // Title
    ctx.fillStyle = '#3E2C1C';
    ctx.font = '700 92px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(dna.title, W / 2, y);
    y += 64;

    // Subtitle
    ctx.fillStyle = '#6B635A';
    ctx.font = 'italic 46px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(dna.subtitle, W / 2, y);
    y += 72;

    // Accent bar
    const barW = 120;
    ctx.fillStyle = dna.accent;
    roundedRect(ctx, (W - barW) / 2, y, barW, 4, 2);
    ctx.fill();
    y += 64;

    // Description
    ctx.fillStyle = '#4A4440';
    ctx.font = '400 38px "Raleway", sans-serif';
    const descH = drawWrappedText(ctx, dna.description, W / 2, y, W - PAD * 2 - 40, 56, { maxLines: 5 });
    y += descH + 80;

    // Metrics — two-column layout (label+subtitle left, bar+% right)
    const m = dna.metrics;
    const fictionPct = 100 - m.nonficRatio;
    const metrics = [
      { label: 'Completion Rate', sub: 'Books finished vs started', value: m.completionRate },
      { label: 'Genre Diversity', sub: 'Variety across genres', value: m.genreDiversity },
      { label: 'Emotional Intensity', sub: 'Depth of emotional themes', value: m.emotionalIntensity },
      { label: 'Fiction Ratio', sub: `${m.nonficRatio}% nonfiction`, value: fictionPct },
      { label: 'Engagement Score', sub: 'Ratings, reviews, quotes & tropes', value: m.engagementScore },
    ];

    const metricX = PAD + 20;
    const barStartX = 480;
    const metricBarW = 440;
    const rightEdge = metricX + W - PAD * 2 - 40;

    metrics.forEach(metric => {
      // Label
      ctx.fillStyle = '#3E2C1C';
      ctx.font = '600 32px "Raleway", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(metric.label, metricX, y);

      // Subtitle
      ctx.fillStyle = '#8B8680';
      ctx.font = '400 26px "Raleway", sans-serif';
      ctx.fillText(metric.sub, metricX, y + 32);

      // Bar background
      const barH = 18;
      const barY = y - 4;
      ctx.fillStyle = '#E8E2D9';
      roundedRect(ctx, barStartX, barY, metricBarW, barH, 9);
      ctx.fill();

      // Bar fill
      ctx.fillStyle = dna.accent;
      const fillW = Math.max(0, metricBarW * (metric.value / 100));
      if (fillW > 0) {
        roundedRect(ctx, barStartX, barY, fillW, barH, 9);
        ctx.fill();
      }

      // Percentage (above bar)
      ctx.fillStyle = '#3E2C1C';
      ctx.font = '600 30px "Raleway", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(metric.value + '%', rightEdge, barY - 10);

      y += 132;
    });

    y += 20;

    // Divider
    ctx.strokeStyle = '#E0DDD8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(metricX, y);
    ctx.lineTo(rightEdge, y);
    ctx.stroke();
    y += 44;

    // Footer text
    ctx.fillStyle = '#8B8680';
    ctx.font = '400 30px "Raleway", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Based on ${m.booksAnalyzed} books analyzed`, metricX, y);

    drawFooter(ctx);
    return canvas;
  }

  // -- Top Books Card --

  async function generateTopBooks() {
    const topBookIds = Alcove.store.getTopBooks();
    if (!topBookIds || topBookIds.length === 0) return null;

    const books = topBookIds
      .map(id => {
        const book = Alcove.store.getCachedBook(id);
        if (!book) return null;
        return {
          ...book,
          rating: Alcove.store.getRating(id),
          review: Alcove.store.getReview(id),
        };
      })
      .filter(Boolean);

    if (books.length === 0) return null;

    const dna = Alcove.store.getReaderDNA();
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');

    drawBackground(ctx);
    drawLogo(ctx, W / 2, 100);

    let y = 270;

    // Label
    ctx.fillStyle = '#7A2E3B';
    ctx.font = '600 28px "Raleway", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('M Y   T O P   B O O K S', W / 2, y);
    y += 80;

    // Load all cover images in parallel
    const covers = await Promise.all(
      books.map(async (book) => {
        if (book.thumbnail) {
          try {
            const largeUrl = book.thumbnail.replace('zoom=1', 'zoom=3');
            return await loadImage(largeUrl);
          } catch {
            try {
              return await loadImage(book.thumbnail);
            } catch {
              return null;
            }
          }
        }
        return null;
      })
    );

    // Uniform book rows
    const thumbW = 200;
    const thumbH = 300;
    const rowX = PAD + 30;
    const maxBooks = Math.min(books.length, 3);

    for (let i = 0; i < maxBooks; i++) {
      const book = books[i];
      const cover = covers[i];

      // Cover with shadow
      if (cover) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 6;
        ctx.fillStyle = '#F0E8DA';
        roundedRect(ctx, rowX, y, thumbW, thumbH, 10);
        ctx.fill();
        ctx.clip();
        ctx.shadowColor = 'transparent';
        ctx.drawImage(cover, rowX, y, thumbW, thumbH);
        ctx.restore();
      } else {
        drawBookPlaceholder(ctx, book.title, rowX, y, thumbW, thumbH);
      }

      // Rank badge
      ctx.fillStyle = '#7A2E3B';
      ctx.beginPath();
      ctx.arc(rowX + thumbW - 8, y + 8, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 26px "Raleway", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`#${i + 1}`, rowX + thumbW - 8, y + 17);

      // Text area
      const textX = rowX + thumbW + 36;
      const textW = W - textX - PAD - 30;
      let textY = y + 42;

      // Title
      ctx.fillStyle = '#3E2C1C';
      ctx.font = '600 42px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'left';
      const tH = drawWrappedText(ctx, book.title, textX, textY, textW, 50, { align: 'left', maxLines: 2 });
      textY += tH + 12;

      // Author
      ctx.fillStyle = '#6B635A';
      ctx.font = '400 30px "Raleway", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('by ' + (book.authors || ['Unknown']).join(', '), textX, textY);
      textY += 48;

      // Stars
      if (book.rating) {
        drawStars(ctx, book.rating, textX, textY, 30);
        textY += 44;
      }

      // Review snippet
      if (book.review && book.review.text) {
        ctx.fillStyle = '#6B635A';
        ctx.font = 'italic 28px "Cormorant Garamond", Georgia, serif';
        drawWrappedText(ctx, `\u201C${book.review.text}\u201D`, textX, textY, textW, 38, { align: 'left', maxLines: 3 });
      }

      y += thumbH + 40;

      // Divider between books
      if (i < maxBooks - 1) {
        ctx.strokeStyle = '#D5CEC5';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD + 100, y);
        ctx.lineTo(W - PAD - 100, y);
        ctx.stroke();
        y += 40;
      }
    }

    // DNA badge
    if (dna && !dna.locked) {
      y += 60;

      const badgeW = 500;
      const badgeH = 80;
      const badgeX = (W - badgeW) / 2;

      ctx.fillStyle = dna.accent + '20';
      roundedRect(ctx, badgeX, y, badgeW, badgeH, 40);
      ctx.fill();

      ctx.strokeStyle = dna.accent + '40';
      ctx.lineWidth = 1.5;
      roundedRect(ctx, badgeX, y, badgeW, badgeH, 40);
      ctx.stroke();

      const iconSize = 44;
      await drawDNAIcon(ctx, dna.icon, dna.accent, badgeX + 18, y + (badgeH - iconSize) / 2, iconSize);

      ctx.fillStyle = '#3E2C1C';
      ctx.font = '500 30px "Raleway", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(dna.title, badgeX + 72, y + badgeH / 2 + 10);
    }

    drawFooter(ctx);
    return canvas;
  }

  // -- Stats Card --

  async function generateStats() {
    const stats = Alcove.store.getStats();
    const dna = Alcove.store.getReaderDNA();

    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');

    drawBackground(ctx);
    drawLogo(ctx, W / 2, 100);

    let y = 260;

    // Label
    ctx.fillStyle = '#8B6F4E';
    ctx.font = '600 26px "Raleway", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('M Y   R E A D I N G   S T A T S', W / 2, y);
    y += 100;

    // Stats grid — 2 columns, 3 rows
    const statItems = [
      { value: String(stats.booksRead), label: 'Books Read', color: '#8B6F4E' },
      { value: String(stats.totalBooks), label: 'In Library', color: '#7A2E3B' },
      { value: String(stats.totalRated), label: 'Books Rated', color: '#C9A84C' },
      { value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—', label: 'Avg Rating', color: '#7A8B6F' },
      { value: String(stats.totalQuotes), label: 'Quotes Saved', color: '#C4919B' },
      { value: String(stats.totalShelves), label: 'Shelves', color: '#5b7a9b' },
    ];

    const cardW = 400;
    const cardH = 220;
    const gapX = 60;
    const gapY = 40;
    const gridW = cardW * 2 + gapX;
    const startX = (W - gridW) / 2;

    for (let i = 0; i < statItems.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = startX + col * (cardW + gapX);
      const cy = y + row * (cardH + gapY);
      const stat = statItems[i];

      // Card background
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.06)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 4;
      roundedRect(ctx, cx, cy, cardW, cardH, 20);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Color accent line at top
      ctx.fillStyle = stat.color;
      roundedRect(ctx, cx + 30, cy + 16, 50, 4, 2);
      ctx.fill();

      // Value
      ctx.fillStyle = '#3E2C1C';
      ctx.font = '700 72px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(stat.value, cx + cardW / 2, cy + 120);

      // Label
      ctx.fillStyle = '#6B635A';
      ctx.font = '400 28px "Raleway", sans-serif';
      ctx.fillText(stat.label, cx + cardW / 2, cy + 170);
    }

    y += 3 * (cardH + gapY) + 40;

    // Awards section
    const earnedBadges = Alcove.store.getEarnedBadges();
    if (earnedBadges.length > 0) {
      // Section label
      ctx.fillStyle = '#8B6F4E';
      ctx.font = '600 24px "Raleway", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('A W A R D S', W / 2, y);
      y += 40;

      // Tier colors for badge backgrounds
      const TIER_COLORS = {
        bronze: { bg: '#fef5f1', border: '#F5A07A', text: '#c47a5a' },
        silver: { bg: '#f0f6fc', border: '#7AB8F5', text: '#4a7eb8' },
        gold: { bg: '#f5f0f4', border: '#9b6488', text: '#6B3A5C' },
        platinum: { bg: '#f0ebf0', border: '#6B3A5C', text: '#4a2840' },
      };

      // Show up to 6 badges in a row
      const maxBadges = Math.min(earnedBadges.length, 6);
      const badgeSize = 100;
      const badgeGap = 24;
      const totalBadgeW = maxBadges * badgeSize + (maxBadges - 1) * badgeGap;
      let bx = (W - totalBadgeW) / 2;

      for (let i = 0; i < maxBadges; i++) {
        const badge = earnedBadges[i];
        const tier = TIER_COLORS[badge.tier] || TIER_COLORS.bronze;

        // Badge circle background
        ctx.fillStyle = tier.bg;
        ctx.beginPath();
        ctx.arc(bx + badgeSize / 2, y + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Badge circle border
        ctx.strokeStyle = tier.border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx + badgeSize / 2, y + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
        ctx.stroke();

        // Badge icon (centered in circle)
        const iconS = 44;
        await drawBadgeIcon(ctx, badge.icon, tier.text, bx + (badgeSize - iconS) / 2, y + (badgeSize - iconS) / 2, iconS);

        bx += badgeSize + badgeGap;
      }

      y += badgeSize + 40;

      // "X awards earned" label
      ctx.fillStyle = '#6B635A';
      ctx.font = '400 24px "Raleway", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${earnedBadges.length} award${earnedBadges.length !== 1 ? 's' : ''} earned`, W / 2, y);
      y += 80;
    }

    // DNA badge
    if (dna && !dna.locked) {
      const badgeW = 500;
      const badgeH = 80;
      const badgeX = (W - badgeW) / 2;

      ctx.fillStyle = dna.accent + '20';
      roundedRect(ctx, badgeX, y, badgeW, badgeH, 40);
      ctx.fill();

      ctx.strokeStyle = dna.accent + '40';
      ctx.lineWidth = 1.5;
      roundedRect(ctx, badgeX, y, badgeW, badgeH, 40);
      ctx.stroke();

      // DNA icon
      const iconSize = 44;
      await drawDNAIcon(ctx, dna.icon, dna.accent, badgeX + 18, y + (badgeH - iconSize) / 2, iconSize);

      // DNA type text
      ctx.fillStyle = '#3E2C1C';
      ctx.font = '500 30px "Raleway", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(dna.title, badgeX + 72, y + badgeH / 2 + 10);
    }

    drawFooter(ctx);
    return canvas;
  }

  // -- Book Completion Card --

  async function generateBookCompletion(opts) {
    if (!opts || !opts.bookId) return null;
    const book = Alcove.store.getCachedBook(opts.bookId);
    if (!book) return null;

    const rating = Alcove.store.getRating(opts.bookId);
    const review = Alcove.store.getReview(opts.bookId);
    const dna = Alcove.store.getReaderDNA();
    const authors = (book.authors || ['Unknown']).join(', ');

    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');

    drawBackground(ctx);
    drawLogo(ctx, W / 2, 100);

    let y = 270;

    // Label
    ctx.fillStyle = '#7A2E3B';
    ctx.font = '600 28px "Raleway", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('J U S T   F I N I S H E D', W / 2, y);
    y += 80;

    // Load cover image
    let coverImg = null;
    if (book.thumbnail) {
      try {
        const largeUrl = book.thumbnail.replace('zoom=1', 'zoom=3');
        coverImg = await loadImage(largeUrl);
      } catch {
        try { coverImg = await loadImage(book.thumbnail); } catch { /* use placeholder */ }
      }
    }

    // Book cover — large centered
    const coverW = 400;
    const coverH = 600;
    const coverX = (W - coverW) / 2;

    if (coverImg) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = '#F0E8DA';
      roundedRect(ctx, coverX, y, coverW, coverH, 14);
      ctx.fill();
      ctx.clip();
      ctx.shadowColor = 'transparent';
      ctx.drawImage(coverImg, coverX, y, coverW, coverH);
      ctx.restore();
    } else {
      drawBookPlaceholder(ctx, book.title, coverX, y, coverW, coverH);
    }

    y += coverH + 56;

    // Title
    ctx.fillStyle = '#3E2C1C';
    ctx.font = '700 56px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    const titleH = drawWrappedText(ctx, book.title, W / 2, y, W - PAD * 2 - 40, 66, { maxLines: 2 });
    y += titleH + 18;

    // Author
    ctx.fillStyle = '#6B635A';
    ctx.font = '400 34px "Raleway", sans-serif';
    ctx.fillText('by ' + authors, W / 2, y);
    y += 56;

    // Rating
    if (rating) {
      drawStars(ctx, rating, W / 2 - 115, y, 44);
      y += 68;
    }

    // Review
    if (review && review.text) {
      y += 14;

      // Divider
      ctx.strokeStyle = '#D5CEC5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD + 150, y);
      ctx.lineTo(W - PAD - 150, y);
      ctx.stroke();
      y += 44;

      // Opening quote mark
      ctx.fillStyle = '#D5CEC5';
      ctx.font = '700 110px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('\u201C', W / 2, y);
      y += 28;

      // Review text
      ctx.fillStyle = '#4A4440';
      ctx.font = 'italic 38px "Cormorant Garamond", Georgia, serif';
      const reviewH = drawWrappedText(ctx, review.text, W / 2, y, W - PAD * 2 - 60, 54, { maxLines: 5 });
      y += reviewH + 36;
    }

    // DNA badge
    if (dna && !dna.locked) {
      y += 60;

      const badgeW = 500;
      const badgeH = 80;
      const badgeX = (W - badgeW) / 2;

      ctx.fillStyle = dna.accent + '20';
      roundedRect(ctx, badgeX, y, badgeW, badgeH, 40);
      ctx.fill();

      ctx.strokeStyle = dna.accent + '40';
      ctx.lineWidth = 1.5;
      roundedRect(ctx, badgeX, y, badgeW, badgeH, 40);
      ctx.stroke();

      // DNA icon
      const iconSize = 44;
      await drawDNAIcon(ctx, dna.icon, dna.accent, badgeX + 18, y + (badgeH - iconSize) / 2, iconSize);

      ctx.fillStyle = '#3E2C1C';
      ctx.font = '500 30px "Raleway", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(dna.title, badgeX + 72, y + badgeH / 2 + 10);
    }

    drawFooter(ctx);
    return canvas;
  }

  // -- Share Flow --

  function canvasToBlob(canvas) {
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/png', 1.0);
    });
  }

  async function share(cardType, opts) {
    const btn = document.querySelector(`.story-card-share-btn[data-share="${cardType}"]`) ||
                document.getElementById('share-book-completion-btn');
    const originalHTML = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="story-card-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>`;
    }

    try {
      let canvas;
      switch (cardType) {
        case 'dna':
          canvas = await generateDNA();
          break;
        case 'top-books':
          canvas = await generateTopBooks();
          break;
        case 'stats':
          canvas = await generateStats();
          break;
        case 'book-completion':
          canvas = await generateBookCompletion(opts);
          break;
      }

      if (!canvas) {
        Alcove.toast.show('Not enough data to generate this card', 'warning');
        return;
      }

      const blob = await canvasToBlob(canvas);
      const file = new File([blob], `alcove-${cardType}.png`, { type: 'image/png' });

      // Try Web Share API (mobile — ideal for Instagram stories)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Alcove Profile',
        });
        Alcove.toast.show('Card shared!', 'success');
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alcove-${cardType}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alcove.toast.show('Card saved!', 'success');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Story card error:', err);
        Alcove.toast.show('Failed to create card', 'error');
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      }
    }
  }

  Alcove.storyCards = { share, generateDNA, generateTopBooks, generateStats, generateBookCompletion };
})();
