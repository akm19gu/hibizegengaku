// Know-It-All Daily（英語版）の本文。キーは data/words.js の id で、出題順と日付は日本語版と同じ。
// 出題順の先頭から順に埋めていく（途中を飛ばさない）。term 以外の項目の意味は日本語版と同じ。
(function (root) {
  const WORDS = {
    "baader-meinhof": {
      term: "Baader–Meinhof phenomenon",
      gist: "The moment you learn a new word or idea, you suddenly start seeing it everywhere. Also called the frequency illusion.",
      story: "In 1994 a reader wrote to a newspaper in St. Paul, Minnesota: he had heard the name of the West German militant group Baader–Meinhof for the first time, and then spotted it again within a day. Other readers wrote in with the same experience, and the name stuck. Nothing had actually become more common. Your attention had simply switched on, and confirmation bias did the rest. The linguist Arnold Zwicky later gave it the drier name “frequency illusion.”",
      lens: "If you bump into today’s word somewhere tomorrow, this is probably why. The world did not become more pedantic overnight. Your eyes did.",
      flex: "I learned this word yesterday and it’s already shown up twice in the news. Classic Baader–Meinhof.",
    },
    "defenestration": {
      term: "Defenestration",
      gist: "The act of throwing someone out of a window. Yes, there is a word just for that.",
      story: "From Latin de (out of) and fenestra (window). Prague made it famous: in 1419 and again in 1618, political and religious quarrels ended with officials being thrown from windows. The 1618 incident helped spark the Thirty Years’ War. All three men thrown from the castle that year survived, and one popular story says a pile of manure broke their fall.",
      lens: "Today the word is also used for pushing someone out of a job or a seat of power. It is a reminder that big turning points in history sometimes start with something surprisingly physical.",
      flex: "One comment in that meeting and he was off the project. A textbook corporate defenestration.",
    },
    "goodharts-law": {
      term: "Goodhart’s law",
      gist: "When a measure becomes a target, it stops being a good measure.",
      story: "In 1975 the British economist Charles Goodhart observed that any statistical regularity tends to collapse once pressure is placed on it for control purposes. He was talking about monetary policy. The punchy version most people quote was later phrased by the anthropologist Marilyn Strathern.",
      lens: "Reward salespeople for the number of contracts and you get a flood of tiny contracts. Reward researchers for the number of papers and you get papers sliced as thin as salami. Once you know the law, you start spotting it in every scoreboard.",
      flex: "People are shaking their phones to earn points in that step-counting app. Goodhart’s law in action.",
    },
    "diderot-effect": {
      term: "Diderot effect",
      gist: "Getting one new thing makes everything around it look shabby, so you end up replacing the lot.",
      story: "It comes from an essay by the 18th-century French philosopher Denis Diderot, “Regrets on Parting with My Old Dressing Gown.” After a friend gave him a splendid scarlet robe, his old chair, wall hangings and desk no longer matched, so he replaced them one by one. In the end he lost his cozy study and a good deal of money. The anthropologist Grant McCracken named the effect in 1988.",
      lens: "It shows that we rarely buy single objects. We buy sets that have to match. A new phone that needs a new case, earbuds and charger, or a move that replaces all the furniture at once, follows the same pattern.",
      flex: "I bought a new desk and now my chair and monitor look tragic. I’m deep in the Diderot effect.",
    },
    "chestertons-fence": {
      term: "Chesterton’s fence",
      gist: "Don’t tear down a fence until you know why it was put up.",
      story: "The English writer G. K. Chesterton offered this parable in his 1929 book The Thing. A reformer sees a fence across a road and says, “I don’t see the use of this; let us clear it away.” A wiser reformer replies that if you don’t see the use of it, you certainly may not clear it away. Go and find out why it was built, and then we can talk.",
      lens: "It is a good habit when you meet an odd rule at work or a mysterious line in old code: check the history before you delete it. The principle also implies that, once you know the reason and it no longer applies, the fence can go.",
      flex: "Before we delete that weird setting, let’s find out who added it and why. Chesterton’s fence.",
    },
    "memoire-involontaire": {
      term: "Involuntary memory",
      original: "mémoire involontaire",
      gist: "A memory that floods back on its own, triggered by a smell or a taste, without any effort to recall it.",
      story: "The most famous example is in Marcel Proust’s novel In Search of Lost Time. The narrator dips a madeleine into a cup of tea, takes a bite, and his childhood days in the town of Combray come rushing back. Proust believed that these unbidden memories hold the essence of the past far better than anything we deliberately try to remember.",
      lens: "The power of smell to summon memories is sometimes called the Proust effect. It names that moment when a whiff of a certain laundry detergent suddenly hands you back a whole summer.",
      flex: "One smell of that incense and I was back at my grandma’s house. So that’s Proust’s involuntary memory.",
    },
    "lazarus-taxon": {
      term: "Lazarus taxon",
      gist: "A living thing that was thought to be extinct, then turns up alive after a long gap in the record.",
      story: "It is named after Lazarus, whom Jesus raised from the dead in the New Testament. The classic example is the coelacanth. The fish was known only from fossils more than 66 million years old until 1938, when a museum curator in South Africa, Marjorie Courtenay-Latimer, spotted a strange blue fish in a fishing boat’s catch.",
      lens: "There is also the Elvis taxon: a different creature that later evolves to look just like an extinct one, named after Elvis impersonators. The two terms make a fine pair.",
      flex: "I found a fountain pen I lost ten years ago at the back of a drawer. A full Lazarus taxon moment.",
    },
    "desire-path": {
      term: "Desire path",
      gist: "A path worn into a lawn by people taking the shortcut the planners didn’t give them.",
      story: "It is also called a desire line. Even when a perfectly good paved path exists, people cut diagonally across the grass toward where they actually want to go, and eventually a trail appears. Urban planners treat these trails as evidence of how people really want to move.",
      lens: "Several universities tell the story that they waited before paving anything, let students walk for a while, and then paved the worn trails. The idea applies well beyond lawns: wherever people quietly ignore the official process, there is a desire path telling you something.",
      flex: "Everyone ignores the manual and takes the same shortcut. That’s the desire path of our workflow.",
    },
    "nocebo-effect": {
      term: "Nocebo effect",
      gist: "When simply expecting side effects makes you actually feel them. The evil twin of the placebo effect.",
      story: "Placebo is Latin for “I shall please.” Nocebo means “I shall harm.” The physician Walter Kennedy used the term in a 1961 paper. In drug trials, people taking a sugar pill often report the very side effects that were described to them.",
      lens: "If you read a leaflet’s list of side effects and then start to feel a little off, this is the mechanism at work. Knowing about it helps separate worry from symptoms, and it shows how much the way doctors explain things can matter.",
      flex: "I read the list of side effects and immediately got a headache. Pretty sure that’s the nocebo effect.",
    },
    "pentimento": {
      term: "Pentimento",
      gist: "A trace of an earlier drawing or shape showing through a painting, where the artist changed their mind.",
      story: "From the Italian pentirsi, to repent or to think better of something. Oil paint becomes more transparent with age, so an earlier composition that was painted over can slowly reappear. X-ray and infrared scans often reveal hidden figures or whole different layouts beneath famous paintings.",
      lens: "It also works as a metaphor for older layers showing through anything finished: a street, a building, a person’s character.",
      flex: "You can still see the old shop’s name under the new sign. That street has a pentimento.",
    },
    "acedia": {
      term: "Acedia",
      gist: "A spiritual listlessness. An old monastic word for the state where nothing seems worth the effort and the soul quietly dries out.",
      story: "In the 4th century, the monk Evagrius Ponticus listed acedia among eight evil thoughts that trouble a monk’s life, and called it the noonday demon. In the early afternoon, he wrote, time seems to stand still, the monk keeps staring out of the window, and his whole calling begins to feel pointless. The idea was later folded into sloth, one of the seven deadly sins.",
      lens: "It is not plain laziness. It is closer to the emptiness of having lost the point. When you find yourself staring out of the window at three in the afternoon, it helps a little to know that monks were fighting the same demon 1,600 years ago.",
      flex: "This afternoon slump isn’t just tiredness. It’s acedia. The noonday demon has arrived.",
    },
    "gerrymander": {
      term: "Gerrymander",
      gist: "To draw electoral district boundaries into strange shapes so that one party or candidate wins.",
      story: "In 1812, under Massachusetts governor Elbridge Gerry, the state redrew its districts to favor his party. One district looked like a salamander, and a newspaper mocked it by blending the governor’s name with the creature’s.",
      lens: "Even when every vote is counted fairly, the result can be decided by where the lines are drawn. Fun fact: Gerry pronounced his name with a hard G, as in “Gary,” but most people now say “jerrymander.”",
      flex: "Somehow every team split ends up favoring the boss. That’s an office gerrymander.",
    },
    "bezzle": {
      term: "Bezzle",
      gist: "The wealth that exists only between the moment of a fraud and its discovery, when the victim and the thief both feel richer.",
      story: "The economist John Kenneth Galbraith coined it in his book The Great Crash, 1929, from the word embezzlement. Until a theft is discovered, nobody has lost anything on paper, so everyone feels prosperous. Galbraith argued that the bezzle swells in good times and shrinks fast in bad times, when people start checking the books.",
      lens: "It helps explain why frauds and reckless investments come to light one after another when the economy turns. It is a wry word for being a little suspicious of a boom.",
      flex: "All those great numbers at that company turned out to be fake. That’s the bezzle deflating.",
    },
    "benfords-law": {
      term: "Benford’s law",
      gist: "In many real-world sets of numbers, about 30 percent start with the digit 1, and fewer than 5 percent start with 9.",
      story: "In 1881 the astronomer Simon Newcomb noticed that in library books of logarithm tables, the pages for numbers starting with 1 were far more worn than the rest. In 1938 the physicist Frank Benford checked the pattern against more than 20,000 values, from river basins to populations to physical constants, and the law took his name.",
      lens: "Numbers that people invent to look plausible rarely follow this pattern, so it is sometimes used to spot accounting fraud. It is hard not to try it on your own bank statement.",
      flex: "Hardly any of these sales figures start with a 1. By Benford’s law, that looks a bit fishy.",
    },
    "streisand-effect": {
      term: "Streisand effect",
      gist: "Trying to hide or remove a piece of information only makes it spread further.",
      story: "In 2003 Barbra Streisand sued a photographer whose online archive of the California coastline included a photo of her house. Before the lawsuit, the image had been downloaded six times, two of them by her own lawyers. Once the lawsuit made the news, it was viewed more than 400,000 times in the following month. The tech blogger Mike Masnick gave the effect its name.",
      lens: "When an attempt to put out an online fire only makes it bigger, this effect is usually at work. It is a useful word for weighing which is more conspicuous: staying quiet or demanding a takedown.",
      flex: "The more you demand that post be deleted, the more it spreads. You’re about to become a Streisand effect case study.",
    },
  };

  const api = { WORDS };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.HibiWordsEn = api;
})(typeof self !== "undefined" ? self : this);
