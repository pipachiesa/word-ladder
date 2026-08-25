(() => {
  'use strict';


  /* =========================
     GAME SETTINGS
  ========================= */

  const TOTAL_ROUNDS = 6;
  const TOTAL_HINTS = 3;

  const STORAGE_KEY_PREFIX =
    'wordladder_progress_v3_';
    const STATS_STORAGE_KEY =
  'wordladder_stats_v1';

let timerInterval = null;

let gameStartTime = null;

let elapsedSeconds = 0;

let gameCompleted = false;


  const PUZZLE_FILES = {
    en: 'puzzles.json',
    es: 'spa_puzzles.json'
  };


  /* =========================
     LANGUAGE
  ========================= */

  let currentLanguage = 'en';


  const TEXT = {

    en: {

      pageTitle:
        'Word Ladder — build a word chain',

      howToPlay:
        'How to play',

      word:
        'Word',

      of:
        'of',

      letters:
        'letters',

      carriedFrom:
        'Carried from',

      carriedLetters:
        'Carried letters',

      pickNew:
        'Pick the new letter (1 of 4)',

      arrange:
        'Arrange the letters',

      clear:
        'Clear',

      hint:
        'Hint',

      newGame:
        'New random puzzle',

      source:
        'Source',

      howToP1:
        'Each game is a chain of 6 words. The first word has 3 letters; every word after that adds exactly one letter to the last, growing all the way to 8 letters.',

      howToP2:
        'New letters — pick the one correct new letter from a set of 4 (3 are decoys).',

      howToP3:
        'Carried letters — every letter from your last solved word must be reused in the next one.',

      howToP4:
        'Tap tiles to fill the boxes above, in order. Tap a filled box to send its letter back. Rearrange freely — you have unlimited tries.',

      howToP5:
        'You get 3 hints total for the whole game. Hints escalate per word: 1st use removes a decoy, 2nd reveals the first letter, 3rd reveals the second letter.',

      gotIt:
        'Got it',

      notQuite:
        'Not quite — rearrange and try again.',

      chainComplete:
        'Chain complete!',

      nextWord:
        'Nice! Next word coming up…',

      ladderComplete:
        'You built the whole ladder! 🎉',

      playRandom:
        'Play a random puzzle',

      loading:
        'Loading puzzle…',

      loadError:
        'Could not load the puzzle data.',

      stats:
        'Stats'

    },


    es: {

      pageTitle:
        'Escalera de Palabras — crea una cadena',

      howToPlay:
        'Cómo jugar',

      word:
        'Palabra',

      of:
        'de',

      letters:
        'letras',

      carriedFrom:
        'Letras de',

      carriedLetters:
        'Letras anteriores',

      pickNew:
        'Elige la nueva letra (1 de 4)',

      arrange:
        'Ordena las letras',

      clear:
        'Borrar',

      hint:
        'Pista',

      newGame:
        'Nuevo rompecabezas',

      source:
        'Código fuente',

      howToP1:
        'Cada partida tiene una cadena de 6 palabras. La primera palabra tiene 3 letras y cada palabra siguiente agrega exactamente una letra, hasta llegar a 8 letras.',

      howToP2:
        'Letras nuevas — elige la única letra correcta entre 4 opciones (3 son distractores).',

      howToP3:
        'Letras anteriores — todas las letras de tu última palabra deben reutilizarse en la siguiente.',

      howToP4:
        'Toca las letras para llenar los espacios de arriba en orden. Toca una letra colocada para devolverla. Puedes reorganizarlas libremente y tienes intentos ilimitados.',

      howToP5:
        'Tienes 3 pistas para toda la partida. Las pistas aumentan por palabra: la primera elimina un distractor, la segunda revela la primera letra y la tercera revela la segunda letra.',

      gotIt:
        'Entendido',

      notQuite:
        'No es correcto — reorganiza las letras e inténtalo de nuevo.',

      chainComplete:
        '¡Cadena completa!',

      nextWord:
        '¡Bien! La siguiente palabra viene…',

      ladderComplete:
        '¡Completaste toda la escalera! 🎉',

      playRandom:
        'Jugar otro rompecabezas',

      loading:
        'Cargando rompecabezas…',

      loadError:
        'No se pudieron cargar los datos del rompecabezas.',

      stats:
        'Estadísticas'

    }

  };


  function t(key) {
    return TEXT[currentLanguage][key] || key;
  }


  /* =========================
     DOM
  ========================= */

  const el = {

    panel:
      document.getElementById('panel'),

    progressRow:
      document.getElementById('progress-row'),

    wordLabel:
      document.getElementById('word-label'),

    slots:
      document.getElementById('slots'),

    carriedGroup:
      document.getElementById('carried-group'),

    newGroup:
      document.getElementById('new-group'),

    carriedCaption:
      document.getElementById('carried-caption'),

    newCaption:
      document.getElementById('new-caption'),

    carriedPool:
      document.getElementById('carried-pool'),

    newPool:
      document.getElementById('new-pool'),

    clearBtn:
      document.getElementById('clear-btn'),

    hintBtn:
      document.getElementById('hint-btn'),

    hintCount:
      document.getElementById('hint-count'),

    message:
      document.getElementById('message'),

    newGameBtn:
      document.getElementById('new-game-btn'),

    howToBtn:
      document.getElementById('how-to-play-btn'),

    howToModal:
      document.getElementById('how-to-modal'),

    howToClose:
      document.getElementById('how-to-close'),

    howToGotIt:
      document.getElementById('how-to-got-it'),

    languageEnglish:
      document.getElementById('lang-en'),

    languageSpanish:
      document.getElementById('lang-es'),

    howToTitle:
      document.getElementById('how-to-title'),

    howToP1:
      document.getElementById('how-to-p1'),

    howToP2:
      document.getElementById('how-to-p2'),

    howToP3:
      document.getElementById('how-to-p3'),

    howToP4:
      document.getElementById('how-to-p4'),

    howToP5:
      document.getElementById('how-to-p5'),

    timerDisplay:
      document.getElementById('timer-display'),
    
    statsBtn:
      document.getElementById('stats-btn'),
    
    statsModal:
      document.getElementById('stats-modal'),
    
    statsClose:
      document.getElementById('stats-close'),
    
    statsCloseBtn:
      document.getElementById('stats-close-btn'),
    
    statsTitle:
      document.getElementById('stats-title'),
    
    gamesPlayedStat:
      document.getElementById('games-played-stat'),
    
    gamesWonStat:
      document.getElementById('games-won-stat'),
    
    winRateStat:
      document.getElementById('win-rate-stat'),
    
    bestTimeStat:
      document.getElementById('best-time-stat'),
    
    averageTimeStat:
      document.getElementById('average-time-stat'),
    
    gamesPlayedLabel:
      document.getElementById('games-played-label'),
    
    gamesWonLabel:
      document.getElementById('games-won-label'),
    
    winRateLabel:
      document.getElementById('win-rate-label'),
    
    bestTimeLabel:
      document.getElementById('best-time-label'),
    
    averageTimeLabel:
      document.getElementById('average-time-label'),  
  };


  /* =========================
     GAME STATE
  ========================= */

  let PUZZLES = [];

  let puzzle = null;

  let roundIndex = 0;

  let solvedWords = [];

  let hintsRemaining =
    TOTAL_HINTS;

  let hintTierThisRound = 0;

  let tiles = [];

  let slots = [];

  let locked = false;


  /* =========================
     LOCAL STORAGE
  ========================= */

  function storageKey() {

    return (
      STORAGE_KEY_PREFIX +
      currentLanguage
    );

  }


  function loadProgress() {

    try {

      const raw =
        localStorage.getItem(
          storageKey()
        );


      if (!raw) {
        return null;
      }


      return JSON.parse(raw);

    }

    catch (e) {

      return null;

    }

  }


  function saveProgress() {

    try {

      if (!puzzle) {
        return;
      }


      localStorage.setItem(

        storageKey(),

        JSON.stringify({

          puzzleId:
            puzzle.id,

          roundIndex,

          solvedWords,

          hintsRemaining,

          hintTierThisRound

        })

      );

    }

    catch (e) {

      // Ignore storage errors.

    }

  }


  function clearProgress() {

    try {

      localStorage.removeItem(
        storageKey()
      );

    }

    catch (e) {

      // Ignore storage errors.

    }

  }

  /* =========================
   GAME TIMER
========================= */

function formatTime(seconds) {

  const minutes =
    Math.floor(seconds / 60);

  const remainingSeconds =
    seconds % 60;

  return (
    String(minutes).padStart(2, '0') +
    ':' +
    String(remainingSeconds).padStart(2, '0')
  );

}


function updateTimerDisplay() {

  if (!el.timerDisplay) {
    return;
  }

  el.timerDisplay.textContent =
    formatTime(elapsedSeconds);

}


function startTimer() {

  stopTimer();

  gameCompleted = false;

  gameStartTime =
    Date.now();

  elapsedSeconds = 0;

  updateTimerDisplay();


  timerInterval =
    setInterval(() => {

      if (!gameStartTime) {
        return;
      }


      elapsedSeconds =
        Math.floor(
          (
            Date.now() -
            gameStartTime
          ) / 1000
        );


      updateTimerDisplay();

    }, 1000);

}


function stopTimer() {

  if (timerInterval) {

    clearInterval(
      timerInterval
    );

    timerInterval = null;

  }


  if (gameStartTime) {

    elapsedSeconds =
      Math.floor(
        (
          Date.now() -
          gameStartTime
        ) / 1000
      );

  }


  updateTimerDisplay();

}


function getCurrentElapsedSeconds() {

  if (!gameStartTime) {

    return elapsedSeconds;

  }


  return Math.floor(

    (
      Date.now() -
      gameStartTime
    ) / 1000

  );

}

/* =========================
   PLAYER STATISTICS
========================= */

function getDefaultStats() {

  return {

    gamesPlayed: 0,

    gamesWon: 0,

    totalTime: 0,

    bestTime: null

  };

}


function getStats() {

  try {

    const raw =
      localStorage.getItem(
        STATS_STORAGE_KEY
      );


    if (!raw) {

      return getDefaultStats();

    }


    const parsed =
      JSON.parse(raw);


    return {

      ...getDefaultStats(),

      ...parsed

    };

  }

  catch (error) {

    return getDefaultStats();

  }

}


function saveStats(
  stats
) {

  try {

    localStorage.setItem(

      STATS_STORAGE_KEY,

      JSON.stringify(stats)

    );

  }

  catch (error) {

    console.error(
      'Could not save stats:',
      error
    );

  }

}


function recordGamePlayed() {

  const stats =
    getStats();


  stats.gamesPlayed++;


  saveStats(
    stats
  );

}


function recordGameWon(
  completionTime
) {

  const stats =
    getStats();


  stats.gamesWon++;


  stats.totalTime +=
    completionTime;


  if (

    stats.bestTime === null ||

    completionTime <
      stats.bestTime

  ) {

    stats.bestTime =
      completionTime;

  }


  saveStats(
    stats
  );

}


function updateStatsDisplay() {

  const stats =
    getStats();


  const winRate =

    stats.gamesPlayed > 0

      ? Math.round(

          (
            stats.gamesWon /
            stats.gamesPlayed
          ) * 100

        )

      : 0;


  const averageTime =

    stats.gamesWon > 0

      ? Math.round(

          stats.totalTime /
          stats.gamesWon

        )

      : null;


  el.gamesPlayedStat.textContent =
    String(
      stats.gamesPlayed
    );


  el.gamesWonStat.textContent =
    String(
      stats.gamesWon
    );


  el.winRateStat.textContent =
    `${winRate}%`;


  el.bestTimeStat.textContent =

    stats.bestTime !== null

      ? formatTime(
          stats.bestTime
        )

      : '—';


  el.averageTimeStat.textContent =

    averageTime !== null

      ? formatTime(
          averageTime
        )

      : '—';


  /*
    Translate labels.
  */

  el.statsTitle.textContent =
    currentLanguage === 'es'
      ? 'Tus estadísticas'
      : 'Your Stats';


  el.gamesPlayedLabel.textContent =
    currentLanguage === 'es'
      ? 'Partidas jugadas'
      : 'Games Played';


  el.gamesWonLabel.textContent =
    currentLanguage === 'es'
      ? 'Partidas ganadas'
      : 'Games Won';


  el.winRateLabel.textContent =
    currentLanguage === 'es'
      ? 'Porcentaje de victorias'
      : 'Win Rate';


  el.bestTimeLabel.textContent =
    currentLanguage === 'es'
      ? 'Mejor tiempo'
      : 'Best Time';


  el.averageTimeLabel.textContent =
    currentLanguage === 'es'
      ? 'Tiempo promedio'
      : 'Average Time';


  el.statsCloseBtn.textContent =
    currentLanguage === 'es'
      ? 'Cerrar'
      : 'Close';

}


function openStats() {

  updateStatsDisplay();


  el.statsModal.hidden =
    false;

}


function closeStats() {

  el.statsModal.hidden =
    true;

}


  /* =========================
     PUZZLE HELPERS
  ========================= */

  function shuffle(array) {

    return [
      ...array
    ].sort(
      () => Math.random() - 0.5
    );

  }


  function letterCounts(word) {

    const counts = {};


    for (
      const letter
      of word
    ) {

      counts[letter] =
        (
          counts[letter] || 0
        ) + 1;

    }


    return counts;

  }


  function getNewLetter(
    previous,
    target
  ) {

    const previousCounts =
      letterCounts(previous);

    const targetCounts =
      letterCounts(target);


    for (
      const [
        letter,
        count
      ]
      of Object.entries(
        targetCounts
      )
    ) {

      const previousCount =
        previousCounts[letter] || 0;


      if (
        count >
        previousCount
      ) {

        return letter;

      }

    }


    return null;

  }


  function getDistractors(
    target,
    amount
  ) {

    const alphabet =
      'abcdefghijklmnopqrstuvwxyz'
        .split('');


    const targetLetters =
      new Set(
        target.split('')
      );


    return shuffle(

      alphabet.filter(
        letter =>
          !targetLetters.has(
            letter
          )
      )

    ).slice(
      0,
      amount
    );

  }


  /* =========================
     BUILD SPANISH PUZZLES
  ========================= */

  /*
    The existing English puzzles.json
    already contains fully generated
    rounds.

    The Spanish file only needs to
    contain the six words.

    This function builds the same
    round structure used by the
    existing game.
  */

  function buildPuzzleFromWords(
    sourcePuzzle
  ) {

    const words =
      sourcePuzzle.words
        .map(
          word =>
            word
              .trim()
              .toLowerCase()
        );


    const rounds = [];


    for (
      let i = 0;
      i < words.length;
      i++
    ) {

      const target =
        words[i];


      /*
        FIRST ROUND
      */

      if (i === 0) {

        const distractors =
          getDistractors(
            target,
            3
          );


        const pool = [];


        for (
          const letter
          of target
        ) {

          pool.push({

            letter,

            distractor: false

          });

        }


        for (
          const letter
          of distractors
        ) {

          pool.push({

            letter,

            distractor: true

          });

        }


        rounds.push({

          length:
            target.length,

          target,

          pool:
            shuffle(pool)

        });


        continue;

      }


      /*
        FOLLOWING ROUNDS
      */

      const previous =
        words[i - 1];


      const newLetter =
        getNewLetter(
          previous,
          target
        );


      /*
        Safety check.
      */

      if (!newLetter) {

        throw new Error(

          `Invalid Spanish chain: ${previous} -> ${target}`

        );

      }


      const distractors =
        getDistractors(
          target,
          3
        );


      const newSet = [

        {

          letter:
            newLetter,

          distractor:
            false

        }

      ];


      for (
        const letter
        of distractors
      ) {

        newSet.push({

          letter,

          distractor:
            true

        });

      }


      rounds.push({

        length:
          target.length,

        target,

        carried:
          previous
            .split('')
            .map(
              letter => ({
                letter
              })
            ),

        newSet:
          shuffle(newSet)

      });

    }


    return {

      id:
        sourcePuzzle.id,

      rounds,

      words

    };

  }


  function preparePuzzles(
    data
  ) {

    return data.map(
      sourcePuzzle => {

        /*
          English puzzle files already
          have rounds.
        */

        if (
          Array.isArray(
            sourcePuzzle.rounds
          )
        ) {

          return sourcePuzzle;

        }


        /*
          Spanish puzzle files contain
          only words.
        */

        return buildPuzzleFromWords(
          sourcePuzzle
        );

      }
    );

  }


  /* =========================
     PUZZLE SELECTION
  ========================= */

  function randomPuzzleId(
    excludeId
  ) {

    if (
      PUZZLES.length <= 1
    ) {

      return 0;

    }


    let id;


    do {

      id =
        Math.floor(
          Math.random() *
          PUZZLES.length
        );

    }

    while (
      id === excludeId
    );


    return id;

  }


  /* =========================
     GAME START
  ========================= */

  function startGame() {

    const saved =
      loadProgress();


    if (

      saved &&

      PUZZLES[
        saved.puzzleId
      ] &&

      saved.roundIndex <
        TOTAL_ROUNDS

    ) {

      puzzle =
        PUZZLES[
          saved.puzzleId
        ];


      roundIndex =
        saved.roundIndex;


      solvedWords =
        saved.solvedWords || [];


      hintsRemaining =
        typeof saved.hintsRemaining ===
        'number'

          ? saved.hintsRemaining

          : TOTAL_HINTS;


      startTimer();

      setupRound(
        saved.hintTierThisRound || 0
      );

    }

    else {

      clearProgress();

      startRandomGame();

    }

  }


  function startRandomGame() {

    puzzle =
      PUZZLES[
        randomPuzzleId(
          puzzle?.id
        )
      ];

    roundIndex = 0;

solvedWords = [];

hintsRemaining =
  TOTAL_HINTS;

startTimer();

recordGamePlayed();

setupRound();

  }


  /* =========================
     ROUND SETUP
  ========================= */

  function setupRound(
    resumeHintTier
  ) {

    locked = false;


    hintTierThisRound =
      resumeHintTier || 0;


    const round =
      puzzle.rounds[
        roundIndex
      ];


    slots =
      new Array(
        round.length
      ).fill(null);


    tiles = [];


    let uid = 0;


    /*
      FIRST ROUND
    */

    if (
      roundIndex === 0
    ) {

      for (
        const t
        of round.pool
      ) {

        tiles.push({

          id:
            uid++,

          letter:
            t.letter,

          group:
            'base',

          distractor:
            t.distractor,

          used:
            false,

          removed:
            false,

          locked:
            false

        });

      }

    }


    /*
      FOLLOWING ROUNDS
    */

    else {

      for (
        const t
        of round.carried
      ) {

        tiles.push({

          id:
            uid++,

          letter:
            t.letter,

          group:
            'carried',

          distractor:
            false,

          used:
            false,

          removed:
            false,

          locked:
            false

        });

      }


      for (
        const t
        of round.newSet
      ) {

        tiles.push({

          id:
            uid++,

          letter:
            t.letter,

          group:
            'new',

          distractor:
            t.distractor,

          used:
            false,

          removed:
            false,

          locked:
            false

        });

      }

    }


    /*
      Re-apply hints after
      refreshing the page.
    */

    if (
      hintTierThisRound >= 1
    ) {

      removeADistractor();

    }


    if (
      hintTierThisRound >= 2
    ) {

      revealLetterAt(
        0,
        round.target
      );

    }


    if (
      hintTierThisRound >= 3
    ) {

      revealLetterAt(
        1,
        round.target
      );

    }


    setMessage(
      '',
      ''
    );


    renderAll();


    saveProgress();

  }


  /* =========================
     RENDERING
  ========================= */

  function renderAll() {

    renderProgress();

    renderStage();

    renderPools();

    renderControls();

  }


  function renderProgress() {

    el.progressRow.innerHTML =
      '';


    for (
      let i = 0;
      i < TOTAL_ROUNDS;
      i++
    ) {

      const dot =
        document.createElement(
          'div'
        );


      dot.className =
        'progress-dot';


      if (
        i < roundIndex
      ) {

        dot.className +=
          ' done';

        dot.textContent =
          '✓';

      }


      else if (
        i === roundIndex
      ) {

        dot.className +=
          ' current';

        dot.textContent =
          String(
            i + 1
          );

      }


      else {

        dot.textContent =
          String(
            i + 1
          );

      }


      el.progressRow.appendChild(
        dot
      );

    }

  }


  function renderStage() {

    const round =
      puzzle.rounds[
        roundIndex
      ];


    el.wordLabel.textContent =

      `${t('word')} ${
        roundIndex + 1
      } ${t('of')} ${
        TOTAL_ROUNDS
      } · ${
        round.length
      } ${t('letters')}`;


    el.slots.innerHTML =
      '';


    el.slots.classList.remove(
      'shake',
      'success'
    );


    slots.forEach(
      (
        tileId,
        idx
      ) => {

        const box =
          document.createElement(
            'div'
          );


        box.className =
          'slot';


        box.dataset.index =
          String(idx);


        if (
          tileId !== null
        ) {

          const tile =
            tiles.find(
              item =>
                item.id ===
                tileId
            );


          box.classList.add(
            'filled'
          );


          if (
            tile.group ===
            'carried'
          ) {

            box.classList.add(
              'from-carried'
            );

          }


          if (
            tile.locked
          ) {

            box.classList.add(
              'locked'
            );

          }


          box.textContent =
            tile.letter
              .toUpperCase();


          box.addEventListener(
            'click',
            () =>
              removeSlot(idx)
          );

        }


        el.slots.appendChild(
          box
        );

      }
    );

  }


  function renderPools() {

    const round =
      puzzle.rounds[
        roundIndex
      ];


    if (
      roundIndex === 0
    ) {

      el.carriedGroup.hidden =
        true;


      el.newGroup.classList.add(
        'base-mode'
      );


      el.newCaption.textContent =
        t('arrange');

    }


    else {

      el.carriedGroup.hidden =
        false;


      el.newGroup.classList.remove(
        'base-mode'
      );


      const previousWord =
        solvedWords[
          solvedWords.length - 1
        ];


      el.carriedCaption.textContent =

        previousWord

          ? `${t('carriedFrom')} "${previousWord.toUpperCase()}"`

          : t('carriedLetters');


      el.newCaption.textContent =
        t('pickNew');

    }


    el.carriedPool.innerHTML =
      '';


    el.newPool.innerHTML =
      '';


    for (
      const tile
      of tiles
    ) {

      if (
        tile.removed
      ) {

        continue;

      }


      const btn =
        document.createElement(
          'button'
        );


      btn.className =
        'tile';


      btn.type =
        'button';


      btn.textContent =
        tile.letter
          .toUpperCase();


      if (
        tile.group ===
        'carried'
      ) {

        btn.classList.add(
          'carried'
        );

      }


      if (
        tile.group ===
        'base'
      ) {

        btn.classList.add(
          'base'
        );

      }


      if (
        tile.used
      ) {

        btn.classList.add(
          'used'
        );

      }


      btn.disabled =
        tile.used ||
        locked;


      btn.addEventListener(
        'click',
        () =>
          placeTile(
            tile.id
          )
      );


      (
        tile.group ===
        'carried'

          ? el.carriedPool

          : el.newPool

      ).appendChild(
        btn
      );

    }

  }


  function renderControls() {

    el.hintCount.textContent =
      String(
        hintsRemaining
      );


    el.hintBtn.disabled =

      hintsRemaining <= 0 ||

      hintTierThisRound >= 3 ||

      locked;


    el.clearBtn.disabled =

      locked ||

      slots.every(
        s =>
          s === null
      );

  }


  /* =========================
     MESSAGES
  ========================= */

  function setMessage(
    text,
    kind
  ) {

    el.message.textContent =
      text;


    el.message.className =
      'message' +
      (
        kind
          ? ' ' + kind
          : ''
      );

  }


  /* =========================
     TILE INTERACTIONS
  ========================= */

  function placeTile(
    tileId
  ) {

    if (locked) {
      return;
    }


    const tile =
      tiles.find(
        t =>
          t.id ===
          tileId
      );


    if (
      !tile ||
      tile.used ||
      tile.removed
    ) {

      return;

    }


    const emptyIndex =
      slots.findIndex(
        s =>
          s === null
      );


    if (
      emptyIndex === -1
    ) {

      return;

    }


    tile.used =
      true;


    slots[
      emptyIndex
    ] =
      tileId;


    setMessage(
      '',
      ''
    );


    renderAll();


    if (
      slots.every(
        s =>
          s !== null
      )
    ) {

      locked =
        true;


      setTimeout(
        checkAnswer,
        180
      );

    }

  }


  function removeSlot(
    idx
  ) {

    if (locked) {
      return;
    }


    const tileId =
      slots[idx];


    if (
      tileId === null
    ) {

      return;

    }


    const tile =
      tiles.find(
        t =>
          t.id ===
          tileId
      );


    if (
      tile.locked
    ) {

      return;

    }


    tile.used =
      false;


    slots[idx] =
      null;


    setMessage(
      '',
      ''
    );


    renderAll();

  }


  function clearUnlockedSlots() {

    for (
      let i = 0;
      i < slots.length;
      i++
    ) {

      const tileId =
        slots[i];


      if (
        tileId === null
      ) {

        continue;

      }


      const tile =
        tiles.find(
          t =>
            t.id ===
            tileId
        );


      if (
        tile.locked
      ) {

        continue;

      }


      tile.used =
        false;


      slots[i] =
        null;

    }

  }


  /* =========================
     ANSWER CHECKING
  ========================= */

  function checkAnswer() {

    const round =
      puzzle.rounds[
        roundIndex
      ];


    const word =
      slots

        .map(
          id =>
            tiles.find(
              t =>
                t.id === id
            ).letter
        )

        .join('');


    if (
      word ===
      round.target
    ) {

      handleSuccess();

    }

    else {

      handleFail();

    }

  }


  function handleFail() {

    el.slots.classList.add(
      'shake'
    );


    setMessage(
      t('notQuite'),
      'error'
    );


    setTimeout(
      () => {

        clearUnlockedSlots();

        locked =
          false;

        renderAll();

      },
      500
    );

  }


  function handleSuccess() {

    el.slots.classList.add(
      'success'
    );


    const round =
      puzzle.rounds[
        roundIndex
      ];


    const isLast =
      roundIndex ===
      TOTAL_ROUNDS - 1;


    setMessage(

      isLast
        ? t('chainComplete')
        : t('nextWord'),

      'success'

    );


    solvedWords.push(
      round.target
    );


    renderControls();


    setTimeout(
      () => {

        roundIndex++;


        if (
          roundIndex >=
          TOTAL_ROUNDS
        ) {

          stopTimer();

          recordGameWon(
            elapsedSeconds
          );

          saveProgress();

          renderWin();

        }

        else {

          setupRound();

        }

      },
      750
    );

  }


  /* =========================
     HINTS
  ========================= */

  function useHint() {

    if (

      hintsRemaining <= 0 ||

      hintTierThisRound >= 3 ||

      locked

    ) {

      return;

    }


    hintTierThisRound++;


    hintsRemaining--;


    const round =
      puzzle.rounds[
        roundIndex
      ];


    if (
      hintTierThisRound === 1
    ) {

      removeADistractor();

    }


    else {

      revealLetterAt(

        hintTierThisRound - 2,

        round.target

      );

    }


    saveProgress();


    renderAll();

  }


  function removeADistractor() {

    let candidate =
      tiles.find(

        t =>
          !t.removed &&
          t.distractor &&
          !t.used

      );


    if (!candidate) {

      candidate =
        tiles.find(

          t =>
            !t.removed &&
            t.distractor

        );

    }


    if (!candidate) {
      return;
    }


    if (
      candidate.used
    ) {

      const slotIdx =
        slots.findIndex(
          id =>
            id ===
            candidate.id
        );


      if (
        slotIdx !== -1
      ) {

        slots[
          slotIdx
        ] =
          null;

      }


      candidate.used =
        false;

    }


    candidate.removed =
      true;

  }


  function revealLetterAt(
    pos,
    target
  ) {

    if (
      pos < 0 ||
      pos >= target.length
    ) {

      return;

    }


    const letter =
      target[pos];


    const existingId =
      slots[pos];


    if (
      existingId !== null
    ) {

      const existingTile =
        tiles.find(
          t =>
            t.id ===
            existingId
        );


      if (
        existingTile.letter ===
        letter
      ) {

        existingTile.locked =
          true;

        return;

      }


      existingTile.used =
        false;


      slots[pos] =
        null;

    }


    const tile =
      tiles.find(

        t =>
          !t.removed &&
          !t.used &&
          t.letter ===
            letter &&
          !t.distractor

      );


    if (!tile) {
      return;
    }


    tile.used =
      true;


    tile.locked =
      true;


    slots[pos] =
      tile.id;

  }


  /* =========================
     WIN SCREEN
  ========================= */

  function renderWin() {

    clearProgress();


    el.panel.innerHTML = `

      <div class="win-screen">

        <h2>
          ${t('ladderComplete')}
        </h2>

        <div
          class="win-chain"
          id="win-chain"
        ></div>

        <button
          class="btn btn-hint"
          id="win-new-game"
        >
          ${t('playRandom')}
        </button>

      </div>

    `;


    const chainEl =
      document.getElementById(
        'win-chain'
      );


    const words =
      puzzle.words;


    words.forEach(
      (
        word,
        i
      ) => {

        const line =
          document.createElement(
            'div'
          );


        line.className =
          'step';


        line.textContent =
          `${i + 1}. ${
            word.toUpperCase()
          }`;


        chainEl.appendChild(
          line
        );

      }
    );


    document
      .getElementById(
        'win-new-game'
      )
      .addEventListener(
        'click',
        () => {

          rebuildPanelDom();

          startRandomGame();

        }
      );

  }


  /* =========================
     REBUILD GAME PANEL
  ========================= */

  function rebuildPanelDom() {

    el.panel.innerHTML = `

      <div
        class="progress-row"
        id="progress-row"
        aria-label="Round progress"
      ></div>


      <div class="stage">

        <div
          class="word-label"
          id="word-label"
        ></div>

        <div
          class="slots"
          id="slots"
        ></div>

      </div>


      <div class="pool-area">

        <div
          class="pool-group"
          id="carried-group"
        >

          <div
            class="pool-caption"
            id="carried-caption"
          >
            ${t('carriedLetters')}
          </div>

          <div
            class="pool"
            id="carried-pool"
          ></div>

        </div>


        <div
          class="pool-group"
          id="new-group"
        >

          <div
            class="pool-caption"
            id="new-caption"
          >
            ${t('pickNew')}
          </div>

          <div
            class="pool"
            id="new-pool"
          ></div>

        </div>

      </div>


      <div class="controls">

        <button
          id="clear-btn"
          class="btn btn-ghost"
        >
          ${t('clear')}
        </button>

        <button
          id="hint-btn"
          class="btn btn-hint"
        >
          ${t('hint')}
          <span id="hint-count">
            3
          </span>
        </button>

      </div>


      <div
        class="message"
        id="message"
        role="status"
        aria-live="polite"
      ></div>

    `;


    /*
      Reconnect dynamic DOM references.
    */

    el.progressRow =
      document.getElementById(
        'progress-row'
      );


    el.wordLabel =
      document.getElementById(
        'word-label'
      );


    el.slots =
      document.getElementById(
        'slots'
      );


    el.carriedGroup =
      document.getElementById(
        'carried-group'
      );


    el.newGroup =
      document.getElementById(
        'new-group'
      );


    el.carriedCaption =
      document.getElementById(
        'carried-caption'
      );


    el.newCaption =
      document.getElementById(
        'new-caption'
      );


    el.carriedPool =
      document.getElementById(
        'carried-pool'
      );


    el.newPool =
      document.getElementById(
        'new-pool'
      );


    el.clearBtn =
      document.getElementById(
        'clear-btn'
      );


    el.hintBtn =
      document.getElementById(
        'hint-btn'
      );


    el.hintCount =
      document.getElementById(
        'hint-count'
      );


    el.message =
      document.getElementById(
        'message'
      );


    /*
      Reconnect buttons.
    */

    el.clearBtn.addEventListener(
      'click',
      () => {

        if (locked) {
          return;
        }


        clearUnlockedSlots();


        setMessage(
          '',
          ''
        );


        renderAll();

      }
    );


    el.hintBtn.addEventListener(
      'click',
      useHint
    );

  }


  /* =========================
     LANGUAGE UI
  ========================= */

  function updateLanguageUI() {

    document.documentElement.lang =
      currentLanguage === 'es'
        ? 'es'
        : 'en';


    document.title =
      t('pageTitle');


    /*
      Language buttons.
    */

    el.languageEnglish.classList.toggle(
      'active',
      currentLanguage === 'en'
    );


    el.languageSpanish.classList.toggle(
      'active',
      currentLanguage === 'es'
    );


    el.languageEnglish.setAttribute(
      'aria-pressed',
      String(
        currentLanguage === 'en'
      )
    );


    el.languageSpanish.setAttribute(
      'aria-pressed',
      String(
        currentLanguage === 'es'
      )
    );


    /*
      Header.
    */

    el.howToBtn.setAttribute(
      'aria-label',
      t('howToPlay')
    );


    el.howToBtn.setAttribute(
      'title',
      t('howToPlay')
    );


    el.statsBtn.textContent =
      t('stats');


    el.statsBtn.setAttribute(
      'aria-label',
      t('stats')
    );


    el.statsBtn.setAttribute(
      'title',
      t('stats')
    );


    /*
      Footer.
    */

    el.newGameBtn.textContent =
      t('newGame');


    /*
      How-to modal.
    */

    el.howToTitle.textContent =
      t('howToPlay');


    el.howToP1.textContent =
      t('howToP1');


    el.howToP2.innerHTML =
      `
        <span class="swatch swatch-new"></span>
        <strong>
          ${
            currentLanguage === 'es'
              ? 'Letras nuevas'
              : 'New letters'
          }
        </strong>
        —
        ${
          currentLanguage === 'es'
            ? 'elige la única letra correcta entre 4 opciones (3 son distractores).'
            : 'pick the one correct new letter from a set of 4 (3 are decoys).'
        }
      `;


    el.howToP3.innerHTML =
      `
        <span class="swatch swatch-carried"></span>
        <strong>
          ${
            currentLanguage === 'es'
              ? 'Letras anteriores'
              : 'Carried letters'
          }
        </strong>
        —
        ${
          currentLanguage === 'es'
            ? 'todas las letras de tu última palabra deben reutilizarse en la siguiente.'
            : 'every letter from your last solved word must be reused in the next one.'
        }
      `;


    el.howToP4.textContent =
      t('howToP4');


    el.howToP5.textContent =
      t('howToP5');


    el.howToGotIt.textContent =
      t('gotIt');


    /*
      If the game is currently running,
      update the visible game text.
    */

    if (puzzle) {

      renderAll();

    }

  }


  /* =========================
     LOAD LANGUAGE
  ========================= */

  async function loadLanguage(
    language
  ) {

    currentLanguage =
      language;


    /*
      Reset current state while
      the new language loads.
    */

    puzzle = null;

    PUZZLES = [];

    roundIndex = 0;

    solvedWords = [];

    hintsRemaining =
      TOTAL_HINTS;

    hintTierThisRound = 0;

    tiles = [];

    slots = [];

    locked = false;


    updateLanguageUI();


    rebuildPanelDom();


    setMessage(
      t('loading'),
      ''
    );


    try {

      const response =
        await fetch(
          PUZZLE_FILES[
            currentLanguage
          ]
        );


      if (
        !response.ok
      ) {

        throw new Error(
          'Puzzle file could not be loaded.'
        );

      }


      const data =
        await response.json();


      PUZZLES =
        preparePuzzles(
          data
        );


      if (
        !PUZZLES.length
      ) {

        throw new Error(
          'No puzzles found.'
        );

      }


      startGame();

    }

    catch (error) {

      console.error(
        error
      );


      setMessage(
        t('loadError'),
        'error'
      );

    }

  }


  /* =========================
     EVENT LISTENERS
  ========================= */

  el.clearBtn.addEventListener(
    'click',
    () => {

      if (locked) {
        return;
      }


      clearUnlockedSlots();


      setMessage(
        '',
        ''
      );


      renderAll();

    }
  );


  el.hintBtn.addEventListener(
    'click',
    useHint
  );


  el.newGameBtn.addEventListener(
    'click',
    () => {

      clearProgress();


      rebuildPanelDom();


      startRandomGame();

    }
  );


  el.howToBtn.addEventListener(
    'click',
    () => {

      el.howToModal.hidden =
        false;

    }
  );


  el.statsBtn.addEventListener(
    'click',
    openStats
  );


  el.statsClose.addEventListener(
    'click',
    closeStats
  );


  el.statsCloseBtn.addEventListener(
    'click',
    closeStats
  );


  el.statsModal.addEventListener(
    'click',
    event => {

      if (
        event.target ===
        el.statsModal
      ) {

        closeStats();

      }

    }
  );


  el.howToClose.addEventListener(
    'click',
    () => {

      el.howToModal.hidden =
        true;

    }
  );


  el.howToGotIt.addEventListener(
    'click',
    () => {

      el.howToModal.hidden =
        true;

    }
  );


  el.howToModal.addEventListener(
    'click',
    event => {

      if (
        event.target ===
        el.howToModal
      ) {

        el.howToModal.hidden =
          true;

      }

    }
  );


  /*
    Language buttons.
  */

  el.languageEnglish.addEventListener(
    'click',
    () => {

      if (
        currentLanguage !== 'en'
      ) {

        loadLanguage('en');

      }

    }
  );


  el.languageSpanish.addEventListener(
    'click',
    () => {

      if (
        currentLanguage !== 'es'
      ) {

        loadLanguage('es');

      }

    }
  );


  /* =========================
     KEYBOARD CONTROLS
  ========================= */

  document.addEventListener(
    'keydown',
    event => {

      if (!puzzle) {
        return;
      }


      /*
        Backspace
      */

      if (
        event.key ===
        'Backspace'
      ) {

        const lastFilled =
          [
            ...slots
          ]
            .reverse()
            .findIndex(
              s =>
                s !== null
            );


        if (
          lastFilled !== -1
        ) {

          removeSlot(

            slots.length -
            1 -
            lastFilled

          );

        }


        return;

      }


      /*
        Letters
      */

      if (
        /^[a-zA-Z]$/.test(
          event.key
        )
      ) {

        const letter =
          event.key.toLowerCase();


        const tile =
          tiles.find(

            t =>
              !t.used &&
              !t.removed &&
              t.letter ===
                letter

          );


        if (tile) {

          placeTile(
            tile.id
          );

        }

      }

    }
  );


  /* =========================
     INITIAL LOAD
  ========================= */

  updateLanguageUI();


  loadLanguage('en');

})();