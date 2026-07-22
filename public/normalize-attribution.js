(function normalizeCampaignSeparators() {
  var currentSearch = window.location.search;
  var normalizedSearch = currentSearch.replace(/(?:~|%7E)and(?:~|%7E)/gi, '&');
  if (normalizedSearch === currentSearch) return;

  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname + normalizedSearch + window.location.hash
  );
})();
