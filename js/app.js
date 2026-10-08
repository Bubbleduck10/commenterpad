import { BRAND, CONFIG, PAIRS } from "./config.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const usd = (n) => {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toPrecision(3)}`;
};

/* ---------- the name and the trigger, from config ---------- */
document.querySelectorAll("[data-brand]").forEach((el) => (el.textContent = BRAND.name));
document.querySelectorAll("[data-trigger]").forEach((el) => (el.textContent = BRAND.trigger));
document.title = `${BRAND.name} — comment a coin into existence`;
if (BRAND.x) document.querySelectorAll("[data-x]").forEach((el) => ((el.href = BRAND.x), (el.hidden = false), (el.target = "_blank"), (el.rel = "noopener")));

async function copy(text, button, label) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Copy failed";
  }
  setTimeout(() => (button.textContent = label), 1500);
}
$("copy-template").addEventListener("click", (e) => copy(`${BRAND.trigger} $TICKER Name`, e.currentTarget, "Copy the comment"));

/* ---------- the demo: a comment typing under a post, then its coin ---------- */
const EXAMPLES = [
  { plat: "X", who: "@sunsetchaser", text: "golden hour hit different today", scene: "scene-sunset", symbol: "GOLDEN", name: "Golden Hour", pair: "X Coin" },
  { plat: "Instagram", who: "@morningbrew", text: "first sip of the day", scene: "scene-coffee", symbol: "SIP", name: "First Sip", pair: "Instagram Coin" },
  { plat: "X", who: "@goodboyclub", text: "he heard the treat bag", scene: "scene-dog", symbol: "TREAT", name: "Treat Bag", pair: "X Coin" },
];

function setPost(ex) {
  $("demo-who").textContent = ex.who;
  $("demo-where").textContent = `on ${ex.plat}`;
  $("demo-plat").textContent = ex.plat;
  $("demo-plat").className = "plat" + (ex.plat === "Instagram" ? " ig" : "");
  $("demo-img").className = `post-img ${ex.scene}`;
  $("demo-text").textContent = ex.text;
  $("demo-coin-img").className = `launched-img ${ex.scene}`;
  $("demo-coin-name").textContent = `$${ex.symbol} · ${ex.name}`;
  $("demo-coin-pair").textContent = `paired with ${ex.pair} · buyback on`;
}

const commentParts = (ex) => [
  ["t", BRAND.trigger], ["", " "], ["k", `$${ex.symbol}`], ["", ` ${ex.name}`],
];
const render = (parts, n, caret) => {
  let left = n, html = "";
  for (const [cls, text] of parts) {
    const piece = text.slice(0, Math.max(0, left));
    left -= text.length;
    if (piece) html += cls ? `<span class="${cls}">${esc(piece)}</span>` : esc(piece);
  }
  return html + (caret ? '<span class="caret"></span>' : "");
};

async function demo() {
  const typed = $("demo-typed"), coin = $("demo-coin");
  if (reduced) {
    setPost(EXAMPLES[0]);
    const parts = commentParts(EXAMPLES[0]);
    typed.innerHTML = render(parts, Infinity, false);
    coin.classList.add("in");
    return;
  }
  for (let i = 0; ; i = (i + 1) % EXAMPLES.length) {
    const ex = EXAMPLES[i];
    coin.classList.remove("in");
    setPost(ex);
    const parts = commentParts(ex);
    const total = parts.reduce((s, [, t]) => s + t.length, 0);
    typed.innerHTML = render(parts, 0, true);
    await sleep(700);
    for (let n = 1; n <= total; n++) {
      typed.innerHTML = render(parts, n, true);
      await sleep(55 + Math.random() * 45);
    }
    typed.innerHTML = render(parts, total, false);
    await sleep(650);
    coin.classList.add("in");
    await sleep(3200);
  }
}
demo();

