(function () {
  const { GENRES, WORDS: JA_WORDS } = window.HibiWords;
  const { indexForDate, dateForIndex, wordForIndex } = window.HibiDaily;
  const { setText, setTerm } = window.HibiPhrase;

  // 英語版（en/index.html）は <html lang="en"> で、data/words.en.js の英語の本文を同じ id で重ねる。
  // 出題順と日付は日本語版と同じ。英語がまだない語は missing にして一覧には出さない。
  const LANG = document.documentElement.lang === "en" ? "en" : "ja";
  const EN = LANG === "en" ? (window.HibiWordsEn && window.HibiWordsEn.WORDS) || {} : null;
  const WORDS = EN
    ? JA_WORDS.map((w) => (EN[w.id] ? { ...EN[w.id], id: w.id, genre: w.genre } : { id: w.id, genre: w.genre, missing: true }))
    : JA_WORDS;
  const ready = (w) => !w.missing;
  const GENRE_EN = {
    "歴史": "History",
    "社会": "Society",
    "心理": "Psychology",
    "哲学・思考": "Philosophy",
    "文学": "Literature",
    "芸術": "Art & Film",
    "宗教・神話": "Religion & Myth",
    "科学": "Science",
    "数理・情報": "Math & Computing",
    "言葉": "Language",
    "建築・都市": "Architecture & Cities",
    "医学・からだ": "Medicine & Body",
    "政治・法": "Politics & Law",
    "経済・お金": "Economics & Money",
    "音楽": "Music",
    "食": "Food",
    "地理・地球": "Geography & Earth",
    "生き物": "Living Things",
    "宇宙": "Space",
    "技術・発明": "Technology",
  };
  const genreName = (g) => (EN ? GENRE_EN[g] || g : g);
  // 英語は文節の処理をせず、そのまま入れる
  const put = EN ? (el, text) => { el.textContent = text; } : setText;
  const putTerm = EN ? (el, text) => { el.textContent = text; } : setTerm;

  const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
  const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // 保存場所の名前は旧名のまま（変えると「知ってた」の記録が読めなくなる）
  const KNOWN_KEY = "hibizegengaku.known";
  const TIP_KEY = "hibizegengaku.installTipClosed";
  const LANG_KEY = "nichinichikoregengaku.lang";
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // claude.ai のプレビューなど、別のページに埋め込まれて表示されているか
  const embedded = window.self !== window.top;
  const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  let todayIndex = currentTodayIndex();
  let known = load(KNOWN_KEY, {});
  let shownWordId = null;
  let shownDayIndex = null;
  let genreFilter = null;
  let openedFromList = false;
  let currentView = null;
  const savedScroll = {};
  let installPrompt = null;

  function currentTodayIndex() {
    // 開始日より前の端末時刻（時差など）でも第1日を出す
    return Math.max(0, indexForDate(new Date()));
  }

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // 保存できない環境でも表示はそのまま続ける
    }
  }

  const longDate = (d) =>
    EN
      ? `${WEEKDAYS_EN[d.getDay()]}, ${MONTHS_EN[d.getMonth()]} ${d.getDate()}`
      : `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS[d.getDay()]}）`;
  const shortDate = (d) =>
    EN ? `${MONTHS_EN[d.getMonth()]} ${d.getDate()}` : `${d.getMonth() + 1}/${d.getDate()}（${WEEKDAYS[d.getDay()]}）`;

  // 今の周回で、その語が何日目に出るか
  function indexInCycle(id) {
    const pos = WORDS.findIndex((w) => w.id === id);
    return todayIndex - (todayIndex % WORDS.length) + pos;
  }

  function parseRoute() {
    const hash = location.hash;
    if (hash === "#history") return { view: "history" };
    if (hash === "#words") return { view: "words" };
    let m = hash.match(/^#day-(\d+)$/);
    if (m) return { view: "day", index: Math.min(Math.max(Number(m[1]) - 1, 0), todayIndex) };
    m = hash.match(/^#w-([a-z0-9-]+)$/);
    if (m && WORDS.some((w) => w.id === m[1] && ready(w))) return { view: "word", id: m[1] };
    return { view: "day", index: todayIndex };
  }

  function navigate(hash, replace) {
    if (replace) {
      history.replaceState(null, "", hash);
      render();
    } else if (location.hash === hash) {
      render();
    } else {
      location.hash = hash;
    }
  }

  // ---- カード ----

  function fitTerm() {
    const el = $("term");
    if (!el.offsetWidth) return;
    el.style.fontSize = "";
    el.classList.remove("squeezed");
    let size = parseFloat(getComputedStyle(el).fontSize);
    // 一番長い文節が一行に収まるまで少しずつ小さくする
    while (el.scrollWidth > el.clientWidth + 1 && size > 18) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }
    if (el.scrollWidth > el.clientWidth + 1) el.classList.add("squeezed");
  }

  function renderCard(word, direction) {
    shownWordId = word.id;
    // ジャンルの印は一文字ずつ縦に積み、「・」で区切られた名前は判子のように右から左へ二列に並べる
    $("genre").replaceChildren(
      ...word.genre.split("・").map((part) => {
        const col = document.createElement("span");
        col.className = "seal-col";
        col.textContent = [...part].join("\n");
        return col;
      })
    );
    $("genre-label").textContent = EN ? `Category: ${genreName(word.genre)}` : `ジャンル：${word.genre}`;
    if (EN) $("genre-name").textContent = genreName(word.genre);
    if (word.missing) {
      // 英語の本文がまだない日
      $("term").textContent = "Coming soon";
      for (const id of ["reading", "original"]) $(id).hidden = true;
      $("gist").textContent = "This word hasn’t been translated yet. Check back soon.";
      for (const id of ["story", "lens", "flex"]) $(id).textContent = "";
      renderKnown();
      return;
    }
    putTerm($("term"), word.term);
    $("reading").textContent = word.reading || "";
    $("reading").hidden = !word.reading;
    $("original").textContent = word.original || "";
    $("original").hidden = !word.original;
    put($("gist"), word.gist);
    put($("story"), word.story);
    put($("lens"), word.lens);
    // かっこで囲むので、閉じかっこの直前の句点は省く
    put($("flex"), EN ? `“${word.flex}”` : `「${word.flex.replace(/。$/, "")}」`);
    renderKnown();
    fitTerm();

    const card = $("card");
    card.classList.remove("slide-next", "slide-prev");
    if (direction && !reduceMotion.matches) {
      void card.offsetWidth;
      card.classList.add(direction > 0 ? "slide-next" : "slide-prev");
    }
  }

  function renderKnown() {
    for (const btn of document.querySelectorAll(".known-btn")) {
      btn.setAttribute("aria-pressed", String(known[shownWordId] === btn.dataset.known));
    }
  }

  function renderDay(index, fromOtherView) {
    const direction = fromOtherView || shownDayIndex === null ? 0 : Math.sign(index - shownDayIndex);
    shownDayIndex = index;
    $("day-switch").hidden = false;
    $("detail-when").hidden = true;
    $("back").hidden = true;
    $("day-date").textContent = longDate(dateForIndex(index));
    $("day-count").textContent = EN
      ? `Day ${index + 1}${index === todayIndex ? " · Today" : ""}`
      : index === todayIndex
        ? `第${index + 1}日・今日`
        : `第${index + 1}日`;
    $("prev").disabled = index <= 0;
    $("next").disabled = index >= todayIndex;
    $("to-today").hidden = index === todayIndex;
    renderCard(wordForIndex(WORDS, index), direction);
  }

  function renderWordDetail(id) {
    shownDayIndex = null;
    const word = WORDS.find((w) => w.id === id);
    const index = indexInCycle(id);
    const when = longDate(dateForIndex(index));
    $("day-switch").hidden = true;
    $("to-today").hidden = true;
    $("back").hidden = false;
    $("detail-when").hidden = false;
    $("detail-when").textContent = EN
      ? index <= todayIndex
        ? `Word of the day for ${when} (Day ${index + 1})`
        : `Coming up on ${when}`
      : index <= todayIndex
        ? `${when}の言葉（第${index + 1}日）`
        : `${when}に登場予定`;
    renderCard(word, 0);
  }

  // ---- 一覧 ----

  function statusFor(id) {
    if (known[id] === "known") return { text: EN ? "Knew it" : "知ってた", cls: "is-known" };
    if (known[id] === "new") return { text: EN ? "New to me" : "知らなかった", cls: "is-new" };
    return null;
  }

  function makeRow({ href, date, term, gist, status, current, fromList }) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "row";
    a.href = href;
    if (fromList) a.dataset.fromList = "";
    if (current) a.setAttribute("aria-current", "true");

    const main = document.createElement("span");
    main.className = "row-main";
    if (date) {
      const d = document.createElement("span");
      d.className = "row-date";
      d.textContent = date;
      main.append(d);
    }
    const t = document.createElement("span");
    t.className = "row-term jp";
    putTerm(t, term);
    main.append(t);
    if (gist) {
      const g = document.createElement("span");
      g.className = "row-gist jp";
      put(g, gist);
      main.append(g);
    }
    a.append(main);

    if (status) {
      const s = document.createElement("span");
      s.className = `status ${status.cls}`;
      s.textContent = status.text;
      a.append(s);
    }
    li.append(a);
    return li;
  }

  function renderHistory() {
    const list = $("history-list");
    list.replaceChildren();
    let k = 0;
    let u = 0;
    for (let i = todayIndex; i >= 0; i--) {
      const word = wordForIndex(WORDS, i);
      if (!ready(word)) continue;
      if (known[word.id] === "known") k++;
      if (known[word.id] === "new") u++;
      list.append(
        makeRow({
          href: `#day-${i + 1}`,
          date: i === todayIndex ? `${shortDate(dateForIndex(i))}${EN ? " · Today" : "・今日"}` : shortDate(dateForIndex(i)),
          term: word.term,
          status: statusFor(word.id),
          current: i === shownDayIndex,
        })
      );
    }
    const days = todayIndex + 1;
    if (EN) {
      const marked = k + u > 0 ? ` You knew ${k} of them and ${u} were new to you.` : "";
      put($("history-summary"), `You’ve met ${days} word${days === 1 ? "" : "s"} so far.${marked}`);
    } else {
      const marked = k + u > 0 ? `そのうち「知ってた」が${k}語、「知らなかった」が${u}語。` : "";
      setText($("history-summary"), `これまでに${days}語の言葉に出会いました。${marked}`);
    }
  }

  function renderFilter() {
    const wrap = $("filter");
    if (!wrap.childElementCount) {
      for (const genre of [null, ...GENRES]) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "filter-chip";
        b.dataset.genre = genre || "";
        b.textContent = genre ? genreName(genre) : EN ? "All" : "すべて";
        wrap.append(b);
      }
    }
    for (const b of wrap.children) {
      b.setAttribute("aria-pressed", String((b.dataset.genre || null) === genreFilter));
    }
  }

  function renderWords() {
    renderFilter();
    const all = WORDS.filter(ready);
    const words = genreFilter ? all.filter((w) => w.genre === genreFilter) : all;
    if (EN) put($("words-lead"), `All ${all.length} words. Words that haven’t appeared yet show the day they will.`);
    else setText($("words-lead"), `全${WORDS.length}語。まだ登場していない言葉には、登場する日を表示しています。`);
    const list = $("words-list");
    list.replaceChildren();
    for (const word of words) {
      const index = indexInCycle(word.id);
      const status =
        statusFor(word.id) || (index > todayIndex ? { text: shortDate(dateForIndex(index)), cls: "is-date" } : null);
      list.append(
        makeRow({
          href: `#w-${word.id}`,
          term: word.term,
          gist: word.gist,
          status,
          current: word.id === shownWordId,
          fromList: true,
        })
      );
    }
  }

  // ---- 画面の切り替え ----

  function showView(name) {
    const changed = currentView !== name;
    if (changed && currentView) savedScroll[currentView] = window.scrollY;
    for (const v of ["card", "history", "words"]) $(`view-${v}`).hidden = v !== name;
    currentView = name;
    return changed;
  }

  function render() {
    const route = parseRoute();
    const tab = route.view === "history" ? "history" : route.view === "words" || route.view === "word" ? "words" : "today";
    for (const a of document.querySelectorAll(".tab")) {
      if (a.dataset.tab === tab) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }

    let scrollTo = 0;
    if (route.view === "history" || route.view === "words") {
      showView(route.view);
      if (route.view === "history") renderHistory();
      else renderWords();
      scrollTo = savedScroll[route.view] || 0;
    } else {
      const fromOtherView = showView("card");
      if (route.view === "day") {
        openedFromList = false;
        renderDay(route.index, fromOtherView);
      } else {
        renderWordDetail(route.id);
      }
    }
    updateInstallTip(route);
    window.scrollTo(0, scrollTo);
  }

  // ---- 操作 ----

  $("prev").addEventListener("click", () => navigate(`#day-${parseRoute().index}`, true));
  $("next").addEventListener("click", () => navigate(`#day-${parseRoute().index + 2}`, true));
  $("to-today").addEventListener("click", () => navigate("#today", true));
  $("back").addEventListener("click", () => {
    if (openedFromList) history.back();
    else navigate("#words");
  });

  // カードを左右にスワイプして日付を移動
  let touch = null;
  $("card").addEventListener(
    "touchstart",
    (e) => {
      touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    },
    { passive: true }
  );
  $("card").addEventListener(
    "touchend",
    (e) => {
      if (!touch) return;
      const dx = e.changedTouches[0].clientX - touch.x;
      const dy = e.changedTouches[0].clientY - touch.y;
      touch = null;
      const route = parseRoute();
      if (route.view !== "day" || Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0 && route.index < todayIndex) navigate(`#day-${route.index + 2}`, true);
      if (dx > 0 && route.index > 0) navigate(`#day-${route.index}`, true);
    },
    { passive: true }
  );

  for (const btn of document.querySelectorAll(".known-btn")) {
    btn.addEventListener("click", () => {
      const value = btn.dataset.known;
      if (known[shownWordId] === value) delete known[shownWordId];
      else known[shownWordId] = value;
      save(KNOWN_KEY, known);
      renderKnown();
    });
  }

  $("words-list").addEventListener("click", (e) => {
    if (e.target.closest("[data-from-list]")) openedFromList = true;
  });

  $("filter").addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    genreFilter = chip.dataset.genre || null;
    renderWords();
  });

  // いま開いているタブをもう一度押したら先頭へ
  for (const a of document.querySelectorAll(".tab")) {
    a.addEventListener("click", (e) => {
      if (a.getAttribute("aria-current") !== "page" || parseRoute().view === "word") return;
      e.preventDefault();
      if (a.dataset.tab === "today" && parseRoute().index !== todayIndex) navigate("#today", true);
      else window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    });
  }

  window.addEventListener("hashchange", render);
  window.addEventListener("resize", () => requestAnimationFrame(fitTerm));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTerm);

  // 開きっぱなしで日付をまたいだら、今日の言葉に追いつく
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    const next = currentTodayIndex();
    if (next !== todayIndex) {
      todayIndex = next;
      render();
    }
  });

  // ---- ホーム画面への追加 ----

  function updateInstallTip(route) {
    $("install-tip").hidden = standalone || embedded || load(TIP_KEY, false) || route.view !== "day";
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e;
    $("install-btn").hidden = false;
  });
  $("install-btn").addEventListener("click", () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.finally(() => {
      installPrompt = null;
      $("install-btn").hidden = true;
    });
  });
  $("install-close").addEventListener("click", () => {
    save(TIP_KEY, true);
    $("install-tip").hidden = true;
  });

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !embedded) {
    // 英語版も、サイトの一番上にあるサービスワーカーを共有する
    navigator.serviceWorker.register(EN ? "../sw.js" : "sw.js", { scope: EN ? "../" : "./" }).catch(() => {});
  }

  // 言語の切り替えのリンクを押したら、その言語を覚えておく
  for (const a of document.querySelectorAll("[data-lang-switch]")) {
    a.addEventListener("click", () => save(LANG_KEY, a.dataset.langSwitch));
  }

  // 画面に書いてある固定の文章も文節で折り返す（日本語版だけ）
  if (!EN) for (const el of document.querySelectorAll("[data-phrase]")) setText(el, el.textContent.trim());

  render();
})();
