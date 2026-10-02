// 文節の区切りが単語の途中に入っていないかを、形態素解析（kuromoji）で確かめる。
// kuromoji は開発用の依存なので、npm install していない環境ではこのテストは飛ばす。
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { textPhrases } = require("../js/phrase.js");
const { WORDS } = require("../data/words.js");

// 助詞の後で切れるのは自然なので、これらの語の内側での区切りは許す
const ALLOWED = [
  "という", "っていう", "といった", "について", "によって", "による", "として", "に対し", "に対して",
  "に対する", "につれて", "にあたる", "にとって", "において", "をめぐって", "を通じて", "に際し",
  "役に立た", "役に立つ",
];
const JAPANESE = /^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー々]+$/u;

let kuromoji = null;
try {
  kuromoji = require("kuromoji");
} catch (e) {
  kuromoji = null;
}

test("文節の区切りが単語の途中に入っていない", { skip: !kuromoji && "kuromoji が未インストール（npm install で入る）" }, async () => {
  const dicPath = path.join(path.dirname(require.resolve("kuromoji/package.json")), "dict");
  const tokenizer = await new Promise((resolve, reject) =>
    kuromoji.builder({ dicPath }).build((err, t) => (err ? reject(err) : resolve(t)))
  );
  const problems = [];
  for (const w of WORDS) {
    for (const key of ["gist", "story", "lens", "flex"]) {
      const text = w[key];
      const inside = new Map();
      let pos = 0;
      for (const t of tokenizer.tokenize(text)) {
        const len = t.surface_form.length;
        if (JAPANESE.test(t.surface_form) && !ALLOWED.includes(t.surface_form)) {
          for (let i = pos + 1; i < pos + len; i++) inside.set(i, t.surface_form);
        }
        pos += len;
      }
      let b = 0;
      for (const p of textPhrases(text).slice(0, -1)) {
        b += p.length;
        if (inside.has(b)) problems.push(`${w.id}.${key}: 「${inside.get(b)}」（…${text.slice(Math.max(0, b - 6), b)}｜${text.slice(b, b + 6)}…）`);
      }
    }
  }
  assert.deepEqual(problems, [], "js/phrase.js の KEEP_TOGETHER に足す語:\n" + problems.join("\n"));
});
