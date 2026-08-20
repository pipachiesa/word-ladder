(() => {
  'use strict';

  const TOTAL_ROUNDS = 8;
  const TOTAL_HINTS = 3;
  const STORAGE_KEY = 'wordladder_progress_v2';

  const el = {
    panel: document.getElementById('panel'),
    progressRow: document.getElementById('progress-row'),
    wordLabel: document.getElementById('word-label'),
    slots: document.getElementById('slots'),
    carriedGroup: document.getElementById('carried-group'),
    newGroup: document.getElementById('new-group'),
    carriedCaption: document.getElementById('carried-caption'),
    newCaption: document.getElementById('new-caption'),
    carriedPool: document.getElementById('carried-pool'),
    newPool: document.getElementById('new-pool'),
    clearBtn: document.getElementById('clear-btn'),
    hintBtn: document.getElementById('hint-btn'),
    hintCount: document.getElementById('hint-count'),
    message: document.getElementById('message'),
    newGameBtn: document.getElementById('new-game-btn'),
    howToBtn: document.getElementById('how-to-play-btn'),
    howToModal: document.getElementById('how-to-modal'),
    howToClose: document.getElementById('how-to-close'),
    howToGotIt: document.getElementById('how-to-got-it'),
  };

  let PUZZLES = [];
  let puzzle = null;
  let isDaily = true;

  // per-round runtime state
  let roundIndex = 0;
  let solvedWords = [];
  let hintsRemaining = TOTAL_HINTS;
  let hintTierThisRound = 0;
  let tiles = [];   // current round's tiles: {id, letter, group, distractor, used, removed, locked}
  let slots = [];   // current round's slots: null | tileId
  let locked = false; // true while a check animation / round transition is in flight

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
    return h;
  }

  function dailyPuzzleId() {
    return hashStr(todayStr()) % PUZZLES.length;
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function saveProgress() {
    if (!isDaily) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: todayStr(),
        puzzleId: puzzle.id,
        roundIndex,
        solvedWords,
        hintsRemaining,
      }));
    } catch (e) { /* ignore */ }
  }

  function clearProgress() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  // ---------- setup ----------

  function startDailyGame() {
    isDaily = true;
    const id = dailyPuzzleId();
    const saved = loadProgress();
    puzzle = PUZZLES[id];
    if (saved && saved.date === todayStr() && saved.puzzleId === id) {
      roundIndex = saved.roundIndex;
      solvedWords = saved.solvedWords;
      hintsRemaining = saved.hintsRemaining;
    } else {
      roundIndex = 0;
      solvedWords = [];
      hintsRemaining = TOTAL_HINTS;
      clearProgress();
    }
    if (roundIndex >= TOTAL_ROUNDS) {
      renderWin();
    } else {
      setupRound();
    }
  }

  function startRandomGame() {
    isDaily = false;
    let id = Math.floor(Math.random() * PUZZLES.length);
    if (PUZZLES.length > 1 && id === puzzle?.id) id = (id + 1) % PUZZLES.length;
    puzzle = PUZZLES[id];
    roundIndex = 0;
    solvedWords = [];
    hintsRemaining = TOTAL_HINTS;
    setupRound();
  }

  function setupRound() {
    locked = false;
    hintTierThisRound = 0;
    const round = puzzle.rounds[roundIndex];
    slots = new Array(round.length).fill(null);

    tiles = [];
    let uid = 0;
    if (roundIndex === 0) {
      for (const t of round.pool) {
        tiles.push({ id: uid++, letter: t.letter, group: 'base', distractor: t.distractor, used: false, removed: false, locked: false });
      }
    } else {
      for (const t of round.carried) {
        tiles.push({ id: uid++, letter: t.letter, group: 'carried', distractor: false, used: false, removed: false, locked: false });
      }
      for (const t of round.newSet) {
        tiles.push({ id: uid++, letter: t.letter, group: 'new', distractor: t.distractor, used: false, removed: false, locked: false });
      }
    }

    setMessage('', '');
    renderAll();
    saveProgress();
  }

  // ---------- rendering ----------

  function renderAll() {
    renderProgress();
    renderStage();
    renderPools();
    renderControls();
  }

  function renderProgress() {
    el.progressRow.innerHTML = '';
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      const dot = document.createElement('div');
      dot.className = 'progress-dot';
      if (i < roundIndex) { dot.className += ' done'; dot.textContent = '✓'; }
      else if (i === roundIndex) { dot.className += ' current'; dot.textContent = String(i + 1); }
      else { dot.textContent = String(i + 1); }
      el.progressRow.appendChild(dot);
    }
  }

  function renderStage() {
    const round = puzzle.rounds[roundIndex];
    el.wordLabel.textContent = `Word ${roundIndex + 1} of ${TOTAL_ROUNDS} · ${round.length} letters`;
    el.slots.innerHTML = '';
    el.slots.classList.remove('shake', 'success');
    slots.forEach((tileId, idx) => {
      const box = document.createElement('div');
      box.className = 'slot';
      box.dataset.index = String(idx);
      if (tileId !== null) {
        const tile = tiles.find(t => t.id === tileId);
        box.classList.add('filled');
        if (tile.group === 'carried') box.classList.add('from-carried');
        if (tile.locked) box.classList.add('locked');
        box.textContent = tile.letter.toUpperCase();
        box.addEventListener('click', () => removeSlot(idx));
      }
      el.slots.appendChild(box);
    });
  }

  function renderPools() {
    const round = puzzle.rounds[roundIndex];
    if (roundIndex === 0) {
      el.carriedGroup.hidden = true;
      el.newGroup.classList.add('base-mode');
      el.newCaption.textContent = 'Arrange the letters';
    } else {
      el.carriedGroup.hidden = false;
      el.newGroup.classList.remove('base-mode');
      el.carriedCaption.textContent = solvedWords.length
        ? `Carried from "${solvedWords[solvedWords.length - 1].toUpperCase()}"`
        : 'Carried letters';
      el.newCaption.textContent = 'Pick the new letter (1 of 4)';
    }

    el.carriedPool.innerHTML = '';
    el.newPool.innerHTML = '';
    for (const tile of tiles) {
      if (tile.removed) continue;
      const btn = document.createElement('button');
      btn.className = 'tile';
      btn.type = 'button';
      btn.textContent = tile.letter.toUpperCase();
      if (tile.group === 'carried') btn.classList.add('carried');
      if (tile.group === 'base') btn.classList.add('base');
      if (tile.used) btn.classList.add('used');
      btn.disabled = tile.used || locked;
      btn.addEventListener('click', () => placeTile(tile.id));
      (tile.group === 'carried' ? el.carriedPool : el.newPool).appendChild(btn);
    }
  }

  function renderControls() {
    el.hintCount.textContent = String(hintsRemaining);
    el.hintBtn.disabled = hintsRemaining <= 0 || hintTierThisRound >= 3 || locked;
    el.clearBtn.disabled = locked || slots.every(s => s === null);
  }

  function setMessage(text, kind) {
    el.message.textContent = text;
    el.message.className = 'message' + (kind ? ' ' + kind : '');
  }

  // ---------- interactions ----------

  function placeTile(tileId) {
    if (locked) return;
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.used || tile.removed) return;
    const emptyIndex = slots.findIndex(s => s === null);
    if (emptyIndex === -1) return;
    tile.used = true;
    slots[emptyIndex] = tileId;
    setMessage('', '');
    renderAll();
    if (slots.every(s => s !== null)) {
      locked = true;
      setTimeout(checkAnswer, 180);
    }
  }

  function removeSlot(idx) {
    if (locked) return;
    const tileId = slots[idx];
    if (tileId === null) return;
    const tile = tiles.find(t => t.id === tileId);
    if (tile.locked) return;
    tile.used = false;
    slots[idx] = null;
    setMessage('', '');
    renderAll();
  }

  function clearUnlockedSlots() {
    for (let i = 0; i < slots.length; i++) {
      const tileId = slots[i];
      if (tileId === null) continue;
      const tile = tiles.find(t => t.id === tileId);
      if (tile.locked) continue;
      tile.used = false;
      slots[i] = null;
    }
  }

  function checkAnswer() {
    const round = puzzle.rounds[roundIndex];
    const word = slots.map(id => tiles.find(t => t.id === id).letter).join('');
    if (word === round.target) {
      handleSuccess();
    } else {
      handleFail();
    }
  }

  function handleFail() {
    el.slots.classList.add('shake');
    setMessage('Not quite — rearrange and try again.', 'error');
    setTimeout(() => {
      clearUnlockedSlots();
      locked = false;
      renderAll();
    }, 500);
  }

  function handleSuccess() {
    el.slots.classList.add('success');
    const round = puzzle.rounds[roundIndex];
    const isLast = roundIndex === TOTAL_ROUNDS - 1;
    setMessage(isLast ? 'Chain complete!' : 'Nice! Next word coming up…', 'success');
    solvedWords.push(round.target);
    renderControls();
    setTimeout(() => {
      roundIndex++;
      if (roundIndex >= TOTAL_ROUNDS) {
        saveProgress();
        renderWin();
      } else {
        setupRound();
      }
    }, 750);
  }

  function useHint() {
    if (hintsRemaining <= 0 || hintTierThisRound >= 3 || locked) return;
    hintTierThisRound++;
    hintsRemaining--;
    const round = puzzle.rounds[roundIndex];

    if (hintTierThisRound === 1) {
      removeADistractor();
    } else {
      revealLetterAt(hintTierThisRound - 2, round.target);
    }
    saveProgress();
    renderAll();
  }

  function removeADistractor() {
    let candidate = tiles.find(t => !t.removed && t.distractor && !t.used);
    if (!candidate) candidate = tiles.find(t => !t.removed && t.distractor);
    if (!candidate) return;
    if (candidate.used) {
      const slotIdx = slots.findIndex(id => id === candidate.id);
      if (slotIdx !== -1) slots[slotIdx] = null;
      candidate.used = false;
    }
    candidate.removed = true;
  }

  function revealLetterAt(pos, target) {
    if (pos < 0 || pos >= target.length) return;
    const letter = target[pos];
    const existingId = slots[pos];
    if (existingId !== null) {
      const existingTile = tiles.find(t => t.id === existingId);
      if (existingTile.letter === letter) {
        existingTile.locked = true;
        return;
      }
      existingTile.used = false;
      slots[pos] = null;
    }
    const tile = tiles.find(t => !t.removed && !t.used && t.letter === letter && !t.distractor);
    if (!tile) return;
    tile.used = true;
    tile.locked = true;
    slots[pos] = tile.id;
  }

  // ---------- win screen ----------

  function renderWin() {
    clearProgress();
    el.panel.innerHTML = `
      <div class="win-screen">
        <h2>You built the whole ladder! 🎉</h2>
        <div class="win-chain" id="win-chain"></div>
        <button class="btn btn-hint" id="win-new-game">Play a random puzzle</button>
      </div>
    `;
    const chainEl = document.getElementById('win-chain');
    const words = isDaily || solvedWords.length === TOTAL_ROUNDS ? (puzzle.words) : solvedWords;
    words.forEach((w, i) => {
      const line = document.createElement('div');
      line.className = 'step';
      line.textContent = `${i + 1}. ${w.toUpperCase()}`;
      chainEl.appendChild(line);
    });
    document.getElementById('win-new-game').addEventListener('click', () => {
      rebuildPanelDom();
      startRandomGame();
    });
  }

  function rebuildPanelDom() {
    el.panel.innerHTML = `
      <div class="progress-row" id="progress-row" aria-label="Round progress"></div>
      <div class="stage">
        <div class="word-label" id="word-label"></div>
        <div class="slots" id="slots"></div>
      </div>
      <div class="pool-area">
        <div class="pool-group" id="carried-group">
          <div class="pool-caption" id="carried-caption">Carried from last word</div>
          <div class="pool" id="carried-pool"></div>
        </div>
        <div class="pool-group" id="new-group">
          <div class="pool-caption" id="new-caption">Pick the new letter</div>
          <div class="pool" id="new-pool"></div>
        </div>
      </div>
      <div class="controls">
        <button id="clear-btn" class="btn btn-ghost">Clear</button>
        <button id="hint-btn" class="btn btn-hint">Hint <span id="hint-count">3</span></button>
      </div>
      <div class="message" id="message" role="status" aria-live="polite"></div>
    `;
    el.progressRow = document.getElementById('progress-row');
    el.wordLabel = document.getElementById('word-label');
    el.slots = document.getElementById('slots');
    el.carriedGroup = document.getElementById('carried-group');
    el.newGroup = document.getElementById('new-group');
    el.carriedCaption = document.getElementById('carried-caption');
    el.newCaption = document.getElementById('new-caption');
    el.carriedPool = document.getElementById('carried-pool');
    el.newPool = document.getElementById('new-pool');
    el.clearBtn = document.getElementById('clear-btn');
    el.hintBtn = document.getElementById('hint-btn');
    el.hintCount = document.getElementById('hint-count');
    el.message = document.getElementById('message');
    el.clearBtn.addEventListener('click', () => {
      if (locked) return;
      clearUnlockedSlots();
      setMessage('', '');
      renderAll();
    });
    el.hintBtn.addEventListener('click', useHint);
  }

  // ---------- init ----------

  el.clearBtn.addEventListener('click', () => {
    if (locked) return;
    clearUnlockedSlots();
    setMessage('', '');
    renderAll();
  });
  el.hintBtn.addEventListener('click', useHint);
  el.newGameBtn.addEventListener('click', () => {
    rebuildPanelDom();
    startRandomGame();
  });
  el.howToBtn.addEventListener('click', () => { el.howToModal.hidden = false; });
  el.howToClose.addEventListener('click', () => { el.howToModal.hidden = true; });
  el.howToGotIt.addEventListener('click', () => { el.howToModal.hidden = true; });
  el.howToModal.addEventListener('click', (e) => { if (e.target === el.howToModal) el.howToModal.hidden = true; });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      const lastFilled = [...slots].reverse().findIndex(s => s !== null);
      if (lastFilled !== -1) removeSlot(slots.length - 1 - lastFilled);
      return;
    }
    if (/^[a-zA-Z]$/.test(e.key)) {
      const letter = e.key.toLowerCase();
      const tile = tiles.find(t => !t.used && !t.removed && t.letter === letter);
      if (tile) placeTile(tile.id);
    }
  });

  fetch('puzzles.json')
    .then(r => r.json())
    .then(data => {
      PUZZLES = data;
      startDailyGame();
    })
    .catch(() => {
      setMessage('Could not load the puzzle data.', 'error');
    });
})();
