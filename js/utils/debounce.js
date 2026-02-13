window.Alcove = window.Alcove || {};

Alcove.debounce = function(fn, delay = 400) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};
