// ─── AksharaFlow · Content Script v5 ────────────────────────────────────────
(function () {
  'use strict';
  if (document.getElementById('aksharaflow-fab')) return;

  // ── Key maps ────────────────────────────────────────────────────────────────
  const LETTER_MAP = {
    q:'ண', w:'ற', e:'எ', r:'ர', t:'த', y:'ய', u:'உ', i:'இ', o:'ஒ', p:'ப',
    a:'அ', s:'ஸ', d:'ட', f:'ந', g:'ங', h:'ஹ', j:'ஞ', k:'க', l:'ல',
    z:'ழ', x:'ள', c:'ச', v:'வ', b:'ஜ', n:'ன', m:'ம',
  };
  const NUMBER_MAP = { '1':'ஆ','2':'ஈ','3':'ஊ','4':'ஏ','5':'ஐ','6':'ஓ','7':'ஔ','8':'ஃ' };
  const MATRA_MAP  = {
    '!':'\u0BBE','@':'\u0BBF','#':'\u0BC0','$':'\u0BC1','%':'\u0BC2',
    '^':'\u0BC6','&':'\u0BC7','*':'\u0BC8','(':'\u0BCA',')':'\u0BCB',
    '_':'\u0BCC','+':'\u0BCD',
  };

  const KEY_ROWS = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m'],
  ];
  const NUMBER_KEYS = [
    {num:'1',ta:'ஆ'},{num:'2',ta:'ஈ'},{num:'3',ta:'ஊ'},{num:'4',ta:'ஏ'},
    {num:'5',ta:'ஐ'},{num:'6',ta:'ஓ'},{num:'7',ta:'ஔ'},{num:'8',ta:'ஃ'},
  ];
  const MATRA_LABELS = [
    {sym:'!',label:'ா',num:'1'},{sym:'@',label:'ி',num:'2'},
    {sym:'#',label:'ீ',num:'3'},{sym:'$',label:'ு',num:'4'},
    {sym:'%',label:'ூ',num:'5'},{sym:'^',label:'ெ',num:'6'},
    {sym:'&',label:'ே',num:'7'},{sym:'*',label:'ை',num:'8'},
    {sym:'(',label:'ொ',num:'9'},{sym:')',label:'ோ',num:'0'},
    {sym:'_',label:'ௌ',num:'-'},{sym:'+',label:'்',num:'='},
  ];

  // ── State ────────────────────────────────────────────────────────────────────
  let enabled     = false;
  let padVisible  = true;
  let activeInput = null;

  // ── Create FAB (Floating Action Button — always on screen) ───────────────────
  const fab = document.createElement('div');
  fab.id = 'aksharaflow-fab';
  fab.title = 'AksharaFlow – Show/Hide Keyboard';
  fab.innerHTML = `<span class="af-fab-icon">⌨</span><span class="af-fab-label">அ</span>`;
  document.body.appendChild(fab);

  fab.addEventListener('mousedown', e => e.preventDefault()); // don't steal focus
  fab.addEventListener('click', () => {
    padVisible = !padVisible;
    padVisible ? showPad() : hidePad();
    chrome.storage.local.set({ padVisible });
  });
  makeDraggable(fab, fab, true);

  // ── Create floating pad ──────────────────────────────────────────────────────
  const pad = document.createElement('div');
  pad.id = 'aksharaflow-pad';
  pad.innerHTML = buildPadHTML();
  document.body.appendChild(pad);

  // Set initial position via JS (not CSS) so drag always works
  pad.style.position = 'fixed';
  pad.style.bottom   = '76px';
  pad.style.right    = '16px';

  makeDraggable(pad, pad.querySelector('#af-drag-handle'), false);

  // ── Prevent pad from stealing focus on ANY interaction ──────────────────────
  pad.addEventListener('mousedown', e => {
    e.preventDefault(); // critical — keeps activeInput focused
  });

  pad.querySelector('#af-toggle').addEventListener('change', e => {
    enabled = e.target.checked;
    chrome.storage.local.set({ tamilEnabled: enabled });
    updateUI();
  });

  pad.querySelector('#af-minimize').addEventListener('click', e => {
    e.stopPropagation();
    padVisible = false;
    hidePad();
    chrome.storage.local.set({ padVisible });
  });

  // ── Pad key clicks ───────────────────────────────────────────────────────────
  pad.addEventListener('click', e => {
    const btn = e.target.closest('[data-key],[data-num],[data-matra]');
    if (!btn) return;
    // Restore focus to the last known input before inserting
    const target = activeInput;
    if (target && isEditable(target)) {
      target.focus({ preventScroll: true });
    }
    if (btn.dataset.key)   insertRaw(LETTER_MAP[btn.dataset.key]);
    if (btn.dataset.num)   insertRaw(NUMBER_MAP[btn.dataset.num]);
    if (btn.dataset.matra) insertRaw(MATRA_MAP[btn.dataset.matra]);
  });

  // ── Message bus from popup ───────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === 'TOGGLE_TAMIL') { enabled = msg.value; updateUI(); }
    if (msg.type === 'TOGGLE_PAD')   { padVisible = msg.value; padVisible ? showPad() : hidePad(); }
  });

  // ── Load saved state ─────────────────────────────────────────────────────────
  chrome.storage.local.get(['tamilEnabled','padVisible'], res => {
    enabled    = res.tamilEnabled ?? false;
    padVisible = res.padVisible   ?? true;
    updateUI();
    padVisible ? showPad() : hidePad();
  });

  // ── Track active input element ───────────────────────────────────────────────
  document.addEventListener('focusin', e => {
    if (!e.target) return;
    if (e.target.closest('#aksharaflow-pad,#aksharaflow-fab')) return;
    const ce = e.target.closest('[contenteditable="true"],[contenteditable=""]');
    if (ce) { activeInput = ce; return; }
    if (isEditable(e.target)) activeInput = e.target;
  }, true);

  document.addEventListener('click', e => {
    if (!e.target) return;
    if (e.target.closest('#aksharaflow-pad,#aksharaflow-fab')) return;
    const ce = e.target.closest('[contenteditable="true"],[contenteditable=""]');
    if (ce) { activeInput = ce; return; }
    if (isEditable(e.target)) activeInput = e.target;
  }, true);

  // ── Keyboard intercept ───────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (!enabled) return;
    const el = document.activeElement;
    if (!el || !isEditable(el)) return;
    if (el.closest && el.closest('#aksharaflow-pad,#aksharaflow-fab')) return;
    activeInput = el;

    const k = e.key;
    if (MATRA_MAP[k]) {
      e.preventDefault(); insertRaw(MATRA_MAP[k]); flash('[data-matra="'+CSS.escape(k)+'"]'); return;
    }
    if (NUMBER_MAP[k] && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault(); insertRaw(NUMBER_MAP[k]); flash('[data-num="'+k+'"]'); return;
    }
    const lower = k.toLowerCase();
    if (LETTER_MAP[lower] && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault(); insertRaw(LETTER_MAP[lower]); flash('[data-key="'+lower+'"]');
    }
  }, true);

  // ── Insert character — works on React, Vue, Google, ChatGPT, plain inputs ─────
  function insertRaw(ch) {
    if (!ch) return;
    const el = activeInput || document.activeElement;
    if (!el || !isEditable(el)) return;

    el.focus({ preventScroll: true });

    // Strategy 1: execCommand — native, works in contenteditable & most inputs
    try { if (document.execCommand('insertText', false, ch)) return; } catch (_) {}

    const fireEvents = (target, data) => {
      try { target.dispatchEvent(new InputEvent('beforeinput',{bubbles:true,cancelable:true,inputType:'insertText',data})); } catch(_){}
      target.dispatchEvent(new InputEvent('input',{bubbles:true,cancelable:false,inputType:'insertText',data}));
    };
    const nativeSetter = (proto, prop) => Object.getOwnPropertyDescriptor(proto, prop)?.set;

    // Strategy 2: direct value mutation (React/Vue native setter trick)
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const proto  = el.tagName === 'INPUT' ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
      const setter = nativeSetter(proto, 'value');
      const s  = el.selectionStart ?? el.value.length;
      const e2 = el.selectionEnd   ?? s;
      const next = el.value.slice(0,s) + ch + el.value.slice(e2);
      if (setter) setter.call(el, next); else el.value = next;
      el.setSelectionRange(s+ch.length, s+ch.length);
      fireEvents(el, ch);
      return;
    }

    // Strategy 3: contenteditable (ChatGPT, Claude, Notion, etc.)
    if (el.isContentEditable) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const node = document.createTextNode(ch);
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      fireEvents(el, ch);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function isEditable(el) {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') {
      const type = (el.type||'text').toLowerCase();
      return !['submit','button','reset','image','checkbox','radio','file','color','range'].includes(type);
    }
    if (el.isContentEditable) return true;
    const role = el.getAttribute?.('role');
    if (role === 'textbox' || role === 'combobox' || role === 'searchbox') return true;
    let p = el.parentElement, d = 0;
    while (p && d < 8) { if (p.isContentEditable) return true; p = p.parentElement; d++; }
    return false;
  }

  function flash(sel) {
    try {
      const el = pad.querySelector(sel);
      if (!el) return;
      el.classList.add('af-key-pressed');
      setTimeout(() => el.classList.remove('af-key-pressed'), 140);
    } catch(_){}
  }

  function showPad() {
    pad.style.display = 'block';
    fab.classList.add('af-fab-open');
    fab.querySelector('.af-fab-label').textContent = '✕';
  }
  function hidePad() {
    pad.style.display = 'none';
    fab.classList.remove('af-fab-open');
    fab.querySelector('.af-fab-label').textContent = 'அ';
  }
  function updateUI() {
    const tog = pad.querySelector('#af-toggle');
    if (tog) tog.checked = enabled;
    pad.dataset.active = enabled ? '1' : '0';
    fab.dataset.active  = enabled ? '1' : '0';
  }

  // ── Build pad HTML ───────────────────────────────────────────────────────────
  function buildPadHTML() {
    const isVowel = k => ['a','e','i','o','u'].includes(k);

    // Row 0 – Matras (top)
    const matraHTML = MATRA_LABELS.map(m =>
      `<button class="af-key af-matra-key" data-matra="${m.sym}" title="Shift+${m.num} → ${m.label}">
        <span class="af-main">${m.label}</span><span class="af-sub">⇧${m.num}</span>
      </button>`).join('');

    // Row 1 – Long vowels
    const vowelLongHTML = NUMBER_KEYS.map(k =>
      `<button class="af-key af-num-key" data-num="${k.num}" title="${k.num} → ${k.ta}">
        <span class="af-main">${k.ta}</span><span class="af-sub">${k.num}</span>
      </button>`).join('');

    // Rows 2‑4 – Consonants + short vowels
    const conRowsHTML = KEY_ROWS.map((row, ri) =>
      `<div class="af-row" data-row="${ri}">${row.map(k =>
        `<button class="af-key${isVowel(k)?' af-vowel-key':''}" data-key="${k}" title="${k.toUpperCase()} → ${LETTER_MAP[k]}">
          <span class="af-main">${LETTER_MAP[k]||k}</span><span class="af-sub">${k.toUpperCase()}</span>
        </button>`).join('')}</div>`).join('');

    return `
      <div id="af-drag-handle" title="Drag to move">
        <div class="af-drag-dots">${'<span></span>'.repeat(6)}</div>
        <div class="af-logo-row">
          <div class="af-logo-mark"><span>அ</span></div>
          <span class="af-logo-text">AksharaFlow</span>
          <span class="af-status-dot"></span>
        </div>
        <div class="af-header-right">
          <label class="af-switch" title="Toggle Tamil mode">
            <input type="checkbox" id="af-toggle">
            <span class="af-slider"></span>
          </label>
          <button class="af-minimize-btn" id="af-minimize" title="Hide Keyboard">✕</button>
        </div>
      </div>
      <div id="af-hint">
        <span>⇧+num = matra &nbsp;·&nbsp; 1‑8 = long vowel &nbsp;·&nbsp; letter = consonant</span>
        <span class="af-lang-badge">தமிழ்</span>
      </div>
      <div id="af-keys">
        <div class="af-key-row af-row-matra">
          <div class="af-row-label">matras</div>
          <div class="af-row-keys">${matraHTML}</div>
        </div>
        <div class="af-key-row af-row-vowels">
          <div class="af-row-label">long vowels</div>
          <div class="af-row-keys">${vowelLongHTML}</div>
        </div>
        <div class="af-key-row af-row-cons">
          <div class="af-row-label">consonants</div>
          ${conRowsHTML}
        </div>
      </div>
      <div id="af-footer">AksharaFlow · Full Tamil Alphabet · 34 characters</div>`;
  }

  // ── Draggable — shared by FAB and pad ────────────────────────────────────────
  function makeDraggable(el, handle, isFab) {
    let startX, startY, origX, origY, moved = false;

    handle.addEventListener('mousedown', e => {
      if (!isFab && e.target.closest('label,input,#af-toggle')) return;
      e.preventDefault();

      // Convert to top/left so drag math works (CSS bottom/right fight JS)
      const rect = el.getBoundingClientRect();
      el.style.top    = rect.top  + 'px';
      el.style.left   = rect.left + 'px';
      el.style.bottom = 'auto';
      el.style.right  = 'auto';

      origX = rect.left; origY = rect.top;
      startX = e.clientX; startY = e.clientY;
      moved = false;

      const onMove = e2 => {
        const dx = e2.clientX - startX;
        const dy = e2.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
        el.style.left = (origX + dx) + 'px';
        el.style.top  = (origY + dy) + 'px';
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        handle.style.cursor = isFab ? 'pointer' : 'grab';
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      handle.style.cursor = isFab ? 'grabbing' : 'grabbing';
    });
  }

})();
