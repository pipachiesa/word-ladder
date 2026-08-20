# Word Ladder

A Wordle-style word game: grow one word into another, letter by letter, across 6 rounds.

Play it here: **https://pipachiesa.github.io/word-ladder/**

## How it works

Each game is a chain of 6 words. The first word has 3 letters; every word after
that adds exactly one new letter to the last, growing all the way to 8 letters
(e.g. `put → puts → upset → upsets → suspect → suspects`).

- **Round 1**: pick the target word's letters out of a pool of 6 (3 correct + 3 decoys).
- **Rounds 2–6**: every letter from your last solved word carries forward
  (shown in pink) — you must reuse all of them. You also get a set of 4 new
  letters (shown in cream), only one of which is correct; pick the right one
  to extend the word.
- You get **3 hints total** for the whole game. Hints escalate per word: the
  1st use removes a decoy, the 2nd reveals the first letter, the 3rd reveals
  the second letter.
- A puzzle is picked at random on each new visit, with progress saved to
  localStorage so a reload resumes where you left off; use "New random
  puzzle" to jump to a different chain.

Pure static site — `index.html` / `style.css` / `game.js` — no build step, no
dependencies, deployed via GitHub Pages.

## Data pipeline

`engwords.txt` (42,405 English words) is the source dictionary — every node
in the word graph comes from this file.

`puzzles.json` (150 pre-generated chains) is built by treating every word as a
node and connecting word → word when the longer word's letters are an exact
anagram of the shorter word's letters plus one extra letter. The generator
does a randomized walk across that graph, biased toward common words (ranked
via [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)),
from a 3-letter start to an 8-letter end. `tools/data/blocklist.txt` is a
small manual list of words to exclude if any slip through as confusing or
inappropriate for a puzzle.

To regenerate:

```bash
cd tools
node build_puzzles.js
node count_paths.js      # sanity check: richness of the underlying word graph
```

`build_puzzles.js` reads `../engwords.txt` and `tools/data/en_50k.txt`
(gitignored — re-download if missing):

```bash
curl -sL -o tools/data/en_50k.txt https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt
```

`tools/build_wordlist.js` is kept as a fallback: if you don't have your own
`engwords.txt`, it derives one from
[dwyl/english-words](https://github.com/dwyl/english-words) filtered for
commonness and proper nouns (needs `tools/data/words_alpha.txt`, also
gitignored).
