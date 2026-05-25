// ── AksharaFlow · Background Service Worker v4 ───────────────────────────────

// Set defaults on first install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['tamilEnabled', 'padVisible'], (res) => {
    if (res.tamilEnabled === undefined) {
      chrome.storage.local.set({ tamilEnabled: false, padVisible: true, lang: 'ta' });
    }
  });
});

// ── Inject content script into already-open tabs on install/update ────────────
// This is the fix for "keyboard doesn't work on pages open before install".
// Chrome only auto-injects content_scripts into tabs opened AFTER install.
// For existing tabs we must do it manually.
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        if (!tab.url) continue;
        if (tab.url.startsWith('chrome://')) continue;
        if (tab.url.startsWith('chrome-extension://')) continue;
        if (tab.url.startsWith('about:')) continue;
        chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['overlay.css'] }).catch(() => {});
        chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }).catch(() => {});
      }
    });
  }
});
