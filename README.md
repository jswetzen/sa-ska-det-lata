# Så ska det låta – Julspecial

A Christmas party game in the spirit of the Swedish TV show *Så ska det låta*. Each round shows
five face-down cards, and each card hides one word of a line from a Christmas song. Teams open
cards one at a time and try to name the song. Two of the five cards are red: open one of those
and the question passes to the other team (with a sad trombone "wuh-WOMP"). It is one static
page, made for a laptop on a TV in fullscreen and driven from the keyboard.

The interface text is in Swedish.

**Play it:** <https://jswetzen.github.io/sa-ska-det-lata/>

## Controls

| Key | Action |
| --- | --- |
| <kbd>1</kbd>–<kbd>5</kbd> or click a card | Open or close that card |
| <kbd>→</kbd> / <kbd>←</kbd> (also <kbd>↓</kbd>/<kbd>↑</kbd>, <kbd>PgDn</kbd>/<kbd>PgUp</kbd>) | Next / previous song |
| <kbd>Space</kbd> or <kbd>Enter</kbd>, or click the answer bar | Show or hide the answer |
| <kbd>A</kbd> | Open all cards |
| <kbd>R</kbd> | Close all cards and hide the answer |
| <kbd>M</kbd> | Mark the red cards with a dot (for the host) |
| <kbd>S</kbd> | Shuffle the song order |
| <kbd>F</kbd> | Toggle fullscreen |
| <kbd>E</kbd> | Open the song editor (also a button on the start screen) |

The key hints along the bottom are also buttons, for touch screens.

## Run locally

The page loads `songs.json` with `fetch()`, so it must be served over HTTP; opening
`index.html` straight from disk shows an explanation instead of the game.

```sh
python3 -m http.server
```

Then open <http://localhost:8000>. Any static file server works.

## Adding or editing songs

### In the browser

Press <kbd>E</kbd>, or click **Redigera låtar** on the start screen, to open the song editor. In it
you can:

- **Add or change a song:** type the title and language, paste a line from the song, and click
  the word where the five cards should start. You can also type the five words directly. Click
  **Röd** on two cards, or tick **Slumpa de röda luckorna** to pick them at random each time.
- **Reorder, delete, or play a song** straight from the list.
- **Upload a JSON file** in the format below, either replacing the list or adding to it.
- **Download** the current list as `songs.json`.
- **Reset** to the default list.

Changes are saved in the browser's localStorage and are used in place of `songs.json` in that
browser only. Nothing is uploaded anywhere. To publish a list, download it and commit it as
`songs.json`. The editor also works when `index.html` is opened straight from disk.

The page picks its song list in this order: the editor's saved list, then `songs.local.json`,
then `songs.json`.

### The songs.json format

The published song list is [`songs.json`](songs.json), a JSON array with one object per song:

```json
{
  "title": "Jingle Bells",
  "lang": "engelska",
  "words": ["In", "a", "one-horse", "open", "sleigh"],
  "red": [0, 4]
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | yes | The answer, shown when the answer is revealed. |
| `lang` | no | Shown as a hint under the question, e.g. `"svenska"` or `"engelska"`. |
| `words` | yes | Exactly 5 non-empty strings, one per card, in card order. |
| `red` | no | Exactly 2 distinct card indices from 0 to 4 (card 1 is index 0). Left out, two cards are picked at random each time the page loads. |

Invalid entries are skipped with a warning in the browser console. Check the file before you
push:

```sh
bun run test        # or: npm test, or: node scripts/check-songs.mjs
```

An optional browser smoke test plays one round in headless Chromium:

```sh
bun install && bun run smoke
```

It needs Playwright's Chromium (`bunx playwright install chromium`). Where that build cannot
run, as on NixOS, point it at a system Chromium with `CHROMIUM_PATH=$(command -v chromium)`.

### Copyright

**Only commit songs whose lyrics are in the public domain.** This repository and its GitHub Pages
site are public, and song lyrics are copyrighted for 70 years after the lyricist's death in
Sweden and the EU. Modern songs, including most Swedish Christmas favourites, are not free to
publish here, even as a short quoted line. The songs
shipped here are traditional carols and Alfred Smedberg's *Tomtarnas julnatt* (1898).

For a private game with any songs you like, add them in the editor, which keeps them in your
browser. Alternatively, put them in `songs.local.json` next to `index.html` (same format). The
page uses that file instead of `songs.json` when it exists, and `.gitignore` keeps it out of
the repository. Do not deploy a copy of the site that contains it.

## Deploy your own copy

1. Fork or copy this repository.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/pages.yml` validates `songs.json` and
   publishes the site to `https://<user>.github.io/<repo>/`.

Pull requests run the same check without deploying.

## License

[MIT](LICENSE).
