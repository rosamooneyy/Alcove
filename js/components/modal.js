window.Alcove = window.Alcove || {};

(function() {
  let modalRoot = null;
  let currentOptions = null;

  function getRoot() {
    if (!modalRoot) modalRoot = document.getElementById('modal-root');
    return modalRoot;
  }

  function open(options = {}) {
    const root = getRoot();
    if (!root) return;

    currentOptions = options;
    const { title = '', content = '', closable = true, wide = false, size = '', actions = [], onInit, onClose } = options;

    // Support both 'wide' and 'size: large' for modal width
    const isLarge = wide || size === 'large';
    const sizeClass = isLarge ? 'modal-large' : '';

    // Build actions HTML if provided
    const actionsHtml = actions.length > 0 ? `
      <div class="modal-actions">
        ${actions.map(a => {
          if (a.action === 'close') {
            return `<button type="button" class="btn ${a.className || 'btn-secondary'}" data-modal-close>${a.label}</button>`;
          }
          return `<button type="button" class="btn ${a.className || 'btn-primary'}" ${a.id ? `id="${a.id}"` : ''}>${a.label}</button>`;
        }).join('')}
      </div>
    ` : '';

    root.innerHTML = `
      <div class="modal-overlay ${closable ? 'modal-closable' : ''}">
        <div class="modal ${sizeClass}" role="dialog" aria-modal="true" ${title ? `aria-label="${Alcove.sanitize(title)}"` : ''}>
          ${title ? `<div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            ${closable ? '<button class="modal-close" aria-label="Close">&times;</button>' : ''}
          </div>` : (closable ? '<button class="modal-close modal-close-abs" aria-label="Close">&times;</button>' : '')}
          <div class="modal-body">
            ${content}
          </div>
          ${actionsHtml}
        </div>
      </div>
    `;

    // Animate in
    requestAnimationFrame(() => {
      root.querySelector('.modal-overlay').classList.add('modal-visible');
    });

    // Bind close buttons
    if (closable) {
      const overlay = root.querySelector('.modal-overlay');
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
      });
      const closeBtn = root.querySelector('.modal-close');
      if (closeBtn) closeBtn.addEventListener('click', close);
      document.addEventListener('keydown', handleEsc);
    }

    // Bind action close buttons
    root.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', close);
    });

    if (onInit) {
      requestAnimationFrame(() => onInit());
    }
  }

  function close() {
    const root = getRoot();
    if (!root) return;

    const overlay = root.querySelector('.modal-overlay');
    if (overlay) {
      overlay.classList.remove('modal-visible');
      overlay.addEventListener('transitionend', () => {
        root.innerHTML = '';
      });
    } else {
      root.innerHTML = '';
    }

    document.removeEventListener('keydown', handleEsc);

    if (currentOptions && currentOptions.onClose) {
      currentOptions.onClose();
    }
    currentOptions = null;
  }

  function handleEsc(e) {
    if (e.key === 'Escape') close();
  }

  function updateContent(html) {
    const root = getRoot();
    const body = root.querySelector('.modal-body');
    if (body) body.innerHTML = html;
  }

  Alcove.modal = { open, close, updateContent };
})();
