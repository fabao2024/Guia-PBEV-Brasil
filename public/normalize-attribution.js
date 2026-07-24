(function restoreRouteAndNormalizeCampaign() {
  var redirectValue = null;
  try {
    redirectValue = window.sessionStorage.getItem('redirect');
    if (redirectValue) window.sessionStorage.removeItem('redirect');
  } catch (_error) {
    redirectValue = null;
  }

  if (redirectValue) {
    var redirect = redirectValue.charAt(0) === '/' ? redirectValue : '/' + redirectValue;
    var hashIndex = redirect.indexOf('#');
    var hash = hashIndex >= 0 ? redirect.slice(hashIndex) : '';
    var beforeHash = hashIndex >= 0 ? redirect.slice(0, hashIndex) : redirect;
    var queryIndex = beforeHash.indexOf('?');

    if (queryIndex < 0) {
      var malformedQueryIndex = beforeHash.search(/&utm_/i);
      if (malformedQueryIndex >= 0) queryIndex = malformedQueryIndex;
    }

    var pathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
    var search = queryIndex >= 0 ? '?' + beforeHash.slice(queryIndex + 1) : '';
    if (pathname === '/parceiros') pathname = '/parceiros/';

    window.history.replaceState(window.history.state, '', pathname + search + hash);
  }

  var currentSearch = window.location.search;
  var normalizedSearch = currentSearch.replace(/(?:~|%7E)and(?:~|%7E)/gi, '&');
  var normalizedPath = window.location.pathname === '/parceiros'
    ? '/parceiros/'
    : window.location.pathname;
  if (normalizedSearch === currentSearch && normalizedPath === window.location.pathname) return;

  window.history.replaceState(
    window.history.state,
    '',
    normalizedPath + normalizedSearch + window.location.hash
  );
})();
