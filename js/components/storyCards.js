// Shareable Instagram Story Cards (1080×1920)
window.Alcove = window.Alcove || {};

(function() {
  const W = 1080;
  const H = 1920;
  const PAD = 80;
  const LOGO_COLORS = { salmon: '#F5A07A', blue: '#7AB8F5', purple: '#6B3A5C' };

  // -- Drawing Utilities --

  function createCanvas() {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    return c;
  }

  function drawBackground(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#FAF6F0');
    grad.addColorStop(0.5, '#F5EFE5');
    grad.addColorStop(1, '#EDE5D8');
    ctx.fillStyle = grad;
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

    let y = 260;

    // Label
    ctx.fillStyle = dna.accent;
    ctx.font = '600 26px "Raleway", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R E A D E R   D N A', W / 2, y);
    y += 70;

    // Title
    ctx.fillStyle = '#3E2C1C';
    ctx.font = '700 72px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(dna.title, W / 2, y);
    y += 50;

    // Subtitle
    ctx.fillStyle = '#6B635A';
    ctx.font = 'italic 36px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(dna.subtitle, W / 2, y);
    y += 60;

    // Accent bar
    const barW = 120;
    ctx.fillStyle = dna.accent;
    roundedRect(ctx, (W - barW) / 2, y, barW, 4, 2);
    ctx.fill();
    y += 50;

    // Description
    ctx.fillStyle = '#4A4440';
    ctx.font = '400 32px "Raleway", sans-serif';
    const descH = drawWrappedText(ctx, dna.description, W / 2, y, W - PAD * 2 - 40, 46, { maxLines: 4 });
    y += descH + 60;

    // Metrics
    const m = dna.metrics;
    const fictionPct = 100 - m.nonficRatio;
    const metrics = [
      { label: 'Completion Rate', value: m.completionRate },
      { label: 'Genre Diversity', value: m.genreDiversity },
      { label: 'Emotional Intensity', value: m.emotionalIntensity },
      { label: 'Fiction Ratio', value: fictionPct },
      { label: 'Engagement Score', value: m.engagementScore },
    ];

    const metricX = PAD + 20;
    const metricW = W - PAD * 2 - 40;

    metrics.forEach(metric => {
      // Label
      ctx.fillStyle = '#3E2C1C';
      ctx.font = '500 28px "Raleway", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(metric.label, metricX, y);

      // Value
      ctx.textAlign = 'right';
      ctx.font = '600 28px "Raleway", sans-serif';
      ctx.fillStyle = dna.accent;
      ctx.fillText(metric.value + '%', metricX + metricW, y);

      y += 16;

      // Bar background
      const barH = 14;
      ctx.fillStyle = '#E8E2D9';
      roundedRect(ctx, metricX, y, metricW, barH, 7);
      ctx.fill();

      // Bar fill
      ctx.fillStyle = dna.accent;
      const fillW = Math.max(0, metricW * (metric.value / 100));
      if (fillW > 0) {
        roundedRect(ctx, metricX, y, fillW, barH, 7);
        ctx.fill();
      }

      y += barH + 40;
    });

    y += 20;

    // Footer text
    ctx.fillStyle = '#8B6F4E';
    ctx.font = '400 28px "Raleway", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Based on ${m.booksAnalyzed} books analyzed`, W / 2, y);

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
        };
      })
      .filter(Boolean);

    if (books.length === 0) return null;

    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');

    drawBackground(ctx);
    drawLogo(ctx, W / 2, 100);

    let y = 260;

    // Label
    ctx.fillStyle = '#7A2E3B';
    ctx.font = '600 26px "Raleway", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('M Y   T O P   B O O K S', W / 2, y);
    y += 80;

    // Load all cover images in parallel
    const covers = await Promise.all(
      books.map(async (book) => {
        if (book.thumbnail) {
          try {
            // Try larger cover first
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

    // Book #1 — Large featured
    const b1 = books[0];
    const c1 = covers[0];
    const coverW1 = 280;
    const coverH1 = 420;
    const coverX1 = (W - coverW1) / 2;

    // Cover shadow
    if (c1) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#F0E8DA';
      roundedRect(ctx, coverX1, y, coverW1, coverH1, 12);
      ctx.fill(); // fill to render shadow
      ctx.clip();
      ctx.shadowColor = 'transparent';
      ctx.drawImage(c1, coverX1, y, coverW1, coverH1);
      ctx.restore();
    } else {
      drawBookPlaceholder(ctx, b1.title, coverX1, y, coverW1, coverH1);
    }

    // Rank badge
    ctx.fillStyle = '#7A2E3B';
    ctx.beginPath();
    ctx.arc(coverX1 + coverW1 - 10, y + 10, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Raleway", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('#1', coverX1 + coverW1 - 10, y + 20);

    y += coverH1 + 30;

    // Title
    ctx.fillStyle = '#3E2C1C';
    ctx.font = '600 40px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    const titleH1 = drawWrappedText(ctx, b1.title, W / 2, y, W - PAD * 2, 50, { maxLines: 2 });
    y += titleH1 + 8;

    // Author
    ctx.fillStyle = '#6B635A';
    ctx.font = '400 30px "Raleway", sans-serif';
    ctx.fillText('by ' + (b1.authors || ['Unknown']).join(', '), W / 2, y);
    y += 16;

    // Rating
    if (b1.rating) {
      y += 20;
      drawStars(ctx, b1.rating, W / 2 - 80, y, 30);
      y += 20;
    }

    y += 50;

    // Divider
    ctx.strokeStyle = '#D5CEC5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD + 100, y);
    ctx.lineTo(W - PAD - 100, y);
    ctx.stroke();
    y += 50;

    // Books #2 & #3 — Smaller rows
    for (let i = 1; i < books.length && i < 3; i++) {
      const book = books[i];
      const cover = covers[i];
      const rowX = PAD + 60;
      const thumbW = 100;
      const thumbH = 150;

      // Cover
      if (cover) {
        ctx.save();
        roundedRect(ctx, rowX, y, thumbW, thumbH, 8);
        ctx.clip();
        ctx.drawImage(cover, rowX, y, thumbW, thumbH);
        ctx.restore();
      } else {
        drawBookPlaceholder(ctx, book.title, rowX, y, thumbW, thumbH);
      }

      // Rank badge
      ctx.fillStyle = '#8B6F4E';
      ctx.beginPath();
      ctx.arc(rowX + thumbW - 5, y + 5, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px "Raleway", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`#${i + 1}`, rowX + thumbW - 5, y + 13);

      // Title & Author
      const textX = rowX + thumbW + 30;
      const textW = W - textX - PAD - 40;

      ctx.fillStyle = '#3E2C1C';
      ctx.font = '600 34px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'left';
      const tH = drawWrappedText(ctx, book.title, textX, y + 40, textW, 42, { align: 'left', maxLines: 2 });

      ctx.fillStyle = '#6B635A';
      ctx.font = '400 26px "Raleway", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('by ' + (book.authors || ['Unknown']).join(', '), textX, y + 40 + tH + 10);

      if (book.rating) {
        drawStars(ctx, book.rating, textX, y + 40 + tH + 50, 24);
      }

      y += thumbH + 40;
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

      // Dot
      ctx.fillStyle = dna.accent;
      ctx.beginPath();
      ctx.arc(badgeX + 40, y + badgeH / 2, 10, 0, Math.PI * 2);
      ctx.fill();

      // DNA type text
      ctx.fillStyle = '#3E2C1C';
      ctx.font = '500 30px "Raleway", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(dna.title, badgeX + 65, y + badgeH / 2 + 10);
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

  async function share(cardType) {
    const btn = document.querySelector(`.story-card-share-btn[data-share="${cardType}"]`);
    const originalHTML = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="story-card-spinner"></span> Creating...`;
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

  Alcove.storyCards = { share, generateDNA, generateTopBooks, generateStats };
})();
