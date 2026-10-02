// 日付と「第何日」「その日の語」の対応。ブラウザでも Node（テスト）でも読める。
(function (root) {
  const MS_PER_DAY = 86400000;
  // 第1日。この日から一日一語ずつ進む。
  const START = { year: 2026, month: 10, day: 2 };

  // タイムゾーンや夏時間の影響を受けない通し日数
  function serial(year, month, day) {
    return Math.round(Date.UTC(year, month - 1, day) / MS_PER_DAY);
  }
  const START_SERIAL = serial(START.year, START.month, START.day);

  // 端末のローカル日付を 0 始まりの通し番号に（第1日 = 0）
  function indexForDate(date) {
    return serial(date.getFullYear(), date.getMonth() + 1, date.getDate()) - START_SERIAL;
  }

  function dateForIndex(index) {
    const utc = new Date((START_SERIAL + index) * MS_PER_DAY);
    return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
  }

  // 語が尽きたら先頭に戻る
  function wordForIndex(words, index) {
    const n = words.length;
    return words[((index % n) + n) % n];
  }

  const api = { START, indexForDate, dateForIndex, wordForIndex };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.HibiDaily = api;
})(typeof self !== "undefined" ? self : this);
