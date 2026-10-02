const test = require("node:test");
const assert = require("node:assert/strict");
const { START, indexForDate, dateForIndex, wordForIndex } = require("../js/daily.js");

test("開始日が第1日（index 0）になる", () => {
  assert.equal(indexForDate(new Date(START.year, START.month - 1, START.day)), 0);
  assert.equal(indexForDate(new Date(START.year, START.month - 1, START.day, 23, 59)), 0);
  assert.equal(indexForDate(new Date(START.year, START.month - 1, START.day + 1, 0, 0)), 1);
});

test("月や年をまたいでも一日ずつ進む", () => {
  const a = indexForDate(new Date(2026, 11, 31));
  const b = indexForDate(new Date(2027, 0, 1));
  assert.equal(b - a, 1);
  assert.equal(indexForDate(new Date(2027, 2, 1)) - indexForDate(new Date(2027, 1, 28)), 1);
});

test("dateForIndex は indexForDate の逆になる", () => {
  for (const i of [0, 1, 30, 95, 366, 1000]) {
    assert.equal(indexForDate(dateForIndex(i)), i);
  }
});

test("語が尽きたら先頭に戻る", () => {
  const words = ["a", "b", "c"];
  assert.equal(wordForIndex(words, 0), "a");
  assert.equal(wordForIndex(words, 2), "c");
  assert.equal(wordForIndex(words, 3), "a");
  assert.equal(wordForIndex(words, -1), "c");
});
