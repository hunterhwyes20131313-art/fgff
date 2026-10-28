(() => {
  "use strict";
  const API = "https://atlas-server-add3.onrender.com";
  const EVERY = 5 * 60 * 1000;
  const $ = id => document.getElementById(id);
  const state = { items: [], busy: false, timer: null };
  const el = { grid:$("itemsGrid"), loading:$("loadingPanel"), error:$("errorPanel"), errorText:$("errorText"), empty:$("emptyPanel"), search:$("searchInput"), sort:$("sortSelect"), count:$("itemCount"), statusDot:$("statusDot"), status:$("statusText"), updated:$("updatedText"), footer:$("footerApiStatus"), toast:$("toast"), image:$("openImage") };

  function toast(msg) {
    el.toast.textContent = msg; el.toast.classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.toast.classList.remove("show"), 2600);
  }
  function status(ok, msg) {
    el.statusDot.style.background = ok ? "#5de5a0" : "#ff7b8b";
    el.status.textContent = msg; el.footer.textContent = ok ? "API connected" : "API connection issue";
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function parse(payload) {
    const entries = payload && payload.shop && payload.shop.entries;
    if (!Array.isArray(entries)) throw new Error("Unexpected API response. Check /api/shop on the Atlas server.");
    const out = [];
    entries.forEach((entry, ei) => (entry.items || []).forEach((item, ii) => {
      const r = item.rarity || {}, t = item.type || {}, images = item.images || {};
      out.push({id:item.id || `${ei}-${ii}`, name:item.name || item.id || "Unknown item",
        image:images.featured || images.icon || images.smallIcon || "",
        rarity:r.displayValue || r.value || "Cosmetic", rarityKey:String(r.value || r.displayValue || "").toLowerCase(),
        type:t.displayValue || t.value || "Item",
        price:Number.isFinite(Number(entry.finalPrice)) ? Number(entry.finalPrice) : null, order:out.length});
    }));
    return out;
  }
  function color(item) {
    const r = item.rarityKey + " " + item.rarity.toLowerCase();
    if (r.includes("legendary")) return "#ff9a43";
    if (r.includes("epic")) return "#b77bff";
    if (r.includes("rare")) return "#49b8ff";
    if (r.includes("uncommon")) return "#70dc86";
    if (r.includes("marvel") || r.includes("icon")) return "#ff5c83";
    return "#8e9ab5";
  }
  function render() {
    const q = el.search.value.trim().toLowerCase();
    let items = state.items.filter(i => `${i.name} ${i.rarity} ${i.type}`.toLowerCase().includes(q));
    if (el.sort.value === "name") items.sort((a,b)=>a.name.localeCompare(b.name));
    if (el.sort.value === "price-high") items.sort((a,b)=>(b.price ?? -1)-(a.price ?? -1));
    if (el.sort.value === "price-low") items.sort((a,b)=>(a.price ?? Number.MAX_SAFE_INTEGER)-(b.price ?? Number.MAX_SAFE_INTEGER));
    el.count.textContent = q ? `${items.length}/${state.items.length}` : state.items.length;
    el.grid.innerHTML = items.map(i => `<article class="item-card"><div class="item-art" style="--rarity:${color(i)}"><span class="item-type">${esc(i.type)}</span>${i.image ? `<img loading="lazy" src="${esc(i.image)}" alt="${esc(i.name)}" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}<div class="rarity-bar"></div></div><div class="item-info"><h3 class="item-name" title="${esc(i.name)}">${esc(i.name)}</h3><div class="item-rarity">${esc(i.rarity)}</div><div class="item-bottom"><span class="item-price">${i.price === null ? "Price N/A" : `<span class="vbucks">V</span>${i.price.toLocaleString("en-US")} V-Bucks`}</span><span class="item-open">ITEM</span></div></div></article>`).join("");
    el.empty.hidden = items.length > 0;
  }
  async function load({quiet=false}={}) {
    if (state.busy) return; state.busy = true;
    if (!state.items.length && !quiet) el.loading.hidden = false;
    el.error.hidden = true;
    try {
      const res = await fetch(`${API}/api/shop`, {cache:"no-store"});
      if (!res.ok) throw new Error(`Shop API returned HTTP ${res.status}.`);
      const payload = await res.json(), items = parse(payload);
      if (!items.length) throw new Error("The API returned no shop items.");
      state.items = items; render(); status(true, "Connected to Atlas API");
      el.updated.textContent = `Updated ${new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`;
      if (!quiet) toast("Shop refreshed successfully");
    } catch (err) {
      status(false, "Couldn't refresh shop");
      el.errorText.textContent = `${err.message} If this is the first visit, the free API may be waking up.`;
      el.error.hidden = false;
    } finally { state.busy = false; el.loading.hidden = true; }
  }
  function imageUrl() { return `${API}/api/shop/image?columns=4&limit=40&t=${Date.now()}`; }
  async function downloadImage() {
    toast("Preparing shop image…");
    try {
      const res = await fetch(imageUrl(), {cache:"no-store"});
      if (!res.ok) throw new Error(`Image endpoint returned HTTP ${res.status}.`);
      const blob = await res.blob(), url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = `atlas-fortnite-shop-${new Date().toISOString().slice(0,10)}.png`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500);
      toast("Shop image downloaded");
    } catch (e) { toast(`Download failed: ${e.message}. Try Open shop image.`); }
  }
  async function share(url, title, text) {
    try {
      if (navigator.share) await navigator.share({title,text,url});
      else { await navigator.clipboard.writeText(url); toast("Link copied to clipboard"); }
    } catch(e) {
      if (e.name !== "AbortError") {
        try { await navigator.clipboard.writeText(url); toast("Link copied to clipboard"); }
        catch { window.open(url, "_blank", "noopener"); }
      }
    }
  }
  $("refreshButton").addEventListener("click",()=>load());
  $("refreshTop").addEventListener("click",()=>load());
  $("retryButton").addEventListener("click",()=>load());
  el.search.addEventListener("input",render);
  el.sort.addEventListener("change",render);
  $("shareButton").addEventListener("click",()=>share(location.href,"Atlas Fortnite Item Shop","Browse the current Fortnite Item Shop on Atlas."));
  $("downloadImage").addEventListener("click",downloadImage);
  $("shareImage").addEventListener("click",()=>share(`${API}/api/shop/image`,"Atlas Fortnite Item Shop","Check out the current Fortnite Item Shop image."));
  el.image.addEventListener("click",()=>{el.image.href=imageUrl();});
  load();
  state.timer = setInterval(()=>load({quiet:true}),EVERY);
  setInterval(()=>{el.image.href=imageUrl();},EVERY);
})();