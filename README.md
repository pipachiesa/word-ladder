# Word Ladder

A Wordle-style word game: grow one word into another, letter by letter, across 8 rounds.

Play it here: **https://pipachiesa.github.io/word-ladder/**

## How it works

Each game is a chain of 8 words. The first word has 3 letters; every word after
that adds exactly one new letter to the last, growing all the way to 10 letters
(e.g. `rip → pier → pride → spider → diapers → paradise → disappear → disappears`).

- **Round 1**: pick the target word's letters out of a pool of 6 (3 correct + 3 decoys).
- **Rounds 2–8**: every letter from your last solved word carries forward
  (shown in pink) — you must reuse all of them. You also get a set of 4 new
  letters (shown in cream), only one of which is correct; pick the right one
  to extend the word.
- You get **3 hints total** for the whole game. Hints escalate per word: the
  1st use removes a decoy, the 2nd reveals the first letter, the 3rd reveals
  the second letter.
- A new daily puzzle is picked deterministically each day (like Wordle); use
  "New random puzzle" to play more.

Pure static site — `index.html` / `style.css` / `game.js` — no build step, no
dependencies, deployed via GitHub Pages.

## Data pipeline

`engwords.txt` (~41k English words, length 3–10) is built from
[dwyl/english-words](https://github.com/dwyl/english-words) filtered against
[hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) for
commonness, with proper nouns stripped via macOS's `/usr/share/dict/propernames`
plus a small manual `tools/data/blocklist.txt`.

`puzzles.json` (150 pre-generated chains) is built by treating every word as a
node and connecting word → word when the longer word's letters are an exact
anagram of the shorter word's letters plus one extra letter. The generator
does a randomized walk across that graph, biased toward common words, from a
3-letter start to a 10-letter end.

To regenerate:

```bash
cd tools
node build_wordlist.js   # needs tools/data/words_alpha.txt + en_50k.txt (gitignored, re-download if missing)
node build_puzzles.js
node count_paths.js      # sanity check: richness of the underlying word graph
```

Source lists (re-download if missing):

```bash
curl -sL -o tools/data/words_alpha.txt https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt
curl -sL -o tools/data/en_50k.txt https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt
```
