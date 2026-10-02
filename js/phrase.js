// 日本語を文節で区切り、単語の途中で改行されないようにする。
// 区切り目に <wbr> を入れ、CSS の word-break: keep-all と .ph（文節を一行に保つ）と組み合わせて使う。
(function (root) {
  const budoux = typeof module === "object" && module.exports ? require("./vendor/budoux-ja.js") : root.BudouXJa;

  // 見出し語は細かく割りすぎない（「結び｜目」のような割れを防ぐ）。
  // 「・」「＝」「／」の直後と、助詞「の」「と」で終わる文節の後だけで折り返す。
  const BREAK_AFTER_MARK = "・＝／";
  const BREAK_AFTER_PARTICLE = "のと";

  function cut(text, boundaries) {
    const result = [];
    let start = 0;
    for (const b of [...new Set(boundaries)].sort((x, y) => x - y)) {
      if (b <= start || b >= text.length) continue;
      result.push(text.slice(start, b));
      start = b;
    }
    result.push(text.slice(start));
    return result;
  }

  function textPhrases(text) {
    return budoux.parse(text);
  }

  function termPhrases(term) {
    const boundaries = budoux.parseBoundaries(term).filter((i) => BREAK_AFTER_PARTICLE.includes(term[i - 1]));
    for (let i = 1; i < term.length; i++) {
      if (BREAK_AFTER_MARK.includes(term[i - 1])) boundaries.push(i);
    }
    return cut(term, boundaries);
  }

  // 15文字までのかたまりは途中で折り返さない（幅360px以上の画面なら一行に収まる長さ）。
  // それより長い文節は「・」「、」「＝」や空白の後で小分けにして、そこでだけ折り返す。
  // 13文字以上のかたまりには ph-long を付け、さらに狭い画面では CSS で折り返しを許す
  const KEEP_WHOLE = 15;
  const LONG = 12;
  const SOFT_BREAK_AFTER = "・、，＝ ";

  const KATAKANA = /[\u30A0-\u30FF]/;
  const KANJI = /[\u4E00-\u9FFF\u3005]/;

  function pieces(phrase) {
    if (phrase.length <= KEEP_WHOLE) return [phrase];
    const result = [];
    let start = 0;
    for (let i = 1; i < phrase.length; i++) {
      if (SOFT_BREAK_AFTER.includes(phrase[i - 1])) {
        result.push(phrase.slice(start, i));
        start = i;
      }
    }
    result.push(phrase.slice(start));
    // それでも長いかたまりは、カタカナ語の後に二字以上の漢語が続く切れ目（「カリフォルニア｜大学」）でも分ける。
    // 「バークレー校」の「校」のような一字の接尾語の前では分けない
    return result.flatMap((piece) => {
      if (piece.length <= KEEP_WHOLE) return [piece];
      const parts = [];
      let from = 0;
      for (let i = 1; i < piece.length; i++) {
        if (KATAKANA.test(piece[i - 1]) && KANJI.test(piece[i]) && KANJI.test(piece[i + 1] || "")) {
          parts.push(piece.slice(from, i));
          from = i;
        }
      }
      parts.push(piece.slice(from));
      return parts;
    });
  }

  function fill(el, phrases) {
    el.replaceChildren();
    let first = true;
    for (const phrase of phrases) {
      for (const piece of pieces(phrase)) {
        if (!first) el.append(document.createElement("wbr"));
        first = false;
        if (piece.length <= KEEP_WHOLE) {
          const span = document.createElement("span");
          span.className = piece.length > LONG ? "ph ph-long" : "ph";
          span.textContent = piece;
          el.append(span);
        } else {
          el.append(piece);
        }
      }
    }
  }

  const api = {
    textPhrases,
    termPhrases,
    pieces,
    setText: (el, text) => fill(el, textPhrases(text || "")),
    setTerm: (el, term) => fill(el, termPhrases(term || "")),
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.HibiPhrase = api;
})(typeof self !== "undefined" ? self : this);
