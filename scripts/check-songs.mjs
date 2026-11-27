#!/usr/bin/env node
// Validates songs.json (or the files given as arguments) against the schema in README.md.
// Same rules as songProblem() in index.html; keep the two in step. No dependencies.
import { readFileSync } from 'node:fs';

function songProblem(s) {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return 'not an object';
  if (typeof s.title !== 'string' || !s.title.trim()) return 'missing or empty "title"';
  if (s.lang !== undefined && typeof s.lang !== 'string') return '"lang" must be a string';
  if (!Array.isArray(s.words) || s.words.length !== 5) return '"words" must be exactly 5 strings';
  if (s.words.some(w => typeof w !== 'string' || !w.trim())) return '"words" must be non-empty strings';
  if (s.red === undefined) return '';
  if (!Array.isArray(s.red) || s.red.length !== 2) return '"red" must be exactly 2 indices';
  if (s.red.some(r => !Number.isInteger(r) || r < 0 || r > 4)) return '"red" indices must be integers 0–4';
  if (s.red[0] === s.red[1]) return '"red" indices must be distinct';
  return '';
}

const files = process.argv.length > 2 ? process.argv.slice(2) : ['songs.json'];
let failed = false;

for (const file of files) {
  let data;
  try {
    data = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`${file}: ${e.code === 'ENOENT' ? 'not found' : 'invalid JSON: ' + e.message}`);
    failed = true;
    continue;
  }
  if (!Array.isArray(data)) {
    console.error(`${file}: top level must be a JSON array of songs`);
    failed = true;
    continue;
  }
  const problems = [];
  const titles = new Map();
  data.forEach((s, i) => {
    const where = `song #${i + 1}${s && typeof s.title === 'string' ? ` "${s.title}"` : ''}`;
    const p = songProblem(s);
    if (p) problems.push(`${where}: ${p}`);
    if (s && typeof s.title === 'string') {
      const key = s.title.trim().toLowerCase();
      if (titles.has(key)) problems.push(`${where}: duplicate title (also song #${titles.get(key)})`);
      else titles.set(key, i + 1);
    }
  });
  if (!data.length) problems.push('no songs');
  if (problems.length) {
    failed = true;
    console.error(`${file}: ${problems.length} problem(s)`);
    for (const p of problems) console.error(`  - ${p}`);
  } else {
    console.log(`${file}: ${data.length} songs OK`);
  }
}

process.exit(failed ? 1 : 0);
