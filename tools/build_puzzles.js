// Builds puzzles.json: chains of 8 words, lengths 3..10, where each word is an
// anagram of the previous word's letters plus exactly one new letter.
const fs = require('fs');
const path = require('path');

const words = fs.readFileSync(path.join(__dirname, '../engwords.txt'), 'utf8')
  .split('\n').map(w => w.trim()).filter(Boolean);

// Use only the top of the frequency list as "common" — the tail of a 50k
// list is full of corpus noise (names, abbreviations, foreign loanwords)
// that makes for confusing puzzle words. Short words are the most exposed
// (they're always the chain's starting word), so cap them tighter.
const freqLines = fs.readFileSync(path.join(__dirname, 'data/en_50k.txt'), 'utf8')
  .split('\n').filter(Boolean);
const freqRank = new Map();
freqLines.forEach((line, i) => freqRank.set(line.split(' ')[0], i));
function freqCapFor(len) { return len === 3 ? 5000 : 20000; }
const commonSet = new Set(words.filter(w => {
  const r = freqRank.get(w);
  return r !== undefined && r < freqCapFor(w.length);
}));

const MIN_LEN = 3, MAX_LEN = 10;
const wordsByLen = {};
for (let l = MIN_LEN; l <= MAX_LEN; l++) wordsByLen[l] = [];
for (const w of words) if (w.length >= MIN_LEN && w.length <= MAX_LEN) wordsByLen[w.length].push(w);

function sig(w) { return w.split('').sort().join(''); }

// reverseMap[L] : signature-of-length-(L-1) -> [{word, addedLetter}]
// built from words of length L, by removing one instance of each unique letter.
const reverseMap = {};
for (let l = MIN_LEN + 1; l <= MAX_LEN; l++) {
  const m = new Map();
  for (const w of wordsByLen[l]) {
    const chars = w.split('');
    const uniq = new Set(chars);
    for (const c of uniq) {
      const idx = chars.indexOf(c);
      const reduced = chars.slice(0, idx).concat(chars.slice(idx + 1));
      const s = reduced.slice().sort().join('');
      if (!m.has(s)) m.set(s, []);
      m.get(s).push({ word: w, addedLetter: c });
    }
  }
  reverseMap[l] = m;
}

function successors(word) {
  const l = word.length;
  const m = reverseMap[l + 1];
  if (!m) return [];
  const s = sig(word);
  return m.get(s) || [];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomChain() {
  const commonStarts = shuffle(wordsByLen[MIN_LEN].filter(w => commonSet.has(w)));
  for (const start of commonStarts.slice(0, 400)) {
    const chain = [start];
    const addedLetters = [];
    let ok = true;
    let usedRare = false;
    for (let step = 0; step < MAX_LEN - MIN_LEN; step++) {
      const cur = chain[chain.length - 1];
      const opts = shuffle(successors(cur));
      // strongly prefer common (frequency-validated) words; only fall back
      // to obscure dictionary words if no common option exists.
      const commonOpts = opts.filter(o => commonSet.has(o.word) && !chain.includes(o.word));
      const rareOpts = opts.filter(o => !commonSet.has(o.word) && !chain.includes(o.word));
      const found = commonOpts[0] || rareOpts[0];
      if (!found) { ok = false; break; }
      if (!commonOpts[0]) usedRare = true;
      chain.push(found.word);
      addedLetters.push(found.addedLetter);
    }
    if (ok && chain.length === MAX_LEN - MIN_LEN + 1) {
      return { chain, addedLetters, usedRare };
    }
  }
  return null;
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
function randomLetterNotIn(exclude) {
  let c;
  do { c = ALPHABET[Math.floor(Math.random() * ALPHABET.length)]; } while (exclude.has(c));
  return c;
}

function buildRounds(chain, addedLetters) {
  const rounds = [];
  // Round 1: base word, pool = word letters + 3 distractors, single color.
  const w1 = chain[0];
  const usedLetters = new Set(w1.split(''));
  const distractors1 = [];
  while (distractors1.length < 3) {
    const c = randomLetterNotIn(usedLetters);
    usedLetters.add(c);
    distractors1.push(c);
  }
  const pool1 = w1.split('').map(l => ({ letter: l, distractor: false }))
    .concat(distractors1.map(l => ({ letter: l, distractor: true })));
  rounds.push({
    length: w1.length,
    target: w1,
    pool: shuffle(pool1),
  });

  for (let i = 1; i < chain.length; i++) {
    const prev = chain[i - 1];
    const target = chain[i];
    const addedLetter = addedLetters[i - 1];
    const excl = new Set(prev.split('').concat([addedLetter]));
    const distractors = [];
    while (distractors.length < 3) {
      const c = randomLetterNotIn(excl);
      excl.add(c);
      distractors.push(c);
    }
    const newSet = [{ letter: addedLetter, distractor: false }]
      .concat(distractors.map(l => ({ letter: l, distractor: true })));
    rounds.push({
      length: target.length,
      target,
      carried: shuffle(prev.split('').map(l => ({ letter: l }))),
      newSet: shuffle(newSet),
    });
  }
  return rounds;
}

const NUM_PUZZLES = 150;
const fullyCommon = [];
const withRare = [];
const seenFirstWords = new Set();
let attempts = 0;
const MAX_ATTEMPTS = NUM_PUZZLES * 200;
while (fullyCommon.length < NUM_PUZZLES && attempts < MAX_ATTEMPTS) {
  attempts++;
  const result = randomChain();
  if (!result) continue;
  const { chain, addedLetters, usedRare } = result;
  const key = chain.join('>');
  if (seenFirstWords.has(key)) continue;
  seenFirstWords.add(key);
  const puzzle = { chain, addedLetters };
  if (usedRare) withRare.push(puzzle);
  else fullyCommon.push(puzzle);
}

console.log('fully-common chains found:', fullyCommon.length, 'rare-fallback chains found:', withRare.length, 'attempts:', attempts);

const chosen = fullyCommon.concat(withRare).slice(0, NUM_PUZZLES);
const puzzles = chosen.map((p, i) => ({
  id: i,
  words: p.chain,
  rounds: buildRounds(p.chain, p.addedLetters),
}));

console.log('generated puzzles:', puzzles.length);
if (puzzles.length) {
  console.log('sample chain:', puzzles[0].words.join(' -> '));
}

fs.writeFileSync(path.join(__dirname, '../puzzles.json'), JSON.stringify(puzzles));
console.log('wrote puzzles.json');
