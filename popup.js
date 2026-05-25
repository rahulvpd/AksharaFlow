// ── AksharaFlow · Popup Script v4 ────────────────────────────────────────────

const tamilToggle = document.getElementById('tamilToggle');
const padBtn      = document.getElementById('padBtn');
const padBtnText  = document.getElementById('padBtnText');
const padBtnSub   = document.getElementById('padBtnSub');
const padBadge    = document.getElementById('padBadge');
const dot         = document.getElementById('sDot');
const label       = document.getElementById('sLabel');

let padVisible = true;

// ── Sync status dot ───────────────────────────────────────────────────────────
function syncStatus() {
  const on = tamilToggle.checked;
  dot.classList.toggle('on', on);
  label.classList.toggle('on', on);
  label.textContent = on ? 'Tamil mode active' : 'Tamil mode off';
}

// ── Sync pad button UI ────────────────────────────────────────────────────────
function syncPadBtn() {
  padBtn.classList.toggle('pad-on', padVisible);
  padBtnText.textContent = padVisible ? 'Hide Keypad'  : 'Show Keypad';
  padBtnSub.textContent  = padVisible ? 'Floating keyboard is visible' : 'Click to show floating keyboard';
  padBadge.textContent   = padVisible ? 'ON' : 'OFF';
}

// ── Load saved state on open ──────────────────────────────────────────────────
chrome.storage.local.get(['tamilEnabled', 'padVisible'], (res) => {
  tamilToggle.checked = res.tamilEnabled ?? false;
  padVisible          = res.padVisible   ?? true;
  syncStatus();
  syncPadBtn();
});

// ── Tamil mode toggle ─────────────────────────────────────────────────────────
tamilToggle.addEventListener('change', () => {
  const val = tamilToggle.checked;
  chrome.storage.local.set({ tamilEnabled: val });
  syncStatus();
  sendToActiveTab({ type: 'TOGGLE_TAMIL', value: val });
});

// ── Pad show/hide button ──────────────────────────────────────────────────────
padBtn.addEventListener('click', () => {
  padVisible = !padVisible;
  chrome.storage.local.set({ padVisible });
  syncPadBtn();

  // Try messaging content script; if not injected yet, inject it first
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;

    // Skip chrome:// and extension pages
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PAD', value: padVisible })
      .catch(() => {
        // Content script not yet injected (e.g. page was open before install)
        // Inject it now, then send the message
        chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['overlay.css'] })
          .then(() => chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }))
          .then(() => chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PAD', value: padVisible }))
          .catch(() => {});
      });
  });
});

// ── Helper ────────────────────────────────────────────────────────────────────
function sendToActiveTab(msg) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
    chrome.tabs.sendMessage(tab.id, msg).catch(() => {});
  });
}
