// Builds engwords.txt: a curated English word list (~42k words, length 3-10)
// Source: dwyl/english-words (dictionary validity) + hermitdave/FrequencyWords (commonness ranking)
const fs = require('fs');
const path = require('path');

const dictPath = path.join(__dirname, 'data/words_alpha.txt');
const freqPath = path.join(__dirname, 'data/en_50k.txt');

const properNames = new Set(
  fs.readFileSync('/usr/share/dict/propernames', 'utf8').split('\n').map(w => w.trim().toLowerCase()).filter(Boolean)
);
const blocklist = new Set(
  fs.readFileSync(path.join(__dirname, 'data/blocklist.txt'), 'utf8').split('\n').map(w => w.trim().toLowerCase()).filter(Boolean)
);

const dict = new Set(
  fs.readFileSync(dictPath, 'utf8').split('\n').map(w => w.trim().toLowerCase())
    .filter(w => /^[a-z]+$/.test(w) && !properNames.has(w) && !blocklist.has(w))
);

const freqOrder = fs.readFileSync(freqPath, 'utf8').split('\n')
  .map(line => line.trim().split(' '))
  .filter(parts => parts.length === 2)
  .map(([w, c]) => [w.toLowerCase(), Number(c)])
  .filter(([w]) => /^[a-z]+$/.test(w));

const MIN_LEN = 3, MAX_LEN = 10;

// 1) Common words: in both the frequency list and the dictionary.
const common = [];
const seen = new Set();
for (const [w, c] of freqOrder) {
  if (w.length < MIN_LEN || w.length > MAX_LEN) continue;
  if (!dict.has(w)) continue;
  if (seen.has(w)) continue;
  seen.add(w);
  common.push(w);
}

console.log('common words from frequency list:', common.length);

// 2) Backfill per length so every length 3-10 has healthy coverage
//    (frequency lists skew short; long words need dictionary backfill).
const byLen = {};
for (let l = MIN_LEN; l <= MAX_LEN; l++) byLen[l] = [];
for (const w of common) byLen[w.length].push(w);

const TARGET_PER_LEN = {
  3: 1000, 4: 3500, 5: 6000, 6: 7500, 7: 7500, 8: 6500, 9: 5000, 10: 4000
};

const allDictByLen = {};
for (let l = MIN_LEN; l <= MAX_LEN; l++) allDictByLen[l] = [];
for (const w of dict) {
  if (w.length >= MIN_LEN && w.length <= MAX_LEN) allDictByLen[w.length].push(w);
}
for (let l = MIN_LEN; l <= MAX_LEN; l++) allDictByLen[l].sort();

const final = new Set(common);
for (let l = MIN_LEN; l <= MAX_LEN; l++) {
  const need = (TARGET_PER_LEN[l] || 0) - byLen[l].length;
  if (need > 0) {
    let added = 0;
    for (const w of allDictByLen[l]) {
      if (added >= need) break;
      if (!final.has(w)) {
        final.add(w);
        added++;
      }
    }
  }
}

const result = Array.from(final).sort();
console.log('final word count:', result.length);
const lenCounts = {};
for (const w of result) lenCounts[w.length] = (lenCounts[w.length] || 0) + 1;
console.log('by length:', lenCounts);

fs.writeFileSync(path.join(__dirname, '../engwords.txt'), result.join('\n') + '\n');
console.log('wrote engwords.txt');
