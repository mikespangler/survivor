(function() {
  try {
    var mode = localStorage.getItem('chakra-ui-color-mode') || 'dark';
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
    document.body.className = 'chakra-ui-' + mode;
  } catch (e) {}
})();
