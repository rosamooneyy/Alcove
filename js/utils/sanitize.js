window.Alcove = window.Alcove || {};

Alcove.sanitize = function(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

Alcove.sanitizeHTML = function(html) {
  if (!html) return '';
  const allowed = ['b', 'i', 'em', 'strong', 'br', 'p'];
  const div = document.createElement('div');
  div.innerHTML = html;
  const els = div.querySelectorAll('*');
  els.forEach(el => {
    if (!allowed.includes(el.tagName.toLowerCase())) {
      el.replaceWith(...el.childNodes);
    } else {
      // Remove all attributes from allowed elements
      while (el.attributes.length > 0) {
        el.removeAttribute(el.attributes[0].name);
      }
    }
  });
  return div.innerHTML;
};
