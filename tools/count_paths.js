// Counts the total number of distinct 8-word chains (length 3 -> 10) reachable
// in the full engwords.txt graph, as a richness sanity check.
const fs = require('fs');
const path = require('path');

const words = fs.readFileSync(path.join(__dirname, '../engwords.txt'), 'utf8')
  .split('\n').map(w => w.trim()).filter(Boolean);

const MIN_LEN = 3, MAX_LEN = 10;
const wordsByLen = {};
for (let l = MIN_LEN; l <= MAX_LEN; l++) wordsByLen[l] = [];
for (const w of words) if (w.length >= MIN_LEN && w.length <= MAX_LEN) wordsByLen[w.length].push(w);

function sig(w) { return w.split('').sort().join(''); }

// sigGroups[L]: signature -> list of words of length L with that signature
const sigGroups = {};
for (let l = MIN_LEN; l <= MAX_LEN; l++) {
  const m = new Map();
  for (const w of wordsByLen[l]) {
    const s = sig(w);
    if (!m.has(s)) m.set(s, []);
    m.get(s).push(w);
  }
  sigGroups[l] = m;
}

// count[L]: word -> number of distinct chains of words length MIN_LEN..L ending at word
let count = {};
for (const w of wordsByLen[MIN_LEN]) count[w] = 1n;

for (let l = MIN_LEN + 1; l <= MAX_LEN; l++) {
  // sigTotal: signature (of length l-1) -> total chain count reaching that signature group
  const sigTotal = new Map();
  for (const [s, ws] of sigGroups[l - 1]) {
    let total = 0n;
    for (const w of ws) total += (count[w] || 0n);
    sigTotal.set(s, total);
  }
  const next = {};
  for (const w of wordsByLen[l]) {
    const chars = w.split('');
    const uniq = new Set(chars);
    let total = 0n;
    for (const c of uniq) {
      const idx = chars.indexOf(c);
      const reduced = chars.slice(0, idx).concat(chars.slice(idx + 1)).sort().join('');
      total += sigTotal.get(reduced) || 0n;
    }
    if (total > 0n) next[w] = total;
  }
  count = next;
  let sum = 0n;
  for (const w in count) sum += count[w];
  console.log(`length ${l}: distinct words reachable=${Object.keys(count).length}, total chains ending here=${sum}`);
}

let grand = 0n;
for (const w in count) grand += count[w];
console.log('TOTAL distinct 8-word chains (length 3->10):', grand.toString());
