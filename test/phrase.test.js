const test = require("node:test");
const assert = require("node:assert/strict");
const { textPhrases, termPhrases, pieces } = require("../js/phrase.js");
const { WORDS } = require("../data/words.js");

test("区切っても文字は欠けも増えもしない", () => {
  for (const w of WORDS) {
    assert.equal(termPhrases(w.term).join(""), w.term);
    for (const key of ["gist", "story", "lens", "flex"]) assert.equal(textPhrases(w[key]).join(""), w[key]);
  }
});

test("見出し語は記号の後と助詞「の」「と」の後だけで折り返す", () => {
  assert.deepEqual(termPhrases("バーダー＝マインホフ現象"), ["バーダー＝", "マインホフ現象"]);
  assert.deepEqual(termPhrases("ゴルディアスの結び目"), ["ゴルディアスの", "結び目"]);
  assert.deepEqual(termPhrases("信頼できない語り手"), ["信頼できない語り手"]);
  assert.deepEqual(termPhrases("モット・アンド・ベイリー論法"), ["モット・", "アンド・", "ベイリー論法"]);
});

test("見出し語の折り返せない一続きは11文字まで（幅320pxの画面でも一行に収まる）", () => {
  for (const w of WORDS) {
    const longest = Math.max(...termPhrases(w.term).map((p) => p.length));
    assert.ok(longest <= 11, `${w.term}: ${longest}文字`);
  }
});

test("本文は文節に区切られる", () => {
  assert.deepEqual(textPhrases("今日もう二回もニュースに出てきた。"), ["今日もう", "二回も", "ニュースに", "出てきた。"]);
});

test("長い文節は「・」「、」「＝」や空白の後と、カタカナ語の後に二字以上の漢語が続く切れ目でだけ小分けにする", () => {
  assert.deepEqual(pieces("ゲシュタルト心理学者ヴォルフガング・ケーラーが"), ["ゲシュタルト", "心理学者ヴォルフガング・", "ケーラーが"]);
  assert.deepEqual(pieces("名前が"), ["名前が"]);
  assert.deepEqual(pieces("カリフォルニア大学バークレー校の"), ["カリフォルニア", "大学バークレー校の"]);
  for (const w of WORDS) {
    for (const key of ["gist", "story", "lens", "flex"]) {
      const text = w[key];
      assert.equal(textPhrases(text).flatMap(pieces).join(""), text);
    }
  }
});
