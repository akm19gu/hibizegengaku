const test = require("node:test");
const assert = require("node:assert/strict");
const { WORDS } = require("../data/words.js");
const { WORDS: EN } = require("../data/words.en.js");

const REQUIRED = ["term", "gist", "story", "lens", "flex"];
const CJK = /[぀-ヿ㐀-鿿]/;

test("英語版：どの語も日本語版にある id で、必須の項目がそろっている", () => {
  for (const [id, w] of Object.entries(EN)) {
    assert.ok(WORDS.some((j) => j.id === id), `日本語版にない id: ${id}`);
    for (const key of REQUIRED) assert.ok(typeof w[key] === "string" && w[key].trim() !== "", `${id}: ${key} が空`);
  }
});

test("英語版：出題順の先頭から、途中を飛ばさずに埋まっている", () => {
  const n = Object.keys(EN).length;
  const head = WORDS.slice(0, n).map((w) => w.id);
  assert.deepEqual(Object.keys(EN), head);
});

test("英語版：見出しに日本語の文字を使わず、重複もしない", () => {
  const terms = Object.values(EN).map((w) => w.term);
  for (const t of terms) assert.ok(!CJK.test(t), `見出しに日本語: ${t}`);
  assert.equal(new Set(terms).size, terms.length);
});

test("英語版：本文は英語で書き、かっこで囲まない（画面で付ける）", () => {
  for (const [id, w] of Object.entries(EN)) {
    for (const key of ["gist", "flex"]) assert.ok(!CJK.test(w[key]), `${id}.${key} に日本語`);
    assert.ok(!/^[“"]/.test(w.flex), `${id}.flex が引用符で始まる`);
  }
});
