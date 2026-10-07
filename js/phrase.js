// 日本語を文節で区切り、単語の途中で改行されないようにする。
// 区切り目に <wbr> を入れ、CSS の word-break: keep-all と .ph（文節を一行に保つ）と組み合わせて使う。
(function (root) {
  const budoux = typeof module === "object" && module.exports ? require("./vendor/budoux-ja.js") : root.BudouXJa;

  // 見出し語は細かく割りすぎない（「結び｜目」のような割れを防ぐ）。
  // 「・」「＝」「／」の直後と、助詞「の」「と」「は」「を」「も」で終わる文節の後だけで折り返す。
  const BREAK_AFTER_MARK = "・＝／";
  const BREAK_AFTER_PARTICLE = "のとはをも";

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
    "入り組ん", "にくく", "取り調べる", "取り調べ", "切り抜き", "燃え上がる", "送り込ん", "散り散り", "立てこもっ", "笑い話",
    "追い詰め", "乗り切っ", "移り住ん", "ゆるやか", "みなし", "一喜一憂", "生き延び", "二の舞", "のぼっ", "切り替え",
    "逃がさ", "思うつぼ", "削り取っ", "にかけて", "いくつ", "笑顔", "にこにこ", "ふるまい", "がち", "中西部",
    "結びつい", "はげ", "ありあわせ", "歯みがき", "わたし", "とどめ", "言い当て", "盛り上がる", "か所", "開き直っ",
    "手いっぱい", "ひっくり返っ", "売り買い", "にぎやか", "間違い", "見た目", "割り込ん", "当てはめ", "振る舞わ", "前向き",
    "はず", "言い張っ", "とどまっ", "笑い", "はっきり", "一つひとつ", "だからといって", "うたい文句", "ある程度", "がたい",
    "こうした", "捨て去ら", "乗り越え", "はしご", "言い争っ", "食い違っ", "渡り歩き", "ありとあらゆる", "じゅうたん", "どおり",
    "手がけ", "部分", "願い出", "みなさ", "笑い飛ばせる", "奮い立た", "血なまぐさい", "遠のい", "ぐにゃっと", "日の出",
    "移り変わら", "笑み", "真上", "吸い込ま", "独り占め", "吸い込ん", "にくかっ", "まがい", "持ち去っ", "とまっ",
    "もどかし", "割り切れ", "割り振り", "わがまま", "手のひら", "悔い改め", "追い出し", "作り話", "あばら骨", "とてつもなく",
    "すり減っ", "張り巡らさ", "ずつ", "なす", "言い張れ", "手放す", "しがみつい", "移り変わり", "ろうそく", "思い上がり",
    "三途の川", "もう少し", "騒がせ", "たぶん", "しのぎ", "かえって", "間違っ", "やる気", "塗り替える", "入り込ん",
    "のぞい", "転がす", "空気", "中の島", "なでつけ", "へこみ", "そもそも", "製紙", "と共に", "とびきり",
    "か月", "さかのぼる", "もてはやさ", "間に合わ", "とてつもない", "あいさつ", "しなやか", "ぬるぬる", "立て直す", "いろは歌",
    "切り貼り", "育て上げる", "吸い取っ", "吸い取ら", "切り刻ん", "くどく", "言い換え", "しょうこう", "しょうもう", "しゅつ",
    "勝ち残っ", "なぞなぞ", "なごり", "我が家", "ごちゃごちゃ", "当てはまら", "取り払っ", "損なわ", "に従う", "にわたり",
    "取りとめ", "変わり果て", "なくし", "鉄の肺", "ぴくつきを", "言い逃れ", "転がし", "仲間外れ", "吊り上がり", "買い手",
    "揺るがす", "競り勝っ", "身の回り", "年のうち", "上空", "持ち運び", "ふるまう",
  ];

  // KEEP_TOGETHER の語の内側にあたる位置
  function blockedPositions(text) {
    const blocked = new Set();
    for (const word of KEEP_TOGETHER) {
      for (let i = text.indexOf(word); i !== -1; i = text.indexOf(word, i + 1)) {
        for (let j = i + 1; j < i + word.length; j++) blocked.add(j);
      }
    }
    return blocked;
  }

  function textPhrases(text) {
    if (!text) return [];
    const blocked = blockedPositions(text);
    return cut(text, budoux.parseBoundaries(text).filter((b) => !blocked.has(b)));
  }

  function termPhrases(term) {
    const blocked = blockedPositions(term);
    const boundaries = budoux
      .parseBoundaries(term)
      .filter((i) => BREAK_AFTER_PARTICLE.includes(term[i - 1]) && !blocked.has(i));
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
