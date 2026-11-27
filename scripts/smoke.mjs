// Browser smoke test: serves the repo root on a random port and plays a round.
// Local only (needs Chromium); CI runs just check-songs.mjs.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.js': 'text/javascript' };
const server = createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  // The local override is ignored on purpose so the test sees what Pages serves.
  if (path === '/songs.local.json') { res.writeHead(404).end(); return; }
  if (path === '/') path = '/index.html';
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/`;

// CHROMIUM_PATH: use a system Chromium where Playwright's download cannot run (e.g. NixOS).
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(url);
  await page.locator('#start .go').waitFor({ state: 'visible', timeout: 5000 });
  await page.keyboard.press('Enter');
  check(await page.locator('#start').isHidden(), 'start screen did not close');

  const open = () => page.locator('#grid .card.open').count();
  for (const k of ['1', '2', '3', '4', '5']) await page.keyboard.press(k);
  check(await open() === 5, 'keys 1–5 did not open all cards');
  await page.keyboard.press('3');
  check(await open() === 4, 'key 3 did not close card 3 again');

  await page.locator('#grid .card').first().click();
  check(await open() === 3, 'clicking card 1 did not close it');

  const count = () => page.locator('#count').textContent();
  const before = await count();
  await page.keyboard.press('ArrowRight');
  check((await count()) !== before && await open() === 0, 'ArrowRight did not move to a fresh song');
  await page.keyboard.press('ArrowLeft');
  check((await count()) === before, 'ArrowLeft did not return to the first song');

  await page.keyboard.press(' ');
  check(await page.locator('#answer.revealed').count() === 1, 'Space did not reveal the answer');

  check(errors.length === 0, 'page errors: ' + errors.join('; '));
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error('smoke: FAILED\n  - ' + failures.join('\n  - '));
  process.exit(1);
}
console.log('smoke: OK');
