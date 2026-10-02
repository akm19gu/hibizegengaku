(function () {
  const { GENRES, WORDS } = window.HibiWords;
  const { indexForDate, dateForIndex, wordForIndex } = window.HibiDaily;

  const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
  const STORAGE_KEY = "hibizegengaku.known";
  const $ = (id) => document.getElementById(id);

  let todayIndex = currentTodayIndex();
  let known = loadKnown();
  let shownWordId = null;

  function currentTodayIndex() {
    // 開始日より前の端末時刻（時差など）でも第1日を出す
    return Math.max(0, indexForDate(new Date()));
  }

  function loadKnown() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveKnown() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(known));
    } catch (e) {
      // 保存できない環境でも表示はそのまま続ける
    }
  }

  function shortDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}（${WEEKDAYS[date.getDay()]}）`;
  }

  // 今の周回で、その語が何日目に出るか
  function indexOfWordInCycle(id) {
    const pos = WORDS.findIndex((w) => w.id === id);
    if (pos < 0) return -1;
    return todayIndex - (todayIndex % WORDS.length) + pos;
  }

  function parseHash() {
    const hash = location.hash;
    let m = hash.match(/^#day-(\d+)$/);
    if (m) return { mode: "day", index: Math.min(Math.max(Number(m[1]) - 1, 0), todayIndex) };
    m = hash.match(/^#w-([a-z0-9-]+)$/);
    if (m) {
      const index = indexOfWordInCycle(m[1]);
      if (index >= 0 && index <= todayIndex) return { mode: "day", index };
      if (index > todayIndex) return { mode: "preview", index };
    }
    return { mode: "day", index: todayIndex };
  }

  function setText(id, text) {
    const el = $(id);
    el.textContent = text || "";
    el.hidden = !text;
  }

  function renderSheet(view) {
    const word = wordForIndex(WORDS, view.index);
    const date = dateForIndex(view.index);
    shownWordId = word.id;

    const dateEl = $("date");
    dateEl.dataset.weekday = String(date.getDay());
    dateEl.setAttribute("aria-label", `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`);
    $("date-month").textContent = `${date.getMonth() + 1}月`;
    $("date-day").textContent = String(date.getDate());
    $("date-week").textContent = `${WEEKDAYS[date.getDay()]}曜日`;
    $("day-count").textContent = view.mode === "preview" ? `第${view.index + 1}日（予定）` : `第${view.index + 1}日`;
    // 印は一文字ずつ縦に積む（縦書き指定より環境差が出にくい）
    $("genre").textContent = [...word.genre].join("\n");
    $("genre-label").textContent = `ジャンル：${word.genre}`;

    $("term").textContent = word.term;
    setText("reading", word.reading);
    setText("original", word.original);
    $("gist").textContent = word.gist;
    $("story").textContent = word.story;
    $("lens").textContent = word.lens;
    $("flex").textContent = word.flex;

    renderKnownButtons();

    const sheet = $("sheet");
    sheet.classList.remove("turning");
    void sheet.offsetWidth;
    sheet.classList.add("turning");
  }

  function renderKnownButtons() {
    const state = known[shownWordId];
    for (const btn of [$("known-yes"), $("known-no")]) {
      btn.setAttribute("aria-pressed", String(btn.dataset.known === state));
    }
  }

  function renderPager(view) {
    const isPreview = view.mode === "preview";
    $("prev").hidden = isPreview;
    $("next").hidden = isPreview;
    $("prev").disabled = view.index <= 0;
    $("next").disabled = view.index >= todayIndex;
    $("today").disabled = !isPreview && view.index === todayIndex;
    $("today").textContent = isPreview ? "今日の語に戻る" : "今日";
  }

  function tagFor(id) {
    if (known[id] === "known") return { text: "知ってた", cls: "is-known" };
    if (known[id] === "new") return { text: "知らなかった", cls: "is-new" };
    return null;
  }

  function makeRow({ href, date, term, gist, tag, current }) {
    const li = document.createElement("li");
    const a = document.createElement("button");
    a.type = "button";
    a.className = "row";
    a.dataset.href = href;
    if (current) a.setAttribute("aria-current", "true");

    if (date) {
      const d = document.createElement("span");
      d.className = "row-date";
      d.textContent = date;
      a.append(d);
    }
    const t = document.createElement("span");
    t.className = "row-term";
    t.textContent = term;
    if (gist) {
      const g = document.createElement("span");
      g.className = "row-gist";
      g.textContent = gist;
      t.append(g);
    }
    a.append(t);
    const tg = document.createElement("span");
    tg.className = "row-tag" + (tag && tag.cls ? " " + tag.cls : "");
    tg.textContent = tag ? tag.text : "";
    a.append(tg);
    li.append(a);
    return li;
  }

  function renderArchive(view) {
    const list = $("archive-list");
    list.replaceChildren();
    let k = 0;
    let u = 0;
    for (let i = todayIndex; i >= 0; i--) {
      const word = wordForIndex(WORDS, i);
      if (known[word.id] === "known") k++;
      if (known[word.id] === "new") u++;
      list.append(
        makeRow({
          href: `#day-${i + 1}`,
          date: shortDate(dateForIndex(i)),
          term: word.term,
          tag: tagFor(word.id),
          current: view.mode === "day" && view.index === i,
        })
      );
    }
    const days = todayIndex + 1;
    const marks = k + u > 0 ? `　知ってた ${k}・知らなかった ${u}` : "";
    $("archive-note").textContent = `${days}語${marks}`;
  }

  function renderCatalog() {
    const wrap = $("catalog-groups");
    wrap.replaceChildren();
    $("catalog-note").textContent = `${WORDS.length}語・これから出る語も見える`;
    for (const genre of GENRES) {
      const words = WORDS.filter((w) => w.genre === genre);
      const h = document.createElement("h3");
      h.className = "catalog-genre";
      h.textContent = `${genre}　${words.length}`;
      const ol = document.createElement("ol");
      ol.className = "catalog-list";
      for (const word of words) {
        const index = indexOfWordInCycle(word.id);
        const tag = tagFor(word.id) || {
          text: index > todayIndex ? `${shortDate(dateForIndex(index))}に登場` : "",
          cls: "",
        };
        ol.append(
          makeRow({
            href: `#w-${word.id}`,
            term: word.term,
            gist: word.gist,
            tag,
            current: word.id === shownWordId,
          })
        );
      }
      wrap.append(h, ol);
    }
  }

  function render() {
    const view = parseHash();
    renderSheet(view);
    renderPager(view);
    renderArchive(view);
    renderCatalog();
  }

  function go(hash, scroll) {
    if (location.hash === hash) render();
    else location.hash = hash;
    if (scroll) {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      $("sheet").scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
    }
  }

  $("prev").addEventListener("click", () => go(`#day-${parseHash().index}`));
  $("next").addEventListener("click", () => go(`#day-${parseHash().index + 2}`));
  $("today").addEventListener("click", () => go("#today"));

  for (const btn of [$("known-yes"), $("known-no")]) {
    btn.addEventListener("click", () => {
      const value = btn.dataset.known;
      if (known[shownWordId] === value) delete known[shownWordId];
      else known[shownWordId] = value;
      saveKnown();
      renderKnownButtons();
      renderArchive(parseHash());
      renderCatalog();
    });
  }

  for (const id of ["archive-list", "catalog-groups"]) {
    $(id).addEventListener("click", (event) => {
      const row = event.target.closest(".row");
      if (row) go(row.dataset.href, true);
    });
  }

  window.addEventListener("hashchange", render);

  // 開きっぱなしで日付をまたいだら、今日の語に追いつく
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    const next = currentTodayIndex();
    if (next !== todayIndex) {
      todayIndex = next;
      render();
    }
  });

  render();
})();