/* ---------- the pairs, priced live ---------- */
async function pairs() {
  const grid = $("pair-grid");
  grid.innerHTML = PAIRS.map((p) => `
    <article class="pair ${p.id}">
      <div class="pair-top">
        <div><div class="pair-name">${esc(p.coin)}</div><div class="pair-sub">$${esc(p.ticker)} · pairs every ${esc(p.platform)} launch</div></div>
        <span class="pill${p.live ? "" : " soon"}">${p.live ? "Live" : "Coming soon"}</span>
      </div>
      <div class="pair-nums"><div><span>Price</span><b data-price="${p.mint}">…</b></div><div><span>Market cap</span><b data-mcap="${p.mint}">…</b></div></div>
      <div class="ca"><code>${esc(p.mint)}</code><button type="button" data-copy="${esc(p.mint)}">Copy</button></div>
      <a class="out" href="${esc(CONFIG.pumpUrl(p.mint))}" target="_blank" rel="noopener">Trade on pump.fun →</a>
    </article>`).join("");
  grid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]");
    if (b) copy(b.dataset.copy, b, "Copy");
  });
  try {
    const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${PAIRS.map((p) => p.mint).join(",")}`);
    const { pairs: list = [] } = await r.json();
    for (const p of PAIRS) {
      const best = list.filter((x) => x.baseToken?.address === p.mint).sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
      document.querySelector(`[data-price="${p.mint}"]`).textContent = best ? usd(Number(best.priceUsd)) : "—";
      document.querySelector(`[data-mcap="${p.mint}"]`).textContent = best ? usd(best.marketCap ?? best.fdv) : "—";
    }
  } catch {
    document.querySelectorAll("[data-price],[data-mcap]").forEach((el) => (el.textContent = "—"));
  }
}
pairs();

/* ---------- launched coins: from the service, or examples until it exists ---------- */
const EXAMPLE_COINS = [
  { symbol: "GOLDEN", name: "Golden Hour", platform: "x", author: "@you", scene: "scene-sunset", burned: "1.2M", age: "2m" },
  { symbol: "SIP", name: "First Sip", platform: "instagram", author: "@coffeefan", scene: "scene-coffee", burned: "480K", age: "9m" },
  { symbol: "TREAT", name: "Treat Bag", platform: "x", author: "@dogperson", scene: "scene-dog", burned: "2.9M", age: "21m" },
];
const platName = (id) => PAIRS.find((p) => p.id === id)?.platform ?? id;

function coinCard(c, example) {
  const img = example ? `class="coin-img ${c.scene}"` : `class="coin-img" style="background-image:url('${esc(c.image)}')"`;
  return `
    <${example ? "div" : "a"} class="coin"${example ? "" : ` href="${esc(CONFIG.pumpUrl(c.mint))}" target="_blank" rel="noopener"`}>
      <div ${img}><span class="plat${c.platform === "instagram" ? " ig" : ""}">${esc(platName(c.platform))}</span>${example ? '<span class="example">Example</span>' : ""}</div>
      <div class="coin-body">
        <div class="coin-name"><b>$${esc(c.symbol)}</b><span>${esc(c.name)}</span></div>
        <p class="coin-from">From ${esc(c.author)}: <code class="say sm"><span class="t">${esc(BRAND.trigger)}</span> <span class="k">$${esc(c.symbol)}</span> ${esc(c.name)}</code></p>
        <div class="coin-foot"><span class="burn">${esc(c.burned)} burned</span><span>${esc(c.age)} ago</span></div>
      </div>
    </${example ? "div" : "a"}>`;
}

async function coins() {
  let list = null, stats = null;
  if (CONFIG.api) {
    try {
      [list, stats] = await Promise.all([fetch(`${CONFIG.api}/api/coins`).then((r) => r.json()), fetch(`${CONFIG.api}/api/stats`).then((r) => r.json())]);
    } catch { list = null; }
  }
  const live = Array.isArray(list);
  $("stats").innerHTML = [
    ["Coins launched", live ? (stats?.launched ?? list.length).toLocaleString() : "0"],
    ["Comments seen", live ? (stats?.comments ?? 0).toLocaleString() : "0"],
    ["Bought back and burned", live ? usd(stats?.burnedUsd ?? 0) : "$0"],
  ].map(([k, v], i) => `<div class="stat${i === 2 ? " burn" : ""}"><span>${k}</span><b>${v}</b></div>`).join("");
  if (live && list.length) {
    $("coin-grid").innerHTML = list.map((c) => coinCard(c, false)).join("");
  } else if (live) {
    $("coin-grid").innerHTML = "";
    $("coin-grid").insertAdjacentHTML("afterend", `<p class="empty">No coins yet. Be the first: comment <code class="say sm"><span class="t">${esc(BRAND.trigger)}</span> <span class="k">$TICKER</span> Name</code> under any post.</p>`);
  } else {
    $("coins-sub").textContent = "Launches start soon. Until then, these are examples of what appears here.";
    $("coin-grid").innerHTML = EXAMPLE_COINS.map((c) => coinCard(c, true)).join("");
  }
}
coins();

$("takedown").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Takedown requests open when the service launches.");
});
