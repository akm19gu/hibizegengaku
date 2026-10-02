// 日本語を文節で区切り、単語の途中で改行されないようにする。
// 区切り目に <wbr> を入れ、CSS の word-break: keep-all と .ph（文節を一行に保つ）と組み合わせて使う。
(function (root) {
  const budoux = typeof module === "object" && module.exports ? require("./vendor/budoux-ja.js") : root.BudouXJa;

  // 見出し語は細かく割りすぎない（「結び｜目」のような割れを防ぐ）。
  // 「・」「＝」「／」の直後と、助詞「の」「と」「は」「を」で終わる文節の後だけで折り返す。
  const BREAK_AFTER_MARK = "・＝／";
  const BREAK_AFTER_PARTICLE = "のとはを";

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

  // BudouX が単語の途中で区切ってしまう語。この語の内側では折り返さない。
  // 言葉を足したら npm test（test/breaks.test.js）が形態素解析で新しいものを見つけるので、ここに足していく
  const KEEP_TOGETHER = [
    "どこ", "落とさ", "買い替え", "なおさら", "よみがえる", "空白", "よみがえら", "分類", "向かお", "手がかり",
    "とたん", "絵の具", "油絵の具", "浮かび上がっ", "そのもの", "明るみ", "張り替え", "当てはまる", "建て増し", "夜空",
    "当たり前", "切り取っ", "いつの間にか", "成り立っ", "持ち歩き", "この世", "世の中", "明るい", "間違える", "跳ね上がり",
    "その後", "落とし", "はまっ", "雪だるま", "浮かび上がら", "一人ひとり", "間違え", "尽くそ", "見落とす", "ゆがめ",
    "男の子", "振る舞う", "わが家", "成り立つ", "いつのまにか", "すり替え", "関東大震災", "建て直さ", "借り入れ", "生き残っ",
    "言い伝え", "分野", "振り返っ", "繰り広げ", "食い違い", "でたらめ", "もっとも", "たどれ", "逃がす", "燃え尽き",
    "はかな", "寝そべり", "追い払う", "迷い込ん", "取り逃がし", "売り上げ", "振る舞い", "建て替え", "食い違う", "ただ中",
    "とどまる", "はびこり", "味わい深い", "追い求める", "ゆるみ", "込み入っ", "はみ出し", "さかのぼり", "振る舞っ", "食いつぶさ",
    "ゆがめる", "はやっ", "もう一度", "言い争い", "まるごと", "もしかして", "打ちのめさ", "木の葉", "にくい", "言い換える",
    "入り組ん", "にくく", "取り調べる", "取り調べ",
  ];

  function textPhrases(text) {
    if (!text) return [];
    const blocked = new Set();
    for (const word of KEEP_TOGETHER) {
      for (let i = text.indexOf(word); i !== -1; i = text.indexOf(word, i + 1)) {
        for (let j = i + 1; j < i + word.length; j++) blocked.add(j);
      }
    }
    return cut(text, budoux.parseBoundaries(text).filter((b) => !blocked.has(b)));
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
    KEEP_TOGETHER,
    textPhrases,
    termPhrases,
    pieces,
    setText: (el, text) => fill(el, textPhrases(text || "")),
    setTerm: (el, term) => fill(el, termPhrases(term || "")),
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.HibiPhrase = api;
})(typeof self !== "undefined" ? self : this);
