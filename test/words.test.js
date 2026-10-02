const test = require("node:test");
const assert = require("node:assert/strict");
const { GENRES, WORDS } = require("../data/words.js");

const REQUIRED = ["id", "term", "original", "genre", "gist", "story", "lens", "flex"];

// 有名すぎる、またはすでに知っている語。選定から外す。
const EXCLUDED = [
  "囚人のジレンマ",
  "シュレーディンガーの猫",
  "テセウスの船",
  "ウロボロス",
  "沈黙の螺旋",
  "世界の脱魔術化",
  "コンスタンティノープルの月",
];

test("どの語も必須の項目がそろっている", () => {
  for (const w of WORDS) {
    for (const key of REQUIRED) {
      assert.ok(typeof w[key] === "string" && w[key].trim() !== "", `${w.id || w.term}: ${key} が空`);
    }
    if ("reading" in w) assert.ok(w.reading.trim() !== "", `${w.id}: reading が空`);
  }
});

test("id はURLのアンカーに使える文字だけで、重複しない", () => {
  const ids = new Set();
  for (const w of WORDS) {
    assert.match(w.id, /^[a-z0-9-]+$/, w.id);
    assert.ok(!ids.has(w.id), `id が重複: ${w.id}`);
    ids.add(w.id);
  }
});

test("見出し語が重複しない", () => {
  const terms = WORDS.map((w) => w.term);
  assert.equal(new Set(terms).size, terms.length);
});

test("ジャンルは GENRES のどれかで、どのジャンルにも語がある", () => {
  for (const w of WORDS) assert.ok(GENRES.includes(w.genre), `${w.id}: 未知のジャンル ${w.genre}`);
  for (const g of GENRES) assert.ok(WORDS.some((w) => w.genre === g), `${g} の語がない`);
});

test("隣り合う日（周回の切れ目も含む）でジャンルが続かない", () => {
  for (let i = 0; i < WORDS.length; i++) {
    const a = WORDS[i];
    const b = WORDS[(i + 1) % WORDS.length];
    assert.notEqual(a.genre, b.genre, `${a.term} と ${b.term} が同じジャンル`);
  }
});

test("外すと決めた語が入っていない", () => {
  for (const w of WORDS) assert.ok(!EXCLUDED.includes(w.term), `${w.term} は選定外`);
});
