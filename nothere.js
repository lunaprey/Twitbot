document.addEventListener('DOMContentLoaded', function () {
  // Waits for the nothere.html popup to be opened before anything below is ran.

  document.querySelector('a').addEventListener('click', function (event) {
    if (event.currentTarget.hasAttribute('data-external-link')) {
      // Only care about links with the "data-external-link" attribute.

      const href = event.currentTarget.getAttribute('href');
      const target = event.currentTarget.getAttribute('target');

      if (href) {
        if (target === '_blank') {
          // Open a new tab for the linked page.
          chrome.tabs.create({ active: true, url: href });
        } else {
          chrome.tabs.query({ 'active': true,'currentWindow': true }, function (tabs) {
            if (tabs[0]) {
              // We have a current tab available for navigation to linked page.
              chrome.tabs.update(tabs[0].id, { url: href });
            } else {
              // Somehow no current tab available for navigation to linked page.
              // Instead open a new tab for the linked page.
              chrome.tabs.create({ active: true, url: href });
            }
          });
        }
      }
    }
  }, false);
}, false);
