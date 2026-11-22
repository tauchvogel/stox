'use strict';
(() => {
  // ---------- Helfer ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = n => Number(n).toLocaleString('de-DE', { maximumFractionDigits: 3 });
  const WARN_DAYS = 90;

  // BBK-Richtwerte: Menge pro Person für 10 Tage
  const CATS = [
    { id: 'getraenke', name: 'Getränke', per10: 20, unit: 'l' },
    { id: 'getreide', name: 'Getreide, Brot, Nudeln, Reis, Kartoffeln', per10: 3.5, unit: 'kg' },
    { id: 'gemuese', name: 'Gemüse, Hülsenfrüchte', per10: 4.0, unit: 'kg' },
    { id: 'obst', name: 'Obst, Nüsse', per10: 2.5, unit: 'kg' },
    { id: 'milch', name: 'Milch, Milchprodukte', per10: 2.6, unit: 'kg' },
    { id: 'fisch', name: 'Fisch, Fleisch, Eier', per10: 1.5, unit: 'kg' },
    { id: 'fett', name: 'Fette, Öle', per10: 0.357, unit: 'kg' },
    { id: 'sonstiges', name: 'Sonstiges (Salz, Zucker, Brühe …)', per10: null },
    { id: 'technik', name: 'Hygiene, Medizin, Technik', per10: null }
  ];

  const state = { items: [], checks: {}, settings: { persons: 4, days: 14, lastExport: null, counter: 0 } };
  let persisted = null, offlineReady = false, pendingPrintIds = null;

  // ---------- Speicher (IndexedDB + localStorage als Reserve) ----------
  const DB = 'notvorrat', STORE = 'kv', LS = 'notvorrat-state';
  const idb = () => new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const idbGet = async k => { const db = await idb(); return new Promise((res, rej) => { const t = db.transaction(STORE).objectStore(STORE).get(k); t.onsuccess = () => res(t.result); t.onerror = () => rej(t.error); }); };
  const idbSet = async (k, v) => { const db = await idb(); return new Promise((res, rej) => { const t = db.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(v, k); t.oncomplete = () => res(); t.onerror = () => rej(t.error); }); };

  async function load() {
    let data = null;
    try { data = await idbGet('state'); } catch (e) { /* weiter */ }
    if (!data) { try { const s = localStorage.getItem(LS); if (s) data = JSON.parse(s); } catch (e) { /* weiter */ } }
    if (data) {
      state.items = Array.isArray(data.items) ? data.items : [];
      Object.assign(state.settings, data.settings || {});
      state.checks = data.checks && typeof data.checks === 'object' ? data.checks : {};
    }
  }
  function persist() {
    const snap = JSON.parse(JSON.stringify(state));
    idbSet('state', snap).catch(() => {});
    try { localStorage.setItem(LS, JSON.stringify(snap)); } catch (e) { /* voll/gesperrt */ }
  }

  // ---------- Datum & Menge ----------
  function daysLeft(mhd) {
    if (!mhd) return null;
    const [y, m, d] = mhd.split('-').map(Number);
    const t = new Date(y, m - 1, d), now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((t - now) / 86400000);
  }
  const fmtDate = mhd => { if (!mhd) return '–'; const [y, m, d] = mhd.split('-'); return `${d}.${m}.${y}`; };
  function status(it) {
    if (!(+it.qty > 0)) return (+it.want > 0) ? 'buy' : 'empty';
    const d = daysLeft(it.mhd);
    if (d === null) return 'none';
    if (d < 0) return 'expired';
    return d <= WARN_DAYS ? 'soon' : 'ok';
  }
  function badge(it) {
    const s = status(it), d = daysLeft(it.mhd);
    if (s === 'empty') return 'leer';
    if (s === 'buy') return 'zu kaufen';
    if (d === null) return '';
    if (d < 0) return `abgelaufen (${-d} T.)`;
    if (d === 0) return 'heute';
    return d <= 365 ? `in ${d} T.` : `in ${num(Math.round(d / 36.5) / 10)} J.`;
  }
  const qtyStr = (n, it) => (it.unit === 'Stk' || !(+it.size)) ? `${num(n)} Stk.` : `${num(n)} × ${num(it.size)} ${it.unit}`;
  const fmtQty = it => status(it) === 'buy' ? `kaufen: ${qtyStr(it.want, it)}`
    : qtyStr(it.qty, it) + (+it.want > +it.qty ? ` (Ziel ${num(it.want)})` : '');
  function toBase(it) {
    const n = (+it.qty || 0) * (+it.size || 0);
    switch (it.unit) {
      case 'kg': return { k: 'kg', v: n };
      case 'g': return { k: 'kg', v: n / 1000 };
      case 'l': return { k: 'l', v: n };
      case 'ml': return { k: 'l', v: n / 1000 };
      default: return { k: null, v: 0 };
    }
  }
  function nextId() {
    const max = state.items.reduce((m, i) => { const n = Number((/^P-(\d+)$/.exec(i.id) || [])[1]); return n > m ? n : m; }, 0);
    const n = Math.max(max, state.settings.counter || 0) + 1;
    return 'P-' + String(n).padStart(3, '0');
  }
  const idNum = id => Number((/^P-(\d+)$/.exec(id) || [])[1]) || 0;
  const parseId = text => { const m = /\bP-\d{1,6}\b/i.exec(text || ''); return m ? m[0].toUpperCase() : null; };
  const qrText = it => `${it.id}|${String(it.name).replace(/\|/g, '/').slice(0, 28)}|MHD ${it.mhd || '-'}`;

  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ---------- Tabs ----------
  function showTab(name) {
    if (name !== 'scan') stopScan();
    $$('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + name));
    const navKey = ['labels', 'needs', 'data', 'about'].includes(name) ? 'more' : name;
    $$('.bottom button').forEach(b => b.classList.toggle('active', b.dataset.tab === navKey));
    $('#addBtn').style.display = name === 'lager' ? '' : 'none';
    window.scrollTo(0, 0);
    renderAll();
  }

  // ---------- Lagerliste ----------
  function renderList() {
    const q = $('#q').value.trim().toLowerCase(), cat = $('#fCat').value, st = $('#fStatus').value, sort = $('#fSort').value;
    let arr = state.items.filter(it => {
      if (cat && it.cat !== cat) return false;
      if (st && status(it) !== st) return false;
      if (q && !`${it.id} ${it.name} ${it.loc || ''} ${it.note || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const mhdKey = it => it.mhd || '9999-99-99';
    const cmp = {
      mhd: (a, b) => mhdKey(a).localeCompare(mhdKey(b)) || a.name.localeCompare(b.name, 'de'),
      name: (a, b) => a.name.localeCompare(b.name, 'de'),
      loc: (a, b) => (a.loc || '~').localeCompare(b.loc || '~', 'de') || mhdKey(a).localeCompare(mhdKey(b)),
      id: (a, b) => idNum(a.id) - idNum(b.id)
    }[sort];
    arr.sort(cmp);

    $('#list').innerHTML = arr.map(it => `
      <li class="row ${status(it)}" data-id="${esc(it.id)}">
        <div class="main">
          <div class="name">${esc(it.name)}</div>
          <div class="sub">${esc(it.id)} · ${fmtQty(it)}${it.loc ? ' · ' + esc(it.loc) : ''}</div>
        </div>
        <div class="mhd"><div>${fmtDate(it.mhd)}</div><div class="badge">${esc(badge(it))}</div></div>
        <div class="step">
          <button type="button" data-adj="-1" aria-label="Eine Einheit entnehmen">−</button>
          <button type="button" data-adj="1" aria-label="Eine Einheit hinzufügen">+</button>
        </div>
      </li>`).join('');
    $('#emptyHint').hidden = state.items.length > 0;

    const all = state.items.map(status);
    const soon = all.filter(s => s === 'soon').length, exp = all.filter(s => s === 'expired').length, buy = all.filter(s => s === 'buy').length;
    $('#summary').innerHTML =
      `<span class="pill">${state.items.length} Artikel</span>` +
      (buy ? `<span class="pill buy">${buy} zu kaufen</span>` : '') +
      (soon ? `<span class="pill soon">${soon} bald ablaufend</span>` : '') +
      (exp ? `<span class="pill expired">${exp} abgelaufen</span>` : '');
    $('#locList').innerHTML = [...new Set(state.items.map(i => i.loc).filter(Boolean))].map(l => `<option value="${esc(l)}">`).join('');
  }

  function adjust(id, delta) {
    const it = state.items.find(i => i.id === id);
    if (!it) return;
    it.qty = Math.max(0, (+it.qty || 0) + delta);
    persist(); renderAll();
    toast(`${it.name}: ${fmtQty(it)}`);
  }

  // ---------- Artikel-Dialog ----------
  function openItem(it, preset = {}) {
    const f = $('#itemForm'), isNew = !it;
    const d = it || { id: preset.id || nextId(), name: '', cat: 'sonstiges', qty: 1, size: '', unit: 'Stk', want: '', mhd: '', loc: '', note: '' };
    f.reset();
    for (const k of ['id', 'name', 'cat', 'qty', 'size', 'unit', 'want', 'mhd', 'loc', 'note']) f.elements[k].value = d[k] ?? '';
    f.dataset.mode = isNew ? 'new' : 'edit';
    $('#delBtn').hidden = isNew;
    $('#quick').hidden = isNew;
    $('#dlgTitle').textContent = isNew ? `Neuer Artikel (${d.id})` : `${d.id}`;
    const dlg = $('#itemDlg');
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function closeDlg() { const dlg = $('#itemDlg'); if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open'); }

  function readForm() {
    const f = $('#itemForm').elements;
    return {
      id: f.id.value.trim().toUpperCase(),
      name: f.name.value.trim(),
      cat: f.cat.value,
      qty: Math.max(0, Number(f.qty.value) || 0),
      size: f.size.value === '' ? '' : Math.max(0, Number(f.size.value) || 0),
      unit: f.unit.value,
      want: f.want.value === '' ? '' : Math.max(0, Number(f.want.value) || 0),
      mhd: f.mhd.value,
      loc: f.loc.value.trim(),
      note: f.note.value.trim()
    };
  }

  // ---------- Scanner ----------
  let stream = null, scanning = false, lastTick = 0, lastCode = '', lastCodeAt = 0;
  const scanCtx = () => $('#scanCanvas').getContext('2d', { willReadFrequently: true });

  async function startScan() {
    const msg = $('#scanMsg'); msg.textContent = '';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      msg.textContent = 'Kamera nicht verfügbar (die App muss über HTTPS geöffnet sein). Nutze „Foto scannen“ oder die manuelle ID.';
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false });
    } catch (e) {
      msg.textContent = 'Kein Kamerazugriff: ' + (e.message || e.name) + '. Erlaube die Kamera in den Browser-Einstellungen oder nutze „Foto scannen“.';
      return;
    }
    const v = $('#video');
    v.srcObject = stream;
    try { await v.play(); } catch (e) { /* ignorieren */ }
    scanning = true;
    $('#scanToggle').textContent = 'Kamera stoppen';
    msg.textContent = 'Halte den QR-Code in den Rahmen.';
    requestAnimationFrame(tick);
  }
  function stopScan() {
    scanning = false;
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null;
    const v = $('#video');
    if (v) v.srcObject = null;
    const b = $('#scanToggle');
    if (b) b.textContent = 'Kamera starten';
  }
  function tick(ts) {
    if (!scanning) return;
    requestAnimationFrame(tick);
    if (ts - lastTick < 120) return;
    lastTick = ts;
    const v = $('#video');
    if (v.readyState < 2 || !v.videoWidth) return;
    const scale = Math.min(1, 640 / v.videoWidth);
    const w = Math.round(v.videoWidth * scale), h = Math.round(v.videoHeight * scale);
    const c = $('#scanCanvas'); c.width = w; c.height = h;
    const ctx = scanCtx();
    ctx.drawImage(v, 0, 0, w, h);
    const code = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
    if (code && code.data) handleCode(code.data);
  }
  function handleCode(text) {
    const now = Date.now();
    if (text === lastCode && now - lastCodeAt < 3000) return;
    lastCode = text; lastCodeAt = now;
    const id = parseId(text);
    if (!id) { toast('Unbekannter Code: ' + String(text).slice(0, 40)); return; }
    openById(id);
  }
  function openById(id) {
    const it = state.items.find(i => i.id === id);
    if (navigator.vibrate) navigator.vibrate(60);
    stopScan();
    if (it) openItem(it);
    else if (confirm(`${id} ist noch nicht angelegt. Jetzt anlegen?`)) openItem(null, { id });
  }
  function scanPhoto(file) {
    const msg = $('#scanMsg');
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const c = $('#scanCanvas'); c.width = w; c.height = h;
      const ctx = scanCtx(); ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const code = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' });
      if (code && code.data) { lastCode = ''; handleCode(code.data); }
      else msg.textContent = 'Kein QR-Code im Foto gefunden. Näher heran, besser beleuchten, nochmal versuchen.';
    };
    img.onerror = () => { URL.revokeObjectURL(url); msg.textContent = 'Foto konnte nicht gelesen werden.'; };
    img.src = url;
  }

  // ---------- Etiketten ----------
  const sel = new Set();
  function renderLabels() {
    const items = [...state.items].sort((a, b) => idNum(a.id) - idNum(b.id));
    $('#lblList').innerHTML = items.map(it => `
      <li><label class="lrow"><input type="checkbox" data-id="${esc(it.id)}" ${sel.has(it.id) ? 'checked' : ''}>
        <span><b>${esc(it.id)}</b> ${esc(it.name)} · MHD ${fmtDate(it.mhd)}</span>
        ${it.printed ? '<span class="printed">✓ gedruckt</span>' : ''}</label></li>`).join('');
    updateLblCount();
  }
  function updateLblCount() {
    const n = sel.size;
    $('#lblCount').textContent = `${n} von ${state.items.length} ausgewählt`;
    $('#lblPrint').textContent = n ? `${n} drucken / PDF` : 'Drucken / PDF';
    $('#lblPrint').classList.toggle('primary', n > 0);
  }
  function labelHTML(it, size) {
    const qr = qrcode(0, 'M');
    qr.addData(qrText(it)); qr.make();
    const svg = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    return `<div class="lbl ${size}"><div class="q">${svg}</div><div class="t"><b>${esc(it.id)}</b><span>${esc(it.name)}</span><span>MHD ${fmtDate(it.mhd)}</span></div></div>`;
  }
  function printLabels() {
    const items = state.items.filter(i => sel.has(i.id)).sort((a, b) => idNum(a.id) - idNum(b.id));
    if (!items.length) { toast('Keine Artikel ausgewählt'); return; }
    const size = $('#lblSize').value;
    $('#printArea').innerHTML = items.map(it => labelHTML(it, size)).join('');
    pendingPrintIds = items.map(i => i.id);
    doPrint();
  }
  // Etiketten als A4-Bild (PNG, 300 dpi): funktioniert ohne Druckdialog, Teilen/Speichern über das Handy.
  function lblSheets(items, size) {
    const mm = 300 / 25.4, W = Math.round(210 * mm), H = Math.round(297 * mm);
    const dim = size === 'm' ? { w: 70, h: 35, q: 30, f: 4 } : { w: 50, h: 25, q: 21, f: 3 };
    const margin = 8, gap = 1;
    const cols = Math.max(1, Math.floor((210 - 2 * margin + gap) / (dim.w + gap)));
    const rows = Math.max(1, Math.floor((297 - 2 * margin + gap) / (dim.h + gap)));
    const per = cols * rows, pages = [];
    for (let p = 0; p * per < items.length; p++) {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
      items.slice(p * per, (p + 1) * per).forEach((it, k) => {
        const col = k % cols, row = Math.floor(k / cols);
        const ox = (margin + col * (dim.w + gap)) * mm, oy = (margin + row * (dim.h + gap)) * mm;
        x.setLineDash([6, 6]); x.lineWidth = 2; x.strokeStyle = '#888';
        x.strokeRect(ox, oy, dim.w * mm, dim.h * mm); x.setLineDash([]);
        // QR direkt aus den Modulen zeichnen
        const qr = qrcode(0, 'M'); qr.addData(qrText(it)); qr.make();
        const n = qr.getModuleCount(), pad = 1.5 * mm, qs = dim.q * mm, cell = qs / (n + 4);
        x.fillStyle = '#000';
        for (let r = 0; r < n; r++) for (let cc = 0; cc < n; cc++) {
          if (qr.isDark(r, cc)) x.fillRect(ox + pad + (cc + 2) * cell, oy + (dim.h * mm - qs) / 2 + (r + 2) * cell, Math.ceil(cell), Math.ceil(cell));
        }
        // Text
        const tx = ox + pad + qs + 2 * mm, tw = ox + dim.w * mm - pad - tx, fs = dim.f * mm;
        x.fillStyle = '#000'; x.textBaseline = 'top';
        let ty = oy + pad + 1 * mm;
        x.font = `bold ${fs * 1.15}px system-ui, Arial, sans-serif`; x.fillText(it.id, tx, ty); ty += fs * 1.4;
        x.font = `${fs}px system-ui, Arial, sans-serif`;
        const words = String(it.name).split(' '); let line = '', lines = [];
        words.forEach(w => { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > tw && line) { lines.push(line); line = w; } else line = t; });
        if (line) lines.push(line);
        const maxL = size === 'm' ? 4 : 3;
        lines.slice(0, maxL).forEach(l => { x.fillText(l, tx, ty); ty += fs * 1.2; });
        x.fillText('MHD ' + fmtDate(it.mhd), tx, ty);
      });
      pages.push(c);
    }
    return pages;
  }
  async function labelPng() {
    const items = state.items.filter(i => sel.has(i.id)).sort((a, b) => idNum(a.id) - idNum(b.id));
    const msg = $('#lblMsg');
    if (!items.length) { toast('Keine Artikel ausgewählt'); return; }
    msg.textContent = 'Erzeuge Bild …';
    await new Promise(r => setTimeout(r, 30));
    const pages = lblSheets(items, $('#lblSize').value);
    const files = [];
    for (let i = 0; i < pages.length; i++) {
      const blob = await new Promise(r => pages[i].toBlob(r, 'image/png'));
      files.push(new File([blob], `etiketten-${stamp()}-${i + 1}.png`, { type: 'image/png' }));
    }
    try {
      if (navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({ files, title: 'Notvorrat-Etiketten' });
        msg.textContent = `${files.length} Seite(n) geteilt. Drucke das Bild in 100 % (A4) aus oder speichere es.`;
      } else throw new Error('no share');
    } catch (e) {
      if (e && e.name === 'AbortError') { msg.textContent = 'Abgebrochen.'; return; }
      files.forEach(f => { const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); });
      msg.textContent = `${files.length} Bild(er) heruntergeladen (A4, 300 dpi). Drucke sie in 100 % Größe.`;
    }
    items.forEach(i => { i.printed = true; });
    persist(); renderLabels();
  }

  function doPrint() {
    document.body.classList.add('print-mode');
    setTimeout(() => window.print(), 50);
  }
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('print-mode');
    if (pendingPrintIds) {
      state.items.forEach(i => { if (pendingPrintIds.includes(i.id)) i.printed = true; });
      pendingPrintIds = null; persist(); renderAll();
    }
  });

  // ---------- Bedarf ----------
  function renderNeeds() {
    const { persons, days } = state.settings;
    $('#persons').value = persons; $('#days').value = days;
    const factor = persons * days / 10;
    let skipped = 0;
    $('#needs').innerHTML = CATS.filter(c => c.per10).map(c => {
      const soll = c.per10 * factor;
      let ist = 0, plan = 0;
      state.items.filter(i => i.cat === c.id).forEach(i => {
        const b = toBase(i), p = toBase({ ...i, qty: Math.max(+i.qty || 0, +i.want || 0) });
        if (b.k) { ist += b.v; plan += p.v; } else if (+i.qty > 0 || +i.want > 0) skipped++;
      });
      const pct = Math.min(100, Math.round(ist / soll * 100)), pctPlan = Math.min(100, Math.round(plan / soll * 100));
      const d = c.unit === 'l' ? 0 : 1;
      const f = n => n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
      return `<div class="need"><div class="t"><span>${esc(c.name)}</span><b>${f(ist)} / ${f(soll)} ${c.unit}</b></div>
        <div class="bar ${pct < 100 ? 'low' : ''}"><i style="width:${pct}%"></i></div><div class="n">${pct} % des Solls${pctPlan > pct ? ` · mit Einkaufsliste ${pctPlan} %` : ''}</div></div>`;
    }).join('');
    $('#needsNote').textContent = skipped
      ? `${skipped} Artikel in diesen Gruppen haben keine Gewichts-/Volumenangabe (z. B. Einheit „Stk“) und zählen nicht mit.`
      : 'Es zählen nur Artikel mit Einheit g, kg, ml oder l (1 l wird wie 1 kg gerechnet).';
  }

  // ---------- Daten ----------
  function renderData() {
    const le = state.settings.lastExport;
    const age = le ? Math.floor((Date.now() - new Date(le)) / 86400000) : null;
    const warn = age === null || age > 30;
    $('#dataInfo').innerHTML = `
      <div><b>${state.items.length}</b> Artikel gespeichert</div>
      <div>Letzte Sicherung: ${le ? new Date(le).toLocaleDateString('de-DE') + ` (vor ${age} T.)` : '<b>noch nie</b>'}${warn ? ' ⚠️' : ''}</div>
      <div>Offline nutzbar: ${offlineReady ? '✅ ja' : '❌ noch nicht (einmal online öffnen)'}</div>
      <div>Dauerhafter Speicher: ${persisted === true ? '✅ ja' : persisted === false ? '⚠️ nicht garantiert – App zum Home-Bildschirm hinzufügen' : '–'}</div>`;
    const b = $('#offlineBadge');
    b.textContent = offlineReady ? '✓ offline bereit' : 'online';
  }
  function download(name, text, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }
  const stamp = () => new Date().toISOString().slice(0, 10);
  function exportJson() {
    state.settings.lastExport = new Date().toISOString();
    persist();
    download(`notvorrat-${stamp()}.json`, JSON.stringify({ app: 'notvorrat', version: 2, exported: state.settings.lastExport, settings: state.settings, checks: state.checks, items: state.items }, null, 2), 'application/json');
    renderData(); toast('Sicherung heruntergeladen');
  }
  function exportCsv() {
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const cat = id => (CATS.find(c => c.id === id) || {}).name || id;
    const rows = [['ID', 'Name', 'Kategorie', 'Anzahl', 'Inhalt', 'Einheit', 'MHD', 'Lagerort', 'Notiz']];
    [...state.items].sort((a, b) => idNum(a.id) - idNum(b.id)).forEach(i => rows.push([i.id, i.name, cat(i.cat), i.qty, i.size, i.unit, i.mhd, i.loc, i.note]));
    download(`notvorrat-${stamp()}.csv`, '﻿' + rows.map(r => r.map(q).join(';')).join('\r\n'), 'text/csv;charset=utf-8');
  }
  function sanitize(o) {
    if (!o || typeof o !== 'object' || !/^P-\d{1,6}$/i.test(o.id || '') || !o.name) return null;
    const unit = ['Stk', 'g', 'kg', 'ml', 'l'].includes(o.unit) ? o.unit : 'Stk';
    return {
      id: String(o.id).toUpperCase(), name: String(o.name).slice(0, 60),
      cat: CATS.some(c => c.id === o.cat) ? o.cat : 'sonstiges',
      qty: Math.max(0, Number(o.qty) || 0), size: o.size === '' || o.size == null ? '' : Math.max(0, Number(o.size) || 0), unit,
      want: o.want === '' || o.want == null ? '' : Math.max(0, Number(o.want) || 0),
      mhd: /^\d{4}-\d{2}-\d{2}$/.test(o.mhd || '') ? o.mhd : '', loc: String(o.loc || '').slice(0, 40),
      note: String(o.note || '').slice(0, 200), printed: !!o.printed
    };
  }
  async function importJson(file) {
    try {
      const data = JSON.parse(await file.text());
      const list = (Array.isArray(data) ? data : data.items || []).map(sanitize).filter(Boolean);
      if (!list.length) { toast('Keine gültigen Artikel in der Datei'); return; }
      if (!confirm(`${list.length} Artikel importieren? Artikel mit gleicher ID werden überschrieben.`)) return;
      list.forEach(n => { const i = state.items.findIndex(x => x.id === n.id); if (i >= 0) state.items[i] = n; else state.items.push(n); });
      state.settings.counter = Math.max(state.settings.counter || 0, ...state.items.map(i => idNum(i.id)));
      if (data.checks && typeof data.checks === 'object') Object.assign(state.checks, data.checks);
      if (data.settings) { state.settings.persons = data.settings.persons || state.settings.persons; state.settings.days = data.settings.days || state.settings.days; }
      persist(); renderAll(); toast(`${list.length} Artikel importiert`);
    } catch (e) { toast('Datei konnte nicht gelesen werden'); }
  }
  function printList() {
    const rows = [...state.items].sort((a, b) => (a.loc || '~').localeCompare(b.loc || '~', 'de') || (a.mhd || '9').localeCompare(b.mhd || '9'));
    $('#printArea').innerHTML = `<h1 style="font:bold 14pt system-ui">Notvorrat – Stand ${new Date().toLocaleDateString('de-DE')}</h1>
      <table class="ptable"><thead><tr><th>ID</th><th>Artikel</th><th>Menge</th><th>MHD</th><th>Ort</th></tr></thead><tbody>` +
      rows.map(i => `<tr><td>${esc(i.id)}</td><td>${esc(i.name)}</td><td>${fmtQty(i)}</td><td>${fmtDate(i.mhd)}</td><td>${esc(i.loc || '')}</td></tr>`).join('') + '</tbody></table>';
    pendingPrintIds = null;
    doPrint();
  }
  function demo() {
    const plus = n => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    const rows = [
      ['Mineralwasser still', 'getraenke', 6, 1.5, 'l', plus(400), 'Keller, Regal A'],
      ['Basmati-Reis', 'getreide', 4, 1, 'kg', plus(700), 'Keller, Regal B'],
      ['Spaghetti', 'getreide', 6, 500, 'g', plus(60), 'Keller, Regal B'],
      ['Kidneybohnen (Dose)', 'gemuese', 8, 400, 'g', plus(900), 'Keller, Regal C'],
      ['Haferflocken', 'getreide', 2, 500, 'g', plus(-10), 'Küche, Schrank 2'],
      ['Sonnenblumenöl', 'fett', 2, 1, 'l', plus(300), 'Küche, Schrank 2']
    ];
    rows.forEach(r => {
      const id = nextId();
      state.settings.counter = idNum(id);
      state.items.push({ id, name: r[0], cat: r[1], qty: r[2], size: r[3], unit: r[4], mhd: r[5], loc: r[6], note: '' });
    });
    persist(); renderAll(); toast('Beispieldaten geladen');
  }

  // ---------- Checkliste & Verhalten ----------
  const SRC_TITLE = { BBK: 'Deutschland (BBK)', AT: 'Österreich', CH: 'Schweiz (BABS)', US: 'Red Cross / Ready.gov', 'Allg.': 'Allgemeine Empfehlung' };
  const srcTags = s => String(s || '').split(' ').filter(Boolean).map(t => `<i title="${esc(SRC_TITLE[t] || t)}">${esc(t)}</i>`).join('');

  function renderChecklist() {
    const D = window.NV_DATA; if (!D) return;
    let total = 0, done = 0;
    const open = new Set($$('#checkList details[open]').map(d => d.dataset.id));
    $('#checkList').innerHTML = D.checklist.map(sec => {
      const n = sec.items.length, d = sec.items.filter(i => state.checks[i.id]).length;
      total += n; done += d;
      return `<details class="card cs" data-id="${esc(sec.id)}" ${open.has(sec.id) ? 'open' : ''}>
        <summary><span class="ic">${sec.icon}</span><b>${esc(sec.title)}</b><em class="${d === n ? 'full' : ''}">${d}/${n}</em></summary>
        <ul class="chk">${sec.items.map(i => `
          <li><label><input type="checkbox" data-chk="${esc(i.id)}" ${state.checks[i.id] ? 'checked' : ''}>
            <span>${esc(i.text)} ${srcTags(i.src)}</span></label></li>`).join('')}</ul></details>`;
    }).join('');
    const pct = total ? Math.round(done / total * 100) : 0;
    $('#checkTotal').innerHTML = `<div class="t"><b>${done} von ${total} Punkten erledigt</b><span>${pct} %</span></div><div class="bar ${pct < 100 ? 'low' : ''}"><i style="width:${pct}%"></i></div>`;
    $('#compare').innerHTML = D.compare.map(c => `<p><b>${esc(c.who)}</b><br>${esc(c.text)}</p>`).join('');
  }

  function renderBehave() {
    const D = window.NV_DATA; if (!D) return;
    const pt = p => p.tel
      ? `<li class="tel"><a class="call" href="tel:${esc(p.tel)}"><b>${esc(p.tel)}</b></a> ${esc(p.text)}</li>`
      : `<li>${esc(p.text)}</li>`;
    $('#behaveList').innerHTML = D.behavior.map(s => `
      <details class="card bs ${s.id === 'notruf' ? 'sos' : ''}">
        <summary><span class="ic">${s.icon}</span><b>${esc(s.title)}</b></summary>
        ${s.blocks.map(b => `<h4 class="${b.bad ? 'bad' : ''}">${b.bad ? '⛔ ' : ''}${esc(b.h)}</h4><ul class="pts ${b.bad ? 'bad' : ''}">${b.pts.map(pt).join('')}</ul>`).join('')}
        <p class="srcline">Quellen: ${srcTags(s.src)}</p>
      </details>`).join('');
  }

  function loadStarter() {
    const D = window.NV_DATA; if (!D) return;
    const have = new Set(state.items.map(i => i.name.toLowerCase()));
    const add = D.starter.filter(s => !have.has(s.name.toLowerCase()));
    if (!add.length) { toast('Startliste ist bereits geladen'); return; }
    if (!confirm(`${add.length} Artikel als „zu kaufen“ anlegen (4 Personen, 14 Tage)?`)) return;
    add.forEach(s => {
      const id = nextId();
      state.settings.counter = idNum(id);
      state.items.push({ id, name: s.name, cat: s.cat, qty: 0, size: s.size ?? '', unit: s.unit || 'Stk', want: s.want, mhd: '', loc: '', note: s.note || '' });
    });
    state.settings.persons = 4; state.settings.days = 14;
    persist(); renderAll(); toast(`${add.length} Artikel angelegt`);
  }

  function printShopping() {
    const todo = state.items.filter(i => +i.want > (+i.qty || 0));
    if (!todo.length) { toast('Nichts zu kaufen'); return; }
    const catName = id => (CATS.find(c => c.id === id) || {}).name || id;
    let html = `<h1 style="font:bold 14pt system-ui">Einkaufsliste – Stand ${new Date().toLocaleDateString('de-DE')}</h1>`;
    CATS.forEach(c => {
      const rows = todo.filter(i => i.cat === c.id);
      if (!rows.length) return;
      html += `<table class="ptable"><thead><tr><th colspan="3">${esc(catName(c.id))}</th></tr></thead><tbody>` +
        rows.map(i => {
          const need = (+i.want) - (+i.qty || 0);
          return `<tr><td style="width:6mm">☐</td><td>${esc(i.name)}</td><td style="width:22mm;text-align:right"><b>${num(need)}×</b></td></tr>`;
        }).join('') + '</tbody></table>';
    });
    $('#printArea').innerHTML = html;
    pendingPrintIds = null;
    doPrint();
  }

  function renderAbout() {
    const D = window.NV_DATA; if (!D || !D.legal) return;
    const L = D.legal, P = L.provider || {};
    const filled = !!(P.name && P.address && P.email);
    const imp = filled
      ? `<p><b>${esc(P.name)}</b><br>${esc(P.address).replace(/\n/g, '<br>')}<br>E-Mail: ${esc(P.email)}${P.phone ? '<br>Telefon: ' + esc(P.phone) : ''}${P.vatId ? '<br>USt-IdNr.: ' + esc(P.vatId) : ''}</p>`
      : `<p class="card warn">Angaben zum Anbieter fehlen. Trage Name, Anschrift und E-Mail in <b>data.js</b> unter <code>legal.provider</code> ein, bevor du die App weitergibst oder verkaufst.</p>`;
    $('#aboutBody').innerHTML = `
      <p><b>Notvorrat</b> · Version ${esc(L.version)} · Inhalte Stand ${esc(L.contentDate)}<br>Offline-Lagerverwaltung mit QR-Etiketten und Vorsorge-Wegweiser.</p>
      <div class="btnrow"><button id="updBtn">Auf Update prüfen / neu laden</button></div><p class="hint" id="updMsg"></p>

      <h3>Wichtiger Hinweis</h3>
      <div class="card"><ul>
        <li>Die Inhalte sind eigene Zusammenfassungen allgemeiner Empfehlungen von Behörden und Hilfsorganisationen. Maßgeblich sind immer die Originalveröffentlichungen und die Anweisungen der Behörden und Einsatzkräfte vor Ort.</li>
        <li>Mengenangaben sind Richtwerte, keine individuelle Beratung. Ernährung, Medikamente und Erste Hilfe hängen von Alter, Gesundheit und Lage ab.</li>
        <li>Kurzanleitungen (z. B. Erste Hilfe) ersetzen keinen Kurs. Im Notfall zuerst Notruf 112.</li>
        <li>Haltbarkeits- und Mengenangaben der Lagerliste trägst du selbst ein und prüfst sie selbst. Kontrolliere Lebensmittel vor dem Verzehr.</li>
        <li>Alle Angaben ohne Gewähr auf Vollständigkeit, Richtigkeit und Aktualität. Die Nutzung erfolgt auf eigene Verantwortung, soweit gesetzlich zulässig.</li>
      </ul></div>

      <h3>Quellen der Inhalte</h3>
      <ul>
        <li>BBK – Bundesamt für Bevölkerungsschutz und Katastrophenhilfe (Deutschland): Ratgeber für Notfallvorsorge, bbk.bund.de</li>
        <li>Republik Österreich: Verhalten bei Katastrophenfällen und Blackout, oesterreich.gv.at</li>
        <li>BABS – Bundesamt für Bevölkerungsschutz (Schweiz): Notvorrat und Notfallplan, babs.admin.ch</li>
        <li>American Red Cross und Ready.gov (USA): Emergency Kit</li>
        <li>Mit „Allg.“ markierte Punkte beruhen auf allgemein üblichen Empfehlungen ohne einzelne Behördenquelle.</li>
      </ul>

      <h3>Datenschutz</h3>
      <ul>
        <li>Alle Eingaben (Artikel, Haken, Einstellungen) bleiben ausschließlich auf diesem Gerät (Browser-Speicher). Es gibt kein Konto, keine Cookies, kein Tracking, keine Werbung.</li>
        <li>Die Kamera dient nur zum Scannen. Bilder werden weder gespeichert noch übertragen.</li>
        <li>Beim Laden und Aktualisieren der App verarbeitet ${esc(L.hoster)} technisch notwendige Verbindungsdaten (z. B. IP-Adresse, Zeitpunkt) in Server-Protokollen. Danach läuft die App ohne Übertragung offline.</li>
        <li>Sicherungsdateien (JSON/CSV) liegen dort, wo du sie speicherst.</li>
        <li>Daten löschen: Mehr → Daten &amp; Sicherung → „Alles löschen“ oder Websitedaten im Browser löschen.</li>
      </ul>

      <h3>Impressum</h3>
      ${imp}

      <h3>Open-Source-Lizenzen</h3>
      <details class="card cmp" id="licDet"><summary>jsQR (Apache-2.0), qrcode-generator (MIT)</summary><div><pre class="lic" id="licText">Wird geladen …</pre></div></details>
      <p class="hint">QR Code ist eine eingetragene Marke der DENSO WAVE INCORPORATED.</p>`;
    $('#updBtn').addEventListener('click', updateApp);
    let loaded = false;
    $('#licDet').addEventListener('toggle', e => {
      if (!e.target.open || loaded) return;
      fetch('LICENSES.txt').then(r => r.ok ? r.text() : Promise.reject()).then(t => { $('#licText').textContent = t; loaded = true; })
        .catch(() => { $('#licText').textContent = 'Lizenztext derzeit nicht verfügbar. Siehe Datei LICENSES.txt.'; });
    });
  }

  async function updateApp() {
    const m = $('#updMsg');
    if (!navigator.onLine) { m.textContent = 'Du bist offline. Für ein Update brauchst du Internet.'; return; }
    m.textContent = 'Lade neueste Version …';
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (e) { /* trotzdem neu laden */ }
    location.reload();
  }

  // ---------- Allgemein ----------
  function renderAll() {
    renderList(); renderLabels(); renderNeeds(); renderData(); renderChecklist();
  }

  function bind() {
    const catOpts = CATS.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    $('#fCat').innerHTML = '<option value="">Alle Kategorien</option>' + catOpts;
    $('#fCatForm').innerHTML = catOpts;

    $$('.bottom button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
    document.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) showTab(g.dataset.go); });
    $('#checkList').addEventListener('change', e => {
      const c = e.target.closest('input[data-chk]'); if (!c) return;
      if (c.checked) state.checks[c.dataset.chk] = true; else delete state.checks[c.dataset.chk];
      persist(); renderChecklist();
    });
    $('#checkReset').addEventListener('click', () => { if (confirm('Alle Haken in der Checkliste entfernen?')) { state.checks = {}; persist(); renderChecklist(); } });
    $('#starter').addEventListener('click', loadStarter);
    $('#printShop').addEventListener('click', printShopping);
    renderBehave(); renderAbout();
    ['#q', '#fCat', '#fStatus', '#fSort'].forEach(s => $(s).addEventListener('input', renderList));
    $('#addBtn').addEventListener('click', () => openItem(null));

    $('#list').addEventListener('click', e => {
      const li = e.target.closest('.row'); if (!li) return;
      const adj = e.target.closest('[data-adj]');
      if (adj) { adjust(li.dataset.id, Number(adj.dataset.adj)); return; }
      openItem(state.items.find(i => i.id === li.dataset.id));
    });

    // Dialog
    $('#itemForm').addEventListener('submit', e => {
      e.preventDefault();
      const d = readForm();
      if (!d.name) return;
      const i = state.items.findIndex(x => x.id === d.id);
      if (i >= 0) state.items[i] = { ...state.items[i], ...d };
      else { state.items.push(d); state.settings.counter = Math.max(state.settings.counter || 0, idNum(d.id)); }
      persist(); closeDlg(); renderAll(); toast('Gespeichert');
    });
    $('#closeBtn').addEventListener('click', closeDlg);
    $('#delBtn').addEventListener('click', () => {
      const id = $('#itemForm').elements.id.value;
      const it = state.items.find(i => i.id === id);
      if (it && confirm(`„${it.name}“ (${id}) wirklich löschen?`)) {
        state.items = state.items.filter(i => i.id !== id);
        persist(); closeDlg(); renderAll(); toast('Gelöscht');
      }
    });
    $('#quick').addEventListener('click', e => {
      const b = e.target.closest('[data-adj]'); if (!b) return;
      const q = $('#itemForm').elements.qty;
      q.value = Math.max(0, (Number(q.value) || 0) + Number(b.dataset.adj));
      $('#itemForm').requestSubmit();
    });

    // Scan
    $('#scanToggle').addEventListener('click', () => scanning ? stopScan() : startScan());
    $('#photoIn').addEventListener('change', e => { if (e.target.files[0]) scanPhoto(e.target.files[0]); e.target.value = ''; });
    $('#manualForm').addEventListener('submit', e => {
      e.preventDefault();
      const id = parseId($('#manualId').value.trim());
      if (!id) { toast('Format: P-017'); return; }
      $('#manualId').value = '';
      openById(id);
    });

    // Etiketten
    // Eindeutig: das Antippen einer Zeile schaltet genau einmal um (kein doppeltes Label-/Checkbox-Klicken).
    $('#lblList').addEventListener('click', e => {
      const li = e.target.closest('li'); if (!li) return;
      const c = li.querySelector('input[data-id]'); if (!c) return;
      e.preventDefault();
      const id = c.dataset.id;
      if (sel.has(id)) sel.delete(id); else sel.add(id);
      c.checked = sel.has(id);
      setTimeout(() => { c.checked = sel.has(id); }, 0); // Browser setzt abgebrochene Klicks zurück
      updateLblCount();
    });
    $('#lblAll').addEventListener('click', () => { state.items.forEach(i => sel.add(i.id)); renderLabels(); });
    $('#lblNone').addEventListener('click', () => { sel.clear(); renderLabels(); });
    $('#lblNew').addEventListener('click', () => { sel.clear(); state.items.filter(i => !i.printed).forEach(i => sel.add(i.id)); renderLabels(); });
    $('#lblPrint').addEventListener('click', printLabels);
    $('#lblPng').addEventListener('click', labelPng);

    // Bedarf
    ['persons', 'days'].forEach(k => $('#' + k).addEventListener('change', e => {
      state.settings[k] = Math.max(1, Math.min(k === 'days' ? 90 : 20, Math.round(Number(e.target.value)) || state.settings[k]));
      persist(); renderNeeds();
    }));

    // Daten
    $('#expJson').addEventListener('click', exportJson);
    $('#expCsv').addEventListener('click', exportCsv);
    $('#printList').addEventListener('click', printList);
    $('#impIn').addEventListener('change', e => { if (e.target.files[0]) importJson(e.target.files[0]); e.target.value = ''; });
    $('#demo').addEventListener('click', demo);
    $('#wipe').addEventListener('click', () => {
      if (confirm('ALLE Artikel unwiderruflich löschen? (Hast du eine Sicherung?)')) {
        state.items = []; sel.clear(); persist(); renderAll(); toast('Alles gelöscht');
      }
    });
  }

  async function init() {
    // Netlify blendet auf netlify.app ein Abzeichen unten rechts ein: Navigation darüber anheben.
    try { if (/\.netlify\.app$/.test(location.hostname)) document.documentElement.style.setProperty('--lift', '56px'); } catch (e) { /* egal */ }
    await load();
    bind();
    $('#addBtn').style.display = '';
    renderAll();
    if ('serviceWorker' in navigator) {
      const hadCtrl = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadCtrl) toast('Update geladen. App einmal schließen und neu öffnen.'); });
      navigator.serviceWorker.register('sw.js').catch(() => {});
      navigator.serviceWorker.ready.then(() => { offlineReady = true; renderData(); }).catch(() => {});
    }
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(ok => { persisted = ok; renderData(); }).catch(() => {});
    }
  }
  init();
})();
